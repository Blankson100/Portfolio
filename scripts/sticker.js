// Scratch-off stickers in the empty space beside the content, alternating sides and
// tilted like they were pasted on, showing only their shadow. Drag to scratch one off
// (or double-click, double-tap, or press Enter) to reveal a drawing in the avatar's style;
// once revealed it can be dragged anywhere on the page.
// The script tag picks the set (data-set, from stickers/stickers.js) and how many to show
// (data-count, default 2; long pages use 6 and spread them down the page). Home/About use
// "cities", each case study its project's set, Projects mixes them all. With "cities", a
// visitor's first visit includes Bright's own city (window.brightCity.landmark from
// avatar.js). Preview one with ?sticker=bee.
(function () {
    const SIZE = 130;          // sticker size, css px
    const BRUSH = 13;          // scratch radius, css px
    const REVEAL_AT = 0.5;     // share of the shape scratched before it finishes by itself
    const GRID = 20;           // resolution of the "how much is scratched" check
    const HOME_SEEN = 'stickerHomeCitySeen';

    const data = window.STICKERS;
    const tag = document.currentScript;
    const set = (tag && tag.dataset.set) || 'cities';
    const ids = data && data.sets[set];
    if (!ids || ids.length < 2) return;
    const count = Math.min(ids.length, parseInt(tag && tag.dataset.count, 10) || 2);
    const LAST = 'stickerLast:' + set;

    const contentEls = document.querySelectorAll('.intro-inner, .about-inner, .project-main, .project-row');
    const sidebar = document.querySelector('.project-sidebar');
    if (!contentEls.length) return;

    function load(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
    function save(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* private mode */ } }

    // Room for a sticker beside the content (and past the case-study sidebar), as
    // [min, max] left positions.
    function gap(side) {
        let left = Infinity, right = -Infinity;
        contentEls.forEach(function (el) {
            const r = el.getBoundingClientRect();
            if (r.width) { left = Math.min(left, r.left); right = Math.max(right, r.right); }
        });
        const vw = document.documentElement.clientWidth;
        const edge = sidebar ? sidebar.getBoundingClientRect().right + 24 : 24;
        return side === 'left' ? [edge, left - SIZE - 32] : [right + 32, vw - SIZE - 24];
    }
    const fits = side => { const g = gap(side); return g[1] >= g[0]; };

    // All different: Bright's city first on Home/About (until uncovered), the rest in
    // random order with the ones shown last time pushed to the back.
    const home = set === 'cities' && window.brightCity && ids.indexOf(window.brightCity.landmark) !== -1 ? window.brightCity.landmark : null;
    const asked = new URLSearchParams(window.location.search).get('sticker');
    const recent = (load(LAST) || '').split(',');
    const first = asked && data.items[asked] ? asked : (home && !load(HOME_SEEN) ? home : null);
    const rest = ids.filter(c => c !== first && c !== home)
        .map(c => ({ c: c, k: Math.random() + (recent.indexOf(c) !== -1 ? 1 : 0) }))
        .sort((a, b) => a.k - b.k)
        .map(o => o.c);
    const chosen = (first ? [first] : []).concat(rest).slice(0, count);
    save(LAST, chosen.join(','));

    // Alternate sides, starting with one that has room right now so the first is seen.
    const sides = Math.random() < 0.5 ? ['left', 'right'] : ['right', 'left'];
    if (!fits(sides[0]) && fits(sides[1])) sides.reverse();

    chosen.forEach(function (id, i) { makeSticker(id, sides[i % 2], i); });

    function makeSticker(id, side, index) {
        const info = data.items[id];
        const el = document.createElement('div');
        el.className = 'landmark-sticker';
        el.setAttribute('role', 'button');
        el.tabIndex = 0;
        el.setAttribute('aria-label', 'Scratch-off sticker. Scratch it, double-tap it, or press Enter to reveal it.');
        el.style.setProperty('--tilt', (Math.random() * 20 - 10).toFixed(1) + 'deg');
        el.innerHTML = '<div class="landmark-sticker-card"><img class="landmark-sticker-art" alt="" draggable="false">'
            + '<canvas class="landmark-sticker-cover"></canvas></div>'
            + '<div class="landmark-sticker-label">Scratch to reveal</div>';
        const art = el.querySelector('.landmark-sticker-art');
        const cover = el.querySelector('.landmark-sticker-cover');
        const label = el.querySelector('.landmark-sticker-label');
        document.body.appendChild(el);

        // A random spot in its side's gap. Short pages: all in the first screen, one per
        // side, hidden if that side has no room. Long pages: the page is split into one
        // band per sticker from top to bottom, and a sticker with no room on its side
        // moves to the other side (the bands keep them apart).
        const fx = Math.random(), fy = Math.random();
        let moved = false;
        function place() {
            if (moved) { moveTo(parseFloat(el.style.left), parseFloat(el.style.top)); return; }
            const vh = window.innerHeight, docH = document.documentElement.scrollHeight;
            const long = docH > vh * 1.8;
            let s = side;
            if (!fits(s) && long) s = s === 'left' ? 'right' : 'left';
            const [x0, x1] = gap(s);
            el.hidden = x1 < x0;
            if (el.hidden) return;
            let yMin = 110, yMax = Math.max(yMin, vh - SIZE - 200);
            if (long) {
                const band = (Math.max(yMin + count * 220, docH - vh * 0.6) - yMin) / count;
                yMin += index * band;
                yMax = Math.max(yMin, yMin + band - SIZE - 60);
            }
            el.style.left = (x0 + fx * (x1 - x0) + window.scrollX) + 'px';
            el.style.top = (yMin + fy * (yMax - yMin)) + 'px';
        }
        place();
        window.addEventListener('resize', place);
        window.addEventListener('load', place);

        let ctx = null, dpr = 1, inside = null, total = GRID * GRID, threshold = 0.35, revealed = false;
        const scratched = new Set();

        // The cover is the sticker's own outline filled in as a shadow, with light speckle
        // so it reads as a scratch coating.
        function paintCover() {
            dpr = Math.min(window.devicePixelRatio || 1, 3);
            cover.width = cover.height = Math.round(SIZE * dpr);
            ctx = cover.getContext('2d');
            ctx.drawImage(art, 0, 0, cover.width, cover.height);
            ctx.globalCompositeOperation = 'source-in';
            ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#5E5E5E' : '#3A3A3A';
            ctx.fillRect(0, 0, cover.width, cover.height);
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = 'rgba(255,255,255,0.12)';
            for (let i = 0; i < 420; i++) ctx.fillRect(Math.random() * cover.width, Math.random() * cover.height, 2 * dpr, 2 * dpr);
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineCap = 'round';
            ctx.lineWidth = BRUSH * 2 * dpr;

            // Which grid cells the shape covers, so "half scratched" means half of the shape.
            // Reading pixels isn't allowed when opened straight from disk; then count the
            // whole square with a lower bar.
            try {
                const probe = document.createElement('canvas');
                probe.width = probe.height = GRID;
                const p = probe.getContext('2d');
                p.drawImage(art, 0, 0, GRID, GRID);
                const px = p.getImageData(0, 0, GRID, GRID).data;
                inside = [];
                for (let i = 0; i < GRID * GRID; i++) inside.push(px[i * 4 + 3] > 40);
                total = inside.filter(Boolean).length || GRID * GRID;
                threshold = REVEAL_AT;
            } catch (e) { inside = null; }
            el.classList.add('is-ready');
        }

        function mark(x, y) {
            const cell = SIZE / GRID, reach = Math.ceil(BRUSH / cell);
            const cx = Math.floor(x / cell), cy = Math.floor(y / cell);
            for (let gx = cx - reach; gx <= cx + reach; gx++) {
                for (let gy = cy - reach; gy <= cy + reach; gy++) {
                    if (gx < 0 || gy < 0 || gx >= GRID || gy >= GRID) continue;
                    if (Math.hypot((gx + 0.5) * cell - x, (gy + 0.5) * cell - y) > BRUSH) continue;
                    const i = gy * GRID + gx;
                    if (!inside || inside[i]) scratched.add(i);
                }
            }
        }
        function scratch(a, b) {
            ctx.beginPath();
            ctx.moveTo(a[0] * dpr, a[1] * dpr);
            ctx.lineTo(b[0] * dpr, b[1] * dpr);
            ctx.stroke();
            const steps = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 4));
            for (let s = 0; s <= steps; s++) mark(a[0] + (b[0] - a[0]) * s / steps, a[1] + (b[1] - a[1]) * s / steps);
            if (scratched.size / total >= threshold) reveal();
        }

        function reveal() {
            if (revealed) return;
            revealed = true;
            el.classList.add('is-revealed');
            const caption = id === home ? info.caption + ' · I’m here' : info.caption;
            label.innerHTML = '<strong></strong><span></span>';
            label.querySelector('strong').textContent = info.name;
            label.querySelector('span').textContent = caption;
            el.setAttribute('aria-label', info.name + ', ' + caption);
            el.removeAttribute('role');
            el.removeAttribute('tabindex');
            el.title = 'Drag to move';
            if (id === home) save(HOME_SEEN, '1');
        }

        // Once revealed it peels off and sticks wherever it's dropped for this visit,
        // kept within the page. Scrolling mid-drag carries it along.
        let drag = null;
        function moveTo(x, y) {
            const maxX = window.scrollX + document.documentElement.clientWidth - el.offsetWidth - 8;
            const maxY = drag ? drag.maxY : document.documentElement.scrollHeight - el.offsetHeight - 8;
            el.style.left = Math.max(8, Math.min(maxX, x)) + 'px';
            el.style.top = Math.max(8, Math.min(maxY, y)) + 'px';
        }
        function follow() {
            moveTo(drag.cx + window.scrollX - drag.dx, drag.cy + window.scrollY - drag.dy);
        }
        function drop() {
            if (!drag) return;
            drag = null;
            el.classList.remove('is-dragging');
        }
        el.addEventListener('pointerdown', function (e) {
            if (!revealed || e.target === cover || e.button !== 0) return;
            e.preventDefault();
            drag = {
                id: e.pointerId, cx: e.clientX, cy: e.clientY,
                dx: e.pageX - parseFloat(el.style.left), dy: e.pageY - parseFloat(el.style.top),
                maxY: document.documentElement.scrollHeight - el.offsetHeight - 8,
            };
            el.setPointerCapture(e.pointerId);
            // The one picked up last stays on top of the others.
            document.querySelectorAll('.landmark-sticker').forEach(function (s) { s.style.zIndex = ''; });
            el.style.zIndex = 41;
            el.classList.add('is-dragging');
        });
        el.addEventListener('pointermove', function (e) {
            if (!drag || e.pointerId !== drag.id) return;
            drag.cx = e.clientX;
            drag.cy = e.clientY;
            moved = true;
            follow();
        });
        el.addEventListener('pointerup', drop);
        el.addEventListener('pointercancel', drop);
        el.addEventListener('lostpointercapture', drop);
        window.addEventListener('scroll', function () { if (drag) follow(); }, { passive: true });

        let down = false, last = null, lastTap = 0, tapAt = [0, 0];
        cover.addEventListener('pointerdown', function (e) {
            if (revealed || !ctx) return;
            const p = [e.offsetX, e.offsetY];
            const now = performance.now();
            if (now - lastTap < 350 && Math.hypot(p[0] - tapAt[0], p[1] - tapAt[1]) < 30) { reveal(); return; }
            lastTap = now;
            tapAt = p;
            down = true;
            last = p;
            cover.setPointerCapture(e.pointerId);
            scratch(p, p);
        });
        cover.addEventListener('pointermove', function (e) {
            if (revealed || !ctx) return;
            const p = [e.offsetX, e.offsetY];
            // A mouse drag that started off the sticker scratches as it rubs across it,
            // like a real scratch card.
            if (!down) {
                if (e.pointerType !== 'mouse' || !(e.buttons & 1)) return;
                down = true;
                last = p;
            }
            // That drag began on the page, so it also selects text; drop the selection.
            if (!cover.hasPointerCapture(e.pointerId)) {
                const sel = window.getSelection();
                if (sel && !sel.isCollapsed) sel.removeAllRanges();
            }
            scratch(last, p);
            last = p;
        });
        cover.addEventListener('pointerleave', function (e) {
            if (e.pointerType === 'mouse' && !cover.hasPointerCapture(e.pointerId)) down = false;
        });
        ['pointerup', 'pointercancel'].forEach(function (type) {
            cover.addEventListener(type, function () { down = false; });
        });
        el.addEventListener('keydown', function (e) {
            if (!revealed && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); reveal(); }
        });

        art.addEventListener('load', paintCover, { once: true });
        art.src = 'stickers/' + id + '.svg';
    }
})();
