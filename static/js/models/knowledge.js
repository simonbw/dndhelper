'use strict';
/*global bundle*/

if (window.models === undefined) {
    window.models = {};
}

window.models.knowledge = models.SimpleModel('Knowledge', bundle['fetch_knowledge_url']);

// make sure all bundled knowledges are processed
if (bundle.hasOwnProperty('knowledge')) {
    bundle['knowledge'].forEach(models.knowledge.process);
}