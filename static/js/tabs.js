'use strict';

window.tabs = (function () {
    var enabled = true;

    /**
     * Allow the tabs to function as expected.
     */
    function enable() {
        enabled = true;
        $('.tab-button').removeClass('disabled');
    }

    /**
     * Disable tabs.
     */
    function disable() {
        $('.tab-button').addClass('disabled');
        enabled = false;
    }

    /**
     * @returns {boolean} true if tabs enabled
     */
    function isEnabled() {
        return enabled;
    }

    /**
     * Initialize the tab buttons.
     */
    function initTabListeners() {
        $('.tab-button').click(function () {
            openTab($(this).data('tab'));
        });
    }

    /**
     * Open the tab with the name and close all others.
     * @param tabName
     */
    function openTab(tabName) {
        if (enabled) {
            $('.tab-button.open').removeClass('open');
            $('.tab.open').removeClass('open');
            $('.tab-button[data-tab=' + tabName + ']').addClass('open');
            $('#' + tabName + '-tab').addClass('open');
        }
    }

    // should this happen automatically?
    $(function () {
        initTabListeners();
        enable();
    });

    return {
        'initTabListeners': initTabListeners,
        'openTab': openTab,
        'enable': enable,
        'disable': disable,
        'isEnabled': isEnabled
    };
})();

