$(document).ready(function() {

    var ref = new Firebase("https://shining-fire-2402.firebaseio.com");

    // Get search params to populate inline form
    var search_parameters = JSON.parse(localStorage.getItem('searched_trip'));
    $('#search-start-location').val(search_parameters.start_location.formatted_address);
    $('#search-end-location').val(search_parameters.end_location.formatted_address);
    $('#search-start-date').val(moment(search_parameters.start_date).format("MMMM DD, YYYY"));
    $('#search-end-date').val(moment(search_parameters.end_date).format("MMMM DD, YYYY"));
    $('#flexible-dates-checkbox').prop('checked', search_parameters.are_dates_flexible);

    // Initialize loading spinner
    var opts = {
        lines: 13, // The number of lines to draw
        length: 20, // The length of each line
        width: 10, // The line thickness
        radius: 30, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: '#ccc', // #rgb or #rrggbb or array of colors
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner_elt', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: '50%', // Top position relative to parent
        left: '50%' // Left position relative to parent
    };

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
    $("#search-start-date").on("dp.change", function (e) {
        if (e.date) {
            start_date = e.date;
            $('#search-end-date').data("DateTimePicker").minDate(e.date);
        }
    });
    var end_date = search_parameters.end_date;
    $("#search-end-date").on("dp.change", function (e) {
        if (e.date) {
            end_date = e.date;
            $('#search-start-date').data("DateTimePicker").maxDate(e.date);
        }
    });  

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

            $(".spinner_div").css("padding-top", "25%");
            var spinner = new Spinner(opts).spin();        
            $('#spinner_container').append(spinner.el);
            $('.search-result').fadeOut();//.delay(1000).fadeIn();

            // performSearch(new_searched_trip);

            setTimeout(function() {
               spinner.stop();
               $(".spinner_div").css("padding-top", "0%");           
            }, 1000);     

            //document.location.href = "search-results.html";
        }        
    });

    // $("#btn-update-search").click(function(e) {
    //     // var searched_trip = {}
    //     // searched_trip.start_location = autocomplete_start_location.getPlace();
    //     // searched_trip.end_location = autocomplete_end_location.getPlace();
    //     // searched_trip.start_date = start_date;
    //     // searched_trip.end_date = end_date;
    //     // searched_trip.are_dates_flexible = $('#flexible-dates-checkbox').is(":checked") ? true : false;
    //     // if (!start_location || !end_location) {
    //     //     if (!start_location) {
    //     //         $("#search-start-location").css("border", "solid red 1px");
    //     //     } 
    //     //     if (!end_location) {
    //     //         $("#search-end-location").css("border", "solid red 1px");                
    //     //     }
    //     //     return;
    //     // } else {
    //     //     localStorage.setItem('searched_trip', JSON.stringify(searched_trip));
    //     //     //document.location.href = "views/search-results.html";
    //     // }        
    //     $(".spinner_div").css("padding-top", "25%");
    //     var spinner = new Spinner(opts).spin();        
    //     $('#spinner_container').append(spinner.el);
    //     $('.search-result').fadeOut().delay(1000).fadeIn();

    //     setTimeout(function() {
    //        spinner.stop();
    //        $(".spinner_div").css("padding-top", "0%");           
    //     }, 1000);
    // });

    // Populate dummy search results
    var trips_ref = ref.child("trips");
    moment.locale('en'); 
    // console.log(moment(start_date).subtract('2', 'weeks').format("MMMM DD, YYYY"));
    var start_date_search_by, end_date_search_by;
    if (search_parameters.are_dates_flexible) {
        start_date_search_by = moment(start_date).subtract('2', 'weeks').format("X");
        end_date_search_by = moment(end_date).add('2', 'weeks').format("X");
    } else {
        start_date_search_by = moment(start_date).format("X");
        end_date_search_by = moment(end_date).format("X");        
    }
    console.log(start_date_search_by);
    console.log(end_date_search_by);
    trips_ref.orderByChild("start_location").equalTo(start_location).on("value", function(start_date_snapshot) {
        start_date_snapshot.forEach(function(data) {
            console.log(date.val());
        });
    });
    var search_result_source = $("#search_results").html();
    var search_result_template = Handlebars.compile(search_result_source);
    var search_result_context = {
        trips: []
    }

    var trip_dict = {};

    for (var i = 0; i < road_trips.length; i++) {
        cur_trip_json = road_trips[i];
        cur_user = users[i];
        trip = {
            trip_id: "trip_" +i,
            full_route_id: "full_route_"+i,
            abbr_route_id: "abbr_route_"+i,
            trip_name: cur_trip_json.trip_name,
            planned_abbr_route: [cur_trip_json.start_location].concat(cur_trip_json.stops[0]).concat("...").concat([cur_trip_json.end_location]),
            planned_full_route: [cur_trip_json.start_location].concat(cur_trip_json.stops).concat([cur_trip_json.end_location]),
            start_date: cur_trip_json.start_date,
            end_date: cur_trip_json.end_date,
            duration: cur_trip_json.duration,
            num_companions: cur_trip_json.num_companions,
            are_dates_flexible: cur_trip_json.are_dates_flexible,
            map_img_src: "http://dishaan.scripts.mit.edu/map-" + i + ".png",
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

    for (var t = 0; t < road_trips.length; t++) {
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

});