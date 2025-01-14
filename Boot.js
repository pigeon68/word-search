var StateBoot = function () {
    // console.log('StateBoot');

    assetsManager.loader.addListener('progress', this.onLoadProgress);
    assetsManager.loader.addListener('complete', this.onLoadComplete);
    assetsManager.loadAssets('boot');
};

StateBoot.prototype.onLoadComplete = function () {
    assetsManager.loader.removeListener('progress', this.onLoadProgress);
    assetsManager.loader.removeListener('complete', this.onLoadComplete);
    new StateLoad();
};

StateBoot.prototype.onLoadProgress = function (loader, resource) {
    // console.log(resource);
};

StateBoot.prototype.destroy = function () {

};