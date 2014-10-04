'use strict';
/*global bundle*/

window.dashboard = (function () {

    /**
     * Prefix used for local storage stuff.
     * @type {string}
     */
    var localStoragePrefix = 'default';

    /**
     * Init all the dashboard stuff.
     */
    function initAll(prefix) {
        localStoragePrefix = prefix || localStoragePrefix;
        initContentTabs();
    }

    /**
     * Bind the content tab buttons to display content.
     */
    function initContentTabs() {
        $('[data-main-content-id]').click(function () {
            if ($(this).hasClass('active')) {
                selectNone();
            } else {
                selectMainContent($(this).attr('data-main-content-id'));
            }
        });
        selectMainContent(getStoredTab());
    }

    /**
     * Select the main content by id.
     * @param contentId
     */
    function selectMainContent(contentId) {
        if (contentId) {
            setStoredTab(contentId);
            $('.active').removeClass('active');
            $('#' + contentId).addClass('active');
            $('[data-main-content-id=' + contentId + ']').addClass('active');
        } else {
            selectNone();
        }
    }

    /**
     * Deselect main content and show "nothing selected" message.
     */
    function selectNone() {
        removeStoredTab();
        $('.active').removeClass('active');
        $('#no-main-content').addClass('active');
    }

    /**
     * @returns {string} - They key used to store and retrieve the last tab.
     */
    function getStorageTabIdKey() {
        return 'dashboard.' + localStoragePrefix + '.main-content-id';
    }

    /**
     * Return the id of the last selected content tab.
     * @returns {number}
     */
    function getStoredTab() {
        return localStorage.getItem('dashboard.' + localStoragePrefix + '.main-content-id');
    }

    /**
     * Set the id of the last selected content tab.
     * @param {number} tabId - id of the last selected content tab
     */
    function setStoredTab(tabId) {
        localStorage.setItem('dashboard.' + localStoragePrefix + '.main-content-id', tabId);
    }

    /**
     * Return the id of the last selected content tab.
     * @returns {number}
     */
    function removeStoredTab() {
        localStorage.removeItem(getStorageTabIdKey());
    }


    return {
        'init': initAll
    };
})();