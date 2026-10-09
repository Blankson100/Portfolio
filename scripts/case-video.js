// "See how it works" video player for the case studies. Each
// <div class="case-video" data-video="videos/name.mp4"></div> becomes a player.
// Until that file exists (or if it fails to load) it shows a "Video coming soon" card,
// so adding a video is just dropping the file into /videos with the right name.
(function () {
    const ICON = {
        play: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 4.5v15l12-7.5z" fill="currentColor"/></svg>',
        pause: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z" fill="currentColor"/></svg>',
        sound: '<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
        muted: '<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
        full: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
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

        box.innerHTML = '<video playsinline preload="metadata"></video>'
            + '<div class="case-video-bar">'
            + '<button type="button" class="case-video-btn" data-act="play" aria-label="Play">' + ICON.play + '</button>'
            + '<div class="case-video-track" role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="case-video-fill"></div></div>'
            + '<span class="case-video-time">0:00 / 0:00</span>'
            + '<button type="button" class="case-video-btn" data-act="mute" aria-label="Mute">' + ICON.sound + '</button>'
            + '<button type="button" class="case-video-btn" data-act="full" aria-label="Full screen">' + ICON.full + '</button>'
            + '</div>';

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

        video.addEventListener('error', comingSoon);
        video.addEventListener('loadedmetadata', function () { box.classList.add('is-ready'); sync(); });
        video.addEventListener('timeupdate', sync);
        video.addEventListener('play', function () { playBtn.innerHTML = ICON.pause; playBtn.setAttribute('aria-label', 'Pause'); });
        video.addEventListener('pause', function () { playBtn.innerHTML = ICON.play; playBtn.setAttribute('aria-label', 'Play'); });
        video.addEventListener('click', toggle);
        playBtn.addEventListener('click', toggle);
        muteBtn.addEventListener('click', function () {
            video.muted = !video.muted;
            muteBtn.innerHTML = video.muted ? ICON.muted : ICON.sound;
            muteBtn.setAttribute('aria-label', video.muted ? 'Unmute' : 'Mute');
        });
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

        video.src = src;
    });
})();
