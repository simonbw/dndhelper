'use strict';

window.util = window.util || {};

/**
 * Returns true if the letters in search are found in subject in the same order.
 * @param {string} search
 * @param {string} subject
 * @returns {boolean}
 */
window.util.fuzzyMatch = function (search, subject) {
    search = search.toLowerCase();
    subject = subject.toLowerCase();
    var i = 0;
    var j = 0;
    while (i < subject.length && j < search.length) {
        if (subject[i] == search[j]) {
            j++;
        }
        i++;
    }
    return j == search.length;
};


/**
 * Hash a string to a hex color string.
 * @param {string} str
 * @param {number} [salt]
 * @returns {string}
 */
window.util.stringToColor = function (str, salt) {
    // str to hash
    var i = 0;
    var hash = salt || 0;
    while (i < str.length) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        i++;
    }
    // int/hash to hex
    i = 0;
    var color = '#';
    while (i < 3) {
        color += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2);
    }
    return color;
};