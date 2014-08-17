'use strict';

var updates = (function () {
    if (window.bundle === undefined) {
        window.bundle = {};
    }
    var pollWait = 3000;
    var handlers = {};
    var updates_url = bundle['update_stream_url'];

    if (window.EventSource === undefined || true) {
        updates_url = bundle['fetch_updates_url'];

        /**
         * A replacement for EventSource that uses polling instead of Server Sent Events.
         * @param url
         * @constructor
         */
        window.EventSource = function (url) {
            var self = this;

            function poll() {
                var data = $.get(bundle['fetch_updates_url'], {}, function () {
                    var event = {};
                    event.data = data;
                    if (self.onmessage) {
                        self.onmessage(event);
                    }
                    setTimeout(poll, pollWait);
                });
            }
        };
    }

    /**
     * Bind a function to a certain type of update.
     * @param type
     * @param handler
     */
    function addUpdateHandler(type, handler) {
        if (!('type' in handlers)) {
            handlers[type] = [];
        }
        handlers[type].push(handler);
    }

    /**
     * Open the stream for listening to events, or poll for events if not supported.
     * @param type
     * @param handler
     */
    function openUpdateStream(type, handler) {

        var source = new EventSource(updates_url);
        source.onmessage = function (event) {
            if (event.data['success']) {
                if ('updates' in event.data) {
                    for (var i = 0; i < event.data['updates'].length; i++) {
                        var update = event.data['updates'][i];
                        if ('type' in update) {
                            handlers[event.data['type']]();
                        } else {
                            console.log('Invalid Update: ', update);
                        }
                    }
                }
            } else {
                console.log(event.data);
            }
        };
        console.log("Stream Opened");
    }

    return {
        'addUpdateHandler': addUpdateHandler
    };
})();