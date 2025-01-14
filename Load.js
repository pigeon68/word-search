var StateLoad = function () {
    // console.log('StateLoad');

    var rootScene = guiManager.rootScene;

    this.container = new PIXI.Container();
    rootScene.addChild(this.container);

    this.nLoaded = 0;

    assetsManager.loader.addListener('progress', this.onLoadProgress, this);
    assetsManager.loader.addListener('complete', this.onLoadComplete, this);

    assetsManager.loadAssets('load');
};

StateLoad.prototype.onLoadComplete = function () {
    var self = this;

    // console.log('StateLoad: LoadComplete!');

    assetsManager.loader.removeListener('progress', this.onLoadProgress);
    assetsManager.loader.removeListener('complete', this.onLoadComplete);

    assetsManager.loadAudio(function () {
        // self.progressBar.scale.x = 1;
        self.toMainMenu(function () {
            self.clear();
            app.init();
        });
    });
};

StateLoad.prototype.toMainMenu = function (callback) {
    // TweenMax.to(this.progressBar, 8 / 30, {alpha: 0, y: 200, ease: constsManager.getData('tweens/tween_hide')});
    // TweenMax.to(this.logo, 14 / 30, {y: 1, ease: constsManager.getData('tweens/tween_hide'), onComplete: callback});
    callback();
};

StateLoad.prototype.clear = function () {

}

StateLoad.prototype.onLoadProgress = function (loader, resource) {
    var maxLoaded = 15;
    this.nLoaded++;
    if (this.nLoaded > maxLoaded) this.nLoaded = maxLoaded;

    // console.log(loader.progress);
    // this.progressBar.scale.x = this.nLoaded / maxLoaded;
};

StateLoad.prototype.destroy = function () {

};
