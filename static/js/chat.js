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

        $('.chat-box').each(function () {
            initChatBox(this);
        });
    }

    /**
     * Init everything on a specific chat box.
     * @param container
     */
    function initChatBox(container) {
        console.log('initializing chat box');
        $(container).on('click', '.recipient', function (event) {
            var recipientId = parseInt($(this).attr('data-character-id'));
            var recipient = characters.fromId(recipientId);
            if (event.shiftKey) {
                addRecipient(container, recipient);
            } else {
                setRecipients(container, [recipient]);
            }
        });
    }

    /**
     * Bind an input/textarea element to submit when hitting enter.
     * @param element
     */
    function bindInput(element) {
        $(element).keypress(function (event) {
            if (event.which == 13 && !event.shiftKey) {
                var recipients = JSON.parse($(this).attr('data-recipients'));
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
        var senderName = (message.sender > 0) ? characters.fromId(message.sender).get('name') : 'DM';
        // This is some interesting indentation for the chaining. There might be a better way to format this.
        return $('<div>', {
            'class': 'message'
        })
            .append($(
                '<span>', {
                    'class': 'sender',
                    'text': senderName
                }).css('color', util.stringToColor(senderName)))
            .append(" : ")
            .append($(
                '<span>', {
                    'class': 'content',
                    'text': message.content
                }));
    }

    /**
     * Update the display on a container to
     * @param container
     * @param recipients
     */
    function setRecipients(container, recipients) {
        var recipientsJson = JSON.stringify(recipients.map(function (character) {
            return character.get('id');
        }));
        $(container).find('.chat-input').addBack('.chat-input').attr('data-recipients', recipientsJson).focus();

        var recipientList = $(container).find('.recipient-list');
        recipientList.find('.recipient').removeClass('active');
        recipients.forEach(function (character) {
            var selector = '.recipient[data-character-id="' + character.get('id') + '"]';
            recipientList.find(selector).addClass('active');
        });
    }

    /**
     * Get the recipients a chat box contains.
     * @param container
     * @returns {Array.<Character>}
     */
    function getRecipients(container) {
        var jsonString = $(container).find('.chat-input').addBack('.chat-input').attr('data-recipients');
        var recipientIds = JSON.parse(jsonString);
        return recipientIds.map(function (a) {
            return characters.fromId(a);
        });
    }

    /**
     * Add a single recipient to the list of recipients for a container.
     * @param container
     * @param recipient
     */
    function addRecipient(container, recipient) {
        var recipients = getRecipients(container);
        recipients.push(recipient);
        setRecipients(container, recipients);
    }

    /**
     * Remove a single recipient from the list of recipients for a container.
     * @param container
     * @param recipient
     */
    function removeRecipient(container, recipient) {
        var recipients = getRecipients(container);
        for (var i = 0; i < recipients.length; i++) {
            if (recipients[i].get('id') == recipient.get('id')) {
                recipients.splice(i, 1);
                break;
            }
        }
        setRecipients(container, recipients);
    }


    return {
        'init': init,
        'initChatBox': initChatBox,
        'bindInput': bindInput,
        'sendMessage': sendMessage,
        'receiveMessage': receiveMessage,
        'setRecipients': setRecipients,
        'addRecipient': addRecipient,
        'removeRecipient': removeRecipient
    };
})();
