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

// Closure 1.
function getTrip(cntr, idx, ref, current_user_trip_uids, search_result_context, search_result_template) {
    ref.child("trips").child(idx).once('value', function(dataSnapshot) {
        var current_trip = dataSnapshot.val();
        var stops = [];
        for (var s = 0; s < current_trip.stops.length; s++) {
            stops.push(current_trip.stops[s].name);
        }
        idx = current_user_trip_uids[cntr];

        var interested_users = [];
        var interested_users_uids = current_trip.interested_users.split(", ");
        if (interested_users_uids[0] == "") interested_users_uids = [];

        var companions = [];
        var companions_uids = current_trip.companions.split(", ");
        if (companions_uids[0] == "") companions_uids = [];
        
        var combined_users_uids = interested_users_uids.concat(companions_uids);

        if (combined_users_uids.length > 0) {
            for (var u = 0; u < combined_users_uids.length; u++) {
                getUser(ref, u, interested_users_uids.length, interested_users, companions, combined_users_uids, idx, current_trip, stops, cntr, current_user_trip_uids, search_result_context, search_result_template);
            }
        } else {
            setTripData(idx, current_trip, stops, interested_users, companions, cntr, current_user_trip_uids, search_result_context, search_result_template);
        }

        // if (interested_users_uids[0] != "") {
        //     for (var u = 0; u < interested_users_uids.length; u++) {
        //         getUser(ref, u, interested_users, interested_users_uids, idx, current_trip, stops, cntr, current_user_trip_uids, search_result_context, search_result_template);
        //     }
        // } else {
        //     setTripData(idx, current_trip, stops, interested_users, cntr, current_user_trip_uids, search_result_context, search_result_template);
        // }


    });
}

// Closure 2.
function getUser(ref, u, num_interested_users, interested_users, companions, combined_users_uids, idx, current_trip, stops, cntr, current_user_trip_uids, search_result_context, search_result_template) {
    ref.child("users").child(combined_users_uids[u]).once('value', function(dataSnapshot) {
        var user = dataSnapshot.val();
        user["uid"] = combined_users_uids[u]; // Add the user id so we know what user to retrieve when viewing profile.
        user["tripid"] = idx; // Add the trip id so we know what trip the user is interested in when accepting/rejecting the user.
        if (u < num_interested_users) {
            interested_users.push(user);
        } else {
            companions.push(user);
        }
        if (u == combined_users_uids.length-1) {
            setTripData(idx, current_trip, stops, interested_users, companions, cntr, current_user_trip_uids, search_result_context, search_result_template);
        }
    });
}

function setTripData(idx, current_trip, stops, interested_users, companions, cntr, current_user_trip_uids, search_result_context, search_result_template) {
    trip = {
        index: idx,
        trip_id: idx,
        full_route_id: "full_route_"+idx,
        abbr_route_id: "abbr_route_"+idx,
        trip_name: current_trip.name,
        planned_abbr_route: [stops[0]].concat(stops[1]).concat("...").concat([stops[stops.length - 1]]),
        planned_full_route: stops,
        start_date: current_trip.start_date,
        end_date: current_trip.end_date,
        duration: current_trip.duration,
        num_companions: current_trip.companion_count,
        are_dates_flexible: current_trip.are_dates_flexible,
        map_img_src: get_map_img_src(current_trip.stops),
        notes: current_trip.notes,
        map_alt_text: "Route map from " + current_trip.start_location + " to " + current_trip.end_location,
        interested_users: interested_users,
        companions: companions
    }
    search_result_context.trips.push(trip);
    // if (cntr == current_user_trip_uids.length - 1) {  -> this causes problem when there are trips with and without interested users
    if (search_result_context.trips.length == current_user_trip_uids.length) {
        var search_result_source_processed = search_result_template(search_result_context);
        $("#search_results").html(search_result_source_processed);         
        var shared_new_trip = getQueryVariable("shared-new-trip");
        if (shared_new_trip) {
            $(".trip-creation").show();
        }
        var deleted_trip = getQueryVariable("deleted-trip");
        if (deleted_trip) {
            $(".trip-deletion").show();
        }
        // Add hover on abbreviated planned route for each route
        for (var j = 0; j < search_result_context.trips.length; j++) {
            var idx2 = search_result_context.trips[j]["index"];
            var full_route_div = $("#full_route_"+idx2);
            var abbr_route_div = $("#abbr_route_"+idx2);
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
    }
}
$(document).ready(function() {
    var ref = new Firebase("https://shining-fire-2402.firebaseio.com");
    var current_user;
    $(document.body).on('click', '#logout', function() {
        ref.unauth();
        document.location.href = "../index.html";
    });
    var authData = ref.getAuth();
    if (authData) {
        ref.child("users").child(authData.uid).once('value', function(dataSnapshot) {
            current_user = dataSnapshot.val();
            var user_menu_source = $("#user-menu").html();
            var user_menu_template = Handlebars.compile(user_menu_source);
            var user_menu_source_processed = user_menu_template ({name: current_user.first_name});
            $("#user-menu").html(user_menu_source_processed);
            if (current_user.trips) { 
                var current_user_trip_uids = current_user.trips.split(", ");
                current_user_trip_uids = current_user_trip_uids.reverse();
                var search_result_source = $("#search_results").html();
                var search_result_template = Handlebars.compile(search_result_source);
                var search_result_context = {
                    trips: []
                }
                for (var i = 0; i < current_user_trip_uids.length; i++) {
                    var idx = current_user_trip_uids[i];
                    getTrip(i, idx, ref, current_user_trip_uids, search_result_context, search_result_template);
                }
            } else {
                var deleted_trip = getQueryVariable("deleted-trip");
                if (deleted_trip) {
                    $(".trip-deletion").show();
                }
                $('#search_results').hide();
                $('#noTripsMessage').show();
            } 
        });
    } 
});