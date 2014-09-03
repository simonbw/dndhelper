'use strict';
/*global bundle*/

window.models = window.models || {};

window.models.Knowledge = models.createSimpleModel('knowledge', bundle['fetch_knowledge_url'], bundle['save_knowledge_url'], bundle['knowledge']);