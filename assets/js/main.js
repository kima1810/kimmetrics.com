/*
	Editorial by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var	$window = $(window),
		$head = $('head'),
		$body = $('body');

	// Breakpoints.
		breakpoints({
			xlarge:   [ '1281px',  '1680px' ],
			large:    [ '981px',   '1280px' ],
			medium:   [ '737px',   '980px'  ],
			small:    [ '481px',   '736px'  ],
			xsmall:   [ '361px',   '480px'  ],
			xxsmall:  [ null,      '360px'  ],
			'xlarge-to-max':    '(min-width: 1681px)',
			'small-to-xlarge':  '(min-width: 481px) and (max-width: 1680px)'
		});

	// Stops animations/transitions until the page has ...

		// ... loaded.
			$window.on('load', function() {
				window.setTimeout(function() {
					$body.removeClass('is-preload');
				}, 100);
			});

		// ... stopped resizing.
			var resizeTimeout;

			$window.on('resize', function() {

				// Mark as resizing.
					$body.addClass('is-resizing');

				// Unmark after delay.
					clearTimeout(resizeTimeout);

					resizeTimeout = setTimeout(function() {
						$body.removeClass('is-resizing');
					}, 100);

			});

	// Fixes.

		// Object fit images.
			if (!browser.canUse('object-fit')
			||	browser.name == 'safari')
				$('.image.object').each(function() {

					var $this = $(this),
						$img = $this.children('img');

					// Hide original image.
						$img.css('opacity', '0');

					// Set background.
						$this
							.css('background-image', 'url("' + $img.attr('src') + '")')
							.css('background-size', $img.css('object-fit') ? $img.css('object-fit') : 'cover')
							.css('background-position', $img.css('object-position') ? $img.css('object-position') : 'center');

				});

	// Sidebar
		function initSidebar() {
			var $sidebar = $('#sidebar'),
				$sidebar_inner = $sidebar.children('.inner');

			if ($sidebar.length === 0) return;

			// Inactive by default on <= large.
			breakpoints.on('<=large', function() {
				$sidebar.addClass('inactive');
			});

			breakpoints.on('>large', function() {
				$sidebar.removeClass('inactive');
			});

			// Chrome/Android scrollbar bug fix.
			if (browser.os == 'android' && browser.name == 'chrome') {
				$('<style>#sidebar .inner::-webkit-scrollbar { display: none; }</style>').appendTo($head);
			}

			// Add toggle if missing
			if ($sidebar.find('.toggle').length === 0) {
				$('<a href="#sidebar" class="toggle">Toggle</a>')
					.appendTo($sidebar)
					.on('click', function(event) {
						event.preventDefault();
						event.stopPropagation();
						$sidebar.toggleClass('inactive');
					});
			}

			// Link clicks
			$sidebar.off('click.link').on('click.link', 'a', function(event) {
				if (breakpoints.active('>large')) return;

				var $a = $(this),
					href = $a.attr('href'),
					target = $a.attr('target');

				event.preventDefault();
				event.stopPropagation();

				if (!href || href == '#' || href == '') return;

				$sidebar.addClass('inactive');

				setTimeout(function() {
					if (target == '_blank') window.open(href);
					else window.location.href = href;
				}, 500);
			});

			// Stop bubbling
			$sidebar.off('click touchend touchstart touchmove.sidebar')
				.on('click touchend touchstart touchmove.sidebar', function(event) {
					if (breakpoints.active('>large')) return;
					event.stopPropagation();
				});

			// Hide sidebar on body click/tap
			$body.off('click touchend.sidebar').on('click touchend.sidebar', function(event) {
				if (breakpoints.active('>large')) return;
				$sidebar.addClass('inactive');
			});

			// Scroll lock
			$window.off('.sidebar-lock').on('load.sidebar-lock', function() {
				var sh, wh, st;

				if ($window.scrollTop() == 1)
					$window.scrollTop(0);

				$window
					.on('scroll.sidebar-lock', function() {
						var x, y;
						if (breakpoints.active('<=large')) {
							$sidebar_inner.data('locked', 0).css({ position: '', top: '' });
							return;
						}
						x = Math.max(sh - wh, 0);
						y = Math.max(0, $window.scrollTop() - x);

						if ($sidebar_inner.data('locked') == 1) {
							if (y <= 0)
								$sidebar_inner.data('locked', 0).css({ position: '', top: '' });
							else
								$sidebar_inner.css('top', -1 * x);
						} else {
							if (y > 0)
								$sidebar_inner.data('locked', 1).css({ position: 'fixed', top: -1 * x });
						}
					})
					.on('resize.sidebar-lock', function() {
						wh = $window.height();
						sh = $sidebar_inner.outerHeight() + 30;
						$window.trigger('scroll.sidebar-lock');
					})
					.trigger('resize.sidebar-lock');
			});
		}

		// Initial sidebar setup (for hardcoded pages)
		initSidebar();

		// Make it accessible globally for loadPartials.js
		window.initSidebar = initSidebar;


	// Menu.
		var $menu = $('#menu'),
			$menu_openers = $menu.children('ul').find('.opener');

		// Openers.
			$menu_openers.each(function() {

				var $this = $(this);

				$this.on('click', function(event) {

					// Prevent default.
						event.preventDefault();

					// Toggle.
						$menu_openers.not($this).removeClass('active');
						$this.toggleClass('active');

					// Trigger resize (sidebar lock).
						$window.triggerHandler('resize.sidebar-lock');

				});

			});

})(jQuery);