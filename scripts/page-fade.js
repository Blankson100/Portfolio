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
