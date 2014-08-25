'use strict';
/*global bundle*/

window.binds = (function () {

    /**
     * @param {Element} element
     * @returns {Character}
     */
    function getBoundCharacter(element) {
        return characters.fromId(parseInt($(element).closest('[data-character-id]').data('character-id')));
    }

    /**
     * Maps namespace to handler.
     * @type {Object.<string, function(Element, string)>}
     */
    var textBinds = {};

    textBinds['character'] = function (element, attribute) {
        getBoundCharacter(element).addHandler(attribute, function (value) {
            $(element).text(value);
        });
    };

    textBinds['item'] = function (element, attribute) {
        var itemTypeId = $(element).closest('[data-item-type-id]').data('item-type-id');
        items.addHandler(itemTypeId, function (item) {
            $(element).text(item[attribute]);
        });
    };

    /**
     * Maps namespace to handler.
     * @type {Object.<string, function(Element, string)>}
     */
    var writeValueBinds = {};

    writeValueBinds['character'] = function (element, attribute) {
        getBoundCharacter(element).saveAttribute(attribute, $(element).val());
    };

    /**
     * Maps namespace to handler.
     * @type {Object.<string, function(Element, string)>}
     */
    var writeTextBinds = {};

    writeTextBinds['character'] = function (element, attribute) {
        getBoundCharacter(element).saveAttribute(attribute, $(element).text());
    };


    /**
     * Initialize a text bind for this element. Must have the data-bind-text property set.
     * @param {Element|jQuery} element
     */
    function initTextBind(element) {
        var full = $(element).data("bind-text").split('.');
        var namespace = full[0];
        var attribute = full[1];
        if (textBinds.hasOwnProperty(namespace)) {
            textBinds[namespace](element, attribute);
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
        console.log('binding write');
        var full = $(element).data("bind-write").split('.');
        var namespace = full[0];
        var attribute = full[1];
        if (element.contentEditable == "true") {
            $(element).on('input', function () {
                var editTime = Date.now();
                $(element).data('last-edit', editTime);
                setTimeout(function () {
                    if ($(element).data('last-edit') == editTime) {
                        if (writeTextBinds.hasOwnProperty(namespace)) {
                            writeTextBinds[namespace](element, attribute);
                        } else {
                            throw new Error('Unknown namespace: ' + namespace);
                        }
                    }
                }, 500);
            });
        } else {
            $(element).on('change', function () {
                if (writeValueBinds.hasOwnProperty(namespace)) {
                    writeValueBinds[namespace](element, attribute);
                } else {
                    throw new Error('Unknown namespace: ' + namespace);
                }
            });
        }
    }

    /**
     * Binds everything in this element.
     * @param {Element} element
     */
    function initBindsOn(element) {
        $(element).find('[data-bind-text]').each(function (i, e) {
            initTextBind(e);
        });
        $(element).find('[data-bind-write]').each(function (i, e) {
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
        'initTextBind': initTextBind,
        'initWriteBind': initTextBind,
        'initBindsOn': initBindsOn
    };
})();