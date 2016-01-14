function setYam () {
    // Installing Yamaha socket
    var ival;
    sockYAM = require('net').createConnection(50000, SARAH.context.rxvremote.ip); // socket.writable == true;
    SARAH.context.rxvremote.sockYAM = sockYAM;
    
    if (ival) clearInterval(ival);
    var ival = setInterval( function () {
        sockYAM.write('@SYS:MODELNAME=?\r\n');
    }, 39000);

    sockYAM.on('data', function (resp) {
        resp = resp.toString().split('\r\n');
        for (var i=0; i < resp.length-1; i++){
        var a = /:(.*)/.exec(resp[i]);
           //if(resp[i]!='@RESTRICTED\r\n') sockIO.emit('send_data', a[1]);
           if (sockIO) sockIO.emit('send_data', a[1]);
        }
    }).on('connect', function (){
        console.log('\x1b[96m[  INFO ]\x1b[0m RxvRemote: Connected to Amp. (ip : ' + SARAH.context.rxvremote.ip+')');
        
    }).on('end', function (){
        console.log('\033[91m[ ERROR ]\033[0m RxvRemote: Disconnected from Amp.');
        sockYAM.destroy();
    }).on('error', function (erreur){
        console.log('\033[91m[ ERROR ]\033[0m RxvRemote: ' + erreur.message );
        sockYAM.destroy();
    });
}

function setIo () {
    // Installing socket.io
    var io = require('socket.io')(15678);
    io.sockets.on ('connection', function (socket) {
        sockIO = socket;
        console.log('\x1b[96m[  INFO ]\x1b[0m RxvRemote: Connected to portlet.');
        sockIO.on('status', function () {
            setTimeout ( function () { sockYAM.write('@SYS:MODELNAME=?\r\n'); }, 200 );        
            setTimeout ( function () { sockYAM.write('@MAIN:BASIC=?\r\n'); }, 200 );        
            setTimeout ( function () { sockYAM.write('@MAIN:ADAPTIVEDSP=?\r\n'); }, 200 );        
            setTimeout ( function () { sockYAM.write('@MAIN:3DCINEMA=?\r\n'); }, 200);
            setTimeout ( function () { sockYAM.write('@MAIN:EXSURDECODER=?\r\n'); }, 200);
            setTimeout ( function () { sockYAM.write('@MAIN:2CHDECODER=?\r\n'); }, 200);
        }).on('disconnect', function () {
            console.log('\x1b[96m[  INFO ]\x1b[0m RxvRemote: Disconnected from portlet.');
        });
    });
}

var sockIO;
exports.init = function () {
    if (/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/.test(Config.modules.RxvRemote.Ampli_IP))
        SARAH.context.rxvremote = {ip:Config.modules.RxvRemote.Ampli_IP};
    else return console.log ('\033[91m[ ERROR ]\033[0m RxvRemote: IP not find!');
    setIo();
    setYam();
}

exports.action = function (data , next) {
    sockYAM.write(data.key+'\r\n');
    if (data.tts) console.log('\x1b[92m[    OK ]\x1b[0m RxvRemote: Commande => ' + data.tts)
    else console.log('\x1b[92m[    OK ]\x1b[0m RxvRemote: Commande => From portlet...');
	next ({'tts': data.tts});
}