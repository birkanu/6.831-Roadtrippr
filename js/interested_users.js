$(document).ready(function() {

  var user_source = $(".carousel-inner").html();
  var user_template = Handlebars.compile(user_source);

  var num_user_groups = Math.ceil(users.length/3);
  for (var i = 0; i < num_user_groups; i++) {
    var data;
    if (i != num_user_groups-1) {
      data = [users[i*3], users[i*3+1], users[i*3+2]];
    } else if (users.length % 3 == 1) {
      data = [users[i*3]];
    } else {  // users.length % 3 == 2
      data = [users[i*3], users[i*3+1]];
    }
    if (i == 0) {
      $(".carousel-inner").html(user_template({users: data}));
      $(".item").addClass("active");
    } else {
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