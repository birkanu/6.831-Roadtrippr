$(document).ready(function() {

    // Populate dummy search results
    var search_result_source = $("#search_results").html();
    var search_result_template = Handlebars.compile(search_result_source);
    var search_result_context = {
        trips: []
    }

    for (var i = 0; i < road_trips.length; i++) {
        cur_trip_json = road_trips[i];
        cur_user = users[i];
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
            creator_img_src: "http://dishaan.scripts.mit.edu/creator-" + i + ".png",
            creator_name: cur_user.first_name,
            creator_age: cur_user.age,
            creator_location:  cur_user.city,
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

    // Add autocomplete to location text fields
    var autocomplete_start_location = new google.maps.places.Autocomplete(
        (document.getElementById('search-start-location')),
        { types: ['geocode'] }
    );
    var start_location;
    google.maps.event.addListener(autocomplete_start_location, 'place_changed', function() {
        // Get the place details from the autocomplete object.
        start_location = autocomplete_start_location.getPlace();
    });
    // Create the autocomplete object for end location, restricting the search to geographical location types.
    var autocomplete_end_location = new google.maps.places.Autocomplete(
        (document.getElementById('search-end-location')),
        { types: ['geocode'] }
    );
    var end_location;
    google.maps.event.addListener(autocomplete_end_location, 'place_changed', function() {
        // Get the place details from the autocomplete object.
        end_location = autocomplete_end_location.getPlace();
    });

    // Add a calendar for date fields
    $('#search-start-date').datetimepicker({
        locale: 'en',
        format: 'MMMM DD, YYYY'
    });
    $('#search-end-date').datetimepicker({
        locale: 'en',
        format: 'MMMM DD, YYYY'
    });

    // Link the date pickers 
    var start_date;
    $("#search-start-date").on("dp.change", function (e) {
        if (e.date) {
            start_date = e.date;
            $('#search-end-date').data("DateTimePicker").minDate(e.date);
        }
    });
    var end_date;
    $("#search-end-date").on("dp.change", function (e) {
        if (e.date) {
            end_date = e.date;
            $('#search-start-date').data("DateTimePicker").maxDate(e.date);
        }
    });    


});