$(document).ready(function() {

	var ref = new Firebase("https://shining-fire-2402.firebaseio.com");

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

			ref.authWithPassword({
				email    : email,
				password : password
			}, function(error, authData) {
				if (error) {
					$(".loginErrorMessage").show();
				} else {
					$(".loginErrorMessage").hide();
					document.location.href = "landing.html";
				}
			});
		} 
	});
  
  	$('#signup-form').validator().on('submit', function (e) {
		if (!e.isDefaultPrevented()) {
			e.preventDefault();
			var first_name = $('#signup-first-name').val();
			var last_name = $('#signup-last-name').val();
			var email = $('#signup-email').val();
			var password = $('#signup-password').val();

			ref.createUser({
				first_name: first_name,
				last_name: last_name,	
				email: email,
				password: password
			}, function(error, userData) {
				if (error) {
					console.log(error);
					$(".signupErrorMessage").show();
				} else {
					$(".signupErrorMessage").hide();
					$('#signup-modal').modal('hide');
					$(".signupSuccessMessage").show();
					$('#login-modal').modal('show');
				}
			});
		} 
  	});
    
});