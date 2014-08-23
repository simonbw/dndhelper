'use strict';
/*global bundle*/

(function () {
    var character = new Character(bundle['character']);

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
        $('[data-bind-text]').each(function () {
            var self = this;
            character.addHandler($(this).data("bind-read"), function (value) {
                self.text(value);
            });
        });
        $('[data-bind-value]').each(function () {
            var self = this;
            character.addHandler($(this).data("bind-read"), function (value) {
                self.val(value);
            });
        });

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
        updates.openUpdateStream();

        character.bindUpdates();

        // this happens automatically right now. Should it?
        // tabs.initTabListeners();

        updateHealthBar();

        initUpdateHandlers();

        initChat();
    });
})();
