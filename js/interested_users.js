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

  // Break interested users into groups of 3 for the carousel.
  var num_user_groups = Math.ceil(users_idx.length/3);
  for (var i = 0; i < num_user_groups; i++) {
    var data;
    if (users_idx.length % 3 == 1) {
      data = [ users[users_idx[i*3]] ];
    } 
    else if (users_idx.length % 3 == 2) {
      data = [ users[users_idx[i*3]], users[users_idx[i*3+1]] ];
    } 
    else {
      data = [ users[users_idx[i*3]], users[users_idx[i*3+1]], users[users_idx[i*3+2]] ];
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
  $("#modal-container").html(user_modal_template({users: users}));

  $('#media').carousel({
    pause: true,
    interval: false,
  });

});