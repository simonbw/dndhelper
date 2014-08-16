var updates = (function () {
    if (window.bundle === undefined) {
        window.bundle = {};
    }
    const pollWait = 3000;

    /**
     * Retrieve updates from the server.
     */
    function addUpdateHandler(handler) {
        var source = new EventSource(bundle['update_stream_url']);
        source.onmessage = function (event) {
            console.log("Update: " + event.data);
            handler(event.data['update']);
        };
        console.log("Added Update Handler");
    }

    /**
     *
     * @param handler
     */
    function pollUpdates(handler) {
        $.get(bundle['fetch_updates_url'], {}, handler);
        setTimeout(function () {
            pollUpdates();
        }, pollWait);
    }

    return {
        'addUpdateHandler': addUpdateHandler
    };
})();