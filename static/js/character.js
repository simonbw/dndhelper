/**
 * @param characterData an object containing all the attributes
 * @constructor
 */
function Character(characterData) {
    this.data = characterData;
    this.handlers = {};
}

/**
 * @param {String} attribute
 */
Character.prototype.get = function (attribute) {
    if (attribute.substring(0, 5) == 'base_') {
        return this.data[attribute.substring(5)];
    }
    switch (attribute) {
        case 'initiative':
            return Character.getAbilityModifier(this.get('dexterity'));
    }
    return this.data[attribute];
};

/**
 * @param {String} attribute
 */
Character.prototype.set = function (attribute, value) {
    if (attribute in this.handlers) {
        var handlerList = this.handlers[attribute];
        for (var i = 0; i < handlerList.length; i++) {
            handlerList[i](value);
        }
    }

    if (attribute in this.data) {
        this.data[attribute] = value;
    } else {
        throw new Error("Could not set " + attribute);
    }
};

/**
 * @param update
 */
Character.prototype.applyUpdate = function (update) {
    this.set(update['attribute'], update['value']);
};

Character.prototype.addHandler = function (attribute, handler) {
    if (!(attribute in  this.handlers)) {
        this.handlers[attribute] = [];
    }
    this.handlers[attribute].push(handler);
};


Character.getAbilityModifier = function (n) {
    return (n - 10) / 2;
};