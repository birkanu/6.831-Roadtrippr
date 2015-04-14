$(document).ready(function() {

  var user_source = $(".container").html();
  var user_template = Handlebars.compile(user_source);

  var current_user = users[parseInt(localStorage.getItem('current_user_index'))];
  $(".container").html(user_template(current_user));

});