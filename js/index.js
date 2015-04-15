$(document).ready(function() {

	// Center all modals 
	// Source: http://www.minimit.com/articles/solutions-tutorials/vertical-center-bootstrap-3-modals
	function centerModals(){
	  $('.modal').each(function(i){
	    var $clone = $(this).clone().css('display', 'block').appendTo('body');
	    var top = Math.round(($clone.height() - $clone.find('.modal-content').height()) / 2);
	    top = top > 0 ? top : 0;
	    $clone.remove();
	    $(this).find('.modal-content').css("margin-top", top);
	  });
	}
	$('.modal').on('show.bs.modal', centerModals);
	$(window).on('resize', centerModals);

  	// Create the autocomplete object for start location, restricting the search to geographical location types.
  	var autocomplete_start_location = new google.maps.places.Autocomplete(
  		(document.getElementById('start-trip-modal-start-location')),
  		{ types: ['geocode'] }
  	);
  	var start_location;
	google.maps.event.addListener(autocomplete_start_location, 'place_changed', function() {
		// Get the place details from the autocomplete object.
		start_location = autocomplete_start_location.getPlace();
	});
  	// Create the autocomplete object for end location, restricting the search to geographical location types.
  	var autocomplete_end_location = new google.maps.places.Autocomplete(
  		(document.getElementById('start-trip-modal-end-location')),
  		{ types: ['geocode'] }
  	);
  	var end_location;
	google.maps.event.addListener(autocomplete_end_location, 'place_changed', function() {
		// Get the place details from the autocomplete object.
		end_location = autocomplete_end_location.getPlace();
	});

    // Create the autocomplete object for start location in the find modal, restricting the search to geographical location types.
    var autocomplete_start_location_find_modal_find_modal = new google.maps.places.Autocomplete(
        (document.getElementById('find-trip-modal-start-location')),
        { types: ['geocode'] }
    );

    $('#find-trip-modal-start-location').val("");
    $('#find-trip-modal-end-location').val("");

    var start_location_find_modal;
    google.maps.event.addListener(autocomplete_start_location_find_modal_find_modal, 'place_changed', function() {
        // Get the place details from the autocomplete object.
        start_location_find_modal = autocomplete_start_location_find_modal_find_modal.getPlace();
    });
    // Create the autocomplete object for end location in the find modal, restricting the search to geographical location types.
    var autocomplete_end_location_find_modal_find_modal = new google.maps.places.Autocomplete(
        (document.getElementById('find-trip-modal-end-location')),
        { types: ['geocode'] }
    );
    var end_location_find_modal;
    google.maps.event.addListener(autocomplete_end_location_find_modal_find_modal, 'place_changed', function() {
        // Get the place details from the autocomplete object.
        end_location_find_modal = autocomplete_end_location_find_modal_find_modal.getPlace();
    });    

	// Set the date pickers
	$('#start-trip-modal-start-date').datetimepicker({
		locale: 'en',
		format: 'MMMM DD, YYYY'
	});
	$('#start-trip-modal-end-date').datetimepicker({
		locale: 'en',
		format: 'MMMM DD, YYYY'
	});

	// Link the date pickers 
	var start_date;
	$("#start-trip-modal-start-date").on("dp.change", function (e) {
		if (e.date) {
			start_date = e.date;
        	$('#start-trip-modal-end-date').data("DateTimePicker").minDate(e.date);
		}
    });
    var end_date;
    $("#start-trip-modal-end-date").on("dp.change", function (e) {
    	if (e.date) {
    		end_date = e.date;
        	$('#start-trip-modal-start-date').data("DateTimePicker").maxDate(e.date);
    	}
    });

    // Set the date pickers in the find modal
    $('#find-trip-modal-start-date').datetimepicker({
        locale: 'en',
        format: 'MMMM DD, YYYY'
    });
    $('#find-trip-modal-end-date').datetimepicker({
        locale: 'en',
        format: 'MMMM DD, YYYY'
    });

    // Link the date pickers 
    var start_date_find_modal;
    $("#find-trip-modal-start-date").on("dp.change", function (e) {
        if (e.date) {
            start_date_find_modal = e.date;
            $('#find-trip-modal-end-date').data("DateTimePicker").minDate(e.date);
        }
    });
    var end_date_find_modal;
    $("#find-trip-modal-end-date").on("dp.change", function (e) {
        if (e.date) {
            end_date_find_modal = e.date;
            $('#find-trip-modal-start-date').data("DateTimePicker").maxDate(e.date);
        }
    });

	$('#start-trip-form').validator({});
    $('#find-trip-form').validator({});

	$('#start-trip-form').validator().on('submit', function (e) {
		if (!e.isDefaultPrevented()) {
			e.preventDefault();
			var new_trip = {}
			new_trip.start_location = start_location;
			new_trip.end_location = end_location;
			new_trip.start_date = start_date;
			new_trip.end_date = end_date;
			new_trip.are_dates_flexible = $('#flexible-dates-checkbox').is(":checked") ? true : false;
			new_trip.companion_count = $("#start-trip-modal-companion-count option:selected").text();
			new_trip.notes = $('#start-trip-modal-notes').val();
			if (!start_location || !end_location) {
				$(".errorMessage").show();
			} else {
				localStorage.setItem('new_trip', JSON.stringify(new_trip));
				document.location.href = "views/share-new-trip.html";
			}
  		} 
	});

  // Select random user to be the current user.
  var random_user_index;
  if ( (random_user_index = localStorage.getItem('current_user_index')) == null) {
    random_user_index = Math.floor(Math.random()*users.length);
    localStorage.setItem('current_user_index', random_user_index);
  }

  var random_road_trip_index;
  if ( (random_road_trip_index = localStorage.getItem('random_road_trip_index')) == null) {
    random_road_trip_index = Math.floor(Math.random()*road_trips.length);
    localStorage.setItem('current_road_trip_index', random_road_trip_index);
  }

  // Select random road trips for the current user.
  var NUM_ROAD_TRIPS = 2;
  var random_road_trip_indices = [];
  for (var i = 0; i < NUM_ROAD_TRIPS; i++) {
    var idx = Math.floor(Math.random()*road_trips.length);
    while (random_road_trip_indices.indexOf(idx) != -1) {
      idx = Math.floor(Math.random()*road_trips.length);
    }
    random_road_trip_indices.push(idx);
  }
  localStorage.setItem('current_road_trip_indices', random_road_trip_indices.toString());

  $("#current_user").html(users[random_user_index].first_name + " " + users[random_user_index].last_name);

  var user_menu_source = $("#user-menu").html();
  var user_menu_template = Handlebars.compile(user_menu_source);
  var user_menu_source_processed = user_menu_template ({name: users[random_user_index].first_name});
  $("#user-menu").html(user_menu_source_processed);
  
  $('#find-trip-form').validator().on('submit', function (e) {
      if (!e.isDefaultPrevented()) {
          e.preventDefault();
          var searched_trip = {}
          searched_trip.start_location = start_location_find_modal;
          searched_trip.end_location = end_location_find_modal;
          searched_trip.start_date = start_date_find_modal;
          searched_trip.end_date = end_date_find_modal;
          searched_trip.are_dates_flexible = $('#flexible-dates-checkbox-find-modal').is(":checked") ? true : false;
          if (!start_location_find_modal || !end_location_find_modal) {
              $(".errorMessage").show();
          } else {
              localStorage.setItem('searched_trip', JSON.stringify(searched_trip));
              document.location.href = "views/search-results.html";
          }
      } 
  });
    
});