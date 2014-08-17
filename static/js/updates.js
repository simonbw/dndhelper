'use strict';

var updates = (function () {
    if (window.bundle === undefined) {
        window.bundle = {};
    }
    var pollWait = 3000;
    var handlers = {};
    var updates_url = bundle['stream_updates_url'];

    if (window.EventSource === undefined || true) {
        console.log("Using polling fallback");

        updates_url = bundle['fetch_updates_url'];

        /**
         * A replacement for EventSource that uses polling instead of Server Sent Events.
         * @param url
         * @constructor
         */
        window.EventSource = function (url) {
            var self = this;

            function poll() {
                $.get(url, {}, function (data) {
                    var event = {};
                    event.data = data;
                    if (self.onmessage) {
                        self.onmessage(event);
                    }
                    setTimeout(poll, pollWait);
                });
            }

            poll();
        };
    }

    /**
     * Bind a function to a certain type of update.
     * @param type
     * @param handler
     */
    function addUpdateHandler(type, handler) {
        console.log('Added update handler for ' + type);
        if (!('type' in handlers)) {
            handlers[type] = [];
        }
        handlers[type].push(handler);
    }

    /**
     * Open the stream for listening to events, or poll for events if not supported.
     */
    function openUpdateStream() {
        var source = new EventSource(updates_url);
        source.onmessage = function (response) {
            processResponseData(response.data)
        };
        console.log("Stream Opened:", updates_url);
    }

    /**
     * Process a response.
     * @param data
     */
    function processResponseData(data) {
        if (data['success']) {
            if ('updates' in data) {
                var updateList = data['updates'];
                for (var i = 0; i < updateList.length; i++) {
                    var update = updateList[i];
                    console.log("update:", update);
                    if ('type' in update) {
                        var type = update['type'];
                        if (type in handlers) {
                            var handlerList = handlers[type];
                            for (var j = 0; j < handlerList.length; j++) {
                                handlerList[j](update);
                            }
                        } else {
                            console.log('No handlers for', type);
                            console.log(handlers);
                        }
                    } else {
                        console.log('Invalid Update: ', update);
                    }
                }
            }
        } else {
            console.log(data);
        }
    }

    return {
        'addUpdateHandler': addUpdateHandler,
        'openUpdateStream': openUpdateStream,
        'processResponseData': processResponseData
    };
})();