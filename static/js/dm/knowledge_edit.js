'use strict';

window.dm = window.dm || {};
window.dm.knowledge = (function () {

    /**
     * Init the listeners on the control elements.
     */
    function init() {
        $('#knowledge-list').on('click', 'li', function () {
            selectKnowledge($(this).attr('data-knowledge-id'));
        });

        $('#knowledge-control').find('button').click(function () {
            models.Knowledge.makeNew();
        });

        // add everything that already exists
        models.Knowledge.all.forEach(processNewKnowledge);
        // add all new stuff that comes up
        models.Knowledge.addNewHandler(processNewKnowledge)
    }

    /**
     * Put new knowledge on the list.
     * @param knowledge
     */
    function processNewKnowledge(knowledge) {
        $('#knowledge-list').append(makeDiv(knowledge));
    }

    /**
     * Make the li element for the list.
     * @param {models.Knowledge} knowledge
     * @returns {*|jQuery}
     */
    function makeDiv(knowledge) {
        var $li = $('<li>')
            .addClass('knowledge')
            .attr('data-knowledge-id', knowledge['id'])
            .attr('data-bind-read', 'knowledge.name')
            .text(knowledge['name'] || 'loading');
        binds.initBindsOn($li);
        return  $li;
    }

    /**
     *
     * @param knowledgeId
     */
    function selectKnowledge(knowledgeId) {
        var $knowledge = $('#current-knowledge')
            .empty()
            .attr('data-knowledge-id', knowledgeId)
            .append($('<h2>')
                .addClass('name')
                .attr('data-bind-write', 'knowledge.name')
                .text(models.Knowledge.isLoaded(knowledgeId) ? models.Knowledge.get(knowledgeId)['name'] : 'loading...'))
            .append($('<div>')
                .addClass('content')
                .attr('data-bind-write', 'knowledge.content')
                .text(models.Knowledge.isLoaded(knowledgeId) ? models.Knowledge.get(knowledgeId)['content'] : 'loading...'));
        binds.initBindsOn($knowledge);
        models.Knowledge.loadOne(knowledgeId, function (data) {
            $knowledge.find('.name').text(data['name']).prop('contentEditable', true);
            $knowledge.find('.content').text(data['content']).prop('contentEditable', true);
        });
    }


    return {
        'init': init
    };
})();