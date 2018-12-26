let KMConnector=require('kmconnector/KMConnectorBLE');
////////
module.exports = function(RED) {
    let nowScaningNodeId=null;//スキャナーNodeが複数ある場合、他のスキャナーNodeをトリガーしない為のフラグ
    let nowScaningRemainingTime=0;
    let nowScaningCounterInterval=0;

    //スキャンの開始
    function startScan(time,countCB=function(){}){
        let tm=parseInt(time,10);
        tm=isNaN(tm)?20:tm;
        clearInterval(nowScaningCounterInterval);
        nowScaningRemainingTime=tm;
        nowScaningCounterInterval=setInterval(function(){
            --nowScaningRemainingTime;
            countCB(nowScaningRemainingTime);
            if(nowScaningRemainingTime<=0){clearInterval(nowScaningCounterInterval);}
        },1000);
        KMConnector.KMMotorOneBLE.startScanToCreateInstance(tm*1000,false);
    }


    /*-------------------------------
        node red node constructor
    -------------------------------*/

    function kmBLEscanner(config) {
        RED.nodes.createNode(this,config);//instance init
        let node = this;
        node.discoverName=[];
        node.search_cnt=0;//n個発見でスキャン停止 0は無制限

        this._statusUpdateDuringScanning=function(time){
            node.status({fill:"blue",shape:"dot",text:"["+time+"] Scanning > ["+node.discoverName.join("] [")+"]"});
        };
        this._discoverMotorLis=function(kMMotorOneBLE){
            if(nowScaningNodeId!==node.id){
                return;
            }
            let fullname=kMMotorOneBLE.deviceInfo.name;
            let name=  fullname&&typeof fullname ==="string"? fullname.split('#')[0]:null;
            let ledColor=  fullname&&typeof fullname ==="string"? fullname.split('#')[1]:null;
            //console.log("MotorName: "+name);
            node.discoverName.push(name);
            node._statusUpdateDuringScanning(nowScaningRemainingTime);
            node.send([{type:"discoverMotor",payload:name,motorFullname:fullname,motorLedColor: ledColor,isConnect:kMMotorOneBLE.deviceInfo.isConnect}]);
            //n個発見で停止
            if(node.search_cnt&&node.search_cnt>=node.discoverName.length){
                KMConnector.KMMotorOneBLE.stopScan();//info::stopScan停止時はKMMotorOneBLE.EVENT_TYPE.scanTimeout (_scanTimeoutLis)は発火しない
                node._scanTimeoutLis();
            }
        };

        this._scanTimeoutLis=function(){
            if(nowScaningNodeId!==node.id){
                return;
            }
            clearInterval(nowScaningCounterInterval);
            nowScaningNodeId=null;
            //console.log('onScanTimeout');
            let motors=KMConnector.KMMotorOneBLE.motors;
            let motorNemes=Object.keys(motors);
            let deviceInfos={};
            Object.keys(motors).forEach(function(k){
                deviceInfos[k]=motors[k].deviceInfo;
            });
            node.status({fill:"green",shape:"ring",text:"Discover:["+motorNemes.join("] [")+"]"});
            node.send([{type:"scanTimeout", payload: motorNemes,deviceInfos:deviceInfos}]);
        };

        //
        KMConnector.KMMotorOneBLE.on(KMConnector.KMMotorOneBLE.EVENT_TYPE.discoverMotor,this._discoverMotorLis);
        KMConnector.KMMotorOneBLE.on(KMConnector.KMMotorOneBLE.EVENT_TYPE.scanTimeout,this._scanTimeoutLis);
        KMConnector.KMMotorOneBLE.once(KMConnector.KMMotorOneBLE.EVENT_TYPE.adapterStateChange,function(type){
            if(type==="poweredOn"){
                node.status({});
            }else{
                node.status({fill:"gray",shape:"ring",text:"BLE Disable"});
            }
        });

        /**
         * 引数 msg.payload
         * ○通常スキャン(既存)  int:スキャン時間ms　
         * ○スキャン停止 int:0 又は""
         * ○n個発見で停止 string:スキャン時間ms,発見する個数
         */
        this.on('input', function(msg){
            if(KMConnector.KMMotorOneBLE.bleState!=="poweredOn"){
                node.error("BLE adapter is disable");
                return;
            }
            //他のスキャンノードで使用中は動作しない
            if(nowScaningNodeId&&nowScaningNodeId!==node.id){
                node.error("The scanner is in use on another node \""+nowScaningNodeId+"\"");
                node.status({fill:"red",shape:"dot",text:"The scanner is in use on another node"});
                return;
            }
            //引数取得と処置開始
            let time=0;
            node.search_cnt=0;
            switch (typeof msg.payload){
                case "number":
                    time=msg.payload;
                    break;
                case "string":
                    let args=msg.payload.split(",");
                    time=isNaN(parseInt(args[0],10))?0:parseInt(args[0],10);
                    node.search_cnt=isNaN(parseInt(args[1],10))?0:parseInt(args[1],10);
                    break;
            }
            if(time){
                //スキャン開始
                nowScaningNodeId=node.id;
                node.discoverName=[];
                startScan(time<20?20:time,node._statusUpdateDuringScanning.bind(this));
                node.status({fill:"blue",shape:"dot",text:"During scanning.."});
            }else{
                //スキャン停止コマンド
                KMConnector.KMMotorOneBLE.stopScan();//info::stopScan停止時はKMMotorOneBLE.EVENT_TYPE.scanTimeout (_scanTimeoutLis)は発火しない
                node._scanTimeoutLis();
            }
        });

        this.on('close', function() {
            nowScaningNodeId=null;
            KMConnector.KMMotorOneBLE.removeListener(KMConnector.KMMotorOneBLE.EVENT_TYPE.discoverMotor,this._discoverMotorLis);
            KMConnector.KMMotorOneBLE.removeListener(KMConnector.KMMotorOneBLE.EVENT_TYPE.scanTimeout,this._scanTimeoutLis);
        });
        //default status
        let _mn=Object.keys(KMConnector.KMMotorOneBLE.motors);
        if(_mn.length){
            node.status({fill:"green",shape:"ring",text:"Discover:["+_mn.join("] [")+"]"});
        }else {
            node.status({});
        }

    }
    RED.nodes.registerType("km-BLEscan",kmBLEscanner);

};
