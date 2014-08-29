'use strict';

if (window.renderers === undefined) {
    window.renderers = {};
}

window.renderers.Inventory = (function () {

    /** @type {Object.<number, Element|jQuery>} - map item id's to their inventory element. */
    var itemMap = {};

    /**
     * @param {object} item
     * @returns {jQuery}
     */
    function makeItem(item) {
        var $div = $('<div>')
            .addClass('item')
            .attr('data-item-type-id', item['item_type']);
        var $name = $('<h5>').
            text('loading...')
            .attr('data-bind-text', 'item.name');
        $div.append($name);
        var $quantity = $('<p>').
            text(item['quantity']);
        $div.append($quantity);
        binds.initBindsOn($div);
        models.items.loadOne(item['item_type']);
        itemMap[item['id']] = $div;
        return  $div;
    }

    /**
     * Make an element into an inventory for a character.
     */
    return function (character, $container) {
        character.addHandler('set_item', function (item) {
            if (itemMap.hasOwnProperty(item['id'])) {
                var $item = itemMap[item['id']]; // update this
                $item.replaceWith(makeItem(item));
            }
            else {
                $container.append(makeItem(item));
            }
        });

        $container.empty();
        character.get('inventory').forEach(function (item) {
            $container.append(makeItem(item));
        });
    };
})();