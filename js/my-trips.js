$(document).ready(function() {

    // Get search params to populate inline form
    var search_parameters = JSON.parse(localStorage.getItem('searched_trip'));
    $('#search-start-location').val(search_parameters.start_location.formatted_address);
    $('#search-end-location').val(search_parameters.end_location.formatted_address);
    $('#search-start-date').val(moment(search_parameters.start_date).format("MMMM DD, YYYY"));
    $('#search-end-date').val(moment(search_parameters.end_date).format("MMMM DD, YYYY"));
    $('#flexible-dates-checkbox').prop('checked', search_parameters.are_dates_flexible);

    // Populate dummy search results
    var search_result_source = $("#search_results").html();
    var search_result_template = Handlebars.compile(search_result_source);
    var search_result_context = {
        trips: []
    }

    var trip_dict = {};

    for (var i = 0; i < road_trips.length; i++) {
        cur_trip_json = road_trips[i];
        cur_user = users[i];
        trip = {
            trip_id: "trip_" +i,
            full_route_id: "full_route_"+i,
            abbr_route_id: "abbr_route_"+i,
            trip_name: cur_trip_json.trip_name,
            planned_abbr_route: [cur_trip_json.start_location].concat(cur_trip_json.stops[0]).concat("...").concat([cur_trip_json.end_location]),
            planned_full_route: [cur_trip_json.start_location].concat(cur_trip_json.stops).concat([cur_trip_json.end_location]),
            start_date: cur_trip_json.start_date,
            end_date: cur_trip_json.end_date,
            duration: cur_trip_json.duration,
            num_companions: cur_trip_json.num_companions,
            are_dates_flexible: cur_trip_json.are_dates_flexible,
            map_img_src: "http://dishaan.scripts.mit.edu/map-" + i + ".png",
            creator_img_src: "http://dishaan.scripts.mit.edu/creator-" + i + ".png",
            creator_id: cur_user.index,
            creator_name: cur_user.first_name,
            creator_age: cur_user.age,
            creator_location:  cur_user.city,
            notes: cur_trip_json.notes,
            map_alt_text: "Route map from " + cur_trip_json.start_location + " to " + cur_trip_json.end_location,
        }
        search_result_context.trips.push(trip);
        trip_dict["trip_"+i] = trip;
    }

    var search_result_source_processed = search_result_template(search_result_context);
    $("#search_results").html(search_result_source_processed);

    // TODO(Tony): Fix behavior when trip is clicked. Create a trip object as necessary to interface with Birkan's edit trip screen
    for (var t = 0; t < road_trips.length; t++) {
        $("#trip_"+t).click(function(e) {
            var clicked_trip = trip_dict[this.id];
            localStorage.setItem('trip', JSON.stringify(clicked_trip));
            this.href = "trip-details.html";
            document.location.href = "trip-details.html";            
        });
    }

    // Add hover on abbreviated planned route for each route
    for (var j = 0; j < search_result_context.trips.length; j++) {
        var full_route_div = $("#full_route_"+j);
        var abbr_route_div = $("#abbr_route_"+j);
        full_route_div.offset({left: full_route_div.offset().left, top: abbr_route_div.offset().top});
        full_route_div.toggle();
        abbr_route_div.mouseenter(function(e) {
            e.preventDefault();
            e.stopPropagation();
            var full_route_div_id = this.id.replace("abbr", "full");
            $("#"+full_route_div_id).fadeIn(500);
        });
        full_route_div.mouseleave(function(e) {
            e.preventDefault();
            e.stopPropagation();
            var full_route_div_id = this.id.replace("abbr", "full");
            $("#"+full_route_div_id).fadeOut(500);            
        });        
    }


});