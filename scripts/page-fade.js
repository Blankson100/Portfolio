// Smooth fade between page navigations (nav menu + light/dark mode toggle)
(function () {
    function fadeIn() {
        document.body.classList.remove('page-leaving');
        document.body.classList.add('page-loaded');
    }

    // pageshow fires on every view of the page, including back/forward-cache
    // restores (where DOMContentLoaded never fires again) - this keeps
    // forward and back navigation equally smooth.
    window.addEventListener('pageshow', fadeIn);

    window.fadeNavigate = function (href) {
        // Modern Chromium handles the cross-page crossfade natively (see the
        // @view-transition rule in BB.css) and does it off the real last
        // frame, so a manual opacity fade first would just blank the page
        // before that capture happens. Only fall back to the manual fade on
        // browsers without that support.
        if (document.startViewTransition) {
            window.location.href = href;
            return;
        }
        document.body.classList.remove('page-loaded');
        document.body.classList.add('page-leaving');
        setTimeout(function () {
            window.location.href = href;
        }, 120);
    };

    document.addEventListener('click', function (e) {
        const link = e.target.closest('.nav-menu a');
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href) return;
        e.preventDefault();
        window.fadeNavigate(href);
    });

    // Backspace = the page's Back button where there is one (case studies),
    // otherwise up to Home in the current mode. Browser history is avoided on
    // purpose: mode switches add entries, so it would bounce between modes.
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Backspace' || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
        const el = document.activeElement;
        if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
        if (typeof window.smartBack === 'function') {
            e.preventDefault();
            window.smartBack();
            return;
        }
        if (/\/(bb(dark)?|portfolio-mobile-(light|dark))\.html$/i.test(window.location.pathname)) return;
        e.preventDefault();
        window.fadeNavigate(document.body.classList.contains('dark-mode') ? 'BBDark.html' : 'BB.html');
    });
})();
