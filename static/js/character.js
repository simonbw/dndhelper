/**
 * Represents a character. Can sync data with the server.
 * @param {Object} characterData - an object containing all the attributes
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
    // for things before modifiers
    if (attribute.substring(0, 5) == 'base_') {
        return this.data[attribute.substring(5)];
    }
    return this.data[attribute];
};

/**
 * @param {string} attribute
 * @param {*} value
 */
Character.prototype.set = function (attribute, value) {
    if (attribute == 'set_item') {
        console.log(this.get('name'), ' set item to ', value);
        var inventory = this.get('inventory');
        var contained = false;
        for (var i = 0; i < inventory.length; i++) {
            var item = inventory[i];
            if (item['id'] == value['id']) {
                for (var attr in value) {
                    if (value.hasOwnProperty(attr)) {
                        item[attr] = value[attr];
                        contained = true;
                    }
                }
                break;
            }
        }
        if (!contained) {
            inventory.push(value);
        }
    } else if (attribute in this.data) {
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
 * @param {string} attribute
 * @param {function} handler
 */
Character.prototype.addHandler = function (attribute, handler) {
//    console.log(this.get('name') + ' (' + this.get('id') + ') binding: ' + attribute);
    if (typeof attribute != 'string') {
        throw new TypeError('Attribute must be string, but is:' + typeof attribute + " : " + attribute);
    }
    if (typeof handler !== 'function') {
        throw new TypeError('Handler must be a function:' + handler);
    }
    if (!(attribute in this.handlers)) {
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
            self.applyUpdate(update);
        }
    });
};

/**
 * Save an attribute value to the server.
 * @param {string} attribute - the attribute to save
 * @param {*} value - the value to set the attribute to
 * @param {Function} [callback] - called when the server responds.
 */
Character.prototype.saveAttribute = function (attribute, value, callback) {
    var data = {};
    data[attribute] = value;
    this.saveData(data, callback);
};

/**
 * Save some data to the server
 * @param {Object} data - the data to send
 * @param {Function} [callback] - call on response
 */
Character.prototype.saveData = function (data, callback) {
    console.log('saving character data', data);
    $.ajax(this.get('update_url'), {
        type: "POST",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(data),
    }).done(function (responseData) {
        if (callback) {
            callback(responseData);
        }
        if (updates && updates.processResponseData) {
            updates.processResponseData(responseData);
        }
    });
};