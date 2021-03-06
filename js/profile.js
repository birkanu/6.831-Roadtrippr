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
  var photo;

  var user_source = $("#profile").html();
  var user_template = Handlebars.compile(user_source);
  var user_menu_source = $("#user-menu").html();
  var user_menu_template = Handlebars.compile(user_menu_source);

  // Handle clicking on logout.
  $(document.body).on('click', '#logout', function() {
      ref.unauth();
      document.location.href = "../index.html";
  });  

  var ref = new Firebase("https://shining-fire-2402.firebaseio.com");

  var current_user;
  var authData = ref.getAuth();
  var isFormValid;
  var isSelf;
  
  var userId;
  var tripId;

  // Get the current user or another user from Firebase.
  if (authData) {
    var uid = getQueryVariable("uid");  // Parameter for viewing a user's profile.
    if (uid) {
      userId = uid;
      isSelf = false;
    } else {
      userId = authData.uid;
      isSelf = true;
    }

    tripId = getQueryVariable("tripid");

    ref.child("users").child(userId).once('value', function(dataSnapshot) {
      current_user = dataSnapshot.val();  // Object containing user data.
      photo = current_user.photo; // Save URL of photo to use in edit form.

      // If you're viewing your own profile page, then the current_user is yourself. Otherwise, the current_user is the
      // user whose profile you're viewing. If you're viewing your own profile, hide the "Chat" and "Favorite" button and you can see your last name.
      // If you're viewing another person's profile, hide the "Edit Profile" button and you can't see that person's last name.
      if (isSelf) {
        var user_menu_source_processed = user_menu_template({name: current_user.first_name}); // Set name for nav bar.
        $("#user-menu").html(user_menu_source_processed);

        // Add interested trips to profile.
        var interested_trips = [];
        var interested_trips_ids = current_user.interested_trips.split(", ");
        if (interested_trips_ids[0] == "") interested_trips_ids = [];

        // Add companioned trips to profile.
        var companioned_trips = [];
        var companioned_trips_ids = current_user.companioned_trips.split(", ");
        if (companioned_trips_ids[0] == "") companioned_trips_ids = [];

        var combined_trips_ids = interested_trips_ids.concat(companioned_trips_ids);
        var trip_map = {};

        if (combined_trips_ids.length > 0) {
          combined_trips_ids.forEach(function(tid, i) {
            ref.child("trips").child(tid).once('value', function(dataSnapshot) {
              var trip = dataSnapshot.val();
              trip.id_only = tid;

              ref.child("users").child(trip["creator_id"]).once('value', function(dataSnapshot) {
                var trip_creator = dataSnapshot.val();

                trip.creator_name = trip_creator.first_name;
                trip.creator_age = trip_creator.age;
                trip.creator_location = trip_creator.city;
                trip.creator_img_src = trip_creator.photo;   
                trip.creator_email = trip_creator.email; 
                trip.trip_name = trip.name;
                trip.num_companions = trip.companion_count;
                trip.interested_users = trip.interested_users;

                var cur_trip_stop_names = [];           
                var cur_trip_stops_latlng = [];     
                for (var s = 0; s < trip.stops.length; s++) {
                  cur_trip_stop_names.push(trip.stops[s].name);
                  cur_trip_stops_latlng.push({'lat': trip.stops[s].lat, 'lng': trip.stops[s].lng});
                }
                trip.planned_full_latlng = cur_trip_stops_latlng;
                trip.planned_full_route = cur_trip_stop_names;

                if (interested_trips.length < interested_trips_ids.length) {
                  interested_trips.push(trip);
                } else {
                  companioned_trips.push(trip);
                }

                trip_map[tid] = trip;

                if (interested_trips.length + companioned_trips.length == combined_trips_ids.length) {
                  current_user.interested_trips = interested_trips;
                  current_user.companioned_trips = companioned_trips;
                  $("#profile").html(user_template(current_user));  // Handlebars to set profile detail.

                  // Direct to the correct trip-details page when clicking on a trip in which you're on a companion.
                  $(".trip-link").click(function() {
                    var trip_id = $($(this)[0]).attr("id");
                    var clicked_trip = trip_map[trip_id];
                    localStorage.setItem('trip', JSON.stringify(clicked_trip));
                    this.href = "trip-details.html";
                    document.location.href = "trip-details.html";  
                  });

                  $("#email-button").hide();
                  $("#accept-button").hide();
                  $("#reject-button").hide();
                  $("#last-name").show();
          
                  // Initialize validation for later changes. Only need to do this if you're looking at your own profile.
                  $('#edit-profile-form').validator({});
                  $('#edit-profile-form').validator().on('invalid.bs.validator', function (e) {
                    isFormValid = false;
                    console.log("form invalid");
                  })
                  $('#edit-profile-form').validator().on('valid.bs.validator', function (e) {
                    isFormValid = true;
                    console.log("form valid");
                  })
                }
              });
            });
          });
        } else {
          $("#profile").html(user_template(current_user));  // Handlebars to set profile detail.
          $("#email-button").hide();
          $("#accept-button").hide();
          $("#reject-button").hide();
          $("#last-name").show();
          
          // Initialize validation for later changes. Only need to do this if you're looking at your own profile.
          $('#edit-profile-form').validator({});
          $('#edit-profile-form').validator().on('invalid.bs.validator', function (e) {
            isFormValid = false;
            console.log("form invalid");
          })
          $('#edit-profile-form').validator().on('valid.bs.validator', function (e) {
            isFormValid = true;
            console.log("form valid");
          })
        }
      } 
      else {
        // Viewing another person's profile. No need for profile edit validation.
        ref.child("users").child(authData.uid).once('value', function(dataSnapshot) {
          var user_menu_source_processed = user_menu_template({name: dataSnapshot.val().first_name}); // Set name for nav bar.
          $("#user-menu").html(user_menu_source_processed);
          $("#profile").html(user_template(current_user));  // Handlebars to set profile detail.
          $("#btn-edit-profile-details").hide(); 
          $("#interested-trips").hide();  // Don't show other users' interested trips.
          $("#companioned-trips").hide(); // Don't show other users' companioned trips.
          // If there's a trip id parameter passed in, then we're looking at an interested user whom we have to accept or reject for the trip.
          if (tripId) {
            $("#accept-button").show();
            $("#reject-button").show();
          }
        })
      }

      // Coming from the action where you accept a user as a companion for a trip.
      if (getQueryVariable("accept_feedback")) {
        $("#accept-button").hide();
        $("#reject-button").hide();
        $("#accept-feedback").show();
      }

      // Coming from the action where you reject a user as to be a companion.
      if (getQueryVariable("reject_feedback")) {
        $("#accept-button").hide();
        $("#reject-button").hide();
        $("#reject-feedback").show();  
      }

      // If this is a new user, prompt him/her to edit profile.
      if (getQueryVariable("edit-profile")) {
        $("#edit-profile-reminder").show();
        $("#profile-details, #edit-profile-container").toggle();  // Show the edit profile form.
        $('#btn-edit-profile-details').hide();
        $('#btn-edit-profile-save').show(); // Do not allow the user to move on until successfully saving profile details.
        $('#edit-profile-form').validator('validate');  // Make the empty boxes red to show an error.
      }
    });
  } else {
    document.location.href = "index.html";
  }

  // Clicking on Accept.
  $(document.body).on('click', '#accept-button', function() {
    // Remove userId from interested_users and add to companions for a Trip object in Firebase.
    // Remove tripId from interested_trips and add to companioned_trips for a User object in Firebase.
    ref.child("trips").child(tripId).once("value", function(dataSnapshot) {
      var trip = dataSnapshot.val();
      
      var interested_users = trip.interested_users.split(", ");
      var updated_interested_users = [];
      interested_users.forEach(function(uid, i) {
        if (uid != userId) updated_interested_users.push(uid);
      });
      updated_interested_users = updated_interested_users.join(", ");


      var updated_companions;
      if (trip.companions == "") {
        updated_companions = userId;
      } else {
        updated_companions = trip.companions + ", " + userId;
      }

      ref.child("trips").child(tripId).update({
        interested_users: updated_interested_users,
        companions: updated_companions
      });

      var interested_trips = current_user.interested_trips.split(", ");
      var updated_interested_trips = [];
      interested_trips.forEach(function(tid, i) {
        if (tid != tripId) updated_interested_trips.push(tid);
      });
      updated_interested_trips = updated_interested_trips.join(", ");

      var updated_companioned_trips;
      if (current_user.companioned_trips == "") {
        updated_companioned_trips = tripId;
      } else {
        updated_companioned_trips = current_user.companioned_trips + ", " + tripId;
      }

      ref.child("users").child(userId).update({
        interested_trips: updated_interested_trips,
        companioned_trips: updated_companioned_trips
      });

      document.location.href = "profile.html?uid="+userId+"&accept_feedback=true";
    })
  });

  // Clicking on Reject.
  $(document.body).on('click', '#reject-button', function() {
    // Remove userId from interested_users for a Trip object in Firebase.
    // Remove tripId from interested_trips for a User object in Firebase.
    ref.child("trips").child(tripId).once("value", function(dataSnapshot) {
      var trip = dataSnapshot.val();
      
      var interested_users = trip.interested_users.split(", ");
      var updated_interested_users = [];
      interested_users.forEach(function(uid, i) {
        if (uid != userId) updated_interested_users.push(uid);
      });
      updated_interested_users = updated_interested_users.join(", ");

      ref.child("trips").child(tripId).update({
        interested_users: updated_interested_users,
      });

      var interested_trips = current_user.interested_trips.split(", ");
      var updated_interested_trips = [];
      interested_trips.forEach(function(tid, i) {
        if (tid != tripId) updated_interested_trips.push(tid);
      });
      updated_interested_trips = updated_interested_trips.join(", ");

      ref.child("users").child(userId).update({
        interested_trips: updated_interested_trips,
      });

      document.location.href = "profile.html?uid="+userId+"&reject_feedback=true";
    })
  });

  // Clicking on Edit Profile or Cancel.
  $(document.body).on('click', '#btn-edit-profile-details', function() {
    if (!$("#edit-profile-container").is(":visible")) {
      $(this).text("Cancel");
      $('#btn-edit-profile-save').show();
    } else {
      $(this).text("Edit Profile");  
      $('#btn-edit-profile-save').hide();
      setOriginalProfileDetails();  // When clicking Cancel, revert the profile details back to the original.
      $('#edit-profile-form').validator('validate');  // Make the empty boxes red to show an error.
    }
    $("#profile-details, #edit-profile-container").toggle();
  });

  // Clicking on Save.
  $(document.body).on('click', '#btn-edit-profile-save', function() {
    if (isFormValid) {
      $("#edit-profile-reminder").hide(); // Remove the note to update profile upon first login.

      // Save data to Firebase.
      ref.child("users").child(authData.uid).update({
        first_name: $("#edit-profile-form-user-first-name").val(),
        last_name: $("#edit-profile-form-user-last-name").val(),
        gender: $("#edit-profile-form-user-gender").val(),
        age: $("#edit-profile-form-user-age").val(),
        city: $("#edit-profile-form-user-city").val(),
        occupation: $("#edit-profile-form-user-occupation").val(),
        about_me: $("#edit-profile-form-user-about-me").val(),
        six_things: $("#edit-profile-form-user-six-things").val(),
        best_places: $("#edit-profile-form-user-best-places").val()
        // photo for future?
      });
      
      document.location.href = "profile.html";  // Go to this page to avoid keeping the ?edit-profile=true 

      // The code below is needed only if we remove the line above - document.location.href = "profile.html"

      // Put this code before reloading the handlebars so that it can detect the elements.
      // $("#btn-edit-profile-details").text("Edit Profile");  
      // $(this).hide();
      // $("#profile-details, #edit-profile-container").toggle();

      // // Reload handlebars.
      // $("#profile").html(user_template({
      //   "first_name": $("#edit-profile-form-user-first-name").val(),
      //   "last_name": $("#edit-profile-form-user-last-name").val(),
      //   "gender": $("#edit-profile-form-user-gender").val(),
      //   "age": $("#edit-profile-form-user-age").val(),
      //   "city": $("#edit-profile-form-user-city").val(),
      //   "occupation": $("#edit-profile-form-user-occupation").val(),
      //   "about_me": $("#edit-profile-form-user-about-me").val(),
      //   "six_things": $("#edit-profile-form-user-six-things").val(),
      //   "best_places": $("#edit-profile-form-user-best-places").val(),
      //   "photo": photo
      // }));

      // Reset validation.
      // $('#edit-profile-form').validator({});
      // $('#edit-profile-form').validator().on('invalid.bs.validator', function (e) {
      //   isFormValid = false;
      //   console.log("form invalid");
      // })
      // $('#edit-profile-form').validator().on('valid.bs.validator', function (e) {
      //   isFormValid = true;
      //   console.log("form valid");
      // })
    }
  })

  function setOriginalProfileDetails() {
    $("#edit-profile-form-user-first-name").val(current_user.first_name);
    $("#edit-profile-form-user-last-name").val(current_user.last_name);    
    $("#edit-profile-form-user-gender").val(current_user.gender);
    $("#edit-profile-form-user-age").val(current_user.age);
    $("#edit-profile-form-user-city").val(current_user.city);
    $("#edit-profile-form-user-occupation").val(current_user.occupation);
    $("#edit-profile-form-user-about-me").val(current_user.about_me);
    $("#edit-profile-form-user-six-things").val(current_user.six_things);
    $("#edit-profile-form-user-best-places").val(current_user.best_places);
  }
});