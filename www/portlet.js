!function ($) {
    var register = function() {
        var noir='#6A5F4D', lightred='#EF3D47', lightgreen='#90EE90', lightblue='#33A6CC', txtportlet='#555b61', midgrey='#777';
        var power; var soundprog; var dolby; var decoder;
        $('.amp-pwr').css({'color':noir});
        $('.amp-model').text('Not Ready');
        $('.remove').hide();

        // Buttons
        $('#mute-swt, #pwr-swt, #dwn-btn, #up-btn').click( function (event) {
            event.preventDefault();
            if (this.id =='pwr-swt') {
                if (power=='On') $.post('sarah/RxvRemote?key=@MAIN:PWR=Standby\r\n');
                else $.post('sarah/RxvRemote?key=@MAIN:PWR=On\r\n');
            }
            if (power=='On') {
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
            /*setTimeout(function(){},300);*/
            var mode    = tab.split('=').shift();
            var status  = tab.split('=').pop();
            switch (mode) {
                case 'MODELNAME':
                    $('.amp-model').text('AV-Receiver model : '+status);
                    break;
                case 'PWR':
                    if (status == 'Standby') $('.pwr-ico').css({"color":lightred})
                    else  $('.pwr-ico').css({'color':lightgreen});
                    power = status;
                break;
                case 'VOL':
                    $('.vol-labl').text(status+' dB');
                    break;
                case 'MUTE':
                    if (status == 'Off') $('.mute-ico').css({'color': midgrey })
                    else  $('.mute-ico').css({'color': lightred });
                    break;
                case 'INP':
                    $('.inp-data-2, .inp-data-1').text('');
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
                    break;
                case '3DCINEMA':
                    $('.3d').text(status);
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
                    $('.inp-data-1').text(status);
                    break;
                case 'RDSTXTA' :
                    $('.inp-data-2').text(status);
                    break;
                case 'PUREDIRMODE' : 
                    status == 'On'?$('.audio-decoder').text('Pure Direct').css({'color':lightgreen}) :
                        $('.audio-decoder').text(soundprog).css({'color': txtportlet});
                    break;
            }
            soundprog ? $('.audio-decoder').text('Surround Decoder') : $('.audio-decoder').text('Music.prog');
            $('.label').each(function(){
                if ($(this).text()=='On' || $(this).text()=='Auto') $(this).css({'color':lightgreen, 'font-weight':'bold'})
                else $(this).css({'color':'#FFF', 'font-weight':'normal'});
            });
        });
    }

    $(document).ready(function() {
        register();
    });
  
} (jQuery);
