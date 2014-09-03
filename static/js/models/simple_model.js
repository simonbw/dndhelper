'use strict';

window.models = window.models || {};

/**
 * Create a simple Model type.
 * @param {string} name - namespace of binds and updates
 * @param {string} fetchUrl - where to get data
 * @param {string} saveUrl - where to save data
 * @param {Array.<Object>} [bundledData] - data already loaded to process
 * @returns {function(new:Model, Object)}
 * @constructor
 */
window.models.createSimpleModel = function (name, fetchUrl, saveUrl, bundledData) {

    /** The id to use for new models. Should not be a possible model id. */
    var NEW_ID = -1;
    /** @type {Array.<Object>} */
    var modelList = [];
    /** @type {Object.<number, Model>} */
    var modelMap = {};
    /** @type {Object.<number, Array.<function(Object)>>} */
    var handlers = {};

    /**
     * Load one model.
     * @param {number} id - Id of the model to look up.
     * @param {function(Object)} [callback] - Call when loaded. Passes the model.
     * @param {boolean} [force] - If true, force lookup from the server instead of the cache. Defaults to false.
     */
    function loadOne(id, callback, force) {
        id = parseInt(id);
        if (isNaN(id)) {
            throw new Error('cannot load undefined id');
        }
        if (modelMap.hasOwnProperty(id) && !force) {
            if (typeof callback === 'function') {
                callback(modelMap[id]);
            }
            setTimeout(function () {
                refreshHandlers(id);
            }, 0);
        } else {
            loadMany([id], function () {
                if (typeof callback == 'function') {
                    callback(modelMap[id]);
                }
            });
        }
    }

    /**
     * Load an array of models.
     * @param {Array.<number>} ids - Ids of the models to lookup.
     * @param {function(Object)} [callback] - Call when loaded. Passes the models.
     */
    function loadMany(ids, callback) {
        var requestData = {'ids[]': ids};
        $.getJSON(fetchUrl, requestData, function (responseData) {
            var models = responseData['data'];
            var processed = models.map(process);
            if (typeof callback == 'function') {
                callback(processed);
            }
        });
    }

    /**
     * Returns true if the model is loaded to the cache.
     * @param {number} id
     * @returns {boolean}
     */
    function isLoaded(id) {
        return modelMap.hasOwnProperty(id);
    }

    /**
     * Process models into the cache and call handlers.
     * @param {Object} data
     */
    function process(data) {
        var dataId = data['id'];
        if (!modelMap.hasOwnProperty(dataId)) {
            var model = new Model(data);
            modelList.push(model);
            modelMap[dataId] = model;
            refreshNewHandlers(model);
        } else {
            modelMap[dataId].update(data);
        }
        refreshHandlers(dataId);
        return modelMap[dataId];
    }

    /**
     * Add a handler for when an model is loaded/updated.
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
     * Add a handler for when a model is loaded for the first time.
     * @param {function(Object)} handler
     */
    function addNewHandler(handler) {
        addHandler(NEW_ID, handler);
    }

    /**
     * Call the handlers for a model.
     * @param {number} modelId
     */
    function refreshHandlers(modelId) {
        if (handlers.hasOwnProperty(modelId)) {
            var model = modelMap[modelId];
            handlers[modelId].forEach(function (handler) {
                handler(model);
            });
        }
    }

    /**
     * Call the handlers for a new model.
     * @param {Model} model
     */
    function refreshNewHandlers(model) {
        if (handlers.hasOwnProperty(NEW_ID)) {
            handlers[NEW_ID].forEach(function (handler) {
                handler(model);
            });
        }
    }

    /**
     * Get a model with the id, or undefined if not loaded.
     * @param id
     * @returns {Object}
     */
    function get(id) {
        return modelMap[id];
    }

    /**
     * @param {Object} data - data to save.
     * @param {Function} [callback] - function to call when response is received
     */
    function saveData(data, callback) {
        $.ajax(saveUrl, {
            type: "POST",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(data)
        }).done(function (responseData) {
            process(responseData['data']);
            if (callback) {
                callback(responseData);
            }
        });
    }

    /**
     * Create a new Model.
     * @param {Object} [data]
     * @param {function} [callback]
     */
    function makeNew(data, callback) {
        data = data || {};
        data['id'] = 'new';
        saveData(data, callback);
    }

    /**
     * Add binds and update handlers.
     */
    function init() {
        binds.addReadBind(name, function (element, attribute) {
            var dataKey = 'data-' + name + '-id';
            var id = $(element).closest('[' + dataKey + ']').attr(dataKey);
            addHandler(id, function (model) {
                $(element).text(model[attribute]);
            });
        });

        binds.addWriteBind(name, function (element, attribute) {
            var dataKey = 'data-' + name + '-id';
            var id = $(element).closest('[' + dataKey + ']').attr(dataKey);
            var model = modelMap[id];
            if (model) {
                var value = $(element).val() || $(element).text();
                model.saveAttribute(attribute, value);
            }
        });

        updates.addUpdateHandler(name, process);

        if (bundledData) {
            bundledData.forEach(process);
        }
    }


    /**
     * @param data
     * @constructor
     */
    function Model(data) {
        this.update(data);
    }

    /**
     * @param data
     */
    Model.prototype.update = function (data) {
        for (var property in data) {
            if (data.hasOwnProperty(property)) {
                this[property] = data[property];
            }
        }
    };

    /**
     * @param attribute
     * @param value
     */
    Model.prototype.saveAttribute = function (attribute, value) {
        var data = {};
        data['id'] = this['id'];
        data[attribute] = value;
        saveData(data);
    };

    /**
     * @param {function} [callback]
     */
    Model.prototype.reload = function (callback) {
        loadOne(this.id, callback, false);
    };

    /**
     *
     */
    Model.prototype.refresh = function () {
        refreshHandlers(this['id']);
    };


    // attach static methods
    Model.loadOne = loadOne;
    Model.loadMany = loadMany;
    Model.isLoaded = isLoaded;
    Model.process = process;
    Model.addHandler = addHandler;
    Model.addNewHandler = addNewHandler;
    Model.refreshHandlers = refreshHandlers;
    Model.get = get;
    Model.saveData = saveData;
    Model.makeNew = makeNew;
    Model.init = init;

    Object.defineProperty(Model, 'all', {'value': modelList, 'writable': false});

    return Model;
};