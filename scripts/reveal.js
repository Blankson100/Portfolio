// The page's blocks fade in one after another, sharpening from a slight blur: the ones on
// the first screen in order from the top, the rest as they're scrolled to. Only opacity and
// blur change, so nothing moves and the stickers' placement isn't thrown off. Skipped when
// switching light/dark, coming back with the browser's Back button, or with reduced motion.
// Loaded in <head> before scripts/page-fade.js (which uses up the light/dark note), and
// BB.css keeps each block hidden while html has .reveal-pending, until it gets .reveal-seen.
(function () {
    const SEL = [
        '.project-sidebar',
        '.profile-header', '.intro-sub', '.featured-content-box > .grid-container > a',
        '.about-inner > :not(.about-paragraphs)', '.about-paragraphs > *',
        '.projects-btn', '.project-row',
        '.project-main > :not(script)',
        '.m-main > :not(.m-bio):not(.m-projects):not(.m-pause)', '.m-bio > *', '.m-projects > .m-heading', '.m-list > *',
    ].join(', ');
    const STEP = 70, MAX_STEPS = 8;
    const KEYS = [{ opacity: 0, filter: 'blur(8px)' }, { opacity: 1, filter: 'blur(0px)' }];
    const TIMING = { duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' };

    let switching = false;
    try {
        const note = JSON.parse(sessionStorage.getItem('modeSwitchPlace'));
        switching = !!note && Date.now() - note.at < 15000;
    } catch (e) { /* nothing noted */ }
    const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    const back = nav && nav.type === 'back_forward';
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (switching || back || still || !window.IntersectionObserver || !Element.prototype.animate) return;

    const root = document.documentElement;
    root.classList.add('reveal-pending');
    function giveUp() { root.classList.remove('reveal-pending'); }

    // The rest fade in as they come into view, a little apart when several arrive at once.
    const seen = new IntersectionObserver(function (entries) {
        let n = 0;
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            seen.unobserve(el);
            el.animate(KEYS, Object.assign({ delay: Math.min(n++, MAX_STEPS) * STEP }, TIMING));
            el.classList.remove('reveal-later');
        });
    });

    // A block has fully arrived once the browser has read past its end, so something follows
    // it or one of its parents. Each one starts as soon as it's there, rather than waiting
    // for the scripts at the bottom of the page to download.
    function arrived(el) {
        if (document.readyState !== 'loading') return true;
        for (let n = el; n && n !== document.body; n = n.parentNode) if (n.nextSibling) return true;
        return false;
    }
    let cursor = 0;
    function take() {
        const all = Array.from(document.querySelectorAll(SEL));
        // Leave out any inside another block (it fades with it).
        const items = all.filter(function (el) { return !all.some(function (o) { return o !== el && o.contains(el); }); });
        for (const el of items) {
            if (el.classList.contains('reveal-seen')) continue;
            if (!arrived(el)) break;
            el.classList.add('reveal-seen');
            all.forEach(function (o) { if (el.contains(o)) o.classList.add('reveal-seen'); });
            const r = el.getBoundingClientRect();
            if (r.top < window.innerHeight && r.bottom > 0) {
                // On the first screen: each one a step after the last, however they arrive.
                const now = performance.now();
                cursor = Math.max(cursor, now);
                el.animate(KEYS, Object.assign({ delay: Math.min(cursor - now, MAX_STEPS * STEP) }, TIMING));
                cursor += STEP;
            } else {
                el.classList.add('reveal-later');
                seen.observe(el);
            }
        }
    }
    function tick() {
        try { take(); } catch (e) { giveUp(); return; }
        if (document.readyState === 'loading') requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    document.addEventListener('DOMContentLoaded', function () {
        try { take(); } catch (e) { /* shown below either way */ }
        giveUp();
    });
})();
