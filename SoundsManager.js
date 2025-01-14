var SoundsManager = function () {
    EventEmitter.call(this);


    this.soundState = 'on';
};
SoundsManager.prototype = Object.create(EventEmitter.prototype);
SoundsManager.prototype.constructor = SoundsManager;

SoundsManager.prototype.setSoundState = function (state) {
    if (this.soundState == state) return;

    this.soundState = state;

    this.emit('sound_state_change', {state: this.soundState});
}

SoundsManager.prototype.switchSoundState = function () {
    var state = (this.soundState == 'on') ? 'off' : 'on';
    this.setSoundState(state);
}
