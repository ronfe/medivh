/**
 * Created by ronfe on 15-9-1.
 */
// All the request of cluster pages must has i=false query
$(function (){
    var query = window.location.search;
    if (query.length === 0) {
        window.location.search = '?isolate=false';
    }
    else if (query.match(/isolate/) === null) {
        window.location.search = window.location.search + '&isolate=false';
    }
});