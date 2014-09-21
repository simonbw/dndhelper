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
                selectMainContent($(this).attr('data-main-content-id'));
            }
        });
        selectMainContent(localStorage.getItem('dm.main-content-id'));
    }

    /**
     * Select the main content by id.
     * @param contentId
     */
    function selectMainContent(contentId) {
        if (contentId) {
            localStorage.setItem('dm.main-content-id', contentId);
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
        localStorage.removeItem('dm.main-content-id');
        $('.active').removeClass('active');
        $('#no-main-content').addClass('active');
    }


    // main
    $(function () {
        characters.init(true);

        binds.init();

        models.ItemType.init();
        models.Knowledge.init();

        dm.roller.init();
        dm.knowledge.init();
        dm.itemType.init();

        dm.characterInfo.init();

        chat.init();

        updates.openUpdateStream();

        initContentTabs();
    });
})();