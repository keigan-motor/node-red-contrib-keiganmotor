let KMConnector=require('kmconnector');

/////
module.exports = function(RED) {
    /*-------------------------------
        node red node instance constructor
    -------------------------------*/
    function kmMotor(config) {
        RED.nodes.createNode(this,config);//instance init
        ////instance///////////////////
        let node = this;
        let targetMotor;
        let allowConnectMotor=typeof config.allowConnectMotor==="string"?motorNameExcludingColor(config.allowConnectMotor.replace(/\*/g,'')):"";

        node.previousMotor=null;//前回接続モーター名
        /*--------------------------
        // モーター用イベントリスナー
        --------------------------*/
        //出力1 接続・再接続に成功した
        node._connectLis=function(kMDeviceInfo){
            console.log("_connectLis:"+kMDeviceInfo.name);
            if(kMDeviceInfo.isConnect){
                node.previousMotor=motorNameExcludingColor(kMDeviceInfo.name);
                node.send({"type":"status","payload":"connect",name:kMDeviceInfo.name});
                node.status({fill:"green",shape:"dot",text:"connect:"+node.previousMotor});
            }
        };
        //出力1 応答が無くなった・切断された
        node._disconnectLis=function(kMDeviceInfo){
            console.log("_disconnectLis:"+kMDeviceInfo.name);
            node.send({"type":"status","payload":"disconnect",name:kMDeviceInfo.name});
            node.status({fill:"gray",shape:"ring",text:"disconnect:"+motorNameExcludingColor(kMDeviceInfo.name)});
        };
        //出力1 接続に失敗
        node._connectFailureLis=function(kMDeviceInfo,err){
            node.send({"type":"status","payload":"connectFailure",name:kMDeviceInfo.name,err:err});
            node.status({fill:"red",shape:"ring",text:"connectFailure:"+motorNameExcludingColor(kMDeviceInfo.name)});
        };
        //出力1 初期化完了して利用できるようになった
        node._initLis=function(kMDeviceInfo){
           // node.send({"type":"status","payload":"init",name:kMDeviceInfo.name});//物理デバイス毎でのイベント。使用しない
            node.status({fill:"blue",shape:"ring",text:"init:"+motorNameExcludingColor(kMDeviceInfo.name)});
        };

        //出力2 モーターの回転情報
        node._motorMeasurementLis=function(kMRotState){
            node.send([null,{"type":"motorMeasurement","name":this.deviceInfo.name,"payload":kMRotState.GetValObj()}]);
        };
        //出力3 モーターIMU情報受信
        node._imuMeasurementLis=function(kMImuState){
            //info::ジャイロ有効化（kMMotorOneBLE.cmdEnableIMU()）時のみ出力される
            node.send([null,null,{"type":"imuMeasurement","name":this.deviceInfo.name,"payload":kMImuState.GetValObj()}]);
        };


        /**
         * イベントの削除
         * @param kMMotorOneBLE
         * @private
         */
        node._motorEveDelete=function(kMMotorOneBLE){
            if(!kMMotorOneBLE){return;}
            kMMotorOneBLE.removeListener(kMMotorOneBLE.EVENT_TYPE.connect,node._connectLis);
            kMMotorOneBLE.removeListener(kMMotorOneBLE.EVENT_TYPE.disconnect,node._disconnectLis);
            kMMotorOneBLE.removeListener(kMMotorOneBLE.EVENT_TYPE.connectFailure,node._connectFailureLis);
            kMMotorOneBLE.removeListener(kMMotorOneBLE.EVENT_TYPE.motorMeasurement,node._motorMeasurementLis);
            kMMotorOneBLE.removeListener(kMMotorOneBLE.EVENT_TYPE.imuMeasurement,node._imuMeasurementLis);
            kMMotorOneBLE.removeListener(kMMotorOneBLE.EVENT_TYPE.init,node._initLis);
        };
        /**
         * イベントの初期化
         * @param kMMotorOneBLE
         * @private
         */
        node._motorEveInit=function(kMMotorOneBLE){
            if(!kMMotorOneBLE){return;}
            node._motorEveDelete(kMMotorOneBLE);
            kMMotorOneBLE.on(kMMotorOneBLE.EVENT_TYPE.connect,node._connectLis);
            kMMotorOneBLE.on(kMMotorOneBLE.EVENT_TYPE.disconnect,node._disconnectLis);
            kMMotorOneBLE.on(kMMotorOneBLE.EVENT_TYPE.connectFailure,node._connectFailureLis);
            kMMotorOneBLE.on(kMMotorOneBLE.EVENT_TYPE.motorMeasurement,node._motorMeasurementLis);
            kMMotorOneBLE.on(kMMotorOneBLE.EVENT_TYPE.imuMeasurement,node._imuMeasurementLis);
            kMMotorOneBLE.on(kMMotorOneBLE.EVENT_TYPE.init,node._initLis);
        };
        /**
         * モーターの切断
         * @private
         */
        node._motorDisConnect=function(){
            if(!targetMotor){return;}
            node._motorEveDelete(targetMotor);
            targetMotor.disConnect();
            node._disconnectLis(targetMotor.deviceInfo);
            targetMotor=null;
        };

        /**
         * モーターの接続
         * @param names
         * @returns {*}
         * @private
         */
        node._motorConnect=function(names=Array){
            //引数無し[]は既存のモーターの再接続
            if(names.length===1&&!names[0]){
                names[0]=node.previousMotor?node.previousMotor:null;
            }
            let name;
            //
            // ○接続モータの選別
            // 許可リスト設定時:与えられたモーター名のリスト内に許可されたモーターがあれば接続する
            // 許可リスト未設定:リストの最初のモーターに接続する
            //
            for(let i=0;i<names.length;i++){
                if(allowConnectMotor){
                    if(allowConnectMotor===names[i]){
                        name=names[i];
                        break;
                    }
                }else{
                    if(names[i]){
                        name=names[i];
                    }
                    break;
                }
            }
            if(!name){
                return;
            }


            if(targetMotor&&targetMotor.deviceInfo.isConnect){
                //古いモーターが接続中なら処理しない
                node.error("There are already connected motor. \""+targetMotor.deviceInfo.name+"\"");
                return ;
            }

            let newmt=getMotor(name);
            if(!newmt){
                node.error("Motor not found. \""+name+"\"");
                return ;
            }
            //モーターを入れかえての接続
            if(targetMotor!==newmt){
                node._motorSwap(newmt);
            }else{
                node._motorEveInit(targetMotor);
            }

            if(!targetMotor.deviceInfo.isConnect){
                targetMotor.connect();
            }
        };

        /**
         * モーターの入れ替え
         * @param kMMotorOneBLE
         * @private
         */
        node._motorSwap=function(kMMotorOneBLE){
            console.log("node._motorSwap","try _motorDisConnect ");
            node._motorDisConnect();//古いモータの切断

            node._motorEveInit(kMMotorOneBLE);
            targetMotor=kMMotorOneBLE;

            //入れ替えたtargetMotorの状態表示更新
            if(kMMotorOneBLE&&kMMotorOneBLE.deviceInfo.isConnect){
                node.send({"type":"status","payload":"connect",name:kMMotorOneBLE.deviceInfo.name});
                node.status({fill:"green",shape:"dot",text:"connect:"+kMMotorOneBLE.deviceInfo.name});
            }else{
                node.send({"type":"status","payload":"disconnect",name:kMMotorOneBLE.deviceInfo.name});
                node.status({fill:"gray",shape:"ring",text:"disconnect:"+kMMotorOneBLE.deviceInfo.name});
            }
        };

        /*--------------------------
        // 初期化
        --------------------------*/
        node.on('input', function(msg) {
            if(typeof msg !=="object"){return msg;}
            switch(msg.type){
                //case "discoverMotor":
                case "scanTimeout":
                    let names=msg.payload instanceof Array?msg.payload:[msg.payload];
                    node._motorConnect(names);
                    break;
                default:
                    if(!msg.payload){return msg;}
                    let data=msg.payload instanceof Array?msg.payload:[msg.payload];
                    for(let i=0;i<data.length;i++){
                        let pd=data[i];
                        switch(pd.cmd){
                            case "connect":
                                node._motorConnect(pd.arg instanceof Array?pd.arg:[pd.arg]);
                                break;
                            case "disConnect":
                                node._motorDisConnect();
                                break;
                            default:
                                //コマンドの実行　todo::全ての関数が実行出来る為、cmdのみに制限を加える
                                if(!targetMotor||(typeof targetMotor[pd.cmd])!=='function'){
                                    continue;
                                }
                                if(pd.cmd.indexOf("cmd")!==0){
                                    continue;
                                }

                                let arg;
                                switch (pd.cmd){
                                    case "cmdReadRegister":
                                    case "cmdReadAllRegister":
                                        //出力4 モーターレジスター値取得
                                        arg=pd.arg instanceof Array?pd.arg:typeof pd.arg === "string"?pd.arg.split(','):[pd.arg];
                                        targetMotor[pd.cmd](arg).then((val)=>{
                                            node.send([null,null,null,{"type":"setting","name":targetMotor.deviceInfo.name,"payload":val}]);
                                        }).catch((msg)=>{
                                            node.error(msg);
                                        });
                                        break;
                                    default:
                                        arg=pd.arg instanceof Array?pd.arg:typeof pd.arg === "string"?pd.arg.split(','):[pd.arg];
                                        let res= targetMotor[pd.cmd](...arg);
                                        break;
                                }
                                break;
                        }
                    }
                    break;
            }
            return msg;
        });

        node.on('close', function() {
            node._motorDisConnect();
        });
    }

    function getMotor(motorName){
        let name=motorNameExcludingColor(motorName);
       return KMConnector.KMMotorOneBLE.motors[name];
    }

    function motorNameExcludingColor(motorFullName){
        return typeof motorFullName === "string"?motorFullName.split('#')[0]:null;
    }
    ////
    RED.nodes.registerType("km-motor",kmMotor);

};
