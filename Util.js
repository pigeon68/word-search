
var TEXTURE_UPSIZER = 2;

var Util = function () {

};

function bind(func, context) {
    return function () {
        return func.apply(context, arguments);
    };
}

Util.getSpriteN = function (n) {
    if (n < 10) return '000' + n;
    if (n < 100) return '00' + n;
    if (n < 1000) return '0' + n;
    return n;
}

Util.sign = function (value) {
    if (value >= 0) return 1;
    else if (value < 0) return -1;
}

Util.traceErrorStack = function () {
    var err = new Error();
    console.log(err.stack);

    return err.stack;
}

Util.TO_DEGREES = 57.295779513082320876798154814105;
Util.TO_RADIANS = 0.01745329251994329576923;

Util.randomRangeInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
Util.randomRange = function (min, max) {
    return Math.random() * (max - min) + min;
}

Util.randomElement = function (elements) {
    return elements[Util.randomRangeInt(0, elements.length - 1)];
}

Util.shuffleElements = function (elements) {
    var l = elements.length;
    if (l <= 1) return elements;

    for (var i = 0; i < l; i++) {
        if (i == 0 || (i > 0 && Util.randomRangeInt(1, 100) <= 50)) {
            var n = Util.randomRangeInt(0, l - 1 - 1);
            if (n >= i) n++;
            var t = elements[n];
            elements[n] = elements[i];
            elements[i] = t;
        }
    }

    return elements;
}

Util.randomSequenceInt = function (min, max, count, isUnique) {
    var result = [];
    for (var i = 0; i < count; i++) {
        var number = Util.randomRangeInt(min, max);
        if (!isUnique) result.push(number)
        else {
            if (result.indexOf(number) == -1) result.push(number);
            else i--;
        }
    }

    return result;
}

Util.getRandomVariant = function (variants) // [{e: element, c: chance}, {e: element, c: chance}, ...]
{
    var total = 0;
    for (var i = 0; i < variants.length; i++) total += variants[i].c;

    var n = Util.randomRange(0, total);
    var shift = 0;

    // var e = null;

    for (var i = 0; i < variants.length; i++) {
        var chance = variants[i].c + shift;
        if (n <= chance) return variants[i].e;
        // console.log(chance, shift);
        shift += variants[i].c;


    }

    // console.log('E: ', e);

    return null;
}

Util.colorToHex = function (color) {
    // colot = String(color);
    if (color.substr(0, 1) === '#') {
        return color;
    }
    var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);

    var red = parseInt(digits[2]);
    var green = parseInt(digits[3]);
    var blue = parseInt(digits[4]);

    var rgb = blue | (green << 8) | (red << 16);
    //return digits[1] + '#' + rgb.toString(16);
    return digits[1] + rgb;
}

Util.distance = function (x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;

    return Math.sqrt(dx * dx + dy * dy);
}

Util.angle = function (x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
};

Util.getMoveVector = function (speed, angle) {
    angle = angle * Util.TO_RADIANS;

    return new PIXI.Point(speed * Math.cos(angle), speed * Math.sin(angle));
}

Util.getRotAngle = function (aX, aY, bX, bY, aR, rS) {
    var mAngle = Math.atan2(bY - aY, bX - aX) * Util.TO_DEGREES;
    var dAngle = aR - mAngle;

    if (dAngle > 180) dAngle = -360 + dAngle;
    else if (dAngle < -180) dAngle = 360 + dAngle;

    if (Math.abs(dAngle) < rS) {
        return -dAngle;
    } else if (dAngle > 0) {
        return -rS;
    } else {
        return rS;
    }
};

Util.normalizeAngle = function (angle) {
    newAngle = angle;
    while (newAngle <= -180) newAngle += 360;
    while (newAngle > 180) newAngle -= 360;
    return newAngle;
};

Util.clone = function (obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = Util.clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = Util.clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
};

Util.lengthInUtf8Bytes = function (str) {
    // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
    var m = encodeURIComponent(str).match(/%[89ABab]/g);
    return str.length + (m ? m.length : 0);
}

Util.keyboard = function (keyCode) {
    var key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = function (event) {
        if (event.keyCode === key.code) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
        }
        event.preventDefault();
    };

    //The `upHandler`
    key.upHandler = function (event) {
        if (event.keyCode === key.code) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
        }
        event.preventDefault();
    };

    //Attach event listeners
    window.addEventListener(
        "keydown", key.downHandler.bind(key), false
    );
    window.addEventListener(
        "keyup", key.upHandler.bind(key), false
    );
    return key;
}

Util.getAntiDirection = function (dir) {
    if (dir == 'right') return 'left';
    if (dir == 'left') return 'right';
    if (dir == 'down') return 'up';
    if (dir == 'up') return 'down';
    if (dir == 'up_left') return 'down_right';
    if (dir == 'up_right') return 'down_left';
    if (dir == 'down_left') return 'up_right';
    if (dir == 'down_right') return 'up_left';

    return 'none';
}

Util.getDirectionBetweenHexs = function (hex1, hex2) {
    var i = hex2.i - hex1.i;
    var j = hex2.j - hex1.j;

    if (i == 1 && j == 1) return 'down_right';
    if (i == 2 && j == 0) return 'right';
    if (i == 1 && j == -1) return 'up_right';
    if (i == -1 && j == -1) return 'up_left';
    if (i == -2 && j == 0) return 'left';
    if (i == -1 && j == 1) return 'down_left';

    return 'none';
}

Util.getDistanceBetweenHexs = function (hex1, hex2) {
    var sY = Math.abs(hex1.j - hex2.j);
    var sX = Math.floor(Math.abs(hex1.i - hex2.i));

    var d = sY + (sX - Math.floor(sY / 2));
    d = (sX + sY) / 2;
    var ssX = sY - sX;
    if (ssX < 0) ssX = 0;
    d += ssX / 2;

    return d;
}

Util.getDirectionVector = function (dir) {
    if (dir == 'left') return {x: -1, y: 0};
    else if (dir == 'right') return {x: 1, y: 0};
    else if (dir == 'up_right') return {x: 1, y: -1};
    else if (dir == 'up_left') return {x: -1, y: -1};
    else if (dir == 'down_left') return {x: -1, y: 1};
    else if (dir == 'down_right') return {x: 1, y: 1};

    return null;
}

Util.createBgRect = function (width, height, radius, color, alpha) {
    if (radius == undefined) radius = 10;
    if (color == undefined) color = 0x000000;
    if (alpha == undefined) alpha = 1;

    var rect = new PIXI.Graphics();
    rect.beginFill(color, alpha);
    rect.drawRoundedRect(-width / 2, -height / 2, width, height, radius);
    rect.endFill();

    // rect.anchor.set(0.5, 0.5);

    return rect;
}

Util.createBgRects = function (data, parent) {
    var result = [];

    if (parent == undefined) parent = null;

    for (var i = 0; i < data.length; i++) {
        var info = data[i];

        if (info.x == undefined) info.x = 0;
        if (info.y == undefined) info.y = 0;
        if (info.radius == undefined) info.radius = 5;
        if (info.color == undefined) info.color = 0x000000;
        if (info.alpha == undefined) info.alpha = 1;

        var x = info.x;
        var y = info.y;
        var width = info.width;
        var height = info.height;
        var radius = info.radius;
        var color = info.color;
        var alpha = info.alpha;

        var rect = Util.createBgRect(width, height, radius, color, alpha);
        rect.x = x;
        rect.y = y;
        if (parent != null) parent.addChild(rect);

        result.push(rect);
    }

    return result;
}

Util.setParams = function (object, config) {
    if (config.parent) config.parent.addChild(object);

    if (config.aX != undefined && object.anchor) object.anchor.x = config.aX;
    if (config.aY != undefined && object.anchor) object.anchor.y = config.aY;
    // if(object.anchor) object.anchor.set(config.aX, config.aY);

    if (config.x != undefined) object.x = config.x;
    if (config.y != undefined) object.y = config.y;
    if (config.alpha != undefined) object.alpha = config.alpha;

    if (config.width != undefined) object.width = config.width;
    if (config.height != undefined) object.height = config.height;

    if (config.xRelative != undefined) object.xRelative = config.xRelative;
    if (config.yRelative != undefined) object.yRelative = config.yRelative;

    if (config.scaleX != undefined && object.scale) object.scale.x = config.scaleX;
    if (config.scaleY != undefined && object.scale) object.scale.y = config.scaleY;
    if (config.scaleXY != undefined && object.scale) object.scale.x = object.scale.y = config.scaleXY;

    if (config.visible != undefined && object.visible != undefined) object.visible = config.visible;

    return object;
}

Util.tweenElements = function (tweenData, onComplete) {
    var count = 0;

    var config = tweenData.config;
    var elements = tweenData.elements;

    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];

        var paramsStart = element.start;
        var paramsEnd = element.end;

        Util.setParams(element.obj, paramsStart);

        var tweenParams = {};
        var tweenScaleParams = null;
        for (var key in paramsEnd) {
            if (key == 'x' || key == 'y' || key == 'xRelative' || key == 'yRelative' || key == 'alpha' || key == 'width' || key == 'height' || key == 'ease') tweenParams[key] = paramsEnd[key];
            else if (key == 'scaleX' || key == 'scaleY' || key == 'scaleXY') {
                if (tweenScaleParams == null) tweenScaleParams = {};
                if (key == 'scaleX') tweenScaleParams['x'] = paramsEnd[key];
                else if (key == 'scaleY') tweenScaleParams['y'] = paramsEnd[key];
                else if (key == 'scaleXY') {
                    tweenScaleParams['x'] = paramsEnd[key];
                    tweenScaleParams['y'] = paramsEnd[key];
                }
            }
        }
        if (tweenScaleParams != null && tweenParams['ease'] != undefined) tweenScaleParams['ease'] = tweenParams['ease'];
        tweenParams.onComplete = tweenComplete;
        if (tweenScaleParams != null) tweenScaleParams.onComplete = tweenComplete;
        count++;
        if (tweenScaleParams != null) count++;

        var delay = element.delay;
        if (delay == undefined) delay = 0;
        tweenParams.delay = delay;
        if (tweenScaleParams != null) tweenScaleParams.delay = delay;

        var ease = element.ease;
        if (ease != undefined) {
            tweenParams.ease = ease;
            if (tweenScaleParams != null) tweenScaleParams.ease = ease;
        }

        TweenMax.to(element.obj, element.time, tweenParams);
        if (tweenScaleParams != null) TweenMax.to(element.obj.scale, element.time, tweenScaleParams);
    }

    function tweenComplete() {
        count--;
        if (count == 0 && onComplete) onComplete();

        if (count < 0) console.log('TweenElements: Error!');
    }
}
//==========================================================================================================================================//
Util.Id = function (tags) {
    this.num = Util.Id.num;
    Util.Id.num++;

    this.tags = {};

    if (tags != undefined) this.addTags(tags);
};

Util.Id.num = 0;

Util.Id.prototype.addTag = function (tag) {
    var t = this.tags[tag];
    if (t == undefined) this.tags[tag] = 1;
};

Util.Id.prototype.addTags = function (tags) {
    for (var i = 0; i < tags.length; i++) this.addTag(tags[i]);
};

Util.Id.prototype.removeTag = function (tag) {
    var t = this.tags[tag];
    if (t != undefined) t--;

    if (t == 0) t = undefined;

    this.tags[tag] = t;
};

Util.Id.prototype.check = function (filter) {
    if (filter == null) return false;

    if (filter.type == 'OR') {
        for (var i = 0; i < filter.tags.length; i++) {
            var tag = filter.tags[i];
            if (this.tags[tag] != undefined) return true;
        }

        return false;
    } else if (filter.type == 'AND') {
        for (var i = 0; i < filter.tags.length; i++) {
            var tag = filter.tags[i];
            if (this.tags[tag] == undefined) return false;
        }

        return true;
    }

    return false;
};
//==========================================================================================================================================//
// type: 'AND', 'OR'
Util.IdFilter = function (type, tags) {
    this.type = type;
    this.tags = tags;
};

//==========================================================================================================================================//
Util.SignalsManager = function () {
    this.states = {};
    this.signalsListeners = [];
};

Util.SignalsManager.prototype.setState = function (state, value) {
    this.states[state] = value;
};

Util.SignalsManager.prototype.addSignalListener = function (name, data, callback) {
    this.signalsListeners.push({name: name, data: data, callback: callback, type: 'many'});
}

Util.SignalsManager.prototype.dispatchSignal = function (name, data) {

}

// Util.ActionsManager = function()
// {

// };

Util.Action = function (name, object, data) {
    this.name = name;
    this.object = object;
    this.data = data;
}

Util.Thread = function () {
    this.isExecute = false;
    this.actions = null;
    this.actionsController = null;

    this.rootAction = null;

    this.onCompleteCallback = null;
    this.onErrorCallback = null;
}

Util.Thread.exe = function (actions, actionsController, onCompleteCallback, onErrorCallback) {
    var thread = new Util.Thread();
    thread.execute(actions, actionsController, onCompleteCallback, onErrorCallback);

    return thread;
}

Util.Thread.prototype.execute = function (actions, actionsController, onCompleteCallback, onErrorCallback) {
    var self = this;

    this.isExecute = true;
    this.actions = actions;
    this.actionsController = actionsController;

    this.onCompleteCallback = onCompleteCallback;
    this.onErrorCallback = onErrorCallback;

    this.rootAction = this.actions[0];
    exeNext();

    function exeNext() {
        self.exe.call(self, self.rootAction, function (thread, action) {
            var n = self.actions.indexOf(self.rootAction);
            if (n == self.actions.length - 1) self.onComplete.call(self);
            else {
                self.rootAction = self.actions[n + 1];
                exeNext();
            }
        }, function (error) {
            self.onError.call(self, error);
        });
    }
}

Util.Thread.prototype.onError = function (error) {
    console.log('Thread Error:', error);

    if (this.onErrorCallback) this.onErrorCallback(this, error);
}

Util.Thread.prototype.onComplete = function () {
    this.isExecute = false;
    this.rootAction = null;
    this.actions = null;
    this.actionsController = null;

    if (this.onCompleteCallback) this.onCompleteCallback(this);
}

Util.Thread.prototype.exe = function (action, onCompleteCallback, onErrorCallback) {
    // console.log('ActionExecute:', action.name);

    var self = this;

    if (action.name != 'action_exe') {
        this.actionsController.exe(this, new Util.Action('action_exe', action.object, {action: action}), function (t, a) {
            exeAction();
        }, onErrorCallback);
        return;
    } else exeAction();

    function onActionComplete(thread, action) {
        if (!action) {
            return;
        }

        if (action.name != 'action_complete' && action.name != 'action_exe') {
            self.actionsController.exe(self, new Util.Action('action_complete', action.object, {action: action}), function (t, a) {
                onCompleteCallback(self, action);
            }, onErrorCallback);
        } else onCompleteCallback(self, action);
    }

    function exeAction() {

        if (action.name == 'log') {
            console.log(action.data.text);

            onActionComplete(self, action);
        } else self.actionsController.exe(self, action, onActionComplete, onErrorCallback)
    }
}

Util.Entity = function () {
    this.name = 'none';
    this.id = new Util.Id();
    this.container = null;
    this.host = null;
    this.isExist = true;
}

Util.Entity.prototype.init = function () {

}

Util.Entity.prototype.addToContainer = function (container) {
    this.container = container;
    this.host = this.container.host;

    this.container.addEntity(this);
}

Util.Entity.prototype.exe = function (thread, action, onCompleteCallback, onErrorCallback) {
    onCompleteCallback(thread, action);
}

Util.Entity.prototype.destroy = function () {
    if (this.isExist) {
        this.isExist = false;

        if (this.container != null) this.container.removeEntity(this);
        this.container = null;

        this.host = null;
    }
}

Util.EntitiesContainer = function (host) {
    this.host = host;
    this.entities = [];

    this.isExist = true;
}

Util.EntitiesContainer.prototype.addEntity = function (entity) {
    var n = this.entities.indexOf(entity);
    if (n == -1) this.entities.push(entity);
}

Util.EntitiesContainer.prototype.removeEntity = function (entity) {
    // entity.isExist = false;
    var n = this.entities.indexOf(entity);
    // if(n != -1) this.entities[n] = null;
    if (n != -1) this.entities.splice(n, 1);
}

Util.EntitiesContainer.prototype.exeAllEntities = function (thread, action, onCompleteCallback, onErrorCallback) {
    if (this.entities.length == 0) {
        onCompleteCallback();
        return;
    }

    Util.Entity.exeAllEntities(this.entities.slice(), thread, action, onCompleteCallback, onErrorCallback);
}

Util.EntitiesContainer.prototype.destroy = function () {
    if (this.isExist) {
        this.isExist = false;

        for (var i = 0; i < this.entities.length; i++) {
            if (this.entities[i] != null) this.entities[i].destroy();
        }

        this.entities = null;
        this.host = null
    }
}

Util.Entity.exeAllEntities = function (entities, thread, action, onCompleteCallback, onErrorCallback) {
    if (entities.length == 0) {
        onCompleteCallback();
        return;
    }

    var entity = null;
    var n = -1;

    function exeNextEntity(t, a) {
        if (entity == null) n = 0;
        else n = entities.indexOf(entity) + 1;

        var isComplete = false;
        while (entities[n] == null || entities[n] == undefined || !entities[n].isExist) {
            n++;
            if (n >= entities.length) {
                isComplete = true;
                break;
            }
        }
        if (isComplete) {
            onCompleteCallback();
            return;
        }

        entity = entities[n];
        // console.log(n, entity);
        entity.exe(thread, action, exeNextEntity, onErrorCallback);
    }

    exeNextEntity(entity);
}
