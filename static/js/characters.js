'use strict';
/*global bundle*/

window.characters = (function () {

    /** @type {Array.<Character>} */
    var characters = [];

    /** @type {Object.<number, Character>} */
    var characterIdMap = {};

    /**
     * Initialize the character stuff.
     * @param {boolean} [bind] - whether or not to bind them to updates.
     */
    function init(bind) {
        bundle['characters'].forEach(function (characterData) {
            var character = new Character(characterData);
            characters.push(character);
            characterIdMap[character.get('id')] = character;
            if (bind || bind === undefined) {
                character.bindUpdates()
            }
        });
    }

    /**
     * @param {number} id
     * @returns {Character}
     */
    function fromId(id) {
        if (!exists(id)) {
            throw new Error('character id: ' + id + ' does not exist');
        }
        return characterIdMap[id];
    }

    /**
     * Returns true if a character with this id exists.
     * @param {number} id
     * @returns {boolean}
     */
    function exists(id) {
        return characterIdMap.hasOwnProperty(id);
    }


    return {
        get all() {
            return characters;
        },
        'fromId': fromId,
        'exists': exists,
        'init': init
    };
})();