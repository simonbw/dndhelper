'use strict';

window.dm = window.dm || {};
window.dm.itemType = (function () {

    /**
     * Init the listeners on the control elements.
     */
    function init() {
        var $items = $('#items-box');
        $items.find('.items-control').find('button').click(function () {
            models.ItemType.makeNew();
        });

        new renderers.ItemTypeList($items.find('.items-list'), selectItemType);
    }

    /**
     * Put new knowledge on the list.
     * @param itemType
     */
    function processNewItem(itemType) {
        $('#items-list').append(makeDiv(itemType));
    }

    /**
     * Make the li element for the list.
     * @param {models.ItemType} itemType
     * @returns {*|jQuery}
     */
    function makeDiv(itemType) {
        var $li = $('<li>')
            .addClass('item-type')
            .attr('data-item-type-id', itemType['id'])
            .attr('data-bind-read', 'item-type.name')
            .text(itemType['name'] || 'loading');
        binds.initBindsOn($li);
        return  $li;
    }

    /**
     *
     * @param itemTypeId
     */
    function selectItemType(itemTypeId) {
        var $itemType = $('#current-item')
            .empty()
            .attr('data-item-type-id', itemTypeId)
            .append($('<h2>')
                .addClass('name')
                .attr('data-bind-write', 'item-type.name')
                .text(models.ItemType.isLoaded(itemTypeId) ? models.ItemType.get(itemTypeId)['name'] : 'loading...'))
            .append($('<div>')
                .addClass('content')
                .attr('data-bind-write', 'item-type.description')
                .text(models.ItemType.isLoaded(itemTypeId) ? models.ItemType.get(itemTypeId)['description'] : 'loading...'))
            .append($('<label>')
                .addClass());
        binds.initBindsOn($itemType);
        models.ItemType.loadOne(itemTypeId, function (data) {
            $itemType.find('.name').text(data['name']).prop('contentEditable', true);
            $itemType.find('.content').text(data['content']).prop('contentEditable', true);
        });
    }


    return {
        'init': init
    };
})();