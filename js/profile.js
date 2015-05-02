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
  var isSelf = true;

  // Get the current user or another user from Firebase.
  if (authData) {
    var user = authData.uid;
    var uid = getQueryVariable("uid");
    if (uid) {
      user = uid;
      isSelf = false;
    }
    ref.child("users").child(user).once('value', function(dataSnapshot) {
      current_user = dataSnapshot.val();  // Object containing user data.
      $("#profile").html(user_template(current_user));  // Handlebars to set profile detail.
      photo = current_user.photo; // Save URL of photo to use in edit form.

      // If you're viewing your own profile page, then the current_user is yourself. Otherwise, the current_user is the
      // user whose profile you're viewing. If you're viewing your own profile, hide the "Chat" and "Favorite" button.
      // If you're viewing another person's profile, hide the "Edit Profile" button.
      if (isSelf) {
        var user_menu_source_processed = user_menu_template({name: current_user.first_name}); // Set name for nav bar.
        $("#user-menu").html(user_menu_source_processed);
        $("#chat-button").hide();
        $("#favorite-button").hide();
      } else {
        ref.child("users").child(authData.uid).once('value', function(dataSnapshot) {
          var user_menu_source_processed = user_menu_template({name: dataSnapshot.val().first_name}); // Set name for nav bar.
          $("#user-menu").html(user_menu_source_processed);
          $("#btn-edit-profile-details").hide();
        })
      }

      // If this is a new user, prompt him/her to edit profile.
      var edit_profile = getQueryVariable("edit-profile");
      if (edit_profile) {
        $("#edit-profile-reminder").show();
        $("#profile-details, #edit-profile-container").toggle();  // Show the edit profile form.
        $('#btn-edit-profile-details').hide();
        $('#btn-edit-profile-save').show(); // Do not allow the user to move on until successfully saving profile details.
        $('#edit-profile-form').validator('validate');  // Make the empty boxes red to show an error.
      }

      // Initialize validation for later changes. Only need to do this if you're looking at your own profile.
      if (isSelf) {
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
  } else {
    document.location.href = "index.html";
  }

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