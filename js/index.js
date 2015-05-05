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
	$('#login-modal').on('shown.bs.modal', function() {
		$("#login-email").focus();
	});
	$('#signup-modal').on('shown.bs.modal', function() {
		$("#signup-first-name").focus();
	});	
	$(window).on('resize', centerModals);

	$('#login-form').validator({});
  	$('#signup-form').validator({});

  	var newUser = false;

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
					$(".signupSuccessMessage").hide();
					$(".loginErrorMessage").show();
				} else {
					$(".loginErrorMessage").hide();
					if (newUser) {
						document.location.href = "views/profile.html?edit-profile=true";
					} else {
						document.location.href = "landing.html";
					}
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
			// Create new user in Firebase
			ref.createUser({
				email: email,
				password: password
			}, function(error, userData) {
				if (error) {
					$(".signupErrorMessage").show();
				} else {
					$(".signupErrorMessage").hide();
					$('#signup-modal').modal('hide');
					newUser = true;
					// Save user to Firebase
					ref.child("users").child(userData.uid).set({
						first_name: first_name,
						last_name: last_name,	
						email: email,
						password: password,
						gender: '',
						age: '',
						city: '',
						occupation: '',
						photo: 'http://im4249.noticiadahora.net/img/users/default.png',
						about_me: '',
						six_things: '',
						best_places: '',
						trips: '',
						interested_trips: '',
						companioned_trips: ''
					});
					$(".signupSuccessMessage").show();
					$('#login-modal').modal('show');
				}
			});
		} 
  	});
    
});