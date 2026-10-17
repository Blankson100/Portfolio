// A blur crossfade between pages: the old page blurs and fades out while the new one comes
// in from a blur. Browsers that crossfade pages themselves (Chrome, Edge, Safari 18.2+) do it
// from the @view-transition rule in BB.css for every move between pages; the new page must
// show from its first frame for that, so it's marked here, in <head>, before anything is
// drawn. Other browsers fade and blur the page out on the way out and in on arrival.
(function () {
    const crossFade = 'CSSViewTransitionRule' in window;
    if (crossFade) document.documentElement.classList.add('page-crossfade');

    function fadeIn() {
        document.body.classList.remove('page-leaving');
        document.body.classList.add('page-loaded');
    }

    // pageshow fires on every view of the page, including back/forward-cache
    // restores (where DOMContentLoaded never fires again) - this keeps
    // forward and back navigation equally smooth.
    window.addEventListener('pageshow', fadeIn);

    // Switching between light and dark opens the same page in the other mode; it carries on
    // where the reader was instead of starting from the top. Pressing a mode switch notes the
    // place, and the other mode's page goes straight there once it's laid out (and again
    // when its images have loaded, unless the reader has scrolled by then).
    const MODE_PLACE = 'modeSwitchPlace';
    const samePage = path => path.split('/').pop().toLowerCase().replace(/(dark|-light|-dark)(?=\.html$)/, '');
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.mode-btn, .m-mode')) return;
        try {
            sessionStorage.setItem(MODE_PLACE, JSON.stringify({ page: samePage(location.pathname), y: window.scrollY, at: Date.now() }));
        } catch (err) { /* storage blocked: the page starts at the top as before */ }
    }, true);
    let place = null;
    try {
        place = JSON.parse(sessionStorage.getItem(MODE_PLACE));
        sessionStorage.removeItem(MODE_PLACE);
    } catch (err) { /* nothing noted */ }
    if (place && place.y > 0 && place.page === samePage(location.pathname) && Date.now() - place.at < 15000) {
        let moved = false;
        const goBack = function () { window.scrollTo({ top: place.y, behavior: 'instant' }); };
        ['wheel', 'touchstart', 'keydown'].forEach(function (type) {
            window.addEventListener(type, function () { moved = true; }, { once: true, passive: true });
        });
        document.addEventListener('DOMContentLoaded', goBack);
        window.addEventListener('load', function () { if (!moved) goBack(); });
    }

    window.fadeNavigate = function (href) {
        // The browser's own crossfade works off the page's real last frame, so fading it
        // out first would only blank what it captures.
        if (crossFade) {
            window.location.href = href;
            return;
        }
        document.body.classList.remove('page-loaded');
        document.body.classList.add('page-leaving');
        setTimeout(function () {
            window.location.href = href;
        }, 250);
    };

    // Without the browser's crossfade, links to other pages of the site go through the fade
    // (the menu, project rows, cards). Left alone: new tabs, downloads, other sites, email
    // links, and jumps within the page.
    document.addEventListener('click', function (e) {
        if (crossFade || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const link = e.target.closest('a[href]');
        if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
        const url = new URL(link.href, window.location.href);
        if (url.origin !== window.location.origin || (url.pathname === window.location.pathname && url.hash)) return;
        e.preventDefault();
        window.fadeNavigate(link.getAttribute('href'));
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
