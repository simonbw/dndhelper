'use strict';

(function () {

    /**
     * Bind the content tab buttons to display content.
     */
    function initContentTabs() {
        $('[data-main-content-id]').click(function () {
            if ($(this).hasClass('active')) {
                selectNone();
            } else {
                selectMainContent($(this).data('main-content-id'));
                $(this).addClass('active');
            }
        });
    }

    function selectMainContent(contentId) {
        $('.active').removeClass('active');
        $('#' + contentId).addClass('active');
    }

    function selectNone() {
        $('.active').removeClass('active');
        $('#no-main-content').addClass('active');
    }

    $(function () {
        characters.init(true);
        roller.init();
        chat.setSender('DM');
        chat.setRecipients(characters.all);
        initContentTabs();
        characterInfo.init();
        binds.init();
        updates.openUpdateStream();
        selectNone();
    });
})();