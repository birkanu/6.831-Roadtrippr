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


	$('#start-trip-form').validator({});
  $('#find-trip-form').validator({});

	$('#start-trip-form').validator().on('submit', function (e) {
		if (!e.isDefaultPrevented()) {
			e.preventDefault();
			var new_trip = {}
			new_trip.start_location = start_location;
			new_trip.end_location = end_location;
			new_trip.start_date = start_date;
			new_trip.end_date = end_date;
			new_trip.are_dates_flexible = $('#flexible-dates-checkbox').is(":checked") ? true : false;
			new_trip.companion_count = $("#start-trip-modal-companion-count option:selected").text();
			new_trip.notes = $('#start-trip-modal-notes').val();
			if (!start_location || !end_location) {
				$(".errorMessage").show();
			} else {
				localStorage.setItem('new_trip', JSON.stringify(new_trip));
				document.location.href = "views/share-new-trip.html";
			}
  		} 
	});
  
  $('#find-trip-form').validator().on('submit', function (e) {
      if (!e.isDefaultPrevented()) {
          e.preventDefault();
          var searched_trip = {}
          searched_trip.start_location = start_location_find_modal;
          searched_trip.end_location = end_location_find_modal;
          searched_trip.start_date = start_date_find_modal;
          searched_trip.end_date = end_date_find_modal;
          searched_trip.are_dates_flexible = $('#flexible-dates-checkbox-find-modal').is(":checked") ? true : false;
          if (!start_location_find_modal || !end_location_find_modal) {
              $(".errorMessage").show();
          } else {
              localStorage.setItem('searched_trip', JSON.stringify(searched_trip));
              document.location.href = "views/search-results.html";
          }
      } 
  });
    
});