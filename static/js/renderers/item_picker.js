'use strict';

window.renderers = window.renderers || {};

window.renderers.ItemTypePicker = (function () {

    /**
     * @param {Function} onChange
     * @constructor
     */
    var ItemTypePicker = function (onChange) {
        console.log('creating new ItemTypePicker');
        var self = this;
        var $overlay = $('<div>')
            .addClass('modal-overlay');
        this.container = $('<div>')
            .addClass('item-type-picker')
            .attr('id', 'item-picker');
        $overlay.append(this.container);
        var $controlBox = $('<div>')
            .addClass('items-control');
        var $itemTypeList = $('<div>')
            .addClass('items-list');
        $controlBox.append($itemTypeList);
        var itemTypeList = new renderers.ItemTypeList($itemTypeList);
        itemTypeList.onChange = self.selectItemType.bind(this);

        var $buttonBox = $('<div>')
            .addClass('button-box');

        var $quantity = $('<input>')
            .attr('type', 'number')
            .addClass('quantity')
            .val(1);
        $buttonBox.append($quantity);

        var $giveItemButton = $('<button>')
            .text('Give');
        $giveItemButton.click(function () {
            if (onChange) {
                onChange(itemTypeList.value, $quantity.val());
            }
            $overlay.remove();
        });
        $buttonBox.append($giveItemButton);

        var $cancelButton = $('<button>')
            .text('Cancel');
        $cancelButton.click(function () {
            $overlay.remove();
        });
        $buttonBox.append($cancelButton);

        $controlBox.append($buttonBox);
        this.container.append($controlBox);

        var $content = $('<div>')
            .addClass('item-type-info');

        this.container.append($content);

        this.selectItemType(itemTypeList.value);
        $(document.body).prepend($overlay);
    };

    /**
     *
     */
    ItemTypePicker.prototype.selectItemType = function (itemTypeId) {
        console.log('selecting item type', itemTypeId);
        var $itemTypeInfo = this.container.find('.item-type-info')
            .empty()
            .attr('data-item-type-id', itemTypeId)
            .append($('<h2>')
                .addClass('name')
                .attr('data-bind-write', 'item-type.name')
                .text(models.ItemType.isLoaded(itemTypeId) ? models.ItemType.get(itemTypeId)['name'] : 'loading...'))
            .append($('<div>')
                .addClass('content')
                .attr('data-bind-write', 'item-type.description')
                .text(models.ItemType.isLoaded(itemTypeId) ? models.ItemType.get(itemTypeId)['description'] : 'loading...'));
        binds.initBindsOn($itemTypeInfo);
        models.ItemType.loadOne(itemTypeId, function (data) {
            $itemTypeInfo.find('.name').text(data['name']);
            $itemTypeInfo.find('.content').text(data['content']);
        });
    };

    return ItemTypePicker;
})();