(function($) {
    $.fn.extend({
        /*
            $('selector').myplugin( { key: 'value' } );
            $('selector').myplugin( 'mymethod1', 'argument' );
        */
        ukagaka: function(options, arg) {
            if (options && typeof(options) == 'object') {
                options = $.extend({}, $.ukagaka.defaults, options);
            } else {
                options = $.extend($.ukagaka.defaults, options);
            }

            this.each(function() {
                new $.ukagaka(this, options, arg);
            });
            return;
        }
    });

    $.ukagaka = function(elem, options, arg) {

        if (options && typeof(options) == 'string') {
            if (options == 'loadTalk') {
                loadTalk(options);
            }
            return;
        } else {
            init(elem, options);
        }

        function init(elem, options) {
            var o = options;

            var obj = $(elem);

            var sheetfield = o.googleSheetField;

            var loadingText = o.loadingText,
                learnPlaceholder = o.learnPlaceholder,
                logText = o.logText,
                menuMainText = o.menuMainText,
                menuLearnText = o.menuLearnText,
                menuLogText = o.menuLogText,
                menuExitText = o.menuExitText,
                menuCancelText = o.menuCancelText,
                menuSubmitText = o.menuSubmitText,
                menuQueryText = o.menuQueryText;
                ukagakaText = o.ukagakaText;

            var footerMenuHTML = "";
            footerMenuHTML += "<div id='ukagaka_controlpanel'><ul>";
            // footerMenuHTML += "<input id='ukagaka_usertalk'>";
            footerMenuHTML += "<li id='ukagaka_btn_up'><i class='fa-arrow-up'></i></li>";
            footerMenuHTML += "<li id='ukagaka_btn_down'><i class='fa-arrow-down'></i></li>";
            footerMenuHTML += "<li id='ukagaka_btn_menu'><i class='fa-pencil'></i></li>";
            footerMenuHTML += "<li id='ukagaka_btn_music'><i class='fa-music'></i></li>";
            footerMenuHTML += "<li id='ukagaka_btn_refresh'><i class='fa-refresh'></i></li>";
            footerMenuHTML += "<li id='ukagaka_btn_power'><i class='fa-power-off'></i></li>";
            // footerMenuHTML += "<li id='ukagaka_btn_mail'><i class='fa-mail'></i></li>";
            footerMenuHTML += "</ul></div>";

            var dialogHTML = "";
            dialogHTML += playerHTML();
            dialogHTML += "<div class='ukagaka_box'>";
            dialogHTML += "<div class='ukagaka_msg' id='ukagaka_msgbox'></div>";
            dialogHTML += "<div class='ukagaka_msg' id='ukagaka_menubox' style='display:none'>" + menuMainText + "<br/><br/><span id='ukagaka_menu_btn_addstring'>" + menuLearnText + "</span><span id='ukagaka_menu_btn_renewlist'></br>" + menuLogText + "</span><span id='ukagaka_menu_btn_exit'></br>" + menuExitText + "</span></div>";
            dialogHTML += "<div class='ukagaka_msg' id='ukagaka_stringinput' style='display:none'>" + menuQueryText + "<input id='ukagaka_addstring' type='text' placeholder='" + learnPlaceholder + "'/><br/><span id='ukagaka_addmenu_add'>" + menuSubmitText + "</span><span id='ukagaka_btn_menu'>" + menuCancelText + "</span></div>";
            dialogHTML += "<div class='ukagaka_msg' id='ukagaka_renewlist' style='display:none'>" + logText + "<span id='ukagaka_btn_menu'>" + menuCancelText + "</span></div>";
            dialogHTML += "<input id='ukagaka_sheetfield' type='hidden' value='" + sheetfield + "'>";
            dialogHTML += "</div>";


            var innerSettingHTML = "";
            innerSettingHTML += "<div id='ukagaka_logbox' class='ukagaka_block'>";
            innerSettingHTML += "<div class=\"chat-box-content\">" + dialogHTML + "</div>";
            innerSettingHTML += "</div>";

            obj.append(innerSettingHTML);
            obj.append("<img class='ukagaka_img' src='" + options.imgs[0] + "'></img>")
            obj.append(footerMenuHTML);

            loadTalk(options);

            actionSetting(options, elem);

            playerDeploy();

            //$("#playblock").hide();
            //$("#ukagaka_logbox").hide();
        }

        function loadTalk(options) {
            var o = options;

            var key = o.googleKey,
                sheet = o.googleSheet,
                formkey = o.googleFormkey,
                sheetname = o.googleSheetName,
                apikey = o.googleApiKey;

            //var url = "https://spreadsheets.google.com/feeds/list/" + key + "/" + sheet + "/public/values?alt=json"
            var url = "https://sheets.googleapis.com/v4/spreadsheets/" + key + "/values/" + sheetname + "?key=" + apikey
            $.getJSON(url, function(JData) {
                for (var i = 1; i < JData.values.length; i++) {
                    $.ukagaka.talking[i] = JData.values[i][1];
                }
                showText($.ukagaka.talking[Math.floor(Math.random() * $.ukagaka.talking.length)]);
                $('input#ukagaka_addstring').attr('placeholder', ukagakaText + '学习了' + JData.values.length + '条人生经验');
            });
        }

        function showText(text) {
            $.ukagaka.nextText = text;
        }

        function sendLearnText(options) {
            var o = options;

            var key = o.googleKey,
                sheet = o.googleSheet,
                formkey = o.googleFormkey,
                sheetfield = o.googleSheetField;

            var add = $("input#ukagaka_addstring").val(),
                googleSheetField = $('input#ukagaka_sheetfield').val(),
                sendData = {};
            sendData[googleSheetField] = add;
            if (!((add.length <= 1) || add.indexOf('script') > -1 || add.indexOf('body') > -1 ||
                add.indexOf('style') > -1 || add.indexOf('link') > -1 || add.indexOf('iframe') > -1 || add.indexOf('head') > -1 ||
                add.indexOf('nav') > -1 || add.indexOf('object') > -1 || add.indexOf('embed') > -1)) {
                $.ajax({
                    type: 'POST',
                    url: 'https://docs.google.com/forms/d/' + formkey + '/formResponse',
                    data: sendData,
                    dataType: "xml",
                    statusCode: {
                        0: function() {
                            $("input#ukagaka_addstring").attr("value", "");
                            $(".ukagaka_box div").fadeOut(500);
                            showText(ukagakaText + "又学习了一个 !");
                        },
                        200: function() {
                            $("input#ukagaka_addstring").attr("value", "");
                            $(".ukagaka_box div").fadeOut(500);
                            showText(ukagakaText + "又学习了一个 !");
                        }
                    }
                });
            } else {
                alert("OOPS！" + ukagakaText + "不姿瓷！");
            }
        }

        function typed(text) {
            setInterval(function() {
                if ($.ukagaka.nowText == $.ukagaka.nextText)
                    return;
                $("#ukagaka_msgbox").typed('reset');
                $.ukagaka.nowText = $.ukagaka.nextText;
                $("#ukagaka_msgbox").typed({
                    strings: [$.ukagaka.nowText],
                    typeSpeed: 10,
                    contentType: 'html',
                    loop: false,
                    backDelay: 500,
                    loopCount: false,
                    callback: function() {},
                    resetCallback: function() {}
                });
            }, 1000);
        }

        function actionSetting(options, elem) {
            typed('');

            var obj = $(elem);

            var o = options;

            var loadingText = o.loadingText,
                learnPlaceholder = o.learnPlaceholder,
                logText = o.logText,
                menuMainText = o.menuMainText,
                menuLearnText = o.menuLearnText,
                menuLogText = o.menuLogText,
                menuExitText = o.menuExitText,
                menuCancelText = o.menuCancelText,
                menuSubmitText = o.menuSubmitText,
                menuQueryText = o.menuQueryText;

            $("#ukagaka_usertalk").hide();
            if (navigator.userAgent.match(/Android|iPhone/i)) {
                $("#playblock").hide();
                $(".ukagaka_box").hide();
                $(".ukagaka_img").hide();
            } else {
                $(window).on('load',function() {
                    var talk_timer = setInterval(talkingbox, o.talkTime);

                    function talkingbox() {
                        if ($("#ukagaka_msgbox").css("display") != 'none' && $.ukagaka.talkValid == true) {
                            showText($.ukagaka.talking[Math.floor(Math.random() * $.ukagaka.talking.length)]);
                        }
                    }
                });
                loadTalk(options);
            }
            showText(loadingText);

            $("#ukagaka_usertalk").keypress(function(e) {
                code = (e.keyCode ? e.keyCode : e.which);
                if (code == 13) {
                    var sendData = {};
                    sendData['msg'] = $("#ukagaka_usertalk").val();
                    $("#ukagaka_usertalk").val("");
                    $.ajax({
                        type: 'GET',
                        url: 'http://140.115.205.194:8080',
                        data: sendData,
                        success: function(JData) {
                            showText(JData);
                        },
                        error: function(argument) {
                            showText("主機關閉中 ...");
                        }
                    });
                }
            });

            $(document).on('click', "#ukagaka_btn_mail", function(event) {
                // $("#ukagaka_usertalk").toggle('slide', null, 500)
                alert('AIML 入口，正在永久推遲建造 ...');
            }).on('click', "#ukagaka_btn_music", function(event) {
                // $("#ukagaka_usertalk").toggle('slide', null, 500)
                $("#playblock").toggle('slide', {direction:"right"}, null, 500);
            }).on('click', "#ukagaka_btn_up", function(event) {
                $("html,body").animate({
                    scrollTop: 0
                }, 1000);
            }).on('click', "#ukagaka_btn_down", function(event) {
                $("html,body").animate({
                    scrollTop: document.body.scrollHeight
                }, 1000);
            }).on('click', "#ukagaka_menu_btn_exit", function(event) {
                $(".ukagaka_box div").fadeOut(500);
                $("#ukagaka_msgbox").delay(500).fadeIn(500);
            }).on('click', "#ukagaka_btn_menu", function(event) {
                $(".ukagaka_box div").fadeOut(500);
                $("#ukagaka_menubox").delay(500).fadeIn(500);
            }).on('click', "#ukagaka_menu_btn_addstring", function(event) {
                $(".ukagaka_box div").fadeOut(500);
                $("#ukagaka_stringinput").delay(500).fadeIn(500);
            }).on('click', "#ukagaka_menu_btn_renewlist", function(event) {
                $(".ukagaka_box div").fadeOut(500);
                $("#ukagaka_renewlist").delay(500).fadeIn(500);
            }).on('click', "#ukagaka_addmenu_add", function(event) {
                sendLearnText(options);
            }).on('click', "#ukagaka_btn_refresh", function(event) {
                $(".ukagaka_img").attr("src", options.imgs[Math.floor(Math.random() * options.imgs.length)]);
            }).on('click', "#ukagaka_btn_power", function(event) {
                $(".ukagaka_img, .ukagaka_box, #playblock").toggle('slide', {direction:"right"}, null, 500);
            });
        }

        function playerHTML() {
            var html;
            var header = '',
                ctrl = '',
                progress = '';
            header += '<div class="tag"><strong>Title</strong><span class="artist">Artist</span><span class="album">Album</span></div>';
            ctrl += '<div class="control">';
            ctrl += '<i class="fa-backward"></i><i class="fa-play"></i><i class="fa-forward"></i>';
            ctrl += '<span class="progress"><i class="fa-repeat"></i><i class="fa-random"></i></span>';
            ctrl += '<span class="volume"><i class="fa-volume-up"></i><div class="slider"><div class="pace"></div></div></span>';
            ctrl += '</div>';
            progress += '<div class="progress"><div class="slider"><div class="loaded"></div><div class="pace"></div></div><div class="timer right">0:00</div></div>';

            html = '<div id="playblock"><div id="player"><div class="ctrl">';
            html = html + header + ctrl + progress;
            html = html + '</div></div></div>';
            return html;
        }

        function playerDeploy() {
            var player = $('#playblock');
            var repeat = false,
                shuffle = false,
                continous = true,
                autoplay = false,
                playlist = [
                    {
                        title: 'HIGANBANA',
                        artist: 'AnJu',
                        album: '零～濡鴉ノ巫女～',
                        cover: '',
                        mp3: '/files/Higanbana.mp3',
                        ogg: '/files/Higanbana.mp3'
                    },{
                        title: 'Only My Railgun',
                        artist: 'fripSide',
                        album: 'Only My Railgun',
                        cover: '',
                        mp3: '/files/Only My Railgun.mp3',
                        ogg: '/files/Only My Railgun.mp3'
                    },{
                        title: '輝夜の城で踊りたい',
                        artist: 'μ\'s',
                        album: 'きっと青春が闻こえる',
                        cover: '',
                        mp3: '/files/輝夜の城で踊りたい.mp3',
                        ogg: '/files/輝夜の城で踊りたい.mp3'
                    },{
                        title: '吹雪',
                        artist: '西沢幸奏',
                        album: '艦隊これくしょん -艦これ-',
                        cover: '',
                        mp3: '/files/吹雪.mp3',
                        ogg: '/files/吹雪.mp3'
                    },{
                        title: '海色',
                        artist: 'AKINO',
                        album: '艦隊これくしょん -艦これ-',
                        cover: '',
                        mp3: '/files/海色.mp3',
                        ogg: '/files/海色.mp3'
                    },{
                        title: 'Time after time〜花舞う街で〜',
                        artist: '倉木麻衣',
                        album: '名探偵コナン 迷宮の十字路',
                        cover: '',
                        mp3: '/files/Time After Time.mp3',
                        ogg: '/files/Time After Time.mp3'
                    },{
                        title: '轮回之境',
                        artist: 'Critty',
                        album: '弦上春雪',
                        cover: '',
                        mp3: '/files/轮回之境.mp3',
                        ogg: '/files/轮回之境.mp3'
                    }
                ];

            var time = new Date(),
                currentTrack = shuffle === 'true' ? time.getTime() % playlist.length : 0,
                trigger = false,
                audio, timeout, isPlaying, playCounts;

            var play = function() {
                audio.play();
                player.find('.fa-play').addClass('fa-pause');
                player.find('.fa-pause').removeClass('fa-play');
                timeout = setInterval(updateProgress, 500);
                isPlaying = true;
            }

            var pause = function() {
                audio.pause();
                player.find('.fa-pause').addClass('fa-play');
                player.find('.fa-play').removeClass('fa-pause');
                clearInterval(updateProgress);
                isPlaying = false;
            }

            // Update progress
            var setProgress = function(value) {
                var currentSec = parseInt(value % 60) < 10 ? '0' + parseInt(value % 60) : parseInt(value % 60),
                    ratio = value / audio.duration * 100;

                player.find('.timer').html(parseInt(value / 60) + ':' + currentSec);
                player.find('.progress .pace').css('width', ratio + '%');
                player.find('.progress .slider a').css('left', ratio + '%');
            }

            var updateProgress = function() {
                setProgress(audio.currentTime);
            }

            // Progress slider
            player.find('.progress .slider').slider({
                step: 0.1,
                slide: function(event, ui) {
                    $(this).addClass('enable');
                    setProgress(audio.duration * ui.value / 100);
                    clearInterval(timeout);
                },
                stop: function(event, ui) {
                    audio.currentTime = audio.duration * ui.value / 100;
                    $(this).removeClass('enable');
                    timeout = setInterval(updateProgress, 500);
                }
            });

            // Volume slider
            var setVolume = function(value) {
                audio.volume = localStorage.volume = value;
                player.find('.volume .pace').css('width', value * 100 + '%');
                player.find('.volume .slider a').css('left', value * 100 + '%');
            }

            var volume = localStorage.volume || 0.5;
            player.find('.volume .slider').slider({
                max: 1,
                min: 0,
                step: 0.01,
                value: volume,
                slide: function(event, ui) {
                    setVolume(ui.value);
                    $(this).addClass('enable');
                    player.find('.fa-volume-up').removeClass('enable');
                },
                stop: function() {
                    $(this).removeClass('enable');
                }
            }).children('.pace').css('width', volume * 100 + '%');

            player.find('.fa-volume-up').click(function() {
                if ($(this).hasClass('enable')) {
                    setVolume($(this).data('volume'));
                    $(this).removeClass('enable').removeClass('fa-volume-off');
                } else {
                    $(this).data('volume', audio.volume).addClass('enable').addClass('fa-volume-off');
                    setVolume(0);
                }
            });

            // Switch track
            var switchTrack = function(i) {
                if (i < 0) {
                    track = currentTrack = playlist.length - 1;
                } else if (i >= playlist.length) {
                    track = currentTrack = 0;
                } else {
                    track = i;
                }

                $('audio').remove();
                loadMusic(track);
                if (isPlaying == true) play();
            }

            // Shuffle
            var shufflePlay = function() {
                var time = new Date(),
                    lastTrack = currentTrack;
                currentTrack = time.getTime() % playlist.length;
                if (lastTrack == currentTrack)++currentTrack;
                switchTrack(currentTrack);
            }

            // Fire when track ended
            var ended = function() {
                pause();
                audio.currentTime = 0;
                playCounts++;
                if (continous == true) isPlaying = true;
                if (repeat == true) {
                    play();
                } else {
                    if (shuffle == true) {
                        shufflePlay();
                    } else {
                        switchTrack(++currentTrack);
                    }
                }
            }

            var beforeLoad = function() {
                var endVal = this.seekable && this.seekable.length ? this.seekable.end(0) : 0;
                player.find('.progress .loaded').css('width', (100 / (this.duration || 1) * endVal) + '%');
            }

            // Fire when track loaded completely
            var afterLoad = function() {
                if (autoplay == true) play();
            }

            // Load track
            var loadMusic = function(i) {
                var item = playlist[i],
                    newaudio = $('<audio>').html('<source src="' + item.mp3 + '"><source src="' + item.ogg + '">').appendTo('#player');

                player.find('.tag').html('<strong>' + item.title + '</strong><span class="artist">' + item.artist + '</span><span class="album">' + item.album + '</span>');
                // player.find('#playlist li').removeClass('playing').eq(i).addClass('playing');
                audio = newaudio[0];
                audio.volume = player.find('.fa-volume-up').hasClass('enable') ? 0 : volume;
                audio.addEventListener('progress', beforeLoad, false);
                audio.addEventListener('durationchange', beforeLoad, false);
                audio.addEventListener('canplay', afterLoad, false);
                audio.addEventListener('ended', ended, false);
            }

            loadMusic(currentTrack);
            player.find('.fa-play').on('click', function() {
                if ($(this).hasClass('fa-pause')) {
                    pause();
                } else {
                    play();
                }
            });
            player.find('.fa-forward').on('click', function() {
                if (shuffle == true) {
                    shufflePlay();
                } else {
                    switchTrack(++currentTrack);
                }
            });
            player.find('.fa-backward').on('click', function() {
                if (shuffle == true) {
                    shufflePlay();
                } else {
                    switchTrack(--currentTrack);
                }
            });

            if (shuffle == false) player.find('.fa-random').addClass('enable');
            if (repeat == false) player.find('.fa-repeat').addClass('enable');

            player.find('.fa-repeat').on('click', function() {
                if ($(this).hasClass('enable')) {
                    repeat = localStorage.repeat = true;
                    $(this).removeClass('enable');
                } else {
                    repeat = localStorage.repeat = false;
                    $(this).addClass('enable');
                }
            });

            player.find('.fa-random').on('click', function() {
                if ($(this).hasClass('enable')) {
                    shuffle = localStorage.shuffle = true;
                    $(this).removeClass('enable');
                } else {
                    shuffle = localStorage.shuffle = false;
                    $(this).addClass('enable');
                }
            });
        }
    };

    $.ukagaka.defaults = {
        googleKey: '1V4ZjHqiItSJuNov0TkwfSTESALr5XEILfdzAu1xd9ys',
        googleFormkey: '1BPzP_o86Lruxu60S0C8_MHYEzwPk67BY3hkb-3wPu0M',
        googleSheet: "1",
        googleSheetName: "Form Responses 1",
        googleSheetField: "entry.1522432738",
        googleApiKey: "AIzaSyB4EFMxD0DaB-ljVLDPJaFkAnAUVS_bUFM",
        talkTime: 60000,

        ukagakaText: "提督",
        loadingText: '通信エラーが発生した',
        learnPlaceholder: "被墙了还怎么学习？",
        menuMainText: "使用选项&#65292; 不是钦点！",
        menuLearnText: "$ 学习一个",
        menuLogText: "$ 大新闻",
        menuExitText: "$ 返回",
        menuCancelText: "$ 取消",
        menuSubmitText: "$ 确认",
        menuQueryText: "提高姿势水平<br/>",
        logText: "Shintaku 修正<br/>找尋 AI 系統<br/>谈笑风生<br/>",
        imgs: [
                '/images/kancolle/NPC 任务娘 Quest 大淀.png',
                '/images/kancolle/no.1 Nagato 長門 中破.png',
                '/images/kancolle/no.1 Nagato 長門 立绘.png',
                '/images/kancolle/no.10 Shimakaze 岛風 中破.png',
                '/images/kancolle/no.10 Shimakaze 岛風 立绘.png',
                '/images/kancolle/no.100 Chiyoda_A 千代田甲 中破.png',
                '/images/kancolle/no.100 Chiyoda_A 千代田甲 立绘.png',
                '/images/kancolle/no.101 Mogami_Kai 最上改 中破.png',
                '/images/kancolle/no.101 Mogami_Kai 最上改 立绘.png',
                '/images/kancolle/no.102 Ise_Kai 伊势改 中破.png',
                '/images/kancolle/no.102 Ise_Kai 伊势改 立绘.png',
                '/images/kancolle/no.103 Hyuuga_Kai 日向改 中破.png',
                '/images/kancolle/no.103 Hyuuga_Kai 日向改 立绘.png',
                '/images/kancolle/no.104 Chitose_Carrier 千歳航 中破.png',
                '/images/kancolle/no.104 Chitose_Carrier 千歳航 立绘.png',
                '/images/kancolle/no.105 Chiyoda_Carrier 千代田航 中破.png',
                '/images/kancolle/no.105 Chiyoda_Carrier 千代田航 立绘.png',
                '/images/kancolle/no.106 Shoukaku 翔鶴 中破.png',
                '/images/kancolle/no.106 Shoukaku 翔鶴 立绘.png',
                '/images/kancolle/no.107 Zuikaku 瑞鶴 中破.png',
                '/images/kancolle/no.107 Zuikaku 瑞鶴 立绘.png',
                '/images/kancolle/no.108 Zuikaku_Kai 瑞鶴改 中破.png',
                '/images/kancolle/no.108 Zuikaku_Kai 瑞鶴改 立绘.png',
                '/images/kancolle/no.109 Kinu 鬼怒 中破.png',
                '/images/kancolle/no.109 Kinu 鬼怒 立绘.png',
                '/images/kancolle/no.11 Fubuki 吹雪 中破.png',
                '/images/kancolle/no.11 Fubuki 吹雪 立绘.png',
                '/images/kancolle/no.110 Abukuma 阿武隈 中破.png',
                '/images/kancolle/no.110 Abukuma 阿武隈 立绘.png',
                '/images/kancolle/no.111 Yuubari 夕張 中破.png',
                '/images/kancolle/no.111 Yuubari 夕張 立绘.png',
                '/images/kancolle/no.112 Zuihou 瑞鳯 中破.png',
                '/images/kancolle/no.112 Zuihou 瑞鳯 立绘.png',
                '/images/kancolle/no.113 Zuihou_Kai 瑞鳯改 中破.png',
                '/images/kancolle/no.113 Zuihou_Kai 瑞鳯改 立绘.png',
                '/images/kancolle/no.114 Ooi_Kai_Ni 大井改二 中破.png',
                '/images/kancolle/no.114 Ooi_Kai_Ni 大井改二 立绘.png',
                '/images/kancolle/no.115 Kitakami_Kai_Ni 北上改二 中破.png',
                '/images/kancolle/no.115 Kitakami_Kai_Ni 北上改二 立绘.png',
                '/images/kancolle/no.116 Mikuma 三隈 中破.png',
                '/images/kancolle/no.116 Mikuma 三隈 立绘.png',
                '/images/kancolle/no.117 Mikuma_Kai 三隈改 中破.png',
                '/images/kancolle/no.117 Mikuma_Kai 三隈改 立绘.png',
                '/images/kancolle/no.118 Hatsukaze 初風 中破.png',
                '/images/kancolle/no.118 Hatsukaze 初風 立绘.png',
                '/images/kancolle/no.119 Maikaze 舞風 中破.png',
                '/images/kancolle/no.119 Maikaze 舞風 立绘.png',
                '/images/kancolle/no.12 Shirayuki 白雪 中破.png',
                '/images/kancolle/no.12 Shirayuki 白雪 立绘.png',
                '/images/kancolle/no.120 Kinugasa 衣笠 中破.png',
                '/images/kancolle/no.120 Kinugasa 衣笠 立绘.png',
                '/images/kancolle/no.121 Chitose_Carrier_Kai_2 千歳航改二 中破.png',
                '/images/kancolle/no.121 Chitose_Carrier_Kai_2 千歳航改二 立绘.png',
                '/images/kancolle/no.122 Chiyoda_Carrier_Kai_Ni 千代田航改二 中破.png',
                '/images/kancolle/no.122 Chiyoda_Carrier_Kai_Ni 千代田航改二 立绘.png',
                '/images/kancolle/no.123 I_19 伊19 中破.png',
                '/images/kancolle/no.123 I_19 伊19 立绘.png',
                '/images/kancolle/no.124 Suzuya 鈴谷 中破.png',
                '/images/kancolle/no.124 Suzuya 鈴谷 立绘.png',
                '/images/kancolle/no.125 Kumano 熊野 中破.png',
                '/images/kancolle/no.125 Kumano 熊野 立绘.png',
                '/images/kancolle/no.126 I_168 伊168 中破.png',
                '/images/kancolle/no.126 I_168 伊168 立绘.png',
                '/images/kancolle/no.127 I_58 伊58 中破.png',
                '/images/kancolle/no.127 I_58 伊58 立绘.png',
                '/images/kancolle/no.128 I_8 伊8 中破.png',
                '/images/kancolle/no.128 I_8 伊8 立绘.png',
                '/images/kancolle/no.129 Suzuya_Kai 鈴谷改 中破.png',
                '/images/kancolle/no.129 Suzuya_Kai 鈴谷改 立绘.png',
                '/images/kancolle/no.13 Hatsuyuki 初雪 中破.png',
                '/images/kancolle/no.13 Hatsuyuki 初雪 立绘.png',
                '/images/kancolle/no.130 Kumano_Kai 熊野改 中破.png',
                '/images/kancolle/no.130 Kumano_Kai 熊野改 立绘.png',
                '/images/kancolle/no.131 Yamato 大和 中破.png',
                '/images/kancolle/no.131 Yamato 大和 立绘.png',
                '/images/kancolle/no.132 Akugumo 秋雲 中破.png',
                '/images/kancolle/no.132 Akugumo 秋雲 立绘.png',
                '/images/kancolle/no.133 Yuugumo 夕雲 中破.png',
                '/images/kancolle/no.133 Yuugumo 夕雲 立绘.png',
                '/images/kancolle/no.134 Makigumo 卷雲 中破.png',
                '/images/kancolle/no.134 Makigumo 卷雲 立绘.png',
                '/images/kancolle/no.135 Naganami 長波 中破.png',
                '/images/kancolle/no.135 Naganami 長波 立绘.png',
                '/images/kancolle/no.136 Yamato_Kai 大和改 中破.png',
                '/images/kancolle/no.136 Yamato_Kai 大和改 立绘.png',
                '/images/kancolle/no.137 Agano 阿賀野 中破.png',
                '/images/kancolle/no.137 Agano 阿賀野 立绘.png',
                '/images/kancolle/no.138 Noshiro 能代 中破.png',
                '/images/kancolle/no.138 Noshiro 能代 立绘.png',
                '/images/kancolle/no.139 Yahagi 矢矧 中破.png',
                '/images/kancolle/no.139 Yahagi 矢矧 立绘.png',
                '/images/kancolle/no.14 Miyuki 深雪 中破.png',
                '/images/kancolle/no.14 Miyuki 深雪 立绘.png',
                '/images/kancolle/no.140 Sakawa 酒匂 中破.png',
                '/images/kancolle/no.140 Sakawa 酒匂 立绘.png',
                '/images/kancolle/no.141 Isuzu_Kai_Ni 五十鈴改二 中破.png',
                '/images/kancolle/no.141 Isuzu_Kai_Ni 五十鈴改二 立绘.png',
                '/images/kancolle/no.142 Kinugasa_Kai_Ni 衣笠改二 中破.png',
                '/images/kancolle/no.142 Kinugasa_Kai_Ni 衣笠改二 立绘.png',
                '/images/kancolle/no.143 Musashi 武藏 中破.png',
                '/images/kancolle/no.143 Musashi 武藏 立绘.png',
                '/images/kancolle/no.144 Yuudaichi_Kai_Ni 夕立改二 中破.png',
                '/images/kancolle/no.144 Yuudaichi_Kai_Ni 夕立改二 立绘.png',
                '/images/kancolle/no.145 Shigure_Kai_Ni 時雨改二 中破.png',
                '/images/kancolle/no.145 Shigure_Kai_Ni 時雨改二 立绘.png',
                '/images/kancolle/no.146 Kiso_Kai_Ni 木曽改二 中破.png',
                '/images/kancolle/no.146 Kiso_Kai_Ni 木曽改二 立绘.png',
                '/images/kancolle/no.147 Верный 中破.png',
                '/images/kancolle/no.147 Верный 立绘.png',
                '/images/kancolle/no.148 Musashi_Kai 武藏改 中破.png',
                '/images/kancolle/no.148 Musashi_Kai 武藏改 立绘.png',
                '/images/kancolle/no.149 Kongou_Kai_Ni 金刚改二 中破.png',
                '/images/kancolle/no.149 Kongou_Kai_Ni 金刚改二 立绘.png',
                '/images/kancolle/no.15 Murakumo 叢雲 中破.png',
                '/images/kancolle/no.15 Murakumo 叢雲 立绘.png',
                '/images/kancolle/no.150 Hiei_Kai_Ni 比叡改二 中破.png',
                '/images/kancolle/no.150 Hiei_Kai_Ni 比叡改二 立绘.png',
                '/images/kancolle/no.151 Haruna_Kai_Ni 榛名改二 中破.png',
                '/images/kancolle/no.151 Haruna_Kai_Ni 榛名改二 立绘.png',
                '/images/kancolle/no.152 Kirishima_Kai_Ni 雾岛改二 中破.png',
                '/images/kancolle/no.152 Kirishima_Kai_Ni 雾岛改二 立绘.png',
                '/images/kancolle/no.153 Taihou 大鳯 中破.png',
                '/images/kancolle/no.153 Taihou 大鳯 立绘.png',
                '/images/kancolle/no.155  I_401 伊401 中破.png',
                '/images/kancolle/no.155  I_401 伊401 立绘.png',
                '/images/kancolle/no.156 Taihou_Kai 大鳯改 中破.png',
                '/images/kancolle/no.156 Taihou_Kai 大鳯改 立绘.png',
                '/images/kancolle/no.157 Ryuujou_Kai_Ni 龍驤改二 中破.png',
                '/images/kancolle/no.157 Ryuujou_Kai_Ni 龍驤改二 立绘.png',
                '/images/kancolle/no.158 Sendai_Kai_Ni 川内改二 中破.png',
                '/images/kancolle/no.158 Sendai_Kai_Ni 川内改二 立绘.png',
                '/images/kancolle/no.159 Jintsuu_Kai_Ni 神通改二 中破.png',
                '/images/kancolle/no.159 Jintsuu_Kai_Ni 神通改二 立绘.png',
                '/images/kancolle/no.16 Isonami 磯波 中破.png',
                '/images/kancolle/no.16 Isonami 磯波 立绘.png',
                '/images/kancolle/no.160 Naka_Kai_Ni 那珂改二 中破.png',
                '/images/kancolle/no.160 Naka_Kai_Ni 那珂改二 立绘.png',
                '/images/kancolle/no.161 Akitsumaru 秋津丸 中破.png',
                '/images/kancolle/no.161 Akitsumaru 秋津丸 立绘.png',
                '/images/kancolle/no.163 Maruyu まるゆ 中破.png',
                '/images/kancolle/no.163 Maruyu まるゆ 立绘.png',
                '/images/kancolle/no.164 Yayoi 弥生 中破.png',
                '/images/kancolle/no.164 Yayoi 弥生 立绘.png',
                '/images/kancolle/no.165 Uzuki 卯月 中破.png',
                '/images/kancolle/no.165 Uzuki 卯月 立绘.png',
                '/images/kancolle/no.165 Uzuki 卯月 中破2.png',
                '/images/kancolle/no.166 Akitsumaru_Kai 秋津丸改 中破.png',
                '/images/kancolle/no.166 Akitsumaru_Kai 秋津丸改 立绘.png',
                '/images/kancolle/no.167 Isokaze 磯風 中破.png',
                '/images/kancolle/no.167 Isokaze 磯風 立绘.png',
                '/images/kancolle/no.168 Urakaze 浦風 中破.png',
                '/images/kancolle/no.168 Urakaze 浦風 立绘.png',
                '/images/kancolle/no.169 Tanikaze 谷風 中破.png',
                '/images/kancolle/no.169 Tanikaze 谷風 立绘.png',
                '/images/kancolle/no.17 Ayanami 綾波 中破.png',
                '/images/kancolle/no.17 Ayanami 綾波 立绘.png',
                '/images/kancolle/no.170 Hamakaze 浜風 中破.png',
                '/images/kancolle/no.170 Hamakaze 浜風 立绘.png',
                '/images/kancolle/no.171 Bismarck 俾斯麦 中破.png',
                '/images/kancolle/no.171 Bismarck 俾斯麦 立绘.png',
                '/images/kancolle/no.172 Bismarck_Kai 俾斯麦改 中破.png',
                '/images/kancolle/no.172 Bismarck_Kai 俾斯麦改 立绘.png',
                '/images/kancolle/no.172 Bismarck_Kai 俾斯麦改.png',
                '/images/kancolle/no.173 Bismarck_Zwei 俾斯麦Zwei 中破.png',
                '/images/kancolle/no.173 Bismarck_Zwei 俾斯麦Zwei 立绘.png',
                '/images/kancolle/no.174 Z1_Leberecht_Maass Z1 中破.png',
                '/images/kancolle/no.174 Z1_Leberecht_Maass Z1 立绘.png',
                '/images/kancolle/no.175 Z3_Max_Schultz Z3 中破.png',
                '/images/kancolle/no.175 Z3_Max_Schultz Z3 立绘.png',
                '/images/kancolle/no.176 Prinz_Eugen 欧根亲王 中破.png',
                '/images/kancolle/no.176 Prinz_Eugen 欧根亲王 立绘.png',
                '/images/kancolle/no.177 Prinz_Eugen_Kai 欧根亲王改 中破.png',
                '/images/kancolle/no.177 Prinz_Eugen_Kai 欧根亲王改 立绘.png',
                '/images/kancolle/no.178 Bismarck_Drei 俾斯麦Drei 中破.png',
                '/images/kancolle/no.178 Bismarck_Drei 俾斯麦Drei 立绘.png',
                '/images/kancolle/no.179 Z1_Zwei_Leberecht_Maass Z1Zwei 中破.png',
                '/images/kancolle/no.179 Z1_Zwei_Leberecht_Maass Z1Zwei 立绘.png',
                '/images/kancolle/no.18 Shikinami 敷波 中破.png',
                '/images/kancolle/no.18 Shikinami 敷波 立绘.png',
                '/images/kancolle/no.180 Z3_Zwei_Max_Schultz Z3Zwei 中破.png',
                '/images/kancolle/no.180 Z3_Zwei_Max_Schultz Z3Zwei 立绘.png',
                '/images/kancolle/no.181 Amatsukaze 天津風 中破.png',
                '/images/kancolle/no.181 Amatsukaze 天津風 立绘.png',
                '/images/kancolle/no.181 Amatsukaze_Kai 天津風改 中破.png',
                '/images/kancolle/no.181 Amatsukaze_Kai 天津風改 立绘.png',
                '/images/kancolle/no.182 Akashi 明石 中破.png',
                '/images/kancolle/no.182 Akashi 明石 立绘.png',
                '/images/kancolle/no.183a Ooyodo 大淀 中破.png',
                '/images/kancolle/no.183a Ooyodo 大淀 立绘.png',
                '/images/kancolle/no.183b Ooyodo_Kai大淀改 中破.png',
                '/images/kancolle/no.183b Ooyodo_Kai大淀改 立绘.png',
                '/images/kancolle/no.184 Taigei 大鯨 中破.png',
                '/images/kancolle/no.184 Taigei 大鯨 立绘.png',
                '/images/kancolle/no.185 Ryuuhou 龍鳯 中破.png',
                '/images/kancolle/no.185 Ryuuhou 龍鳯 立绘.png',
                '/images/kancolle/no.186 Tokitsukaze 時津風 中破.png',
                '/images/kancolle/no.186 Tokitsukaze 時津風 立绘.png',
                '/images/kancolle/no.187 Akashi_Kai 明石改 中破.png',
                '/images/kancolle/no.187 Akashi_Kai 明石改 立绘.png',
                '/images/kancolle/no.188 Tone_Kai_Ni 利根改二 中破.png',
                '/images/kancolle/no.188 Tone_Kai_Ni 利根改二 立绘.png',
                '/images/kancolle/no.189 Chikuma_Kai_Ni 筑摩改二 中破.png',
                '/images/kancolle/no.189 Chikuma_Kai_Ni 筑摩改二 立绘.png',
                '/images/kancolle/no.19 Ooi 大井 中破.png',
                '/images/kancolle/no.19 Ooi 大井 立绘.png',
                '/images/kancolle/no.190 Ryuuhou_Kai 龍鳯改 中破.png',
                '/images/kancolle/no.190 Ryuuhou_Kai 龍鳯改 立绘.png',
                '/images/kancolle/no.191 Myoukou_Kai_Ni 妙高改二 中破.png',
                '/images/kancolle/no.191 Myoukou_Kai_Ni 妙高改二 立绘.png',
                '/images/kancolle/no.194 Haguro_Kai_Ni 羽黑改二 中破.png',
                '/images/kancolle/no.194 Haguro_Kai_Ni 羽黑改二 立绘.png',
                '/images/kancolle/no.195 Ayanami_Kai_Ni 綾波改二 中破.png',
                '/images/kancolle/no.195 Ayanami_Kai_Ni 綾波改二 立绘.png',
                '/images/kancolle/no.196 Hiryuu_Kai_Ni 飛龍改二 中破.png',
                '/images/kancolle/no.196 Hiryuu_Kai_Ni 飛龍改二 立绘.png',
                '/images/kancolle/no.197 Souryuu_Kai_Ni 蒼龍改二 中破.png',
                '/images/kancolle/no.197 Souryuu_Kai_Ni 蒼龍改二 立绘.png',
                '/images/kancolle/no.2 Mutsu 陆奥 中破.png',
                '/images/kancolle/no.2 Mutsu 陆奥 立绘.png',
                '/images/kancolle/no.20 Kitakami 北上 中破.png',
                '/images/kancolle/no.20 Kitakami 北上 立绘.png',
                '/images/kancolle/no.201 Unryuu 雲龍 中破.png',
                '/images/kancolle/no.201 Unryuu 雲龍 立绘.png',
                '/images/kancolle/no.204 Hatsuharu_Kai_Ni 初春改二 中破.png',
                '/images/kancolle/no.204 Hatsuharu_Kai_Ni 初春改二 立绘.png',
                '/images/kancolle/no.205 Harusame 春雨 中破.png',
                '/images/kancolle/no.205 Harusame 春雨 立绘.png',
                '/images/kancolle/no.206 Unryuu_Kai 雲龍改 中破.png',
                '/images/kancolle/no.206 Unryuu_Kai 雲龍改 立绘.png',
                '/images/kancolle/no.207 Ushio_Kai_Ni潮改二 中破.png',
                '/images/kancolle/no.207 Ushio_Kai_Ni潮改二 立绘.png',
                '/images/kancolle/no.208 Junyou_Kai_Ni 隼鷹改二 中破.png',
                '/images/kancolle/no.208 Junyou_Kai_Ni 隼鷹改二 立绘.png',
                '/images/kancolle/no.209 Hayashimo 早霜 中破.png',
                '/images/kancolle/no.209 Hayashimo 早霜 立绘.png',
                '/images/kancolle/no.21 Kongou 金刚 中破.png',
                '/images/kancolle/no.21 Kongou 金刚 立绘.png',
                '/images/kancolle/no.210 Kiyoshimo 清霜 中破.png',
                '/images/kancolle/no.210 Kiyoshimo 清霜 立绘.png',
                '/images/kancolle/no.213 Asagumo 朝雲 中破.png',
                '/images/kancolle/no.213 Asagumo 朝雲 立绘.png',
                '/images/kancolle/no.213 Asagumo_Kai 朝雲改 中破.png',
                '/images/kancolle/no.213 Asagumo_Kai 朝雲改 立绘.png',
                '/images/kancolle/no.215 Nowaki 野分 中破.png',
                '/images/kancolle/no.215 Nowaki 野分 立绘.png',
                '/images/kancolle/no.22 Hiei 比叡 中破.png',
                '/images/kancolle/no.22 Hiei 比叡 立绘.png',
                '/images/kancolle/no.221 Akizuki 秋月 中破.png',
                '/images/kancolle/no.221 Akizuki 秋月 立绘.png',
                '/images/kancolle/no.23 Haruna 榛名 中破.png',
                '/images/kancolle/no.23 Haruna 榛名 立绘.png',
                '/images/kancolle/no.24 Kirishima 雾岛 中破.png',
                '/images/kancolle/no.24 Kirishima 雾岛 立绘.png',
                '/images/kancolle/no.25 Houshou 鳯翔 中破.png',
                '/images/kancolle/no.25 Houshou 鳯翔 立绘.png',
                '/images/kancolle/no.26 Fusou 扶桑 中破.png',
                '/images/kancolle/no.26 Fusou 扶桑 立绘.png',
                '/images/kancolle/no.26 Fusou_Kai 扶桑改 中破.png',
                '/images/kancolle/no.26 Fusou_Kai 扶桑改 立绘.png',
                '/images/kancolle/no.27 Yamashiro 山城 中破.png',
                '/images/kancolle/no.27 Yamashiro 山城 立绘.png',
                '/images/kancolle/no.27 Yamashiro_Kai 山城改 中破.png',
                '/images/kancolle/no.27 Yamashiro_Kai 山城改 立绘.png',
                '/images/kancolle/no.28 Tenryuu 天龍 中破.png',
                '/images/kancolle/no.28 Tenryuu 天龍 立绘.png',
                '/images/kancolle/no.29 Tatsuta 龍田 中破.png',
                '/images/kancolle/no.29 Tatsuta 龍田 立绘.png',
                '/images/kancolle/no.3 Ise 伊势 中破.png',
                '/images/kancolle/no.3 Ise 伊势 立绘.png',
                '/images/kancolle/no.30 Ryuujou 龍驤 中破.png',
                '/images/kancolle/no.30 Ryuujou 龍驤 立绘.png',
                '/images/kancolle/no.30 Ryuujou_Kai 龍驤改-2 中破.png',
                '/images/kancolle/no.30 Ryuujou_Kai 龍驤改-2 立绘.png',
                '/images/kancolle/no.31 Mutsuki 睦月 中破.png',
                '/images/kancolle/no.31 Mutsuki 睦月 立绘.png',
                '/images/kancolle/no.32 Kisaragi 如月 中破.png',
                '/images/kancolle/no.32 Kisaragi 如月 立绘.png',
                '/images/kancolle/no.33 Satsuki 皐月 中破.png',
                '/images/kancolle/no.33 Satsuki 皐月 立绘.png',
                '/images/kancolle/no.34 Fumizuki 文月 中破.png',
                '/images/kancolle/no.34 Fumizuki 文月 立绘.png',
                '/images/kancolle/no.35 Nagatsuki 長月 中破.png',
                '/images/kancolle/no.35 Nagatsuki 長月 立绘.png',
                '/images/kancolle/no.36 Kikuzuki 菊月 中破.png',
                '/images/kancolle/no.36 Kikuzuki 菊月 立绘.png',
                '/images/kancolle/no.37 Mikazuki 三日月 中破.png',
                '/images/kancolle/no.37 Mikazuki 三日月 立绘.png',
                '/images/kancolle/no.38 Mochizuki 望月 中破.png',
                '/images/kancolle/no.38 Mochizuki 望月 立绘.png',
                '/images/kancolle/no.39 Kuma 球磨 中破.png',
                '/images/kancolle/no.39 Kuma 球磨 立绘.png',
                '/images/kancolle/no.4 Hyuuga 日向 中破.png',
                '/images/kancolle/no.4 Hyuuga 日向 立绘.png',
                '/images/kancolle/no.40 Tama 多摩 中破.png',
                '/images/kancolle/no.40 Tama 多摩 立绘.png',
                '/images/kancolle/no.41 Kiso 木曽 中破.png',
                '/images/kancolle/no.41 Kiso 木曽 立绘.png',
                '/images/kancolle/no.42 Nagara 長良 中破.png',
                '/images/kancolle/no.42 Nagara 長良 立绘.png',
                '/images/kancolle/no.42 Nagara 長良 中破改.png',
                '/images/kancolle/no.43 Isuzu 五十鈴 中破.png',
                '/images/kancolle/no.43 Isuzu 五十鈴 立绘.png',
                '/images/kancolle/no.44 Natori 名取 中破.png',
                '/images/kancolle/no.44 Natori 名取 立绘.png',
                '/images/kancolle/no.44 Natori 名取 中破改.png',
                '/images/kancolle/no.45 Yura 由良 中破.png',
                '/images/kancolle/no.45 Yura 由良 立绘.png',
                '/images/kancolle/no.46 Sendai 川内 中破.png',
                '/images/kancolle/no.46 Sendai 川内 立绘.png',
                '/images/kancolle/no.47 Jintsuu 神通 中破.png',
                '/images/kancolle/no.47 Jintsuu 神通 立绘.png',
                '/images/kancolle/no.48 Cristmas_Naka 圣诞那珂 中破.png',
                '/images/kancolle/no.48 Cristmas_Naka 圣诞那珂 立绘.png',
                '/images/kancolle/no.48 Naka 那珂 中破.png',
                '/images/kancolle/no.48 Naka 那珂 立绘.png',
                '/images/kancolle/no.49 Chitose 千歳 中破.png',
                '/images/kancolle/no.49 Chitose 千歳 立绘.png',
                '/images/kancolle/no.5 Yukikaze 雪風 中破.png',
                '/images/kancolle/no.5 Yukikaze 雪風 立绘.png',
                '/images/kancolle/no.50 Chiyoda 千代田 中破.png',
                '/images/kancolle/no.50 Chiyoda 千代田 立绘.png',
                '/images/kancolle/no.51 Mogami 最上 中破.png',
                '/images/kancolle/no.51 Mogami 最上 立绘.png',
                '/images/kancolle/no.52 Furutaka 古鹰 中破.png',
                '/images/kancolle/no.52 Furutaka 古鹰 立绘.png',
                '/images/kancolle/no.53 Kako 加古 中破.png',
                '/images/kancolle/no.53 Kako 加古 立绘.png',
                '/images/kancolle/no.54 Aoba 青葉 中破.png',
                '/images/kancolle/no.54 Aoba 青葉 立绘.png',
                '/images/kancolle/no.55  Myoukou 妙高 中破.png',
                '/images/kancolle/no.55  Myoukou 妙高 立绘.png',
                '/images/kancolle/no.56 Nachi 那智 中破.png',
                '/images/kancolle/no.56 Nachi 那智 立绘.png',
                '/images/kancolle/no.57 Ashigara 足柄 中破.png',
                '/images/kancolle/no.57 Ashigara 足柄 立绘.png',
                '/images/kancolle/no.58 Haguro 羽黑 中破.png',
                '/images/kancolle/no.58 Haguro 羽黑 立绘.png',
                '/images/kancolle/no.59 Takao 高雄 中破.png',
                '/images/kancolle/no.59 Takao 高雄 立绘.png',
                '/images/kancolle/no.6 Akagi 赤城 中破.png',
                '/images/kancolle/no.6 Akagi 赤城 立绘.png',
                '/images/kancolle/no.60 Atago 爱宕 中破.png',
                '/images/kancolle/no.60 Atago 爱宕 立绘.png',
                '/images/kancolle/no.61 Maya 摩耶 中破.png',
                '/images/kancolle/no.61 Maya 摩耶 立绘.png',
                '/images/kancolle/no.62 Choukai 鳥海 中破.png',
                '/images/kancolle/no.62 Choukai 鳥海 立绘.png',
                '/images/kancolle/no.63 Tone 利根 中破.png',
                '/images/kancolle/no.63 Tone 利根 立绘.png',
                '/images/kancolle/no.64 Chikuma 筑摩 中破.png',
                '/images/kancolle/no.64 Chikuma 筑摩 立绘.png',
                '/images/kancolle/no.65 Hiyou 飛鷹 中破.png',
                '/images/kancolle/no.65 Hiyou 飛鷹 立绘.png',
                '/images/kancolle/no.65 Hiyou_Kai 飛鷹改-2 中破.png',
                '/images/kancolle/no.65 Hiyou_Kai 飛鷹改-2 立绘.png',
                '/images/kancolle/no.66 Junyou 隼鷹 中破.png',
                '/images/kancolle/no.66 Junyou 隼鷹 立绘.png',
                '/images/kancolle/no.67 Oboro 朧 中破.png',
                '/images/kancolle/no.67 Oboro 朧 立绘.png',
                '/images/kancolle/no.68 Akebono 曙 中破.png',
                '/images/kancolle/no.68 Akebono 曙 立绘.png',
                '/images/kancolle/no.69 Sazanami 漣 中破.png',
                '/images/kancolle/no.69 Sazanami 漣 立绘.png',
                '/images/kancolle/no.7 Kaga 加賀 中破.png',
                '/images/kancolle/no.7 Kaga 加賀 立绘.png',
                '/images/kancolle/no.70 Ushio 潮 中破.png',
                '/images/kancolle/no.70 Ushio 潮 立绘.png',
                '/images/kancolle/no.71 Akatsuki 暁 中破.png',
                '/images/kancolle/no.71 Akatsuki 暁 立绘.png',
                '/images/kancolle/no.72 Hibiki 響 中破.png',
                '/images/kancolle/no.72 Hibiki 響 立绘.png',
                '/images/kancolle/no.73 Ikazuchi 雷 中破.png',
                '/images/kancolle/no.73 Ikazuchi 雷 立绘.png',
                '/images/kancolle/no.74 Inazuma 電 中破.png',
                '/images/kancolle/no.74 Inazuma 電 立绘.png',
                '/images/kancolle/no.75 Hatsuharu 初春 中破.png',
                '/images/kancolle/no.75 Hatsuharu 初春 立绘.png',
                '/images/kancolle/no.76 Nenohi 子日 中破.png',
                '/images/kancolle/no.76 Nenohi 子日 立绘.png',
                '/images/kancolle/no.77 Wakaba 若葉 中破.png',
                '/images/kancolle/no.77 Wakaba 若葉 立绘.png',
                '/images/kancolle/no.78 Hatsushimo 初霜 中破.png',
                '/images/kancolle/no.78 Hatsushimo 初霜 立绘.png',
                '/images/kancolle/no.79 Shiratsuyu 白露 中破.png',
                '/images/kancolle/no.79 Shiratsuyu 白露 立绘.png',
                '/images/kancolle/no.79 Shiratsuyu_Kai 白露改 中破.png',
                '/images/kancolle/no.79 Shiratsuyu_Kai 白露改 立绘.png',
                '/images/kancolle/no.8 Souryuu 蒼龍 中破.png',
                '/images/kancolle/no.8 Souryuu 蒼龍 立绘.png',
                '/images/kancolle/no.80 Shigure 時雨 中破.png',
                '/images/kancolle/no.80 Shigure 時雨 立绘.png',
                '/images/kancolle/no.81 Murasame 村雨 中破.png',
                '/images/kancolle/no.81 Murasame 村雨 立绘.png',
                '/images/kancolle/no.81 Murasame_Kai 村雨改 中破.png',
                '/images/kancolle/no.81 Murasame_Kai 村雨改 立绘.png',
                '/images/kancolle/no.82 Yuudaichi 夕立 中破.png',
                '/images/kancolle/no.82 Yuudaichi 夕立 立绘.png',
                '/images/kancolle/no.83 Samidare 五月雨 中破.png',
                '/images/kancolle/no.83 Samidare 五月雨 立绘.png',
                '/images/kancolle/no.84 Suzukaze 涼风 中破.png',
                '/images/kancolle/no.84 Suzukaze 涼风 立绘.png',
                '/images/kancolle/no.85 Asashio 朝潮 中破.png',
                '/images/kancolle/no.85 Asashio 朝潮 立绘.png',
                '/images/kancolle/no.86 Ooshio 大潮 中破.png',
                '/images/kancolle/no.86 Ooshio 大潮 立绘.png',
                '/images/kancolle/no.87 Michishio 満潮 中破.png',
                '/images/kancolle/no.87 Michishio 満潮 立绘.png',
                '/images/kancolle/no.88 Arashio 荒潮 中破.png',
                '/images/kancolle/no.88 Arashio 荒潮 立绘.png',
                '/images/kancolle/no.89 Arare 霰 中破.png',
                '/images/kancolle/no.89 Arare 霰 立绘.png',
                '/images/kancolle/no.9 Hiryuu 飛龍 中破.png',
                '/images/kancolle/no.9 Hiryuu 飛龍 立绘.png',
                '/images/kancolle/no.90 Kasumi 霞 中破.png',
                '/images/kancolle/no.90 Kasumi 霞 立绘.png',
                '/images/kancolle/no.91 Kagerou 陽炎 中破.png',
                '/images/kancolle/no.91 Kagerou 陽炎 立绘.png',
                '/images/kancolle/no.92 Shiranui 不知火 中破.png',
                '/images/kancolle/no.92 Shiranui 不知火 立绘.png',
                '/images/kancolle/no.93 Kuroshio 黑潮 中破.png',
                '/images/kancolle/no.93 Kuroshio 黑潮 立绘.png',
                '/images/kancolle/no.94 Shouhou 祥鳯 中破.png',
                '/images/kancolle/no.94 Shouhou 祥鳯 立绘.png',
                '/images/kancolle/no.95 Chitose_Kai 千歳改 中破.png',
                '/images/kancolle/no.95 Chitose_Kai 千歳改 立绘.png',
                '/images/kancolle/no.96 Chiyoda_Kai 千代田改 中破.png',
                '/images/kancolle/no.96 Chiyoda_Kai 千代田改 立绘.png',
                '/images/kancolle/no.97 Ooi_Kai 大井改 中破.png',
                '/images/kancolle/no.97 Ooi_Kai 大井改 立绘.png',
                '/images/kancolle/no.98 Kitakami_Kai 北上改 中破.png',
                '/images/kancolle/no.98 Kitakami_Kai 北上改 立绘.png',
                '/images/kancolle/no.99 Chitose_A 千歳甲 中破.png',
                '/images/kancolle/no.99 Chitose_A 千歳甲 立绘.png',
                '/images/kancolle/NPC 給糧艦 Irako 伊良湖.png',
                '/images/kancolle/NPC 給糧艦 Mamiya 間宮.png',
                '/images/kancolle/NPC 道具屋 Premiumshop 明石.png'
                ]
    };

    $.ukagaka.talking = [];
    $.ukagaka.talkValid = true;
    $.ukagaka.nextText = '';
    $.ukagaka.nowText = '';

})(jQuery);
