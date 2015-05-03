function get_map_img_src(stops) {
    var map_img_src = "http://maps.googleapis.com/maps/api/staticmap?scale=1&size=275x140&maptype=roadmap&format=png&visual_refresh=true";
    var markers = "";
    for (var i = 0; i < stops.length; i++) {
        var stop = stops[i];
        var markerLocation = "&markers=size:mid%7Ccolor:red%7C" + stop.lat + "," + stop.lng;
        markers += markerLocation;
    }
    map_img_src += markers;
    return map_img_src;
}

var performSearch = function(ref, search_parameters, search_result_excludes) {
    var search_results = [];
    var trips_ref = ref.child("trips");
    moment.locale('en'); 
    var start_date_search_by, end_date_search_by;
    if (search_parameters.are_dates_flexible) {
        start_date_search_by = moment(search_parameters.start_date).subtract('2', 'weeks').format("X");
        end_date_search_by = moment(search_parameters.end_date).add('2', 'weeks').format("X");
    } else {
        start_date_search_by = moment(search_parameters.start_date).format("X");
        end_date_search_by = moment(search_parameters.end_date).format("X");        
    }
    // console.log(start_date_search_by);
    // console.log(end_date_search_by);

    var search_result_source = $("#search_results_template").html();
    var search_result_template = Handlebars.compile(search_result_source);
    var search_result_context = {
        trips: []
    }    
    trips_ref.orderByChild("start_ts").startAt(start_date_search_by).on("value", function(start_date_snapshot) {
        start_date_snapshot.forEach(function(data) {
            var cur_matched_trip = data.val();
            if ((cur_matched_trip.end_ts < end_date_search_by) &&
                (cur_matched_trip.stops[0].place_id == search_parameters.start_location.place_id)) {
                if (search_parameters.end_location) {
                    if (cur_matched_trip.stops[cur_matched_trip.stops.length-1].place_id == search_parameters.end_location.place_id) {
                        if (!search_result_excludes) {
                            search_results.push(cur_matched_trip);
                            return;
                        }
                        // console.log(data.key());
                        // console.log(search_result_excludes.split(', '));
                        // console.log(search_result_excludes.split(', ').indexOf(data.key().toString()) > -1);
                        if (search_result_excludes.split(', ').indexOf(data.key().toString()) == -1) {
                            search_results.push(cur_matched_trip);
                        }
                    }
                }
            }
        });

        var trip_dict = {};

        for (var i = 0; i < search_results.length; i++) {
            cur_trip_json = search_results[i];
            cur_trip_stop_names = [];
            cur_user = users[i];
            for (var s = 0; s < cur_trip_json.stops.length; s++) {
                cur_trip_stop_names.push(cur_trip_json.stops[s].name);
            }
            trip = {
                trip_id: "trip_" +i,
                full_route_id: "full_route_"+i,
                abbr_route_id: "abbr_route_"+i,
                trip_name: cur_trip_json.name,
                planned_abbr_route: (cur_trip_stop_names.length <= 3) ? cur_trip_stop_names : [cur_trip_json.stops[0].name].concat([cur_trip_json.stops[1].name]).concat("...").concat([cur_trip_json.stops[cur_trip_json.stops.length - 1].name]),
                planned_full_route: cur_trip_stop_names,
                start_date: cur_trip_json.start_date,
                end_date: cur_trip_json.end_date,
                duration: cur_trip_json.duration,
                num_companions: cur_trip_json.companion_count,
                are_dates_flexible: cur_trip_json.are_dates_flexible,
                map_img_src: get_map_img_src(cur_trip_json.stops),
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

        for (var t = 0; t < search_result_context.trips.length; t++) {
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
            // full_route_div.offset({left: full_route_div.offset().left, top: abbr_route_div.offset().top});
            full_route_div.toggle();
            if (search_result_context.trips[j].planned_full_route.length <= 3) {
                continue;
            }            
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
        $('.search-result').show();          
    });        

}

$(document).ready(function() {

    var ref = new Firebase("https://shining-fire-2402.firebaseio.com");

    var current_user;
    var search_result_excludes;
    var authData = ref.getAuth();
    if (authData) {
        ref.child("users").child(authData.uid).once('value', function(dataSnapshot) {
            current_user = dataSnapshot.val();
            search_result_excludes = current_user.trips;
            showPage();
            // var user_menu_source = $("#user-menu").html();
            // var user_menu_template = Handlebars.compile(user_menu_source);
            // var user_menu_source_processed = user_menu_template ({name: current_user.first_name});
            // $("#user-menu").html(user_menu_source_processed);
        });
    } else {
        document.location.href = "index.html";
    }    

    var showPage = function() {
        // Get search params to populate inline form
        var search_parameters = JSON.parse(localStorage.getItem('searched_trip'));
        $('#search-start-location').val(search_parameters.start_location.formatted_address);
        $('#search-end-location').val(search_parameters.end_location.formatted_address);
        $('#search-start-date').val(moment(search_parameters.start_date).format("MMMM DD, YYYY"));
        $('#search-end-date').val(moment(search_parameters.end_date).format("MMMM DD, YYYY"));
        $('#flexible-dates-checkbox').prop('checked', search_parameters.are_dates_flexible);

        // Add autocomplete to location text fields
        var autocomplete_start_location = new google.maps.places.Autocomplete(
            (document.getElementById('search-start-location')),
            { types: ['geocode'] }
        );
        var start_location = search_parameters.start_location;
        google.maps.event.addListener(autocomplete_start_location, 'place_changed', function() {
            // Get the place details from the autocomplete object.
            start_location = autocomplete_start_location.getPlace();
        });
        // Create the autocomplete object for end location, restricting the search to geographical location types.
        var autocomplete_end_location = new google.maps.places.Autocomplete(
            (document.getElementById('search-end-location')),
            { types: ['geocode'] }
        );
        var end_location = search_parameters.end_location;
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
        var start_date = search_parameters.start_date;
        $('#search-end-date').data("DateTimePicker").minDate(moment(start_date));
        $("#search-start-date").on("dp.change", function (e) {
            if (e.date) {
                start_date = e.date;
                $('#search-end-date').data("DateTimePicker").minDate(e.date);
            }
        });
        var end_date = search_parameters.end_date;
        $('#search-start-date').data("DateTimePicker").maxDate(moment(end_date));        
        $("#search-end-date").on("dp.change", function (e) {
            if (e.date) {
                end_date = e.date;
                $('#search-start-date').data("DateTimePicker").maxDate(e.date);
            }
        });  

        performSearch(ref, search_parameters, search_result_excludes);

        $('#search-inline-form').validator().on('submit', function (e) {
            e.preventDefault();
            var new_searched_trip = {}
            new_searched_trip.start_location = start_location;//autocomplete_start_location.getPlace();
            new_searched_trip.end_location = end_location;//autocomplete_end_location.getPlace();
            new_searched_trip.start_date = start_date;
            new_searched_trip.end_date = end_date;
            new_searched_trip.are_dates_flexible = $('#flexible-dates-checkbox').is(":checked") ? true : false;
            if (!start_location || !end_location) {
                if (!start_location) {
                    $("#search-start-location").css("border", "solid red 1px");
                } 
                if (!end_location) {
                    $("#search-end-location").css("border", "solid red 1px");                
                }
                return;
            } else {
                localStorage.setItem('searched_trip', JSON.stringify(new_searched_trip));

                $('.search-result').hide();

                performSearch(ref, new_searched_trip, search_result_excludes);

            }        
        });

    }

});