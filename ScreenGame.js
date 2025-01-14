var ScreenGame = function (config) {
    config.sizeType = 'relative';
    config.widthRelative = 1;
    config.heightRelative = 1;
    Gui.BasePanel.call(this, config);


    var self = this;

    this.initBlockInputBg(1000*TEXTURE_UPSIZER, 1000*TEXTURE_UPSIZER, function () {
        // self.toMainMenu();
    });
    this.invisibleBg.interactive = false;

    this.state = 'hide';
    this.visible = false;
    this.interactiveChildren = false;
    this.gameState = 'none';

    this.field = new Field({name: 'panel_field', parentPanel: this, y: 10});
    app.field = this.field;

    this.field.on('word_open', function (data) {
        var wordData = data.wordData;

        for (var i = 0; i < this.panelWords.wordPanels.length; i++) {
            var wordPanel = this.panelWords.wordPanels[i];
            if (wordPanel.wordData == wordData) wordPanel.openWord();
        }

        if (app.gameData.settings.timeMode && data.notOpenWordsCount > 0) {
            var seconds = app.getBonusTime(app.gameData.settings.dificult, app.gameData.settings.hideWords);
            this.panelTime.addTime(seconds);
            this.field.showTimePopup(data.cellStart, data.cellEnd, seconds);
        }

        app.playAudio('sounds', 'sound_selected_word');

    }, this);
    this.field.on('word_reveal', function (wordData) {
        for (var i = 0; i < this.panelWords.wordPanels.length; i++) {
            var wordPanel = this.panelWords.wordPanels[i];
            if (wordPanel.wordData == wordData) wordPanel.revealWord();
        }
    }, this);
    this.field.on('field_complete', function () {
        this.solved();
    }, this);

    this.panelWords = new PanelWords({name: 'panel_words', parentPanel: this});
    this.panelTime = new PanelTime({name: 'panel_time', parentPanel: this.panelWords});
    this.panelTime.on('times_up', function () {
        this.timesUp();
    }, this);

    this.title = Util.setParams(new Gui.Text('None', constsManager.getData('text_configs/field_title_text')), {
        parent: this,
        aX: 0.5,
        aY: 0.5,
        x: 0,
        y: -425*TEXTURE_UPSIZER
    });

    /* this.buttonSurrender = Gui.createSimpleButton({
            name: 'button_surrender',
            parentPanel: this,
            width: 120*TEXTURE_UPSIZER,
            height: 120*TEXTURE_UPSIZER,
            x: 415*TEXTURE_UPSIZER,
            y: -420*TEXTURE_UPSIZER
        },
        // this.buttonSurrender = Gui.createSimpleButton({name: 'button_surrender', parentPanel: guiManager.rootScene, width: 120, height: 120, positionType: 'right-bot', xRelative: -10, yRelative: -10},
        {
            pathToSkin: 'button_surrender.png',
            onClick: function () {
                if (self.state != 'show') return;

                self.panelSurrender.tween({name: 'show_anim'});
            }
        });
    this.buttonSurrender.visible = false; */

    this.buttonReplay = Gui.createSimpleButton({
            name: 'button_replay',
            parentPanel: this,
            width: 120*TEXTURE_UPSIZER,
            height: 120*TEXTURE_UPSIZER,
            x: 415*TEXTURE_UPSIZER,
            y: -420*TEXTURE_UPSIZER
        },
        {
            pathToSkin: 'button_replay_circle.png',
            onClick: function () {
                if (self.state != 'show' || self.gameState != 'game_end') return;

                self.replay();

                app.playAudio('sounds', 'sound_play_button');

                app.apiCallback('replay');
            }
        });
    this.buttonReplay.isClickSound = false;
    this.buttonReplay.visible = false;

    this.buttonHome = Gui.createSimpleButton({
            name: 'button_home',
            parentPanel: this,
            width: 120*TEXTURE_UPSIZER,
            height: 120*TEXTURE_UPSIZER,
            x: -415*TEXTURE_UPSIZER,
            y: -420*TEXTURE_UPSIZER
        },
        {
            pathToSkin: 'button_home_menu.png',
            onClick: function () {
                if (self.state != 'show' || self.field.state != 'normal' || self.gameState == 'waating_game_end') return;

                if (self.gameState == 'game_end') self.toMainMenu();
                else self.panelInGameMenu.tween({name: 'show_anim'});
            }
        });

    this.panelSolved = new PanelSolved({parentPanel: this});
    this.panelSolvedByTime = new PanelSolvedByTime({parentPanel: this});
    // this.panelLeave = new PanelLeave({parentPanel: this});
    this.panelInGameMenu = new PanelInGameMenu({parentPanel: this});
    this.panelSurrender = new PanelSurrender({parentPanel: this});
    this.panelTimesUp = new PanelTimesUp({parentPanel: this});
    this.panelHelpDificult = new PanelHelpDirections({parentPanel: this});

    guiManager.on('orientation_change', this.onOrientationChange, this);
    // this.onOrientationChange({orientation: guiManager.orientation});
}
ScreenGame.prototype = Object.create(Gui.BasePanel.prototype);
ScreenGame.prototype.constructor = ScreenGame;

ScreenGame.prototype.initGame = function (blockedWords) {
    if (app.gameData.settings.timeMode) {
        var seconds = app.getBaseTime(app.gameData.settings.dificult, app.gameData.settings.hideWords);

        this.panelTime.initTimer(seconds);
    }

    var directions = [];
    if (app.gameData.settings.dificult == 'easy') directions = ['down', 'right'];
    if (app.gameData.settings.dificult == 'medium') directions = ['down', 'right', 'down_right', 'up_right'];
    if (app.gameData.settings.dificult == 'hard' || app.gameData.settings.dificult == 'maniac') directions = ['down', 'right', 'up', 'left', 'down_right', 'down_left', 'up_right', 'up_left'];


    var category = app.gameData.settings.category;
    if (category.name === Config.getInstance().getLocalizedText('random')) {
        const categories = Config.getInstance().getCategoriesList();
        category = categories[Util.randomRangeInt(1, categories.length - 1)];
    }

    this.category = category;
    var fieldData = new FieldData(app.gameData.settings.fieldWidth, app.gameData.settings.fieldHeight, app.gameData.settings.wordsCount, category.wordsList, directions, blockedWords);
    this.field.initField(fieldData);

    this.panelWords.initWords(fieldData.words);
    this.panelWords.updateWordsPosition();

    // console.log(app.gameData.settings.timeMode);
    // if(app.gameData.settings.timeMode)
    // else this.panelTime.visible = false;

    this.title.text = category.name;

    // this.field.interactive = true;
    this.field.interactiveChildren = true;


    /* if (this.state == 'show') {
        this.buttonSurrender.visible = true;
        this.buttonSurrender.alpha = 1;
    }
    this.buttonSurrender.scale.x = this.buttonSurrender.scale.y = 1; */

    this.buttonReplay.visible = false;
    this.buttonReplay.scale.x = this.buttonReplay.scale.y = 1.0;

    // this.buttonHome.visible = false;

    this.invisibleBg.interactive = false;

    this.gameState = 'game';
}
ScreenGame.prototype.replay = function (isBlockWords) {
    var self = this;

    if (isBlockWords == undefined) isBlockWords = false;

    var blockedWords = [];
    if (isBlockWords) {
        for (var i = 0; i < this.field.fieldData.words.length; i++) blockedWords.push(this.field.fieldData.words[i].word);
    }

    app.whiteOver.visible = true;
    app.whiteOver.alpha = 0;
    TweenMax.to(app.whiteOver, 5 / 30, {
        alpha: 1, ease: Power2.easeOut, onComplete: function () {
            self.clear();
            self.initGame(blockedWords);
            TweenMax.to(app.whiteOver, 5 / 30, {
                alpha: 0, ease: Power2.easeOut, onComplete: function () {
                    app.whiteOver.visible = false;

                    if (app.gameData.settings.timeMode) self.panelTime.activate();
                }
            });
        }
    });
}

ScreenGame.prototype.surrender = function () {
    var self = this;

    app.gameEnd('lose', this.category);
    this.gameState = 'game_end';

    app.hideAlarm();

    if (app.gameData.settings.timeMode) this.panelTime.pause();

    this.field.interactiveChildren = false;
    this.field.endSelecting(null);

    /* TweenMax.to(this.buttonSurrender, 8 / 30, {
        alpha: 0, pixi: {scaleX: 0.7, scaleY: 0.7}, ease: Power2.easeOut, onComplete: function () {
            self.buttonSurrender.visible = false;

            // self.buttonHome.visible = true;
            // self.buttonHome.alpha = 0;
            // self.buttonHome.scale.x = self.buttonHome.scale.y = 0.7;
            // TweenMax.to(self.buttonHome, 8/30, {alpha: 1, pixi: {scaleX: 1.0, scaleY: 1.0}, ease: Power2.easeOut, onComplete: function()
            // {

            // }});
        }
    }); */

    TweenMax.delayedCall(8 / 30, function () {
        self.field.revealWords(function () {
            self.invisibleBg.interactive = true;
            TweenMax.delayedCall(5 / 30, function () {
                app.screenGame.showReplayButton();
            });
        });
    });

    app.apiCallback('statistics', {result: 1, category: app.screenGame.category.name});
}

ScreenGame.prototype.solved = function () {
    var self = this;

    app.gameEnd('win', this.category);
    this.gameState = 'game_end';

    this.field.interactiveChildren = false;
    this.field.endSelecting(null);

    app.hideAlarm();

    if (app.gameData.settings.timeMode) this.panelTime.pause();

    /* TweenMax.to(this.buttonSurrender, 8 / 30, {
        alpha: 0, pixi: {scaleX: 0.7, scaleY: 0.7}, ease: Power2.easeOut, onComplete: function () {
            self.buttonSurrender.visible = false;
        }
    }); */

    TweenMax.delayedCall(20 / 30, function () {
        if (!app.gameData.settings.timeMode) self.panelSolved.tween({name: 'show_anim'});
        else self.panelSolvedByTime.tween({name: 'show_anim'});
    });

    app.playAudio('sounds', 'sound_solved');

    app.apiCallback('statistics', {result: 0, category: app.screenGame.category.name});
}

ScreenGame.prototype.timesUp = function () {
    var self = this;

    // this.panelTimesUp.tween({name: 'show_anim'});

    app.gameEnd('lose', this.category);
    this.gameState = 'waating_game_end';
    // this.field.interactive = false;
    this.field.interactiveChildren = false;
    this.field.endSelecting(null);

    /* TweenMax.to(this.buttonSurrender, 8 / 30, {
        alpha: 0, pixi: {scaleX: 0.7, scaleY: 0.7}, ease: Power2.easeOut, onComplete: function () {
            self.buttonSurrender.visible = false;

            // self.buttonHome.visible = true;
            // self.buttonHome.alpha = 0;
            // self.buttonHome.scale.x = self.buttonHome.scale.y = 0.7;
            // TweenMax.to(self.buttonHome, 8/30, {alpha: 1, pixi: {scaleX: 1.0, scaleY: 1.0}, ease: Power2.easeOut, onComplete: function()
            // {

            // }});
        }
    }); */

    TweenMax.delayedCall(8 / 30, function () {
        self.field.revealWords(function () {
            self.invisibleBg.interactive = true;

            TweenMax.delayedCall(5 / 30, function () {
                self.gameState = 'game_end';
            });
        });

        self.panelTimesUp.tween({name: 'show_anim'});

        app.playAudio('sounds', 'sound_times_out');
    });

    app.apiCallback('statistics', {result: 2, category: app.screenGame.category.name});
}
// ScreenGame.prototype.timesUpContinue = function()
// {

// }

ScreenGame.prototype.showReplayButton = function () {
    // console.log('ssss');
    // if(app.gameData.settings.timeMode) this.panelTime.tween({name: 'hide_anim'});
    this.buttonReplay.visible = true;
    this.buttonReplay.alpha = 0;
    TweenMax.to(this.buttonReplay, 10 / 30, {alpha: 1, ease: Power2.easeOut});
}

ScreenGame.prototype.clear = function () {
    this.field.clear();
    this.panelWords.clear();
    this.panelTime.clear();
}

ScreenGame.prototype.onOrientationChange = function (data) {
    var orientation = data.orientation;

    if (orientation == 'portrait') {
        this.panelWords.width = 1000*TEXTURE_UPSIZER;
        this.panelWords.height = 400*TEXTURE_UPSIZER;

        // this.panelWords.positionType = 'center-bot';
        this.panelWords.x = 0;
        this.panelWords.y = -700*TEXTURE_UPSIZER;
        // this.panelWords.yRelative = this.panelWords.height/2;

        this.panelTime.x = 0;
        this.panelTime.y = -200*TEXTURE_UPSIZER;
    }
    if (orientation == 'landscape') {
        this.panelWords.width = 400*TEXTURE_UPSIZER;
        this.panelWords.height = 1000*TEXTURE_UPSIZER;

        // this.panelWords.positionType = 'center-bot';
        this.panelWords.x = 690*TEXTURE_UPSIZER;
        this.panelWords.y = 0;

        this.panelTime.x = 10*TEXTURE_UPSIZER;
        this.panelTime.y = -425*TEXTURE_UPSIZER;
    }
}

ScreenGame.prototype.toMainMenu = function () {
    var self = this;

    if (this.state != 'show') return;

    app.hideAlarm();

    this.tween({name: 'hide_anim'}, function () {
        self.clear();
    });

    TweenMax.delayedCall(10 / 30, function () {
        app.screenMainMenu.tween({name: 'show_anim'});
    });

    app.onOrientationChange();
}

ScreenGame.prototype.tween = function (data, callback) {
    var self = this;

    if (data.name == 'show_anim' && this.state == 'hide') {
        this.state = 'show_anim';
        this.visible = true;
        this.alpha = 0;

        var targetWordsX = 0;
        var targetWordsY = 0;
        var t = 12 / 30;
        if (guiManager.orientation == 'portrait') {
            this.panelWords.x = 0;
            this.panelWords.y = (-700 - 400)*TEXTURE_UPSIZER;
            targetWordsY = -700*TEXTURE_UPSIZER;
            t = 16 / 30;
        } else if (guiManager.orientation == 'landscape') {
            this.panelWords.x = (690 + 150)*TEXTURE_UPSIZER;
            this.panelWords.y = 0;
            targetWordsX = 690*TEXTURE_UPSIZER;
        }
        this.panelWords.alpha = 0;
        TweenMax.to(this.panelWords, t, {alpha: 1, x: targetWordsX, y: targetWordsY, ease: Power2.easeOut, delay: !window['firstTimeCheatAnimLag'] ? (window['firstTimeCheatAnimLag']=8/30) : 0});
        TweenMax.to(this, 12 / 30, {
            alpha: 1, ease: Power2.easeOut, onComplete: function () {
                var isTutorial = app.gameData.tutorials[app.gameData.settings.dificult];
                // var isTutorial = true;
                if (isTutorial) {
                    if (app.gameData.settings.timeMode) self.panelTime.activate();
                } else {
                    app.gameData.tutorials[app.gameData.settings.dificult] = true;
                    self.panelHelpDificult.tween({name: 'show_anim'});
                }

                self.tween({name: 'show'}, callback);
            }
        });

        /* this.buttonSurrender.visible = true;
        this.buttonSurrender.alpha = 0;
        TweenMax.to(this.buttonSurrender, 12 / 30, {alpha: 1, ease: Power2.easeOut}); */

        if (guiManager.orientation == 'portrait') TweenMax.to(app, 12 / 30, {bgSize: 900*TEXTURE_UPSIZER, ease: Power2.easeOut});

        TweenMax.delayedCall(1 / 30, ()=>app.onOrientationChange());
    }

    if (data.name == 'hide_anim' && this.state == 'show') {
        this.state = 'hide_anim';
        this.interactiveChildren = false;

        var targetWordsX = 0;
        var targetWordsY = 0;
        if (guiManager.orientation == 'portrait') targetWordsY = (-700 - 150)*TEXTURE_UPSIZER;
        else if (guiManager.orientation == 'landscape') targetWordsX = (690 + 150)*TEXTURE_UPSIZER;
        TweenMax.to(this.panelWords, 12 / 30, {x: targetWordsX, y: targetWordsY, ease: Power2.easeOut});
        TweenMax.to(this, 12 / 30, {
            alpha: 0, ease: Power2.easeOut, onComplete: function () {
                // self.buttonSurrender.visible = false;

                self.tween({name: 'hide'}, callback);
            }
        });

        TweenMax.delayedCall(1 / 30, ()=>app.onOrientationChange());

        // this.buttonSurrender.visible = true;
        // this.buttonSurrender.alpha = 0;
        // if (this.buttonSurrender.visible) TweenMax.to(this.buttonSurrender, 12 / 30, {alpha: 0, ease: Power2.easeOut});

        if (guiManager.orientation == 'portrait') TweenMax.to(app, 12 / 30, {bgSize: 1120*TEXTURE_UPSIZER, ease: Power2.easeOut});
        if (guiManager.orientation == 'landscape') TweenMax.to(app.alignContainer, 12 / 30, {
            width: 1000*TEXTURE_UPSIZER,
            ease: Power2.easeOut
        });
    }

    if (data.name == 'show' && this.state != 'show') {
        this.state = 'show';
        this.visible = true;
        this.interactiveChildren = true;

        if (callback) callback();
    }
    if (data.name == 'hide' && this.state != 'hide') {
        this.state = 'hide';
        this.visible = false;
        this.interactiveChildren = false;

        if (callback) callback();
    }
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var PanelWords = function (config) {
    config.sizeType = 'absolute';
    config.width = 100*TEXTURE_UPSIZER;
    config.height = 100*TEXTURE_UPSIZER;
    Gui.BasePanel.call(this, config);


    var self = this;

    this.state = 'hide';
    // this.visible = false;
    this.interactiveChildren = false;

    // this.wordsCount = 12;
    this.words = null;
    this.wordPanelsCount = 21;
    this.wordPanels = [];

    // this.showViewRect(0x000000);

    for (var i = 0; i < this.wordPanelsCount; i++) {
        var panelWord = new PanelWord({parentPanel: this});
        this.wordPanels.push(panelWord);
    }

    var Column = function () {
        this.container = new PIXI.Container();
        self.addChild(this.container);

        this.wordPanels = [];

        this.addWordPanel = function (wordPanel) {
            if (this.wordPanels.indexOf(wordPanel) != -1) return;

            this.wordPanels.push(wordPanel);
            this.container.addChild(wordPanel);

            wordPanel.y = (this.wordPanels.length - 1) * 60*TEXTURE_UPSIZER;

            // console.log(wordPanel, wordPanel.y);
        };

        this.clear = function () {
            for (var i = 0; i < this.wordPanels.length; i++) this.container.removeChild(this.wordPanels[i]);
            this.wordPanels = [];

            this.container.scale.x = this.container.scale.y = 1.0;
            this.container.width = 0;
        }
    }

    this.columnH1 = new Column();
    this.columnH2 = new Column();
    this.columnH3 = new Column();
    this.columnsH = [this.columnH1, this.columnH2, this.columnH3];

    this.columnV = new Column();
    this.columnV.container.x = -170*TEXTURE_UPSIZER;

    // this.columnH1.container.y = this.columnH2.container.y = this.columnH3.container.y = -140;

    // Portait positions
    // var posShift = 300;
    // var posX = -450;
    // var posY = -150;
    // for(var i = 0; i < this.wordsCount; i++)
    // {
    //   var position = {x: posX, y: posY};
    //   this.wordsPositions.portrait.push(position);

    //   posX += posShift;
    //   if((i+1) % 3 == 0)
    //   {
    //     posX = -450;
    //     posY += 60;
    //   }
    // }


    guiManager.on('orientation_change', this.onOrientationChange, this);
    this.onOrientationChange({orientation: guiManager.orientation});
}
PanelWords.prototype = Object.create(Gui.BasePanel.prototype);
PanelWords.prototype.constructor = PanelWords;

PanelWords.prototype.initWords = function (wordsData) {
    this.wordsData = wordsData;

    for (var i = 0; i < this.wordsData.length; i++) {
        var wordPanel = this.wordPanels[i];
        wordPanel.initWord(this.wordsData[i]);
    }

    this.updateWordsPosition();
}

PanelWords.prototype.clear = function () {
    for (var i = 0; i < this.wordPanels.length; i++) this.wordPanels[i].clear();
    this.wordsData = null;
}

PanelWords.prototype.onOrientationChange = function (data) {
    var orientation = data.orientation;

    if (orientation == 'portrait') {

    }
    if (orientation == 'landscape') {

    }

    this.updateWordsPosition();
    // for(var i = 0; i < this.words.length; i++)
    // {
    //   this.words[i].x = this.wordsPositions[orientation][i].x;
    //   this.words[i].y = this.wordsPositions[orientation][i].y;
    // }
}

PanelWords.prototype.updateWordsPosition = function () {
    if (this.wordsData == null) return;

    this.wordPanels.sort(function (a, b) {
        if (a.wordData == null && b.wordData == null) return 0;
        if (a.wordData == null && b.wordData != null) return 1;
        if (b.wordData == null && a.wordData != null) return -1;
        if (a.wordData.word.length == b.wordData.word.length) return 0;
        if (a.wordData.word.length > b.wordData.word.length) return -1;
        else return 1;
    });
    // console.log('===');
    // for(var i = 0; i < this.wordPanels.length; i++) console.log(this.wordPanels[i].wordData);

    var orientation = guiManager.orientation;

    if (orientation == 'portrait') {
        if (app.gameData.settings.timeMode) this.columnH1.container.y = this.columnH2.container.y = this.columnH3.container.y = -130*TEXTURE_UPSIZER;
        else this.columnH1.container.y = this.columnH2.container.y = this.columnH3.container.y = -150*TEXTURE_UPSIZER;

        // console.log(this.columnH3.container.y);

        var wordsCount = this.wordsData.length;
        var column1WordsCount = Math.floor(wordsCount / 3);
        var column2WordsCount = column1WordsCount;
        var column3WordsCount = column1WordsCount;
        var nnn = wordsCount - column1WordsCount * 3;
        if (nnn > 0) {
            column1WordsCount++;
            nnn--;
        }
        if (nnn > 0) {
            column2WordsCount++;
            nnn--;
        }

        this.columnH1.clear();
        this.columnH2.clear();
        this.columnH3.clear();
        for (var i = 0; i < this.wordsData.length; i++) {
            // console.log(this.wordPanels[i].width);
            if (i < column1WordsCount) this.columnH1.addWordPanel(this.wordPanels[i]);
            else if (i >= column1WordsCount && i < column1WordsCount + column2WordsCount) this.columnH2.addWordPanel(this.wordPanels[i]);
            else if (i >= column1WordsCount + column2WordsCount && i < column1WordsCount + column2WordsCount + column3WordsCount) this.columnH3.addWordPanel(this.wordPanels[i]);
        }

        // console.log(this.columnH1.wordPanels);

        var maxWidth = 750*TEXTURE_UPSIZER;
        var fullWidth = 0;
        for (var i = 0; i < this.columnsH.length; i++) {
            var column = this.columnsH[i];

            // fullWidth += column.container.width + column.container.width*(1-column.container.scale.x);
            fullWidth += column.container.width / column.container.scale.x;
            // console.log(fullWidth, column.container.width, column.container.scale.x);
        }
        var k = 1 / (fullWidth / maxWidth);
        // if(k > 1) k = 1;
        // console.log(maxWidth, fullWidth, k, fullWidth*k);
        this.columnH1.container.scale.x = this.columnH1.container.scale.y = k;
        this.columnH2.container.scale.x = this.columnH2.container.scale.y = k;
        this.columnH3.container.scale.x = this.columnH3.container.scale.y = k;

        var shift = 50;
        // var shift = (900 - (this.columnH1.container.width + this.columnH2.container.width + this.columnH3.container.width))/2;
        // console.log(shift);
        this.columnH1.container.x = -(maxWidth + shift * 2) / 2;
        this.columnH2.container.x = this.columnH1.container.x + this.columnH1.container.width + shift;
        this.columnH3.container.x = this.columnH2.container.x + this.columnH2.container.width + shift;

        // this.columnH1.container.y = this.columnH2.container.y = this.columnH3.container.y = -500;;
    } else {
        if (app.gameData.settings.timeMode) this.columnV.container.y = -350*TEXTURE_UPSIZER;
        else this.columnV.container.y = -440*TEXTURE_UPSIZER;

        this.columnV.clear();
        for (var i = 0; i < this.wordPanels.length; i++) this.columnV.addWordPanel(this.wordPanels[i]);

        var maxWidth = 350*TEXTURE_UPSIZER;
        var fullWidth = this.columnV.container.width / this.columnV.container.scale.x;
        if (fullWidth > maxWidth) this.columnV.container.scale.x = this.columnV.container.scale.y = (maxWidth / fullWidth);
    }

    // console.log(this.columnH1.container.width, this.columnH2.container.width, this.columnH3.container.width, this.columnV.container.width);

    for (var i = 0; i < this.wordPanels.length; i++) {
        if (this.wordPanels[i].wordData == null) this.wordPanels[i].visible = false;
    }
}

PanelWords.prototype.tween = function (data, callback) {
    var self = this;
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var PanelWord = function (config) {
    config.sizeType = 'absolute';
    config.width = 100*TEXTURE_UPSIZER;
    config.height = 100*TEXTURE_UPSIZER;
    Gui.BasePanel.call(this, config);


    var self = this;

    this.state = 'hide';
    // this.visible = false;
    this.interactiveChildren = false;

    this.charWidth = 50*TEXTURE_UPSIZER;

    this.wordData = null;

    this.lane = new PIXI.Sprite(assetsManager.getTexture('atlas', 'white_rect.png'));
    this.addChild(this.lane);
    this.lane.anchor.set(0.0, 0.5);
    this.lane.height = 8*TEXTURE_UPSIZER;
    this.lane.visible = false;
    this.lane.x = -3*TEXTURE_UPSIZER;
    this.lane.y = 4*TEXTURE_UPSIZER;
    this.lane.tint = 0xB4C4D4;
    // this.charSprites = [];
    // for(var i = 0; i < 10; i++)
    // {
    //   var char = app.createCharSprite('CG_65', 'X');
    //   this.addChild(char);
    //   char.x = i * this.charWidth;
    //   char.visible = false;

    //   this.charSprites.push(char);
    // }
    this.wordText = Util.setParams(new Gui.Text('None', constsManager.getData('text_configs/field_words_text')), {
        parent: this,
        aX: 0.0,
        aY: 0.5,
        x: 0,
        y: 0
    });
    this.hidenWordText = Util.setParams(new Gui.Text('None', constsManager.getData('text_configs/field_maniac_words_text')), {
        parent: this,
        aX: 0.0,
        aY: 0.5,
        x: 0,
        y: 0
    });
    this.hidenWordText.visible = false;

    // this.setWord(Util.randomElement(app.gameData.wordsList));

}
PanelWord.prototype = Object.create(Gui.BasePanel.prototype);
PanelWord.prototype.constructor = PanelWord;

PanelWord.prototype.clear = function () {
    this.wordData = null;
    this.visible = false;
    this.lane.visible = false;

    this.wordText.text = '';
    this.hidenWordText.text = '';
    this.hidenWordText.x = 0;
}

PanelWord.prototype.initWord = function (wordData) {
    this.wordData = wordData;

    this.visible = true;

    wordData.word = wordData.word.toUpperCase();

    if (!app.gameData.settings.hideWords) {
        this.wordText.text = wordData.word.toUpperCase();
        this.wordText.tint = 0xFFFFFF;
        this.hidenWordText.visible = false;
    } else {
        var str = '';
        for (var i = 0; i < this.wordData.word.length; i++) str += '_';

        // this.wordText.text = str;
        // this.wordText.tint = 0xB4C4D4;

        this.wordText.text = '';
        this.hidenWordText.visible = true;
        this.hidenWordText.x = 0;
        this.hidenWordText.text = str;
    }

    // var eee = new EventEmitter();
    // eee.on('a', e=>{console.log(e)})
    // eee.emit('a', {data:'x'});
    // console.log(app.gameData.settings.dificult);

    // var startX = 0;
    // if(word.length % 2 != 0) startX = -Math.floor(word.length/2) * this.charWidth;
    // else startX = -(Math.floor(word.length/2)-1) * this.charWidth - this.charWidth/2;

    // for(var i = 0; i < word.length; i++)
    // {
    //   var charSprite = this.charSprites[i];
    //   charSprite.visible = true;
    //   // charSprite.x = startX + i*this.charWidth;
    //   app.setCharSprite(charSprite, word[i]);
    // }
}

PanelWord.prototype.openWord = function () {
    var self = this;

    if (!app.gameData.settings.hideWords) {
        this.wordText.tint = 0xB4C4D4;

        TweenMax.delayedCall(5 / 30, showLane);
    } else {
        var oneCharV = 1 / this.wordData.word.length;
        var charsCount = 0;

        var vvv = {value: 0};
        TweenMax.to(this.wordText, 10 / 30, {pixi: {tint: 0xB4C4D4}, ease: Power2.easeOut});
        TweenMax.to(vvv, 10 / 30, {
            value: 1, ease: Power0.easeNone, onUpdate: function () {
                var cc = Math.round(vvv.value / oneCharV);
                if (cc > charsCount) {
                    charsCount = cc;
                    var str = '';
                    var sss = '';
                    for (var i = 0; i < self.wordData.word.length; i++) {
                        if (i < charsCount) {
                            str += self.wordData.word[i];
                            sss += '';
                        } else sss += '_';
                    }

                    self.wordText.text = str;
                    // self.hidenWordText.x = charsCount*45;
                    self.hidenWordText.x = self.wordText.width;
                    self.hidenWordText.text = sss;
                }
            },
            onComplete: function () {
                // self.wordText.tint = 0xFFFFFF;
                showLane();
            }
        });
    }

    function showLane() {
        self.lane.visible = true;
        self.lane.width = 0;
        TweenMax.to(self.lane, 15 / 30, {width: self.wordText.width + 11*TEXTURE_UPSIZER, ease: Power2.easeOut});
    }
}
PanelWord.prototype.revealWord = function () {
    var self = this;

    if (!app.gameData.settings.hideWords) {
        this.wordText.tint = 0xB4C4D4;
    } else {
        var oneCharV = 1 / this.wordData.word.length;
        var charsCount = 0;

        var vvv = {value: 0};
        this.wordText.tint = 0xFFFFFF;
        // TweenMax.to(this.wordText, 10/30, {pixi: {tint: 0xFFFFFF}, ease: Power2.easeOut});
        TweenMax.to(vvv, 10 / 30, {
            value: 1, ease: Power0.easeNone, onUpdate: function () {
                var cc = Math.round(vvv.value / oneCharV);
                if (cc > charsCount) {
                    charsCount = cc;
                    var str = '';
                    var sss = '';
                    for (var i = 0; i < self.wordData.word.length; i++) {
                        if (i < charsCount) {
                            str += self.wordData.word[i];
                            sss += '';
                        } else sss += '_';
                    }

                    self.wordText.text = str;
                    // self.hidenWordText.x = charsCount*45;
                    self.hidenWordText.x = self.wordText.width;
                    self.hidenWordText.text = sss;
                }
            },
            onComplete: function () {

            }
        });
    }
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var PanelTime = function (config) {
    config.sizeType = 'absolute';
    config.width = 288*TEXTURE_UPSIZER;
    config.height = 71*TEXTURE_UPSIZER;
    Gui.BasePanel.call(this, config);


    var self = this;

    this.state = 'hide';
    this.visible = false;
    this.interactiveChildren = false;

    this.bg = Util.setParams(new PIXI.Sprite(assetsManager.getTexture('atlas', 'time_panel_bg.png')), {
        parent: this,
        aX: 0.5,
        aY: 0.5
    });

    this.timer = null;
    this.secondsLeft = 0;

    this.textTime = Util.setParams(new Gui.Text('0:00', constsManager.getData('text_configs/timer_text')), {
        parent: this,
        aX: 0.5,
        aY: 0.5,
        x: 0,
        y: 0
    });

    this.anim = new Animation();
    this.addChild(this.anim);
    this.anim.x = -288 / 2*TEXTURE_UPSIZER;
    this.anim.y = -71 / 2*TEXTURE_UPSIZER;
    this.anim.addSequence('anim', 'atlas', 'frame_', 1, 18, 30, {});
    this.anim.switchSequence('anim');
    // this.anim.play();
    this.anim.visible = false;

    this.lastUpdateSeconds = -1;

    this.isAlarm = false;
}
PanelTime.prototype = Object.create(Gui.BasePanel.prototype);
PanelTime.prototype.constructor = PanelTime;

PanelTime.prototype.initTimer = function (seconds) {
    var self = this;

    this.visible = true;

    this.secondsLeft = seconds;
    this.lastUpdateSeconds = -1;

    this.timer = TweenMax.to(this, seconds, {
        secondsLeft: 0, ease: Power0.easeNone, onComplete: function () {
            // console.log('times_up');
            self.onTimesUp();
        },
        onUpdate: function () {
            self.onTimeUpdate();
            // console.log(self.secondsLeft);
        }
    });
    this.timer.pause();

    this.showTime(this.secondsLeft);
}

PanelTime.prototype.addTime = function (seconds) {
    if (this.secondsLeft == 0) return;

    var self = this;

    this.secondsLeft += seconds;
    // this.showTime(this.secondsLeft);

    this.timer.kill();
    this.timer = null;
    this.timer = TweenMax.to(this, this.secondsLeft, {
        secondsLeft: 0, ease: Power0.easeNone, onComplete: function () {
            // console.log('times_up');
            self.onTimesUp();
        },
        onUpdate: function () {
            self.onTimeUpdate();
            // console.log(self.secondsLeft);
        }
    });

    TweenMax.to(this.textTime.scale, 10 / 30, {
        x: 1.2, y: 1.2, ease: Power2.easeOut, onComplete: function () {
            TweenMax.to(self.textTime.scale, 10 / 30, {
                x: 1.0, y: 1.0, ease: Power2.easeOut, onComplete: function () {

                }
            });
        }
    });

    this.anim.visible = true;
    this.anim.gotoAndPlay(1);
    this.anim.once('complete', function (d) {
        this.anim.stop();
        this.anim.visible = false;
    }, this);
}

PanelTime.prototype.onTimeUpdate = function () {
    var ceilSeconds = Math.ceil(this.secondsLeft)
    this.showTime(ceilSeconds);

    if (this.lastUpdateSeconds != ceilSeconds) {
        this.lastUpdateSeconds = ceilSeconds;

        if (ceilSeconds <= 10) {
            app.showAlarm();
            app.playAudio('sounds', 'sound_red_beep');

            // app.soundTick.volume = 1.0;
        }
        // else app.soundTick.volume = 0.0;

        // console.log("Tic!");
    }

    if (this.secondsLeft <= 10 && !this.isAlarm) {
        this.isAlarm = true;
        // app.showAlarm();
    } else if (this.secondsLeft > 10 && this.isAlarm) {
        this.isAlarm = false;
        app.hideAlarm();
    }
}
PanelTime.prototype.onTimesUp = function () {
    this.emit('times_up');

    if (this.isAlarm) {
        this.isAlarm = false;
        // app.soundTick.volume = 0.0;
        app.hideAlarm();
    }
}

PanelTime.prototype.showTime = function (totalSeconds) {
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = Math.round(totalSeconds - minutes * 60);
    if (seconds < 10) seconds = '0' + seconds;

    this.textTime.text = minutes + ':' + seconds;
}

PanelTime.prototype.clear = function () {
    if (this.timer == null) return;

    this.timer.kill();
    this.timer = null;
    this.secondsLeft = 0;
    this.isAlarm = false;

    this.anim.stop();
    this.anim.visible = false;

    this.textTime.scale.x = this.textTime.scale.y = 1;

    this.visible = false;
    // app.soundTick.volume = 0.0;
}

PanelTime.prototype.activate = function () {
    this.timer.resume();

    // if(this.isAlarm) app.soundTick.volume = 1.0;
}

PanelTime.prototype.pause = function () {
    this.timer.pause();

    // if(this.isAlarm) app.soundTick.volume = 0.0;
}

PanelTime.prototype.tween = function (data, callback) {
    if (data.name == 'hide_anim') {
        var targetX = this.x;
        var targetY = this.y;
        if (guiManager.orientation == 'portrait') targetY -= 30*TEXTURE_UPSIZER;
        if (guiManager.orientation == 'landscape') targetY -= 30*TEXTURE_UPSIZER;

        TweenMax.to(this, 12 / 30, {
            alpha: 0, x: targetX, y: targetY, ease: Power2.easeOut, onComplete: function () {

            }
        });
    }
}

// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var PanelInGameMenu = function (config) {
    config.sizeType = 'absolute';
    config.width = 954*TEXTURE_UPSIZER;
    config.height = 308*TEXTURE_UPSIZER;
    Gui.BasePanel.call(this, config);


    var self = this;

    this.initBlockInputBg(5000*TEXTURE_UPSIZER, 5000*TEXTURE_UPSIZER, bind(function () {

    }, this));
    this.invisibleBg.alpha = 0.5;

    this.state = 'hide';
    this.visible = false;
    this.interactiveChildren = false;

    this.bg = Util.setParams(new PIXI.Sprite(assetsManager.getTexture('atlas', 'Settings_bg.png')), {
        parent: this,
        aX: 0.5,
        aY: 0.5
    });

    this.labelTitle = Util.setParams(new Gui.LocalizedText('settings', Object.assign({wordWrap: true, wordWrapWidth: 720*TEXTURE_UPSIZER}, constsManager.getData('text_styles/settings')), 600*TEXTURE_UPSIZER, 330*TEXTURE_UPSIZER), {
        parent: this,
        aX: 0.5,
        aY: 0.5,
        x: 0,
        y: -360*TEXTURE_UPSIZER
    });

    this.labelSound = Util.setParams(new Gui.LocalizedText('sound', Object.assign({wordWrap: true, wordWrapWidth: 450*TEXTURE_UPSIZER}, constsManager.getData('text_styles/sound')), 600*TEXTURE_UPSIZER, 330*TEXTURE_UPSIZER), {
        parent: this,
        aX: 0,
        aY: 0.5,
        x: -300*TEXTURE_UPSIZER,
        y: -215*TEXTURE_UPSIZER
    });
    
    /* this.button_Sound_bg.buttonMode = true;
    this.button_Sound_bg.interactive = true;
    this.button_Sound_bg.onClickListeners.push({listener: function (e) {
        soundsManager.switchSoundState();
    }, context: this}); */
    
    this.buttonAudio = new Gui.ButtonAudio({
        name: 'button_audio',
        parentPanel: this,
        width: 83*TEXTURE_UPSIZER,
        height: 83*TEXTURE_UPSIZER,
        x: 250*TEXTURE_UPSIZER,
        y: -215*TEXTURE_UPSIZER
    });
    this.buttonAudio.skin.tint = 0x000000;
    

    this.button_reveal_puzzle = Gui.createTextButton({
        name: 'button_restart_puzzle',
        parentPanel: this,
        width: 650*TEXTURE_UPSIZER,
        height: 124*TEXTURE_UPSIZER,
        x: 0*TEXTURE_UPSIZER,
        y: -50*TEXTURE_UPSIZER
    },
    {
        pathToSkin: 'Button_option.png',
        onClick: function () {            
            if (app.screenGame.state != 'show') return;

            self.tween({name: 'hide_anim'}, function () {
                app.screenGame.surrender();
            });

            app.playAudio('sounds', 'sound_play_button');
        }
    }, {
        textKey: 'reveal_puzzle',
        x: 0,
        y: 0,
        style: constsManager.getData('text_styles/reveal_puzzle')
    });

    this.button_restart_puzzle = Gui.createTextButton({
        name: 'button_restart_puzzle',
        parentPanel: this,
        width: 650*TEXTURE_UPSIZER,
        height: 124*TEXTURE_UPSIZER,
        x: 0*TEXTURE_UPSIZER,
        y: 135*TEXTURE_UPSIZER
    },
    {
        pathToSkin: 'Button_option.png',
        onClick: function () {
            if (app.screenGame.state != 'show' || app.screenGame.gameState != 'game') return;

            self.tween({ name: 'hide_anim' }, function () {
                app.screenGame.replay();
                app.apiCallback('replay');
            });

            app.playAudio('sounds', 'sound_play_button');
        }
    }, {
        textKey: 'new_puzzle_settings',
        x: 0,
        y: 0,
        style: constsManager.getData('text_styles/new_puzzle_settings')
    });

    this.button_new_puzzle = Gui.createTextButton({
        name: 'button_new_puzzle',
        parentPanel: this,
        width: 650*TEXTURE_UPSIZER,
        height: 124*TEXTURE_UPSIZER,
        x: 0*TEXTURE_UPSIZER,
        y: 320*TEXTURE_UPSIZER
    },
    {
        pathToSkin: 'Button_option.png',
        onClick: function () {
            if (app.screenGame.state != 'show') return;

            app.apiCallback('statistics', { result: 3, category: app.screenGame.category.name });

            self.tween({ name: 'hide_anim' }, function () {
                app.screenGame.toMainMenu();
            });
            
            app.playAudio('sounds', 'sound_play_button');
        }
    }, {
        textKey: 'main_menu_settings',
        x: 0,
        y: 0,
        style: constsManager.getData('text_styles/main_menu_settings')
    });

    this.buttonClose = Gui.createSimpleButton({
            name: 'button_close',
            parentPanel: this,
            width: 69*TEXTURE_UPSIZER,
            height: 69*TEXTURE_UPSIZER,
            x: (629 / 2 - 30+120)*TEXTURE_UPSIZER,
            y: (-622 / 2 + 30-130)*TEXTURE_UPSIZER
        },
        {
            pathToSkin: 'button_close.png',
            onClick: function () {
                if (app.screenGame.state != 'show') return;

                self.tween({name: 'hide_anim'}, function () {
                    if (app.gameData.settings.timeMode) app.screenGame.panelTime.activate();
                });
            }
        });

    /* this.buttonYes = Gui.createTextButton({
            name: 'button_yes',
            parentPanel: this,
            width: 270*TEXTURE_UPSIZER,
            height: 116*TEXTURE_UPSIZER,
            x: 158*TEXTURE_UPSIZER,
            y: 520*TEXTURE_UPSIZER
        },
        {
            pathToSkin: 'button_yes.png',
            onClick: function () {
                if (app.screenGame.state != 'show') return;

                app.apiCallback('statistics', {result: 3, category: app.screenGame.category.name});

                self.tween({name: 'hide_anim'}, function () {
                    app.screenGame.toMainMenu();
                });
            }
        }, {
            textKey: 'yes',
            x: 0,
            y: 0,
            style: constsManager.getData('text_styles/common_button_text')
        });

    this.buttonNo = Gui.createTextButton({
            name: 'button_no',
            parentPanel: this,
            width: 270*TEXTURE_UPSIZER,
            height: 116*TEXTURE_UPSIZER,
            x: -158*TEXTURE_UPSIZER,
            y: 520*TEXTURE_UPSIZER
        },
        {
            pathToSkin: 'button_no.png',
            onClick: function () {
                if (app.screenGame.state != 'show') return;

                self.tween({name: 'hide_anim'}, function () {
                    if (app.gameData.settings.timeMode) app.screenGame.panelTime.activate();
                });
            }
        }, {
            textKey: 'no',
            x: 0,
            y: 0,
            style: constsManager.getData('text_styles/common_button_text')
        }); */
}
PanelInGameMenu.prototype = Object.create(Gui.BasePanel.prototype);
PanelInGameMenu.prototype.constructor = PanelInGameMenu;

PanelInGameMenu.prototype.tween = function (data, callback) {
    var self = this;


    if (data.name == 'show_anim' && this.state == 'hide') {
        this.state = 'show_anim';
        this.visible = true;
        this.alpha = 0;

        if (app.screenGame.panelTime.isAlarm) app.hideAlarm();

        this.y = -90*TEXTURE_UPSIZER;

        TweenMax.to(this, 10 / 30, {
            alpha: 1, y: 10*TEXTURE_UPSIZER, ease: Power2.easeOut, onComplete: function () {
                self.tween({name: 'show'}, callback);
            }
        });

        if (app.gameData.settings.timeMode) app.screenGame.panelTime.pause();
    }

    if (data.name == 'hide_anim' && this.state == 'show') {
        this.state = 'hide_anim';
        this.interactiveChildren = false;

        TweenMax.to(this, 10 / 30, {
            alpha: 0, y: -90*TEXTURE_UPSIZER, ease: Power2.easeOut, onComplete: function () {
                // if(app.screenGame.panelTime.isAlarm) app.showAlarm();

                self.tween({name: 'hide'}, callback);
            }
        });
    }

    if (data.name == 'show' && this.state != 'show') {
        this.state = 'show';
        this.visible = true;
        this.interactiveChildren = true;

        if (callback) callback();
    }
    if (data.name == 'hide' && this.state != 'hide') {
        this.state = 'hide';
        this.visible = false;
        this.interactiveChildren = false;

        if (callback) callback();
    }
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var PanelLeave = function (config) {
    config.sizeType = 'absolute';
    config.width = 954*TEXTURE_UPSIZER;
    config.height = 308*TEXTURE_UPSIZER;
    Gui.BasePanel.call(this, config);


    var self = this;

    this.initBlockInputBg(5000*TEXTURE_UPSIZER, 5000*TEXTURE_UPSIZER, bind(function () {

    }, this));
    this.invisibleBg.alpha = 0.5;

    this.state = 'hide';
    this.visible = false;
    this.interactiveChildren = false;

    this.bg = Util.setParams(new PIXI.Sprite(assetsManager.getTexture('atlas', 'panel_bg_1.png')), {
        parent: this,
        aX: 0.5,
        aY: 0.5
    });

    this.labelTitle = Util.setParams(new Gui.LocalizedText('leave_this_puzzle', Object.assign({wordWrap: true, wordWrapWidth: 560*TEXTURE_UPSIZER}, constsManager.getData('text_styles/common_ui_text')), 600*TEXTURE_UPSIZER, 330*TEXTURE_UPSIZER), {
        parent: this,
        aX: 0.5,
        aY: 0.5,
        x: 0,
        y: -60*TEXTURE_UPSIZER
    });

    this.buttonClose = Gui.createSimpleButton({
            name: 'button_close',
            parentPanel: this,
            width: 69*TEXTURE_UPSIZER,
            height: 69*TEXTURE_UPSIZER,
            x: (629 / 2 - 30)*TEXTURE_UPSIZER,
            y: (-622 / 2 + 30)*TEXTURE_UPSIZER
        },
        {
            pathToSkin: 'button_close.png',
            onClick: function () {
                if (app.screenGame.state != 'show') return;

                self.tween({name: 'hide_anim'}, function () {
                    if (app.gameData.settings.timeMode) app.screenGame.panelTime.activate();
                });
            }
        });

    this.buttonYes = Gui.createTextButton({
            name: 'button_yes',
            parentPanel: this,
            width: 270*TEXTURE_UPSIZER,
            height: 116*TEXTURE_UPSIZER,
            x: 158*TEXTURE_UPSIZER,
            y: 220*TEXTURE_UPSIZER
        },
        {
            pathToSkin: 'button_yes.png',
            onClick: function () {
                if (app.screenGame.state != 'show') return;

                app.apiCallback('statistics', {result: 3, category: app.screenGame.category.name});

                self.tween({name: 'hide_anim'}, function () {
                    app.screenGame.toMainMenu();
                });
            }
        }, {
            textKey: 'yes',
            x: 0,
            y: 0,
            style: constsManager.getData('text_styles/common_button_text')
        });

    this.buttonNo = Gui.createTextButton({
            name: 'button_no',
            parentPanel: this,
            width: 270*TEXTURE_UPSIZER,
            height: 116*TEXTURE_UPSIZER,
            x: -158*TEXTURE_UPSIZER,
            y: 220*TEXTURE_UPSIZER
        },
        {
            pathToSkin: 'button_no.png',
            onClick: function () {
                if (app.screenGame.state != 'show') return;

                self.tween({name: 'hide_anim'}, function () {
                    if (app.gameData.settings.timeMode) app.screenGame.panelTime.activate();
                });
            }
        }, {
            textKey: 'no',
            x: 0,
            y: 0,
            style: constsManager.getData('text_styles/common_button_text')
        });

    // this.textTime = Util.setParams(new Gui.TextBmp('0:00',  constsManager.getData('text_configs/timer_text')), {parent: this, aX:0.0, aY:0.5, x: 0, y: 14});
}
PanelLeave.prototype = Object.create(Gui.BasePanel.prototype);
PanelLeave.prototype.constructor = PanelLeave;

PanelLeave.prototype.tween = function (data, callback) {
    var self = this;


    if (data.name == 'show_anim' && this.state == 'hide') {
        this.state = 'show_anim';
        this.visible = true;
        this.alpha = 0;

        if (app.screenGame.panelTime.isAlarm) app.hideAlarm();

        this.y = -90*TEXTURE_UPSIZER;

        TweenMax.to(this, 10 / 30, {
            alpha: 1, y: 10*TEXTURE_UPSIZER, ease: Power2.easeOut, onComplete: function () {
                self.tween({name: 'show'}, callback);
            }
        });

        if (app.gameData.settings.timeMode) app.screenGame.panelTime.pause();
    }

    if (data.name == 'hide_anim' && this.state == 'show') {
        this.state = 'hide_anim';
        this.interactiveChildren = false;

        TweenMax.to(this, 10 / 30, {
            alpha: 0, y: -90*TEXTURE_UPSIZER, ease: Power2.easeOut, onComplete: function () {
                // if(app.screenGame.panelTime.isAlarm) app.showAlarm();

                self.tween({name: 'hide'}, callback);
            }
        });
    }

    if (data.name == 'show' && this.state != 'show') {
        this.state = 'show';
        this.visible = true;
        this.interactiveChildren = true;

        if (callback) callback();
    }
    if (data.name == 'hide' && this.state != 'hide') {
        this.state = 'hide';
        this.visible = false;
        this.interactiveChildren = false;

        if (callback) callback();
    }
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var PanelSolved = function (config) {
    config.sizeType = 'absolute';
    config.width = 954*TEXTURE_UPSIZER;
    config.height = 338*TEXTURE_UPSIZER;
    Gui.BasePanel.call(this, config);


    var self = this;

    this.initBlockInputBg(5000*TEXTURE_UPSIZER, 5000*TEXTURE_UPSIZER, bind(function () {

    }, this));
    this.invisibleBg.alpha = 0.5;

    this.state = 'hide';
    this.visible = false;
    this.interactiveChildren = false;

    this.bg = Util.setParams(new PIXI.Sprite(assetsManager.getTexture('atlas', 'end_game_panel_bg_small.png')), {
        parent: this,
        aX: 0.5,
        aY: 0.5
    });


    this.labelTitle = Util.setParams(new Gui.LocalizedText('solved', Object.assign({wordWrap: true, wordWrapWidth: 560}, constsManager.getData('text_styles/common_ui_text_bigger')), 560*TEXTURE_UPSIZER, 240*TEXTURE_UPSIZER), {
        parent: this,
        aX: 0.5,
        aY: 0.5,
        x: 0,
        y: -60*TEXTURE_UPSIZER
    });

    // this.panelStreak = new PanelStreak({parentPanel: this, x: 0, y: -26});

    this.buttonClose = Gui.createSimpleButton({
            name: 'button_close',
            parentPanel: this,
            width: 69*TEXTURE_UPSIZER,
            height: 69*TEXTURE_UPSIZER,
            x: (953 / 2 - 40)*TEXTURE_UPSIZER,
            y: (-338 / 2 + 40)*TEXTURE_UPSIZER
        },
        {
            pathToSkin: 'button_close.png',
            onClick: function () {
                if (app.screenGame.state != 'show') return;

                self.tween({name: 'hide_anim'}, function () {
                    app.screenGame.showReplayButton();
                    // if(app.gameData.settings.timeMode) app.screenGame.panelTime.activate();
                });
            }
        });

    this.buttonHome = Gui.createTextButton({
            name: 'button_home',
            parentPanel: this,
            width: 345*TEXTURE_UPSIZER,
            height: 116*TEXTURE_UPSIZER,
            x: -204*TEXTURE_UPSIZER,
            y: 57*TEXTURE_UPSIZER
        },
        {
            pathToSkin: 'button_replay.png',
            onClick: function () {
                if (app.screenGame.state != 'show') return;

                self.tween({name: 'hide_anim'}, function () {
                    app.screenGame.toMainMenu();
                });
            }
        }, {
            textKey: 'main_menu_settings',
            x: 0,
            y: 0,
            style: constsManager.getData('text_styles/common_button_text'),
            wordWrap: true,
            wordWrapWidth: 280*TEXTURE_UPSIZER,
            maxHeight: 110*TEXTURE_UPSIZER,
            maxWidth: 300*TEXTURE_UPSIZER
        });
    this.buttonHome.textField.text = this.buttonHome.textField.text.toUpperCase()

    this.buttonReplay = Gui.createTextButton({
            name: 'button_replay',
            parentPanel: this,
            width: 345*TEXTURE_UPSIZER,
            height: 116*TEXTURE_UPSIZER,
            x: 204*TEXTURE_UPSIZER,
            y: 57*TEXTURE_UPSIZER
        },
        {
            pathToSkin: 'button_replay.png',
            onClick: function () {
                if (app.screenGame.state != 'show') return;

                self.tween({name: 'hide_anim'}, function () {
                    app.screenGame.replay(true);
                });

                app.playAudio('sounds', 'sound_play_button');

                app.apiCallback('start');
            }
        }, {
            textKey: 'new_puzzle',
            x: 0,
            y: 0,
            style: constsManager.getData('text_styles/common_button_text'),
            wordWrap: true,
            wordWrapWidth: 280*TEXTURE_UPSIZER,
            maxHeight: 110*TEXTURE_UPSIZER,
            maxWidth: 300*TEXTURE_UPSIZER
        });
    this.buttonReplay.isClickSound = false;

    // var self = this;
    // var keyR = Util.keyboard(82);
    // keyR.press = function()
    // {
    //   app.screenGame.solved();
    // }
    //
    //
    // var keyT = Util.keyboard(84);
    // keyT.press = function()
    // {
    //   app.screenGame.timesUp();
    // }

    // this.wordText = Util.setParams(new Gui.TextBmp('None',  constsManager.getData('text_configs/field_words_text')), {parent: this, aX:0.0, aY:0.5, x: 0, y: 14});
}
PanelSolved.prototype = Object.create(Gui.BasePanel.prototype);
PanelSolved.prototype.constructor = PanelSolved;

PanelSolved.prototype.initElements = function () {
    if (!app.gameData.settings.timeMode) {
        this.labelTitle.y = -65*TEXTURE_UPSIZER;
        this.buttonHome.y = this.buttonReplay.y = 85*TEXTURE_UPSIZER;
        // this.panelStreak.visible = false;
    } else {
        this.labelTitle.y = -115*TEXTURE_UPSIZER;
        this.buttonHome.y = this.buttonReplay.y = 95*TEXTURE_UPSIZER;
        // this.panelStreak.visible = true;
        // this.panelStreak.updateStreak();
    }
}

PanelSolved.prototype.tween = function (data, callback) {
    var self = this;


    if (data.name == 'show_anim' && this.state == 'hide') {
        this.state = 'show_anim';
        this.visible = true;
        this.alpha = 0;

        this.initElements();

        this.y = -100*TEXTURE_UPSIZER;

        TweenMax.to(this, 10 / 30, {
            alpha: 1, y: 0, ease: Power2.easeOut, onComplete: function () {
                self.tween({name: 'show'}, callback);
            }
        });
    }

    if (data.name == 'hide_anim' && this.state == 'show') {
        this.state = 'hide_anim';
        this.interactiveChildren = false;

        TweenMax.to(this, 10 / 30, {
            alpha: 0, y: -100*TEXTURE_UPSIZER, ease: Power2.easeOut, onComplete: function () {
                self.tween({name: 'hide'}, callback);
            }
        });
    }

    if (data.name == 'show' && this.state != 'show') {
        this.state = 'show';
        this.visible = true;
        this.interactiveChildren = true;

        if (callback) callback();
    }
    if (data.name == 'hide' && this.state != 'hide') {
        this.state = 'hide';
        this.visible = false;
        this.interactiveChildren = false;

        if (callback) callback();
    }
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var PanelSolvedByTime = function (config) {
    config.sizeType = 'absolute';
    config.width = 954*TEXTURE_UPSIZER;
    config.height = 338*TEXTURE_UPSIZER;
    Gui.BasePanel.call(this, config);


    var self = this;

    this.initBlockInputBg(5000*TEXTURE_UPSIZER, 5000*TEXTURE_UPSIZER, bind(function () {

    }, this));
    this.invisibleBg.alpha = 0.5;

    this.state = 'hide';
    this.visible = false;
    this.interactiveChildren = false;

    this.bg = Util.setParams(new PIXI.Sprite(assetsManager.getTexture('atlas', 'end_game_panel_bg_small.png')), {
        parent: this,
        aX: 0.5,
        aY: 0.5
    });
    this.bg.width = 953*TEXTURE_UPSIZER;
    this.bg.height = 420*TEXTURE_UPSIZER;

    var tttShift = 10*TEXTURE_UPSIZER;

    this.labelTitle = Util.setParams(new Gui.LocalizedText('you_solved', constsManager.getData('text_styles/solved_panel_text'), 560*TEXTURE_UPSIZER), {
        parent: this,
        aX: 0.5,
        aY: 0.5,
        x: 0,
        y: -155*TEXTURE_UPSIZER + tttShift
    });


    // this.panelStreak = new PanelStreak({parentPanel: this, x: 0, y: -26});

    this.buttonClose = Gui.createSimpleButton({
            name: 'button_close',
            parentPanel: this,
            width: 69*TEXTURE_UPSIZER,
            height: 69*TEXTURE_UPSIZER,
            x: (953 / 2 - 30)*TEXTURE_UPSIZER,
            y: (-420 / 2 + 30)*TEXTURE_UPSIZER
        },
        {
            pathToSkin: 'button_close.png',
            onClick: function () {
                if (app.screenGame.state != 'show') return;

                self.tween({name: 'hide_anim'}, function () {
                    app.screenGame.showReplayButton();
                    // if(app.gameData.settings.timeMode) app.screenGame.panelTime.activate();
                });
            }
        });

    this.buttonHome = Gui.createSimpleButton({
            name: 'button_home',
            parentPanel: this,
            width: 270*TEXTURE_UPSIZER,
            height: 116*TEXTURE_UPSIZER,
            x: -204*TEXTURE_UPSIZER,
            y: 130*TEXTURE_UPSIZER
        },
        {
            pathToSkin: 'button_home.png',
            onClick: function () {
                if (app.screenGame.state != 'show') return;

                self.tween({name: 'hide_anim'}, function () {
                    app.screenGame.toMainMenu();
                });
            }
        });

    this.buttonReplay = Gui.createTextButton({
            name: 'button_replay',
            parentPanel: this,
            width: 345*TEXTURE_UPSIZER,
            height: 116*TEXTURE_UPSIZER,
            x: 204*TEXTURE_UPSIZER,
            y: 130*TEXTURE_UPSIZER
        },
        {
            pathToSkin: 'button_replay.png',
            onClick: function () {
                if (app.screenGame.state != 'show') return;

                self.tween({name: 'hide_anim'}, function () {
                    app.screenGame.replay();
                });

                app.playAudio('sounds', 'sound_play_button');

                app.apiCallback('start');
            }
        }, {
        textKey: 'new_puzzle',
            x: 0,
            y: 0,
            style: constsManager.getData('text_styles/common_button_text'),
            wordWrap: true,
            wordWrapWidth: 280*TEXTURE_UPSIZER,
            maxHeight: 110*TEXTURE_UPSIZER,
            maxWidth: 300*TEXTURE_UPSIZER
    });
    this.buttonReplay.isClickSound = false;

    // var self = this;
    // var keyR = Util.keyboard(82);
    // keyR.press = function()
    // {
    //   app.screenGame.solved();
    // }
    //
    //
    // var keyT = Util.keyboard(84);
    // keyT.press = function()
    // {
    //   app.screenGame.timesUp();
    // }

    this.textCategory = Util.setParams(new Gui.Text('None', constsManager.getData('text_configs/solved_category')), {
        parent: this,
        aX: 0.5,
        aY: 0.5,
        x: 0,
        y: -82*TEXTURE_UPSIZER + tttShift
    });
    this.textTime = Util.setParams(new Gui.LocalizedText('with_time_left', constsManager.getData('text_configs/solved_time'), 560*TEXTURE_UPSIZER, 100*TEXTURE_UPSIZER), {
        parent: this,
        aX: 0.5,
        aY: 0.5,
        x: 0,
        y: -8*TEXTURE_UPSIZER + tttShift
    });
}
PanelSolvedByTime.prototype = Object.create(Gui.BasePanel.prototype);
PanelSolvedByTime.prototype.constructor = PanelSolvedByTime;

PanelSolvedByTime.prototype.tween = function (data, callback) {
    var self = this;


    if (data.name == 'show_anim' && this.state == 'hide') {
        this.state = 'show_anim';
        this.visible = true;
        this.alpha = 0;

        this.textCategory.text = app.screenGame.category.name;

        var totalSeconds = Math.ceil(app.screenGame.panelTime.secondsLeft);
        var minutes = Math.floor(totalSeconds / 60);
        var seconds = Math.round(totalSeconds - minutes * 60);
        if (seconds < 10) seconds = '0' + seconds;
        this.textTime.setDynamicValue('' + minutes + ':' + seconds );

        this.y = -40*TEXTURE_UPSIZER;

        TweenMax.to(this, 10 / 30, {
            alpha: 1, y: 60*TEXTURE_UPSIZER, ease: Power2.easeOut, onComplete: function () {
                self.tween({name: 'show'}, callback);
            }
        });
    }

    if (data.name == 'hide_anim' && this.state == 'show') {
        this.state = 'hide_anim';
        this.interactiveChildren = false;

        TweenMax.to(this, 10 / 30, {
            alpha: 0, y: -40*TEXTURE_UPSIZER, ease: Power2.easeOut, onComplete: function () {
                self.tween({name: 'hide'}, callback);
            }
        });
    }

    if (data.name == 'show' && this.state != 'show') {
        this.state = 'show';
        this.visible = true;
        this.interactiveChildren = true;

        if (callback) callback();
    }
    if (data.name == 'hide' && this.state != 'hide') {
        this.state = 'hide';
        this.visible = false;
        this.interactiveChildren = false;

        if (callback) callback();
    }
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var PanelSurrender = function (config) {
    config.sizeType = 'absolute';
    config.width = 954*TEXTURE_UPSIZER;
    config.height = 308*TEXTURE_UPSIZER;
    Gui.BasePanel.call(this, config);


    var self = this;

    this.initBlockInputBg(5000*TEXTURE_UPSIZER, 5000*TEXTURE_UPSIZER, bind(function () {

    }, this));
    this.invisibleBg.alpha = 0.5;

    this.state = 'hide';
    this.visible = false;
    this.interactiveChildren = false;

    this.bg = Util.setParams(new PIXI.Sprite(assetsManager.getTexture('atlas', 'panel_bg_1.png')), {
        parent: this,
        aX: 0.5,
        aY: 0.5
    });

    this.labelTitle = Util.setParams(new Gui.LocalizedText('give_up_and_reveal_the_puzzle', Object.assign({wordWrap: true, wordWrapWidth: 560*TEXTURE_UPSIZER}, constsManager.getData('text_styles/common_ui_text')), 600*TEXTURE_UPSIZER, 330*TEXTURE_UPSIZER), {
        parent: this,
        aX: 0.5,
        aY: 0.5,
        x: 0,
        y: -70*TEXTURE_UPSIZER
    });

    this.buttonClose = Gui.createSimpleButton({
            name: 'button_close',
            parentPanel: this,
            width: 69*TEXTURE_UPSIZER,
            height: 69*TEXTURE_UPSIZER,
            x: (630 / 2 - 30)*TEXTURE_UPSIZER,
            y: (-615 / 2 + 30)*TEXTURE_UPSIZER
        },
        {
            pathToSkin: 'button_close.png',
            onClick: function () {
                if (app.screenGame.state != 'show') return;

                self.tween({name: 'hide_anim'}, function () {
                    if (app.gameData.settings.timeMode) app.screenGame.panelTime.activate();
                });
            }
        });

    this.buttonYes = Gui.createTextButton({
            name: 'button_yes',
            parentPanel: this,
            width: 270*TEXTURE_UPSIZER,
            height: 116*TEXTURE_UPSIZER,
            x: 158*TEXTURE_UPSIZER,
            y: 220*TEXTURE_UPSIZER
        },
        {
            pathToSkin: 'button_yes.png',
            onClick: function () {
                if (app.screenGame.state != 'show') return;
    
                app.screenGame.panelInGameMenu.tween({ name: 'hide_anim' }, function () {
                });

                self.tween({name: 'hide_anim'}, function () {
                    app.screenGame.surrender();
                });
            }
        }, {
            textKey: 'yes',
            x: 0,
            y: 0,
            style: constsManager.getData('text_styles/common_button_text')
        });

    this.buttonNo = Gui.createTextButton({
            name: 'button_no',
            parentPanel: this,
            width: 270*TEXTURE_UPSIZER,
            height: 116*TEXTURE_UPSIZER,
            x: -158*TEXTURE_UPSIZER,
            y: 220*TEXTURE_UPSIZER
        },
        {
            pathToSkin: 'button_no.png',
            onClick: function () {
                if (app.screenGame.state != 'show') return;

                self.tween({name: 'hide_anim'}, function () {
                    if (app.gameData.settings.timeMode) app.screenGame.panelTime.activate();
                });
            }
        }, {
            textKey: 'no',
            x: 0,
            y: 0,
            style: constsManager.getData('text_styles/common_button_text')
        });

    // this.textTime = Util.setParams(new Gui.TextBmp('0:00',  constsManager.getData('text_configs/timer_text')), {parent: this, aX:0.0, aY:0.5, x: 0, y: 14});
}
PanelSurrender.prototype = Object.create(Gui.BasePanel.prototype);
PanelSurrender.prototype.constructor = PanelSurrender;

PanelSurrender.prototype.tween = function (data, callback) {
    var self = this;


    if (data.name == 'show_anim' && this.state == 'hide') {
        this.state = 'show_anim';
        this.visible = true;
        this.alpha = 0;

        this.y = -90*TEXTURE_UPSIZER;

        if (app.screenGame.panelTime.isAlarm) app.hideAlarm();

        TweenMax.to(this, 10 / 30, {
            alpha: 1, y: 10*TEXTURE_UPSIZER, ease: Power2.easeOut, onComplete: function () {
                self.tween({name: 'show'}, callback);
            }
        });

        if (app.gameData.settings.timeMode) app.screenGame.panelTime.pause();
    }

    if (data.name == 'hide_anim' && this.state == 'show') {
        this.state = 'hide_anim';
        this.interactiveChildren = false;

        TweenMax.to(this, 10 / 30, {
            alpha: 0, y: -90*TEXTURE_UPSIZER, ease: Power2.easeOut, onComplete: function () {
                // if(app.screenGame.panelTime.isAlarm) app.showAlarm();

                self.tween({name: 'hide'}, callback);
            }
        });
    }

    if (data.name == 'show' && this.state != 'show') {
        this.state = 'show';
        this.visible = true;
        this.interactiveChildren = true;

        if (callback) callback();
    }
    if (data.name == 'hide' && this.state != 'hide') {
        this.state = 'hide';
        this.visible = false;
        this.interactiveChildren = false;

        if (callback) callback();
    }
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var PanelTimesUp = function (config) {
    config.sizeType = 'absolute';
    config.width = 954*TEXTURE_UPSIZER;
    config.height = 308*TEXTURE_UPSIZER;
    Gui.BasePanel.call(this, config);


    var self = this;

    this.initBlockInputBg(5000*TEXTURE_UPSIZER, 5000*TEXTURE_UPSIZER, bind(function () {

    }, this));
    this.invisibleBg.alpha = 0.5;

    this.state = 'hide';
    this.visible = false;
    this.interactiveChildren = false;

    this.bg = Util.setParams(new PIXI.Sprite(assetsManager.getTexture('atlas', 'end_game_panel_bg_small.png')), {
        parent: this,
        aX: 0.5,
        aY: 0.5
    });

    this.labelTitle = Util.setParams(new Gui.LocalizedText('time_is_up', Object.assign({wordWrap: true, wordWrapWidth: 560*TEXTURE_UPSIZER}, constsManager.getData('text_styles/common_ui_text_bigger')), 560*TEXTURE_UPSIZER, 220*TEXTURE_UPSIZER), {
        parent: this,
        aX: 0.5,
        aY: 0.5,
        x: 0,
        y: -60*TEXTURE_UPSIZER
    });


    // this.panelStreak = new PanelStreak({parentPanel: this, x: 0, y: -20});

    this.buttonHome = Gui.createSimpleButton({
            name: 'button_home',
            parentPanel: this,
            width: 270*TEXTURE_UPSIZER,
            height: 116*TEXTURE_UPSIZER,
            x: -204*TEXTURE_UPSIZER,
            y: 85*TEXTURE_UPSIZER
        },
        {
            pathToSkin: 'button_home.png',
            onClick: function () {
                if (app.screenGame.state != 'show') return;

                self.tween({name: 'hide_anim'}, function () {
                    app.screenGame.toMainMenu();
                });
            }
        });

    this.buttonReplay = Gui.createTextButton({
            name: 'button_replay',
            parentPanel: this,
            width: 345*TEXTURE_UPSIZER,
            height: 116*TEXTURE_UPSIZER,
            x: 204*TEXTURE_UPSIZER,
            y: 85*TEXTURE_UPSIZER
        },
        {
            pathToSkin: 'button_replay.png',
            onClick: function () {
                if (app.screenGame.state != 'show') return;

                self.tween({name: 'hide_anim'}, function () {
                    app.screenGame.replay();
                });

                app.playAudio('sounds', 'sound_play_button');

                app.apiCallback('start');
            }
        }, {
        textKey: 'new_puzzle',
            x: 0,
            y: 0,
            style: constsManager.getData('text_styles/common_button_text'),
            wordWrap: true,
            wordWrapWidth: 280*TEXTURE_UPSIZER,
            maxHeight: 110*TEXTURE_UPSIZER,
            maxWidth: 300*TEXTURE_UPSIZER
    });
    this.buttonReplay.isClickSound = false;

    this.buttonClose = Gui.createSimpleButton({
            name: 'button_close',
            parentPanel: this,
            width: 69*TEXTURE_UPSIZER,
            height: 69*TEXTURE_UPSIZER,
            x: (953 / 2 - 40)*TEXTURE_UPSIZER,
            y: (-338 / 2 + 40)*TEXTURE_UPSIZER
        },
        {
            pathToSkin: 'button_close.png',
            onClick: function () {
                if (app.screenGame.state != 'show') return;

                self.tween({name: 'hide_anim'}, function () {
                    app.screenGame.showReplayButton();
                    // app.field.revealWords(function()
                    // {
                    //   app.screenGame.invisibleBg.interactive = true;
                    // });
                });
            }
        });

    // this.textTime = Util.setParams(new Gui.TextBmp('0:00',  constsManager.getData('text_configs/timer_text')), {parent: this, aX:0.0, aY:0.5, x: 0, y: 14});
}
PanelTimesUp.prototype = Object.create(Gui.BasePanel.prototype);
PanelTimesUp.prototype.constructor = PanelTimesUp;

PanelTimesUp.prototype.tween = function (data, callback) {
    var self = this;


    if (data.name == 'show_anim' && this.state == 'hide') {
        this.state = 'show_anim';
        this.visible = true;
        this.alpha = 0;

        // this.panelStreak.updateStreak();

        this.y = -100*TEXTURE_UPSIZER;

        TweenMax.to(this, 10 / 30, {
            alpha: 1, y: 0, ease: Power2.easeOut, onComplete: function () {
                self.tween({name: 'show'}, callback);
            }
        });
    }

    if (data.name == 'hide_anim' && this.state == 'show') {
        this.state = 'hide_anim';
        this.interactiveChildren = false;

        TweenMax.to(this, 10 / 30, {
            alpha: 0, y: -100*TEXTURE_UPSIZER, ease: Power2.easeOut, onComplete: function () {
                self.tween({name: 'hide'}, callback);
            }
        });
    }

    if (data.name == 'show' && this.state != 'show') {
        this.state = 'show';
        this.visible = true;
        this.interactiveChildren = true;

        if (callback) callback();
    }
    if (data.name == 'hide' && this.state != 'hide') {
        this.state = 'hide';
        this.visible = false;
        this.interactiveChildren = false;

        if (callback) callback();
    }
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var PanelHelpDirections = function (config) {
    config.sizeType = 'absolute';
    config.width = 954*TEXTURE_UPSIZER;
    config.height = 308*TEXTURE_UPSIZER;
    Gui.BasePanel.call(this, config);


    var self = this;

    this.initBlockInputBg(5000*TEXTURE_UPSIZER, 5000*TEXTURE_UPSIZER, bind(function () {

    }, this));
    this.invisibleBg.alpha = 0.5;

    this.state = 'hide';
    this.visible = false;
    this.interactiveChildren = false;

    this.bg = Util.setParams(new PIXI.Sprite(assetsManager.getTexture('atlas', 'panel_bg_1.png')), {
        parent: this,
        aX: 0.5,
        aY: 0.5
    });
    this.bg.scale.x = this.bg.scale.y = 1.12;
    // console.log(this.bg.width);

    this.labelTitle =  Util.setParams(new Gui.LocalizedText('word_directions', constsManager.getData('text_styles/ui_panel_header_text'), 600*TEXTURE_UPSIZER, 100*TEXTURE_UPSIZER), {
        parent: this,
        aX: 0.5,
        aY: 0.5,
        x: 0,
        y: -295*TEXTURE_UPSIZER
    });

    this.helps = {};
    var dificults = ['easy', 'medium', 'hard', 'maniac'];
    for (var i = 0; i < dificults.length; i++) {
        var help = this.createDificultHelp(dificults[i]);
        this.addChild(help);
        help.scale.x = help.scale.y = 0.9;
        help.y = -30*TEXTURE_UPSIZER;
        help.visible = false;
        this.helps[dificults[i]] = help;
    }

    this.buttonOk = Gui.createTextButton({
            name: 'button_okay',
            parentPanel: this,
            width: 270*TEXTURE_UPSIZER,
            height: 116*TEXTURE_UPSIZER,
            x: 0*TEXTURE_UPSIZER,
            y: 270*TEXTURE_UPSIZER
        },
        {
            pathToSkin: 'button_play.png',
            onClick: function () {
                if (app.screenGame.state != 'show') return;

                self.tween({name: 'hide_anim'}, function () {
                    if (app.gameData.settings.timeMode) app.screenGame.panelTime.activate();
                });
            }
        }, {
            textKey: 'okay',
            x: 0*TEXTURE_UPSIZER,
            y: 3*TEXTURE_UPSIZER,
            style: constsManager.getData('text_styles/common_button_text')
        });

    // this.y =50;

    // this.textTime = Util.setParams(new Gui.TextBmp('0:00',  constsManager.getData('text_configs/timer_text')), {parent: this, aX:0.0, aY:0.5, x: 0, y: 14});
}
PanelHelpDirections.prototype = Object.create(Gui.BasePanel.prototype);
PanelHelpDirections.prototype.constructor = PanelHelpDirections;

PanelHelpDirections.prototype.createDificultHelp = function (dificult) {
    var container = new PIXI.Container();

    if (dificult == 'easy') {
        createArrow('1', 'single', 0);
        createArrow('2', 'single', 90);
    } else if (dificult == 'medium') {
        createArrow('1', 'single', 0);
        createArrow('3', 'single', 45);
        createArrow('2', 'single', 90);
        createArrow('4', 'single', 360 - 45);
    } else if (dificult == 'hard') {
        createArrow('1', 'double', 0);
        createArrow('3', 'double', 45);
        createArrow('2', 'double', 90);
        createArrow('4', 'double', 135);
    } else if (dificult == 'maniac') {
        createArrow('1', 'double', 0);
        createArrow('3', 'double', 45);
        createArrow('2', 'double', 90);
        createArrow('4', 'double', 135);
    }

    return container;

    function createArrow(color, type, angle) {
        var arrow = new PIXI.Sprite(assetsManager.getTexture('atlas', 'dificult_help_arrow_' + type + '_' + color + '.png'));
        container.addChild(arrow);
        arrow.anchor.set(0.5, 0.5);
        arrow.rotation = angle * Util.TO_RADIANS;

        return arrow;
    }
}

PanelHelpDirections.prototype.tween = function (data, callback) {
    var self = this;


    if (data.name == 'show_anim' && this.state == 'hide') {
        this.state = 'show_anim';
        this.visible = true;
        this.alpha = 0;

        for (var dificult in this.helps) {
            var help = this.helps[dificult];
            help.visible = false;
        }
        // console.log(this.helps, app.gameData.settings.dificult);
        this.helps[app.gameData.settings.dificult].visible = true;

        this.y = -90*TEXTURE_UPSIZER;

        TweenMax.to(this, 10 / 30, {
            alpha: 1, y: 10*TEXTURE_UPSIZER, ease: Power2.easeOut, onComplete: function () {
                self.tween({name: 'show'}, callback);
            }
        });
    }

    if (data.name == 'hide_anim' && this.state == 'show') {
        this.state = 'hide_anim';
        this.interactiveChildren = false;

        TweenMax.to(this, 10 / 30, {
            alpha: 0, y: -90*TEXTURE_UPSIZER, ease: Power2.easeOut, onComplete: function () {
                self.tween({name: 'hide'}, callback);
            }
        });
    }

    if (data.name == 'show' && this.state != 'show') {
        this.state = 'show';
        this.visible = true;
        this.interactiveChildren = true;

        if (callback) callback();
    }
    if (data.name == 'hide' && this.state != 'hide') {
        this.state = 'hide';
        this.visible = false;
        this.interactiveChildren = false;

        if (callback) callback();
    }
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var Animation = function () {
    PIXI.Container.call(this);


    this.sequences = {};
    this.sequence = null;

    this.lastSequence = null;
    this.lastFrame = -1;

    app.addForUpdate(this.update, this);
}
Animation.prototype = Object.create(PIXI.Container.prototype);
Animation.prototype.constructor = Animation;

Animation.prototype.addSequence = function (name, textureAtlas, path, nStart, nEnd, fps, data) {
    var self = this;

    var frames = [];
    for (var i = nStart; i <= nEnd; i++) {
        var n = '';
        if (i < 10) n = '000' + i;
        else if (i < 100) n = '00' + i;
        else if (i < 1000) n = '0' + i;
        frames.push(assetsManager.getTexture(textureAtlas, path + n + '.png'));
    }

    // var animation = new PIXI.extras.MovieClip(frames);
    var animation = new PIXI.extras.AnimatedSprite(frames);
    this.addChild(animation);
    animation.animationSpeed = fps / 60;

    var aX = data.aX != undefined ? data.aX : 0;
    var aY = data.aY != undefined ? data.aY : 0;
    if (!(aX == 0 && aY == 0)) animation.anchor.set(aX, aY);
    var pivotX = data.pivotX != undefined ? data.pivotX : 0;
    var pivotY = data.pivotY != undefined ? data.pivotY : 0;
    animation.pivot.x = pivotX;
    animation.pivot.y = pivotY;
    animation.x = data.x != undefined ? data.x : 0;
    animation.y = data.y != undefined ? data.y : 0;

    // console.log(aX, aY, animation.anchor);

    animation.visible = false;
    // animation.onFrameChange = this.onFrameChange;
    // console.log(animation);

    var loop = data.loop == undefined ? true : data.loop;

    var sequence = {name: name, animation: animation, fps: fps, loop: loop};
    this.sequences[name] = sequence;

    animation.onFrameChange = function (frame) {
        self.onFrameChange(frame + 1, sequence);
    }
    // animation.onComplete = function(frame)
    // {
    //   console.log('zzz');
    //   self.onComplete(sequence);
    // }
}

Animation.prototype.switchSequence = function (name) {
    if (this.sequence != null) {
        this.sequence.animation.stop();
        this.sequence.animation.visible = false;
    }

    this.sequence = this.sequences[name];
    this.sequence.animation.visible = true;
    // this.sequence.animation.play();
}
Animation.prototype.play = function () {
    if (this.sequence == null) return;

    this.sequence.animation.play();
}
Animation.prototype.gotoAndPlay = function (frame) {
    // this.sequence.currentFrame = frame-1;
    // this.play();
    this.sequence.animation.gotoAndPlay(frame - 1);
}
Animation.prototype.stop = function () {
    if (this.sequence == null) return;

    this.sequence.animation.stop();
}
Animation.prototype.gotoAndStop = function (frame) {
    this.sequence.animation.gotoAndStop(frame - 1);
}
Animation.prototype.onFrameChange = function (frame, sequence) {
    // console.log(this.sequence.animation.currentFrame);
    // console.log(frame, sequence.name);
    if (this.sequence != sequence) return;

    this.emit('frame', {name: sequence.name, sequence: sequence, frame: frame});
    this.emit(sequence.name + '_frame_' + frame, {name: sequence.name, sequence: sequence, frame: frame});


    if (frame == sequence.animation.totalFrames) this.emit(sequence.name + '_complete', {
        name: sequence.name,
        sequence: sequence,
        frame: frame
    });
    if (frame == sequence.animation.totalFrames) this.emit('complete', {name: sequence.name, sequence: sequence});

    if (frame == sequence.animation.totalFrames && !sequence.loop) this.stop();

    // console.log(sequence.animation.totalFrames);
}
// Animation.prototype.onComplete = function(sequence)
// {
//   if(this.sequence != sequence) return;


//   console.log('complete');
// }

Animation.prototype.update = function () {
    if (this.sequence == null) return;

    // var frame;

    // console.log('z');
}