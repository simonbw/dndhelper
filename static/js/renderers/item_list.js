'use strict';

window.renderers = window.renderers || {};

window.renderers.ItemTypeList = (function () {

    /**
     * Create a jquery element for an itemType.
     * @param itemType
     * @returns {jQuery}
     */
    function makeLi(itemType) {
        var $li = $('<li>')
            .text(itemType.name)
            .attr('data-item-type-id', itemType.id)
            .attr('data-bind-read', 'item-type.name');
        binds.initBindsOn($li);
        return $li;
    }

    /**
     * @param {Element|jQuery} container
     * @param {Function} onChange
     * @constructor
     */
    var ItemList = function (container, onChange) {
        var self = this;
        this.onChange = onChange;
        this.container = $(container);
        this.list = $('<ul>');
        this.searchInput = $('<input>')
            .attr('type', 'text');
        this.container
            .append(this.searchInput)
            .append(this.list)
            .on('click', 'li', function () {
                self.selectItem(this);
            });
        this.searchInput.on('input', function () {
            var searchString = $(this).val();
            self.filterBy(searchString);
        });

        // add everything that already exists
        models.ItemType.all.forEach(function (item) {
            self.addItem(item);
        });
        // add all new stuff that comes up
        models.ItemType.addNewHandler(function (item) {
            self.addItem(item);
        });
    };

    /**
     * Select an item.
     * @param li
     */
    ItemList.prototype.selectItem = function (li) {
        this.list.find('li.selected').removeClass('selected');
        var itemTypeId = parseInt($(li).attr('data-item-type-id'));
        this.value = itemTypeId;
        if (this.onChange) {
            this.onChange(itemTypeId);
        }
        $(li).addClass('selected');
    };

    /**
     * Add an item to the list.
     * @param item
     */
    ItemList.prototype.addItem = function (item) {
        var shouldSelect = this.list.is(':empty');
        var $li = makeLi(item);
        $(this.list).append($li);
        if (shouldSelect) {
            this.selectItem($li);
        }
    };

    /**
     * Show only filtered results.
     * @param searchString
     */
    ItemList.prototype.filterBy = function (searchString) {
        $(this.list).find('>li').each(function () {
            var subject = $(this).text();
            if (util.fuzzyMatch(searchString, subject)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    };

    return ItemList;
})();