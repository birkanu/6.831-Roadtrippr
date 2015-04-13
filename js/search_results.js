$(document).ready(function() {

    // Populate dummy search results
    var search_result_source = $("#search_results").html();
    var search_result_template = Handlebars.compile(search_result_source);
    var search_result_context = {
        trips: []
    }

    for (var i = 0; i < road_trips.length; i++) {
        cur_trip_json = road_trips[i];
        trip = {
            full_route_id: "full_route_"+i,
            abbr_route_id: "abbr_route_"+i,
            trip_name: cur_trip_json.trip_name,
            planned_abbr_route: [cur_trip_json.start_location].concat(cur_trip_json.stops[0]).concat("...").concat([cur_trip_json.end_location]),
            planned_full_route: [cur_trip_json.start_location].concat(cur_trip_json.stops).concat([cur_trip_json.end_location]),
            start_date: cur_trip_json.start_date,
            end_date: cur_trip_json.end_date,
            duration: cur_trip_json.duration,
            num_companions: cur_trip_json.num_companions,
            map_img_src: "http://dishaan.scripts.mit.edu/map-" + i + ".png",
            map_alt_text: "Route map from " + cur_trip_json.start_location + " to " + cur_trip_json.end_location,
        }
        search_result_context.trips.push(trip);
    }

    var search_result_source_processed = search_result_template(search_result_context);
    $("#search_results").html(search_result_source_processed);

    // Add hover on abbreviated planned route for each route
    for (var j = 0; j < search_result_context.trips.length; j++) {
        var full_route_div = $("#full_route_"+j);
        var abbr_route_div = $("#abbr_route_"+j);
        full_route_div.offset({left: full_route_div.offset().left, top: abbr_route_div.offset().top});
        abbr_route_div.hover(function(e) {
            var full_route_div_id = this.id.replace("abbr", "full");
            $("#"+full_route_div_id).css("visibility", "visible");
        }, function(e) {
            var full_route_div_id = this.id.replace("abbr", "full");
            $("#"+full_route_div_id).css("visibility", "hidden");            
        });        
    }


});