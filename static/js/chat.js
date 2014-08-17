var chat = (function () {
    var recipients = [];
    var sender = '';

    $(function () {
        $('#chat-input').keydown(function (event) {
            if ($('#chat-input').val().length > 0 && event.which == 13) {
                sendMessage($(this).val(), getRecipients(), getSender());
                $(this).val('');
            }
        });
    });

    /**
     * Given a character or a character's name, return the character's name.
     * @param character
     * @returns {string}
     */
    function characterName(character) {
        if (character instanceof String) {
            return String(character);
        } else if (character instanceof Character) {
            return String(character.get('name'));
        } else if (typeof character == "string") {
            return character
        }
        throw new Error('Not a character: ' + character);
    }

    /**
     * Add a recipient to the list of recipients.
     * @param recipient
     */
    function addRecipient(recipient) {
        if (recipient instanceof Character) {
            recipient = recipient.get('name');
        }
        if (recipients.indexOf(recipient) < 0) {
            recipients.push(recipient);
        }
    }

    /**
     * Remove a list from the list of recipients.
     * @param recipient
     */
    function removeRecipient(recipient) {
        if (recipient instanceof Character) {
            recipient = recipient.get('name');
        }
        var i = recipients.indexOf(recipient);
        if (i >= 0) {
            recipients.splice(i, 1);
        }
    }

    /**
     * Set the sender of the messages.
     * @param s
     */
    function setSender(s) {
        if (s instanceof Character) {
            s = s.get('name');
            console.log('sender:', s);
        }
        sender = s;
        console.log("New Sender:", sender);
    }

    function getSender() {
        return sender;
    }

    function getRecipients() {
        return recipients;
    }

    /**
     * Set the list of recipients;
     * @param r
     */
    function setRecipients(r) {
        recipients.length = 0; // sketchy way to clear an array
        r.forEach(function (recipient) {
            addRecipient(recipient);
        });
        console.log('recipients:', recipients);
    }

    /**
     * Send a message.
     * @param content
     * @param recipients
     * @param sender
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
        });
    }

    /**
     * Add a message.
     * @param sender
     * @param content
     */
    function receiveMessage(sender, content) {
        console.log('message recieved', sender, content);

        const $li = $('<div>', {
            'class': 'message'
        });
        var $sender = $('<span>', {
            'class': 'sender',
            'text': sender
        });
        $sender.css('color', stringToColor(sender));
        $li.append($sender);
        $li.append(" : ");
        $li.append($('<span>', {
            'class': 'content',
            'text': content
        }));
        var $messages = $('#chat-messages');
        $messages.append($li);

        $messages.scrollTop($messages.prop('scrollHeight')); //always scroll to bottom
    }

    /**
     * Hash
     * @param name
     */
    function stringToColor(str) {
        // str to hash
        for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
        // int/hash to hex
        for (var i = 0, color = "#"; i < 3; color += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));

        return color;
    }

    $(function () {
        updates.addUpdateHandler('message', function (data) {
            receiveMessage(data.sender, data.content)
        });
    });

    // public methods
    return {
        'receiveMessage': receiveMessage,
        'addRecipient': addRecipient,
        'removeRecipient': removeRecipient,
        'setRecipients': setRecipients,
        'setSender': setSender,
        'getSender': getSender
    };
})
();