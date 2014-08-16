const updatePeriod = 3000;

/**
 * Retrieve updates from the server.
 */
function getUpdates(handleResponse) {
    $.get(bundle['url_get_updates'], {}, handleResponse);
    setTimeout(getUpdates, updatePeriod);
}