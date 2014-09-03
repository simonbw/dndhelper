'use strict';

window.dm = window.dm || {};
window.dm.characterInfo = (function () {

    /**
     * Initialize everything in the character info views.
     */
    function init() {
        initSections();
        initInventories();
    }

    /**
     * Initialize the section collapsing.
     */
    function initSections() {
        $('h2').click(function () {
            $(this).next('section').slideToggle(100).toggleClass('closed');
            $(this).toggleClass('closed');
        });
    }

    /**
     * Create the ItemType in all the characters inventories and add listeners for their change.
     */
    function initInventories() {
        $('.give-item').each(function () {
            var $container = $(this);
            var characterId = $(this).attr('data-character-id');

            $(this).find('button').click(function () {
                characters.fromId(characterId).saveAttribute('give_item', {
                    'item_type': $container.find('select').val(),
                    'quantity': parseInt($container.find('input[type="number"]').val())
                });
            });
        });

        characters.all.forEach(function (character) {
            var $itemBox = $('#character-' + character.get('id')).find('.inventory .item-box');
            renderers.Inventory(character, $itemBox);
        });
    }

    return {
        'init': init
    }
})();