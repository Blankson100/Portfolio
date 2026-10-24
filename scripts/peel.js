// The "don't just read" sticker beside Projects on the phone homepage has its top-right
// corner peeling up. Drag the corner to peel it further (it never comes off: it resists,
// then stops) or press it flat; let go and it springs back to its resting curl.
// The label is stickers/dont-just-read.png (tools/build-projects-stickers.js), drawn flat
// and square-on in the -15,-20 to 205,92 view. This swaps the <img> for an SVG that tilts
// it, cuts the corner off along a fold line and draws the corner folded back over it. If
// the script doesn't run, the plain label shows instead, tilted by mobile.css.
(function () {
    const img = document.querySelector('img.m-read-sticker');
    if (!img || !window.DOMPoint) return;
    const NS = 'http://www.w3.org/2000/svg';

    const LW = 190, LH = 72, R = 14, EDGE = 6, TILT = 5;
    // The fold is the line x - y = K across the top-right corner: everything past it is
    // folded back. A bigger K is a smaller peel.
    const REST = 160;                     // how it sits
    const DEEPEST = 128;                  // as far as it will go
    const FLAT = LW + 2 * EDGE;           // pressed flat (the line just touches the corner)
    const CX = LW + EDGE, CY = -EDGE;     // the corner of the die-cut edge

    // The die-cut's outer edge round the top-right corner, from along the top, round the
    // curve and down the right side, in order.
    const edge = [];
    const ax = LW - R, ay = R, ar = R + EDGE;
    for (let x = 60; x < ax; x += 1) edge.push([x, CY]);
    for (let a = -90; a <= 0; a += 3) edge.push([ax + ar * Math.cos(a * Math.PI / 180), ay + ar * Math.sin(a * Math.PI / 180)]);
    for (let y = ay + 1; y <= LH + EDGE; y += 1) edge.push([CX, y]);

    const el = (name, attrs, parent) => {
        const node = document.createElementNS(NS, name);
        for (const k in attrs) node.setAttribute(k, attrs[k]);
        if (parent) parent.appendChild(node);
        return node;
    };
    const svg = el('svg', { class: img.className.baseVal || img.className, viewBox: '-15 -20 220 112', role: 'img', 'aria-label': 'don’t just read' });
    const defs = el('defs', {}, svg);
    const mask = el('mask', { id: 'peel-cut', maskUnits: 'userSpaceOnUse', x: -60, y: -80, width: 340, height: 260 }, defs);
    el('rect', { x: -60, y: -80, width: 340, height: 260, fill: '#fff' }, mask);
    const cut = el('path', { fill: '#000' }, mask);
    // The sticker's paper backing, shaded darker towards the fold
    const back = el('linearGradient', { id: 'peel-back', gradientUnits: 'userSpaceOnUse' }, defs);
    el('stop', { offset: 0, 'stop-color': '#D5D5CF' }, back);
    el('stop', { offset: 0.45, 'stop-color': '#EEEEE9' }, back);
    el('stop', { offset: 1, 'stop-color': '#FFFFFF' }, back);
    const lift = el('filter', { id: 'peel-lift', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
    el('feDropShadow', { dx: -1.5, dy: 2.5, stdDeviation: 2, 'flood-color': '#000', 'flood-opacity': 0.3 }, lift);

    const tilted = el('g', { transform: `rotate(${TILT} ${LW / 2} ${LH / 2})` }, svg);
    const label = el('image', { x: -15, y: -20, width: 220, height: 112, mask: 'url(#peel-cut)' }, tilted);
    label.setAttribute('href', img.getAttribute('src'));
    label.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', img.getAttribute('src'));
    // What you can grab: the folded corner, and a finger-sized circle round it.
    const handle = el('g', { class: 'm-peel-handle' }, tilted);
    el('circle', { cx: CX - 18, cy: CY + 18, r: 34, fill: 'transparent', 'pointer-events': 'all' }, handle);
    const flap = el('polygon', { fill: 'url(#peel-back)', filter: 'url(#peel-lift)' }, handle);

    let K = REST;
    function draw() {
        cut.setAttribute('d', `M${K - 80},-80 L${280},-80 L280,${280 - K} Z`);
        // The part of the edge past the fold, mirrored across it.
        const pts = edge.filter(([x, y]) => x - y >= K).map(([x, y]) => [y + K, x - K]);
        flap.setAttribute('points', pts.map(([x, y]) => x.toFixed(1) + ',' + y.toFixed(1)).join(' '));
        // Shade from the fold to the tip (the corner, mirrored).
        const tx = CY + K, ty = CX - K;
        back.setAttribute('x1', ((CX + tx) / 2).toFixed(1));
        back.setAttribute('y1', ((CY + ty) / 2).toFixed(1));
        back.setAttribute('x2', tx.toFixed(1));
        back.setAttribute('y2', ty.toFixed(1));
    }
    draw();
    img.replaceWith(svg);

    // Dragging: the tip follows the finger along its path (the corner mirrored across a
    // fold that slides diagonally), picking up from wherever it was grabbed.
    const local = e => new DOMPoint(e.clientX, e.clientY).matrixTransform(tilted.getScreenCTM().inverse());
    const foldFor = p => (p.x - p.y + CX - CY) / 2;
    let grab = null, raf = 0;
    handle.addEventListener('pointerdown', e => {
        cancelAnimationFrame(raf);
        grab = { id: e.pointerId, offset: K - foldFor(local(e)) };
        handle.setPointerCapture(e.pointerId);
        svg.classList.add('is-peeling');
        e.preventDefault();
    });
    handle.addEventListener('pointermove', e => {
        if (!grab || e.pointerId !== grab.id) return;
        let k = foldFor(local(e)) + grab.offset;
        // Past the deepest peel it pulls back harder and harder, then stops.
        if (k < DEEPEST) k = Math.max(DEEPEST - 8, DEEPEST - (DEEPEST - k) * 0.2);
        K = Math.min(FLAT, k);
        draw();
    });
    const release = e => {
        if (!grab || e.pointerId !== grab.id) return;
        grab = null;
        svg.classList.remove('is-peeling');
        settle();
    };
    handle.addEventListener('pointerup', release);
    handle.addEventListener('pointercancel', release);
    // Keep the page from scrolling while the corner is being dragged on a phone.
    handle.addEventListener('touchstart', e => e.preventDefault(), { passive: false });

    // Let go: it springs back to its resting curl, overshooting a touch.
    function settle() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { K = REST; draw(); return; }
        const from = K, start = performance.now(), DUR = 520, c1 = 1.70158, c3 = c1 + 1;
        (function step(now) {
            const p = Math.min(1, (now - start) / DUR), q = p - 1;
            K = from + (REST - from) * (1 + c3 * q * q * q + c1 * q * q);
            draw();
            if (p < 1) raf = requestAnimationFrame(step);
        })(start);
    }
})();
