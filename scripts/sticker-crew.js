// A crew for a page that's still being built: die-cut stickers (from stickers/stickers.js)
// that move about. The script tag's data-crew picks which crew.
//   construction (Roster): eight stand beside the cover and work in place (crane swaying,
//     digger digging, builder hammering, people chatting, people in suits making a deal and
//     visiting the site); the sign carriers, the plank carrier and a suit running late walk
//     along the bottom of the cover, the bulldozer drives back and forth, a barrier stands at
//     one bottom corner and two suits with the blueprints at the other.
//   bees (Clostra): six beside the cover build, fill and cap honeycomb and do the waggle
//     dance; three fly across the page with pollen, nectar and wax; a bee on a flower sits
//     at the corner, in a meadow growing under the cover down to the footer. The sun peeks
//     out from behind the cover by day in Accra and the moon by night (like the avatar, add
//     ?avatarDate=2026-10-12T21 to preview an hour). Tap a bee and it stops to say Clostra
//     is under construction in a drawn speech bubble.
// Any of them can be dragged somewhere else. Decoration only, so screen readers skip it;
// with reduced motion everyone holds still.
(function () {
    const data = window.STICKERS;
    const cover = document.querySelector('.project-hero');
    const script = document.currentScript;
    if (!data || !cover) return;

    const SIZE = parseInt(script && script.dataset.size, 10) || 120;   // smaller on the phone pages (data-size)
    // side: beside the cover, top to bottom on each side. lane: along the bottom of the
    // cover (drop = how far below), or flying across at a height on it (y = 0 top, 1 bottom);
    // ones that stand stay at the cover's bottom right corner, or bottom left (corner: 'left').
    // say: what one says when it's tapped. meadow: grass and flowers growing under the cover.
    // sky: the sun or moon behind the cover's top-right corner.
    const CREWS = {
        construction: {
            side: [
                { id: 'crane', side: 'left', move: 'sway' },
                { id: 'suitdeal', side: 'left', move: 'bob', delay: -0.3 },
                { id: 'waiting', side: 'left', move: 'bob' },
                { id: 'handshake', side: 'left', move: 'bob', delay: -0.8 },
                { id: 'excavator', side: 'right', move: 'dig' },
                { id: 'suitvisit', side: 'right', move: 'bob', delay: -1.1 },
                { id: 'hammering', side: 'right', move: 'hammer' },
                { id: 'siteme', side: 'right', move: 'bob', delay: -0.5 },
            ],
            lane: [
                { id: 'barrier', move: 'stand', drop: 4, at: 0.82 },
                { id: 'suitplans', move: 'stand', corner: 'left', drop: 8, at: 0.1 },
                { id: 'suitwalk', move: 'walk-right', drop: 14, time: 20, delay: -16, at: 0.7 },
                { id: 'bulldozer', move: 'drive', drop: 0, time: 26, delay: -13, at: 0.6 },
                { id: 'signcarry', move: 'walk-right', drop: 10, time: 24, delay: -7, at: 0.3 },
                { id: 'plankcarry', move: 'walk-left', drop: 18, time: 17, delay: -4, at: 0.5 },
            ],
        },
        bees: {
            side: [
                { id: 'combbuild', side: 'left', move: 'hammer' },
                { id: 'beedance', side: 'left', move: 'waggle' },
                { id: 'hivebusy', side: 'left', move: 'bob', delay: -0.8 },
                { id: 'combfill', side: 'right', move: 'hover' },
                { id: 'combcap', side: 'right', move: 'bob', delay: -0.5 },
                { id: 'beecomb', side: 'right', move: 'hover', delay: -0.4 },
            ],
            lane: [
                { id: 'flowerbee', move: 'stand', drop: 4, at: 0.82 },
                { id: 'pollenbee', move: 'fly-right', y: 0.12, time: 19, delay: -6, at: 0.25 },
                { id: 'nectarbee', move: 'fly-left', y: 0.55, time: 23, delay: -15, at: 0.6 },
                { id: 'waxbee', move: 'fly-right', drop: 6, time: 27, delay: -20, at: 0.45 },
            ],
            say: 'Bzz! Clostra is under construction',
            meadow: true,
            sky: true,
        },
    };
    const crewSet = CREWS[script && script.dataset.crew] || CREWS.construction;
    const SIDE = crewSet.side, LANE = crewSet.lane;

    const layer = document.createElement('div');
    layer.className = 'crew-layer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);

    function make(c) {
        const info = data.items[c.id];
        if (!info) return null;
        const el = document.createElement('div');
        el.className = 'crew crew-' + c.move;
        el.style.setProperty('--size', SIZE + 'px');
        if (c.time) el.style.setProperty('--time', c.time + 's');
        if (c.delay) el.style.setProperty('--delay', c.delay + 's');
        el.innerHTML = '<img alt="" draggable="false">';
        el.firstChild.src = 'stickers/' + (info.file || c.id + '.svg');
        layer.appendChild(el);
        return el;
    }
    // Where across its side's gap each one stands: alternating between the inner and outer
    // half (which comes first is random), so neighbours above and below don't pile up.
    const flip = { left: Math.random() < 0.5, right: Math.random() < 0.5 }, count = { left: 0, right: 0 };
    const side = SIDE.map(function (c) {
        const outer = (count[c.side]++ % 2 === 1) !== flip[c.side];
        return { c: c, el: make(c), fx: (outer ? 0.55 : 0) + Math.random() * 0.45 };
    });
    const lane = LANE.map(c => ({ c: c, el: make(c) }));
    const walking = m => /^(walk|fly)-|^drive$/.test(m);

    // The meadow: grass and wildflowers (white, yellow and blue like the cover's painting, and
    // pink) on ground just below the cover. The back half sits behind the cover, so the tall
    // flowers peek out at its sides; short grass and little flowers in front tuck round its
    // bottom edge, staying clear of the words on it. Drawn for the page's width, a little
    // different each visit, and swaying in the breeze.
    const GROUND = 80, MEADOW_H = 144;   // ground line and height in the meadow's drawing
    const GREENS = ['#5FB33A', '#7CC24A', '#4E9A2E', '#8ACF55'], GRASS_LINE = '#2E5E1A';
    const BLOOMS = [   // petal and middle colours, petal count and shape
        { petal: '#FFFFFF', mid: '#FFC93C', k: 10, rx: 3.2, ry: 8 },
        { petal: '#FFD23F', mid: '#F2A900', k: 5, rx: 6, ry: 6.5 },
        { petal: '#4A7BD8', mid: '#2B3F8F', k: 8, rx: 3, ry: 7.5 },
        { petal: '#E879A6', mid: '#FFD23F', k: 8, rx: 4.5, ry: 8 },
    ];
    const rnd = (a, b) => a + Math.random() * (b - a);
    const pick = list => list[Math.floor(Math.random() * list.length)];
    const n1 = v => Math.round(v * 10) / 10;
    const sway = (x, b) => `transform-origin:${n1(x)}px ${n1(b)}px;--t:${rnd(2.4, 4).toFixed(2)}s;--d:-${rnd(0, 4).toFixed(2)}s`;
    // A clump of grass: blades as one outline (dark green, softer than the flowers' black), left
    // open along the ground.
    function tuft(x, b, h, w) {
        const n = 3 + Math.floor(Math.random() * 3), x0 = x - w / 2;
        let d = `M${n1(x0)},${n1(b)}`;
        for (let i = 0; i < n; i++) {
            const mid = x0 + (i + 0.5) * w / n, hh = h * rnd(0.6, 1), end = x0 + (i + 1) * w / n;
            d += ` Q${n1(mid - 1)},${n1(b - hh * 0.55)} ${n1(mid + rnd(-6, 6))},${n1(b - hh)}`
                + ` Q${n1(mid + 1)},${n1(b - hh * 0.5)} ${n1(end)},${n1(i === n - 1 ? b : b - hh * 0.2)}`;
        }
        return `<path class="mw-sway mw-grass" style="${sway(x, b)}" d="${d}" fill="${pick(GREENS)}" stroke="${GRASS_LINE}"/>`;
    }
    function flower(x, b, h, s) {
        const f = pick(BLOOMS), lean = rnd(-8, 8), hx = n1(x + lean), hy = n1(b - h);
        const stem = `M${n1(x)},${n1(b + 4)} Q${n1(x + lean * 0.2)},${n1(b - h * 0.5)} ${hx},${hy}`;
        const side = Math.random() < 0.5 ? -1 : 1, lx = n1(x + lean * 0.15), ly = n1(b - h * 0.35);
        const leaf = `M${lx},${ly} Q${n1(lx + side * 10 * s)},${n1(ly - 12 * s)} ${n1(lx + side * 18 * s)},${n1(ly - 6 * s)} Q${n1(lx + side * 9 * s)},${n1(ly + 2 * s)} ${lx},${ly} Z`;
        let petals = '';
        for (let i = 0; i < f.k; i++) petals += `<ellipse cx="${hx}" cy="${n1(hy - f.ry * s)}" rx="${n1(f.rx * s)}" ry="${n1(f.ry * s)}" transform="rotate(${n1(i * 360 / f.k)} ${hx} ${hy})" fill="${f.petal}"/>`;
        return `<g class="mw-sway" style="${sway(x, b)}"><path d="${stem}" fill="none" stroke-width="4.5"/>`
            + `<path d="${stem}" fill="none" stroke="#3E8E2B" stroke-width="2"/>${h > 20 ? `<path d="${leaf}" fill="#5FB33A"/>` : ''}`
            + `${petals}<circle cx="${hx}" cy="${hy}" r="${n1(5 * s)}" fill="${f.mid}"/></g>`;
    }
    // Plants every so often along the width, from what plant(x) returns.
    function row(w, gap, plant) {
        let out = '';
        for (let x = rnd(0, gap[1]); x < w + 20; x += rnd(gap[0], gap[1])) out += plant(x);
        return out;
    }
    const svg = (w, body) => `<svg width="${w}" height="${MEADOW_H}" viewBox="0 0 ${w} ${MEADOW_H}" stroke="#1F1F1F" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">${body}</svg>`;
    function grow(w) {
        // Tall grass and flowers, then the top of the ground over their roots (the field
        // carries the ground on down to the footer).
        let edge = `M0,${GROUND}`;
        for (let x = 0; x < w; x += 80) edge += ` Q${x + 40},${n1(GROUND + rnd(-4, 4))} ${x + 80},${GROUND}`;
        meadow.back.innerHTML = svg(w, row(w, [28, 48], x => tuft(x, GROUND + 3, rnd(24, 40), rnd(22, 34)))
            + row(w, [40, 90], x => flower(x, GROUND + 2, rnd(30, 62), rnd(0.9, 1.2)))
            + `<path d="${edge} L${w},${GROUND + 10} L0,${GROUND + 10} Z" fill="#7CC24A" stroke="none"/><path d="${edge}" fill="none" stroke="${GRASS_LINE}"/>`);
        // Short grass and little flowers in front.
        meadow.front.innerHTML = svg(w, row(w, [18, 32], x => tuft(x, GROUND + rnd(4, 10), rnd(10, 18), rnd(16, 24)))
            + row(w, [70, 140], x => flower(x, GROUND + 8, rnd(8, 14), rnd(0.7, 0.85))));
        meadow.w = w;
    }
    const meadow = crewSet.meadow ? { back: document.createElement('div'), front: document.createElement('div'), field: document.createElement('div'), w: 0 } : null;
    if (meadow) {
        meadow.back.className = 'meadow meadow-back';
        meadow.front.className = 'meadow meadow-front';
        meadow.field.className = 'meadow meadow-field';
        layer.prepend(meadow.field, meadow.back, meadow.front);
        document.body.classList.add('has-meadow');   // so the time and menu stay readable on the grass
    }

    // The sky: the sun by day and the moon by night in Accra (6am to 6pm is day), peeking
    // out from behind the cover's top-right corner. Drawn as stickers are, a black outline
    // over a white die-cut edge, with shapes a little uneven rather than an SVG filter (which
    // Safari draws blurry). The sun's rays turn slowly; the stars twinkle.
    const SKY = 180, MID = SKY / 2;   // the drawing's size; its middle sits on the corner
    const SHOWN = Math.round(SKY * SIZE / 120);   // drawn smaller with a smaller crew (the phone)
    function accraHour() {
        const preview = new URLSearchParams(window.location.search).get('avatarDate');
        if (preview) { const m = preview.match(/T(\d{1,2})$/); return m ? +m[1] : 12; }
        const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Accra', hour: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
        return parseInt(parts.find(p => p.type === 'hour').value, 10);
    }
    // A hand-drawn closed curve through points: smoothed through their midpoints.
    function smooth(pts) {
        const mid = (p, q) => `${n1((p[0] + q[0]) / 2)},${n1((p[1] + q[1]) / 2)}`;
        let d = `M${mid(pts[pts.length - 1], pts[0])}`;
        pts.forEach((p, i) => { d += ` Q${n1(p[0])},${n1(p[1])} ${mid(p, pts[(i + 1) % pts.length])}`; });
        return d + ' Z';
    }
    function wobblyCircle(cx, cy, r) {
        const ph = rnd(0, 6.3);
        return smooth(Array.from({ length: 18 }, (_, i) => {
            const a = i / 18 * 2 * Math.PI, rr = r + Math.sin(a * 3 + ph) * 1.2 + rnd(-0.5, 0.5);
            return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
        }));
    }
    // Die-cut: the shape in thick white first, then itself on top.
    const cut = (d, fill, extra = '') => `<path d="${d}" fill="#fff" stroke="#fff" stroke-width="10"/><path d="${d}" fill="${fill}"${extra}/>`;
    function star(x, y, r) {
        let d = '';
        for (let i = 0; i < 10; i++) {
            const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.5 : r;
            d += `${i ? ' L' : 'M'}${n1(x + rr * Math.cos(a))},${n1(y + rr * Math.sin(a))}`;
        }
        return `<g class="sky-star" style="--d:-${rnd(0, 2).toFixed(2)}s">${cut(d + ' Z', '#FFD23F', ' stroke-width="1.8"')}</g>`;
    }
    function sun() {
        let rays = '';
        for (let i = 0; i < 12; i++) {
            const a = i * Math.PI / 6, len = (i % 2 ? 66 : 78) + rnd(-2, 2);
            const p = (ang, r) => `${n1(MID + Math.cos(ang) * r)},${n1(MID + Math.sin(ang) * r)}`;
            rays += `M${p(a - 0.17, 44)} L${p(a, len)} L${p(a + 0.17, 44)} Z `;
        }
        const disc = wobblyCircle(MID, MID, 46);
        // Face a little up and right of the middle, clear of the cover.
        return `<path class="sky-spin" d="${rays}" fill="#fff" stroke="#fff" stroke-width="10"/><path d="${disc}" fill="#fff" stroke="#fff" stroke-width="10"/>`
            + `<path class="sky-spin" d="${rays}" fill="#FFB020"/><path d="${disc}" fill="#FFC93C"/>`
            + `<ellipse cx="${MID - 6}" cy="${MID - 12}" rx="3.5" ry="5" fill="#1F1F1F" stroke="none"/><ellipse cx="${MID + 18}" cy="${MID - 12}" rx="3.5" ry="5" fill="#1F1F1F" stroke="none"/>`
            + `<circle cx="${MID - 14}" cy="${MID + 2}" r="6" fill="#FF8FA3" stroke="none" opacity="0.8"/><circle cx="${MID + 26}" cy="${MID + 2}" r="6" fill="#FF8FA3" stroke="none" opacity="0.8"/>`
            + `<path d="M${MID - 6},${MID + 2} Q${MID + 6},${MID + 13} ${MID + 18},${MID + 2}" fill="none" stroke-width="3"/>`;
    }
    function moon() {
        // A crescent: the moon's circle with a smaller one cut from its lower left, so the
        // fat side (and its sleepy face) shows above and right of the cover.
        const d = `M47.2,73.1 A46,46 0 1 1 97,135.5 A40,40 0 0 0 47.2,73.1 Z`;
        return cut(d, '#FFE9A8')
            + `<path d="M103,64 Q108,69 113,64" fill="none" stroke-width="2.6"/>`
            + `<circle cx="120" cy="74" r="4.5" fill="#FF8FA3" stroke="none" opacity="0.8"/>`
            + `<path d="M106,79 Q111,83 116,78" fill="none" stroke-width="2.6"/>`
            + star(156, 54, 12) + star(174, 104, 9) + star(142, 144, 8);   // below the blur at the top
    }
    const sky = crewSet.sky ? document.createElement('div') : null;
    function drawSky() {
        const time = (h => (h >= 6 && h < 18 ? 'day' : 'night'))(accraHour());
        if (sky.dataset.time === time) return;
        sky.dataset.time = time;
        sky.className = 'sky sky-' + time;
        sky.innerHTML = `<svg width="${SHOWN}" height="${SHOWN}" viewBox="0 0 ${SKY} ${SKY}" stroke="#1F1F1F" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">${time === 'day' ? sun() : moon()}</svg>`;
    }
    if (sky) {
        drawSky();
        layer.prepend(sky);
        setInterval(drawSky, 5 * 60 * 1000);   // the sun sets and rises while the page is open
    }

    function place() {
        const vw = document.documentElement.clientWidth;
        const r = cover.getBoundingClientRect();
        const top = r.top + window.scrollY, bottom = r.bottom + window.scrollY;
        const left = r.left + window.scrollX, right = r.right + window.scrollX;

        // The meadow's ground just below the cover, and the field from there down to the
        // footer; the plants are redrawn only when the page gets wider.
        if (meadow) {
            if (vw > meadow.w) grow(Math.ceil(vw / 400) * 400);
            const ground = bottom + 6, footer = document.querySelector('.footer');
            const end = footer ? footer.getBoundingClientRect().top + window.scrollY : document.documentElement.scrollHeight;
            meadow.back.style.top = meadow.front.style.top = (ground - GROUND) + 'px';
            meadow.field.style.top = (ground + 4) + 'px';
            meadow.field.style.height = Math.max(0, end - ground - 4) + 'px';
        }
        // The sky's middle just inside the cover's top-right corner.
        if (sky) {
            sky.style.left = (right - 4 - SHOWN / 2) + 'px';
            sky.style.top = (top + 4 - SHOWN / 2) + 'px';
        }
        const sidebar = document.querySelector('.project-sidebar');
        const edge = sidebar ? sidebar.getBoundingClientRect().right + window.scrollX + 16 : 16;
        const gaps = { left: [edge, left - SIZE - 24], right: [right + 24, vw - SIZE - 16] };

        // Beside the cover: spread from its top to its bottom, a random spot across the gap
        // (the top one on the right standing clear of the sun or moon); hidden when that side
        // has no room.
        ['left', 'right'].forEach(function (s) {
            const crew = side.filter(o => o.el && o.c.side === s);
            const [x0, x1] = gaps[s];
            crew.forEach(function (o, i) {
                if (o.moved || o.bubble) return;
                o.el.hidden = x1 < x0;
                const from = sky && s === 'right' && i === 0 ? Math.min(x1, x0 + 70) : x0;
                const step = crew.length > 1 ? (r.height - SIZE) / (crew.length - 1) : 0;
                o.el.style.left = (from + o.fx * Math.max(0, x1 - from)) + 'px';
                o.el.style.top = (top + i * step) + 'px';
            });
        });

        // Along the bottom: feet just below the cover's bottom edge, or flyers at their height
        // on it; they cross the whole page. --rest is where each one stands if motion is reduced.
        lane.forEach(function (o) {
            if (!o.el) return;
            o.el.style.setProperty('--lane', vw + 'px');
            o.el.style.setProperty('--rest', Math.round(o.c.at * (vw - SIZE)) + 'px');
            if (o.moved || o.bubble) return;
            o.el.style.top = (o.c.y != null ? top + o.c.y * r.height - SIZE / 2 : bottom - SIZE * 0.55 + o.c.drop) + 'px';
            o.el.style.left = '0px';
            if (o.c.move === 'stand') o.el.style.left = (o.c.corner === 'left' ? Math.max(16, left - SIZE * 0.5) : Math.min(vw - SIZE - 16, right - SIZE * 0.5)) + 'px';
        });
    }
    place();
    window.addEventListener('resize', place);
    window.addEventListener('load', place);

    // Any of them can be picked up and dropped somewhere else. Ones working in place stay
    // where they're dropped; walkers, flyers and the bulldozer carry on from the drop spot, at
    // that height. Scrolling mid-drag carries the sticker along. A tap that doesn't drag makes
    // a crew with something to say stop for a moment and say it in a speech bubble.
    let drag = null;
    function follow() {
        const vw = document.documentElement.clientWidth, docH = document.documentElement.scrollHeight;
        const x = Math.max(0, Math.min(vw - SIZE, drag.cx + window.scrollX - drag.dx));
        const y = Math.max(0, Math.min(docH - SIZE, drag.cy + window.scrollY - drag.dy));
        drag.o.el.style.left = x + 'px';
        drag.o.el.style.top = y + 'px';
    }
    // Set it going again from wherever it is now.
    function resume(o) {
        const el = o.el, m = o.c.move;
        if (walking(m)) {
            // Pick the point in the walk (or flight, or drive) that matches where it is.
            const vw = document.documentElement.clientWidth, x = parseFloat(el.style.left);
            const p = /-right$/.test(m) ? (x + SIZE) / (vw + SIZE)
                : /-left$/.test(m) ? (vw - x) / (vw + SIZE)
                : 0.48 * x / Math.max(1, vw - SIZE);
            el.style.setProperty('--delay', (-p * o.c.time).toFixed(2) + 's');
            el.style.left = '0px';
            el.style.animation = '';
        }
        el.style.transform = '';
    }
    function hush(o) {
        clearTimeout(o.timer);
        if (o.bubble) o.bubble.remove();
        o.bubble = null;
    }
    // A drawn speech bubble above it, like the stickers: a slightly uneven outline over a
    // white die-cut edge, handwritten words, kept on screen with its tail pointing at it. It
    // holds still (a flyer keeps flapping on the spot) until the bubble goes, then carries on.
    const SAY_FONT = '600 21px Caveat, cursive', PAD = 7, BOX_H = 40, TAIL = 15, RAD = 16;
    if (crewSet.say && document.fonts) document.fonts.load('600 21px Caveat').catch(function () {});
    let ruler = null;
    function bubblePath(w, tx) {
        const j = () => rnd(-1.2, 1.2), x0 = PAD, y0 = PAD, x1 = PAD + w, y1 = PAD + BOX_H;
        return `M${x0 + RAD},${n1(y0 + j())} Q${n1((x0 + x1) / 2)},${n1(y0 + rnd(-2.5, 1))} ${x1 - RAD},${n1(y0 + j())}`
            + ` Q${n1(x1 + j())},${n1(y0 + j())} ${n1(x1 + j())},${y0 + RAD} Q${n1(x1 + rnd(-1, 2))},${(y0 + y1) / 2} ${n1(x1 + j())},${y1 - RAD}`
            + ` Q${n1(x1 + j())},${n1(y1 + j())} ${x1 - RAD},${n1(y1 + j())} Q${n1((x1 - RAD + tx + 8) / 2)},${n1(y1 + rnd(-1, 1.5))} ${n1(tx + 8)},${y1}`
            + ` Q${n1(tx + 3)},${y1 + 6} ${n1(tx - 3)},${y1 + TAIL} Q${n1(tx - 4)},${y1 + 6} ${n1(tx - 9)},${y1}`
            + ` Q${n1((x0 + RAD + tx - 9) / 2)},${n1(y1 + rnd(-1, 2))} ${x0 + RAD},${n1(y1 + j())}`
            + ` Q${n1(x0 + j())},${n1(y1 + j())} ${n1(x0 + j())},${y1 - RAD} Q${n1(x0 + rnd(-2, 1))},${(y0 + y1) / 2} ${n1(x0 + j())},${y0 + RAD}`
            + ` Q${n1(x0 + j())},${n1(y0 + j())} ${x0 + RAD},${n1(y0 + j())} Z`;
    }
    function speak(o) {
        ruler = ruler || document.createElement('canvas').getContext('2d');
        ruler.font = SAY_FONT;
        const w = Math.ceil(ruler.measureText(crewSet.say).width) + 36, W = w + PAD * 2, H = BOX_H + TAIL + PAD * 2;
        const vw = document.documentElement.clientWidth;
        const x = parseFloat(o.el.style.left) + SIZE / 2, y = parseFloat(o.el.style.top);
        const left = Math.max(4, Math.min(vw - W - 4, x - W / 2));
        const tx = Math.max(PAD + RAD + 12, Math.min(PAD + w - RAD - 12, x - left)), d = bubblePath(w, tx);
        const b = document.createElement('div');
        b.className = 'crew-say';
        b.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" stroke-linejoin="round" stroke-linecap="round">`
            + `<path d="${d}" fill="#fff" stroke="#fff" stroke-width="9"/><path d="${d}" fill="#fff" stroke="#1F1F1F" stroke-width="2.6"/>`
            + `<text x="${PAD + w / 2}" y="${PAD + BOX_H / 2 + 7}" text-anchor="middle" fill="#1F1F1F" style="font:${SAY_FONT}"></text></svg>`;
        b.querySelector('text').textContent = crewSet.say;
        layer.appendChild(b);
        b.style.left = left + 'px';
        b.style.top = Math.max(4, y - H + 8) + 'px';
        b.style.setProperty('--tail', tx + 'px');
        o.el.style.transform = 'none';
        o.bubble = b;
        o.timer = setTimeout(function () {
            b.classList.add('crew-say-leaving');
            o.timer = setTimeout(function () { hush(o); resume(o); }, 250);
        }, 2600);
    }
    function drop() {
        if (!drag) return;
        const o = drag.o, tapped = !drag.dragged;
        o.el.classList.remove('is-dragging');
        drag = null;
        if (tapped && crewSet.say) speak(o);
        else resume(o);
    }
    lane.concat(side).forEach(function (o) {
        if (!o.el) return;
        o.el.addEventListener('pointerdown', function (e) {
            if (e.button !== 0 || drag) return;
            e.preventDefault();
            hush(o);
            const box = o.el.getBoundingClientRect();
            // Freeze it where it is: walkers and flyers stop while held.
            o.el.style.animation = 'none';
            o.el.style.left = (box.left + window.scrollX) + 'px';
            o.el.style.top = (box.top + window.scrollY) + 'px';
            o.el.style.transform = 'scale(1.06)';
            drag = { o: o, id: e.pointerId, sx: e.clientX, sy: e.clientY, cx: e.clientX, cy: e.clientY, dx: e.clientX - box.left, dy: e.clientY - box.top };
            o.el.setPointerCapture(e.pointerId);
            layer.querySelectorAll('.crew').forEach(function (c) { c.style.zIndex = ''; });
            o.el.style.zIndex = 42;
            o.el.classList.add('is-dragging');
        });
        o.el.addEventListener('pointermove', function (e) {
            if (!drag || e.pointerId !== drag.id) return;
            drag.cx = e.clientX;
            drag.cy = e.clientY;
            // A wobble of a few pixels is still a tap.
            if (!drag.dragged && Math.hypot(drag.cx - drag.sx, drag.cy - drag.sy) < 6) return;
            drag.dragged = o.moved = true;
            follow();
        });
        o.el.addEventListener('pointerup', drop);
        o.el.addEventListener('pointercancel', drop);
        o.el.addEventListener('lostpointercapture', drop);
    });
    window.addEventListener('scroll', function () { if (drag && drag.dragged) follow(); }, { passive: true });
})();
