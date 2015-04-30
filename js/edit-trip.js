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
	// Set Moment.js locale to English, because it's apparently in Chinese by default for some reason. 
	moment.locale('en');
	var trip_uid = getQueryVariable("id");
	var ref = new Firebase("https://shining-fire-2402.firebaseio.com");
	$(document.body).on('click', '#logout', function() {
    	ref.unauth();
    	document.location.href = "../index.html";
  	});
	var current_user_uid;
	var current_user;
	var authData = ref.getAuth();
	if (authData) {
		current_user_uid = authData.uid;
		ref.child("users").child(current_user_uid).once('value', function(dataSnapshot) {
			current_user = dataSnapshot.val();
			var user_menu_source = $("#user-menu").html();
      		var user_menu_template = Handlebars.compile(user_menu_source);
      		var user_menu_source_processed = user_menu_template ({name: current_user.first_name});
      		$("#user-menu").html(user_menu_source_processed);
			ref.child("trips").child(trip_uid).once('value', function(dataSnapshot) {
                var trip = dataSnapshot.val();    
				// Render the HTML for the trip details
				var trip_details_source = $("#trip-details").html();
			    var trip_details_template = Handlebars.compile(trip_details_source);
			    var trip_details_source_processed = trip_details_template(trip);
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
				    	var dragged_element = trip.stops[old_index];
				    	trip.stops.splice(old_index, 1);
				    	trip.stops.splice(new_index, 0, dragged_element);
				    	reroute();
				    }
				});
				// Set the Google Maps objects.
				var directionsDisplay = new google.maps.DirectionsRenderer();
				var directionsService = new google.maps.DirectionsService();
				var map = new google.maps.Map(document.getElementById('map-canvas'), {disableDefaultUI: true});
				directionsDisplay.setMap(map);						
				reroute();
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
						if (trip.stops.length < 2) {
							trip.stops.push(new_stop);
							$( "#stops" ).append( 
				              '<div class="list-group-item">' +
				                '<span class="glyphicon glyphicon-menu-hamburger" aria-hidden="true"></span>' +
				                '<span class="stop" aria-hidden="true"> ' + new_stop.formatted_address + '</span>' +
				                '<span class="glyphicon glyphicon-remove remove-stop" style="float:right"></span>' +
				              '</div>'
							);
						} else {
							trip.stops.splice(trip.stops.length - 1, 0, new_stop);	
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
					trip.stops.splice(index, 1);
					$(this).parent().remove();
					reroute();
				});
				function reroute() {
					var start = trip.stops[0];
					var end = trip.stops[trip.stops.length - 1];
					var waypts = [];
					for (var i = 1; i < trip.stops.length - 1; i++) {
						var location = trip.stops[i];
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
					    	var dragged_element = trip.stops[old_index];
					    	trip.stops.splice(old_index, 1);
					    	trip.stops.splice(new_index, 0, dragged_element);
					    	reroute();
					    }
					});
				}
				// Set Edit Trip Details Content
				function setTripDetails() {
					// Trip Name
					$('#edit-trip-form-trip-name').val(trip.name);
					// Dates
					$('#edit-trip-form-start-date').data("DateTimePicker").date(trip.start_date);
					start_date = trip.start_date;
					$('#edit-trip-form-end-date').data("DateTimePicker").minDate(start_date);
					$('#edit-trip-form-end-date').data("DateTimePicker").date(trip.end_date);
					end_date = trip.end_date;
					$('#edit-trip-form-start-date').data("DateTimePicker").maxDate(end_date);
				    // Flexible Dates
				    if (trip.are_dates_flexible) {
				    	$('#flexible-dates-checkbox').prop('checked', true);
				    }
				    // Companions
				    $("#edit-trip-form-companion-count").val(trip.companion_count);
				    // Notes
				    $('#edit-trip-form-notes').val(trip.notes);
				}
				$('#edit-trip-form-start-date').datetimepicker({
					locale: 'en',
					format: 'MMMM DD, YYYY',
					defaultDate: trip.start_date
				});
				$('#edit-trip-form-end-date').datetimepicker({
					locale: 'en',
					format: 'MMMM DD, YYYY',
					defaultDate: trip.end_date
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
						$('.edit-trip-success-message').hide();
						$(this).text("Cancel");
						$('#btn-share-trip').text("Done");

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
							$(this).text("Save Changes");
							$('#btn-edit-trip-details').text("Edit Trip Details");
							// Save changes
							trip.name = $('#edit-trip-form-trip-name').val();
							trip.start_date = moment(start_date).format("MMMM DD, YYYY");
							trip.end_date = moment(end_date).format("MMMM DD, YYYY");
							var duration = moment(end_date).diff(moment(start_date), 'days') + 1;
							trip.duration = duration > 1 ? duration + " Days" : duration + " Day";
							trip.are_dates_flexible = $('#flexible-dates-checkbox').is(":checked") ? true : false;
							if (trip.are_dates_flexible) {
								trip.start_ts = moment(trip.start_date).subtract('2', 'weeks').format("X");		
								trip.end_ts = moment(trip.end_date).add('2', 'weeks').format("X");		
							} else {
								trip.start_ts = moment(trip.start_date).format("X");
								trip.end_ts = moment(trip.end_date).format("X");
							}
							trip.companion_count = $("#edit-trip-form-companion-count option:selected").text();
							trip.notes = $('#edit-trip-form-notes').val();	
							// Re-render Handlebars Template
							var new_trip_details_source_processed = trip_details_template(trip);
			    			$("#trip-details").html(new_trip_details_source_processed);
			    			resetGoogleAutoCompleteAndSortable();
							$("#trip-details, #edit-trip-container").toggle();			
						}
					} else {
						if (current_user) {
							$('.edit-trip-error-message').hide();
							var tripsRef = ref.child("trips");
							tripsRef.child(trip_uid).update({
								'are_dates_flexible': trip.are_dates_flexible,
								'companion_count': trip.companion_count,
								'duration': trip.duration,
								'end_date': trip.end_date,
								'end_ts': trip.end_ts,
								'name': trip.name,
								'notes': trip.notes,
								'start_date': trip.start_date,
								'start_ts': trip.start_ts,
								'stops': trip.stops	
							});
							$('.edit-trip-success-message').show();
						} else {
							$('.edit-trip-success-message').hide();
							$('.edit-trip-error-message').show();
						}
					}
				});
			});
		});
	}
});
