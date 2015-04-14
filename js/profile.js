$(document).ready(function() {

  var user_source = $(".container").html();
  var user_template = Handlebars.compile(user_source);

  var random_user = users[Math.floor(Math.random()*users.length)];
  $(".container").html(user_template(random_user));

});