var App = function () {
    EventEmitter.call(this);


    App.instance = this;

    this.version = '1.2';

    this.dt = 0;
    this.et = 0;
    this.etTime = new Date().getTime();
    this.fps = 60;

    this.audioState = 'on';
    this.isMuteByPlayer = false;
    this.isMuteByWindow = false;

    this.gameFocus = true;

    this.forUpdate = [];

    this.mouse = {x: 0, y: 0};

    this.resizeCounter = 0;
};
App.prototype = Object.create(EventEmitter.prototype);
App.prototype.constructor = App;

App.prototype.init = function () {
    // console.log('App: Init!');

    //console.log(loader.resources);
    interaction.addListener('mousemove', function (data) {
        app.mouse = data.data.global;
    });
    interaction.addListener('touchmove', function (data) {
        app.mouse = data.data.global;
    });
    // interaction.addListener('pointerdown', function(data)
    // {
    //   console.log(data);
    // });

    guiManager.emit('game_resize', {width: guiManager.rootScene.width, height: guiManager.rootScene.height});

    this.isMobile = false; //initiate as false
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
        || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) this.isMobile = true;
    // console.log('IsMobile:', this.isMobile);

    this.gameData =
        {
            settings:
                {
                    fieldWidth: 10,
                    fieldHeight: 10,
                    wordsCount: 12,

                    dificult: null,
                    category: null,
                    timeMode: false,
                    hideWords: false,

                    // baseTime: 120,
                    // bonusTime: 10
                },

            gamePlayed: 0,

            tutorials:
                {
                    easy: false,
                    medium: false,
                    hard: false,
                    maniac: false
                },
            baseTime: // As Seconds
                {
                    easy: 120,
                    medium: 120,
                    hard: 120,
                    maniac: 120
                },
            bonusTime: // As Seconds
                {
                    easy: 10,
                    medium: 10,
                    hard: 10,
                    maniac: 10
                },

            categoryFromURL: null,
            wasOpenedCategoryFromURLFirstTimeAlready: false,

            categoryFromStorage: null,
            difficultyFromStorage: null,
            languageFromStorage: null,

        }

    /*
    // Init Words List
    this.gameData.wordsListData = assetsManager.loader.resources['words_list'].data;
    this.gameData.wordsList = this.gameData.wordsListData.split('\n');
    for(var i = 0; i < this.gameData.wordsList.length; i++)
    {
      var exp = /\W/g;
      this.gameData.wordsList[i] = this.gameData.wordsList[i].replace(exp, '').toUpperCase();
      // console.log(this.gameData.wordsList[i])
    }*/


    var gameSettings = assetsManager.loader.resources['game_settings'].data;
    app.gameData.baseTime = gameSettings.baseTime;
    app.gameData.bonusTime = gameSettings.bonusTime;


    var gameplayConfig = Config.getInstance().data.gameplay;

    app.gameData.settings.fieldWidth =  gameplayConfig.reels;
    app.gameData.settings.fieldHeight = gameplayConfig.rows;
    app.gameData.settings.wordsCount = gameplayConfig.wordsNumber;

    //load menu state (difficulty, language, category) from local storage
    this.loadMenuStateFromStorage();

    //load category from URL if exists
    this.loadCategoryFromURL();

    //try to set lang loaded from storage
    if (app.gameData.languageFromStorage && !app.gameData.categoryFromURL) {
        Config.getInstance().setLanguage(app.gameData.languageFromStorage);
    }

    // console.log(app.gameData.baseTime, gameSettings.baseTime);

    // this.save();
    this.load();

    // this.panelWhiteBg = new Gui.BasePanel({parentPanel: guiManager.rootScene});
    this.alignContainer = new Gui.BasePanel({
        parentPanel: guiManager.rootScene,
        positionType: 'center-center',
        x: 0,
        y: 0
    });
    this.gameContainer = new Gui.BasePanel({
        parentPanel: this.alignContainer,
        positionType: 'left-center',
        xRelative: 0,
        yRelative: 0
    });

    this.initBg();

    this.screenMainMenu = new ScreenMainMenu({name: 'screen_main_menu', parentPanel: this.gameContainer});
    this.screenGame = new ScreenGame({name: 'screen_game', parentPanel: this.gameContainer}); 
    
    if (app.gameData.difficultyFromStorage) {
        const menu = this.screenMainMenu.panelDificulty.menu;
        let segment = menu.segments.find(s => s.name === app.gameData.difficultyFromStorage);
        if (segment) {
            menu.switchTo(segment);
        }
    }

    /* this.buttonAudio = new Gui.ButtonAudio({
        name: 'button_audio',
        parentPanel: guiManager.rootScene,
        width: 83*TEXTURE_UPSIZER,
        height: 83*TEXTURE_UPSIZER,
        positionType: 'left-bot',
        xRelative: 10*TEXTURE_UPSIZER,
        yRelative: -10*TEXTURE_UPSIZER
    }); */

    // this.field = new Field({name: 'field', parentPanel: guiManager.rootScene});

    this.screenMainMenu.onOrientationChange({orientation: guiManager.orientation})
    this.screenGame.onOrientationChange({orientation: guiManager.orientation})

    this.screenMainMenu.tween({name: 'show'});

    this.whiteOver = new PIXI.Sprite(assetsManager.getTexture('atlas', 'white_rect.png'));
    guiManager.rootScene.addChild(this.whiteOver);
    this.whiteOver.width = this.whiteOver.height = 3000*TEXTURE_UPSIZER;
    this.whiteOver.anchor.set(0.5, 0.5);
    this.whiteOver.visible = false;
    this.whiteOver.interactive = true;
        
    this.onOrientationChange()

    function enableCanvasTouchAction() {
        //preventDefault
        var canvas = document.querySelector('#game > canvas');
        if (canvas) {
            canvas.style.touchAction = '';
        } else {
            setTimeout(enableCanvasTouchAction, 100);
        }
    }
    enableCanvasTouchAction();
};

/**
* get value of a param in url
*/
App.prototype.getParameterByName = function(paramName, url) {
    if (!url) url = window.location.href;
    paramName = paramName.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + paramName + "(=([^&#]*)|&|#|$)");
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
};

App.prototype.loadCategoryFromURL = function () {
    let _category = this.getParameterByName('c');
    if (_category) {
        _category = _category.replaceAll('%20', ' ');
        const foundCategory = Config.getInstance().getCategoriesList().map(c => c.name).find(categoryName => categoryName.toLowerCase() === _category.toLowerCase());
        app.gameData.categoryFromURL = foundCategory;
    }
};

App.prototype.initBg = function () {
    this.alarmBg = new PIXI.Sprite(assetsManager.getTexture('atlas', 'alarm_background.png'));
    guiManager.rootScene.addChildAt(this.alarmBg, 0);
    this.alarmBg.anchor.set(0.5, 0.5);
    this.alarmBg.width = this.alarmBg.height = 4000*TEXTURE_UPSIZER;
    this.alarmBg.alpha = 0;

    this._bgSize = 1120*TEXTURE_UPSIZER;
    Object.defineProperty(this, 'bgSize',
        {
            set: function (value) {
                this._bgSize = value;
                this.updateBg();
            },
            get: function () {
                return this._bgSize;
            }
        });

    this.containerBg = new PIXI.Container();
    this.gameContainer.addChild(this.containerBg);
    // this.containerBg.y = -500;

    this.bgWhite = new PIXI.Sprite(assetsManager.getTexture('atlas', 'white_rect.png'));
    this.containerBg.addChild(this.bgWhite);
    this.bgWhite.width = this.bgWhite.height = 1000*TEXTURE_UPSIZER;
    this.bgWhite.anchor.set(0.5, 0.5);

    this.whiteBorder = new PIXI.Sprite(assetsManager.getTexture('atlas', 'white_border.png'));
    this.containerBg.addChild(this.whiteBorder);
    this.whiteBorder.anchor.set(0.5, 0.0);

    this.whiteBorder2 = new PIXI.Sprite(assetsManager.getTexture('atlas', 'white_border.png'));
    this.containerBg.addChild(this.whiteBorder2);
    this.whiteBorder2.anchor.set(0.5, 0.0);
    this.whiteBorder2.scale.y = -1;

    guiManager.on('orientation_change', this.onOrientationChange, this);
    this.onOrientationChange({orientation: guiManager.orientation});
}

App.prototype.apiCallback = function (name, data) {
    // console.log('Api:', name, data);
    if (name == 'statistics') {
        var statistics = '';

        var dificult = app.gameData.settings.dificult;
        var clockMode = app.gameData.settings.timeMode;
        var hideWords = app.gameData.settings.hideWords;
        var result = data.result;


        var category = data.category;
        if (app.gameData.settings.category.name == Config.getInstance().getLocalizedText('random')) category += '-Random';

        if (dificult == 'easy') statistics += '0';
        else if (dificult == 'medium') statistics += '1';
        else if (dificult == 'hard') statistics += '2';
        else if (dificult == 'maniac') statistics += '3';

        if (clockMode) statistics += '1';
        else statistics += '0';

        if (hideWords) statistics += '1';
        else statistics += '0';

        statistics += result;

        // statistics += gamePlayed;

        statistics += ':' + category;

        /* console.log("Submitting stats: ", statistics, '...');

        if (parent && parent.cmgDataEvent) {
            try {
                parent.cmgDataEvent("data", statistics);
            } catch (e) {
                console.log("cmgDataEvent: data was not submitted due to internal API error", e);
            }
        } */

        return;
    }

    if (name == 'start' || name == 'replay') {
        var gamePlayed = app.gameData.gamePlayed;
        if (gamePlayed == undefined || gamePlayed < 0) gamePlayed = 0;

        if (gamePlayed < 10) gamePlayed = '000' + gamePlayed;
        else if (gamePlayed < 100) gamePlayed = '00' + gamePlayed;
        else if (gamePlayed < 1000) gamePlayed = '0' + gamePlayed;
        else if (gamePlayed > 9999) gamePlayed = '9999';

        data = '' + gamePlayed;
    }

    /* if (parent && parent.cmgGameEvent) {
        try {
            if (data != null && data != undefined) {
                parent.cmgGameEvent(name, data);
            } else {
                parent.cmgGameEvent(name);
            }
        } catch (e) {
            console.log("cmgGameEvent: game event '" + name + "' was not submitted due to internal API error", e);
        }
    } */
}

App.prototype.updateBg = function () {
    this.bgWhite.height = this.bgSize;
    this.whiteBorder.y = this.bgSize / 2 - 2*TEXTURE_UPSIZER;
    this.whiteBorder2.y = -this.bgSize / 2 + 2*TEXTURE_UPSIZER;

    var shiftY = this.gameContainer.height - this.bgSize;
    if (guiManager.orientation == 'portrait') {
        this.containerBg.scale.set(0.96, 0.96);

        this.containerBg.y = -shiftY / 2;
        this.containerBg.y += 40;
    } else {
        this.containerBg.scale.set(0.96, 0.9);

        this.containerBg.y = -shiftY / 2 + 98*TEXTURE_UPSIZER;
        // this.containerBg.y += 20;
    }
}

App.prototype.showAlarm = function (dir, delay) {
    var self = this;

    this.alarmTween = TweenMax.to(this.alarmBg, 10 / 30, {
        alpha: 1, ease: Power2.easeOut, onComplete: function () {
            self.alarmTween = TweenMax.to(self.alarmBg, 10 / 30, {
                alpha: 0, ease: Power2.easeOut, onComplete: function () {

                }
            });
        }
    });
}

App.prototype.hideAlarm = function () {
    if (this.alarmTween == null) return;

    this.alarmTween.kill();
    this.alarmTween = null;

    TweenMax.to(this.alarmBg, 10 / 30, {alpha: 0, ease: Power2.easeOut});
}

App.prototype.getBaseTime = function (dificult, hideTheWords) {
    var seconds;
    if (hideTheWords) seconds = app.gameData.baseTime[dificult].hideTheWordsON;
    else seconds = app.gameData.baseTime[dificult].hideTheWordsOFF;

    return seconds;
}
App.prototype.getBonusTime = function (dificult, hideTheWords) {
    var seconds;
    if (hideTheWords) seconds = app.gameData.bonusTime[dificult].hideTheWordsON;
    else seconds = app.gameData.bonusTime[dificult].hideTheWordsOFF;

    return seconds;
}

App.prototype.onOrientationChange = function (data) {
    var orientation = data?.orientation || guiManager?.orientation;

    let _scaleGameContainer = 1;

    if (orientation == 'portrait') {
        this.alignContainer.sizeType = 'relative';
        this.alignContainer.widthRelative = this.alignContainer.heightRelative = 1.0;

        // this.containerBg.x = 0;
        // this.containerBg.y = 0;
        this.containerBg.rotation = 0 * Util.TO_RADIANS;

        // this.gameContainer.x = 0;
        // this.gameContainer.y = 0;
        this.gameContainer.xRelative = 0;
        this.gameContainer.yRelative = -100*TEXTURE_UPSIZER;
        this.gameContainer.width = 1000*TEXTURE_UPSIZER;
        this.gameContainer.height = 1000*TEXTURE_UPSIZER;

        // this.whiteBorder2.visible = false;

        const apect = renderer.width/renderer.height;

        if (app.screenGame && app.screenGame.state == 'hide') app.bgSize = /*1220*/1120*TEXTURE_UPSIZER;
        else if (app.screenGame && app.screenGame.state == 'show') app.bgSize = /*10000*/900*TEXTURE_UPSIZER;

        if (app.screenGame && app.screenGame.state.indexOf('hide') >= 0) {
            if (apect > 0.64 && apect < 1) {
                _scaleGameContainer = 0.9;
                this.gameContainer.positionType = 'top-center';
            } else {
                this.gameContainer.positionType = 'left-center';
            }
        } else if (app.screenGame && app.screenGame.state.indexOf('show') >= 0) {
            if (apect > 0.64 && apect < 1) {
                _scaleGameContainer = 0.9;
                this.gameContainer.positionType = 'center-bot';
                this.gameContainer.yRelative = -50*TEXTURE_UPSIZER;
            } else {
                this.gameContainer.positionType = 'center-bot';
                this.gameContainer.yRelative = -100*TEXTURE_UPSIZER;
            }
        }
    }
    if (orientation == 'landscape') {

        app.bgSize = 800*TEXTURE_UPSIZER;

        this.whiteBorder2.visible = true;
        // this.bgSize = 800;

        this.alignContainer.sizeType = 'absolute';
        this.alignContainer.width = this.alignContainer.height = 1000*TEXTURE_UPSIZER;
        if (app.screenMainMenu && app.screenMainMenu.state == 'hide') this.alignContainer.width = 1350*TEXTURE_UPSIZER;

        // this.containerBg.x = 0;
        // this.containerBg.y = 0;
        this.containerBg.rotation = -90 * Util.TO_RADIANS;

        // this.whiteBorder.visible = false;

        this.gameContainer.positionType = 'left-center';
        // this.gameContainer.x = -200;
        // this.gameContainer.y = 0;
        this.gameContainer.xRelative = 0;
        this.gameContainer.yRelative = 0;
        this.gameContainer.width = 1000*TEXTURE_UPSIZER;
        this.gameContainer.height = 1000*TEXTURE_UPSIZER;
    }

    this.gameContainer.scale.set(_scaleGameContainer, _scaleGameContainer);

    this.updateBg();
}

App.prototype.gameEnd = function (type, category) {
    var isTimeMode = app.gameData.settings.timeMode;
    if (type == 'win') {
        // console.log('Game Win!', category);

        if (isTimeMode) {
            // app.gameData.streaks[app.gameData.settings.dificult].current ++;
            // if(app.gameData.streaks[app.gameData.settings.dificult].current > app.gameData.streaks[app.gameData.settings.dificult].best) app.gameData.streaks[app.gameData.settings.dificult].best = app.gameData.streaks[app.gameData.settings.dificult].current;
        }

        category.completeData[app.gameData.settings.dificult] = true;
        // app.gameData.completeData[app.gameData.settings.dificult].push(category.name);
    } else if (type == 'lose') {
        // console.log('Game Lose!', category);

        if (isTimeMode) {
            // app.gameData.streaks[app.gameData.settings.dificult].current = 0;
        }
    }

    app.gameData.gamePlayed++;

    app.save();
}
App.prototype.saveMenuStateToStorage = function () {
    var data = {};
    if (app?.gameData?.settings?.category?.name) data["category"] = app.gameData.settings.category.name;
    if (app?.gameData?.settings?.dificult) data["difficulty"] = app.gameData.settings.dificult;
    data["language"] = Config.getInstance().getCurrentLanguage();
    
    var jsonString = JSON.stringify(data);

    localStorage.setItem('word_search_menu_state', jsonString);

};
App.prototype.loadMenuStateFromStorage = function () {
    var data = localStorage.getItem('word_search_menu_state');
    data = JSON.parse(data);
    if (!data) return;

    if (data.difficulty) app.gameData.difficultyFromStorage = data.difficulty;
    if (data.language) app.gameData.languageFromStorage = data.language;
    if (data.category) app.gameData.categoryFromStorage = data.category;

};
App.prototype.save = function () {
    // var data = app.gameData.scores;
    var data =
        {
            version: app.version,
            tutorials: app.gameData.tutorials,
            gamePlayed: app.gameData.gamePlayed,
            // streaks: app.gameData.streaks,

            completeData: []
        }

    const languageCodes = Config.getInstance().getLanguagesList();

    for (let i = 0; i < languageCodes.length; i++) {
        const languageCode = languageCodes[i];
        const languageSaveData = {language: languageCode, completeData: []};

        const categoriesList = Config.getInstance().getCategoriesList(languageCode);
        categoriesList.forEach(category => {
            languageSaveData.completeData.push(Object.assign({name: category.name}, category.completeData))
        })
        data.completeData.push(languageSaveData);
    }

    var jsonString = JSON.stringify(data);

    localStorage.setItem('word_search_multilingual_save', jsonString);

    // console.log('Save!', data);
}
App.prototype.load = function () {
    var data = localStorage.getItem('word_search_multilingual_save');
    if (data == undefined || data == null) data = null;
    if (data != null) {
        data = JSON.parse(data);
        if (data.version != app.version) data = null;
    }

    if (data == null) {
        app.save();
        data = localStorage.getItem('word_search_multilingual_save');
        data = JSON.parse(data);
    }

    app.gameData.tutorials = data.tutorials;
    app.gameData.gamePlayed = data.gamePlayed;

    for (let i = 0; i < data.completeData.length; i++) {
        const languageSave = data.completeData[i];
        languageSave.completeData.forEach(line => {
            Config.getInstance().setCompleteData(languageSave.language, line.name, line.easy, line.medium, line.hard, line.maniac);
        })
    }
}

App.prototype.focusChange = function (focus) {
    if (this.gameFocus == focus) return;

    this.gameFocus = focus;

    if (this.gameFocus) {
        this.isMuteByWindow = false;
    } else {
        this.isMuteByWindow = true;
    }

    this.checkAudioMute();
}

App.prototype.createMusic = function (name) {
    var audio = constsManager.getData('audio_info/audio/' + name);
    var id = audio.play();

    audio.loop(true, id);
    // audio.volume(0.2, id);

    var music = {audio: audio, id: id, name: name, _volume: 1};

    Object.defineProperty(music, 'volume',
        {
            set: function (value) {
                music._volume = value;
                music.audio.volume(music._volume, music.id);
            },
            get: function () {
                return music._volume;
            }
        });

    return music;
}

App.prototype.setMusic = function (name) {
    var self = this;

    // console.log('set music:', name);

    var nextMusic = name == 'music_battle' ? this.musicBattle : this.musicMenu;

    if (this.currentMusic == null) {
        this.currentMusic = nextMusic;
        this.currentMusic.volume = 0;
        TweenMax.to(this.currentMusic, 5, {volume: 1});
    } else {
        TweenMax.to(this.currentMusic, 1, {
            volume: 0, onComplete: function () {
                self.currentMusic = nextMusic;
                self.currentMusic.volume = 0;
                TweenMax.to(self.currentMusic, 1, {volume: 1});
            }
        });
    }
}

App.prototype.playAudio = function (dir, name) {
    var audio = constsManager.getData('audio_info/audio/' + name);
    if(audio) {
        audio.play();
    }
}
App.prototype.setAudioState = function (state) {
    if (this.audioState == state) return;

    this.audioState = state;

    if (state == 'on') {
        this.isMuteByPlayer = false;
    } else if (state == 'off') {
        this.isMuteByPlayer = true;
    }

    this.checkAudioMute();
}
App.prototype.checkAudioMute = function () {
    var isMute = this.isMuteByPlayer || this.isMuteByWindow;

    // console.log(isMute);

    var audios = constsManager.getData('audio_info/audio');
    for (var key in audios) {
        var audio = audios[key];
        audio.mute(isMute);
    }
}

App.prototype.addForUpdate = function (f, context) {
    if (context == undefined) context = null;
    this.forUpdate.push({f: f, context: context});
}

App.prototype.update = function () {
    for (var i = 0; i < this.forUpdate.length; i++) {
        if (this.forUpdate[i].context != null) this.forUpdate[i].f.call(this.forUpdate[i].context);
        else this.forUpdate[i].f();
    }
};

App.prototype.loop = function (time) {
    requestAnimationFrame(app.loop);

    var now = new Date().getTime();
    this.et = (now - this.etTime) * 0.001;
    this.etTime = now;

    app.update();

    renderer.render(stage);

    if (app.resizeCounter == 0) {        
        app.resizeCounter = 30;
        if (guiManager.orientation != app.prevOrientation) {
            app.prevOrientation = guiManager.orientation;
            resize();
        }
    } else if (app.resizeCounter > 0) app.resizeCounter--;
};

App.instance = null;
App.getInstance = function () {
    return App.instance;
};
//=========================================================================================================================================================================//
