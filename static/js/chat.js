var chat = (function () {
    $(function () {
        $('#chat-input').keydown(function (event) {
            if ($('#chatbox').val().length > 0 && event.which == 13) {
                var url = bundle['chat_url'];
                var data = {
                    'to': characters.map(function (character) {
                        return character.name;
                    }),
                    'content': $(this).val()
                };
                $.post(url, data, function (response) {
                    console.log(response);
                });
                $(this).val('');
            }
        });
    });

    function recieveMessage(sender, content) {
        const $li = $('<div>', {
            'class': 'message'
        });
        $li.append($('<span>', {
            'class': 'sender',
            'text': sender
        }));
        $li.append(" : ");
        $li.append($('<span>', {
            'class': 'content',
            'text': content
        }));
        $('#chat-messages').prepend($li);
    }

    return {
        'recieveMessage': recieveMessage
    };
})();