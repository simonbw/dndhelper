'use strict';

if (window.models === undefined) {
    window.models = {};
}

/**
 * Create a simple model for getting data from the server.
 * @param name
 * @param fetch_url
 * @returns {{loadOne: loadOne, loadMany: loadMany, isLoaded: isLoaded, process: process, addHandler: addHandler, refreshHandlers: refreshHandlers}}
 * @constructor
 */
window.models.SimpleModel = function (name, fetch_url) {
    /** @type {Array.<Object>} */
    var data = [];
    /** @type {Object.<number, Object>} */
    var dataMap = {};
    /** @type {Object.<number, Array.<function(Object)>>} */
    var handlers = {};

    /**
     * Load one item.
     * @param {number} id - Id of the item type to look up.
     * @param {function(Object)} [callback] - Call when loaded. Passes the item.
     * @param {boolean} [force] - If true, force lookup from the server instead of the cache. Defaults to false.
     */
    function loadOne(id, callback, force) {
        if (dataMap.hasOwnProperty(id) && !force) {
            if (typeof callback === 'function') {
                callback(dataMap[id]);
            }
            refreshHandlers(id);
        } else {
            loadMany([id], function () {
                if (typeof callback == 'function') {
                    callback(dataMap[id]);
                }
            });
        }
    }

    /**
     * Load an array of items.
     * @param {Array.<number>} ids - Ids of the items to lookup.
     * @param {function(Object)} [callback] - Call when loaded. Passes the items.
     */
    function loadMany(ids, callback) {
        var requestData = {'ids[]': ids};
        $.getJSON(fetch_url, requestData, function (responseData) {
            var items = responseData['data'];
            items.forEach(process);
            callback(items);
        });
    }

    /**
     * Returns true if the item is loaded to the cache.
     * @param {number} id
     * @returns {boolean}
     */
    function isLoaded(id) {
        return dataMap.hasOwnProperty(id);
    }

    /**
     * Process items into the cache and call handlers.
     * @param {Object} item
     */
    function process(item) {
        if (!dataMap.hasOwnProperty(item['id'])) {
            data.push(item);
        }
        dataMap[item['id']] = item;
        refreshHandlers(item['id']);
    }

    /**
     * Add a handler for when an item is loaded/updated.
     * @param {number} id
     * @param {function(Object)} handler
     */
    function addHandler(id, handler) {
        if (!handlers.hasOwnProperty(id)) {
            handlers[id] = [];
        }
        handlers[id].push(handler);
    }

    /**
     * Call the handlers for an item.
     * @param {number} itemId
     */
    function refreshHandlers(itemId) {
        if (handlers.hasOwnProperty(itemId)) {
            var item = dataMap[itemId];
            handlers[itemId].forEach(function (handler) {
                handler(item);
            });
        } else {
            console.log('no handlers for:', dataMap[itemId]);
        }
    }

    /**
     * Get an item with the id, or undefined if not loaded.
     * @param id
     * @returns {Object}
     */
    function get(id) {
        return data[id];
    }


    return {
        'loadOne': loadOne,
        'loadMany': loadMany,
        'isLoaded': isLoaded,
        'process': process,
        'addHandler': addHandler,
        'refreshHandlers': refreshHandlers,
        'get': get
    }
};