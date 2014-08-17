

(function() {
    function initTabListeners() {
        $('.tab-button').click(function () {
            $('.tab-button').removeClass('open');
            $('.tab').removeClass('open');
            $(this).addClass('open');
            var tabName = $(this).data('tab');
            $('#' + tabName + '-tab').addClass('open');
        });
    }

    $(function () {
        initTabListeners();
    });
})();

