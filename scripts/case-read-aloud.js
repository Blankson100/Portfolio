// Reads a full case study aloud with the browser's own voice (no files, no service). Any
// button marked data-read-aloud starts it, pauses it and picks it up again. Pressing it opens
// its group (data-read-controls), splitting out buttons to go back a paragraph
// (data-read-prev), on a paragraph (data-read-next) and stop (data-read-stop); a stop button
// outside a group is simply shown while reading. It reads the title and every section except References, a sentence at a
// time (Chrome cuts long speech off), highlights the paragraph being read, and follows it
// down the page while the reader is following along. Hidden where the browser can't speak.
(function () {
    const synth = window.speechSynthesis;
    const buttons = Array.from(document.querySelectorAll('[data-read-aloud]'));
    const groups = Array.from(document.querySelectorAll('[data-read-controls]'));
    const all = sel => Array.from(document.querySelectorAll(sel));
    if (!buttons.length) return;
    if (!synth || !window.SpeechSynthesisUtterance) {
        buttons.forEach(function (b) { b.hidden = true; });
        return;
    }
    synth.cancel();   // nothing left over from a reload

    const ICON = {
        listen: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
        pause: '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z" fill="currentColor"/></svg>',
    };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const blocks = Array.from(document.querySelectorAll('.cs-title, .cs-subtitle, .cs-section:not(.cs-refs) :is(h2, h3, p, li)'))
        .filter(function (el) { return !el.closest('li') || el.tagName === 'LI'; });
    const textOf = el => (el.classList.contains('cs-meta')
        ? Array.from(el.children).map(s => s.textContent).join('. ')
        : el.textContent).replace(/\s+/g, ' ').trim();
    // Sentences, and long ones split again at commas, so no single piece runs too long.
    function pieces(text) {
        const out = [];
        text.split(/(?<=[.!?:])\s+(?=["“(]?[A-Z0-9])/).forEach(function (s) {
            while (s.length > 220) {
                const cut = s.lastIndexOf(', ', 200);
                if (cut < 60) break;
                out.push(s.slice(0, cut + 1));
                s = s.slice(cut + 2);
            }
            if (s) out.push(s);
        });
        return out;
    }

    // Listening time on the buttons, at an easy speaking pace.
    const words = blocks.reduce((n, el) => n + textOf(el).split(' ').length, 0);
    const minutes = Math.max(1, Math.round(words / 160)) + ' min';

    // A British English voice where there is one (the case studies are in UK English).
    let voice = null;
    function pickVoice() {
        const voices = synth.getVoices();
        voice = voices.find(v => /^en[-_]GB/i.test(v.lang) && /natural|online|google/i.test(v.name))
            || voices.find(v => /^en[-_]GB/i.test(v.lang))
            || voices.find(v => /^en/i.test(v.lang)) || null;
    }
    pickVoice();
    if ('onvoiceschanged' in synth) synth.addEventListener('voiceschanged', pickVoice);

    let state = 'idle', at = 0, parts = [], part = 0, current = null, lit = null;

    let rendered = false;
    function render() {
        buttons.forEach(function (b) {
            // In a group the pill eases to its new width instead of snapping to it.
            const ease = rendered && !reduced && b.closest('[data-read-controls]');
            const before = ease ? b.offsetWidth : 0;   // its own width, not squished by a press
            b.style.width = '';
            const label = state === 'playing' ? 'Pause' : state === 'paused' ? 'Resume' : 'Listen';
            b.innerHTML = (state === 'playing' ? ICON.pause : ICON.listen)
                + '<span>' + label + '</span>' + (state === 'idle' ? '<span class="cs-listen-time">' + minutes + '</span>' : '');
            b.setAttribute('aria-label', state === 'playing' ? 'Pause reading' : state === 'paused' ? 'Resume reading' : 'Listen to this case study, ' + minutes);
            b.classList.toggle('is-active', state !== 'idle');
            if (ease) {
                const after = b.offsetWidth;
                if (Math.abs(after - before) > 1) {
                    b.style.width = before + 'px';
                    b.getBoundingClientRect();
                    b.style.width = after + 'px';
                    b.addEventListener('transitionend', function done(e) {
                        if (e.propertyName === 'width') { b.style.width = ''; b.removeEventListener('transitionend', done); }
                    });
                }
            }
        });
        // Groups split open while reading; their extra buttons can't be reached while closed.
        groups.forEach(function (g) {
            g.classList.toggle('is-open', state !== 'idle');
            g.querySelectorAll('[data-read-prev], [data-read-next], [data-read-stop]').forEach(function (b) {
                b.tabIndex = state === 'idle' ? -1 : 0;
                b.setAttribute('aria-hidden', state === 'idle' ? 'true' : 'false');
            });
        });
        all('[data-read-stop]').forEach(function (b) { if (!b.closest('[data-read-controls]')) b.hidden = state === 'idle'; });
        if (rendered) morph(); else shapes();
        rendered = true;
    }

    // The liquid shapes behind each group's buttons, one per button, kept on top of them.
    // While things move (morph) they're redrawn every frame through the goo filter, which
    // joins shapes that are close; then the filter goes off so the resting edges are crisp.
    function shapes() {
        groups.forEach(function (g) {
            const layer = g.querySelector('.cs-listen-blobs');
            if (!layer) return;
            const box = layer.getBoundingClientRect();
            const btns = g.querySelectorAll('.cs-listen-btn, .cs-listen-more');
            layer.querySelectorAll('span').forEach(function (s, i) {
                const r = btns[i] && btns[i].getBoundingClientRect();
                if (!r) return;
                s.style.left = (r.left - box.left) + 'px';
                s.style.top = (r.top - box.top) + 'px';
                s.style.width = r.width + 'px';
                s.style.height = r.height + 'px';
            });
        });
    }
    let morphUntil = 0, morphing = false;
    function morph(ms) {
        morphUntil = Math.max(morphUntil, performance.now() + (ms || 1100));
        if (morphing) return;
        morphing = true;
        groups.forEach(function (g) { g.classList.add('is-morphing'); });
        (function frame() {
            shapes();
            if (performance.now() < morphUntil) { requestAnimationFrame(frame); return; }
            morphing = false;
            groups.forEach(function (g) { g.classList.remove('is-morphing'); });
        })();
    }
    window.addEventListener('resize', shapes);
    if (document.fonts) document.fonts.ready.then(shapes);
    // Pressing squishes the pill a little; the shapes follow it.
    groups.forEach(function (g) { g.addEventListener('pointerdown', function () { morph(500); }); });
    function light(el, quiet) {
        // Follow down the page only if the reader could see the paragraph before this one.
        let following = true;
        if (lit) {
            const r = lit.getBoundingClientRect();
            following = r.bottom > 0 && r.top < window.innerHeight;
            lit.classList.remove('cs-reading');
        }
        lit = el;
        if (!el) return;
        el.classList.add('cs-reading');
        const r = el.getBoundingClientRect();
        if (!quiet && following && (r.top < 110 || r.bottom > window.innerHeight - 140)) {
            el.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
        }
    }
    function load(i, quiet) {
        at = i;
        parts = pieces(textOf(blocks[i]));
        part = 0;
        light(blocks[i], quiet);
    }
    function speak() {
        if (state !== 'playing') return;
        while (part >= parts.length) {
            if (at + 1 >= blocks.length) { stop(); return; }
            load(at + 1);
        }
        const u = new SpeechSynthesisUtterance(parts[part]);
        if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = 'en-GB';
        u.onend = function () { if (current === u) { part++; speak(); } };
        u.onerror = function (e) {
            if (current !== u || e.error === 'interrupted' || e.error === 'canceled') return;
            part++;
            speak();
        };
        current = u;
        synth.speak(u);
    }
    // Pausing cancels and remembers the place; resuming says that sentence again. (The
    // browsers' own pause and resume are unreliable, and Android treats pause as stop.)
    function pause() {
        state = 'paused';
        current = null;
        synth.cancel();
        render();
    }
    // Starting doesn't jump the page: the buttons split open first, then the page glides
    // down to where it's reading (if that's off screen).
    let glide = 0;
    function play() {
        const fresh = state === 'idle';
        if (fresh) load(0, true);
        state = 'playing';
        render();
        speak();
        if (fresh) {
            clearTimeout(glide);
            glide = setTimeout(function () {
                if (state === 'idle' || !lit) return;
                const r = lit.getBoundingClientRect();
                if (r.top < 110 || r.bottom > window.innerHeight - 140) lit.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
            }, reduced ? 0 : 950);
        }
    }
    function stop() {
        clearTimeout(glide);
        state = 'idle';
        current = null;
        synth.cancel();
        light(null);
        render();
    }
    // Back to the start of this paragraph (or the one before, if it has only just begun), or
    // on to the next one; it keeps playing, or waits there if paused.
    function jump(i) {
        if (i >= blocks.length) { stop(); return; }
        current = null;
        synth.cancel();
        load(Math.max(0, i));
        if (state === 'playing') speak();
    }

    buttons.forEach(function (b) {
        b.addEventListener('click', function () {
            if (state === 'playing') pause(); else play();
        });
    });
    all('[data-read-stop]').forEach(function (b) {
        b.addEventListener('click', function () {
            stop();
            // The stop button folds away, so the Listen button beside it takes the focus.
            const g = b.closest('[data-read-controls]'), main = g && g.querySelector('[data-read-aloud]');
            if (main && document.activeElement === b) main.focus({ preventScroll: true });
        });
    });
    all('[data-read-prev]').forEach(function (b) { b.addEventListener('click', function () { if (state !== 'idle') jump(part > 0 ? at : at - 1); }); });
    all('[data-read-next]').forEach(function (b) { b.addEventListener('click', function () { if (state !== 'idle') jump(at + 1); }); });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && state !== 'idle') stop();
    });
    // Leaving the page (or switching mode) stops the voice instead of letting it carry on.
    window.addEventListener('pagehide', function () { current = null; synth.cancel(); });
    // Coming back with the browser's Back button: it was stopped on the way out, so it waits
    // to be resumed.
    window.addEventListener('pageshow', function (e) {
        if (e.persisted && state === 'playing') { state = 'paused'; render(); }
    });
    render();
})();
