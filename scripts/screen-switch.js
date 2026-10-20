// Phones always get the phone pages and computers the computer pages, whichever link was
// opened: each page knows its partner (same project, same light or dark) and switches to it
// when the screen is on the other side of 700px, the same line index.html uses. It also
// switches the moment the window crosses that line (e.g. Chrome's phone mode). Loaded in
// <head>, before anything is drawn.
(function () {
    // computer page: phone page (light names; the Dark versions pair up the same way)
    const PAIRS = {
        'BB.html': 'portfolio-mobile-light.html',
        'about.html': 'portfolio-mobile-light.html#about',
        'projects.html': 'portfolio-mobile-light.html#projects',
        'leafai.html': 'cropcare-mobile.html',
        'ontrack.html': 'inform-mobile.html',
        'LignTransport.html': 'lign-transport-mobile.html',
        'clostra.html': 'clostra-mobile.html',
        'roster.html': 'roster-mobile.html',
        'cropcare-case-study.html': 'cropcare-case-study-mobile.html',
        'ontrack-case-study.html': 'inform-case-study-mobile.html',
        'lign-case-study.html': 'lign-case-study-mobile.html',
    };
    const dark = name => name.replace('portfolio-mobile-light.html', 'portfolio-mobile-dark.html')
        .replace(/^(?!portfolio-mobile-dark)([^#]+)\.html/, '$1Dark.html');
    const toPhone = {}, toComputer = {};
    Object.keys(PAIRS).forEach(function (computer) {
        const phone = PAIRS[computer];
        toPhone[computer.toLowerCase()] = phone;
        toPhone[dark(computer).toLowerCase()] = dark(phone);
        // The phone homepage stands for Home, About and Projects; going back up it opens Home.
        const phoneFile = phone.split('#')[0];
        if (!toComputer[phoneFile.toLowerCase()]) {
            toComputer[phoneFile.toLowerCase()] = computer;
            toComputer[dark(phoneFile).toLowerCase()] = dark(computer);
        }
    });

    const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const phone = window.matchMedia('(max-width: 700px)');
    // Switching cuts short the browser's crossfade between pages, which it reports as a
    // skipped transition; that's expected here, so it isn't left as an error.
    const quiet = e => { if (e.viewTransition) e.viewTransition.ready.catch(function () {}); };
    window.addEventListener('pagereveal', quiet);
    window.addEventListener('pageswap', quiet);
    function go() {
        let target = (phone.matches ? toPhone : toComputer)[here];
        if (!target) return;
        // From the phone homepage's Projects or About part, back to that computer page.
        const part = { '#projects': 'projects.html', '#about': 'about.html' }[location.hash];
        if (!phone.matches && /^portfolio-mobile-/.test(here) && part) {
            target = /dark/.test(here) ? dark(part) : part;
            history.replaceState(history.state, '', location.pathname + location.search);   // the hash is used up
        }
        // Keep the section being looked at, unless the partner names its own (e.g. #projects).
        const [file, hash] = target.split('#');
        window.screenSwitching = true;   // scripts/analytics.js leaves this page uncounted
        location.replace(file + (hash ? '#' + hash : location.hash));
    }
    go();
    if (phone.addEventListener) phone.addEventListener('change', go);
})();
