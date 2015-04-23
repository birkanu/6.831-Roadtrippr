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
  
  var user_source = $(".container").html();
  var user_template = Handlebars.compile(user_source);

  var user = getQueryVariable("user");
  if (user) {
    var current_user = users[parseInt(user)];
  } else {
    var current_user = users[parseInt(localStorage.getItem('current_user_index'))];
  }
  $(".container").html(user_template(current_user));



  $('#edit-profile-form').validator({});
  var isFormValid;
  $('#edit-profile-form').validator().on('invalid.bs.validator', function (e) {
    isFormValid = false;
    console.log("form invalid");
  })
  $('#edit-profile-form').validator().on('valid.bs.validator', function (e) {
    isFormValid = true;
    console.log("form valid");
  })

  $('#btn-edit-profile-details').click(function() {
    if (!$("#edit-profile-container").is(":visible")) {
      $(this).text("Cancel");
      $('#btn-edit-profile-save').show();
    } else {
      $(this).text("Edit Profile");  
      $('#btn-edit-profile-save').hide();
      setProfileDetails();
    }
    $("#profile-details, #edit-profile-container").toggle();
  });

  $("#btn-edit-profile-save").click(function() {
    if (isFormValid) {
      var first_name = $("#edit-profile-form-user-first-name").val();
      var last_name = $("#edit-profile-form-user-last-name").val();
      var gender = $("#edit-profile-form-user-gender").val();
      var age = $("#edit-profile-form-user-age").val();
      var city = $("#edit-profile-form-user-city").val();
      var occupation = $("#edit-profile-form-user-occupation").val();
      var about_me = $("#edit-profile-form-user-about-me").val();
      var six_things = $("#edit-profile-form-user-six-things").val();
      var best_places = $("#edit-profile-form-user-best_places").val();
      $("#btn-edit-profile-details").text("Edit Profile");  
      $(this).hide();
      $("#profile-details, #edit-profile-container").toggle();
    }
  })

  function setProfileDetails() {
    $("#edit-profile-form-user-first-name").val($("#first-name").contents()[0].data);
    $("#edit-profile-form-user-last-name").val($("#last-name").text());    
    $("#edit-profile-form-user-gender").val($("#gender").text());
    $("#edit-profile-form-user-age").val($("#age").text());
    $("#edit-profile-form-user-city").val($("#city").text());
    $("#edit-profile-form-user-occupation").val($("#occupation").text());
    $("#edit-profile-form-user-about-me").val($("#about-me").text());
    $("#edit-profile-form-user-six-things").val($("#six-things").text());
    $("#edit-profile-form-user-best-places").val($("#best-places").text());
  }

});