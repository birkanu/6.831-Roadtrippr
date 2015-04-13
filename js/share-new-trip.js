$(document).ready(function() {

	// Get the New Trip object.
	var new_trip = JSON.parse(localStorage.getItem('new_trip'));

	// Set the Google Maps objects.
	var directionsDisplay = new google.maps.DirectionsRenderer();
	var directionsService = new google.maps.DirectionsService();
	var map = new google.maps.Map(document.getElementById('map-canvas'), {disableDefaultUI: true});
	directionsDisplay.setMap(map);

	// Request the route between the Start Location and the End Location, and display on map.
	var start_location = new_trip.start_location.geometry.location;
	var end_location = new_trip.end_location.geometry.location;
	var request = {
		origin: new google.maps.LatLng(start_location.k, start_location.D),
		destination: new google.maps.LatLng(end_location.k, end_location.D),
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
});