// Scratch-off stickers in the empty space beside the content, alternating sides and
// tilted like they were pasted on, showing only their shadow. Drag to scratch one off
// (or double-click, double-tap, or press Enter) to reveal a drawing in the avatar's style;
// once revealed it can be dragged anywhere on the page.
// The script tag picks the set (data-set, from stickers/stickers.js) and how many to show
// (data-count, default 2; Home uses 3, the long project pages 6). Several sets separated
// by spaces are pooled, as many stickers as sets: About uses "knicks united ghana world".
// Home uses "cities", each case study its project's set, Projects mixes them all. Each
// visitor keeps meeting new ones: stickers they've been shown anywhere on the site wait
// until they've seen the rest, and on about half of page views one comes from the whole
// collection as a surprise. A visitor's very first sticker is Bright's own city
// (window.brightCity.landmark from avatar.js) wherever the set has it. On a holiday they all
// come from that day's set (window.brightHoliday from holiday.js). Preview one with
// ?sticker=bee.
// The phone page has no room beside its text, so it uses data-place="free" (stickers go
// in empty patches between the lines) and a smaller data-size.
(function () {
    const tag = document.currentScript;
    const SIZE = parseInt(tag && tag.dataset.size, 10) || 130;   // sticker size, css px
    const BRUSH = Math.max(10, SIZE / 10);                      // scratch radius, css px
    const REVEAL_AT = 0.5;     // share of the shape scratched before it finishes by itself
    const GRID = 20;           // resolution of the "how much is scratched" check
    const FREE = !!tag && tag.dataset.place === 'free';

    const data = window.STICKERS;
    const names = ((tag && tag.dataset.set) || 'cities').split(/\s+/);
    if (!data || names.some(n => !data.sets[n] || !data.sets[n].length)) return;
    const count = names.length > 1 ? names.length
        : Math.min(data.sets[names[0]].length, parseInt(tag && tag.dataset.count, 10) || 2);

    // What stickers keep clear of. On Home that's the header and the cards themselves,
    // since their boxes stretch well past the right-most card.
    const contentEls = document.querySelectorAll('.profile-header > *, .intro-sub, .intro-inner .grid-container > *, '
        + '.about-inner, .project-main, .project-row');
    const sidebar = document.querySelector('.project-sidebar');
    const footer = document.querySelector('footer');
    const TOP = 110;           // highest a sticker sits, page px
    if (!FREE && !contentEls.length) return;

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

    // Free placement: a random empty patch where the sticker and its label (BOX) clear
    // every line of text and anything marked data-sticker-avoid.
    const BOX_W = SIZE + 40, BOX_H = SIZE + 36, PAD = 6;
    let spots = [];
    function obstacles() {
        const boxes = [];
        const add = r => {
            if (r.width && r.height) boxes.push({ l: r.left + scrollX, r: r.right + scrollX, t: r.top + scrollY, b: r.bottom + scrollY });
        };
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode: n => n.nodeValue.trim() && !n.parentElement.closest('.landmark-sticker, .avatar-bubble, script, style')
                ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
        });
        const range = document.createRange();
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            range.selectNodeContents(n);
            Array.prototype.forEach.call(range.getClientRects(), add);
        }
        document.querySelectorAll('[data-sticker-avoid]').forEach(el => add(el.getBoundingClientRect()));
        return boxes;
    }
    // If the gaps can't take them all, the page grows a little at the bottom until they fit.
    // On a page with a footer the room is made just above the footer, so stickers never end
    // up below it.
    const pageFooter = FREE ? document.querySelector('footer') : null;
    let room = null;
    function findSpots() {
        if (pageFooter) {
            room = room || document.createElement('div');
            room.setAttribute('aria-hidden', 'true');
            if (room.nextElementSibling !== pageFooter) pageFooter.parentNode.insertBefore(room, pageFooter);
        }
        const vw = document.documentElement.clientWidth;
        for (let extra = room ? 0 : SIZE * 0.7; ; extra += 40) {
            if (room) room.style.height = extra + 'px';
            const boxes = obstacles();
            const end = room ? room.getBoundingClientRect().bottom + scrollY
                : boxes.reduce((m, o) => Math.max(m, o.b), 0) + extra;
            const free = [];
            for (let y = 8; y + BOX_H <= end; y += 6) {
                for (let x = 8; x + BOX_W <= vw - 8; x += 6) {
                    const l = x - PAD, r = x + BOX_W + PAD, t = y - PAD, b = y + BOX_H + PAD;
                    if (!boxes.some(o => l < o.r && r > o.l && t < o.b && b > o.t)) free.push([x, y]);
                }
            }
            // A few random tries; keep the one that fits the most.
            spots = [];
            for (let attempt = 0; attempt < 12 && spots.length < count; attempt++) {
                const got = [];
                for (let i = 0; i < count; i++) {
                    const open = free.filter(([x, y]) => got.every(s => Math.abs(s[0] - x) >= BOX_W + 24 || Math.abs(s[1] - y) >= BOX_H + 24));
                    if (!open.length) break;
                    got.push(open[Math.floor(Math.random() * open.length)]);
                }
                if (got.length > spots.length) spots = got;
            }
            if (spots.length >= count || extra > SIZE * 8) return;
        }
    }

    // Every visitor keeps meeting new stickers. What they've been shown anywhere on the site
    // is remembered (longest ago first). A page picks, from its sets, the ones they haven't
    // seen yet in a random order, and only repeats once they've seen them all, starting with
    // the ones from longest ago. On about half of page views one of them comes from the whole
    // collection instead, as a surprise. All different on a page; Bright's own city leads a
    // visitor's very first stickers.
    const SEEN = 'stickerSeen';
    const home = window.brightCity ? window.brightCity.landmark : null;
    const seen = (load(SEEN) || '').split(',').filter(id => data.items[id]);
    const shuffle = list => list
        .map(c => ({ c: c, k: Math.random() }))
        .sort((a, b) => a.k - b.k)
        .map(o => o.c);
    function freshest(list, taken) {
        const left = list.filter(c => taken.indexOf(c) === -1);
        return shuffle(left.filter(c => seen.indexOf(c) === -1))
            .concat(left.filter(c => seen.indexOf(c) !== -1).sort((a, b) => seen.indexOf(a) - seen.indexOf(b)));
    }
    // Sets can overlap (e.g. "ghana" and "cities"), so they're pooled without repeats. On a
    // holiday (scripts/holiday.js) every sticker comes from that day's set instead, with no
    // surprises from the rest.
    const holiday = window.brightHoliday && data.sets[window.brightHoliday.id] ? window.brightHoliday.id : null;
    const pool = holiday ? data.sets[holiday]
        : names.reduce((all, n) => all.concat(data.sets[n].filter(c => all.indexOf(c) === -1)), []);
    // Holiday stickers never turn up as a surprise on other days.
    const seasonal = (data.holidays || []).reduce((all, n) => all.concat(data.sets[n] || []), []);
    const everyday = Object.keys(data.items).filter(c => seasonal.indexOf(c) === -1);
    let chosen = !holiday && home && !seen.length && pool.indexOf(home) !== -1 ? [home] : [];
    const surprise = !holiday && Math.random() < 0.5 ? 1 : 0;
    chosen = chosen.concat(freshest(pool, chosen).slice(0, Math.max(0, count - chosen.length - surprise)));
    chosen = chosen.concat(freshest(holiday ? pool : everyday, chosen).slice(0, count - chosen.length));
    chosen = chosen.slice(0, 1).concat(shuffle(chosen.slice(1)));
    save(SEEN, seen.filter(c => chosen.indexOf(c) === -1).concat(chosen).join(','));
    const asked = new URLSearchParams(window.location.search).get('sticker');
    if (asked && data.items[asked]) chosen = [asked].concat(chosen.filter(c => c !== asked)).slice(0, count);

    // Alternate sides, starting with one that has room right now so the first is seen.
    const sides = Math.random() < 0.5 ? ['left', 'right'] : ['right', 'left'];
    if (!FREE && !fits(sides[0]) && fits(sides[1])) sides.reverse();

    // Re-place on resize and once the page (and its fonts) have loaded. Free placement only
    // redoes it when the width changes, since phones fire resize as the address bar slides.
    const placers = [];
    let laidOutWidth = 0;
    function relayout(force) {
        const w = document.documentElement.clientWidth;
        if (FREE && !force && w === laidOutWidth) return;
        laidOutWidth = w;
        if (FREE) findSpots();
        placers.forEach(p => p());
    }
    if (FREE) { findSpots(); laidOutWidth = document.documentElement.clientWidth; }
    chosen.forEach(function (id, i) { makeSticker(id, sides[i % 2], i); });
    window.addEventListener('resize', () => relayout(false));
    window.addEventListener('load', () => relayout(true));
    if (FREE && document.fonts) document.fonts.ready.then(() => relayout(true));

    function makeSticker(id, side, index) {
        const info = data.items[id];
        const el = document.createElement('div');
        el.className = 'landmark-sticker';
        el.setAttribute('role', 'button');
        el.tabIndex = 0;
        el.setAttribute('aria-label', 'Scratch-off sticker. Scratch it, double-tap it, or press Enter to reveal it.');
        el.style.setProperty('--tilt', (Math.random() * 20 - 10).toFixed(1) + 'deg');
        el.style.setProperty('--sticker-size', SIZE + 'px');
        el.innerHTML = '<div class="landmark-sticker-card"><img class="landmark-sticker-art" alt="" draggable="false">'
            + '<canvas class="landmark-sticker-cover"></canvas></div>'
            + '<div class="landmark-sticker-label">Scratch to reveal</div>';
        const art = el.querySelector('.landmark-sticker-art');
        const cover = el.querySelector('.landmark-sticker-cover');
        const label = el.querySelector('.landmark-sticker-label');
        document.body.appendChild(el);

        // A random spot in its side's gap. The height from the top down to the footer (on
        // short pages, the first screen above the floating nav) is split into one band per
        // sticker, so they spread evenly from top to bottom. A sticker with no room on its
        // side moves to the other side; the bands keep them apart.
        const fx = Math.random(), fy = Math.random();
        let moved = false;
        function place() {
            if (moved) { moveTo(parseFloat(el.style.left), parseFloat(el.style.top)); return; }
            if (FREE) {
                const spot = spots[index];
                el.hidden = !spot;
                if (!spot) return;
                el.style.left = (spot[0] + (BOX_W - SIZE) / 2) + 'px';
                el.style.top = spot[1] + 'px';
                return;
            }
            const sideNow = s => (fits(s) ? s : s === 'left' ? 'right' : 'left');
            const s = sideNow(side);
            const [x0, x1] = gap(s);
            el.hidden = x1 < x0;
            if (el.hidden) return;
            const vh = window.innerHeight, docH = document.documentElement.scrollHeight;
            const short = docH < vh * 1.8;
            let bottom = footer ? footer.getBoundingClientRect().top + window.scrollY : docH;
            if (short) bottom = Math.min(bottom, vh - 120);
            // Long pages: one band per sticker down the whole page. Short pages: the stickers
            // on each side share that side's height, and any that don't fit stay hidden.
            let slot = index, slots = count;
            if (short) {
                const order = chosen.map((c, i) => sideNow(sides[i % 2]));
                slots = order.filter(o => o === s).length;
                slot = order.slice(0, index).filter(o => o === s).length;
            }
            const room = bottom - 40 - TOP;
            const band = Math.max(SIZE + 60, room / slots);
            if (short && (slot + 1) * band > room + 1) { el.hidden = true; return; }
            const slack = band - SIZE - 60;
            el.style.left = (x0 + fx * (x1 - x0) + window.scrollX) + 'px';
            el.style.top = (TOP + slot * band + slack * (0.15 + fy * 0.7)) + 'px';
        }
        place();
        placers.push(place);

        let ctx = null, dpr = 1, inside = null, total = GRID * GRID, threshold = 0.35, revealed = false;
        const scratched = new Set();

        // The coating: whatever is left of the cover filled in this mode's grey, with light
        // speckle so it reads as a scratch coating. Scratching then erases it.
        function coat() {
            ctx.globalCompositeOperation = 'source-in';
            ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#5E5E5E' : '#3A3A3A';
            ctx.fillRect(0, 0, cover.width, cover.height);
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = 'rgba(255,255,255,0.12)';
            for (let i = 0; i < 420; i++) ctx.fillRect(Math.random() * cover.width, Math.random() * cover.height, 2 * dpr, 2 * dpr);
            ctx.globalCompositeOperation = 'destination-out';
        }
        // Pages that switch mode in place (the case studies) send "modechange": the coating
        // turns the new mode's grey, keeping whatever has already been scratched off.
        document.addEventListener('modechange', function () {
            if (ctx && !revealed) coat();
        });

        // The cover is the sticker's own outline filled in as a shadow, with light speckle
        // so it reads as a scratch coating.
        function paintCover() {
            dpr = Math.min(window.devicePixelRatio || 1, 3);
            cover.width = cover.height = Math.round(SIZE * dpr);
            ctx = cover.getContext('2d');
            ctx.drawImage(art, 0, 0, cover.width, cover.height);
            coat();
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
        art.src = 'stickers/' + (info.file || id + '.svg');
    }
})();
