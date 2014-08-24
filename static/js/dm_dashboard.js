'use strict';
/*global bundle*/

(function () {
    var characters = bundle['characters'].map(function (character) {
        return new Character(character);
    });

    /**
     *
     * @type {Object.<number, Character>}
     */
    var characterIdMap = {};

    characters.forEach(function (character) {
        characterIdMap[character.get('id')] = character;
    });

    function initDataBinds() {
        characters.forEach(function (character) {
            character.bindUpdates();
        });

        $('.character, .party-member').each(function () {
            var characterId = $(this).data('character-id');
            var character = characterIdMap[characterId];
            $(this).find('[data-bind-text]').each(function () {
                var self = this;
                character.addHandler($(self).data("bind-text"), function (value) {
                    $(self).text(value);
                });
            });
        });
    }

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

    function deselectAllParty() {
        localStorage.removeItem('dm-active-character-id');
        $('.party-member.active').removeClass('active');
        $('.character.active').removeClass('active');
        $('.character').hide();
    }

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

    $(function () {
        initParty();
        chat.setSender('DM');
        chat.setRecipients(characters);
        initDataBinds();
        updates.openUpdateStream();

        var lastCharacterId = localStorage.getItem('dm-active-character-id');
        if (lastCharacterId in characterIdMap) {
            selectPartyMember(lastCharacterId);
        }
    });
})();