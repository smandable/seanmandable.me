(function($) {
	"use strict"; // Start of use strict

	$(document).ready(function() {
		// Smooth scrolling using jQuery easing
		$('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {

			if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
				var target = $(this.hash);
				target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
				if (target.length) {
					$('html, body').animate({
						scrollTop: (target.offset().top - 72)
					}, 1000, "easeInOutExpo");
					return false;
				}
			}
		});

		// Closes responsive menu when a scroll trigger link is clicked
		$('.js-scroll-trigger').click(function() {
			$('.navbar-collapse').collapse('hide');
		});

		// Activate scrollspy to add active class to navbar items on scroll
		$('body').scrollspy({
			target: '#mainNav',
			offset: 75
		});

		// Collapse Navbar
		var navbarCollapse = function() {
			//console.log("in navbarCollapse");
			var mainNav = $("#mainNav");
			if (mainNav.length) {
				if ($("#mainNav").offset().top > 100) {
					$("#mainNav").addClass("navbar-scrolled");
				} else {
					$("#mainNav").removeClass("navbar-scrolled");
				}
			}
		};
		// Collapse now if page is not at top
		navbarCollapse();
		// Collapse the navbar when page is scrolled
		$(window).scroll(navbarCollapse);

		// Magnific popup calls

		$('#portfolio').magnificPopup({
			delegate: 'a',
			type: 'image',
			tLoading: 'Loading image #%curr%...',
			mainClass: 'mfp-img-mobile',
			gallery: {
				enabled: true,
				navigateByImgClick: true,
				preload: [0, 1] // Will preload 0 - before current, and 1 after the current image
			},
			image: {
				tError: '<a href="%url%">The image #%curr%</a> could not be loaded.',
				titleSrc: function(item) {
					return item.el.attr('title') + '<small>Sean Mandable</small>';
				}
			}
		});


		$("#resume a").click(function(event) {
			event.preventDefault();
			// var targetID = $(this);
			// var elementPosition = $(targetID).offset();
			// var div = document.getElementById("top-row");
			// var elementPosition = div.getBoundingClientRect();
			// $('#myElement')[0].getBoundingClientRect().top
			//	console.log("elementPosition: ", elementPosition);

			// $("#resume .row:first-of-type").slideUp("slow", function() {
			// 	// event.preventDefault();
			// 	// Animation complete.
			// });
			// $("#resume #hidden-row").css("display", "block");
			// $("#resume .row:nth-of-type(3)").slideDown("slow", function() {
			// 	// event.preventDefault();
			// 	// Animation complete.
			// });
			//$(window).scrollTop($('#contact').offset().top);

			// $(window).stop(true).scrollTo(this.hash {
			// 	duration: 1000,
			// 	interrupt: true,
			// 	offset: -50
			// });

			$(window).scrollTop($('#resume a').offset().top - 45); // works w/o animation


			// $(window).animate({
			// 	scrollTop: $(this).offset().top - 45
			// }, 'slow');
			// var $target = $('html,body');
			// $target.animate({
			// 	scrollTop: $target.height()
			// }, 500);
			// $("#resume #hidden-row").css("display", "block");
			$("#resume #hidden-row").toggle();
		});

		// $('#resume #hidden-row').magnificPopup({
		// 	delegate: 'a',
		// 	type: 'image',
		// 	tLoading: 'Loading image #%curr%...',
		// 	mainClass: 'mfp-img-mobile',
		// 	gallery: {
		// 		enabled: true,
		// 		navigateByImgClick: true,
		// 		preload: [0, 1] // Will preload 0 - before current, and 1 after the current image
		// 	},
		// 	image: {
		// 		tError: '<a href="%url%">The image #%curr%</a> could not be loaded.',
		// 		titleSrc: function(item) {
		// 			return item.el.attr('title') + '<small>Sean Mandable</small>';
		// 		}
		// 	}
		// });


	});
})(jQuery); // End of use strict