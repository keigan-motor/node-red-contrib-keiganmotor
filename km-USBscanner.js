const KMConnector=require('kmconnector/KMConnectorUSB');
const KMMotorOneUSBSerial=KMConnector.KMMotorOneUSBSerial;
////////
module.exports = function(RED) {
    /*-------------------------------
        node red node constructor
    -------------------------------*/

    function kmUSBscanner(config) {
        RED.nodes.createNode(this,config);//instance init
        let node = this;
        node.discoverName=[];

        this._discoverMotorLis=function(kMMotorOneUSB){

            let fullname=kMMotorOneUSB.deviceInfo.name;
            let name=  fullname&&typeof fullname ==="string"? fullname.split('#')[0]:null;
            let ledColor=  fullname&&typeof fullname ==="string"? fullname.split('#')[1]:null;
            //console.log("MotorName: "+name);
            node.discoverName.push(name);
            node.status({fill:"blue",shape:"dot",text:"["+node.discoverName.join("] [")+"]"});
            node.send([{type:"discoverMotor",payload:name,motorFullname:fullname,motorLedColor: ledColor,isConnect:kMMotorOneUSB.deviceInfo.isConnect}]);
        };

        KMMotorOneUSBSerial.on(KMMotorOneUSBSerial.EVENT_TYPE.discoverMotor,this._discoverMotorLis);

        /**
         * 引数 msg.payload
         * ○通常スキャン(既存)
         */
        this.on('input', function(msg){
            //スキャン開始
            node.discoverName=[];
            KMMotorOneUSBSerial.startScanToCreateInstance().then((motorsByUUID) => {
                let motors=KMMotorOneUSBSerial.motors;
                let motorNemes=Object.keys(motors);
                let deviceInfos={};
                Object.keys(motors).forEach(function(k){
                    deviceInfos[k]=motors[k].deviceInfo;
                });
                node.status({fill:"green",shape:"ring",text:"Discover:["+motorNemes.join("] [")+"]"});
                node.send([{type:"scanTimeout", payload: motorNemes,deviceInfos:deviceInfos}]);
            }).catch((err) => {
                console.log(err);
            });
            node.status({fill:"blue",shape:"dot",text:"During scanning.."});
        });

        this.on('close', function() {
            KMMotorOneUSBSerial.removeListener(KMMotorOneUSBSerial.EVENT_TYPE.discoverMotor,this._discoverMotorLis);
        });
        //default status
        let _mn=Object.keys(KMMotorOneUSBSerial.motors);
        if(_mn.length){
            node.status({fill:"green",shape:"ring",text:"Discover:["+_mn.join("] [")+"]"});
        }else {
            node.status({});
        }
    }
    RED.nodes.registerType("km-USBscan",kmUSBscanner);

};
