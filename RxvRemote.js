function setYam () {
    // Installing Yamaha socket
    var ival;
    sockYAM = require('net').createConnection( 50000, Config.modules.RxvRemote.Ampli_IP );
    
    if (ival) clearInterval(ival);
    var ival = setInterval( function () {
        sockYAM.write( cfg.cmds[0] + '\r\n');
    }, 39000);

    sockYAM.on('data', function (resp) {
        resp = resp.toString().split('\r\n');
        for (var i = 0; i < resp.length -1; i++){
            if (sockIO) sockIO.emit( 'send_data', resp[i].match(/:(.*)/)[1] );
            if (resp[i].match(/PWR=(.*)/)) pwr = resp[i].match(/PWR=(.*)/)[1];
        }
    }).on('connect', function () {
        console.log('\x1b[96m[  INFO ]\x1b[0m RxvRemote: Connected to Amp. (ip : ' + Config.modules.RxvRemote.Ampli_IP + ')');
    }).on('end', function () {
        console.log('\033[91m[ ERROR ]\033[0m RxvRemote: Disconnected from Amp.');
        sockYAM.destroy();
    }).on('error', function (erreur) {
        console.log('\033[91m[ ERROR ]\033[0m RxvRemote: ' + erreur.message );
        sockYAM.destroy();
    });
}

function setIo () {
    // Installing socket.io
    var io = require('socket.io')(15678);
    io.sockets.on('connection', function (socket) {
        sockIO = socket;
        console.log('\x1b[96m[  INFO ]\x1b[0m RxvRemote: Connected to portlet.');
        sockIO.on('status', function () {
            setTimeout( function() {
                for ( var i = 0; i < cfg.cmds.length; i++ )
                    sockYAM.write( cfg.cmds[i] );
            }, 200);
        }).on('disconnect', function () {
            console.log('\x1b[96m[  INFO ]\x1b[0m RxvRemote: Disconnected from portlet.');
        });
    });
}

var sockIO, cfg, pwr;
exports.init = function () {
    var fs = require('fs');
    if ( /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/.test( Config.modules.RxvRemote.Ampli_IP ))
        cfg = JSON.parse(fs.readFileSync( __dirname + '/config.json', 'utf8' ).toString());
    else return console.log ('\033[91m[ ERROR ]\033[0m RxvRemote: IP not find!');
    setIo();
    setYam();
}

exports.action = function (data , next) {
    if (pwr == 'On' || data.key == '@MAIN:PWR=On') sockYAM.write( data.key+'\r\n' );
    else return next({ 'tts': 'Allumez d\'abord l\'ampli' });
    next({});
}