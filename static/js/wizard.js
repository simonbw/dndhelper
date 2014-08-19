window.wizard = (function () {
    var currentPhase;
    var phases = bundle['wizard_phases'];

    $(function () {
        initButtons();
        initChoosers();
        setPhase(bundle['wizard_current_phase']);
    });

    /**
     * Make all the chooser things do what they should.
     */
    function initChoosers() {
        $('.wizard-chooser').each(function () {
            $(this).find(' > .choices > .choice').click(function () {
                $(this).siblings('.chosen').removeClass('chosen');
                $(this).addClass('chosen');
                var $descriptionBox = $(this).parents('.wizard-chooser').find('.choice-descriptions');
                $descriptionBox.find('.choice-description.chosen').removeClass('chosen');
                var $chosen = $descriptionBox.find('.choice-description[data-choice=' + $(this).data('choice') + ']');
                $chosen.addClass('chosen');
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

        console.log('setting phase:', phase);
        currentPhase = phase;
        $('.wizard-phase.current').hide().removeClass('current');
        var $current = $('.wizard-phase[data-phase=' + currentPhase + ']');
        $current.show();
        $current.addClass('current');
        $('.wizard-phase-button.current').removeClass('current');
        $('.wizard-phase-button[data-phase=' + currentPhase + ']').addClass('current');
    }

    return {
        'setPhase': setPhase,
        'phases': phases
    };
})();