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

  // var current_road_trip_indices = localStorage.getItem("current_road_trip_indices").split(",");
  // var interested_road_trips = "";

  // for (var i = 0; i < current_road_trip_indices.length; i++) {
  //   var interested_road_trip = road_trips[parseInt(current_road_trip_indices[i])];
  //   interested_road_trips = interested_road_trips + interested_road_trip["trip_name"];
  //   if ( (i != current_road_trip_indices.length-1) && (current_road_trip_indices.length > 1)) {
  //     interested_road_trips += ", ";
  //   }
  // }

  // $(".interested_road_trip").html(interested_road_trips);

  var current_trip_idx = parseInt(getQueryVariable("trip_index")); // Get this parameter from the My Trips page
  $("#trip_name").html(road_trips[current_trip_idx]["trip_name"]);
  var current_user_index = parseInt(localStorage.getItem('current_user_index'));
  var user_source = $(".carousel-inner").html();
  var user_template = Handlebars.compile(user_source);
  
  var interested_users = [];

  users.forEach(function(user, user_idx) {
    if (user_idx != current_user_index) {
      var interested_trips = user["interested_trips"].split(","); // ex. ["0","1"]
      interested_trips.forEach(function(trip_idx, i) {
        trip_idx = parseInt(trip_idx);
        if (trip_idx == current_trip_idx) {
          interested_users.push(user);
        }
      });
    }
  });

  // Break interested users into groups of 3 for the carousel.
  var num_user_groups = Math.ceil(interested_users.length/3);
  var users_left = interested_users.length;
  for (var i = 0; i < num_user_groups; i++) {
    var data;
    if (users_left >= 3) {
      data = [ interested_users[i*3], interested_users[i*3+1], interested_users[i*3+2] ];
      users_left -= 3;
    }
    else if (users_left == 1) {
      data = [ interested_users[i*3] ];
      users_left -= 1;
    } 
    else if (users_left == 2) {
      data = [ interested_users[i*3], interested_users[i*3+1] ];
      users_left -= 2;
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

  /////////////////////////////////////////////////
  // var current_road_trip_indices = localStorage.getItem("current_road_trip_indices").split(","); // ex. ["0","1","2"]
  // current_road_trip_indices.forEach(function(val, i) {
  //   current_road_trip_indices[i] = parseInt(val);
  // });

  // console.log("current_road_trip_indices: " + current_road_trip_indices);

  // var trips_to_users = {};  // Maps trip indices to list of interested user indices
  // users.forEach(function(user, user_idx) {
  //   if (user_idx != localStorage.getItem("current_user_index")) {
  //     var interested_trips = user["interested_trips"].split(","); // ex. ["0","1"]
  //     interested_trips.forEach(function(trip_idx, i) {
  //       trip_idx = parseInt(trip_idx);
  //       if (current_road_trip_indices.indexOf(trip_idx) != -1) {
  //         // Add the user to list of users for the trip_idx
  //         if (trip_idx in trips_to_users) {
  //           trips_to_users[trip_idx].push(user_idx);
  //         } else {
  //           trips_to_users[trip_idx] = [user_idx];
  //         }
  //       }
  //     });
  //   }
  // });

  // for (var trip_idx in trips_to_users) {
  //   console.log(trip_idx + ": " + trips_to_users[trip_idx]);
  // }

  // ////////////////////////////////////////////////////////////////////////////////
  // for (var trip_idx in trips_to_users) {
  //   var user_indices = trips_to_users[trip_idx];

  //   var user_source = $("#media").html();
  //   var user_template = Handlebars.compile(user_source);

  //   var interested_users = [];
  //   user_indices.forEach(function(user_idx, i) {
  //     interested_users[i] = users[user_idx];
  //   });


  //   var trip_group = "<div class='carousel-inner'>";
  //   // Break interested users into groups of 3 for the carousel.
  //   var num_user_groups = Math.ceil(interested_users.length/3);
  //   for (var i = 0; i < num_user_groups; i++) {
  //     var data;
  //     if (interested_users.length % 3 == 1) {
  //       data = [ interested_users[i*3] ];
  //     } 
  //     else if (interested_users.length % 3 == 2) {
  //       data = [ interested_users[i*3], interested_users[i*3+1] ];
  //     } 
  //     else {
  //       data = [ interested_users[i*3], interested_users[i*3+1], interested_users[i*3+2] ];
  //     }

  //     trip_group += user_template({users: data});
  //     if (i == 0) {
  //       $(".item").addClass("active");
  //     } 
  //   }

  //   if (trip_idx == 0) {
  //     $("#media").empty();
  //   }
  //   $("#media").append(trip_group += "</div>"); 

  //   var user_modal_source = $("#modal-container").html();
  //   var user_modal_template = Handlebars.compile(user_modal_source);
  //   if (trip_idx == 0) {
  //     $("#modal-container").html(user_modal_template({users: interested_users}));  
  //   } else {
  //     $("#modal-container").append(user_modal_template({users: interested_users}));  
  //   } 
  // }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  // Don't show the left and right arrows for the slideshow if we don't have enough groups.
  if (num_user_groups < 2) {
    $(".carousel-control").hide();
  }

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