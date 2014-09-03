'use strict';
/*global bundle*/

window.dm = window.dm || {};

window.dm.roller = (function () {

    /**
     * Roll a d20.
     * @param {number} [advantage] - if > 0, best of 2 rolls. if < 0, worst of 2 rolls
     * @returns {number}
     */
    function d20(advantage) {
        if (advantage > 0) {
            return Math.max(d20(), d20());
        } else if (advantage < 0) {
            return Math.min(d20(), d20());
        }
        return Math.ceil(Math.random() * 20);
    }

    var modifiers = {};
    modifiers['skill'] = function (character, stat) {
        var ability = stat[1];
        var skill = stat[2];
        return modifiers['ability'](character, stat) + character.get(skill);
    };

    modifiers['ability'] = function (character, stat) {
        var ability = stat[1];
        return Math.floor((character.get(ability) - 10) / 2);
    };

    modifiers['Initiative'] = function (character, stat) {
        return modifiers['ability'](character, ['', 'Dexterity']); // TODO: this should be changed to the actual initiative stat
    };

    /**
     * Initialize the roller.
     */
    function init() {
        var $roller = $('#roller');
        $roller.find('select').on('change', function () {
            $roller.find('.results').empty();
        });
        $roller.find('button').click(function () {
            var stat = $roller.find('select').val().split('.');
            var getModifier = modifiers[stat[0]];

            $roller.find('.results').empty();
            var results = characters.all.map(function (character) {
                return {
                    'modifier': getModifier(character, stat),
                    'roll': d20(),
                    'character': character
                };
            });
            // sort
            results.sort(function (a, b) {
                if (a.roll == 20 || b.roll == 20 || a.roll == 1 || b.roll == 1) {
                    if (a.roll != b.roll) {
                        return b.roll - a.roll;
                    }
                }
                return (b.roll + b.modifier) - (a.roll + a.modifier);
            });
            results.forEach(function (result) {
                var roll = result.roll;
                var modifier = result.modifier;
                var $td = $('<td>', {
                    'text': roll + modifier
                });
                var $tr = $('<tr>').append($('<td>', {
                    'text': result.character.get('name')
                })).append($td);
                $td.append($('<small>', {
                    'text': '(' + roll + '+' + modifier + ')'
                }));
                if (roll == 20) {
                    $td.addClass('twenty');
                } else if (roll == 1) {
                    $td.addClass('one');
                }
                $roller.find('.results').append($tr);
            });
        });
    }


    return {
        'init': init
    };
})();