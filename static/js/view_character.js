function view_character_init(bundle) {
    const updatePeriod = 3000;
    var editingEnabled;

    /**
     * Process the response data and update stuff.
     * @param data
     */
    function handleResponse(data) {
        if (data.success) {
            const updates = data['updates'];
            for (var i = 0; i < updates.length; i++) {
                const update = updates[i];
                console.log(update);
                switch (update['type']) {
                    case 'redirect':
                        console.log('redirecting to: ' + update['location']);
                        window.location.replace(update['location']);
                        break;
                    case 'message':
                        addMessage(update['sender'], update['content']);
                        break;
                }
            }
        }
        else {
            console.log(data);
        }
    }

    function addMessage(sender, content) {
        const $li = $('<li>', {
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
        $('#messages').prepend($li);
    }

    /**
     * Retrieve updates from the server.
     */
    function getUpdates() {
        $.get(bundle['url_get_updates'], {}, handleResponse);
        setTimeout(getUpdates, updatePeriod);
    }

    /**
     * Create a function that updates an attribute
     * @param attribute
     * @returns {Function}
     */
    function updateAttribute(attribute) {
        return function (value) {
            console.log(attribute + " : " + value);
            var data = {};
            data[attribute] = value;
            $.getJSON(bundle['url_update'], data, handleResponse);
        }
    }

    /**
     * Allow attributes to be edited.
     */
    function enableEdit() {
        editingEnabled = true;
        $('#enableedit').hide();
        $('#disableedit').show();
    }

    /**
     * Don't allow attributes to be edited.
     */
    function disableEdit() {
        editingEnabled = false;
        $('#enableedit').show();
        $('#disableedit').hide();
    }

    /**
     * Make the element editable when clicked.
     * @param callback
     * @returns {Function}
     */
    function editWithContenteditable(callback) {
        return function () {
            if (editingEnabled) {
                var $this = $(this);
                $this[0].contentEditable = true;
                $this.focus();
                $this.keydown(function (event) {
                    if (event.which == 13 && !event.shiftKey) {
                        event.preventDefault();
                        $this.focusout();
                    }
                })

                $this.focusout(function () {
                    $this.off('keydown');
                    $this.off('focusout');
                    $this[0].contentEditable = false;
                    callback($this.html());
                });
            }
        }
    }

    /**
     * Return a function to make a thing editable with an input
     * @param callback
     * @returns {Function}
     */
    function editWithNumber(callback) {
        function f() {
            if (editingEnabled) {
                var $input = $('<input>', {
                    'type': 'number'
                });
                var $old = $(this);
                $old.replaceWith($input);
                $input.val($old.text());
                $input.focus();
                $input.focusout(function () {
                    $input.replaceWith($old);
                    callback($input.val());
                });
                $old.click(f);
            }
        }

        return f;
    }

    $(function () {
        disableEdit();

        $('#enableedit').click(enableEdit);
        $('#disableedit').click(disableEdit);

        $('#backstory').click(editWithContenteditable(updateAttribute('backstory')));
        $('#personality').click(editWithContenteditable(updateAttribute('personality')));
        $('#name').click(editWithContenteditable(updateAttribute('name')));
        $('#maxhitpoints').click(editWithNumber(updateAttribute('max_hitpoints')));

        $('#strength').click(editWithNumber(updateAttribute('strength')));
        $('#dexterity').click(editWithNumber(updateAttribute('dexterity')));
        $('#constitution').click(editWithNumber(updateAttribute('constitution')));
        $('#intelligence').click(editWithNumber(updateAttribute('strength')));
        $('#wisdom').click(editWithNumber(updateAttribute('wisdom')));
        $('#charisma').click(editWithNumber(updateAttribute('charisma')));

        getUpdates();
    });
}