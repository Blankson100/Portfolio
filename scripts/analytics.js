// Vercel Web Analytics: counts visitors and page views on the Vercel site, with no cookies.
// Only the Vercel copy has the counting script, so GitHub Pages and local copies skip it.
// A page reached by switching light/dark, or by the phone/computer switch, isn't counted
// again: it's the same visit to the same page. Loaded in <head> after scripts/screen-switch.js
// and before scripts/page-fade.js (which uses up the light/dark note).
(function () {
    const SCRIPT = '/_vercel/insights/script.js';
    const host = location.hostname;
    if (location.protocol === 'file:' || host === 'localhost' || host === '127.0.0.1' || /github\.io$/.test(host)) return;
    if (window.screenSwitching) return;
    try {
        const note = JSON.parse(sessionStorage.getItem('modeSwitchPlace'));
        if (note && Date.now() - note.at < 15000) return;
    } catch (e) { /* nothing noted */ }

    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    const script = document.createElement('script');
    script.src = SCRIPT;
    script.defer = true;
    document.head.appendChild(script);
})();
