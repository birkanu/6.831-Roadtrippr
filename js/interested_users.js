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

  var current_road_trip_indices = localStorage.getItem("current_road_trip_indices").split(",");
  var interested_road_trips = "";

  for (var i = 0; i < current_road_trip_indices.length; i++) {
    var interested_road_trip = road_trips[parseInt(current_road_trip_indices[i])];
    interested_road_trips = interested_road_trips + interested_road_trip["trip_name"];
    if ( (i != current_road_trip_indices.length-1) && (current_road_trip_indices.length > 1)) {
      interested_road_trips += ", ";
    }
  }

  $(".interested_road_trip").html(interested_road_trips);

  $('#media').carousel({
    pause: true,
    interval: false,
  });

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

});