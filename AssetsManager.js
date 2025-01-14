var AssetsManager = function (loader) {
    this.loader = loader;
    this.resources = this.loader.resources;

    this.assetsToLoad = {};
    this.fontsToLoad = [];
};

AssetsManager.prototype.addAssetToLoad = function (key, assetInfo) {
    if (this.assetsToLoad[key] == undefined) this.assetsToLoad[key] = [];
    var storage = this.assetsToLoad[key];

    storage.push(assetInfo);
};

AssetsManager.prototype.addFontToLoad = function (assetInfo) {
    this.fontsToLoad.push(assetInfo);
};

AssetsManager.prototype.loadAssets = function (key) {
    var storage = this.assetsToLoad[key];

    this.loader.add(storage);
    this.loader.load();
}

AssetsManager.prototype.loadAudio = function (callback) {
    var self = this;

    var soundsData = constsManager.getData('audio_info/sounds');
    loadAudioData(soundsData, callback);

    function loadAudioData(data, callback) {
        var path = data.path;
        var files = data.files;
        var formats = data.formats;

        var count = Object.keys(files).length;

        for (var key in files) {
            var fff = [];
            for (var j = 0; j < formats.length; j++) {
                var f = path + key + '.' + formats[j];
                fff.push(f);
            }

            var audio = createAudio(fff, files[key].volume);
            audio.once('load', function () {
                count--;
                if (count == 0) callback();
            });
            constsManager.storage['audio_info']['audio'][key] = audio;
        }
    }

    function createAudio(src, volume) {
        var audio = new Howl({
            src: src,
            // format: ['ogg', 'm4a'],
            autoplay: false,
            loop: false,
            volume: volume
        });

        return audio;
    }
}


AssetsManager.prototype.loadFonts = function (callback) {
    var self = this;

    if (this.fontsToLoad.length == 0) {
        callback();
        return;
    }

    loadFont(this.fontsToLoad[0], loadNext);

    function loadFont(fontInfo, onComplete) {
        var font = new Font();
        font.fontFamily = fontInfo.fontFamily;
        font.src = fontInfo.url;

        font.onload = function () {
            onComplete(fontInfo);
        }

        font.onerror = function (err) {
            console.log(err);
        }
    }

    function loadNext(fontInfo) {
        var n = self.fontsToLoad.indexOf(fontInfo) + 1;
        if (n == self.fontsToLoad.length) callback();
        else loadFont(self.fontsToLoad[n], loadNext);
    }
}

AssetsManager.prototype.getJson = function (key) {
    var resource = this.resources[key];

    if (resource == undefined) {
        resource = null;
        console.log('AssetsManager: Error, resource [' + name + '] not found!');
    } else {
        resource = resource.data;
        if (resource == undefined || resource == null) {
            resource = null;
            console.log('AssetsManager: Error, resource "' + name + '" don\'t converted!');
        }
    }

    return resource;
};

AssetsManager.prototype.getAsset = function (key) {
    var resource = this.resources[key];

    if (resource == undefined) {
        resource = null;
        console.log('AssetsManager: Error, resource [' + name + '] not found!');
    }

    return resource;
};

AssetsManager.prototype.getTexture = function (name, subName) {
    var resource = this.resources[name];

    if (resource == undefined) console.log('AssetsManager: Error, resource [' + name + '] not found!');


    var texture = null;
    if (subName == undefined) texture = resource.texture;
    else texture = resource.textures[subName];

    if (texture == undefined || texture == null) {
        texture = null;
        console.log('AssetsManager: Error, texture [' + name + ', ' + subName + '] not found!');
    }

    return texture;
};
