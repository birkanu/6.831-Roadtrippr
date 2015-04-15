$(document).ready(function() {

    // Set Moment.js locale to English, because it's apparently in Chinese by default for some reason. 
    moment.locale('en');

    // Get the New Trip object.
    var clicked_trip = JSON.parse(localStorage.getItem('trip'));
    var clicked_trip_details = {};
    clicked_trip_details.name = clicked_trip.trip_name;
    clicked_trip_details.start_date = moment(clicked_trip.start_date).format("MMMM DD, YYYY");
    clicked_trip_details.end_date = moment(clicked_trip.end_date).format("MMMM DD, YYYY");
    var trip_duration = clicked_trip.duration;
    clicked_trip_details.duration = trip_duration > 1 ? trip_duration + " Days" : trip_duration + " Day";
    clicked_trip_details.are_dates_flexible = clicked_trip.are_dates_flexible;
    clicked_trip_details.companion_count = clicked_trip.num_companions;
    clicked_trip_details.stops = clicked_trip.planned_full_route; 
    // clicked_trip_details.stops.push(clicked_trip.start_location, clicked_trip.end_location);
    clicked_trip_details.notes = clicked_trip.notes;
    clicked_trip_details.creator_first_name = clicked_trip.creator_name;
    clicked_trip_details.creator_age = clicked_trip.creator_age;
    clicked_trip_details.creator_location = clicked_trip.creator_location;
    clicked_trip_details.creator_img_src = clicked_trip.creator_img_src;   


    // Render the HTML for the trip details
    var trip_details_source = $("#trip-details").html();
    var trip_details_template = Handlebars.compile(trip_details_source);
    var trip_details_source_processed = trip_details_template(clicked_trip_details);
    $("#trip-details").html(trip_details_source_processed);

    // Make stops draggable
    // var stops;
    // var sortable;
    // stops = document.getElementById('stops');
    // sortable = new Sortable(stops, {
    //     handle: '.glyphicon-menu-hamburger',
    //     animation: 150,
    //     onEnd: function (evt) {
    //         var old_index = evt.oldIndex;
    //         var new_index = evt.newIndex;
    //         var dragged_element = clicked_trip_details.stops[old_index];
    //         clicked_trip_details.stops.splice(old_index, 1);
    //         clicked_trip_details.stops.splice(new_index, 0, dragged_element);
    //         reroute();
    //     }
    // });

    // Set the Google Maps objects.
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var directionsService = new google.maps.DirectionsService();
    var map = new google.maps.Map(document.getElementById('map-canvas'), {disableDefaultUI: true});
    geocoder = new google.maps.Geocoder();
    directionsDisplay.setMap(map);

    var location_list = [];

    var get_location_from_address_index = function(index) {
        if (index == clicked_trip.planned_full_route.length) {
            get_route();
            reroute();
            return;
        }
        geocoder.geocode( { 'address': clicked_trip.planned_full_route[index]}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                location_list.push(results[0].geometry.location);
                get_location_from_address_index(index+1);
            } else {
                console.log('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    get_location_from_address_index(0);

    var get_route = function() {
        // Request the route between the Start Location and the End Location, and display on map.
        var start = location_list[0];
        var end = location_list[location_list.length-1];
        var request = {
            origin: new google.maps.LatLng(start.k, start.D),
            destination: new google.maps.LatLng(end.k, end.D),
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


    // // Create the autocomplete object for start location, restricting the search to geographical location types.
    // var autocomplete;
    // var new_stop;
    // autocomplete = new google.maps.places.Autocomplete(
    //     (document.getElementById('new-stop')),
    //     { types: ['geocode'] }
    // );
    // google.maps.event.addListener(autocomplete, 'place_changed', function() {
    //     // Get the place details from the autocomplete object.
    //     new_stop = autocomplete.getPlace();
    // });

    // $(document.body).on('click', '#btn-add-new-stop' ,function() {
    //     if (new_stop && $("#new-stop").val() != '') {
    //         if (clicked_trip_details.stops.length < 2) {
    //             clicked_trip_details.stops.push(new_stop);
    //             $( "#stops" ).append( 
    //               '<div class="list-group-item">' +
    //                 '<span class="glyphicon glyphicon-menu-hamburger" aria-hidden="true"></span>' +
    //                 '<span class="stop" aria-hidden="true"> ' + new_stop.formatted_address + '</span>' +
    //                 '<span class="glyphicon glyphicon-remove remove-stop" style="float:right"></span>' +
    //               '</div>'
    //             );
    //         } else {
    //             clicked_trip_details.stops.splice(clicked_trip_details.stops.length - 1, 0, new_stop);  
    //             var new_stop_html = '<div class="list-group-item">' +
    //                                     '<span class="glyphicon glyphicon-menu-hamburger" aria-hidden="true"></span>' +
    //                                     '<span class="stop" aria-hidden="true"> ' + new_stop.formatted_address + '</span>' +
    //                                     '<span class="glyphicon glyphicon-remove remove-stop" style="float:right"></span>' +
    //                                 '</div>';
    //             $(new_stop_html).insertBefore( $(".stop-group-item").last() );  
    //         }
    //         $("#new-stop").val('');
    //         reroute();
    //     }
    // });

    function reroute() {
        var start = location_list[0];
        var end = location_list[location_list.length-1];
        var waypts = [];
        for (var i = 1; i < location_list.length - 1; i++) {
            var location = location_list[i];
            waypts.push({
                location: new google.maps.LatLng(location.k, location.D),
                stopover:true
            });
        }
        var request = {
            origin: new google.maps.LatLng(start.k, start.D),
            destination: new google.maps.LatLng(end.k, end.D),
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

    function resetGoogleAutoCompleteAndSortable() {
        autocomplete = new google.maps.places.Autocomplete(
            (document.getElementById('new-stop')),
            { types: ['geocode'] }
        );  
        google.maps.event.addListener(autocomplete, 'place_changed', function() {
            // Get the place details from the autocomplete object.
            new_stop = autocomplete.getPlace();
        });
        stops = document.getElementById('stops');
        sortable = new Sortable(stops, {
            handle: '.glyphicon-menu-hamburger',
            animation: 150,
            onEnd: function (evt) {
                var old_index = evt.oldIndex;
                var new_index = evt.newIndex;
                var dragged_element = clicked_trip_details.stops[old_index];
                clicked_trip_details.stops.splice(old_index, 1);
                clicked_trip_details.stops.splice(new_index, 0, dragged_element);
                reroute();
            }
        });
    }

});