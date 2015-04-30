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
            var current_user_trip_uids = current_user.trips.split(", ");
            current_user_trip_uids = current_user_trip_uids.reverse();
            var search_result_source = $("#search_results").html();
            var search_result_template = Handlebars.compile(search_result_source);
            var search_result_context = {
                trips: []
            }
            for (var i = 0; i < current_user_trip_uids.length; i++) {
                var idx = current_user_trip_uids[i];
                (function(cntr) {
                    ref.child("trips").child(idx).once('value', function(dataSnapshot) {
                        current_trip = dataSnapshot.val();
                        var stops = [];
                        for (var s = 0; s < current_trip.stops.length; s++) {
                            stops.push(current_trip.stops[s].name);
                        }
                        idx = current_user_trip_uids[cntr];
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
                            map_img_src: "http://dishaan.scripts.mit.edu/map-1.png",
                            notes: current_trip.notes,
                            map_alt_text: "Route map from " + current_trip.start_location + " to " + current_trip.end_location,
                        }
                        search_result_context.trips.push(trip);
                        if (cntr == current_user_trip_uids.length - 1) {
                            var search_result_source_processed = search_result_template(search_result_context);
                            $("#search_results").html(search_result_source_processed);         
                            var shared_new_trip = getQueryVariable("shared-new-trip");
                            if (shared_new_trip) {
                                $(".trip-creation").show();
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
                    });
                })(i, idx);
            } 
        });
    } 
});