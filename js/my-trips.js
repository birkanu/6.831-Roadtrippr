/* Source: https://css-tricks.com/snippets/javascript/get-url-variables/ */
function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
         var pair = vars[i].split("=");
         if(pair[0] == variable){return pair[1];}
 }
 return(false);
}

$(document).ready(function() {
    var shared_new_trip = getQueryVariable("shared-new-trip");
    var new_trip;
    if (shared_new_trip) {
        new_trip = localStorage.getItem("new_trip_details");
    }


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
    var road_trip_indices = localStorage.getItem('current_road_trip_indices').split(",");
    
    for (var i = 0; i < road_trip_indices.length; i++) {
        var idx = parseInt(road_trip_indices[i]);
        cur_trip_json = road_trips[idx];
        trip = {
            index: idx,
            trip_id: "trip_" +idx,
            full_route_id: "full_route_"+idx,
            abbr_route_id: "abbr_route_"+idx,
            trip_name: cur_trip_json.trip_name,
            planned_abbr_route: [cur_trip_json.start_location].concat(cur_trip_json.stops[0]).concat("...").concat([cur_trip_json.end_location]),
            planned_full_route: [cur_trip_json.start_location].concat(cur_trip_json.stops).concat([cur_trip_json.end_location]),
            start_date: cur_trip_json.start_date,
            end_date: cur_trip_json.end_date,
            duration: cur_trip_json.duration,
            num_companions: cur_trip_json.num_companions,
            are_dates_flexible: cur_trip_json.are_dates_flexible,
            map_img_src: "http://dishaan.scripts.mit.edu/map-" + idx + ".png",
            notes: cur_trip_json.notes,
            map_alt_text: "Route map from " + cur_trip_json.start_location + " to " + cur_trip_json.end_location,
        }
        search_result_context.trips.push(trip);
        trip_dict["trip_"+idx] = trip;
    }

    var search_result_source_processed = search_result_template(search_result_context);
    $("#search_results").html(search_result_source_processed);

    if (new_trip) {
        $(".trip-creation").show();
    }

    // TODO(Tony): Fix behavior when trip is clicked. Create a trip object as necessary to interface with Birkan's edit trip screen
    for (var t = 0; t < road_trip_indices.length; t++) {
        var idx = parseInt(road_trip_indices[t]);
        $("#trip_"+idx).click(function(e) {
            var clicked_trip = trip_dict[this.id];
            localStorage.setItem('trip', JSON.stringify(clicked_trip));
            this.href = "trip-details.html";
            document.location.href = "trip-details.html";            
        });
    }

    // Add hover on abbreviated planned route for each route
    for (var j = 0; j < search_result_context.trips.length; j++) {
        var idx = search_result_context.trips[j]["index"];
        var full_route_div = $("#full_route_"+idx);
        var abbr_route_div = $("#abbr_route_"+idx);
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