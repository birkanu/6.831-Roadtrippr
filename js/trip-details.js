$(document).ready(function() {

    // Set Moment.js locale to English, because it's apparently in Chinese by default for some reason. 
    moment.locale('en');

    // Get the Created Trip object.
    var clicked_trip = JSON.parse(localStorage.getItem('trip'));
    var clicked_trip_details = {};
    clicked_trip_details.name = clicked_trip.trip_name;
    clicked_trip_details.start_date = moment(clicked_trip.start_date).format("MMMM DD, YYYY");
    clicked_trip_details.end_date = moment(clicked_trip.end_date).format("MMMM DD, YYYY");
    clicked_trip_details.duration = clicked_trip.duration;
    clicked_trip_details.are_dates_flexible = clicked_trip.are_dates_flexible;
    clicked_trip_details.planned_full_latlng = clicked_trip.planned_full_latlng;
    clicked_trip_details.companion_count = clicked_trip.num_companions;
    clicked_trip_details.stops = clicked_trip.planned_full_route; 
    clicked_trip_details.notes = clicked_trip.notes;
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
});