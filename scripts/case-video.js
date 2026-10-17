// "See how it works" video player for the case studies. Each
// <div class="case-video" data-video="videos/name.mp4"></div> becomes a player.
// Until that file exists (or if it fails to load) it shows a "Video coming soon" card,
// so adding a video is just dropping the file into /videos with the right name.
// With smaller copies listed in data-sources="videos/name.mp4 920p, videos/name-600.mp4 600p"
// (best first), a gear in the bar picks the quality: Auto (the smallest on a slow or
// data-saving connection, where the browser says so, else the best) or one of them.
// A video with no sound (data-silent) gets no volume button.
(function () {
    const ICON = {
        play: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 4.5v15l12-7.5z" fill="currentColor"/></svg>',
        pause: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z" fill="currentColor"/></svg>',
        sound: '<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
        muted: '<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
        full: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        gear: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></g></svg>',
        soon: '<svg viewBox="0 0 56 56" width="56" height="56" aria-hidden="true"><circle cx="28" cy="28" r="25" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M23 18.5v19l15-9.5z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/></svg>'
    };
    const clock = s => (isFinite(s) ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : '0:00');

    document.querySelectorAll('.case-video').forEach(function (box) {
        function comingSoon() {
            box.classList.remove('is-ready');
            box.innerHTML = '<div class="case-video-soon">' + ICON.soon + '<span>Video coming soon</span></div>';
        }

        const src = box.getAttribute('data-video');
        if (!src) { comingSoon(); return; }
        // A video recorded on a plain background (data-fill="#000000") sits smaller in the box,
        // clear of the play bar, with the box filled in that colour around it.
        if (box.dataset.fill) {
            box.classList.add('is-framed');
            box.style.background = box.dataset.fill;
        }

        const silent = box.hasAttribute('data-silent');
        const qualities = (box.dataset.sources || '').split(',').map(function (s) { return s.trim().split(/\s+/); })
            .filter(function (p) { return p.length === 2; }).map(function (p) { return { file: p[0], label: p[1] }; });
        if (!qualities.length) qualities.push({ file: src, label: '' });
        const STORE = 'caseVideoQuality';
        let choice = 'auto';
        try { choice = localStorage.getItem(STORE) || 'auto'; } catch (e) { /* storage blocked: stay on Auto */ }
        function autoPick() {
            const c = navigator.connection;
            // Under about 1 Mb/s even a demo-sized video (the 920p one runs at 1.2) would stall.
            const slow = c && (c.saveData || /2g|3g/.test(c.effectiveType || '') || (c.downlink > 0 && c.downlink < 1));
            return slow ? qualities[qualities.length - 1] : qualities[0];
        }
        function chosen() {
            return qualities.find(function (q) { return q.label === choice; }) || autoPick();
        }

        box.innerHTML = '<video playsinline preload="metadata"' + (silent ? ' muted' : '') + '></video>'
            + '<div class="case-video-bar">'
            + '<button type="button" class="case-video-btn" data-act="play" aria-label="Play">' + ICON.play + '</button>'
            + '<div class="case-video-track" role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="case-video-fill"></div></div>'
            + '<span class="case-video-time">0:00 / 0:00</span>'
            + (silent ? '' : '<button type="button" class="case-video-btn" data-act="mute" aria-label="Mute">' + ICON.sound + '</button>')
            + (qualities.length > 1 ? '<button type="button" class="case-video-btn" data-act="quality" aria-label="Quality" aria-haspopup="menu" aria-expanded="false">' + ICON.gear + '</button>' : '')
            + '<button type="button" class="case-video-btn" data-act="full" aria-label="Full screen">' + ICON.full + '</button>'
            + '</div>'
            + (qualities.length > 1 ? '<div class="case-video-menu" role="menu" aria-label="Quality" hidden></div>' : '');

        const video = box.querySelector('video');
        const playBtn = box.querySelector('[data-act="play"]');
        const muteBtn = box.querySelector('[data-act="mute"]');
        const fullBtn = box.querySelector('[data-act="full"]');
        const track = box.querySelector('.case-video-track');
        const fill = box.querySelector('.case-video-fill');
        const time = box.querySelector('.case-video-time');

        function sync() {
            const pct = video.duration ? (video.currentTime / video.duration) * 100 : 0;
            fill.style.width = pct + '%';
            track.setAttribute('aria-valuenow', Math.round(pct));
            time.textContent = clock(video.currentTime) + ' / ' + clock(video.duration);
        }
        function toggle() {
            if (video.paused) video.play(); else video.pause();
        }
        function seekBy(seconds) {
            if (video.duration) video.currentTime = Math.min(Math.max(video.currentTime + seconds, 0), video.duration);
        }

        // Switching quality keeps the place, and keeps playing if it was.
        function load(q) {
            if (video.getAttribute('src') === q.file) return;
            const at = video.currentTime, playing = !video.paused;
            video.src = q.file;
            if (at || playing) {
                video.addEventListener('loadedmetadata', function () {
                    video.currentTime = at;
                    if (playing) video.play();
                }, { once: true });
            }
        }

        // A missing smaller copy falls back to the best one; only a missing best is "coming soon".
        video.addEventListener('error', function () {
            if (video.getAttribute('src') !== qualities[0].file) load(qualities[0]);
            else comingSoon();
        });
        video.addEventListener('loadedmetadata', function () { box.classList.add('is-ready'); sync(); });
        video.addEventListener('timeupdate', sync);
        video.addEventListener('play', function () { playBtn.innerHTML = ICON.pause; playBtn.setAttribute('aria-label', 'Pause'); });
        video.addEventListener('pause', function () { playBtn.innerHTML = ICON.play; playBtn.setAttribute('aria-label', 'Play'); });
        video.addEventListener('click', toggle);
        playBtn.addEventListener('click', toggle);
        if (muteBtn) {
            muteBtn.addEventListener('click', function () {
                video.muted = !video.muted;
                muteBtn.innerHTML = video.muted ? ICON.muted : ICON.sound;
                muteBtn.setAttribute('aria-label', video.muted ? 'Unmute' : 'Mute');
            });
        }
        fullBtn.addEventListener('click', function () {
            if (document.fullscreenElement) document.exitFullscreen();
            else if (box.requestFullscreen) box.requestFullscreen();
        });
        track.addEventListener('click', function (e) {
            const r = track.getBoundingClientRect();
            if (video.duration) video.currentTime = ((e.clientX - r.left) / r.width) * video.duration;
        });
        track.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowRight') { e.preventDefault(); seekBy(5); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); seekBy(-5); }
        });

        // The quality menu: Auto (showing what it picked) and each quality, the current one ticked.
        const qualityBtn = box.querySelector('[data-act="quality"]'), menu = box.querySelector('.case-video-menu');
        if (qualityBtn) {
            function renderMenu() {
                const picked = qualities.some(function (q) { return q.label === choice; }) ? choice : 'auto';
                menu.innerHTML = ['auto'].concat(qualities.map(function (q) { return q.label; })).map(function (k) {
                    return '<button type="button" role="menuitemradio" aria-checked="' + (k === picked) + '" data-q="' + k + '">'
                        + (k === 'auto' ? 'Auto <span>' + autoPick().label + '</span>' : k) + '</button>';
                }).join('');
            }
            function openMenu(open) {
                menu.hidden = !open;
                qualityBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
                if (open) {
                    renderMenu();
                    menu.querySelector('[aria-checked="true"]').focus();
                }
            }
            qualityBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                openMenu(menu.hidden);
            });
            menu.addEventListener('click', function (e) {
                const b = e.target.closest('[data-q]');
                if (!b) return;
                choice = b.dataset.q;
                try { localStorage.setItem(STORE, choice); } catch (err) { /* not remembered, still switches */ }
                openMenu(false);
                qualityBtn.focus();
                load(chosen());
            });
            menu.addEventListener('keydown', function (e) {
                const items = Array.from(menu.querySelectorAll('button')), i = items.indexOf(document.activeElement);
                if (e.key === 'Escape') { openMenu(false); qualityBtn.focus(); }
                if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
                if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
            });
            document.addEventListener('click', function (e) {
                if (!menu.hidden && !menu.contains(e.target)) openMenu(false);
            });
        }

        load(chosen());
    });
})();
