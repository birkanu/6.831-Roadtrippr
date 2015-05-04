$(document).ready(function() {

    var ref = new Firebase("https://shining-fire-2402.firebaseio.com");

    var current_user;
    var search_result_excludes;
    var authData = ref.getAuth();
    if (authData) {
        ref.child("users").child(authData.uid).once('value', function(dataSnapshot) {
            current_user = dataSnapshot.val();
            var user_menu_source = $("#user-menu").html();
            var user_menu_template = Handlebars.compile(user_menu_source);
            var user_menu_source_processed = user_menu_template ({name: current_user.first_name});
            $("#user-menu").html(user_menu_source_processed);            
            showPage();
            // var user_menu_source = $("#user-menu").html();
            // var user_menu_template = Handlebars.compile(user_menu_source);
            // var user_menu_source_processed = user_menu_template ({name: current_user.first_name});
            // $("#user-menu").html(user_menu_source_processed);
        });
    } else {
        document.location.href = "../index.html";
    }    

    function showPage() {
        // Set Moment.js locale to English, because it's apparently in Chinese by default for some reason. 
        moment.locale('en');

        // Get the Created Trip object.
        var clicked_trip = JSON.parse(localStorage.getItem('trip'));
        var clicked_trip_details = {};
        clicked_trip_details.trip_id = clicked_trip.id_only;
        clicked_trip_details.name = clicked_trip.trip_name;
        clicked_trip_details.start_date = moment(clicked_trip.start_date).format("MMMM DD, YYYY");
        clicked_trip_details.end_date = moment(clicked_trip.end_date).format("MMMM DD, YYYY");
        clicked_trip_details.duration = clicked_trip.duration;
        clicked_trip_details.are_dates_flexible = clicked_trip.are_dates_flexible;
        clicked_trip_details.planned_full_latlng = clicked_trip.planned_full_latlng;
        clicked_trip_details.companion_count = clicked_trip.num_companions;
        clicked_trip_details.stops = clicked_trip.planned_full_route; 
        clicked_trip_details.notes = clicked_trip.notes;
        clicked_trip_details.creator_id = clicked_trip.creator_id;
        clicked_trip_details.creator_first_name = clicked_trip.creator_name;
        clicked_trip_details.creator_age = clicked_trip.creator_age;
        clicked_trip_details.creator_location = clicked_trip.creator_location;
        clicked_trip_details.creator_img_src = clicked_trip.creator_img_src;   
        clicked_trip_details.creator_email = clicked_trip.creator_email; 

        // Render the HTML for the trip details
        var trip_details_source = $("#trip-details").html();
        var trip_details_template = Handlebars.compile(trip_details_source);
        var trip_details_source_processed = trip_details_template(clicked_trip_details);
        $("#trip-details").html(trip_details_source_processed);

        var withdrawListener = function(e) {
            e.preventDefault();
            e.stopPropagation();
            var req_trips = [];
            if (current_user.interested_trips) {
                var interested_trips = current_user.interested_trips.split(', ');
                for (var t = 0; t < interested_trips.length; t++) {
                    if (interested_trips[t] != clicked_trip_details.trip_id) {
                        req_trips.push(interested_trips[t]);
                    }
                }                
            }
            ref.child("users").child(authData.uid).update({'interested_trips': buildString(req_trips)}, function(data) {
                set_req_trip_button(req_trips);
            });  
        }

        set_req_trip_button();

        function buildString(trip_list) {
            var trip_string = "";
            for (var tl = 0; tl < trip_list.length; tl++) {
                if (trip_list[tl] == "") {
                    continue;
                }
                trip_string += trip_list[tl];
                if (tl != trip_list.length -1) {
                    trip_string += ", ";
                }
            }
            return trip_string;
        }

        function set_req_trip_button(req_trips) {
            if (!req_trips) {
                req_trips = current_user.interested_trips.split(', ');
            }
            if (req_trips.length != 0) {
                if (req_trips.indexOf(clicked_trip_details.trip_id) > -1) {
                    $("#join-button-link").html("WITHDRAW REQUEST");
                    $("#join-button").click(withdrawListener);
                } else {
                    $("#join-button-link").html("REQUEST TO JOIN TRIP");
                    $("#join-button").click(function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        var new_req_trips;      
                        $(".success").html("Success");        
                        $(".success").fadeIn(500);
                        setTimeout(function() {
                            $(".success").fadeOut(500);
                        }, 1500);                                  
                        if (req_trips.indexOf(clicked_trip_details.trip_id) > -1) {
                            new_req_trips = req_trips;
                        } else {
                            new_req_trips = req_trips.concat(clicked_trip_details.trip_id);   
                        }
                        ref.child("users").child(authData.uid).update({'interested_trips': buildString(new_req_trips)}, function(data) {
                            $("#join-button-link").html("WITHDRAW REQUEST");
                            $("#join-button").on('click', withdrawListener);                                                        
                        });
                    });
                }
            } else {
                $("#join-button-link").html("REQUEST TO JOIN TRIP");
                $("#join-button").click(function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var new_req_trips = [clicked_trip_details.trip_id];
                    ref.child("users").child(authData.uid).update({'interested_trips': clicked_trip_details.trip_id}, function(data) {
                        $(".success").html("Success");
                        $(".success").fadeIn(500);
                        setTimeout(function() {
                            $(".success").fadeOut(500);
                        }, 1000);
                        $("#join-button-link").html("WITHDRAW REQUEST");
                        $("#join-button").on('click', withdrawListener);                            
                    });
                });            
            }            
        }


        // Set the Google Maps objects.
        var directionsDisplay = new google.maps.DirectionsRenderer();
        var directionsService = new google.maps.DirectionsService();
        var map = new google.maps.Map(document.getElementById('map-canvas'), {disableDefaultUI: true});
        directionsDisplay.setMap(map);

        reroute(clicked_trip_details.planned_full_latlng);

        function reroute(location_list) {
            var start = location_list[0];
            var end = location_list[location_list.length-1];
            var waypts = [];
            for (var i = 1; i < location_list.length - 1; i++) {
                var location = location_list[i];
                waypts.push({
                    location: new google.maps.LatLng(location.lat, location.lng),
                    stopover:true
                });
            }
            var request = {
                origin: new google.maps.LatLng(start.lat, start.lng),
                destination: new google.maps.LatLng(end.lat, end.lng),
                waypoints: waypts,
                optimizeWaypoints: true,
                travelMode: google.maps.TravelMode.DRIVING
            };
            directionsService.route(request, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(response);
                    var bounds = response.routes[0].bounds;
                    map.fitBounds(bounds);
                    map.setCenter(bounds.getCenter());
                }
            });
        }
    }
});