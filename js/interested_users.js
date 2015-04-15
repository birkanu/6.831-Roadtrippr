$(document).ready(function() {

  var user_source = $(".carousel-inner").html();
  var user_template = Handlebars.compile(user_source);

  var current_user_index = parseInt(localStorage.getItem('current_user_index'));
  var users_idx = []; // Interested users.

  // Choose 3 random users to be in the list of interested users.
  for (var i = 0; i < 3; i++) {
    var random_user_index = Math.floor(Math.random()*users.length);
    while ( (random_user_index == current_user_index) || (users_idx.indexOf(random_user_index) != -1) ) {
      random_user_index = Math.floor(Math.random()*users.length);
    }
    users_idx.push(random_user_index);
  }

  var interested_users = [];
  for (var i = 0; i < users_idx.length; i++) {
    var idx = users_idx[i];
    interested_users.push(users[idx]);
  }

  // Break interested users into groups of 3 for the carousel.
  var num_user_groups = Math.ceil(users_idx.length/3);
  for (var i = 0; i < num_user_groups; i++) {
    var data;
    if (interested_users.length % 3 == 1) {
      data = [ interested_users[i*3] ];
    } 
    else if (interested_users.length % 3 == 2) {
      data = [ interested_users[i*3], interested_users[i*3+1] ];
    } 
    else {
      data = [ interested_users[i*3], interested_users[i*3+1], interested_users[i*3+2] ];
    }

    if (i == 0) {
      $(".carousel-inner").html(user_template({users: data}));
      $(".item").addClass("active");
    } 
    else {
      $(".carousel-inner").append(user_template({users: data}));
    }
  }

  var user_modal_source = $("#modal-container").html();
  var user_modal_template = Handlebars.compile(user_modal_source);
  $("#modal-container").html(user_modal_template({users: interested_users}));

  // Don't show the left and right arrows for the slideshow if we don't have enough groups.
  if (num_user_groups < 2) {
    $(".carousel-control").hide();
  }

  var interested_road_trip = road_trips[localStorage.getItem('current_road_trip_index')];
  $(".interested_road_trip").html(interested_road_trip["trip_name"]);

  $('#media').carousel({
    pause: true,
    interval: false,
  });

});