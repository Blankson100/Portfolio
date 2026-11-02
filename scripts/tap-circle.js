// "Tap" beside the first project on the phone homepage, circled in blue pencil (mobile.css):
// each time the page is opened, the circle draws itself once the project is on screen and
// its row has started to fade in, so it isn't drawn unseen further down, below the bio.
(function () {
    const tap = document.querySelector('.m-tap');
    if (!tap) return;
    const draw = () => setTimeout(() => tap.classList.add('is-drawn'), 450);
    if (!('IntersectionObserver' in window)) { draw(); return; }
    const io = new IntersectionObserver(function (entries) {
        if (!entries.some(e => e.isIntersecting)) return;
        io.disconnect();
        draw();
    }, { threshold: 1 });
    io.observe(tap);
})();
