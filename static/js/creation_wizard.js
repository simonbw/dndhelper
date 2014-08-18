var creationWizard = (function () {

    function Tip(title, content, offset) {
        var $div = $('<div>', {
            'class': 'creation-tip wizard-stuff'
        });
        var $closeButton = $('<div>', {
            'text': 'X',
            'class': 'close-button'
        });
        $div.append($closeButton);
        $div.append($('<h1>', {
            'text': title
        }));
        $div.append($('<div>', {
            'text': content
        }));
        $(document.body).append($div);
        $div.offset(offset);

        this.close = function () {
            $div.fadeOut(50, function () {
                $(this).remove();
            });
        };
        $closeButton.click(this.close);
    }

    function start() {
        $('section').hide();
        chat.disable();
        tabs.disable();
        tabs.openTab('stats');
        $('section.abilities').fadeIn();

        editAbilities();
    }

    function editAbilities() {
        new Tip('Abilities', 'The first thing you should do is ', {top: 20, left: 20});


    }

    function saveAbilities() {

    }

    function end() {
        $('section').show();
        chat.enable();
        tabs.enable();

        $('.wizard-stuff').remove();
    }

    return {
        'start': start,
        'end': end,
        'Tip': Tip
    };
})();