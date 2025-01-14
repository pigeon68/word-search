// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
var ConstsManager = function () {
    this.gameWidth = 540*TEXTURE_UPSIZER;
    this.gameHeight = 540*TEXTURE_UPSIZER;
    this.gameMinWidth = 540*TEXTURE_UPSIZER;
    this.gameMinHeight = 540*TEXTURE_UPSIZER;

    this.storage = {};

    const primaryFontFamily = Config.getInstance().getProperty('primaryFont').family;
    const secondaryFontFamily = Config.getInstance().getProperty('secondaryFont').family;


    this.storage['text_configs'] =
        {
            debug_text_value: {fontFamily: primaryFontFamily, fontSize: 60*TEXTURE_UPSIZER, fill: 0xFFFFFF, align: 'center'}, //{font: '60px CG_70', align: 'center', tint: 0xFFFFFF},
            debug_text_name: {fontFamily: primaryFontFamily, fontSize: 60*TEXTURE_UPSIZER, fill: 0xFFFFFF, align: 'right'}, //{font: '60px CG_70', align: 'right', tint: 0xFFFFFF},

            field_char_text: {fontFamily: primaryFontFamily, fontSize: 76*TEXTURE_UPSIZER, fill: 0x586679, align: 'center'}, //{font: '76px CG_70', align: 'center', tint: 0x586679},
            field_words_text: {fontFamily: primaryFontFamily, fontSize: 60*TEXTURE_UPSIZER, fill: 0xFFFFFF, align: 'left'}, //{font: '60px CG_70', align: 'left', tint: 0xFFFFFF},
            field_maniac_words_text: {fontFamily: secondaryFontFamily, fontSize: 65*TEXTURE_UPSIZER, fill: 0x5B5855, align: 'left'}, //{font: '65px CO_65', align: 'left', tint: 0x5B5855},
            field_title_text: {fontFamily: primaryFontFamily, fontSize: 65*TEXTURE_UPSIZER, fill: 0x18273D, align: 'center'}, //{font: '65px CG_70', align: 'center', tint: 0x18273D},
            timer_text: {fontFamily: primaryFontFamily, fontSize: 60*TEXTURE_UPSIZER, fill: 0xFFFFFF, align: 'center'}, //{font: '60px CG_70', align: 'center', tint: 0xFFFFFF},
            streak_text: {fontFamily: primaryFontFamily, fontSize: 56*TEXTURE_UPSIZER, fill: 0x8C836A, align: 'left'},  //{font: '56px CG_70', align: 'left', tint: 0x8C836A},
            category_name: {fontFamily: primaryFontFamily, fontSize: 50*TEXTURE_UPSIZER, fill: 0x000000, align: 'center'}, //{font: '50px CG_70', align: 'center', tint: 0x7B7158},

            time_popup: {fontFamily: primaryFontFamily, fontSize: 70*TEXTURE_UPSIZER, fill: 0x586679, align: 'center'}, //{font: '70px CG_70', align: 'center', tint: 0x665E48},

            solved_category: {fontFamily: primaryFontFamily, fontSize: 64*TEXTURE_UPSIZER, fill: 0xFFFFFF, align: 'center'}, // {font: '76px CG_70', align: 'center', tint: 0x665E48},
            solved_time: {fontFamily: primaryFontFamily, fontSize: 64*TEXTURE_UPSIZER, fill: 0xFFFFFF, align: 'center'}, //{font: '76px CG_70', align: 'center', tint: 0x665E48}
        };

    this.storage['text_styles'] =
        {
            title_text: {fontFamily: primaryFontFamily, fontSize: 80*TEXTURE_UPSIZER, fill: 0x586679, align: 'center'},
            common_button_text: {fontFamily: primaryFontFamily, fontSize: 70*TEXTURE_UPSIZER, fill: 0x000000, align: 'center'},
            common_ui_text: {fontFamily: primaryFontFamily, fontSize: 80*TEXTURE_UPSIZER, fill: 0xFFFFFF, align: 'center'},
            common_ui_text_bigger: {fontFamily: primaryFontFamily, fontSize: 92*TEXTURE_UPSIZER, fill: 0xFFFFFF, align: 'center'},
            play_button_text: {fontFamily: primaryFontFamily, fontSize: 102*TEXTURE_UPSIZER, fill: 0x000000, align: 'center'},
            main_menu_header_text: {fontFamily: primaryFontFamily, fontSize: 54*TEXTURE_UPSIZER, fill: 0x000000, align: 'center'},
            main_menu_small_text: {fontFamily: primaryFontFamily, fontSize: 45*TEXTURE_UPSIZER, fill: 0x000000, align: 'center'},
            on_off_grey_text: {fontFamily: primaryFontFamily, fontSize: 40*TEXTURE_UPSIZER, fill: 0x586679, align: 'center'},
            on_off_white_text: {fontFamily: primaryFontFamily, fontSize: 40*TEXTURE_UPSIZER, fill: 0x000000, align: 'center'},
            difficulty_label_grey_text: {fontFamily: primaryFontFamily, fontSize: 40*TEXTURE_UPSIZER, fill: 0x586679, align: 'center'},
            difficulty_label_white_text: {fontFamily: primaryFontFamily, fontSize: 40*TEXTURE_UPSIZER, fill: 0x000000, align: 'center'},
            ui_panel_header_text: {fontFamily: primaryFontFamily, fontSize: 55*TEXTURE_UPSIZER, fill: 0xFFFFFF, align: 'center'},
            solved_panel_text: {fontFamily: primaryFontFamily, fontSize: 64*TEXTURE_UPSIZER, fill: 0xFFFFFF, align: 'center'},
            difficulty_header_text: {fontFamily: primaryFontFamily, fontSize: 48*TEXTURE_UPSIZER, fill: 0x000000, align: 'center'},
            main_menu_advanced_settings_text: {fontFamily: primaryFontFamily, fontSize: 54*TEXTURE_UPSIZER, fill: 0x000000, align: 'center'},
            settings: {fontFamily: primaryFontFamily, fontSize: 80*TEXTURE_UPSIZER, fill: 0xFFFFFF, align: 'center'},
            sound: {fontFamily: primaryFontFamily, fontSize: 70*TEXTURE_UPSIZER, fill: 0xFFFFFF, align: 'left'},
            reveal_puzzle: {fontFamily: primaryFontFamily, fontSize: 70*TEXTURE_UPSIZER, fill: 0x000000, align: 'center'},
            new_puzzle_settings: {fontFamily: primaryFontFamily, fontSize: 70*TEXTURE_UPSIZER, fill: 0x000000, align: 'center'},
            main_menu_settings: {fontFamily: primaryFontFamily, fontSize: 70*TEXTURE_UPSIZER, fill: 0x000000, align: 'center'},
            help_desc_for_maniac: {fontFamily: primaryFontFamily, fontSize: 45*TEXTURE_UPSIZER, fill: 0x000000, align: 'center', wordWrap: true, wordWrapWidth: 700*TEXTURE_UPSIZER},
        };

    this.storage.audio_info =
        {
            sounds:
                {
                    path: 'assets/audio/',

                    files:
                        {
                            sound_click: {volume: 1.0},
                            sound_close_selected: {volume: 1.0},
                            sound_play_button: {volume: 0.7},
                            sound_red_beep: {volume: 0.7},
                            sound_selected_word: {volume: 1.0},
                            sound_solved: {volume: 1.0},
                            sound_selected_non_word: {volume: 1.0},
                            sound_times_out: {volume: 1.0}
                        },

                    formats: ['ogg', 'm4a']
                    // formats: ['wav']
                },

            audio: {}
        };
}

ConstsManager.prototype.init = function () {

}

ConstsManager.prototype.getData = function (path) {
    var keys = path.split('/');
    if (keys.length == 0) return null;

    var data = this.storage[keys[0]];
    for (var i = 1; i < keys.length; i++) {
        var key = keys[i];
        if (key == null || data == null) return null;
        data = data[key];
    }

    return data;
}
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
document.addEventListener("DOMContentLoaded", function () {
    String.prototype.splice = function (idx, rem, str) {
        return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
    };


    const loadFonts = () => {
        return new Promise((resolve, reject) => {
            const primaryFont = Config.getInstance().getProperty('primaryFont');
            const secondaryFont = Config.getInstance().getProperty('secondaryFont');
            WebFont.load({
                custom: {
                    families: [primaryFont.family + (primaryFont.width ? ":" + primaryFont.width : ""), secondaryFont.family + (secondaryFont.width ? ":" + secondaryFont.width : "")]
                },
                active: () => {
                    resolve();
                },
                inactive: () => {
                    resolve();
                }
            });
        })
    }

    const startApp = async () => {
        await init();
    }

    Config.getInstance().loadConfig()
        .then(() => {
            console.log('Config file loaded');

        })
        .then(loadFonts)
        .then(startApp)
        .catch(e => {
            console.error("Something went wrong while loading config file");
        });


});

window.onfocus = function () {
    if (app) app.focusChange(true);
};
window.onblur = function () {
    if (app) app.focusChange(false);
};

window.addEventListener("beforeunload", function (e) {
    var confirmationMessage = "\o/";

    if (app && app.screenGame.gameState == 'game') {
        app.apiCallback('statistics', {result: 4, category: app.screenGame.category.name});
    }

    // (e || window.event).returnValue = confirmationMessage; //Gecko + IE
    // return confirmationMessage;                            //Webkit, Safari, Chrome
});

function isSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

window['wheelStoppedPropagation'] = false;
window.addEventListener("wheel", (e) => {
    // e.preventDefault();
    // e.stopImmediatePropagation();
    window['wheelStoppedPropagation'] = false;

    const _delta = e.deltaY || e.detail || e.wheelDelta;
    var delta = _delta;
    if (delta > 0) delta = 1;
    else if (delta < 0) delta = -1;

    // console.log(delta);
    if (app) app.emit('mouse_wheel', {sign: delta, event: e});

    if (!window['wheelStoppedPropagation'] && isSafari()) {
        setTimeout(() => {
            window.scrollTo(window.scrollX, _delta);
        }, 20);
    }
}, {passive:false});


var renderer;
var stage;
var app;

var assetsManager;
var soundsManager;
var guiManager;
var constsManager;

var interaction;

function init() {
    var avaiabledomains =
        [
            'localhost',
            'z-var.ru',
            'ifgd.info',
            'coolmath-games.com',
            'coolmathgames.com',
            'edit.coolmath-games.com',
            'stage.coolmath-games.com',
            'edit-stage.coolmath-games.com',
            'dev.coolmath-games.com',
            'm.coolmath-games.com'
        ];

    var isPlayAvaiable = false;
    var domain = document.domain;
    for (var i = 0; i < avaiabledomains.length; i++) {
        if (domain.indexOf(avaiabledomains[i]) != -1) {
            isPlayAvaiable = true;
            break;
        }
    }
    // console.log(domain);

    if (!isPlayAvaiable) return;

    renderer = PIXI.autoDetectRenderer(960*TEXTURE_UPSIZER, 720*TEXTURE_UPSIZER, {
        antialias: true,
        transparent: false,
        resolution: 1,
        autoResize: false,
        roundPixels: true
    });
    document.getElementById('game').appendChild(renderer.view);

    renderer.backgroundColor = 0x142740;
    // renderer.backgroundColor = 0x000000;
    renderer.view.style.position = "absolute";
    renderer.view.style.top = "0px";
    renderer.view.style.left = "0px";

    interaction = new PIXI.interaction.InteractionManager(renderer);

    constsManager = new ConstsManager();
    constsManager.init();

    assetsManager = new AssetsManager(PIXI.loader);

    assetsManager.addAssetToLoad('boot', {name: 'logo', url: 'assets/preloader/logo.png'});
    assetsManager.addAssetToLoad('load', {name: 'atlas', url: 'assets/atlas.json'});
    assetsManager.addAssetToLoad('load', {name: 'game_settings', url: 'assets/game_settings.json'});

    soundsManager = new SoundsManager();

    stage = new PIXI.Container();

    guiManager = new Gui.GuiManager(stage);

    renderer.render(stage);

    app = new App();

    new StateBoot();

    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);
    // window.addEventListener('onresize', resize);
    resize();
    for (var i = 1; i <= 10; i++) {
        setTimeout(function () {
            resize();
        }, 200 * i);
    }

    requestAnimationFrame(app.loop);
};

function resize() {
    if (app.screenGame && app.screenMainMenu && !((app.screenGame.state == 'show' || app.screenGame.state == 'hide') && (app.screenMainMenu.state == 'show' || app.screenMainMenu.state == 'hide'))) {
        return;
    }
    // console.log('z');
    var viewWidth = screen.width;
    var viewHeight = screen.height;

    var gameWidth = 0;
    var gameHeight = 0;

    var size = calculateGameSize(window.innerWidth, window.innerHeight);
    // var size = {width: window.innerWidth, height: window.innerHeight};
    gameWidth = size.width;
    gameHeight = size.height;

    ratio = Math.min(window.innerWidth / gameWidth, window.innerHeight / gameHeight);

    var shiftX = (window.innerWidth - Math.ceil(gameWidth * ratio)) / 2;
    var shiftY = (window.innerHeight - Math.ceil(gameHeight * ratio)) / 2;
    renderer.view.style.left = shiftX + "px";
    renderer.view.style.top = shiftY + "px";

    var width = Math.ceil(gameWidth * ratio);
    var height = Math.ceil(gameHeight * ratio);

    renderer.view.style.width = width + "px";
    renderer.view.style.height = height + "px";
    renderer.resize(gameWidth, gameHeight);

    // console.log(renderer);
    //
    // stage.scale.y = 720 / gameHeight;

    //stage.y = - (720 - gameHeight) / 2;
    //guiManager.rootScene.height = gameHeight;
    // var size = calculateGameSize(window.innerWidth, window.innerHeight);
    guiManager.resize(gameWidth, gameHeight);
    // guiManager.resize(size.width, size.height);
};

function calculateGameSize(screenWidth, screenHeight) {
    var width;
    var height;

    width = screenWidth;
    height = screenHeight;

    var minWidth = 1000*TEXTURE_UPSIZER;
    var minHeight = 1400*TEXTURE_UPSIZER;

    if (screenWidth > screenHeight) {
        minWidth = 1500*TEXTURE_UPSIZER;
        minHeight = 1000*TEXTURE_UPSIZER;
    }

    var wK = screenWidth / minWidth;
    var hK = screenHeight / minHeight;

    var k = 1 / Math.min(wK, hK);

    width = screenWidth * k;
    height = screenHeight * k;

    // console.log(width, height);

    return {width: width, height: height};
}

/*
function calculateGameSize(screenWidth, screenHeight)
{
  // var minW = 540;
  // var minH = 540;

  // var wK = 1;
  // var hK = 1;

  // if(screenHeight < minH) 
  // {
  //   wK = minH / screenHeight;
  //   screenHeight = minH;
  // } 
  // if(screenWidth < minW) 
  // {
  //   hK = minW / screenWidth;
  //   screenWidth = minW;
  // }

  var s = (screenWidth > screenHeight)?'w':'h';

  var whk = screenWidth / screenHeight;
  var hwK = screenHeight / screenWidth;
  // console.log(whk, hwK);

  if(whk > 0.70 && s == 'h')
  {
    screenHeight = screenWidth / 0.70;
  }  
  if(hwK > 0.70 && s == 'w')
  {
    screenWidth = screenHeight / 0.70;
  }

  // screenHeight += 200;

  // return {width: screenWidth*wK, height: screenHeight*hK};

  // var s = (screenWidth > screenHeight)?'w':'h';

  var wK = 1;
  var hK = 1;

  var sizeWH = 1000;

  if(s == 'w')
  {
    var k = screenHeight / sizeWH;
    wK = screenWidth / (sizeWH*k);
  }
  if(s == 'h')
  {
    var k = screenWidth / sizeWH;
    hK = screenHeight / (sizeWH*k);
  }

  var width = sizeWH * wK;
  var height = sizeWH * hK;

  // height += 300;

  return {width: width, height: height};
}
*/