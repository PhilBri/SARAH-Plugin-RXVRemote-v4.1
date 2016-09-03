!function ($) {

    var register = function() {
        var lightred='#EF3D47', lightgreen='#90EE90', txtportlet='#555b61', midgrey='#777', neige='#FAF0EA';
        var power, soundprog, dolby, decoder;

        $("#RxvRemote .portlet-footer").detach().appendTo("#RxvRemote .portlet-body");
        $('.amp-pwr').css({'color':midgrey});
        $('.amp-model').text('Not Ready');
        $('.remove').hide();

        // Buttons
        $('#mute-swt, #pwr-swt, #dwn-btn, #up-btn').click( function (event) {
            event.preventDefault();
            if (this.id =='pwr-swt') {
                if (power=='On')
                    $.post('sarah/RxvRemote?key=@MAIN:PWR=Standby\r\n');
                else
                    $.post('sarah/RxvRemote?key=@MAIN:PWR=On\r\n');
            }
            if (power=='On') { // sup du if ?
                if (this.id =='mute-swt') $.post('sarah/RxvRemote?key=@MAIN:MUTE=On/Off\r\n');
                if (this.id =='up-btn') $.post('sarah/RxvRemote?key=@MAIN:VOL=Up\r\n');
                if (this.id =='dwn-btn') $.post('sarah/RxvRemote?key=@MAIN:VOL=Down\r\n');
            }
        });

        // Socket io
        socket = io.connect('http://localhost:15678');
        socket.on('connect', function () {
            socket.emit('status', 'ready');
            $('.remove').show();
        });
        socket.on('send_data', function (tab) {
            var mode    = tab.split('=').shift();
            var status  = tab.split('=').pop();
            switch (mode) {
                case 'MODELNAME':
                    $('.amp-model').text('AV-Receiver : '+status);
                    break;
                case 'PWR':
                    if (status == 'Standby') {
                        $('.pwr-ico').css({"color":lightred});
                        $('.rds-prog').text('Station');
                        $('.rds-data').text('Waiting for RDS datas ...');
                    }
                    else  $('.pwr-ico').css({'color':lightgreen});
                    power = status;
                break;
                case 'VOL':
                    $('.vol-labl').text(status);
                    break;
                case 'MUTE':
                    if (status == 'Off') $('.mute-ico').css({'color': neige});//css({'color':midgrey});
                    else  $('.mute-ico').css({'color':lightred});
                    break;
                case 'INP':
                    if (status != 'TUNER') $('.rds-prog, .rds-data').text('');
                    $('.input').text(status);
                    break;
                case 'STRAIGHT':
                    $('.straight').text(status);
                    break;
                case 'ENHANCER':
                    $('.enhancer').text(status);
                    break;
                case 'ADAPTIVEDSP':
                    $('.adsp').text(status);
                    if (status == 'Auto') $(".adsp");
                    break;
                case '3DCINEMA':
                    $('.cine-3d').text(status);
                    break;
                case 'SOUNDPRG':
                    if (status=='Surround Decoder') {
                        soundprog = true;
                        if (dolby) $('.srnd-glyph').show();
                        $('.srnd-txt').text(decoder);
                    }
                    else {
                        soundprog = false;
                        $('.srnd-glyph').hide();
                        $('.srnd-txt').text(status);
                    }
                    break;
                case '2CHDECODER':
                    decoder=status;
                    if (!soundprog) break;
                    if (status.indexOf('Dolby')>-1) { 
                        decoder = status.substring(6);
                        $('.srnd-glyph').show();
                    }
                    else {
                        $('.srnd-glyph').hide();
                    }
                    dolby = $('.srnd-glyph').is(':visible');
                    $('.srnd-txt').text(decoder);
                    break;
                case 'STATION':
                case 'FMFREQ' :
                case 'RDSPRGSERVICE' :
                    $('.rds-prog').text(status);
                    break;
                case 'RDSTXTA' :
                    $('.rds-data').text(status);
                    break;
                case 'PUREDIRMODE' : 
                    status == 'On'?$('.audio-decoder').text('Pure Direct').css({'color':lightgreen}) :
                        $('.audio-decoder').text(soundprog).css({'color': txtportlet});
                    break;
            }
            soundprog ? $('.audio-decoder').text('Surround Decoder') : $('.audio-decoder').text('Music.prog');
            $('.l1').each(function(){
                if ($(this).text()!='Off') $(this).css({'color':lightgreen})
                else $(this).css({'color':neige});
            });
        });
    }

    $(document).ready(function() {
        register();
    });
} (jQuery);
