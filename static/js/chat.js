'use strict';
/*global bundle*/


var chat = (function () {

    /**
     * Initialize the chat system.
     */
    function init() {
        // add handler to update
        updates.addUpdateHandler('message', function (data) {
            receiveMessage(data)
        });
        // bind dom
        $('.chat-input').each(function () {
            bindInput(this);
        });
    }

    /**
     * Bind an input/textarea element to submit when hitting enter.
     * @param element
     */
    function bindInput(element) {
        $(element).keypress(function (event) {
            if (event.which == 13 && !event.shiftKey) {
                var recipients = ($(this).data('recipients') || '').split(':').map(function (x) {
                    return parseInt(x);
                });
                var sender = parseInt(($(this).data('sender') || 0));
                sendMessage($(this).val(), recipients, sender);
                $(this).val('');

                // stop from actually inserting a new line
                event.preventDefault();
                return false;
            }
        });
    }

    /**
     * Send a message.
     * @param {string} content
     * @param {Array<number>} recipients
     * @param {number} sender
     */
    function sendMessage(content, recipients, sender) {
        var url = bundle['chat_url'];
        var requestData = {
            'recipients[]': recipients,
            'sender': sender,
            'content': content
        };
        console.log("Sending Message:", requestData);
        $.post(url, requestData, function (responseData) {
            updates.processResponseData(responseData);
            console.log(responseData);
        });
    }

    /**
     * Display a message.
     * @param {Object} message
     */
    function receiveMessage(message) {
        console.log('message received', message.sender, message.content);
        $('.chat-messages').each(function () {
            $(this)
                .append(makeMessageElement(message))
                .scrollTop($(this).prop('scrollHeight')); //always scroll to bottom
        });
    }

    /**
     * Create a dom element for a message.
     * @param {Object} message
     */
    function makeMessageElement(message) {
        // This is some interesting indentation for the chaining. There might be a better way to format this.
        var sender = message.sender; // TODO: Get character name
        return $('<div>', {
            'class': 'message'
        }).append($('<span>', {
                'class': 'sender',
                'text': sender
            }).css('color', util.stringToColor(sender))
        ).append(" : ")
            .append($('<span>', {
                'class': 'content',
                'text': message.content
            }));
    }

    return {
        'init': init,
        'bindInput': bindInput,
        'sendMessage': sendMessage,
        'receiveMessage': receiveMessage
    };
})();