'use strict'
/*global bundle*/

window.Chat = (function () {
    function Chat($input) {
        this.$input = $input;
        this.sender = null;
    }

    Chat.prototype.setSender = function (sender) {
        this.sender = sender;
    };


    return Chat;
})();


var chat = (function () {
    var recipients = [];
    var sender = '';

    function enable() {
        $('#chat-pane').slideDown();
    }

    function disable() {
        $('#chat-pane').slideUp();
    }

    /**
     * Given a character or a character's name, return the character's name.
     * @param {Character|String|string} character
     * @returns {string}
     */
    function characterName(character) {
        if (character instanceof String) {
            return character;
        } else if (character instanceof Character) {
            return String(character.get('name'));
        } else if (typeof character == "string") {
            return character;
        }
        throw new Error('Not a character: ' + character);
    }

    /**
     * Add a recipient to the list of recipients.
     * @param {Character|String|string} recipient
     */
    function addRecipient(recipient) {
        recipient = characterName(recipient);
        if (recipients.indexOf(recipient) < 0) {
            recipients.push(recipient);
        }
    }

    /**
     * Remove a list from the list of recipients.
     * @param {Character|String|string} recipient
     */
    function removeRecipient(recipient) {
        recipient = characterName(recipient);
        var i = recipients.indexOf(recipient);
        if (i >= 0) {
            recipients.splice(i, 1);
        }
    }

    /**
     * Set the sender of the messages.
     * @param {Character|String|string} s
     */
    function setSender(s) {
        sender = characterName(s);
    }

    /**
     * @returns {string} - the sender
     */
    function getSender() {
        return sender;
    }

    /**
     * @returns {Array} - the recipients
     */
    function getRecipients() {
        return recipients;
    }

    /**
     * Set the list of recipients;
     * @param {Array.<string>} r
     */
    function setRecipients(r) {
        recipients.length = 0; // sketchy way to clear an array
        r.forEach(function (recipient) {
            addRecipient(recipient);
        });
    }

    /**
     * Send a message.
     * @param {string} content
     * @param {Array<Character|String|string>} recipients
     * @param {Character|String|string} sender
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
     * Add a message.
     * @param {Character|String|string} sender
     * @param {string} content
     */
    function receiveMessage(sender, content) {
        console.log('message recieved', sender, content);

        var $li = $('<div>', {
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
        var $messages = $('.chat-messages');
        $messages.append($li);

        $messages.scrollTop($messages.prop('scrollHeight')); //always scroll to bottom
    }

    /**
     * Hash a string to a hex color string.
     * @param {string} str
     * @returns {string}
     */
    function stringToColor(str) {
        // str to hash
        for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
        // int/hash to hex
        for (var j = 0, color = "#"; j < 3; color += ("00" + ((hash >> j++ * 8) & 0xFF).toString(16)).slice(-2));

        return color;
    }

    
    $(function () {
        $('.chat-box textarea').keypress(function (event) {
            if (event.which == 13 && !event.shiftKey) {
                sendMessage($(this).val(), getRecipients(), getSender());
                $(this).val('');
                event.preventDefault();
                return false;
            }
        });
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
        'getSender': getSender,
        'enable': enable,
        'disable': disable
    };
})
();