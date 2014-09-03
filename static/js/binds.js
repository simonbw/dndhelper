'use strict';
/*global bundle*/

window.binds = (function () {

    /**
     * @param {Element} element
     * @returns {Character}
     */
    function getBoundCharacter(element) {
        return characters.fromId(parseInt($(element).closest('[data-character-id]').attr('data-character-id')));
    }

    /**
     * Maps namespace to handler.
     * @type {Object.<string, function(Element, string)>}
     */
    var readBinds = {};

    /**
     * Maps namespace to handler.
     * @type {Object.<string, function(Element, string)>}
     */
    var writeBinds = {};

    function addReadBind(type, bind) {
        readBinds[type] = bind;
    }

    function addWriteBind(type, bind) {
        writeBinds[type] = bind;
    }

    readBinds['character'] = function (element, attribute) {
        getBoundCharacter(element).addHandler(attribute, function (value) {
            $(element).text(value);
        });
    };

    writeBinds['character'] = function (element, attribute) {
        var value = $(element).val() || $(element).text();
        getBoundCharacter(element).saveAttribute(attribute, value);
    };


    /**
     * Initialize a read bind for this element. Must have the data-bind-read attribute set.
     * @param {Element|jQuery} element
     */
    function initReadBind(element) {
        var full = $(element).attr("data-bind-read").split('.');
        var namespace = full[0];
        var attribute = full[1];
        if (readBinds.hasOwnProperty(namespace)) {
            readBinds[namespace](element, attribute);
        } else {
            console.log('Unknown namespace: ', namespace);
//            throw new Error('Unknown namespace: ' + namespace);
        }
    }

    /**
     * Initialize a write bind for this element. Must have the data-bind-write property set.
     * @param {Element} element
     */
    function initWriteBind(element) {
        var full = $(element).attr("data-bind-write").split('.');
        var namespace = full[0];
        var attribute = full[1];
        var delay = 100;
        $(element).on('input', function () {
            var inputTime = Date.now();
            $(element).attr('data-last-input-time', inputTime);
            setTimeout(function () {
                if ($(element).attr('data-last-input-time') == inputTime) {
                    if (writeBinds.hasOwnProperty(namespace)) {
                        writeBinds[namespace](element, attribute);
                    } else {
                        throw new Error('Unknown namespace: ' + namespace);
                    }
                }
            }, delay);
        });
    }

    /**
     * Binds everything in this element.
     * @param {Node} element
     */
    function initBindsOn(element) {
        $(element).find('[data-bind-read]').addBack('[data-bind-read]').each(function (i, e) {
            initReadBind(e);
        });
        $(element).find('[data-bind-write]').addBack('[data-bind-write]').each(function (i, e) {
            initWriteBind(e);
        });
    }

    /**
     * Bind everything.
     */
    function initAllBinds() {
        initBindsOn(document);
    }


    return {
        'init': initAllBinds,
        'initTextBind': initReadBind,
        'initWriteBind': initReadBind,
        'initBindsOn': initBindsOn,
        'addReadBind': addReadBind,
        'addWriteBind': addWriteBind
    };
})();