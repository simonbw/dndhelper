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

    /**
     * Bind inputs to save data.
     */
    function initBinds() {
        $('[data-bind-read]').each(function () {

        });

        $('[data-bind-write]').on('change', function () {
            character.saveAttribute($(this).data('bind-write'), $(this).val());
        });

        // content
        $('[data-bind-write][contenteditable=true]').on('input', function () {
            var $this = $(this);
            var editTime = Date.now();
            $this.data('last-edit', editTime);
            setTimeout(function () {
                if ($this.data('last-edit') == editTime) {
                    character.saveAttribute($this.data('bind-write'), $this.text());
                }
            }, 500);
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
