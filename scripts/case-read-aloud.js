// Reads a full case study aloud with the browser's own voice (no files, no service). Any
// button marked data-read-aloud starts it, pauses it and picks it up again; the × beside the
// top one stops it. It reads the title and every section except References, a sentence at a
// time (Chrome cuts long speech off), highlights the paragraph being read, and follows it
// down the page while the reader is following along. Hidden where the browser can't speak.
(function () {
    const synth = window.speechSynthesis;
    const buttons = Array.from(document.querySelectorAll('[data-read-aloud]'));
    const stopBtn = document.querySelector('[data-read-stop]');
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

    function render() {
        buttons.forEach(function (b) {
            const label = state === 'playing' ? 'Pause' : state === 'paused' ? 'Resume' : 'Listen';
            b.innerHTML = (state === 'playing' ? ICON.pause : ICON.listen)
                + '<span>' + label + '</span>' + (state === 'idle' ? '<span class="cs-listen-time">' + minutes + '</span>' : '');
            b.setAttribute('aria-label', state === 'playing' ? 'Pause reading' : state === 'paused' ? 'Resume reading' : 'Listen to this case study, ' + minutes);
            b.classList.toggle('is-active', state !== 'idle');
        });
        if (stopBtn) stopBtn.hidden = state === 'idle';
    }
    function light(el) {
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
        if (following && (r.top < 110 || r.bottom > window.innerHeight - 140)) {
            el.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
        }
    }
    function load(i) {
        at = i;
        parts = pieces(textOf(blocks[i]));
        part = 0;
        light(blocks[i]);
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
    function play() {
        if (state === 'idle') load(0);
        state = 'playing';
        render();
        speak();
    }
    function stop() {
        state = 'idle';
        current = null;
        synth.cancel();
        light(null);
        render();
    }

    buttons.forEach(function (b) {
        b.addEventListener('click', function () {
            if (state === 'playing') pause(); else play();
        });
    });
    if (stopBtn) stopBtn.addEventListener('click', stop);
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
