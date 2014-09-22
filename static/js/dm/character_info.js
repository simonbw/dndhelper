'use strict';

window.dm = window.dm || {};
window.dm.characterInfo = (function () {

    /**
     * Initialize everything in the character info views.
     */
    function init() {
        initSections();
        initInventories();
        initActions();
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
     * Initialize the action buttons.
     */
    function initActions() {
        selectSubaction();
        $('.character').each(function () {
            var character = characters.fromId(parseInt($(this).attr('data-character-id')));
            $(this).find('.action-button.chat-button').click(function () {
                selectSubaction();
                chat.setRecipients($('.chat-box'), [character]);
            });
            $(this).find('.action-button.give-item-button').click(function () {
                selectSubaction();
                new renderers.ItemTypePicker(function (itemType, quantity) {
                    character.saveAttribute('give_item', {
                        'item_type': itemType,
                        'quantity': quantity
                    });
                });
            });
            $(this).find('.action-button.money-button').click(function () {
                selectSubaction('money');
            });
            $(this).find('.action-button.hit-points-button').click(function () {
                selectSubaction('hit-points');
            });

            $(this).find('.action-buttons.hit-points').on('click', '.action-button', function () {
                var hitpointString = $(this).attr('data-hit-points');
                var hp;
                if (hitpointString === 'max') {
                    hp = character.get('max_hitpoints');
                } else {
                    hp = character.get('hitpoints') + parseInt(hitpointString);
                }
                character.saveAttribute('hitpoints', hp);
            });
        });
    }

    /**
     * Select a specific set of actions.
     * @param subaction
     */
    function selectSubaction(subaction) {
        console.log('selecting', subaction);
        $('.action-buttons').hide();
        $('.action-buttons.main').show();
        if (subaction) {
            $('.action-buttons.' + subaction).show();
        }
    }

    /**
     * Create the ItemType in all the characters inventories and add listeners for their change.
     */
    function initInventories() {
        characters.all.forEach(function (character) {
            var $itemBox = $('#character-' + character.get('id')).find('.inventory .item-box');
            renderers.Inventory(character, $itemBox);
        });
    }

    return {
        'init': init
    }
})();