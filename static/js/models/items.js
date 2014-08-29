'use strict';
/*global bundle*/

if (window.models === undefined) {
    window.models = {};
}

window.models.items = models.SimpleModel('Item', bundle['fetch_item_url']);

// make sure all bundled items are processed
if (bundle.hasOwnProperty('items')) {
    bundle['items'].forEach(models.items.process);
}