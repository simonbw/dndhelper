(function () {
    if (window.bundle === undefined) {
        window.bundle = {};
    }
    var editingEnabled;
    var character = new Character(bundle['character_data']);

    var abilityNames = bundle['abilities'].map(function (ability) {
        return ability.name;
    });
    var skillNames = bundle['skills'].map(function (skill) {
        return skill.name;
    });

    function updateHealthBar() {
        var health = character.get('hitpoints');
        var maxHealth = character.get('max_hitpoints');
        var percentHealth = Math.floor(health * 100 / maxHealth);
        $('.health').css('width', '' + percentHealth + '%');
    }

    /**
     *
     * @param attribute
     */
    function addSimpleIdHandler(attribute) {
        var tag_id = attribute.replace('_', '-');
        character.addHandler(attribute, function (value) {
            $('#' + tag_id).text(value);
        });
    }

    /**
     * Create a function that updates an attribute
     * @param attribute
     * @returns {Function}
     */
    function updateAttribute(attribute) {
        return function (value) {
            console.log("SETTING: " + attribute + " = " + value);
            var data = {};
            data[attribute] = value;
            $.getJSON(bundle['update_url'], data, handleResponse);
        }
    }

    /**
     * Allow attributes to be edited.
     */
    function enableEdit() {
        console.log('enabled editing');
        editingEnabled = true;
        $('#enable-edit').hide();
        $('#disable-edit').show();
    }

    /**
     * Don't allow attributes to be edited.
     */
    function disableEdit() {
        console.log('disabled editing');
        editingEnabled = false;
        $('#enable-edit').show();
        $('#disable-edit').hide();
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
                });

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


    /**
     * Make all the things editable
     */
    function initEditListeners() {
        $('#enable-edit').click(enableEdit);
        $('#disable-edit').click(disableEdit);

        $('#backstory').click(editWithContenteditable(updateAttribute('backstory')));
        $('#personality').click(editWithContenteditable(updateAttribute('personality')));
        $('#name').click(editWithContenteditable(updateAttribute('name')));
        $('#max-hit-points').click(editWithNumber(updateAttribute('max_hitpoints')));

        $('#strength').click(editWithNumber(updateAttribute('strength')));
        $('#dexterity').click(editWithNumber(updateAttribute('dexterity')));
        $('#constitution').click(editWithNumber(updateAttribute('constitution')));
        $('#intelligence').click(editWithNumber(updateAttribute('strength')));
        $('#wisdom').click(editWithNumber(updateAttribute('wisdom')));
        $('#charisma').click(editWithNumber(updateAttribute('charisma')));
    }

    /**
     *
     */
    function initTabListeners() {
        $('.tab-button').click(function () {
            $('.tab-button').removeClass('open');
            $('.tab').removeClass('open');
            $(this).addClass('open');
            var tabName = $(this).data('tab');
            $('#' + tabName + '-tab').addClass('open');
        });
    }


    // called onload
    $(function () {
        disableEdit();

        initEditListeners();

        initTabListeners();

        updateHealthBar();

        // simple update handlers on skills and abilities
        skillNames.concat(abilityNames).forEach(addSimpleIdHandler);

        updates.addUpdateHandler('attribute', function (update) {
            character.applyUpdate(update);
        });
        updates.addUpdateHandler('message', function (update) {
            chat.recieveMessage(update['sender'], update['content']);
        });
        updates.addUpdateHandler('redirect', function (update) {
            if (update['location'] != window.location.pathname) {
                console.log('redirecting from ' + window.location.pathname + ' to: ' + update['location']);
                window.location.replace(update['location']);
            }
        });
    });
})();
