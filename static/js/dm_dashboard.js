'use strict';
/*global bundle*/

(function () {

    /**
     *
     */
    function initDataBinds() {
        $('.give-item').each(function () {
            var $container = $(this);
            var characterId = $(this).data('character-id');

            $(this).find('button').click(function () {
                characters.fromId(characterId).saveAttribute('give_item', {
                    'item_type': $container.find('select').val(),
                    'quantity': $container.find('input[type="number"]').val()
                }, updates.processResponseData);
            });
        });
    }

    /**
     * Initialize all the actions of the party list.
     */
    function initParty() {
        $('.character').hide();
        $('h2').click(function () {
            $(this).next('section').slideToggle(100).toggleClass('closed');
            $(this).toggleClass('closed');
        });
        $('.party-member').click(function () {
            if (!$(this).hasClass('active')) {
                selectPartyMember($(this).data('character-id'));
            } else {
                deselectAllParty();
            }
        });
    }

    /**
     * Make the inventory for a character.
     * @param {Character} character
     */
    function makeInventory(character) {
        var $itemBox = $('#character-' + character.get('id')).find('.inventory .item-box');
        $itemBox.empty();
        character.get('inventory').forEach(function (item) {
            $itemBox.append(makeItem(item));
        });
        console.log(character.get('name'), character.get('inventory'));
    }

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
        binds.initBindsOn($div);
        items.loadOne(item['item_type']);
        return  $div;
    }

    /**
     *
     */
    function deselectAllParty() {
        localStorage.removeItem('dm-active-character-id');
        $('.party-member.active').removeClass('active');
        $('.character.active').removeClass('active');
        $('.character').hide();
    }

    /**
     * @param {number} characterId
     */
    function selectPartyMember(characterId) {
        localStorage.setItem('dm-active-character-id', characterId); // remember which character was selected
        var $partyMember = $('#party-member-' + characterId);
        if (!$partyMember.hasClass('active')) {
            $('.party-member.active').removeClass('active');
            $partyMember.addClass('active');
            $('.character').hide();
            $('#character-' + characterId).show();
        }
    }


    /**
     * Create the items in all the characters inventories and add listeners for their change.
     */
    function initInventories() {
        characters.all.forEach(function (character) {
            makeInventory(character);
            character.addHandler('set_item', function () {
                makeInventory(character);
            });
        });
    }


    $(function () {
        characters.init(true);
        chat.setSender('DM');
        chat.setRecipients(characters.all);
        initDataBinds();
        initParty();
        binds.init();
        initInventories();

        var lastCharacterId = localStorage.getItem('dm-active-character-id');
        if (characters.exists(lastCharacterId)) {
            selectPartyMember(lastCharacterId);
        }
        updates.openUpdateStream();
    });
})();