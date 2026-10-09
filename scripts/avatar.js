// Dresses the drawn avatar (Profile.jpg) for the day: holidays, Harmattan, live rain,
// a beard that grows through the month, and sleep at night. Overlays come from /avatar
// (built by tools/build-avatars.js). A thought bubble pops up with a holiday wish,
// Zzz while asleep, or "I need a shave" once the beard starts growing.
// Preview any moment with ?avatarDate=2026-12-25T23 (date + hour in the city below)
// and force the weather with ?avatarWeather=rain.
(function () {
    // Where Bright is right now: calendar day, sleeping hours and the live weather.
    const CITY = { name: 'Accra, Ghana', timeZone: 'Africa/Accra', lat: 5.6037, lon: -0.1870 };
    const SLEEP_FROM = 23;
    const SLEEP_UNTIL = 6;
    const params = new URLSearchParams(window.location.search);

    function cityNow() {
        const override = params.get('avatarDate');
        const m = override && override.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{1,2}))?$/);
        if (m) return { y: +m[1], m: +m[2], d: +m[3], h: m[4] ? +m[4] : 12 };
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: CITY.timeZone, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', hourCycle: 'h23'
        }).formatToParts(new Date());
        const get = type => parseInt(parts.find(p => p.type === type).value, 10);
        return { y: get('year'), m: get('month'), d: get('day'), h: get('hour') };
    }

    // Easter Sunday as a UTC timestamp (anonymous Gregorian algorithm).
    function easterSunday(y) {
        const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
        const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7, n = Math.floor((a + 11 * h + 22 * l) / 451);
        return Date.UTC(y, Math.floor((h + l - 7 * n + 114) / 31) - 1, ((h + l - 7 * n + 114) % 31) + 1);
    }

    // `hat` = the layer covers the head, so no nightcap or umbrella alongside it.
    function holiday({ y, m, d }) {
        const md = m * 100 + d;
        if (md >= 1231 || md <= 102) return { layer: 'newyear', wish: 'Happy New Year!', hat: true };
        if (md >= 1224 && md <= 1226) return { layer: 'christmas', wish: 'Merry Christmas!', hat: true };
        if (md === 214) return { layer: 'valentine', wish: 'Happy Valentine’s Day!' };
        if (md === 306) return { layer: 'ghana-independence', wish: 'Happy Independence Day!' };
        if (md === 1031) return { layer: 'halloween', wish: 'Happy Halloween!', hat: true };
        const day = 86400000, today = Date.UTC(y, m - 1, d), easter = easterSunday(y);
        if (today >= easter - 2 * day && today <= easter + day) return { layer: 'easter', wish: 'Happy Easter!', hat: true };
        return null;
    }

    // Ghana's dusty Harmattan wind blows Dec–Feb.
    function isHarmattan({ m, d }) {
        const md = m * 100 + d;
        return md >= 1201 || md <= 229;
    }

    // Rain only when it's actually raining in the city right now (Open-Meteo, no key).
    // WMO codes: drizzle 51-57, rain 61-67, showers 80-82, thunderstorms 95-99.
    function rainingNow() {
        const forced = params.get('avatarWeather');
        if (forced) return Promise.resolve(forced === 'rain');
        if (params.get('avatarDate')) return Promise.resolve(false);
        return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${CITY.lat}&longitude=${CITY.lon}&current=weather_code`)
            .then(r => (r.ok ? r.json() : null))
            .then(j => {
                const c = j && j.current ? j.current.weather_code : -1;
                return (c >= 51 && c <= 67) || (c >= 80 && c <= 82) || c >= 95;
            })
            .catch(() => false);
    }

    // Clean-shaven on the 1st, then a new stage roughly every week.
    function beardStage(d) {
        return d <= 6 ? 0 : d <= 13 ? 1 : d <= 20 ? 2 : d <= 26 ? 3 : 4;
    }

    const now = cityNow();
    const asleep = now.h >= SLEEP_FROM || now.h < SLEEP_UNTIL;
    const hol = holiday(now);
    const stage = beardStage(now.d);

    // A holiday hat wins over the umbrella; the nightcap only goes on a bare head.
    function layersFor(raining) {
        const umbrella = raining && !(hol && hol.hat);
        const layers = [];
        if (stage) layers.push('beard-' + stage);
        if (asleep) layers.push('sleep');
        if (hol) layers.push(hol.layer);
        if (umbrella) layers.push('rainy');
        if (asleep && !(hol && hol.hat) && !umbrella) layers.push('nightcap');
        if (isHarmattan(now)) layers.push('harmattan');
        return layers;
    }

    let bubble = null;
    if (asleep) bubble = { kind: 'zzz' };
    else if (hol) bubble = { kind: 'wish', text: hol.wish };
    else if (stage >= 1) bubble = { kind: 'shave', text: 'I need a shave' };

    const ZZZ = '<svg class="avatar-bubble-icon" viewBox="0 0 60 36" width="52" height="31" aria-hidden="true"><g filter="url(#bubbleRough)" fill="none" stroke="#0b0b0b" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">'
        + '<path class="avatar-z" d="M4,22 h10 L4,32 h10"/><path class="avatar-z" d="M19,12 h14 L19,26 h14"/><path class="avatar-z" d="M38,2 h18 L38,20 h18"/></g></svg>';
    const RAZOR = '<svg class="avatar-bubble-icon" viewBox="0 0 48 48" width="30" height="30" aria-hidden="true"><g class="avatar-razor"><g filter="url(#bubbleRough)" stroke="#0b0b0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(-35 24 24)">'
        + '<rect x="8" y="5" width="32" height="10" rx="2.5" fill="#E3E3E3"/><path d="M10,8.5 H38" fill="none" stroke-width="1.4"/>'
        + '<rect x="20.5" y="15" width="7" height="28" rx="3.5" fill="#4A4A4A"/><path d="M21,24 h6 M21,29 h6 M21,34 h6" fill="none" stroke="#E3E3E3" stroke-width="1.6"/></g></g></svg>';

    // Bumpy cloud outline sized to w x h, bumps spaced evenly along an ellipse.
    function cloudPath(w, h) {
        const bump = 9, a = w / 2 - bump * 0.6, b = h / 2 - bump * 0.6, cx = w / 2, cy = h / 2;
        const samples = [];
        let len = 0, prev = null;
        for (let i = 0; i <= 360; i++) {
            const t = (i / 360) * Math.PI * 2, p = [cx + a * Math.cos(t), cy + b * Math.sin(t)];
            if (prev) len += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
            samples.push({ p, len });
            prev = p;
        }
        const n = Math.max(8, Math.round(len / 22));
        const pts = [];
        for (let k = 0, j = 0; k < n; k++) {
            const target = (k / n) * len;
            while (samples[j].len < target) j++;
            pts.push(samples[j].p);
        }
        let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
        for (let k = 0; k < n; k++) {
            const p = pts[k], q = pts[(k + 1) % n], r = Math.hypot(q[0] - p[0], q[1] - p[1]) * 0.62;
            d += ` A${r.toFixed(1)},${r.toFixed(1)} 0 0 1 ${q[0].toFixed(1)},${q[1].toFixed(1)}`;
        }
        return d + ' Z';
    }

    function addBubble(wrap) {
        const el = document.createElement('div');
        el.className = 'avatar-bubble';
        el.innerHTML = '<svg class="avatar-bubble-cloud" aria-hidden="true"></svg><div class="avatar-bubble-content">'
            + (bubble.kind === 'zzz' ? ZZZ : '<span class="avatar-bubble-text"></span>' + (bubble.kind === 'shave' ? RAZOR : ''))
            + '</div>';
        if (bubble.text) el.querySelector('.avatar-bubble-text').textContent = bubble.text;
        if (bubble.kind === 'zzz') el.setAttribute('aria-label', 'Bright is asleep');
        document.body.appendChild(el);

        const cloud = el.querySelector('.avatar-bubble-cloud');
        const content = el.querySelector('.avatar-bubble-content');
        function draw() {
            const w = content.offsetWidth + 30, h = content.offsetHeight + 22;
            cloud.setAttribute('width', w);
            cloud.setAttribute('height', h + 24);
            cloud.setAttribute('viewBox', `0 0 ${w} ${h + 24}`);
            cloud.innerHTML = '<defs><filter id="bubbleRough" x="-10%" y="-10%" width="120%" height="120%">'
                + '<feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="4" result="n"/>'
                + '<feDisplacementMap in="SourceGraphic" in2="n" scale="2.5" xChannelSelector="R" yChannelSelector="G"/></filter></defs>'
                + `<g filter="url(#bubbleRough)"><path d="${cloudPath(w, h)}"/>`
                + `<circle cx="${(w * 0.2).toFixed(1)}" cy="${h + 7}" r="6"/><circle cx="${(w * 0.09).toFixed(1)}" cy="${h + 18}" r="3.5"/></g>`;
            el.style.width = w + 'px';
            el.style.height = (h + 24) + 'px';
        }
        function place() {
            const r = wrap.getBoundingClientRect();
            el.style.left = (r.left + window.scrollX + r.width * 0.62) + 'px';
            el.style.top = (r.top + window.scrollY + r.height * 0.15 - el.offsetHeight) + 'px';
        }
        draw();
        place();
        window.addEventListener('resize', place);
        window.addEventListener('load', place);
        if (document.fonts) document.fonts.ready.then(function () { draw(); place(); });

        // Pops in at ~0.6s, stays 15s, then shrinks away.
        setTimeout(function () {
            el.classList.add('avatar-bubble-leaving');
            setTimeout(function () { el.remove(); }, 450);
        }, 15600);
    }

    const bases = Array.prototype.slice.call(document.querySelectorAll('img[src="Profile.jpg"]'));

    function render(raining) {
        const layers = layersFor(raining);
        bases.forEach(function (base) {
            base.parentElement.querySelectorAll('img.avatar-layer').forEach(function (old) { old.remove(); });
            let after = base;
            layers.forEach(function (name) {
                const img = document.createElement('img');
                img.src = 'avatar/' + name + '.svg';
                img.alt = '';
                img.className = base.className + ' avatar-layer';
                img.style.cssText = 'position:absolute;inset:0;pointer-events:none';
                after.insertAdjacentElement('afterend', img);
                after = img;
            });
        });
    }

    render(false);
    if (bubble) bases.forEach(function (base) { addBubble(base.parentElement); });
    rainingNow().then(function (raining) { if (raining) render(true); });
})();
