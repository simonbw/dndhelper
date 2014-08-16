/**
 *
 * @constructor
 */
function ChatBox() {
    $('#chatbox').keydown(function (event) {
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
}