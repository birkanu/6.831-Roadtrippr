$(document).ready(function() {
    var search_result_source = $("#search_results").html();
    var search_result_template = Handlebars.compile(search_result_source);
    var search_result_context = {
        trips: []
    }

    for (var i = 0; i < road_trips.length; i++) {
        cur_trip_json = road_trips[i];
        trip = {
            trip_name: cur_trip_json.trip_name,
            planned_route: [cur_trip_json.start_location].concat(cur_trip_json.stops[0]).concat("...").concat([cur_trip_json.end_location]),
            start_date: cur_trip_json.start_date,
            end_date: cur_trip_json.end_date,
            duration: cur_trip_json.duration,
            num_companions: cur_trip_json.num_companions,
        }
        search_result_context.trips.push(trip);
    }

    var search_result_source_processed = search_result_template(search_result_context);
    $("#search_results").html(search_result_source_processed);
});