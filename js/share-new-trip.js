$(document).ready(function() {

	var ref = new Firebase("https://shining-fire-2402.firebaseio.com");
	var current_user_uid;
	var current_user;
	$(document.body).on('click', '#logout', function() {
    	ref.unauth();
    	document.location.href = "../index.html";
  	});
	var authData = ref.getAuth();
	if (authData) {
		current_user_uid = authData.uid;
		ref.child("users").child(current_user_uid).once('value', function(dataSnapshot) {
			current_user = dataSnapshot.val();
			var user_menu_source = $("#user-menu").html();
      		var user_menu_template = Handlebars.compile(user_menu_source);
      		var user_menu_source_processed = user_menu_template ({name: current_user.first_name});
      		$("#user-menu").html(user_menu_source_processed);
		});
	}

	// Set Moment.js locale to English, because it's apparently in Chinese by default for some reason. 
	moment.locale('en');

	// Get the New Trip object.
	var new_trip = JSON.parse(localStorage.getItem('new_trip'));
	var new_trip_details = {};
	new_trip_details.creator_id = current_user_uid;
	new_trip_details.name = new_trip.start_location.formatted_address.substring(0, new_trip.start_location.formatted_address.indexOf(',')) + 
	'-' + new_trip.end_location.formatted_address.substring(0, new_trip.end_location.formatted_address.indexOf(',')) + ' Trip';
	new_trip_details.start_date = moment(new_trip.start_date).format("MMMM DD, YYYY");
	new_trip_details.end_date = moment(new_trip.end_date).format("MMMM DD, YYYY");
	var trip_duration = moment(new_trip.end_date).diff(moment(new_trip.start_date), 'days') + 1;
	new_trip_details.duration = trip_duration > 1 ? trip_duration + " Days" : trip_duration + " Day";
	new_trip_details.are_dates_flexible = new_trip.are_dates_flexible;
	if (new_trip.are_dates_flexible) {
		new_trip_details.start_ts = moment(new_trip.start_date).subtract('2', 'weeks').format("X");		
		new_trip_details.end_ts = moment(new_trip.end_date).add('2', 'weeks').format("X");		
	} else {
		new_trip_details.start_ts = moment(new_trip.start_date).format("X");
		new_trip_details.end_ts = moment(new_trip.end_date).format("X");
	}

	new_trip_details.companion_count = new_trip.companion_count;
	new_trip_details.stops = []; 
	new_trip_details.stops.push(new_trip.start_location, new_trip.end_location);
	new_trip_details.notes = new_trip.notes;
	new_trip_details.interested_users = "";
	new_trip_details.companions = "";

	// Render the HTML for the trip details
	var trip_details_source = $("#trip-details").html();
    var trip_details_template = Handlebars.compile(trip_details_source);
    var trip_details_source_processed = trip_details_template(new_trip_details);
    $("#trip-details").html(trip_details_source_processed);

    // Make stops draggable
    var stops;
    var sortable;
    stops = document.getElementById('stops');
	sortable = new Sortable(stops, {
		handle: '.glyphicon-menu-hamburger',
	  	animation: 150,
	    onEnd: function (evt) {
	    	var old_index = evt.oldIndex;
	    	var new_index = evt.newIndex;
	    	var dragged_element = new_trip_details.stops[old_index];
	    	new_trip_details.stops.splice(old_index, 1);
	    	new_trip_details.stops.splice(new_index, 0, dragged_element);
	    	reroute();
	    }
	});

	// Set the Google Maps objects.
	var directionsDisplay = new google.maps.DirectionsRenderer();
	var directionsService = new google.maps.DirectionsService();
	var map = new google.maps.Map(document.getElementById('map-canvas'), {disableDefaultUI: true});
	directionsDisplay.setMap(map);

	// Request the route between the Start Location and the End Location, and display on map.
	var start = new_trip.start_location;
	var end = new_trip.end_location;
	var request = {
		origin: new google.maps.LatLng(start.lat, start.lng),
		destination: new google.maps.LatLng(end.lat, end.lng),
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

  	// Create the autocomplete object for start location, restricting the search to geographical location types.
  	var autocomplete;
  	var new_stop;
  	autocomplete = new google.maps.places.Autocomplete(
  		(document.getElementById('new-stop')),
  		{ types: ['geocode'] }
  	);
	google.maps.event.addListener(autocomplete, 'place_changed', function() {
		// Get the place details from the autocomplete object.
		new_stop = autocomplete.getPlace();
		new_stop.lat = new_stop.geometry.location.lat();
      	new_stop.lng = new_stop.geometry.location.lng();
	});

	$(document.body).on('click', '#btn-add-new-stop' ,function() {
		if (new_stop && $("#new-stop").val() != '') {
			if (new_trip_details.stops.length < 2) {
				new_trip_details.stops.push(new_stop);
				$( "#stops" ).append( 
	              '<div class="list-group-item">' +
	                '<span class="glyphicon glyphicon-menu-hamburger" aria-hidden="true"></span>' +
	                '<span class="stop" aria-hidden="true"> ' + new_stop.formatted_address + '</span>' +
	                '<span class="glyphicon glyphicon-remove remove-stop" style="float:right"></span>' +
	              '</div>'
				);
			} else {
				new_trip_details.stops.splice(new_trip_details.stops.length - 1, 0, new_stop);	
				var new_stop_html = '<div class="list-group-item">' +
                						'<span class="glyphicon glyphicon-menu-hamburger" aria-hidden="true"></span>' +
                						'<span class="stop" aria-hidden="true"> ' + new_stop.formatted_address + '</span>' +
                						'<span class="glyphicon glyphicon-remove remove-stop" style="float:right"></span>' +
              						'</div>';
				$(new_stop_html).insertBefore( $(".stop-group-item").last() );	
			}
			$("#new-stop").val('');
			reroute();
		}
	});

	$(document.body).on('click', '.remove-stop' ,function() {
		var index =  $(".list-group-item").index($(this).parent());
		new_trip_details.stops.splice(index, 1);
		$(this).parent().remove();
		reroute();
	});

	function reroute() {
		var start = new_trip_details.stops[0];
		var end = new_trip_details.stops[new_trip_details.stops.length - 1];
		var waypts = [];
		for (var i = 1; i < new_trip_details.stops.length - 1; i++) {
			var location = new_trip_details.stops[i];
			waypts.push({
			  	location: new google.maps.LatLng(location.lat, location.lng),
			  	stopover:true
			});
		}
		var request = {
			origin: new google.maps.LatLng(start.lat, start.lng),
			destination: new google.maps.LatLng(end.lat, end.lng),
		  	waypoints: waypts,
		  	optimizeWaypoints: false,
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
			new_stop.lat = new_stop.geometry.location.lat();
      		new_stop.lng = new_stop.geometry.location.lng();
		});
	    stops = document.getElementById('stops');
		sortable = new Sortable(stops, {
			handle: '.glyphicon-menu-hamburger',
		  	animation: 150,
		    onEnd: function (evt) {
		    	var old_index = evt.oldIndex;
		    	var new_index = evt.newIndex;
		    	var dragged_element = new_trip_details.stops[old_index];
		    	new_trip_details.stops.splice(old_index, 1);
		    	new_trip_details.stops.splice(new_index, 0, dragged_element);
		    	reroute();
		    }
		});
	}

	// Set Edit Trip Details Content
	function setTripDetails() {
		// Trip Name
		$('#edit-trip-form-trip-name').val(new_trip_details.name);
		// Dates
		$('#edit-trip-form-start-date').data("DateTimePicker").date(new_trip_details.start_date);
		start_date = new_trip_details.start_date;
		$('#edit-trip-form-end-date').data("DateTimePicker").minDate(start_date);
		$('#edit-trip-form-end-date').data("DateTimePicker").date(new_trip_details.end_date);
		end_date = new_trip_details.end_date;
		$('#edit-trip-form-start-date').data("DateTimePicker").maxDate(end_date);
	    // Flexible Dates
	    if (new_trip_details.are_dates_flexible) {
	    	$('#flexible-dates-checkbox').prop('checked', true);
	    }
	    // Companions
	    $("#edit-trip-form-companion-count").val(new_trip_details.companion_count);
	    // Notes
	    $('#edit-trip-form-notes').val(new_trip_details.notes);
	}

	$('#edit-trip-form-start-date').datetimepicker({
		locale: 'en',
		format: 'MMMM DD, YYYY',
		defaultDate: new_trip_details.start_date
	});
	$('#edit-trip-form-end-date').datetimepicker({
		locale: 'en',
		format: 'MMMM DD, YYYY',
		defaultDate: new_trip_details.end_date
	});

	$('.glyphicon-calendar').click(function(){
		$(this).parent().parent().find('.form-control').data("DateTimePicker").show();
	});

	setTripDetails();

	// Link the date pickers 
	var start_date;
	$("#edit-trip-form-start-date").on("dp.change", function (e) {
		if (e.date) {
			start_date = e.date;
        	$('#edit-trip-form-end-date').data("DateTimePicker").minDate(e.date);
		}
    });
    var end_date;
    $("#edit-trip-form-end-date").on("dp.change", function (e) {
    	if (e.date) {
    		end_date = e.date;
        	$('#edit-trip-form-start-date').data("DateTimePicker").maxDate(e.date);
    	}
    });

	$('#btn-edit-trip-details').click(function() {
		if (!$("#edit-trip-container").is(":visible")) {
			$(this).text("Cancel");
			$('#btn-share-trip').text("Save Changes");

		} else {
			$(this).text("Edit Trip Details");	
			$('#btn-share-trip').text("Share My Trip");
			setTripDetails();
			$('#edit-trip-form').validator('validate');
		}
		$("#trip-details, #edit-trip-container").toggle();
	});

	$('#edit-trip-form').validator({});
	var isFormValid;
	$('#edit-trip-form').validator().on('invalid.bs.validator', function (e) {
		isFormValid = false;
	})
	$('#edit-trip-form').validator().on('valid.bs.validator', function (e) {
		isFormValid = true;
	})

	$('#btn-share-trip').click(function() {
		if ($("#edit-trip-container").is(":visible")) {
			if (isFormValid) {
				$(this).text("Share My Trip");
				$('#btn-edit-trip-details').text("Edit Trip Details");
				// Save changes
				new_trip_details.name = $('#edit-trip-form-trip-name').val();
				new_trip_details.start_date = moment(start_date).format("MMMM DD, YYYY");
				new_trip_details.end_date = moment(end_date).format("MMMM DD, YYYY");
				var duration = moment(end_date).diff(moment(start_date), 'days') + 1;
				new_trip_details.duration = duration > 1 ? duration + " Days" : duration + " Day";
				new_trip_details.are_dates_flexible = $('#flexible-dates-checkbox').is(":checked") ? true : false;
				new_trip_details.companion_count = $("#edit-trip-form-companion-count option:selected").text();
				new_trip_details.notes = $('#edit-trip-form-notes').val();
				// Re-render Handlebars Template
				var new_trip_details_source_processed = trip_details_template(new_trip_details);
    			$("#trip-details").html(new_trip_details_source_processed);
    			resetGoogleAutoCompleteAndSortable();
				$("#trip-details, #edit-trip-container").toggle();			
			}
		} else {
			if (current_user) {
				$('.share-trip-error-message').hide();
				var tripsRef = ref.child("trips");
				var newTripRef = tripsRef.push(new_trip_details);
				var new_trip_uid = newTripRef.key();
				var current_user_trips = current_user.trips;
				if (current_user_trips == '') {
					current_user_trips = new_trip_uid;
				} else {
					current_user_trips = current_user_trips + ', ' + new_trip_uid;
				}
				ref.child("users").child(current_user_uid).update({
				  	"trips": current_user_trips
				});
				document.location.href = "my-trips.html?shared-new-trip=true";
			} else {
				$('.share-trip-error-message').show();
			}
		}
	});

});