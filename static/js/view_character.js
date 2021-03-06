'use strict';
/*global bundle*/

(function () {

    var character;

    /**
     * Update the healthbar to
     */
    function updateHealthBar() {
        var health = character.get('hitpoints');
        var maxHealth = character.get('max_hitpoints');
        var percentHealth = Math.floor(health * 100 / maxHealth);
        $('.health').css('width', '' + percentHealth + '%');
    }

    /**
     * Handle updates.
     */
    function initUpdateHandlers() {
        // update healthbar when health changes
        character.addHandler('hitpoints', updateHealthBar);
        character.addHandler('max_hitpoints', updateHealthBar);

        updates.addUpdateHandler('redirect', function (update) {
            if (update['location'] != window.location.pathname) {
                console.log('redirecting from ' + window.location.pathname + ' to: ' + update['location']);
                window.location.replace(update['location']);
            }
        });
    }

    /**
     * Initialize the chat system.
     */
    function initChat() {
        chat.setSender(character);
        chat.addRecipient('DM');
    }


    // called onload
    $(function () {
        characters.init(true);
        character = characters.all[0];
        binds.init();

        // this happens automatically right now. Should it?
        // tabs.initTabListeners();

        updateHealthBar();
        initUpdateHandlers();
        initChat();
        updates.openUpdateStream();
    });
})();
