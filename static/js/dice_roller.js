
$(function() {
    $('.dice-roller').each(
        function (roller) {
            $('button', roller).click(
                function (ev) {
                    var count = parseInt($('input', roller).val());
                    var d = parseInt($('select', roller).val());
                    var sum = 0;
                    for (var i = 0; i < count; i++) {
                        sum += Math.floor(Math.random() * d) + 1;
                    }
                    $('span', roller).text('' + sum);
                }
            );
        }
    );
});

