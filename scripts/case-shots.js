// "The App" screens for a case study: a box showing one screen image at a time, with a black
// pill of tabs along the bottom. Each <img data-tab="Name"> inside <div class="case-shots">
// becomes a tab; pressing one (or the arrow keys on the tabs) shows its image. Tabs that
// don't fit carry on past the pill's edge, cut off there, and scroll into view when chosen.
// Until an image file exists the box shows a plain fill in its place, so adding a screen is
// just saving the file under the right name.
(function () {
    document.querySelectorAll('.case-shots').forEach(function (box) {
        const shots = Array.from(box.querySelectorAll('img'));
        if (!shots.length) return;
        let current = 0, nav = null, tabs = [];

        function show(i, focus) {
            current = i;
            shots.forEach(function (img, j) { img.classList.toggle('is-active', j === i); });
            box.classList.toggle('is-empty', !!shots[i].dataset.missing);
            if (!nav) return;
            tabs.forEach(function (t, j) {
                t.classList.toggle('is-active', j === i);
                t.setAttribute('aria-selected', j === i ? 'true' : 'false');
                t.tabIndex = j === i ? 0 : -1;
            });
            // Bring the chosen tab fully into view inside the pill.
            const t = tabs[i], pad = 12;
            if (t.offsetLeft - pad < nav.scrollLeft) nav.scrollTo({ left: t.offsetLeft - pad, behavior: 'smooth' });
            else if (t.offsetLeft + t.offsetWidth + pad > nav.scrollLeft + nav.clientWidth) {
                nav.scrollTo({ left: t.offsetLeft + t.offsetWidth + pad - nav.clientWidth, behavior: 'smooth' });
            }
            if (focus) t.focus();
        }

        shots.forEach(function (img, i) {
            function missing() {
                img.dataset.missing = '1';
                if (i === current) box.classList.add('is-empty');
            }
            img.addEventListener('error', missing);
            if (img.complete && !img.naturalWidth) missing();   // it failed before this ran
        });

        if (shots.length > 1 && shots.every(function (img) { return img.dataset.tab; })) {
            nav = document.createElement('div');
            nav.className = 'case-shots-nav';
            nav.setAttribute('role', 'tablist');
            nav.setAttribute('aria-label', box.dataset.label || 'Screens');
            tabs = shots.map(function (img, i) {
                const b = document.createElement('button');
                b.type = 'button';
                b.setAttribute('role', 'tab');
                b.textContent = img.dataset.tab;
                b.addEventListener('click', function () { show(i); });
                nav.appendChild(b);
                return b;
            });
            nav.addEventListener('keydown', function (e) {
                const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
                if (!step) return;
                e.preventDefault();
                show((current + step + shots.length) % shots.length, true);
            });
            box.appendChild(nav);
        }
        show(0);
    });
})();
