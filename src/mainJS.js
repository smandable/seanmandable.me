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
			$(window).scrollTop($('#resume a').offset().top - 45); // works w/o animation

			if ($(this).attr('id') == 'resumePDF') {
				console.log('resumePDF');
				$('#item-to-display object').attr('data', '../assets/pdf/Sean_Mandable_Resume.pdf#toolbar=1');
			}
			if ($(this).attr('id') == 'coverLetter') {
				console.log('coverLetter');
				$('#item-to-display object').attr('data', '../assets/pdf/Sean_Mandable_Cover_Letter.pdf#toolbar=1');
			}
			if ($(this).attr('id') == 'codeSamples') {
				console.log('codeSamples');
				$('#item-to-display object').attr('data', '../assets/pdf/Sean_Mandable_CS.pdf#toolbar=1');
			}
			if ($(this).attr('id') == 'qa') {
				console.log('qa');
				$('#item-to-display object').attr('data', '../assets/pdf/Sean_Mandable_QA.pdf#toolbar=1');
			}


			$("#resume #hidden-row").show();
		});

		// Collapse #hidden-row when page is scrolled
		//$(window).scroll($("#resume #hidden-row").hide());

	});
})(jQuery); // End of use strict
