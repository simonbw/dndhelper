function dm_dashboard_init(bundle) {
    var characters = bundle['characters'].map(function (character) {
        return new Character(character);
    });
}