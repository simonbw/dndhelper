'use strict';
/*global bundle*/

(function () {
    /** @type {Character} */
    var character;

    /**
     * Add callbacks to the wizard.
     */
    function initWizardCallbacks() {
        wizard.addPhaseCallback(function (phase) {
            character.saveAttribute('creation_phase', phase);
        });
        wizard.addDoneCallback(function () {
            character.saveAttribute('creation_phase', 'done', function (responseData) {
                if (responseData.success) {
                    window.location.href = character.get('view_url');
                } else {
                    alert(responseData);
                }
            });
        });
    }


    $(function () {
        characters.init(true);
        character = characters.all[0];
        initWizardCallbacks();
        binds.init();
        updates.openUpdateStream();
        wizard.init();
    });
})();
