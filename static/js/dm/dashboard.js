'use strict';

(function () {
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

        dashboard.init('dm');

        updates.openUpdateStream();
    });
})();