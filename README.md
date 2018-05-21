# KeiganMotor for Node-RED

KeiganMotorをNode-REDから操作するノード  

![sc_1](/sc_1.png)

![sc_2](/sc_2.png)

## 概要
<p>KeiganMotorにはBLEで接続する為、BLEアダプタを搭載したデバイス上のNode-REDで動作します。  
以下のデバイスで動作検証してます。

+ Raspberry Pi 3 Model B
+ MacBook 
</p>

**※Raspberry Zero W では動作しません**

## インストール (npmからインストール)
<p>Node-REDのROOT(.node-red)ディレクトリで以下を実行</p>

```
 $npm install node-red-contrib-keiganmotor
 ```
 ## 実行権限の付与 (Raspberry Pi 3)
<p>raspberry piでBLEを実行する場合、スーパーユーザー権限が必要です。 
 
通常のユーザーとしてNode-Redを実行している場合、BLEを実行するためのアクセス許可を与える必要があります。</p>

```
sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)
 ```
 
## 依存関係
- noble 1.8+
- [kmconnector](https://github.com/keigan-motor/kmconnector-js)

## サンプル
<p>/sample/motor_demo.jsonの中身をNode-REDのクリップボードに貼り付けるか<br/>以下のフローをNode-REDのクリップボードに貼り付けます。</p> 

```
[{"id":"932394d3.0a5078","type":"inject","z":"c50d8323.5e274","name":"Scan 20sec","topic":"","payload":"20000","payloadType":"num","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":150,"y":200,"wires":[["4d5db76f.121c68"]]},{"id":"2ece71c9.2c4e6e","type":"debug","z":"c50d8323.5e274","name":"discoverMotor","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","x":600,"y":120,"wires":[]},{"id":"c3792d6.13938d","type":"km-motor","z":"c50d8323.5e274","name":"","allowConnectMotor":"","x":680,"y":1000,"wires":[["b411dfea.966ed","84f9a18c.60d5c"],["4a86a56f.17bd7c"],["a517cc3e.d4734"],["774b5597.93ec7c"]]},{"id":"219265ad.d081aa","type":"inject","z":"c50d8323.5e274","name":"{\"cmd\":\"cmdLed\",\"arg\":\"1,200,0,0\"}","topic":" ","payload":"{\"cmd\":\"cmdLed\",\"arg\":\"1,200,0,0\"}","payloadType":"json","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":180,"y":1160,"wires":[["c3792d6.13938d"]]},{"id":"5d2e586.261b5a8","type":"inject","z":"c50d8323.5e274","name":"{\"cmd\":\"cmdLed\",\"arg\":[1,200,200,0]}","topic":"cmdLed","payload":"{\"cmd\":\"cmdLed\",\"arg\":[1,200,200,0]}","payloadType":"json","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":190,"y":1200,"wires":[["c3792d6.13938d"]]},{"id":"789212cc.f648ec","type":"comment","z":"c50d8323.5e274","name":"例)最初に発見したモーターに接続する","info":"※注意 別のノードで既に接続されているモーターは接続されません。一旦接続を切って下さい\n\n### ●Scan injectノードにScan時間を設定する。  \nあまり短いとモーターが検出されません、推奨は20秒(20000ms)\n\n### ●スキャン中に発見したモータを即時接続する場合。\nKeigan MotorをKeigan BLE scannerの出力1に接続\n\n### ●スキャン終了後にスキャン中に発見したモータを接続する場合。\nKeigan MotorをKeigan BLE scannerの出力2に接続\n","x":170,"y":120,"wires":[]},{"id":"fe6ded15.e0554","type":"debug","z":"c50d8323.5e274","name":"status","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","x":850,"y":180,"wires":[]},{"id":"3c58330c.c43fdc","type":"inject","z":"c50d8323.5e274","name":"1) 原点を初期化、10rpmで180度回転","topic":"","payload":"[{\"cmd\":\"cmdPresetPosition\"},{\"cmd\":\"cmdSpeed_rpm\",\"arg\":10},{\"cmd\":\"cmdMoveToPosition\",\"arg\":3.1415}]","payloadType":"json","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":730,"y":1260,"wires":[["c3792d6.13938d"]]},{"id":"fa7374a1.48a848","type":"inject","z":"c50d8323.5e274","name":"","topic":"","payload":"{\"cmd\":\"cmdEnable\"}","payloadType":"json","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":140,"y":1440,"wires":[["c3792d6.13938d"]]},{"id":"69510750.9130e8","type":"inject","z":"c50d8323.5e274","name":"","topic":"","payload":"{\"cmd\":\"cmdDisable\"}","payloadType":"json","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":140,"y":1480,"wires":[["c3792d6.13938d"]]},{"id":"732491f8.51795","type":"inject","z":"c50d8323.5e274","name":"5) 原点に戻る","topic":"","payload":"[{\"cmd\":\"cmdSpeed_rpm\",\"arg\":50},{\"cmd\":\"cmdMoveToPosition\",\"arg\":0}]","payloadType":"json","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":650,"y":1420,"wires":[["c3792d6.13938d"]]},{"id":"366985ac.e324ba","type":"debug","z":"c50d8323.5e274","name":"motorMeasurement","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","x":890,"y":220,"wires":[]},{"id":"994b0966.9f4ef8","type":"inject","z":"c50d8323.5e274","name":"{\"cmd\":\"cmdReadRegister\",\"arg\":[29,30]}","topic":"","payload":"{\"cmd\":\"cmdReadRegister\",\"arg\":[29,30]}","payloadType":"json","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":200,"y":1580,"wires":[["c3792d6.13938d"]]},{"id":"4d5db76f.121c68","type":"km-BLEscan","z":"c50d8323.5e274","name":"","x":340,"y":200,"wires":[["2ece71c9.2c4e6e","34c21b75.e3e164"],[]]},{"id":"e89f24a3.529758","type":"inject","z":"c50d8323.5e274","name":"{\"cmd\":\"disConnect\"}","topic":"","payload":"{\"cmd\":\"disConnect\"}","payloadType":"json","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":140,"y":1020,"wires":[["c3792d6.13938d"]]},{"id":"34c21b75.e3e164","type":"km-motor","z":"c50d8323.5e274","name":"","allowConnectMotor":"","x":680,"y":200,"wires":[["fe6ded15.e0554"],["366985ac.e324ba"],[],[]]},{"id":"58fe836c.8f547c","type":"comment","z":"c50d8323.5e274","name":"例)複数のモーターに接続する (スキャン終了後に接続)","info":"※注意 別のノードで既に接続されているモーターは接続されません。一旦接続を切って下さい\n\n### ●Scan injectノードにScan時間を設定する。  \nあまり短いとモーターが検出されません、推奨は20秒(20000ms)\n\n### ●Keigan Motorに接続するモーター名を設定する \n(モーター名はScan終了時にスキャナーの下部に表示されます)\n\n\n### ●スキャン中に発見したモータを即時接続する場合。\nKeigan MotorをKeigan BLE scannerの出力1に接続\n\n### ●スキャン終了後にスキャン中に発見したモータを接続する場合。\nKeigan MotorをKeigan BLE scannerの出力2に接続\n","x":220,"y":420,"wires":[]},{"id":"8a66afe0.6f829","type":"inject","z":"c50d8323.5e274","name":"","topic":"","payload":"{\"cmd\":\"disConnect\"}","payloadType":"json","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":160,"y":300,"wires":[["34c21b75.e3e164"]]},{"id":"dfaf0a00.609cd8","type":"km-BLEscan","z":"c50d8323.5e274","name":"","x":340,"y":520,"wires":[[],["7321a568.66bb5c","ee182648.eee868","f3a2e763.669508"]]},{"id":"3eb78eb5.a47d62","type":"inject","z":"c50d8323.5e274","name":"Scan 20sec","topic":"","payload":"20000","payloadType":"num","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":150,"y":520,"wires":[["dfaf0a00.609cd8"]]},{"id":"ee182648.eee868","type":"km-motor","z":"c50d8323.5e274","name":"","allowConnectMotor":"KM-1 CIRU","x":680,"y":520,"wires":[["b00dd8cd.17b768"],["49c6d2ee.59afec"],[],[]]},{"id":"49c6d2ee.59afec","type":"debug","z":"c50d8323.5e274","name":"motorMeasurement","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","x":950,"y":520,"wires":[]},{"id":"ec2a81.8947358","type":"inject","z":"c50d8323.5e274","name":"","topic":"","payload":"{\"cmd\":\"disConnect\"}","payloadType":"json","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":300,"y":640,"wires":[["ee182648.eee868","7321a568.66bb5c"]]},{"id":"b00dd8cd.17b768","type":"debug","z":"c50d8323.5e274","name":"status","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","x":930,"y":480,"wires":[]},{"id":"7321a568.66bb5c","type":"km-motor","z":"c50d8323.5e274","name":"","allowConnectMotor":"KM-1 175D","x":680,"y":640,"wires":[["8ee4d199.a5092"],["2e3aa6fe.f2af2a"],[],[]]},{"id":"2e3aa6fe.f2af2a","type":"debug","z":"c50d8323.5e274","name":"motorMeasurement","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","x":950,"y":640,"wires":[]},{"id":"8ee4d199.a5092","type":"debug","z":"c50d8323.5e274","name":"status","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","x":930,"y":600,"wires":[]},{"id":"98641290.011cd","type":"comment","z":"c50d8323.5e274","name":"例) モーターの制御","info":"※注意 別のノードで既に接続されているモーターは接続されません。一旦接続を切って下さい。 \n\n+ モータの制御コマンド書式は全て\"cmd\"で始まります。 \n  (connect disConnect以外)  \n\n+ 制御出来る全てのコマンドは以下を参照下さい。 \n\n[モーターコマンド](https://document.keigan-motor.com/apiDocument/kmconnector-js/KMMotorOneBLE.html#connect__anchor)\n\n","x":110,"y":800,"wires":[]},{"id":"a79b46a9.505ee8","type":"inject","z":"c50d8323.5e274","name":"Scan 20sec","topic":"","payload":"20000","payloadType":"num","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":110,"y":900,"wires":[["ba2610f1.8cd3c"]]},{"id":"ba2610f1.8cd3c","type":"km-BLEscan","z":"c50d8323.5e274","name":"","x":320,"y":900,"wires":[["94fa106c.45b91","c3792d6.13938d"],[]]},{"id":"94fa106c.45b91","type":"debug","z":"c50d8323.5e274","name":"discoverMotor","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","x":580,"y":800,"wires":[]},{"id":"f3a2e763.669508","type":"debug","z":"c50d8323.5e274","name":"scanTimeout","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","x":590,"y":420,"wires":[]},{"id":"84f9a18c.60d5c","type":"debug","z":"c50d8323.5e274","name":"status","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","x":950,"y":980,"wires":[]},{"id":"4a86a56f.17bd7c","type":"debug","z":"c50d8323.5e274","name":"motorMeasurement","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","x":990,"y":1020,"wires":[]},{"id":"a517cc3e.d4734","type":"debug","z":"c50d8323.5e274","name":"imuMeasurement","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","x":990,"y":1060,"wires":[]},{"id":"774b5597.93ec7c","type":"debug","z":"c50d8323.5e274","name":"setting","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","x":950,"y":1100,"wires":[]},{"id":"7e317a61.31eba4","type":"comment","z":"c50d8323.5e274","name":"例) モーターの無限回転","info":"\n","x":120,"y":1260,"wires":[]},{"id":"ae5118ae.3021b8","type":"trigger","z":"c50d8323.5e274","op1":"{\"cmd\":\"cmdEnable\"}","op2":"0","op1type":"json","op2type":"str","duration":"10","extend":false,"units":"ms","reset":"","bytopic":"topic","name":"{\"cmd\":\"cmdEnable\"}","x":760,"y":900,"wires":[["c3792d6.13938d"]]},{"id":"b411dfea.966ed","type":"switch","z":"c50d8323.5e274","name":"","property":"payload","propertyType":"msg","rules":[{"t":"eq","v":"connect","vt":"str"}],"checkall":"true","repair":false,"outputs":1,"x":570,"y":900,"wires":[["ae5118ae.3021b8"]]},{"id":"154f8a46.93e226","type":"comment","z":"c50d8323.5e274","name":"※安全装置 モーターを最初に制御する為に必要","info":"","x":680,"y":860,"wires":[]},{"id":"18441ebf.7dbef1","type":"inject","z":"c50d8323.5e274","name":"LED、10rpm、正回転","topic":"","payload":"[{\"cmd\":\"cmdLed\",\"arg\":\"1,200,0,0\"},{\"cmd\":\"cmdSpeed_rpm\",\"arg\":10},{\"cmd\":\"cmdRunForward\"}]","payloadType":"json","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":140,"y":1300,"wires":[["c3792d6.13938d"]]},{"id":"2bf08ca4.77f7a4","type":"inject","z":"c50d8323.5e274","name":"LED、40rpm、逆回転","topic":"","payload":"[{\"cmd\":\"cmdLed\",\"arg\":\"1,100,0,100\"},{\"cmd\":\"cmdSpeed_rpm\",\"arg\":40},{\"cmd\":\"cmdRunReverse\"}]","payloadType":"json","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":140,"y":1340,"wires":[["c3792d6.13938d"]]},{"id":"5fc83cda.82d064","type":"inject","z":"c50d8323.5e274","name":"{\"cmd\":\"connect\",\"arg\":\"KM-1 175D\"}","topic":"","payload":"{\"cmd\":\"connect\",\"arg\":\"KM-1 175D\"}","payloadType":"json","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":190,"y":1060,"wires":[["c3792d6.13938d"]]},{"id":"b9ee3c1.9fd9bc","type":"comment","z":"c50d8323.5e274","name":"例) モーターの切断・手動接続","info":"+ 手動で接続する場合はスキャナーで認識されているモーター名を指定して下さい。  \nex)`{\"cmd\":\"connect\",\"arg\":\"KM-1 175D\"}`\n+ スキャナーで認識されていないモータは接続出来ません。","x":140,"y":980,"wires":[]},{"id":"e3060647.b92548","type":"comment","z":"c50d8323.5e274","name":"例) モーターのLED変更","info":"\n","x":120,"y":1120,"wires":[]},{"id":"8a082a6d.34c6a8","type":"comment","z":"c50d8323.5e274","name":"例) モーターの有効無効(安全装置)","info":"+ モーター接続時は常に無効(cmdDisable)です。 \n\n+ 最初に有効(cmdEnable)にしない限りモーターは動作しません。\n","x":160,"y":1400,"wires":[]},{"id":"ac549528.913098","type":"comment","z":"c50d8323.5e274","name":"例) モーターの設定値の取得","info":"+ レジスタ番号で指定した設定値をモーターから取得します。 \n\n+ 取得した値はモーターの出力４(settingデバッグノード)に出力されます。  \n\n+ レジスタ番号は下記のリンクを参考に10進数で指定して下さい。  \n\n[レジスター一覧](https://document.keigan-motor.com/apiDocument/kmconnector-js/KMMotorCommandKMOne.html#.cmdReadRegister_COMMAND__anchor)","x":140,"y":1540,"wires":[]},{"id":"6f05e191.ab0bd","type":"comment","z":"c50d8323.5e274","name":"例) モーターの回転 座標指定","info":"電源投入時のモータの座標は0です。  \n\n+ 座標(原点)の初期化はcmdPresetPositionで行えます。  \n\n+ 現在のモーターの座標は、モーターノード.出力2.msg.posionで取得出来ます。  \n\n+ 座標の単位はradian(360度=2π=3.1415*2=6.283)\n\n+ 速度は以前に設定した速度が維持されます。\n\n","x":680,"y":1220,"wires":[]},{"id":"ae90138a.0cff2","type":"inject","z":"c50d8323.5e274","name":"3) 現在位置から90度回転","topic":"","payload":"[{\"cmd\":\"cmdMoveByDistance\",\"arg\":1.57}]","payloadType":"json","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":690,"y":1340,"wires":[["c3792d6.13938d"]]},{"id":"c5970907.645ab8","type":"inject","z":"c50d8323.5e274","name":"2) 速度を40rpmに変更","topic":"","payload":"[{\"cmd\":\"cmdSpeed_rpm\",\"arg\":40}]","payloadType":"json","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":680,"y":1300,"wires":[["c3792d6.13938d"]]},{"id":"9e219b8.6db2d68","type":"inject","z":"c50d8323.5e274","name":"4) 現在位置から-90度回転","topic":"","payload":"[{\"cmd\":\"cmdMoveByDistance\",\"arg\":-1.57}]","payloadType":"json","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":690,"y":1380,"wires":[["c3792d6.13938d"]]}] 
```

## Author
[Keigan Inc.](https://keigan-motor.com/)

## License
[MIT](http://b4b4r07.mit-license.org)
