$(document).ready(function() {

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


	$('#login-form').validator({});
  $('#signup-form').validator({});

	$('#login-form').validator().on('submit', function (e) {
		if (!e.isDefaultPrevented()) {
			e.preventDefault();
      var email = $('#login-email').val();
      var password = $('#login-password').val();  
			// if (!start_location || !end_location) {
			// 	$(".errorMessage").show();
			// } else {
			// 	localStorage.setItem('new_trip', JSON.stringify(new_trip));
			// 	document.location.href = "views/share-new-trip.html";
			// }
  	} 
	});
  
  $('#signup-form').validator().on('submit', function (e) {
      if (!e.isDefaultPrevented()) {
        e.preventDefault();
        var first_name = $('#signup-first-name').val();
        var last_name = $('#signup-last-name').val();
        var email = $('#signup-email').val();
        var password = $('#signup-password').val();
        // if (!start_location_find_modal || !end_location_find_modal) {
        //     $(".errorMessage").show();
        // } else {
        //     localStorage.setItem('searched_trip', JSON.stringify(searched_trip));
        //     document.location.href = "views/search-results.html";
        // }
      } 
  });
    
});