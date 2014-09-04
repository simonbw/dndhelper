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