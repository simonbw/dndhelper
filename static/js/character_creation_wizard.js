'use strict';
/*global bundle*/

(function () {
    /**
     * @type {Character}
     */
    var character;

    /** Time when the last request was sent. */
    var lastResponse = 0;
    /** Time when the last response was recieved. */
    var lastRequest = 0;

    /**
     * Save a single attribute.
     * @param attribute
     * @param value
     */
    function saveAttribute(attribute, value) {
        var data = {};
        data[attribute] = value;
        saveData(data);
    }


    /**
     * Add callbacks to the wizard.
     */
    function initWizardCallbacks() {
        wizard.addPhaseCallback(function (phase) {
            character.saveAttribute('creation_phase', phase);
            var $nameInput = $('#name-input');
            if (phase == 'name') {
                $nameInput.focus();
                $nameInput.select();
            } else {
                $nameInput.blur();
            }
        });
        wizard.addDoneCallback(function () {
            character.saveAttribute('creation_phase', 'done', function (responseData) {
                if (responseData.success) {
                    window.location.href = character['view_url'];
                } else {
                    alert(responseData);
                }
            });
        });
    }

    /**
     * Bind inputs to save data.
     */
    function initBinds() {
        // TODO: Read binds
        $('[data-bind-write]').on('change', function () {
            character.saveAttribute($(this).data('bind-write'), $(this).val());
        });
    }

    $(function () {
        character = new Character(bundle['character']);
        character.bindUpdates();
        initWizardCallbacks();
        initBinds();
        wizard.init();
    });
})();
