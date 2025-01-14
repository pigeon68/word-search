var Gui = function () {

}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
Gui.GuiManager = function (layer) {
    EventEmitter.call(this);

    this.rootLayer = layer;

    this.orientation = 'none';

    // console.log(renderer.width, stage.height);
    var width = renderer.width;
    var height = renderer.height;

    this.rootScene = new Gui.BasePanel({x: width / 2, y: height / 2, width: width, height: height, color: 0xFFF000});
    this.rootLayer.addChild(this.rootScene);
}
Gui.GuiManager.prototype = Object.create(EventEmitter.prototype);
Gui.GuiManager.prototype.constructor = Gui.GuiManager;

Gui.GuiManager.prototype.resize = function (width, height) {
    this.rootScene.width = width;
    this.rootScene.height = height;

    if (this.rootScene.width >= this.rootScene.height) this.changeOrientation('landscape');
    else if (this.rootScene.width < this.rootScene.height) this.changeOrientation('portrait');

    this.rootScene.x = this.rootScene.width / 2;
    this.rootScene.y = this.rootScene.height / 2;

    // this.rootScene.x = 500;
    // this.rootScene.y = 500;
    if (this.orientation == 'portrait') {
        // this.rootScene.x = window.innerWidth/2;
        // this.rootScene.y = 500;

        // this.rootScene.x = this.rootScene.width / 2;
    }
    if (this.orientation == 'landscape') {
        // this.rootScene.x = 500;
        // this.rootScene.y = window.innerHeight/2;
        // this.rootScene.y = 00;

        // this.rootScene.y = this.rootScene.height / 2;
    }

    // var scale

    this.emit('game_resize', {width: width, height: height});
}
Gui.GuiManager.prototype.changeOrientation = function (orientation) {
    // if (this.orientation == orientation) return;

    this.orientation = orientation;

    this.emit('orientation_change', {orientation: this.orientation});

    // for(var i = 1; i <= 5; i++)
    // {
    //   setTimeout(function()
    //   {
    //     resize();
    //   }, 200*i);

    // console.log('OrientationChange:', this.orientation);
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
Gui.BasePanel = function (data) {
    PIXI.Container.call(this);


    var self = this;

    this.parentPanel = null;
    this.layer = null;
    this.childPanels = [];

    // this._enable = true;
    this.interactiveChildren = true;
    this.state = 'show';

    this.userData = {};

    this._x = 0;
    this._y = 0;
    this._width = 0;
    this._height = 0;
    this._widthRelative = 0;
    this._heightRelative = 0;
    this._xRelative = 0;
    this._yRelative = 0;
    this._positionType = 'absolute';

    if (data == undefined) data = {};
    if (data.panelType == undefined) data.panelType = 'normal';

    if (data.positionType == undefined) data.positionType = 'absolute';
    if (data.x == undefined) data.x = 0;
    if (data.y == undefined) data.y = 0;
    if (data.xRelative == undefined) data.xRelative = 0;
    if (data.yRelative == undefined) data.yRelative = 0;

    if (data.sizeType == undefined) data.sizeType = 'absolute';
    if (data.width == undefined) data.width = 100;
    if (data.height == undefined) data.height = 100;
    if (data.widthRelative == undefined) data.widthRelative = 0.5;
    if (data.heightRelative == undefined) data.heightRelative = 0.5;

    if (data.parentPanel == undefined) data.parentPanel = null;
    if (data.layer == undefined) data.layer = null;
    if (data.name == undefined) data.name = 'none';
    if (data.color == undefined) data.color = null;
    if (data.viewRect == undefined) data.viewRect = false;

    Object.defineProperty(this, 'positionType',
        {
            set: function (value) {
                self.updatePositionType(value);
            },
            get: function () {
                return this._positionType;
            }
        });

    Object.defineProperty(this, 'x',
        {
            set: function (value) {
                self._x = value;
                self.updatePosition();
            },
            get: function () {
                return this._x;
            }
        });
    Object.defineProperty(this, 'y',
        {
            set: function (value) {
                self._y = value;
                self.updatePosition();
            },
            get: function () {
                return this._y;
            }
        });
    Object.defineProperty(this, 'xRelative',
        {
            set: function (value) {
                self._xRelative = value;
                self.updatePosition();
            },
            get: function () {
                return this._xRelative;
            }
        });
    Object.defineProperty(this, 'yRelative',
        {
            set: function (value) {
                self._yRelative = value;
                self.updatePosition();
            },
            get: function () {
                return this._yRelative;
            }
        });
    Object.defineProperty(this, 'width',
        {
            set: function (value) {
                self._width = value;
                self.updateSize();
            },
            get: function () {
                return this._width;
            }
        });
    Object.defineProperty(this, 'height',
        {
            set: function (value) {
                self._height = value;
                self.updateSize();
            },
            get: function () {
                return this._height;
            }
        });
    Object.defineProperty(this, 'widthRelative',
        {
            set: function (value) {
                self._widthRelative = value;
                if (self.sizeType == 'relative' || self.sizeType == 'relative-width') self.updateSize();
            },
            get: function () {
                return this._widthRelative;
            }
        });
    Object.defineProperty(this, 'heightRelative',
        {
            set: function (value) {
                self._heightRelative = value;
                if (self.sizeType == 'relative' || self.sizeType == 'relative-height') self.updateSize();
            },
            get: function () {
                return this._heightRelative;
            }
        });

    this.panelType = data.panelType;
    this.align = data.align;

    this.layer = data.layer;

    this.sizeType = data.sizeType;
    this.width = data.width;
    this.height = data.height;
    this.widthRelative = data.widthRelative;
    this.heightRelative = data.heightRelative;

    this._positionType = data.positionType;
    this.x = data.x;
    this.y = data.y;
    this.xRelative = data.xRelative;
    this.yRelative = data.yRelative;

    // this.updateSize();
    // this.updatePosition();
    // console.log('Panel create:', data);

    this.addListener('added', function () {
        self.updateSize();
        self.updatePosition();
    });

    if (data.parentPanel != null) data.parentPanel.addPanel(this);
    // else console.log('ParentPanel not set!');

    this.isViewRect = data.viewRect;
    this.viewRect = null;
    this.viewRectColor = 0x000000;

    if (this.isViewRect) this.showViewRect(data.color);
}
Gui.BasePanel.prototype = Object.create(PIXI.Container.prototype);
Gui.BasePanel.prototype.constructor = Gui.BasePanel;



Gui.BasePanel.prototype.showViewRect = function (color) {
    this.isViewRect = true;
    this.viewRectColor = color;
    this.updateViewRect();
}
Gui.BasePanel.prototype.updateViewRect = function () {
    if (!this.isViewRect) return;

    if (this.viewRect != null) {
        this.removeChild(this.viewRect);
        this.viewRect.destroy();
        this.viewRect = null;
    }

    this.viewRect = new PIXI.Graphics();
    this.viewRect.beginFill(this.viewRectColor);
    this.viewRect.drawRect(-this.width / 2, -this.height / 2, this.width, this.height);
    this.viewRect.endFill();
    this.addChildAt(this.viewRect, 0);
}

Gui.BasePanel.prototype.updatePositionType = function (type) {
    if (this._positionType == type) return;

    if (this._positionType == 'absolute' || this.positionType == 'center-center') {
        var x = 0;
        var y = 0;

        if (type == 'center-top') y = -this.parentPanel.height / 2 + this.height / 2;
        else if (type == 'center-bot') y = this.parentPanel.height / 2 - this.height / 2;
        else if (type == 'left-center') x = -this.parentPanel.width / 2 + this.width / 2;
        else if (type == 'right-center') x = this.parentPanel.width / 2 - this.width / 2;
        else if (type == 'right-top') {
            x = this.parentPanel.width / 2 - this.width / 2;
            y = -this.parentPanel.height / 2 + this.height / 2;
        } else if (type == 'right-bot') {
            x = this.parentPanel.width / 2 - this.width / 2;
            y = this.parentPanel.height / 2 - this.height / 2;
        } else if (type == 'left-top') {
            x = -this.parentPanel.width / 2 + this.width / 2;
            y = -this.parentPanel.height / 2 + this.height / 2;
        } else if (type == 'left-bot') {
            x = -this.parentPanel.width / 2 + this.width / 2;
            y = this.parentPanel.height / 2 - this.height / 2;
        }

        this._xRelative = this._x - x;
        this._yRelative = this._y - y;
    }

    this._positionType = type;

    this.updatePosition();
}

Gui.BasePanel.prototype.updatePosition = function () {
    if (!this.parent) return;

    var x = 0;
    var y = 0;

    if (this.positionType == 'absolute' || this.positionType == 'center-center') {
        x = this._x;
        y = this._y;
    } else if (this.parentPanel != null) {
        if (this.positionType == 'center-top') y = -this.parentPanel.height / 2 + this.height / 2;
        else if (this.positionType == 'center-bot') y = this.parentPanel.height / 2 - this.height / 2;
        else if (this.positionType == 'left-center') x = -this.parentPanel.width / 2 + this.width / 2;
        else if (this.positionType == 'right-center') x = this.parentPanel.width / 2 - this.width / 2;
        else if (this.positionType == 'right-top') {
            x = this.parentPanel.width / 2 - this.width / 2;
            y = -this.parentPanel.height / 2 + this.height / 2;
        } else if (this.positionType == 'right-bot') {
            x = this.parentPanel.width / 2 - this.width / 2;
            y = this.parentPanel.height / 2 - this.height / 2;
        } else if (this.positionType == 'left-top') {
            x = -this.parentPanel.width / 2 + this.width / 2;
            y = -this.parentPanel.height / 2 + this.height / 2;
        } else if (this.positionType == 'left-bot') {
            x = -this.parentPanel.width / 2 + this.width / 2;
            y = this.parentPanel.height / 2 - this.height / 2;
        }

        x += this._xRelative;
        y += this._yRelative;
    }

    this._x = x;
    this._y = y;

    this.transform.position.x = x;
    this.transform.position.y = y;
}

Gui.BasePanel.prototype.initBlockInputBg = function (width, height, onClick) {
    this.invisibleBg = new PIXI.Sprite(assetsManager.getTexture('atlas', 'rect_white.png'));
    this.addChildAt(this.invisibleBg, 0);
    this.invisibleBg.width = width;
    this.invisibleBg.height = height;
    this.invisibleBg.anchor.set(0.5, 0.5);
    this.invisibleBg.alpha = 0;
    this.invisibleBg.interactive = true;

    this.invisibleBg.on('click', onClick, this);
    this.invisibleBg.on('tap', onClick, this);
}

Gui.BasePanel.prototype.updateSize = function () {
    if (!this.parent) return;

    var width = this.width;
    var height = this.height;

    if (this.parentPanel != null) {
        if (this.sizeType == 'relative-height') height = this.parentPanel.height * this.heightRelative;
        else if (this.sizeType == 'relative-width') width = this.parentPanel.width * this.widthRelative;
        else if (this.sizeType == 'relative') {
            height = this.parentPanel.height * this.heightRelative;
            width = this.parentPanel.width * this.widthRelative;
        }
    }

    this._width = width;
    this._height = height;

    if (this.isViewRect) this.updateViewRect();

    this.updatePosition();

    for (var i = 0; i < this.childPanels.length; i++) {
        var childPanel = this.childPanels[i];
        if (childPanel.visible) childPanel.updateSize();
        else childPanel.updateSize();
    }
}

Gui.BasePanel.prototype.addPanel = function (panel) {
    var n = this.childPanels.indexOf(panel);
    if (n == -1) {
        this.childPanels.push(panel);
        panel.parentPanel = this;

        var layer = panel.layer;
        if (layer == null) layer = this;
        layer.addChild(panel);
    }
}

Gui.BasePanel.prototype.tween = function (name, callback) {
    // if(callback == undefined) callback = null;
}

Gui.BaseButton = function (config, isClickTween) {
    Gui.BasePanel.call(this, config);

    const self = this;

    if (isClickTween == undefined) this.isClickTween = true;
    this.interactive = true;
    this.buttonMode = true;

    this.isClickSound = true;

    this.on('click', this.onClickListener, this);
    this.on('tap', this.onClickListener, this);
    this.on('mouseover', this.onMouseOverListener, this);
    this.on('mouseout', this.onMouseOutListener, this);

    this.onClickListeners = [];

    this.isCanClick = true;

    this.isEnable = true;
    Object.defineProperty(this, 'enable',
        {
            set: function (value) {
                if (self.isEnable == value) return;
                self.isEnable = value;
                self.updateEnable();
            },
            get: function () {
                return this.isEnable;
            }
        });

    // console.log(this.enable);
    // this.showViewRect(0xFFFFFF);
}
Gui.BaseButton.prototype = Object.create(Gui.BasePanel.prototype);
Gui.BaseButton.prototype.constructor = Gui.BaseButton;

Gui.BaseButton.prototype.updateEnable = function () {
    this.buttonMode = this.isEnable;
    this.interactive = this.isEnable;
}

Gui.BaseButton.prototype.destroy = function() {
    PIXI.Container.prototype.destroy.call(this, {children: true});
}


Gui.BaseButton.prototype.addClickListener = function (listener, context) {
    if (context == undefined) context = null;

    this.onClickListeners.push({listener: listener, context: context});
}

Gui.BaseButton.prototype.onClickListener = function (event) {
    if (!this.isCanClick) return;

    var self = this;

    for (var i = 0; i < this.onClickListeners.length; i++) {
        var listener = this.onClickListeners[i];
        if (listener.context != null) listener.listener.call(listener.context, {target: this});
        else listener.listener({target: this});
    }

    this.emit('button_click', {target: this});

    if (this.isClickSound) {
        app.playAudio('sounds', 'sound_click');
    }

    if (this.isClickTween) {
        this.isCanClick = false;
        this.scale.x = this.scale.y = 1;
        // TweenMax.killTweensOf(text.scale);
        TweenMax.to(this.scale, 3 / 30, {
            x: 0.8, y: 0.8, ease: Power2.easeOut, onComplete: function () {
                TweenMax.to(self.scale, 3 / 30, {
                    x: 1, y: 1, ease: Power2.easeOut, onComplete: function () {
                        self.isCanClick = true;
                    }
                });
            }
        });
    }
}

Gui.BaseButton.prototype.onMouseOverListener = function (event) {
    if(this.textField && this.textHoverStyle) {
        this.textField.style = this.textHoverStyle;
    }
}

Gui.BaseButton.prototype.onMouseOutListener = function (event) {
    if(this.textField && this.textStyle) {
        this.textField.style = this.textStyle;
    }
}

Gui.createSimpleButton = function (config, data) {
    var button = new Gui.BaseButton(config);

    if (data.textureAtlas == undefined) data.textureAtlas = 'atlas';
    if (data.onClickContext == undefined) data.onClickContext = button;

    if (data.pathToSkin) {
        var skin = new PIXI.Sprite(assetsManager.getTexture(data.textureAtlas, data.pathToSkin));
        skin.anchor.set(0.5, 0.5);
        button.addChild(skin);
    }
    if (data.bgRects) {
        Util.createBgRects(data.bgRects, button);
    }
    if (data.content) {
        button.addChild(data.content);
    }

    if (data.onClick) button.addClickListener(data.onClick, data.onClickContext);

    return button;
}


Gui.createTextButton = function (config, data, textParams) {
    const button = Gui.createSimpleButton(config, data);

    const style = {};
    if(textParams.wordWrap) style.wordWrap = textParams.wordWrap;
    if(textParams.wordWrapWidth) style.wordWrapWidth = textParams.wordWrapWidth;
    const hoverStyle = Object.assign({}, style);
    const mergedStyle = Object.assign(style, textParams.style)
    const mergedHoverStyle = Object.assign(hoverStyle, textParams.hoverStyle || textParams.style)

    button.textStyle = mergedStyle;
    button.textHoverStyle = mergedHoverStyle;

    if(!textParams.textKey) {
        console.error("No text key provided for button ", button);
    }

    const textField = new Gui.LocalizedText(textParams.textKey, button.textStyle, textParams.maxWidth || (button.width * 0.9), textParams.maxHeight || (button.height * 0.9));
    textField.anchor.set(0.5, 0.5);
    button.addChild(textField);

    textField.x = textParams.x || 0;
    textField.y = textParams.y || 0;
    textField.anchor.set(textParams.aX || 0.5, textParams.aY || 0.5);

    button.textField = textField;

    return button;
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
Gui.BitmapText = function (text, style) {
    PIXI.extras.BitmapText.call(this, text, style);
}
Gui.BitmapText.prototype = Object.create(PIXI.extras.BitmapText.prototype);
Gui.BitmapText.prototype.constructor = Gui.BitmapText;

// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
Gui.Text = function (text, style) {
    PIXI.Text.call(this, text, style);
}
Gui.Text.prototype = Object.create(PIXI.Text.prototype);
Gui.Text.prototype.constructor = Gui.Text;

// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
Gui.LocalizedText = function (textKey, style, maxWidth, maxHeight) {
    PIXI.Text.call(this, Config.getInstance().getLocalizedText(textKey), style);
    this.textKey = textKey;
    app.on('language_changed', this.languageListener, this);
    this.maxWidth = maxWidth || 1000*TEXTURE_UPSIZER;
    this.maxHeight = maxHeight || 1000*TEXTURE_UPSIZER;
    this.setLocalizedText(this.textKey);
}
Gui.LocalizedText.prototype = Object.create(PIXI.Text.prototype);
Gui.LocalizedText.prototype.constructor = Gui.LocalizedText;

Gui.LocalizedText.prototype.setLocalizedText = function(textKey) {
    this.scale.set(1);
    this.text = Config.getInstance().getLocalizedText(textKey).replace('{}', this.dynamicValue || "");
    if(this.width > this.maxWidth || this.height > this.maxHeight) {
        this.scale.set(Math.min(this.maxWidth / this.width, this.maxHeight / this.height, 1));
    } else {
        this.scale.set(1);
    }
}

Gui.LocalizedText.prototype.setDynamicValue = function(value) {
    this.dynamicValue = value;
    this.setLocalizedText(this.textKey);
}

Gui.LocalizedText.prototype.languageListener = function(language) {
    this.setLocalizedText(this.textKey);
}

Gui.LocalizedText.prototype.destroy = function() {
    app.off('language_changed', this.languageListener);
    PIXI.Text.prototype.destroy.call(this, arguments);
}



// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
Gui.ButtonAudio = function (config) {
    Gui.BaseButton.call(this, config);


    this.state = 'off';

    this.button_Sound_bg = Util.setParams(new PIXI.Sprite(assetsManager.getTexture('atlas', 'Button_Sound_bg.png')), {
        parent: this,
        aX: 0.5,
        aY: 0.5,
        x: 0,
        y: 0
    });
    this.addChild(this.button_Sound_bg);

    this.skin = new PIXI.Sprite(assetsManager.getTexture('atlas', 'button_audio_off.png'));
    this.addChild(this.skin);
    this.skin.anchor.set(0.5, 0.5);

    this.addClickListener(this.onClick, this);

    soundsManager.on('sound_state_change', function (data) {
        this.setState(data.state);
    }, this);

    this.setState(soundsManager.soundState);
}
Gui.ButtonAudio.prototype = Object.create(Gui.BaseButton.prototype);
Gui.ButtonAudio.prototype.constructor = Gui.ButtonAudio;

Gui.ButtonAudio.prototype.setState = function (v) {
    if (this.state == v) return;

    this.state = v;

    this.skin.texture = assetsManager.getTexture('atlas', 'button_audio_' + this.state + '.png');

    app.setAudioState(this.state);
}

Gui.ButtonAudio.prototype.switchState = function () {
    var state = (this.state == 'off') ? 'on' : 'off';
    this.setState(state);
}

Gui.ButtonAudio.prototype.onClick = function (e) {
    soundsManager.switchSoundState();
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var Switcher = function (config, sliderSize, isSwitchByClick, bg, sliderBg, iconLeft, iconRight) {
    Gui.BasePanel.call(this, config);


    var self = this;

    this.state = 'none';

    this.sliderSize = sliderSize;
    this.isSwitchByClick = isSwitchByClick;

    this.bg = new PIXI.Sprite(bg);
    this.addChild(this.bg);
    this.bg.anchor.set(0.5, 0.5);

    this.bg.interactive = true;
    this.bg.buttonMode = true;

    this.bg.on('click', this.onSwitcherClick, this);
    this.bg.on('tap', this.onSwitcherClick, this);


    this.slider = new Gui.BaseButton({name: 'slider', parentPanel: this}, false);
    this.slider.addClickListener(this.onSwitcherClick, this);
    this.slider.isClickSound = false;
    this.sliderBg = new PIXI.Sprite(sliderBg);
    this.slider.addChild(this.sliderBg);
    this.sliderBg.anchor.set(0.5, 0.5);

    this.sliderIcons = {left: new PIXI.Sprite(iconLeft), right: new PIXI.Sprite(iconRight)};
    this.slider.addChild(this.sliderIcons.left);
    this.sliderIcons.left.anchor.set(0.5, 0.5);
    this.slider.addChild(this.sliderIcons.right);
    this.sliderIcons.right.anchor.set(0.5, 0.5);

    this.sliderIcons.left.visible = this.sliderIcons.right.visible = false;

    this.setTo('left');
}
Switcher.prototype = Object.create(Gui.BasePanel.prototype);
Switcher.prototype.constructor = Switcher;

Switcher.prototype.onSwitcherClick = function () {
    if (this.isSwitchByClick) this.switch();

    app.playAudio('sounds', 'sound_click');

    this.emit('switcher_click');
}

Switcher.prototype.setTo = function (position) {
    if (this.state == position) return;

    this.state = position;

    var pos = this.getSliderPosition(this.state);

    this.slider.x = pos.x;
    this.slider.y = pos.y;

    var curSliderIcon = this.sliderIcons[this.state];
    curSliderIcon.visible = true;
    curSliderIcon.alpha = 1;

    var prevSliderIcon = this.sliderIcons[(this.state == 'left') ? 'right' : 'left'];
    prevSliderIcon.visible = false;
}

Switcher.prototype.getSliderPosition = function (state) {
    var pos = {x: 0, y: 0};
    if (state == 'left') pos.x = -this.sliderSize / 2;
    if (state == 'right') pos.x = this.sliderSize / 2;

    return pos;
}

Switcher.prototype.switch = function () {
    if (!(this.state == 'left' || this.state == 'right')) return;

    var self = this;

    var nextState = (this.state == 'left') ? 'right' : 'left';

    var curSliderIcon = this.sliderIcons[this.state];
    var nextSliderIcon = this.sliderIcons[nextState];

    var pos = this.getSliderPosition(nextState);

    this.state = 'switch_to_' + nextState;

    var tweenTime = 12 / 30;

    TweenMax.to(curSliderIcon, tweenTime * 0.5, {
        alpha: 0, ease: Power2.easeOut, onComplete: function () {
            curSliderIcon.visible = false;
            nextSliderIcon.visible = true;
            nextSliderIcon.alpha = 0;
            TweenMax.to(nextSliderIcon, tweenTime * 0.5, {alpha: 1, ease: Power2.easeOut});
        }
    });
    TweenMax.to(curSliderIcon.scale, tweenTime * 0.5, {
        x: 0.8, y: 0.8, ease: Power2.easeOut, onComplete: function () {
            nextSliderIcon.scale.x = nextSliderIcon.scale.y = 0.8;
            TweenMax.to(nextSliderIcon.scale, tweenTime * 0.5, {x: 1, y: 1, ease: Power2.easeOut});
        }
    });

    TweenMax.to(this.slider, tweenTime, {
        x: pos.x, y: pos.y, ease: Power2.easeOut, onComplete: function () {
            self.setTo(nextState);
        }
    });

    this.emit('switched', nextState);
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //