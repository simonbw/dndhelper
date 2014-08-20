'use strict';
/*global bundle*/

(function () {
    var character = bundle['character'];

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
     * Save data.
     * @param data
     */
    function saveData(data, callback) {
        console.log('saving data:', data);
        $.getJSON(character['update_url'], data, callback);
    }

    /**
     * Add callbacks to the wizard.
     */
    function initWizardCallbacks() {
        wizard.addPhaseCallback(function (phase) {
            saveData({'creation_phase': phase});
            if (phase == 'name') {
                console.log('name phase');
                $('#name-input').focus();
            } else {
                $('#name-input').blur();
            }
        });
        wizard.addDoneCallback(function () {
            saveData({'creation_phase': 'done'}, function (responseData) {
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
        $('#name-input').on('change', function () {
            saveAttribute('name', $(this).val());
        });
        $('#race-chooser').find('.choice').on('chosen', function () {
            saveAttribute('race', $(this).data('choice'));
        });
        $('#class-chooser').find('.choice').on('chosen', function () {
            saveAttribute('class', $(this).data('choice'));
        });
    }

    $(function () {
        initWizardCallbacks();
        initBinds();
        wizard.init();
    });
})();
