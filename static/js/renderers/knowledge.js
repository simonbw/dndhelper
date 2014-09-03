'use strict';

// TODO: Make an actual knowledge 'inventory'

window.renderers = window.renderers || {};

window.renderers.KnowledgeViewer = (function () {

    /** @type {Object.<number, Element|jQuery>} - map item id's to their inventory element. */
    var knowledgeMap = {};

    /**
     * @param {object} knowledge
     * @returns {jQuery}
     */
    function makeDiv(knowledge) {
        var $div = $('<div>')
            .addClass('knowledge')
            .attr('data-knowledge-id', knowledge['id']);
        var $name = $('<h5>').
            text('loading...')
            .attr('data-bind-read', 'knowledge.name');
        var $content = $('<div>').
            text('...')
            .attr('data-bind-read', 'knowledge.name');
        $div.append($name);
        $div.append($content);
        binds.initBindsOn($div);
        models.Knowledge.loadOne(knowledge['id']);
        knowledgeMap[knowledge['id']] = $div;
        return  $div;
    }

    /**
     * Make an element into an inventory for a character.
     */
    return function (character, $container) {
        character.addHandler('set_item', function (item) {
            if (knowledgeMap.hasOwnProperty(item['id'])) {
                var $item = knowledgeMap[item['id']]; // update this
                $item.replaceWith(makeDiv(item));
            }
            else {
                $container.append(makeDiv(item));
            }
        });

        $container.empty();
        character.get('inventory').forEach(function (item) {
            $container.append(makeDiv(item));
        });
    };
})();