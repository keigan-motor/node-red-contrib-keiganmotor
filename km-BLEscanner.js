let KMConnector=require('kmconnector');

////////
module.exports = function(RED) {
    //スキャンの開始
    function startScan(time){
        let tm=parseInt(time,10);
        tm=isNaN(tm)?2000:tm;
        KMConnector.KMMotorOneBLE.startScanToCreateInstance(tm,false);
    }
    let nowScaningNodeId=null;//スキャナーNodeが複数ある場合、他のスキャナーNodeをトリガーしない為のフラグ
    /*-------------------------------
        node red node constructor
    -------------------------------*/

    function kmBLEscanner(config) {
        RED.nodes.createNode(this,config);//instance init
        let node = this;
        let discoverName=[];
        this._discoverMotorLis=function(kMMotorOneBLE){
            if(nowScaningNodeId!==node.id){
                return;
            }
            let fullname=kMMotorOneBLE.deviceInfo.name;
            let name=  fullname&&typeof fullname ==="string"? fullname.split('#')[0]:null;
            let ledColor=  fullname&&typeof fullname ==="string"? fullname.split('#')[1]:null;
            //console.log("MotorName: "+name);
            discoverName.push(name);
            node.status({fill:"blue",shape:"dot",text:"During scanning..Discover:"+discoverName.join(":")});
            node.send([{topic:"discoverMotor",payload:name,motorFullname:fullname,motorLedColor: ledColor,isConnect:kMMotorOneBLE.deviceInfo.isConnect}]);
        };
        this._scanTimeoutLis=function(){
            if(nowScaningNodeId!==node.id){
                return;
            }
            nowScaningNodeId=null;
            //console.log('onScanTimeout');
            let motors=KMConnector.KMMotorOneBLE.motors;
            let motorNemes=Object.keys(motors);
            let deviceInfos={};
            Object.keys(motors).forEach(function(k){
                deviceInfos[k]=motors[k].deviceInfo;
            });
            node.status({fill:"green",shape:"ring",text:"Discover:"+motorNemes.join(":")});
            node.send([null,{topic:"scanTimeout", payload: motorNemes,deviceInfos:deviceInfos}]);
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


        this.on('input', function(msg){
            if(KMConnector.KMMotorOneBLE.bleState!=="poweredOn"){
                node.error("BLE adapter is disable");
                return;
            }
            if(nowScaningNodeId&&nowScaningNodeId!==node.id){
                node.error("The scanner is in use on another node \""+nowScaningNodeId+"\"");
                node.status({fill:"red",shape:"dot",text:"The scanner is in use on another node"});
                return;
            }
            nowScaningNodeId=node.id;
            discoverName.splice(0, discoverName.length);
            startScan(msg.payload);
            node.status({fill:"blue",shape:"dot",text:"During scanning.."});
        });

        this.on('close', function() {
            nowScaningNodeId=null;
            KMConnector.KMMotorOneBLE.removeListener(KMConnector.KMMotorOneBLE.EVENT_TYPE.discoverMotor,this._discoverMotorLis);
            KMConnector.KMMotorOneBLE.removeListener(KMConnector.KMMotorOneBLE.EVENT_TYPE.scanTimeout,this._scanTimeoutLis);
        });
        //default status
        let _mn=Object.keys(KMConnector.KMMotorOneBLE.motors);
        if(_mn.length){
            node.status({fill:"green",shape:"ring",text:"Discover:["+_mn.join("][")+"]"});
        }else {
            node.status({});
        }

    }
    RED.nodes.registerType("km-BLEscan",kmBLEscanner);

};
