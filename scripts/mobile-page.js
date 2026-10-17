// The phone project pages (built by tools/build-case-studies.js): the moon/sun switch and
// Back, both pinned at the top.
// - The switch changes mode in place with the blur crossfade, so Listen keeps talking and the
//   place stays. The address becomes the other mode's page (body data-light-page /
//   data-dark-page); links and images with data-light / data-dark follow the mode.
// - Back goes straight back when it leads where we came from (that page opens where it was
//   left), otherwise to its address.
// - Once the page scrolls under them, a soft disc fades in behind both.
(function () {
    const body = document.body, btn = document.querySelector('.m-mode'), back = document.querySelector('.m-back');
    const ICON = {
        moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a6.6 6.6 0 0 0 10.7 10.7z"/></svg>',
        sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/></svg>',
    };

    if (btn) {
        btn.addEventListener('click', function () {
            const dark = !body.classList.contains('dark-mode');
            function apply() {
                body.classList.toggle('dark-mode', dark);
                btn.innerHTML = dark ? ICON.sun : ICON.moon;
                btn.setAttribute('aria-label', 'Switch to ' + (dark ? 'light' : 'dark') + ' mode');
                document.querySelectorAll('a[data-light]').forEach(function (a) { a.setAttribute('href', dark ? a.dataset.dark : a.dataset.light); });
                document.querySelectorAll('img[data-light]').forEach(function (img) { img.src = dark ? img.dataset.dark : img.dataset.light; });
                history.replaceState(history.state, '', (dark ? body.dataset.darkPage : body.dataset.lightPage) + location.search + location.hash);
                document.dispatchEvent(new Event('modechange'));
            }
            if (document.startViewTransition) document.startViewTransition(apply);
            else apply();
        });
    }

    if (back) {
        back.addEventListener('click', function (e) {
            const from = document.referrer.split(/[?#]/)[0].split('/').pop();
            if (from && from === back.getAttribute('href').split('#')[0]) { e.preventDefault(); history.back(); }
        });
    }

    function update() {
        const floating = window.scrollY > 8;
        if (btn) btn.classList.toggle('is-floating', floating);
        if (back) back.classList.toggle('is-floating', floating);
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
})();
