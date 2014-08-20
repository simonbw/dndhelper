'use strict';
/*global bundle*/

(function () {
    var characters = bundle['characters'].map(function (character) {
        return new Character(character);
    });

    function updateHealthBars() {
        for (var i = 0; i < characters.length; i++) {
            var health = characters[i].get('hitpoints');
            var maxHealth = characters[i].get('max_hitpoints');
            var percentHealth = Math.floor(health * 100 / maxHealth);
            $('#character-' + characters[i].get('id')).find('.health').css('width', '' + percentHealth + '%');
        }
    }

    $(function () {
        updateHealthBars();
        chat.setSender('DM');
        chat.setRecipients(characters);
    });
})();