/**
 * Represents a character. Can sync data with the server.
 * @param characterData an object containing all the attributes
 * @constructor
 */
function Character(characterData) {
    this.data = characterData;
    this.handlers = {};
}

/**
 * @param {string} attribute
 */
Character.prototype.get = function (attribute) {
    if (attribute.substring(0, 5) == 'base_') {
        return this.data[attribute.substring(5)];
    }
    return this.data[attribute];
};

/**
 * @param {string} attribute
 */
Character.prototype.set = function (attribute, value) {
    if (attribute in this.data) {
        this.data[attribute] = value;
    } else {
        throw new Error('Invalid attribute ' + attribute + ' to ' + value);
    }
    if (attribute in this.handlers) {
        var handlerList = this.handlers[attribute];
        for (var i = 0; i < handlerList.length; i++) {
            handlerList[i](value);
        }
    }
};

/**
 * @param {Object} update
 */
Character.prototype.applyUpdate = function (update) {
    this.set(update['attribute'], update['value']);
};

/**
 * Add a function to call when an attribute gets updated.
 * @param attribute
 * @param handler
 */
Character.prototype.addHandler = function (attribute, handler) {
    if (!(attribute in  this.handlers)) {
        this.handlers[attribute] = [];
    }
    this.handlers[attribute].push(handler);
};

/**
 * Bind this character to receive updates.
 */
Character.prototype.bindUpdates = function () {
    var self = this;
    updates.addUpdateHandler('character_update', function (update) {
        if (update['id'] == self.get('id')) {
            try {
                self.applyUpdate(update);
            } catch (e) {
                console.log('could not apply update', update, e);
            }
        }
    });
};

/**
 * Save some data to the server.
 * @param {string} attribute
 * @param {*} value
 * @param {Function} [callback] - called when the server responds.
 */
Character.prototype.saveAttribute = function (attribute, value, callback) {
    var data = {};
    data[attribute] = value;
    $.getJSON(this.get('update_url'), data, function (responseData) {
        updates.processResponseData(responseData);
        if (callback) {
            callback(responseData);
        }
    });
};

/**
 * @param n
 * @returns {number}
 */
Character.getAbilityModifier = function (n) {
    return (n - 10) / 2;
};
