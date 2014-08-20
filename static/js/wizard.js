'use strict';
/*global bundle*/

window.wizard = (function () {
    var currentPhase;
    var phases = bundle['wizard_phases'];
    var phaseCallbacks = [];
    var doneCallbacks = [];

    /**
     * Initialize the wizard.
     */
    function init() {
        initChoosers();
        initButtons();
        setPhase(bundle['wizard_current_phase']);
    }

    /**
     * Make all the chooser things do what they should.
     */
    function initChoosers() {
        $('.wizard-chooser').each(function () {
            $(this).find(' > .choices > .choice').click(function () {
                if (!($(this)).hasClass('chosen')) {
                    $(this).siblings('.chosen').removeClass('chosen');
                    $(this).addClass('chosen');
                    $(this).trigger('chosen');
                    var $descriptionBox = $(this).parents('.wizard-chooser').find('.choice-descriptions');
                    var $chosen = $descriptionBox.find('.choice-description[data-choice=' + $(this).data('choice') + ']');
                    $descriptionBox.find('.choice-description.chosen').removeClass('chosen');
                    $chosen.addClass('chosen');
                }
            });
        });
    }

    /**
     * Make all the buttons do what they should.
     */
    function initButtons() {
        $('#wizard-next-button').click(nextPhase);
        $('#wizard-previous-button').click(previousPhase);
        $('.wizard-phase').hide();
        $('.wizard-phase-button').click(function () {
            setPhase($(this).data('phase'));
        });
        $('#wizard-done-button').click(function () {
            doneCallbacks.every(function (callback) {
                return callback() !== false;
            });
        });
    }

    /**
     * Move to the next phase.
     */
    function nextPhase() {
        var index = phases.indexOf(currentPhase);
        if (index < phases.length - 1) {
            setPhase(phases[index + 1]);
        }
    }

    /**
     * Go back to the last phase.
     */
    function previousPhase() {
        var index = phases.indexOf(currentPhase);
        if (index > 0) {
            setPhase(phases[index - 1]);
        }
    }

    /**
     * Go to a specific phase.
     * @param phase
     */
    function setPhase(phase) {
        if (phase == phases[phases.length - 1]) {
            $('#wizard-next-button').hide();
            $('#wizard-done-button').show();
        } else {
            $('#wizard-next-button').show();
            $('#wizard-done-button').hide();
        }

        if (phase == phases[0]) {
            $('#wizard-previous-button').hide();
        } else {
            $('#wizard-previous-button').show();
        }

        currentPhase = phase;
        $('.wizard-phase.current').hide().removeClass('current');
        var $current = $('.wizard-phase[data-phase=' + currentPhase + ']');
        $current.show();
        $current.addClass('current');
        $('.wizard-phase-button.current').removeClass('current');
        $('.wizard-phase-button[data-phase=' + currentPhase + ']').addClass('current');

        phaseCallbacks.forEach(function (callback) {
            return callback(phase) !== false;
        });
    }

    /**
     * Add a function to be called when the phase changes.
     */
    function addPhaseCallback(callback) {
        phaseCallbacks.push(callback);
    }

    /**
     * Add a function to be called when the done button is clicked.
     */
    function addDoneCallback(callback) {
        doneCallbacks.push(callback);
    }

    return {
        'phases': phases,
        'setPhase': setPhase,
        'addPhaseCallback': addPhaseCallback,
        'addDoneCallback': addDoneCallback,
        'init': init,
    };
})();