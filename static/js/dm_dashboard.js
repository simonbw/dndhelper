(function () {
    if (window.bundle === undefined) {
        window.bundle = {};
    }
    var characters = bundle['characters'].map(function (character) {
        return new Character(character);
    });
})();