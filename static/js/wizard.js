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
        initInputs();
        initControl();
        setPhase(bundle['wizard_current_phase']);
    }

    /**
     * Make all the chooser things do what they should.
     */
    function initChoosers() {
        var $choosers = $('.chooser');
        $choosers.each(function () {
            var self = this;
            self.setChosen = function (choice) {
                var $chosen;
                if (typeof s == 'string') {
                    $chosen = $(self).find('.choice[data-choice=' + choice + ']');
                } else {
                    $chosen = $(choice);
                    choice = $chosen.attr('data-choice');
                }
                if (!$chosen.hasClass('chose')) {
                    $(self).find('.chosen').removeClass('chosen');
                    $chosen.addClass('chosen');
                    $(self).val($chosen.attr('data-choice'));
                    $(self).trigger('input');
                    $(self).trigger('change');
                }
                $(self).find('.choice-description[data-choice=' + choice + ']').addClass('chosen');
            };

            self.chooseNext = function () {
                var chosen = $(self).find('.choice.chosen')[0];
                if (chosen) {
                    var next = $(chosen).next('.choice')[0];
                    if (next) {
                        self.setChosen(next);
                    }
                } else {
                    self.setChosen($(self.find('.choice')[0])); // default to the first choice
                }
            };

            self.choosePrevious = function () {
                var chosen = $(self).find('.choice.chosen')[0];
                if (chosen) {
                    var prev = $(chosen).prev('.choice')[0];
                    if (prev) {
                        self.setChosen(prev);
                    }
                } else {
                    self.setChosen($(self.find('.choice')[0])); // default to the first choice
                }
            };

            $(this).find('.choice').click(function () {
                if (!($(this)).hasClass('chosen')) {
                    self.setChosen(this);
                }
            });
        });

        $choosers.prop('tabIndex', -1); // can gain focus, but not from pressing tab
        $choosers.keydown(function (event) {
            if (event.which == 38) { // up
                this.choosePrevious();
            } else if (event.which == 40) { // up
                this.chooseNext();
            } else if (event.which == 13) {
                $(this).blur();
                return false;
            }
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
            setPhase($(this).attr('data-phase'));
        });
        $('#wizard-done-button').click(function () {
            doneCallbacks.every(function (callback) {
                return callback() !== false;
            });
        });
    }

    /**
     * Make the inputs do the right thing.
     */
    function initInputs() {
        $('#wizard-body').find('input[type="text"]').keydown(function (event) {
            if (event.which == 13) {
                event.preventDefault();
                $(this).blur();
            }
        });
    }

    /**
     *
     */
    function initControl() {
        // when nothing has focus, enter takes you to the next page
        $(document).keydown(function (event) {
            if (event.target == document || event.target == document.body || event.target == null) {
                if (event.which == 13) {
                    if (event.shiftKey) {
                        previousPhase();
                    } else {
                        nextPhase();
                    }
                } else if (event.which == 37) {
                    previousPhase();
                } else if (event.which == 39) {
                    nextPhase();
                }
            }
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
     * @param {string} phase
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

        $current.find('input, .chooser, textarea, [contenteditable=true]').first().focus(); // focus first input

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
        'init': init
    };
})();