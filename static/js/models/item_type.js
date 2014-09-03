'use strict';
/*global bundle*/

window.models = window.models || {};

window.models.ItemType = models.createSimpleModel('item-type', bundle['fetch_item_url'], bundle['save_item_url'], bundle['item-types']);