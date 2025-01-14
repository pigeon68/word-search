var ScreenMainMenu = function (config) {
    config.sizeType = 'relative';
    config.widthRelative = 1;
    config.heightRelative = 1;
    Gui.BasePanel.call(this, config);


    var self = this;

    this.state = 'hide';
    this.visible = false;
    this.interactiveChildren = false;

    this.logo = new PIXI.Sprite(assetsManager.getTexture('atlas', 'WordSearch-logo-black.png'));
    this.addChild(this.logo);
    this.logo.anchor.set(0.5, 0.5);
    this.logo.y = -385*TEXTURE_UPSIZER;

    /* const logoText = new Gui.LocalizedText('title_line_1', constsManager.getData('text_styles/title_text'), 390*TEXTURE_UPSIZER);
    this.addChild(logoText);
    logoText.anchor.set(0.5, 0.5);
    logoText.x = -10*TEXTURE_UPSIZER;
    logoText.y = -440*TEXTURE_UPSIZER;

    const logoText2 = new Gui.LocalizedText('title_line_2', constsManager.getData('text_styles/title_text'), 580*TEXTURE_UPSIZER);
    this.addChild(logoText2);
    logoText2.anchor.set(0.5, 0.5);
    logoText2.x = 0;
    logoText2.y = -328*TEXTURE_UPSIZER; */


    this.buttonPlayContainer = new PIXI.Container();
    this.addChild(this.buttonPlayContainer);

    

    this.onPlayClickHandler = (isSimulatedClick) => {
        if (this.state != 'show') return;

        app.apiCallback('start');

        app.screenGame.initGame();
        TweenMax.delayedCall(3 / 30, function () {
            self.tween({ name: 'hide_anim' });

            TweenMax.delayedCall(10 / 30, function () {
                app.screenGame.tween({ name: 'show_anim' });
            });
        });

        app.playAudio('sounds', 'sound_play_button');
        
        if (!isSimulatedClick) app.saveMenuStateToStorage();
    };

    this.buttonPlay = Gui.createTextButton({
            name: 'button_play',
            parentPanel: this,
            layer: this.buttonPlayContainer,
            width: 570*TEXTURE_UPSIZER,
            height: 155*TEXTURE_UPSIZER
        },
        {
            pathToSkin: 'button_play.png',
            onClick: () => {
                this.onPlayClickHandler();
            }
        }, {
            textKey: 'play',
            x: 0,
            y: 3*TEXTURE_UPSIZER,
            style: constsManager.getData('text_styles/play_button_text'),
        });
    this.buttonPlay.isClickSound = false;

    this.menuScaleContainer = new PIXI.Container();
    this.addChild(this.menuScaleContainer);

    this.panelDificulty = new PanelDificulty({parentPanel: this, layer: this.menuScaleContainer, y: 0*TEXTURE_UPSIZER});

    const _cdy = 189 + 47;

    this.panelLanguage = new PanelLanguage({
        parentPanel: this,
        layer: this.menuScaleContainer,
        y: this.panelDificulty.y + _cdy*TEXTURE_UPSIZER
    });

    this.panelCategory = new PanelCategory({
        parentPanel: this,
        layer: this.menuScaleContainer,
        y: this.panelDificulty.y + _cdy * 2*TEXTURE_UPSIZER
    });

    this.panelClock = new PanelClock({
        parentPanel: this,
        layer: this.menuScaleContainer,
        x: -201*TEXTURE_UPSIZER,
        y: this.panelDificulty.y + 150*TEXTURE_UPSIZER + _cdy * 2*TEXTURE_UPSIZER
    });
    this.panelClock.visible = false;

    this.panelHideWords = new PanelHideWords({
        parentPanel: this,
        layer: this.menuScaleContainer,
        x: 201*TEXTURE_UPSIZER,
        y: this.panelDificulty.y + 150*TEXTURE_UPSIZER + _cdy * 2*TEXTURE_UPSIZER
    });
    this.panelHideWords.visible = false;


    this.menuScaleContainer.addChild(this.panelDificulty);
    this.menuScaleContainer.addChild(this.panelCategory);
    this.menuScaleContainer.addChild(this.panelLanguage);

    guiManager.on('orientation_change', this.onOrientationChange, this);
}
ScreenMainMenu.prototype = Object.create(Gui.BasePanel.prototype);
ScreenMainMenu.prototype.constructor = ScreenMainMenu;

ScreenMainMenu.prototype.onOrientationChange = function (data) {
    var orientation = data.orientation;

    if (orientation == 'portrait') {
        this.menuScaleContainer.scale.set(0.95);
        this.menuScaleContainer.y = -135*TEXTURE_UPSIZER;
        this.buttonPlayContainer.y = 530*TEXTURE_UPSIZER;
        this.buttonPlayContainer.scale.set(1);
    }
    if (orientation == 'landscape') {
        this.menuScaleContainer.scale.set(0.74);
        this.menuScaleContainer.y = -175*TEXTURE_UPSIZER;
        this.buttonPlayContainer.y = 370*TEXTURE_UPSIZER;
        this.buttonPlayContainer.scale.set(0.8);
    }
}

ScreenMainMenu.prototype.tween = function (data, callback) {
    var self = this;

    var tweenTime = 18 / 30;

    if (data.name == 'show_anim' && this.state == 'hide') {
        this.state = 'show_anim';
        this.visible = true;
        this.alpha = 0;

        var targetX = (guiManager.orientation == 'portrait') ? 0 : 0;
        var targetY = (guiManager.orientation == 'portrait') ? 0 : 0;

        if (guiManager.orientation == 'portrait') {
            this.x = 0;
            this.y = -150*TEXTURE_UPSIZER;
        } else {
            this.x = -100*TEXTURE_UPSIZER;
            this.y = 0;
        }

        TweenMax.to(this, 12 / 30, {
            alpha: 1, x: targetX, y: targetY, ease: Power2.easeOut, onComplete: function () {
                self.tween({name: 'show'}, callback);
            }
        });

        this.panelCategory.updateCategories();
    }

    if (data.name == 'hide_anim' && this.state == 'show') {
        this.state = 'hide_anim';
        this.interactiveChildren = false;

        this.buttonPlay.interactive = false;

        var targetX = (guiManager.orientation == 'portrait') ? 0 : -100*TEXTURE_UPSIZER;
        var targetY = (guiManager.orientation == 'portrait') ? -150*TEXTURE_UPSIZER : 0;

        TweenMax.to(this, 12 / 30, {
            alpha: 0, x: targetX, y: targetY, ease: Power2.easeOut, onComplete: function () {
                self.tween({name: 'hide'}, callback);
            }
        });

        if (guiManager.orientation == 'landscape') TweenMax.to(app.alignContainer, 12 / 30, {
            width: 1350*TEXTURE_UPSIZER,
            ease: Power2.easeOut
        });
    }

    if (data.name == 'show' && this.state != 'show') {
        this.state = 'show';
        this.visible = true;
        this.interactiveChildren = true;

        this.buttonPlay.interactive = true;

        if (callback) callback();
    }
    if (data.name == 'hide' && this.state != 'hide') {
        this.state = 'hide';
        this.visible = false;
        this.interactiveChildren = false;

        if (callback) callback();
    }
}

var ExpandedPanel = function (config) {
    Gui.BasePanel.call(this, config);

    this.expandedData = config.expandedData;

    this.topBorder = new PIXI.Sprite(assetsManager.getTexture(this.expandedData.border.textureAtlas, this.expandedData.border.path));
    this.addChild(this.topBorder);
    this.topBorder.anchor.set(0.5, 1.0);
    // this.topBorder.y = 2;

    this.botBorder = new PIXI.Sprite(assetsManager.getTexture(this.expandedData.border.textureAtlas, this.expandedData.border.path));
    this.addChild(this.botBorder);
    this.botBorder.anchor.set(0.5, 1.0);
    this.botBorder.scale.y = -1;
    // this.botBorder.y = -2;

    this.panelContent = new Gui.BasePanel({parentPanel: this, width: this.width, height: this.height});

    this.body = new PIXI.Sprite(assetsManager.getTexture(this.expandedData.body.textureAtlas, this.expandedData.body.path));
    this.panelContent.addChild(this.body);
    this.body.anchor.set(0.5, 0.5);
    this.body.width = this.width;

    this.updateSize();
}
ExpandedPanel.prototype = Object.create(Gui.BasePanel.prototype);
ExpandedPanel.prototype.constructor = ExpandedPanel;

ExpandedPanel.prototype.updateSize = function () {
    Gui.BasePanel.prototype.updateSize.call(this);

    if (this.expandedData == null) return;

    this.body.height = this.height;
    this.botBorder.y = this.height;

    this.panelContent.height = this.height;
    this.panelContent.y = this.height / 2;
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var PanelDificulty = function (config) {
    config.width = 804*TEXTURE_UPSIZER;
    config.height = 0;
    config.expandedData =
        {
            border: {textureAtlas: 'atlas', path: 'expanded_panel_border.png', height: 20*TEXTURE_UPSIZER},
            body: {textureAtlas: 'atlas', path: 'expanded_panel_body.png'}
        };
    ExpandedPanel.call(this, config);

    // this.botBorder.visible = false;
    // this.topBorder.visible = false;
    // this.topBorder.y = 30;


    var self = this;
    this.expandState = 'hide';

    this.initBlockInputBg(3000*TEXTURE_UPSIZER, 3000*TEXTURE_UPSIZER, function () {
        self.tween({name: 'hide_expand'});
    });
    this.invisibleBg.interactive = false;

    this.helpContainer = new PIXI.Container();
    this.panelContent.addChild(this.helpContainer);
    this.helpContainer.alpha = 0;

    this.helpContainerDirections = new PIXI.Container();
    this.helpContainer.addChild(this.helpContainerDirections);

    this.helpTitle = new Gui.LocalizedText('word_directions', constsManager.getData('text_styles/difficulty_header_text'));
    this.helpContainerDirections.addChild(this.helpTitle);
    this.helpTitle.anchor.set(0.5, 0.5);
    this.helpTitle.y = -100*TEXTURE_UPSIZER;

    this.helpDescForManiac = new Gui.LocalizedText('help_desc_for_maniac', constsManager.getData('text_styles/help_desc_for_maniac'), 700*TEXTURE_UPSIZER);
    this.helpContainer.addChild(this.helpDescForManiac);
    this.helpDescForManiac.anchor.set(0.5, 0.5);
    this.helpDescForManiac.y = 15*TEXTURE_UPSIZER;

    this.helpContainerDirections.visible = true;
    this.helpDescForManiac.visible = false;

    this.helpPanels = {};
    this.currentHelpPanel = null;
    var dificults = ['easy', 'medium', 'hard', 'maniac'];
    for (var i = 0; i < dificults.length; i++) {
        var img = this.createDificultHelp(dificults[i]);
        this.helpContainerDirections.addChild(img);
        img.y = 85*TEXTURE_UPSIZER;
        img.scale.x = img.scale.y = 0.68;
        var helpPanel = {img: img, dificult: dificults[i]};
        this.helpPanels[dificults[i]] = helpPanel;
        img.visible = false;
        img.interactive = false;

        if (i == 1) {
            img.visible = true;

            this.currentHelpPanel = helpPanel;
        }
    }

    this.buttonArrow = Gui.createSimpleButton({
            name: 'button_arrow',
            parentPanel: this.panelContent,
            width: 97*TEXTURE_UPSIZER,
            height: 97*TEXTURE_UPSIZER,
            positionType: 'right-bot',
            xRelative: -10*TEXTURE_UPSIZER,
            yRelative: 45*TEXTURE_UPSIZER
        },
        {
            pathToSkin: 'button_arrow.png',
            onClick: function () {
                if (self.expandState == 'hide') self.tween({name: 'show_expand'});
                else if (self.expandState == 'show') self.tween({name: 'hide_expand'});
            }
        });
    this.buttonArrow.alpha = 0;
    this.buttonArrow.visible = false;

    this.title = new PIXI.Sprite(assetsManager.getTexture('atlas', 'panel_dificulty_title.png'));
    this.addChild(this.title);
    this.title.anchor.set(0.5, 0.5);
    this.title.y = -95*TEXTURE_UPSIZER;

    this.titleText = new Gui.LocalizedText('difficulty', constsManager.getData('text_styles/main_menu_header_text'));
    this.addChild(this.titleText);
    this.titleText.anchor.set(0.5, 0.5);
    this.titleText.y = -95*TEXTURE_UPSIZER;


    this.buttonHelp = new Gui.BaseButton({parentPanel: this, x: this.titleText.width / 2 + 30*TEXTURE_UPSIZER, y: -95*TEXTURE_UPSIZER}, false);
    this.imgHelp = new PIXI.Sprite(assetsManager.getTexture('atlas', 'button_circle_help.png'));
    this.buttonHelp.addChild(this.imgHelp);
    this.imgHelp.anchor.set(0.5, 0.5);
    this.buttonHelp.on('button_click', function () {
        // this.botBorder.visible = this.topBorder.visible = self.expandState == 'hide';

        if (self.expandState == 'hide' && app.screenMainMenu.panelCategory.expandState == 'hide') self.tween({name: 'show_expand'});
        else if (self.expandState == 'show') self.tween({name: 'hide_expand'});

        
    }, this);

    app.on('language_changed', () => {
        setTimeout(() => this.buttonHelp.x = this.titleText.width / 2 + 30*TEXTURE_UPSIZER , 0);
    })

    this.maniacSaveHideWord = 'none';
    this.maniacSaveTimeMode = 'none';

    var menuSelector = new PIXI.Sprite(assetsManager.getTexture('atlas', 'panel_dificulty_selector.png'));
    var menuBg = new PIXI.Sprite(assetsManager.getTexture('atlas', 'panel_dificulty_bg.png'));
    menuSelector.scale.set(0.99, 1.4);

    var menuLabelsWhite = [
        new Gui.LocalizedText('easy', constsManager.getData('text_styles/difficulty_label_white_text'), 165*TEXTURE_UPSIZER),
        new Gui.LocalizedText('medium', constsManager.getData('text_styles/difficulty_label_white_text'), 165*TEXTURE_UPSIZER),
        new Gui.LocalizedText('hard', constsManager.getData('text_styles/difficulty_label_white_text'), 165*TEXTURE_UPSIZER),
        new Gui.LocalizedText('maniac', constsManager.getData('text_styles/difficulty_label_white_text'), 165*TEXTURE_UPSIZER),

    ];
    var menuLabelsGrey = [
        new Gui.LocalizedText('easy', constsManager.getData('text_styles/difficulty_label_grey_text'), 165*TEXTURE_UPSIZER),
        new Gui.LocalizedText('medium', constsManager.getData('text_styles/difficulty_label_grey_text'), 165*TEXTURE_UPSIZER),
        new Gui.LocalizedText('hard', constsManager.getData('text_styles/difficulty_label_grey_text'), 165*TEXTURE_UPSIZER),
        new Gui.LocalizedText('maniac', constsManager.getData('text_styles/difficulty_label_grey_text'), 165*TEXTURE_UPSIZER),
    ];

    this.menu = new PanelLinearMenu({
        parentPanel: this,
        width: 700*TEXTURE_UPSIZER,
        height: 72*TEXTURE_UPSIZER,
        segmentWidth: 175*TEXTURE_UPSIZER,
        selector: menuSelector,
        bg: menuBg,
        labelsWhite: menuLabelsWhite,
        labelsGrey: menuLabelsGrey,
        segmentsName: ['easy', 'medium', 'hard', 'maniac']
    });
    this.menu.scale.set(1.15)
    this.menu.y = 0;
    this.menu.on('switch', function (data) {
        app.gameData.settings.dificult = data.segment;

        if (this.currentHelpPanel.dificult != data.segment) this.tween({name: 'switch_help', dificult: data.segment});

        app.screenMainMenu.panelCategory.updateCategories();

        if (app.gameData.settings.dificult == 'maniac') {
            if (app.gameData.settings.timeMode) this.maniacSaveTimeMode = 'true';
            else this.maniacSaveTimeMode = 'false';
            if (app.gameData.settings.hideWords) this.maniacSaveHideWord = 'true';
            else this.maniacSaveHideWord = 'false';

            if (app.screenMainMenu.panelClock.menu.state != 'lock') app.screenMainMenu.panelClock.menu.lock();
            if (app.screenMainMenu.panelHideWords.menu.state != 'lock') app.screenMainMenu.panelHideWords.menu.lock();
        } else {
            if (app.screenMainMenu.panelClock.menu.state == 'lock') app.screenMainMenu.panelClock.menu.unlock(this.maniacSaveTimeMode == 'true' ? 'on' : 'off');
            if (app.screenMainMenu.panelHideWords.menu.state == 'lock') app.screenMainMenu.panelHideWords.menu.unlock(this.maniacSaveHideWord == 'true' ? 'on' : 'off');
        }

        app.saveMenuStateToStorage();
    }, this);
    app.gameData.settings.dificult = this.menu.currentSegment.name;

    this.menu.bg.visible = false;

    this.panelContent.interactive = true;
}
PanelDificulty.prototype = Object.create(ExpandedPanel.prototype);
PanelDificulty.prototype.constructor = PanelDificulty;

PanelDificulty.prototype.createDificultHelp = function (dificult) {
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

PanelDificulty.prototype.tween = function (data, callback) {
    var self = this;

    if (data.name == 'switch_help') {
        var prevHelpPanel = this.currentHelpPanel;
        var nextHelpPanel = this.helpPanels[data.dificult];
        nextHelpPanel.img.visible = true;
        nextHelpPanel.img.alpha = 0;
        nextHelpPanel.img.scale.x = nextHelpPanel.img.scale.y = 0.5;

        var time = 8 / 30;

        TweenMax.to(this.currentHelpPanel.img, time, {alpha: 0, ease: Power0.None});
        TweenMax.to(this.currentHelpPanel.img.scale, time, {x: 0.5, y: 0.5, ease: Power0.None});
        TweenMax.to(nextHelpPanel.img.scale, time, {x: 0.68, y: 0.68, delay: 5 / 30, ease: Power2.easeOut});
        TweenMax.to(nextHelpPanel.img, time, {
            alpha: 1, delay: 5 / 30, ease: Power2.easeOut, onComplete: function () {
                prevHelpPanel.img.visible = false;
            }
        });

        self.currentHelpPanel = nextHelpPanel;

        if (data.dificult == "maniac") {
            this.helpContainerDirections.visible = false;
            this.helpDescForManiac.visible = true;
        } else {
            this.helpContainerDirections.visible = true;
            this.helpDescForManiac.visible = false;
        }
    }

    if (data.name == 'show_expand' && this.expandState == 'hide') {
        this.expandState = 'to_show';

        this.parent.addChildAt(this, this.parent.children.length - 1);

        this.invisibleBg.interactive = true;

        var time = 0.275;

        TweenMax.to(this.helpContainer, time * 0.5, {alpha: 1, delay: time * 0.5, ease: Power2.easeOut});
        TweenMax.to(this, time, {
            height: 373*TEXTURE_UPSIZER, onComplete: function () {
                self.expandState = 'show';
            }
        });

        this.buttonArrow.visible = true;
        this.buttonArrow.alpha = 0;
        TweenMax.to(this.buttonArrow, time, {rotation: 180 * Util.TO_RADIANS, alpha: 1, ease: Power2.easeOut});
    }
    if (data.name == 'hide_expand' && this.expandState == 'show') {
        this.expandState = 'to_hide';

        var time = 12 / 30;

        TweenMax.to(this.helpContainer, time * 0.5, {alpha: 0, ease: Power2.easeOut});
        TweenMax.to(this, time, {
            height: 0, onComplete: function () {
                self.expandState = 'hide';
                self.invisibleBg.interactive = false;

                self.buttonArrow.visible = false;
            }
        });

        TweenMax.to(this.buttonArrow, time, {rotation: 0 * Util.TO_RADIANS, alpha: 0, ease: Power2.easeOut});
    }    
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var PanelCategory = function (config) {
    config.width = 804*TEXTURE_UPSIZER;
    config.height = 0;
    config.expandedData =
        {
            border: {textureAtlas: 'atlas', path: 'expanded_panel_border.png', height: 20*TEXTURE_UPSIZER},
            body: {textureAtlas: 'atlas', path: 'expanded_panel_body.png'}
        };
    ExpandedPanel.call(this, config);


    var self = this;

    this.scrollV = 0;
    Object.defineProperty(this, 'scroll',
        {
            set: function (value) {
                self.setScroll(value);
            },
            get: function () {
                return this.scrollV;
            }
        });

    this.initBlockInputBg(5000*TEXTURE_UPSIZER, 1000*TEXTURE_UPSIZER, function () {
        self.tween({name: 'hide_expand'});
    });
    this.invisibleBg.interactive = false;

    this.categoryLaneHeight = 75*TEXTURE_UPSIZER;

    this.expandState = 'hide';

    this.containerCategories = new PIXI.Container();
    this.panelContent.addChild(this.containerCategories);

    this.categoryLanes = [];

    this.rebuildCategories();

    this.panelContent.addListener('pointerdown', this.startScroll, this);
    this.panelContent.addListener('pointerup', this.endScroll, this);
    this.panelContent.addListener('pointerupoutside', this.endScroll, this);


    this.title = new PIXI.Sprite(assetsManager.getTexture('atlas', 'panel_category_title.png'));
    this.addChild(this.title);
    this.title.anchor.set(0.5, 0.5);
    this.title.y = -93*TEXTURE_UPSIZER;

    this.titleText = new Gui.LocalizedText('category', constsManager.getData('text_styles/main_menu_header_text'));
    this.addChild(this.titleText);
    this.titleText.anchor.set(0.5, 0.5);
    this.titleText.y = -93*TEXTURE_UPSIZER;

    this.buttonArrow = Gui.createSimpleButton({
            name: 'button_arrow',
            parentPanel: this.panelContent,
            width: 97*TEXTURE_UPSIZER,
            height: 97*TEXTURE_UPSIZER,
            positionType: 'right-bot',
            xRelative: -10*TEXTURE_UPSIZER,
            yRelative: 50*TEXTURE_UPSIZER
        },
        {
            pathToSkin: 'button_arrow.png',
            onClick: function () {
                if(self.parentPanel && self.parentPanel.panelLanguage && self.parentPanel.panelLanguage.expandState === 'show') {
                    self.parentPanel.panelLanguage.tween({name: 'hide_expand'});
                }
                if (self.expandState == 'hide') self.tween({name: 'show_expand'});
                else if (self.expandState == 'show') self.tween({name: 'hide_expand'});
            }
        });
    this.changeBtnHitArea(true);


    this.rebuildScrollBar();

    app.addForUpdate(this.update, this);

    app.on('language_changed', code => {
        this.rebuildCategories();
        this.setScroll(0);
        this.rebuildScrollBar();
    })

    app.on('mouse_wheel', function (d) {
        if (this.categoryLanes.length <= 7 || this.expandState != 'show') return;
        
        d.event.preventDefault();
        d.event.stopImmediatePropagation();
        window['wheelStoppedPropagation'] = true;

        var sign = d.sign;
        var shift = 1 / (this.categoryLanes.length - 7);
        this.scroll = this.scroll + shift * sign;
    }, this);
}
PanelCategory.prototype = Object.create(ExpandedPanel.prototype);
PanelCategory.prototype.constructor = PanelCategory;

PanelCategory.prototype.setActive = function (v) {
    this.panelContent.interactive = v;

    this.containerCategories.interactive = v;
    this.containerCategories.interactiveChildren = v;

    this.scrollBar.interactive = this.scrollBar.interactiveChildren = v;
}

PanelCategory.prototype.startScroll = function (e) {
    e?.data.originalEvent.preventDefault();
    
    if (this.expandState != 'show' || this.state != 'show' || this.scrollPoint != null || e.target == this.buttonArrow) return;
    app.mouse = e.data.global;
    this.scrollPoint = Util.clone(e.data.global);
    this.startScrollV = this.scrollV;
}

PanelCategory.prototype.endScroll = function (e) {
    e?.data.originalEvent.preventDefault();
    
    if (this.expandState != 'show' || this.scrollPoint == null) return;
    this.scrollPoint = null;
    this.smoothScroll();
}

PanelCategory.prototype.rebuildCategories = function () {

    const categories = Config.getInstance().getCategoriesList();

    for(let i = this.categoryLanes.length - 1; i > -1; i--) {
        this.categoryLanes[i].container.destroy({children: true});
        this.categoryLanes.splice(i, 1);
    }
    this.currentCategoryLane = null;
    let _currentCategoryLane = null;
    let _openCategoryFromURL = false;
    let _categoryLaneFromFromURL = null;
    let _openCategoryFromStorage = false;
    let _categoryLaneFromStorage = null;

    this.normalY = 250*TEXTURE_UPSIZER;
    this.expandHeight = Math.min( Math.max(Config.getInstance().getCategoriesList().length - 1, 1) * this.categoryLaneHeight, (400 - 27)*TEXTURE_UPSIZER);

    let categoryY = 0;
    for (let i = 0; i < categories.length; i++) {
        const categoryData = categories[i];

        const categoryLane = new PanelCategory.CategoryLane(categoryData, this.panelContent, this.containerCategories, categoryY);
        this.categoryLanes.push(categoryLane);

        categoryY += this.categoryLaneHeight;

        if (i === 0) _currentCategoryLane = categoryLane;

        if (app.gameData.categoryFromURL && app.gameData.categoryFromURL === categoryLane.data.name && !app.gameData.wasOpenedCategoryFromURLFirstTimeAlready) {
            _categoryLaneFromFromURL = categoryLane;
            _openCategoryFromURL = true;
        }
        if (app.gameData.categoryFromStorage && app.gameData.categoryFromStorage === categoryLane.data.name) {
            _categoryLaneFromStorage = categoryLane;
            _openCategoryFromStorage = true;
        }
        
    }

    if (_openCategoryFromURL) {
        _currentCategoryLane = _categoryLaneFromFromURL;
    } else if (_openCategoryFromStorage) {
        _currentCategoryLane = _categoryLaneFromStorage;
    }

    app.gameData.settings.category = _currentCategoryLane.data;

    this.scrollPoint = null;
    this.panelContent.interactive = true;
    this.body.interactive = true;
    this.scrollBarNormalX = 347*TEXTURE_UPSIZER;

    if (_openCategoryFromURL) {
        stage.visible = false;

        this.selectCategoryLane(_currentCategoryLane, true);
        app.gameData.wasOpenedCategoryFromURLFirstTimeAlready = true;
        requestAnimationFrame(()=>{
            TweenMax.globalTimeScale(10);
            this.tween({name: 'show_expand'});
            TweenMax.delayedCall(0.5, ()=>{
                this.tween({name: 'hide_expand'});
                TweenMax.delayedCall(0.1, ()=>{
                    app.screenMainMenu.onPlayClickHandler(true);
                    TweenMax.delayedCall(3, ()=>{
                        stage.visible = true;
                        TweenMax.globalTimeScale(1);
                    });
                });
            });
        });
    } else if (_openCategoryFromStorage) {
        stage.visible = false;

        this.selectCategoryLane(_currentCategoryLane, true);

        requestAnimationFrame(()=>{
            TweenMax.globalTimeScale(10);
            this.tween({name: 'show_expand'});
            TweenMax.delayedCall(0.5, ()=>{
                this.tween({name: 'hide_expand'});

                TweenMax.delayedCall(0.1, ()=>{
                    stage.visible = true;
                    TweenMax.globalTimeScale(1);
                });
            });
        });
    }
    
}


PanelCategory.prototype.rebuildScrollBar = function () {
    if(this.scrollBar) {
        this.scrollBar.destroy();
    }
    this.scrollBar = null;

    this.scrollBar = new ScrollBar({parentPanel: this, x: this.scrollBarNormalX, height: this.expandHeight - 58*TEXTURE_UPSIZER}, this);
    this.scrollBar.alpha = 0;
    var sliderSize = this.expandHeight / (this.categoryLanes.length * this.categoryLaneHeight) * 405*TEXTURE_UPSIZER;
    if (sliderSize >= this.scrollBar.height)  {
        sliderSize = this.scrollBar.height;
        this.scrollBar.visible = false;
    }
    this.scrollBar.setSliderSize(sliderSize);

    this.scrollV = 0;
    this.startScrollV = 0;
    this.setScroll(0);

    this.containerCategories.interactive = false;
    this.containerCategories.interactiveChildren = false;
    this.scrollBar.interactive = this.scrollBar.interactiveChildren = false;
}

PanelCategory.prototype.setScroll = function (v) {
    if (v < 0) v = 0;
    if (v > 1) v = 1;

    var containerHeight = this.categoryLanes.length * this.categoryLaneHeight;
    var viewHeight = this.panelContent.height;

    if (containerHeight <= viewHeight) v = 0;

    this.scrollV = v;

    this.updateScroll();
}

PanelCategory.prototype.updateScroll = function () {
    var containerHeight = this.categoryLanes.length * this.categoryLaneHeight;
    var viewHeight = this.panelContent.height;

    var scrollShift = -viewHeight / 2 - (containerHeight - this.categoryLaneHeight - viewHeight) * this.scrollV;
    this.containerCategories.y = scrollShift;

    this.scrollBar.setScroll(this.scrollV);

    this.updateCategories();
}

PanelCategory.prototype.update = function () {
    if (this.scrollPoint != null) {
        var shift = -(app.mouse.y - this.scrollPoint.y);
        var shiftV = shift / (this.height);
        this.scroll = this.startScrollV + shiftV;
    }
}
PanelCategory.prototype.updateCategories = function () {
    for (var i = 0; i < this.categoryLanes.length; i++) {
        var categoryLane = this.categoryLanes[i];
        categoryLane.updateDisplay();
    }
}
PanelCategory.prototype.getSmoothedScroll = function (v) {
    var containerHeight = this.categoryLanes.length * this.categoryLaneHeight;
    var viewHeight = this.expandHeight;
    var maxScrollShift = (containerHeight - this.categoryLaneHeight - viewHeight);

    var scrollShift = (containerHeight - this.categoryLaneHeight - viewHeight) * v;
    scrollShift = Math.round(scrollShift / this.categoryLaneHeight) * this.categoryLaneHeight;

    var v = scrollShift / maxScrollShift;

    return v;
}
PanelCategory.prototype.smoothScroll = function (time) {

    if (time == undefined) time = 10 / 30;

    var v = this.getSmoothedScroll(this.scrollV);
    TweenMax.to(this, time, {scroll: v, ease: Power2.easeOut});
}

PanelCategory.prototype.selectCategoryLane = function (lane, doNotSave) {
    if (this.currentCategoryLane != lane) {
        if (this.currentCategoryLane != null) {
            this.currentCategoryLane.tween({name: 'hide_backlight'});
        }

        this.currentCategoryLane = lane;

        if (this.currentCategoryLane != null) {
            this.currentCategoryLane.tween({name: 'show_backlight'});
        }

        app.gameData.settings.category = this.currentCategoryLane.data;

        if (!doNotSave) app.saveMenuStateToStorage();
    }

    this.endScroll();

    var self = this;
    this.state = 'selecting';
    setTimeout(function () {
        self.state = 'show';
        self.tween({name: 'hide_expand'});
    }, 5 / 30 * 1000);
}

PanelCategory.CategoryLane = function (data, panel, layer, y) {
    this.data = data;
    this.panel = panel;
    this.layer = layer;
    this.y = y;
    this.panelCategory = this.panel.parent;

    this.isEnable = false;

    this.container = new PIXI.Container();
    this.layer.addChild(this.container);
    this.container.y = this.y;

    this.interactiveBg = new PIXI.Sprite(assetsManager.getTexture('atlas', 'white_rect.png'));
    this.container.addChild(this.interactiveBg);
    this.interactiveBg.width = 490*TEXTURE_UPSIZER;
    this.interactiveBg.height = 65*TEXTURE_UPSIZER;
    this.interactiveBg.anchor.set(0.5, 0.5);
    this.interactiveBg.alpha = 0;
    this.interactiveBg.interactive = true;
    var onCL = function (e) {
        if (this.panelCategory.expandState == 'show' && this.panelCategory.state == 'show' && this.isEnable) {
            this.panelCategory.selectCategoryLane(this);
            app.playAudio('sounds', 'sound_click');
        }
    }
    this.interactiveBg.on('tap', onCL, this);
    this.interactiveBg.on('click', onCL, this);

    this.backlight = new PIXI.Sprite(assetsManager.getTexture('atlas', 'category_backlight.png'));
    this.container.addChild(this.backlight);
    this.backlight.anchor.set(0.5, 0.5);
    // this.backlight.y = this.y;
    this.backlight.visible = false;
    this.backlight.interactive = false;

    this.label = Util.setParams(new Gui.Text(this.data.name, constsManager.getData('text_configs/category_name')), {
        parent: this.container,
        aX: 0.5,
        aY: 0.5,
        x: 0,
        y: 0
    });
    this.label.interactive = false;

    this.start = new PIXI.Sprite(assetsManager.getTexture('atlas', 'category_star.png'));
    this.container.addChild(this.start);
    this.start.anchor.set(0.5, 0.5);
    this.start.x = -(this.label.width / 2 + 40*TEXTURE_UPSIZER);
    this.start.visible = this.data.isComplete;
}

PanelCategory.CategoryLane.prototype.updateDisplay = function () {
    var pos = this.container.parent.toGlobal(new PIXI.Point(this.container.x, this.y));
    pos = this.panel.toLocal(pos);

    var height = this.panel.height / 2 + 10*TEXTURE_UPSIZER;

    var shift = height - Math.abs(pos.y);

    var a = shift / -20*TEXTURE_UPSIZER;
    if (a < 0) a = 0;
    if (a > 1) a = 1;
    a = 1 - 1 * a;

    this.container.alpha = a;

    this.isEnable = a > 0.0;

    this.interactiveBg.interactive = this.isEnable;

    if(this.start) {
        this.start.visible = this.data.completeData[app.gameData.settings.dificult];
    }
}
PanelCategory.CategoryLane.prototype.tween = function (data, callback) {
    var self = this;

    if (data.name == 'show_backlight') {
        this.backlight.visible = true;
        this.backlight.alpha = 0;
        TweenMax.to(this.backlight, 10 / 30, {
            alpha: 1, ease: Power2.easeOut, onComplete: function () {

            }
        });
    }
    if (data.name == 'hide_backlight') {
        this.backlight.alpha = 1;
        TweenMax.to(this.backlight, 10 / 30, {
            alpha: 0, ease: Power2.easeOut, onComplete: function () {
                self.backlight.visible = false;
            }
        });
    }
}

PanelCategory.prototype.changeBtnHitArea = function (large) {
    if (large) {
        this.buttonArrow.hitArea = new PIXI.Rectangle(-1500, -120, 1610, 230);
    } else {
        this.buttonArrow.hitArea = null;
    }

}

PanelCategory.prototype.tween = function (data, callback) {
    var self = this;

    if (data.name == 'show_expand' && this.expandState == 'hide') {
        this.expandState = 'to_show';

        this.invisibleBg.interactive = true;
        this.setActive(true);

        var time = 0.275;

        var targetY = 10*TEXTURE_UPSIZER;
        var targetHeight = this.expandHeight;
        var targetShiftY = (targetY - this.normalY);

        var expandDelay = 4 / 30;

        TweenMax.to(this.buttonArrow, time, {
            rotation: 180 * Util.TO_RADIANS,
            delay: expandDelay,
            ease: Power2.easeOut
        });
        TweenMax.to(this, time, {
            height: targetHeight, delay: expandDelay, onComplete: function () {
                self.expandState = 'show';
            }
        });


        var n = this.categoryLanes.indexOf(this.currentCategoryLane);
        var scroll = n / (this.categoryLanes.length - 1);
        scroll = this.getSmoothedScroll(scroll);
        TweenMax.to(this, time, {
            scroll: scroll, delay: expandDelay, ease: Power2.easeOut, onUpdate: function () {
                self.updateScroll();
            }
        });

        this.scrollBar.x = this.scrollBarNormalX + 20*TEXTURE_UPSIZER;
        this.scrollBar.y = -50*TEXTURE_UPSIZER;
        TweenMax.to(this.scrollBar, time * 0.7, {
            x: this.scrollBarNormalX,
            y: 0,
            alpha: 1,
            delay: expandDelay + time * 0.3,
            ease: Power2.easeOut
        });

        if (this.currentCategoryLane != null) this.currentCategoryLane.tween({name: 'show_backlight'});

        this.changeBtnHitArea(false);
    }
    if (data.name == 'hide_expand' && this.expandState == 'show') {
        this.expandState = 'to_hide';
        this.setActive(false);

        var time = 0.2;

        TweenMax.to(this.buttonArrow, time, {rotation: 0 * Util.TO_RADIANS, ease: Power2.easeOut});
        TweenMax.to(this, time, {
            height: 0, onComplete: function () {
                self.expandState = 'hide';
                self.invisibleBg.interactive = false;
            }
        });

        var n = this.categoryLanes.indexOf(this.currentCategoryLane);
        var scroll = n / (this.categoryLanes.length - 1);
        TweenMax.to(this, time, {
            scroll: scroll, ease: Power2.easeOut, onUpdate: function () {
                self.updateScroll();
            }
        });

        TweenMax.to(this.scrollBar, time * 0.6, {alpha: 0, ease: Power2.easeOut});

        if (this.currentCategoryLane != null) this.currentCategoryLane.tween({name: 'hide_backlight'});

        this.changeBtnHitArea(true);
    }
}

// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var PanelAdvancedSettings = function (config) {
    config = config || {};
    config.width = 394*TEXTURE_UPSIZER;
    config.height = 241*TEXTURE_UPSIZER;
    Gui.BasePanel.call(this, config);

    this.isOpened = false;

    const self = this;

    this.contentContainer = new PIXI.Container();
    this.addChild(this.contentContainer);
    this.contentContainer.visible = false;

    this.title = new PIXI.Sprite(assetsManager.getTexture('atlas', 'panel_category_title.png'));
    this.addChild(this.title);
    this.title.anchor.set(0.5, 0.5);
    this.title.y = -93*TEXTURE_UPSIZER;

    this.titleText = new Gui.LocalizedText('advanced_settings', constsManager.getData('text_styles/main_menu_advanced_settings_text'));
    this.addChild(this.titleText);
    this.titleText.anchor.set(0.5, 0.5);
    this.titleText.y = -93*TEXTURE_UPSIZER;

    this.buttonArrow = Gui.createSimpleButton({
        name: 'button_arrow',
        parentPanel: this,
        width: 97*TEXTURE_UPSIZER,
        height: 97*TEXTURE_UPSIZER,
        // positionType: 'right-bot',
        // xRelative: -10*TEXTURE_UPSIZER,
        // yRelative: 45*TEXTURE_UPSIZER
    },
    {
        pathToSkin: 'button_arrow.png',
        onClick: function () {
            self.isOpened = !self.isOpened;

            var time = 0.275;
            var expandDelay = 4 / 30;
            if (self.isOpened) {
                self.OpenContent();
                TweenMax.to(self.buttonArrow, time, {
                    rotation: 180 * Util.TO_RADIANS,
                    delay: expandDelay,
                    ease: Power2.easeOut
                });
                TweenMax.to(self.buttonArrow, time, {
                    y: 350 * TEXTURE_UPSIZER,
                    ease: Power2.easeOut
                });
                self.buttonArrow.parent.setChildIndex(self.buttonArrow, 0);
            } else {
                self.CloseContent();
                TweenMax.to(self.buttonArrow, time, {
                    rotation: 0,
                    delay: expandDelay,
                    ease: Power2.easeOut
                });
                TweenMax.to(self.buttonArrow, time, {
                    y: -93 * TEXTURE_UPSIZER,
                    ease: Power2.easeOut
                });
                self.buttonArrow.parent.setChildIndex(self.buttonArrow, self.buttonArrow.parent.children.length-1);
            }

            config.callback(self.isOpened);
        }
    });
    this.buttonArrow.x = 344*TEXTURE_UPSIZER;
    this.buttonArrow.y = -93*TEXTURE_UPSIZER;
    window['this.buttonArrow']=this.buttonArrow;
};
PanelAdvancedSettings.prototype = Object.create(PanelCategory.prototype);
PanelAdvancedSettings.prototype.constructor = PanelAdvancedSettings;

PanelAdvancedSettings.prototype.OpenContent = function () {
    this.contentContainer.visible = true;
    // this.contentContainer.alpha = 0;
    const self = this;
    this.contentContainer.y = -350 * TEXTURE_UPSIZER;
    this.openingTween = TweenMax.to(this.contentContainer, 10 / 30, {
        /* alpha: 1,  */y: 0, ease: Power2.easeOut, delay: 1/30, onComplete: function () {
        }
    });
};

PanelAdvancedSettings.prototype.CloseContent = function () {
    const self = this;
    this.openingTween = TweenMax.to(this.contentContainer, 7 / 30, {
        /* alpha: 0,  */y: -350 * TEXTURE_UPSIZER, ease: Power2.easeOut, onComplete: function () {
            self.contentContainer.visible = false;
        }
    })

};

// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //

var PanelLanguage = function (config) {
    config.width = 804*TEXTURE_UPSIZER;
    config.height = 0;
    config.expandedData =
        {
            border: {textureAtlas: 'atlas', path: 'expanded_panel_border.png', height: 20*TEXTURE_UPSIZER},
            body: {textureAtlas: 'atlas', path: 'expanded_panel_body.png'}
        };
    ExpandedPanel.call(this, config);

    const self = this;

    this.scrollV = 0;
    Object.defineProperty(this, 'scroll',
        {
            set: function (value) {
                self.setScroll(value);
            },
            get: function () {
                return this.scrollV;
            }
        });

    this.initBlockInputBg(5000*TEXTURE_UPSIZER, 1000*TEXTURE_UPSIZER, function () {
        self.tween({name: 'hide_expand'});
    });

    const languages = Config.getInstance().getLanguagesList();
    this.categoryLaneHeight = 75*TEXTURE_UPSIZER;

    this.invisibleBg.interactive = false;

    this.expandState = 'hide';

    this.normalY = 250*TEXTURE_UPSIZER;
    this.expandHeight = Math.min( Math.max(languages.length - 1, 1) * this.categoryLaneHeight, (580 - 27)*TEXTURE_UPSIZER);

    this.containerCategories = new PIXI.Container();
    this.panelContent.addChild(this.containerCategories);

    this.categoryLanes = [];
    this.currentCategoryLane = null;

    let selectedLanguageScroll = 0;
    let langY = 0;
    
    for (let i = 0; i < languages.length; i++) {
        let languageData =  Config.getInstance().getLanguageData(languages[i]);

        const categoryLane = new PanelLanguage.LanguageLane(languages[i], languageData, this.panelContent, this.containerCategories, langY);
        this.categoryLanes.push(categoryLane);

        langY += this.categoryLaneHeight;

        if (Config.getInstance().getCurrentLanguage() === languages[i]) {
            this.currentCategoryLane = categoryLane;
            selectedLanguageScroll = i / (languages.length - 1)
        }
    }

    this.scrollPoint = null;

    this.panelContent.interactive = true;
    this.body.interactive = true;

    this.panelContent.addListener('pointerdown', this.startScroll, this);
    this.panelContent.addListener('pointerup', this.endScroll, this);
    this.panelContent.addListener('pointerupoutside', this.endScroll, this);

    this.scrollBarNormalX = 347*TEXTURE_UPSIZER;

    this.scrollBar = new ScrollBar({parentPanel: this, x: this.scrollBarNormalX, height: this.expandHeight - 58*TEXTURE_UPSIZER}, this);
    this.scrollBar.alpha = 0;
    var sliderSize = this.expandHeight / (this.categoryLanes.length * this.categoryLaneHeight) * 405*TEXTURE_UPSIZER;
    if (sliderSize >= this.scrollBar.height)  {
        sliderSize = this.scrollBar.height;
        this.scrollBar.visible = false;
    }
    this.scrollBar.setSliderSize(sliderSize);

    this.title = new PIXI.Sprite(assetsManager.getTexture('atlas', 'panel_category_title.png'));
    this.addChild(this.title);
    this.title.anchor.set(0.5, 0.5);
    this.title.y = -93*TEXTURE_UPSIZER;

    this.titleText = new Gui.LocalizedText('language', constsManager.getData('text_styles/main_menu_header_text'));
    this.addChild(this.titleText);
    this.titleText.anchor.set(0.5, 0.5);
    this.titleText.y = -93*TEXTURE_UPSIZER;

    this.buttonArrow = Gui.createSimpleButton({
            name: 'button_arrow',
            parentPanel: this.panelContent,
            width: 97*TEXTURE_UPSIZER,
            height: 97*TEXTURE_UPSIZER,
            positionType: 'right-bot',
            xRelative: -10*TEXTURE_UPSIZER,
            yRelative: 50*TEXTURE_UPSIZER
        },
        {
            pathToSkin: 'button_arrow.png',
            onClick: function () {
                if(self.parentPanel && self.parentPanel.panelCategory && self.parentPanel.panelCategory.expandState === 'show') {
                    self.parentPanel.panelCategory.tween({name: 'hide_expand'});
                }
                if (self.expandState == 'hide') self.tween({name: 'show_expand'});
                else if (self.expandState == 'show') self.tween({name: 'hide_expand'});
            }
        });
    this.changeBtnHitArea(true);

    app.addForUpdate(this.update, this);

    this.scrollV = 0;
    this.startScrollV = 0;
    this.setScroll(selectedLanguageScroll);

    this.containerCategories.interactive = false;
    this.containerCategories.interactiveChildren = false;
    this.scrollBar.interactive = this.scrollBar.interactiveChildren = false;

    app.on('language_changed', code => {
        const index = this.categoryLanes.findIndex(lane => lane.languageCode === code);
        if(index !== -1 && this.expandState === 'hide') {
            const lane = this.categoryLanes[index];
            this.currentCategoryLane = lane;
            this.currentCategoryLane.tween({name: 'hide_backlight'});
            this.setScroll(index / (this.categoryLanes.length - 1));
        }
    })

    app.on('mouse_wheel', function (d) {
        if (this.categoryLanes.length <= 7 || this.expandState != 'show') return;

        d.event.preventDefault();
        d.event.stopImmediatePropagation();

        var sign = d.sign;
        var shift = 1 / (this.categoryLanes.length - 7);
        this.scroll = this.scroll + shift * sign;
    }, this);
}

PanelLanguage.prototype = Object.create(PanelCategory.prototype);
PanelLanguage.prototype.constructor = PanelLanguage;


PanelLanguage.prototype.selectLanguageLane = function (lane) {
    if (this.currentCategoryLane != lane) {
        if (this.currentCategoryLane != null) {
            this.currentCategoryLane.tween({name: 'hide_backlight'});
        }

        this.currentCategoryLane = lane;

        if (this.currentCategoryLane != null) {
            this.currentCategoryLane.tween({name: 'show_backlight'});
        }

        Config.getInstance().setLanguage(this.currentCategoryLane.languageCode);

        app.saveMenuStateToStorage();
    }

    this.endScroll();

    var self = this;
    this.state = 'selecting';
    setTimeout(function () {
        self.state = 'show';
        self.tween({name: 'hide_expand'});
    }, 5 / 30 * 1000);
}

PanelLanguage.LanguageLane = function (languageCode, languageData, panel, layer, y) {
    this.languageCode = languageCode;
    this.data = languageData;
    this.panel = panel;
    this.layer = layer;
    this.y = y;
    this.panelCategory = this.panel.parent;

    this.isEnable = false;

    this.container = new PIXI.Container();
    this.layer.addChild(this.container);
    this.container.y = this.y;

    this.interactiveBg = new PIXI.Sprite(assetsManager.getTexture('atlas', 'white_rect.png'));
    this.container.addChild(this.interactiveBg);
    this.interactiveBg.width = 490*TEXTURE_UPSIZER;
    this.interactiveBg.height = 65*TEXTURE_UPSIZER;
    this.interactiveBg.anchor.set(0.5, 0.5);
    this.interactiveBg.alpha = 0;
    this.interactiveBg.interactive = true;
    var onCL = function (e) {
        if (this.panelCategory.expandState == 'show' && this.panelCategory.state == 'show' && this.isEnable) {
            this.panelCategory.selectLanguageLane(this);
            app.playAudio('sounds', 'sound_click');
        }
    }
    this.interactiveBg.on('tap', onCL, this);
    this.interactiveBg.on('click', onCL, this);

    this.backlight = new PIXI.Sprite(assetsManager.getTexture('atlas', 'category_backlight.png'));
    this.container.addChild(this.backlight);
    this.backlight.anchor.set(0.5, 0.5);
    // this.backlight.y = this.y;
    this.backlight.visible = false;
    this.backlight.interactive = false;

    const displayText = this.data.name;
    this.label = Util.setParams(new Gui.Text(displayText, constsManager.getData('text_configs/category_name')), {
        parent: this.container,
        aX: 0.5,
        aY: 0.5,
        x: 0,
        y: 0
    });
    this.label.interactive = false;
}

PanelLanguage.LanguageLane.prototype = PanelCategory.CategoryLane.prototype;
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var ScrollBar = function (config, panel) {
    config.expandedData =
        {
            border: {textureAtlas: 'atlas', path: 'scroll_bar_border.png', height: 15*TEXTURE_UPSIZER},
            body: {textureAtlas: 'atlas', path: 'scroll_bar_bg.png'}
        };

    config.width = 30*TEXTURE_UPSIZER;

    ExpandedPanel.call(this, config);

    this.panel = panel;

    this.slider = new ExpandedPanel({
        parentPanel: this, width: 30*TEXTURE_UPSIZER, height: 50*TEXTURE_UPSIZER, x: 0, y: 0, expandedData:
            {
                border: {textureAtlas: 'atlas', path: 'scroll_bar_slider_border.png', height: 15*TEXTURE_UPSIZER},
                body: {textureAtlas: 'atlas', path: 'scroll_bar_slider_bg.png'}
            }
    });
    this.slider.hitArea = new PIXI.Rectangle(-100, -120, 200, 300);
    this.slider.interactive = true;
    this.slider.addListener('pointerdown', this.startScroll, this);
    this.slider.addListener('pointerup', this.endScroll, this);
    this.slider.addListener('pointerupoutside', this.endScroll, this);

    this.scrollPoint = null;
    this.startScrollV = 0;

    this.scrollV = 0;
    this.setScroll(0);

    app.addForUpdate(this.update, this);
}
ScrollBar.prototype = Object.create(ExpandedPanel.prototype);
ScrollBar.prototype.constructor = ScrollBar;

ScrollBar.prototype.setSliderSize = function (size) {
    this.slider.height = size;
}

ScrollBar.prototype.setScroll = function (v) {
    if (v < 0) v = 0;
    if (v > 1) v = 1;

    var shift = this.height - this.slider.height;
    this.slider.y = shift * v;

    this.scrollV = v;
}

ScrollBar.prototype.startScroll = function (e) {
    e?.data.originalEvent.preventDefault();

    if (this.scrollPoint != null) return;

    app.mouse = e.data.global;

    this.scrollPoint = Util.clone(e.data.global);
    this.startScrollV = this.scrollV;
}

ScrollBar.prototype.endScroll = function (e) {
    e?.data.originalEvent.preventDefault();
    
    this.scrollPoint = null;

    this.panel.smoothScroll(10 / 30);
}

ScrollBar.prototype.updateSize = function () {
    ExpandedPanel.prototype.updateSize.call(this);
}

ScrollBar.prototype.update = function () {
    if (this.scrollPoint != null) {
        var shift = app.mouse.y - this.scrollPoint.y;
        var shiftV = shift / (this.height - this.slider.height);
        this.panel.setScroll(this.startScrollV + shiftV);
    }
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var PanelClock = function (config) {
    config.width = 394*TEXTURE_UPSIZER;
    config.height = 241*TEXTURE_UPSIZER;
    Gui.BasePanel.call(this, config);


    this.bg = new PIXI.Sprite(assetsManager.getTexture('atlas', 'panel_clock_bg.png'));
    this.addChild(this.bg);
    this.bg.anchor.set(0.5, 0.5);

    this.titleText = new Gui.LocalizedText('beat_the_clock', constsManager.getData('text_styles/main_menu_small_text'), 380*TEXTURE_UPSIZER);
    this.addChild(this.titleText);
    this.titleText.anchor.set(0.5, 0.5);
    this.titleText.y = -50*TEXTURE_UPSIZER;

    this.menuContainer = new PIXI.Container();
    this.addChild(this.menuContainer);

    var menuSelector = new PIXI.Sprite(assetsManager.getTexture('atlas', 'panel_clock_selector.png'));
    var menuBg = new PIXI.Sprite(assetsManager.getTexture('atlas', 'panel_clock_menu_bg.png'));
    var menuLabelsWhite = [
        new Gui.LocalizedText('off', constsManager.getData('text_styles/on_off_white_text'), 150*TEXTURE_UPSIZER),
        new Gui.LocalizedText('on', constsManager.getData('text_styles/on_off_white_text'), 150*TEXTURE_UPSIZER)
    ];
    var menuLabelsGrey = [
        new Gui.LocalizedText('off', constsManager.getData('text_styles/on_off_grey_text'), 150*TEXTURE_UPSIZER),
        new Gui.LocalizedText('on', constsManager.getData('text_styles/on_off_grey_text'), 150*TEXTURE_UPSIZER)
    ];
    this.menu = new PanelLinearMenu({
        parentPanel: this,
        width: 360*TEXTURE_UPSIZER,
        height: 83*TEXTURE_UPSIZER,
        segmentWidth: 154*TEXTURE_UPSIZER,
        selector: menuSelector,
        bg: menuBg,
        labelsWhite: menuLabelsWhite,
        labelsGrey: menuLabelsGrey,
        segmentsName: ['off', 'on']
    });
    this.menu.y = 35*TEXTURE_UPSIZER;
    this.menu.on('switch', function (data) {
        var timeMode = data.segment == 'on';
        app.gameData.settings.timeMode = timeMode;
    });
    app.gameData.settings.timeMode = false;
}
PanelClock.prototype = Object.create(Gui.BasePanel.prototype);
PanelClock.prototype.constructor = PanelClock;
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var PanelHideWords = function (config) {
    config.width = 394*TEXTURE_UPSIZER;
    config.height = 241*TEXTURE_UPSIZER;
    Gui.BasePanel.call(this, config);


    this.bg = new PIXI.Sprite(assetsManager.getTexture('atlas', 'panel_hide_words_bg.png'));
    this.addChild(this.bg);
    this.bg.anchor.set(0.5, 0.5);

    this.titleText = new Gui.LocalizedText('hide_the_words', constsManager.getData('text_styles/main_menu_small_text'), 380*TEXTURE_UPSIZER);
    this.addChild(this.titleText);
    this.titleText.anchor.set(0.5, 0.5);
    this.titleText.y = -50*TEXTURE_UPSIZER;

    this.menuContainer = new PIXI.Container();
    this.addChild(this.menuContainer);

    var menuSelector = new PIXI.Sprite(assetsManager.getTexture('atlas', 'panel_clock_selector.png'));
    var menuBg = new PIXI.Sprite(assetsManager.getTexture('atlas', 'panel_clock_menu_bg.png'));

    var menuLabelsWhite = [
        new Gui.LocalizedText('off', constsManager.getData('text_styles/on_off_white_text'), 150*TEXTURE_UPSIZER),
        new Gui.LocalizedText('on', constsManager.getData('text_styles/on_off_white_text'), 150*TEXTURE_UPSIZER)
    ];
    var menuLabelsGrey = [
        new Gui.LocalizedText('off', constsManager.getData('text_styles/on_off_grey_text'), 150*TEXTURE_UPSIZER),
        new Gui.LocalizedText('on', constsManager.getData('text_styles/on_off_grey_text'), 150*TEXTURE_UPSIZER)
    ];

    this.menu = new PanelLinearMenu({
        parentPanel: this,
        width: 360*TEXTURE_UPSIZER,
        height: 83*TEXTURE_UPSIZER,
        segmentWidth: 154*TEXTURE_UPSIZER,
        selector: menuSelector,
        bg: menuBg,
        labelsWhite: menuLabelsWhite,
        labelsGrey: menuLabelsGrey,
        segmentsName: ['off', 'on']
    });
    this.menu.y = 35*TEXTURE_UPSIZER;
    this.menu.on('switch', function (data) {
        var hideWords = data.segment == 'on';
        app.gameData.settings.hideWords = hideWords;
    });
    app.gameData.settings.timeMode = false;
}
PanelHideWords.prototype = Object.create(Gui.BasePanel.prototype);
PanelHideWords.prototype.constructor = PanelHideWords;
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var PanelLinearMenu = function (config) {
    Gui.BasePanel.call(this, config);


    var self = this;

    this.segmentWidth = config.segmentWidth;

    this.bg = config.bg;
    this.addChild(this.bg);
    this.bg.anchor.set(0.5, 0.5);

    this.selector = config.selector;
    this.addChild(this.selector);
    this.selector.anchor.set(0.5, 0.5);

    this.segments = [];
    var labelsCount = config.labelsWhite.length;
    var startX = labelsCount % 2 == 0 ? this.segmentWidth / 2 : 0;
    var labelX = startX - Math.floor(labelsCount / 2) * this.segmentWidth;
    for (var i = 0; i < labelsCount; i++) {
        var segment =
            {
                x: labelX,
                container: new PIXI.Container(),
                white: config.labelsWhite[i],
                grey: config.labelsGrey[i],
                name: config.segmentsName[i],
                interactiveBg: new PIXI.Sprite(assetsManager.getTexture('atlas', 'white_rect.png'))
            };
        this.addChild(segment.container);

        segment.container.addChild(segment.interactiveBg);
        segment.interactiveBg.width = this.segmentWidth * 0.9;
        segment.interactiveBg.height = this.height * 0.9;
        segment.interactiveBg.anchor.set(0.5, 0.5);
        segment.interactiveBg.alpha = 0;

        segment.container.addChild(segment.white);
        segment.container.addChild(segment.grey);
        segment.white.anchor.set(0.5, 0.5);
        segment.grey.anchor.set(0.5, 0.5);
        segment.white.visible = false;
        segment.container.x = segment.x;
        segment.container.interactive = true;
        segment.container.buttonMode = true;

        var onCl = function () {
            app.playAudio('sounds', 'sound_click');
            self.switchTo(this);
        }
        segment.container.on('tap', onCl, segment);
        segment.container.on('click', onCl, segment);

        this.segments.push(segment);

        labelX += this.segmentWidth;
    }

    this.selector.tint = 0xF3AC3C;

    this.state = 'normal';
    this.currentSegment = null;

    if (self.segments.length == 4) self.switchTo(self.segments[1]);
    else self.switchTo(self.segments[0]);
}
PanelLinearMenu.prototype = Object.create(Gui.BasePanel.prototype);
PanelLinearMenu.prototype.constructor = PanelLinearMenu;

PanelLinearMenu.prototype.lock = function () {
    var segmentOn = this.getSegment('on');
    var segmentOff = this.getSegment('off');

    TweenMax.to(segmentOff.container, 10 / 30, {alpha: 0, ease: Power2.easeOut});
    TweenMax.to(segmentOn.container, 10 / 30, {x: 0, ease: Power2.easeOut});

    if (this.currentSegment == segmentOff) {
        segmentOn.white.visible = true;
        TweenMax.to(segmentOn.white, 10 / 30, {alpha: 1, ease: Power2.easeOut});
        TweenMax.to(segmentOn.grey, 10 / 30, {alpha: 0, ease: Power2.easeOut});

        segmentOff.grey.visible = true;
        TweenMax.to(segmentOff.white, 10 / 30, {alpha: 0, ease: Power2.easeOut});
        TweenMax.to(segmentOff.grey, 10 / 30, {alpha: 1, ease: Power2.easeOut});
    }

    this.state = 'lock';
    TweenMax.to(this.selector, 10 / 30, {
        pixi: {tint: 0xFA591D},
        x: 0,
        width: this.segmentWidth * 2,
        ease: Power2.easeOut
    });

    this.currentSegment = segmentOn;
    this.emit('switch', {segment: this.currentSegment.name});
}
PanelLinearMenu.prototype.unlock = function (mode) {
    var self = this;
    if (mode == undefined) mode = 'off';

    var segmentOn = this.getSegment('on');
    var segmentOff = this.getSegment('off');

    TweenMax.to(segmentOff.container, 10 / 30, {alpha: 1, ease: Power2.easeOut});
    TweenMax.to(segmentOn.container, 10 / 30, {x: this.segmentWidth / 2, ease: Power2.easeOut});

    var selectorPos;
    if (mode == 'off') {
        TweenMax.to(segmentOn.white, 10 / 30, {alpha: 0, ease: Power2.easeOut});
        TweenMax.to(segmentOn.grey, 10 / 30, {alpha: 1, ease: Power2.easeOut});

        TweenMax.to(segmentOff.white, 10 / 30, {alpha: 1, ease: Power2.easeOut});
        TweenMax.to(segmentOff.grey, 10 / 30, {alpha: 0, ease: Power2.easeOut});

        selectorPos = -this.segmentWidth / 2
    } else if (mode == 'on') {
        selectorPos = this.segmentWidth / 2;
    }

    this.state = 'lock';
    TweenMax.to(this.selector, 10 / 30, {
        pixi: {tint: 0xF3AC3C},
        x: selectorPos,
        width: this.segmentWidth,
        ease: Power2.easeOut,
        onComplete: function () {
            self.state = 'normal';
        }
    });

    var nextSegment = mode == 'on' ? segmentOn : segmentOff;
    if (this.currentSegment != nextSegment) {
        this.currentSegment = segmentOff;
        this.emit('switch', {segment: this.currentSegment.name});
    }
}

PanelLinearMenu.prototype.getSegment = function (segment) {
    if (segment != null && typeof segment === "string") {
        for (var i = 0; i < this.segments.length; i++) {
            if (this.segments[i].name == segment) {
                segment = this.segments[i];
                break;
            }
        }

        if (typeof segment === "string") segment = null;
    }

    return segment;
}

PanelLinearMenu.prototype.switchTo = function (segment) {
    var self = this;

    this.getSegment(segment);

    if (this.segments.length == 4 && this.currentSegment == segment) {
        if (app.screenMainMenu && app.screenMainMenu.panelCategory.expandState == 'show') app.screenMainMenu.panelCategory.tween({name: 'hide_expand'});
    }

    if (segment == null || this.state != 'normal') return;
    if (this.currentSegment == segment && this.segments.length == 2) {
        if (this.segments[0] == this.currentSegment) segment = this.segments[1];
        else segment = this.segments[0];
    } else if (this.currentSegment == segment) return;

    if (this.currentSegment == null) {
        this.currentSegment = segment;
        this.selector.x = segment.x;
        segment.grey.visible = false;
        segment.white.visible = true;
    } else {
        this.state = 'switch';

        var hideTime = 15 / 30;
        var hideEase = Power2.easeOut;
        var showTime = 15 / 30;
        var showEase = Power2.easeOut;

        this.currentSegment.grey.visible = true;
        this.currentSegment.grey.alpha = 0;
        TweenMax.to(this.currentSegment.white, hideTime, {alpha: 0, ease: hideEase});
        TweenMax.to(this.currentSegment.grey, hideTime, {alpha: 1, ease: hideEase});

        segment.white.visible = true;
        segment.white.alpha = 0;
        TweenMax.to(segment.white, hideTime, {alpha: 1, ease: showEase});
        TweenMax.to(segment.grey, hideTime, {alpha: 0, ease: showEase});

        var tint;
        if (segment.name == 'maniac') tint = 0xFA591D;
        else tint = 0xF3AC3C;

        TweenMax.to(this.selector, showTime, {
            pixi: {tint: tint}, x: segment.x, ease: showEase, onComplete: function () {
                self.state = 'normal';
            }
        });

        this.currentSegment = segment;

        this.emit('switch', {segment: segment.name});
    }
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var PanelDebug = function (config) {
    config.width = 954*TEXTURE_UPSIZER;
    config.height = 819*TEXTURE_UPSIZER;
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
    this.bg.width = 900*TEXTURE_UPSIZER;
    this.bg.height = 800*TEXTURE_UPSIZER;

    this.buttonClose = Gui.createSimpleButton({
            name: 'button_close',
            parentPanel: this,
            width: 69*TEXTURE_UPSIZER,
            height: 69*TEXTURE_UPSIZER,
            x: (900 / 2 - 40)*TEXTURE_UPSIZER,
            y: (-800 / 2 + 40)*TEXTURE_UPSIZER
        },
        {
            pathToSkin: 'button_close.png',
            onClick: function () {
                if (self.state != 'show') return;

                self.tween({name: 'hide_anim'}, function () {
                    // if(app.gameData.settings.timeMode) app.screenGame.panelTime.activate();
                });
            }
        });

    this.containerParametrs = new PIXI.Container();
    this.addChild(this.containerParametrs);

    var parametrFieldSize = new PanelDebugParametr({
        parentPanel: this,
        layer: this.containerParametrs,
        x: 0,
        y: 0,
        parametr: {name: 'Field Size:', type: 'field_size', minValue: 6, maxValue: 12, startValue: 8}
    });
    parametrFieldSize.on('value_updated', function (value) {
        app.gameData.settings.fieldWidth = app.gameData.settings.fieldHeight = value;
    });
    var parametrWordsConunt = new PanelDebugParametr({
        parentPanel: this,
        layer: this.containerParametrs,
        x: 0,
        y: 80*TEXTURE_UPSIZER,
        parametr: {name: 'Words Count:', type: 'words_count', minValue: 6, maxValue: 15, startValue: 9}
    });
    parametrWordsConunt.on('value_updated', function (value) {
        app.gameData.settings.wordsCount = value;
    });

    var parametrBaseTime = new PanelDebugParametr({
        parentPanel: this,
        layer: this.containerParametrs,
        x: 0,
        y: 200*TEXTURE_UPSIZER,
        parametr: {
            name: 'Base Time:',
            type: 'base_time',
            minValue: 10,
            maxValue: 600,
            startValue: app.gameData.baseTime[app.gameData.settings.dificult]
        }
    });
    parametrBaseTime.on('value_updated', function (value) {
        app.gameData.baseTime[app.gameData.settings.dificult] = value;
    });
    var parametrBonusTime = new PanelDebugParametr({
        parentPanel: this,
        layer: this.containerParametrs,
        x: 0,
        y: 280*TEXTURE_UPSIZER,
        parametr: {
            name: 'Bonus Time:',
            type: 'bonus_time',
            minValue: 1,
            maxValue: 600,
            startValue: app.gameData.bonusTime[app.gameData.settings.dificult]
        }
    });
    parametrBonusTime.on('value_updated', function (value) {
        app.gameData.bonusTime[app.gameData.settings.dificult] = value;
    });

    this.containerParametrs.x = -this.containerParametrs.width / 2;
    this.containerParametrs.y = -this.containerParametrs.height / 2;

    this.panelsParametr = [parametrFieldSize, parametrWordsConunt, parametrBaseTime, parametrBonusTime];
}
PanelDebug.prototype = Object.create(Gui.BasePanel.prototype);
PanelDebug.prototype.constructor = PanelDebug;

PanelDebug.prototype.updatePanel = function () {
    for (var i = 0; i < this.panelsParametr.length; i++) {
        this.panelsParametr[i].setValueFromSettings();
    }
}

PanelDebug.prototype.tween = function (data, callback) {
    var self = this;


    if (data.name == 'show_anim' && this.state == 'hide') {
        this.state = 'show_anim';
        this.visible = true;
        this.alpha = 0;

        this.updatePanel();

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
var PanelDebugParametr = function (config) {
    Gui.BasePanel.call(this, config);


    var self = this;

    this.value = config.parametr.startValue;
    this.minValue = config.parametr.minValue;
    this.maxValue = config.parametr.maxValue;
    this.parametrName = config.parametr.name;

    this.type = config.parametr.type;

    this.containerParametr = new PIXI.Container();
    this.addChild(this.containerParametr);

    this.parametrBg = new PIXI.Sprite(assetsManager.getTexture('atlas', 'debug_panel_bg.png'));
    this.containerParametr.addChild(this.parametrBg);
    this.parametrBg.anchor.set(0.5, 0.5);

    this.buttonPlus1 = Gui.createSimpleButton({
            parentPanel: this,
            layer: this.containerParametr,
            width: 60*TEXTURE_UPSIZER,
            height: 60*TEXTURE_UPSIZER,
            x: 130*TEXTURE_UPSIZER,
            y: 0
        },
        {
            pathToSkin: 'debug_button_plus_1.png',
            onClick: function () {
                self.setValue(self.value + 1);
            }
        });
    this.buttonMinus1 = Gui.createSimpleButton({
            parentPanel: this,
            layer: this.containerParametr,
            width: 60*TEXTURE_UPSIZER,
            height: 60*TEXTURE_UPSIZER,
            x: -130*TEXTURE_UPSIZER,
            y: 0
        },
        {
            pathToSkin: 'debug_button_minus_1.png',
            onClick: function () {
                self.setValue(self.value - 1);
            }
        });

    if (config.parametr.type == 'base_time' || config.parametr.type == 'bonus_time') {
        this.buttonPlus2 = Gui.createSimpleButton({
                parentPanel: this,
                layer: this.containerParametr,
                width: 60*TEXTURE_UPSIZER,
                height: 60*TEXTURE_UPSIZER,
                x: (130 + 70)*TEXTURE_UPSIZER,
                y: 0
            },
            {
                pathToSkin: 'debug_button_plus_2.png',
                onClick: function () {
                    self.setValue(self.value + 10);
                }
            });
        this.buttonMinus2 = Gui.createSimpleButton({
                parentPanel: this,
                layer: this.containerParametr,
                width: 60*TEXTURE_UPSIZER,
                height: 60*TEXTURE_UPSIZER,
                x: (-130 - 70)*TEXTURE_UPSIZER,
                y: 0
            },
            {
                pathToSkin: 'debug_button_minus_2.png',
                onClick: function () {
                    self.setValue(self.value - 10);
                }
            });
    }

    this.textValue = Util.setParams(new Gui.Text('101', constsManager.getData('text_configs/debug_text_value')), {
        parent: this.containerParametr,
        aX: 0.5,
        aY: 0.5,
        x: 0,
        y: 0
    });
    this.textLabel = Util.setParams(new Gui.Text(this.parametrName, constsManager.getData('text_configs/debug_text_name')), {
        parent: this,
        aX: 0.0,
        aY: 0.5,
        x: 0,
        y: 0
    });

    this.containerParametr.x = this.textLabel.width + this.containerParametr.width / 2 + 20*TEXTURE_UPSIZER;

    this.updatePanel();
}
PanelDebugParametr.prototype = Object.create(Gui.BasePanel.prototype);
PanelDebugParametr.prototype.constructor = PanelDebugParametr;

PanelDebugParametr.prototype.updatePanel = function () {
    this.textValue.text = this.value;
}

PanelDebugParametr.prototype.setValue = function (value) {
    if (value > this.maxValue) value = this.maxValue;
    if (value < this.minValue) value = this.minValue;

    this.value = value;

    this.updatePanel();

    this.emit('value_updated', this.value);
}

PanelDebugParametr.prototype.setValueFromSettings = function () {
    var value = 0;
    if (this.type == 'base_time') value = app.gameData.baseTime[app.gameData.settings.dificult];
    if (this.type == 'bonus_time') value = app.gameData.bonusTime[app.gameData.settings.dificult];
    if (this.type == 'field_size') value = app.gameData.settings.fieldWidth;
    if (this.type == 'words_count') value = app.gameData.settings.wordsCount;

    this.setValue(value);
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //