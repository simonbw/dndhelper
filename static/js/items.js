'use strict';
/*global bundle*/


window.items = (function () {

    /** @type {Array.<Object>} */
    var items = [];
    /** @type {Object.<number, Object>} */
    var itemMap = {};
    /** @type {Object.<number, Array.<function(Object)>>} */
    var handlers = {};

    /**
     * Load one item.
     * @param {number} id - Id of the item type to look up.
     * @param {function(Object)} [callback] - Call when loaded. Passes the item.
     * @param {boolean} [force] - If true, force lookup from the server instead of the cache. Defaults to false.
     */
    function loadOne(id, callback, force) {
        if (itemMap.hasOwnProperty(id) && !force) {
            if (typeof callback === 'function') {
                callback(itemMap[id]);
            }
            refreshHandlers(id);
        } else {
            loadMany([id], function () {
                if (typeof callback == 'function') {
                    callback(itemMap[id]);
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
        var requestData = {'item_ids[]': ids};
        $.getJSON(bundle['fetch_item_url'], requestData, function (responseData) {
            var items = responseData['items'];
            items.forEach(processItem);
            callback(items);
        });
    }

    /**
     * Call the handlers for an item.
     * @param {number} itemId
     */
    function refreshHandlers(itemId) {
        if (handlers.hasOwnProperty(itemId)) {
            var item = itemMap[itemId];
            handlers[itemId].forEach(function (handler) {
                handler(item);
            });
        } else {
            console.log('no handlers for:', itemMap[itemId]);
        }
    }

    /**
     * Process items into the cache and call handlers.
     * @param {Object} item
     */
    function processItem(item) {
        if (!itemMap.hasOwnProperty(item['id'])) {
            items.push(item);
        }
        itemMap[item['id']] = item;
        refreshHandlers(item['id']);
    }

    /**
     * Returns true if the item is loaded to the cache.
     * @param {number} id
     * @returns {boolean}
     */
    function isLoaded(id) {
        return false;
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

    // make sure all bundled items are processed
    if (bundle.hasOwnProperty('items')) {
        bundle['items'].forEach(processItem);
    }


    return {
        'isLoaded': isLoaded,
        'loadOne': loadOne,
        'addHandler': addHandler,
        'refreshHandlers': refreshHandlers
    };
})();