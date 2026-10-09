// Builds the avatar overlay variants into /avatar and a review page avatar-preview.html.
// Each overlay is a transparent SVG the same size as Profile.jpg (1085x1450), so it
// stacks on top of the drawing with identical object-fit/clip-path.
// Run: node tools/build-avatars.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'avatar');
const W = 1085, H = 1450;
const SKIN = '#B77B59';
const CX = 542, CY = 725; // centre of the visible round crop

function rng(seed) {
    return function () {
        seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
const f = n => Math.round(n * 10) / 10;

// Wobbly marker look to match the MS-Paint style drawing.
const ROUGH = '<filter id="rough" x="-20%" y="-20%" width="140%" height="140%">'
    + '<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="n"/>'
    + '<feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G"/></filter>';

// Motion for the drawn add-ons. SVG loaded through <img> still runs CSS animations.
// Pieces are wrapped with anim(); `a` boxes each piece so it moves around its own centre.
const MOTION = `<style>
.a{transform-box:fill-box;transform-origin:center}
@keyframes fall{0%{transform:translateY(-40px) rotate(0);opacity:0}15%,85%{opacity:1}100%{transform:translateY(80px) rotate(140deg);opacity:0}}
@keyframes flutter{0%{transform:translateY(-18px) rotate(0);opacity:0}20%,80%{opacity:1}100%{transform:translateY(34px) rotate(200deg);opacity:0}}
@keyframes rise{0%{transform:translateY(24px) scale(.8);opacity:0}25%,80%{opacity:1}100%{transform:translateY(-46px) scale(1.1);opacity:0}}
@keyframes rain{0%{transform:translateY(-60px);opacity:0}15%{opacity:1}100%{transform:translateY(110px);opacity:0}}
@keyframes drift{0%{transform:translateX(-24px);opacity:0}30%,70%{opacity:.8}100%{transform:translateX(36px);opacity:0}}
@keyframes twinkle{0%,100%{transform:scale(.75);opacity:.4}50%{transform:scale(1.15);opacity:1}}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes wave{0%,100%{transform:skewY(-5deg)}50%{transform:skewY(4deg) scaleX(.95)}}
@keyframes wiggle{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
@keyframes flap{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.55)}}
@keyframes toot{0%,100%{transform:scaleX(1)}50%{transform:scaleX(1.08)}}
@keyframes blink{0%,100%{opacity:0}50%{opacity:1}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>`;
const anim = (content, style) => `<g class="a" style="${style}">${content}</g>`;
// Same, but pivoting on a fixed point of the drawing (e.g. where an ear meets the head).
const pivot = (content, x, y, animation) => `<g style="transform-box:view-box;transform-origin:${x}px ${y}px;animation:${animation}">${content}</g>`;

function svg({ defs = '', body = '', raw = '', top = '' }) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>${ROUGH}${defs}</defs>
${MOTION}
${raw}
<g filter="url(#rough)" stroke="#000" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">
${body}
</g>
${top}
</svg>
`;
}

// Closed Catmull-Rom spline through points -> smooth path.
function smooth(pts) {
    const n = pts.length;
    const p = i => pts[(i + n) % n];
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < n; i++) {
        const p0 = p(i - 1), p1 = p(i), p2 = p(i + 1), p3 = p(i + 2);
        const c1 = [f(p1[0] + (p2[0] - p0[0]) / 6), f(p1[1] + (p2[1] - p0[1]) / 6)];
        const c2 = [f(p2[0] - (p3[0] - p1[0]) / 6), f(p2[1] - (p3[1] - p1[1]) / 6)];
        d += ` C${c1} ${c2} ${p2[0]},${p2[1]}`;
    }
    return d + ' Z';
}
function bbox(pts) {
    const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

// ---------- small shapes ----------
const flake = (cx, cy, s, c = '#7CC4F0') => {
    let d = '';
    for (const a of [0, 60, 120]) {
        const r = a * Math.PI / 180, dx = Math.cos(r) * s, dy = Math.sin(r) * s;
        d += `M${f(cx - dx)},${f(cy - dy)} L${f(cx + dx)},${f(cy + dy)} `;
    }
    return `<path d="${d}" stroke="${c}" stroke-width="8" fill="none"/>`;
};
const heart = (cx, cy, s, fill = '#E63946') =>
    `<path d="M${cx},${f(cy + 0.9 * s)} C${f(cx - 1.6 * s)},${f(cy - 0.1 * s)} ${f(cx - 0.7 * s)},${f(cy - 1.2 * s)} ${cx},${f(cy - 0.45 * s)} C${f(cx + 0.7 * s)},${f(cy - 1.2 * s)} ${f(cx + 1.6 * s)},${f(cy - 0.1 * s)} ${cx},${f(cy + 0.9 * s)} Z" fill="${fill}"/>`;
const star = (cx, cy, r, fill = '#FFE066', sw = 7) => {
    const pts = [];
    for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
        pts.push(`${f(cx + Math.cos(a) * rr)},${f(cy + Math.sin(a) * rr)}`);
    }
    return `<path d="M${pts.join(' L')} Z" fill="${fill}" stroke-width="${sw}"/>`;
};
const drop = (x, y, s = 1) =>
    `<path d="M${x},${f(y - 24 * s)} C${f(x + 15 * s)},${f(y - 4 * s)} ${f(x + 15 * s)},${f(y + 14 * s)} ${x},${f(y + 14 * s)} C${f(x - 15 * s)},${f(y + 14 * s)} ${f(x - 15 * s)},${f(y - 4 * s)} ${x},${f(y - 24 * s)} Z" fill="#5DADE2" stroke-width="6"/>`;

// Scattered confetti around the head (outside the face, inside the round crop).
function confetti(seed, count, colors, xMin = 110) {
    const R = rng(seed);
    let out = '', placed = 0, guard = 0;
    while (placed < count && guard++ < 4000) {
        const x = xMin + R() * (980 - xMin), y = 230 + R() * 760;
        const inCrop = (x - CX) ** 2 + (y - CY) ** 2 < 465 ** 2;
        const onFace = ((x - 535) / 300) ** 2 + ((y - 700) / 370) ** 2 < 1;
        if (!inCrop || onFace) continue;
        const c = colors[placed % colors.length];
        const rot = Math.round(R() * 180);
        const piece = R() < 0.7
            ? `<rect x="${f(x - 14)}" y="${f(y - 7)}" width="28" height="14" fill="${c}" stroke-width="5" transform="rotate(${rot} ${f(x)} ${f(y)})"/>`
            : `<path d="M${f(x - 18)},${f(y)} q9,-14 18,0 t18,0" fill="none" stroke="${c}" stroke-width="9" transform="rotate(${rot} ${f(x)} ${f(y)})"/>`;
        out += anim(piece, `animation:flutter ${(2.6 + R() * 1.8).toFixed(2)}s linear -${(R() * 3).toFixed(2)}s infinite`);
        placed++;
    }
    return out;
}

// ---------- beard ----------
const OUTER = [[292,605],[289,680],[303,760],[328,840],[358,905],[402,962],[452,1008],[518,1040],[585,1042],[646,1016],[700,966],[738,905],[760,830],[772,750],[777,665],[779,600]];
const OUTER_LONG = [[292,605],[289,680],[303,760],[328,840],[358,905],[395,965],[415,1040],[452,1110],[515,1152],[585,1152],[645,1110],[680,1040],[700,966],[738,905],[760,830],[772,750],[777,665],[779,600]];
const INNER_FULL = [[744,606],[737,690],[714,760],[675,798],[662,858],[622,893],[545,910],[465,903],[410,878],[386,838],[372,792],[347,742],[332,680],[329,612]];
const INNER_SHORT = [[746,610],[742,690],[730,780],[705,860],[665,928],[610,968],[540,982],[470,965],[420,925],[378,860],[350,790],[330,700],[328,615]];

function beard(id, outer, inner, seed, specks) {
    const R = rng(seed);
    const pts = outer.concat(inner);
    const d = smooth(pts);
    const [x0, y0, x1, y1] = bbox(pts);
    let gaps = '';
    for (let i = 0; i < specks; i++) {
        let x = x0 + R() * (x1 - x0), y = y0 + R() * (y1 - y0), p = `M${f(x)},${f(y)}`;
        for (let k = 0; k < 3; k++) { x += (R() - 0.5) * 26; y += (R() - 0.5) * 16; p += ` L${f(x)},${f(y)}`; }
        gaps += `<path d="${p}"/>`;
    }
    // Hair flicks poking out of the outer edge so it reads as scribbled hair, not a blob.
    let flicks = '';
    for (let i = 0; i < outer.length - 1; i++) {
        for (let k = 0; k < 3; k++) {
            const t = R(), x = outer[i][0] + (outer[i + 1][0] - outer[i][0]) * t, y = outer[i][1] + (outer[i + 1][1] - outer[i][1]) * t;
            const dx = x - 535, dy = y - 720, len = Math.hypot(dx, dy), l = 12 + R() * 14;
            flicks += `M${f(x)},${f(y)} l${f(dx / len * l + (R() - 0.5) * 10)},${f(dy / len * l + (R() - 0.5) * 10)} `;
        }
    }
    return svg({
        defs: `<clipPath id="${id}"><path d="${d}"/></clipPath>`,
        body: `<path d="${d}" fill="#16100d" stroke-width="6"/>`
            + `<g clip-path="url(#${id})" fill="none" stroke="${SKIN}" stroke-width="4" stroke-opacity=".55">${gaps}</g>`
            + `<path d="${flicks}" fill="none" stroke-width="6"/>`,
    });
}

function stubble() {
    const R = rng(11);
    const pts = OUTER.concat(INNER_FULL);
    const d = smooth(pts);
    const [x0, y0, x1, y1] = bbox(pts);
    let dots = '';
    for (let i = 0; i < 320; i++) dots += `<circle cx="${f(x0 + R() * (x1 - x0))}" cy="${f(y0 + R() * (y1 - y0))}" r="${f(2.6 + R() * 1.6)}"/>`;
    return svg({
        defs: '<clipPath id="stubble"><path d="' + d + '"/></clipPath>',
        body: `<path d="${d}" fill="#3b2418" fill-opacity=".3" stroke="none"/>`
            + `<g clip-path="url(#stubble)" fill="#1a110c" fill-opacity=".6" stroke="none">${dots}</g>`,
    });
}

// ---------- variants ----------
const V = {};

V['beard-1'] = stubble();
V['beard-2'] = beard('b2', OUTER, INNER_SHORT, 21, 45);
V['beard-3'] = beard('b3', OUTER, INNER_FULL, 31, 70);
V['beard-4'] = beard('b4', OUTER_LONG, INNER_FULL, 41, 95);

V['christmas'] = svg({
    body: `<path d="M300,384 C318,272 430,196 560,198 C665,200 765,258 818,322 L772,366 Z" fill="#D62828"/>
<path d="M640,214 C700,248 742,296 762,352" fill="none" stroke-width="7"/>
<rect x="278" y="356" width="530" height="86" rx="43" fill="#fff" transform="rotate(-4 542 398)"/>
<circle cx="824" cy="318" r="46" fill="#fff"/>
${[[190, 520, 38, 0], [905, 560, 32, -1.6], [170, 860, 28, -2.9], [925, 860, 30, -0.8], [250, 380, 24, -3.6], [840, 420, 22, -2.2]]
        .map(([x, y, s, delay]) => anim(flake(x, y, s), `animation:fall 4.5s linear ${delay}s infinite`)).join('')}`,
});

V['newyear'] = svg({
    defs: '<clipPath id="nyCone"><path d="M345,402 L398,226 L568,332 Z"/></clipPath>'
        + '<clipPath id="nyHorn"><path d="M402,832 L232,792 Q214,842 236,893 L402,852 Z"/></clipPath>',
    body: `${confetti(5, 26, ['#FF4FA3', '#3BA7F0', '#FFD23F', '#4CC36A'])}
<path d="M345,402 L398,226 L568,332 Z" fill="#FFD23F" stroke="none"/>
<g clip-path="url(#nyCone)" stroke="#FF4FA3" stroke-width="20">${[250, 310, 370, 430, 490, 550].map(x => `<path d="M${x},450 L${x + 170},180"/>`).join('')}</g>
<path d="M345,402 L398,226 L568,332 Z" fill="none"/>
<circle cx="398" cy="226" r="26" fill="#3BA7F0"/>
${pivot(`<path d="M402,832 L232,792 Q214,842 236,893 L402,852 Z" fill="#3BA7F0" stroke="none"/>
<g clip-path="url(#nyHorn)" stroke="#FFD23F" stroke-width="14">${[262, 302, 342, 382].map(x => `<path d="M${x},760 L${x + 10},920"/>`).join('')}</g>
<path d="M402,832 L232,792 Q214,842 236,893 L402,852 Z" fill="none"/>
<ellipse cx="233" cy="842" rx="16" ry="50" fill="#FF4FA3"/>`, 402, 842, 'toot 1.4s ease-in-out infinite')}
<g style="animation:blink 1.4s ease-in-out infinite"><path d="M196,800 Q171,842 196,885 M168,782 Q140,842 168,902" fill="none" stroke-width="7"/></g>`,
});

V['easter'] = svg({
    body: `${pivot(`<ellipse cx="425" cy="290" rx="50" ry="88" transform="rotate(-16 425 290)" fill="#fff"/>
<ellipse cx="425" cy="296" rx="22" ry="58" transform="rotate(-16 425 296)" fill="#F7B6D2" stroke="none"/>`, 445, 372, 'wiggle 2.2s ease-in-out infinite')}
${pivot(`<ellipse cx="655" cy="290" rx="50" ry="88" transform="rotate(14 655 290)" fill="#fff"/>
<ellipse cx="655" cy="296" rx="22" ry="58" transform="rotate(14 655 296)" fill="#F7B6D2" stroke="none"/>`, 640, 372, 'wiggle 2.2s ease-in-out -1.1s infinite')}
<path d="M325,432 Q540,298 768,418" fill="none" stroke-width="34"/>
<path d="M325,432 Q540,298 768,418" fill="none" stroke="#F48FB1" stroke-width="20"/>
${pivot(`<g transform="rotate(-14 215 1010)">
<ellipse cx="215" cy="1010" rx="60" ry="78" fill="#8FD0F5"/>
<path d="M158,995 l14,-14 l14,14 l14,-14 l14,14 l14,-14 l14,14 l14,-14 l14,14" fill="none" stroke="#F06292" stroke-width="9"/>
<circle cx="190" cy="1045" r="8" fill="#FFD23F" stroke="none"/><circle cx="228" cy="1058" r="8" fill="#FFD23F" stroke="none"/><circle cx="246" cy="1032" r="8" fill="#FFD23F" stroke="none"/>
<circle cx="196" cy="958" r="8" fill="#F06292" stroke="none"/><circle cx="234" cy="952" r="8" fill="#F06292" stroke="none"/>
</g>`, 215, 1085, 'wiggle 3s ease-in-out infinite')}`,
});

V['valentine'] = svg({
    raw: '<ellipse cx="345" cy="742" rx="46" ry="24" fill="#F06292" fill-opacity=".5"/><ellipse cx="724" cy="736" rx="40" ry="22" fill="#F06292" fill-opacity=".5"/>',
    body: [[200, 430, 55, '#E63946', 0], [880, 425, 45, '#FF4FA3', -0.9], [165, 720, 38, '#FF4FA3', -1.8], [905, 700, 40, '#E63946', -2.6], [300, 300, 30, '#E63946', -1.3]]
        .map(([x, y, s, c, delay]) => anim(heart(x, y, s, c), `animation:rise 3.6s ease-in-out ${delay}s infinite`)).join(''),
});

V['ghana-independence'] = svg({
    raw: '<rect x="684" y="716" width="58" height="14" fill="#CE1126"/><rect x="684" y="730" width="58" height="14" fill="#FCD116"/><rect x="684" y="744" width="58" height="14" fill="#006B3F"/>',
    body: `<path d="M268,1010 L268,512" stroke="#7A4A22" stroke-width="13"/>
${pivot(`<rect x="128" y="515" width="140" height="38" fill="#CE1126" stroke="none"/>
<rect x="128" y="553" width="140" height="38" fill="#FCD116" stroke="none"/>
<rect x="128" y="591" width="140" height="38" fill="#006B3F" stroke="none"/>
${star(198, 572, 17, '#000', 0)}
<rect x="128" y="515" width="140" height="114" fill="none"/>`, 268, 572, 'wave 1.6s ease-in-out infinite')}
${confetti(9, 10, ['#CE1126', '#FCD116', '#006B3F'], 560)}`,
});

V['halloween'] = svg({
    body: `<path d="M398,396 C420,300 432,252 445,222 C495,255 585,310 690,382 Z" fill="#4B2A6B"/>
<path d="M410,350 Q548,328 676,344" fill="none" stroke-width="40"/>
<path d="M410,350 Q548,328 676,344" fill="none" stroke="#F28C28" stroke-width="26"/>
<rect x="527" y="318" width="42" height="34" fill="#FFD23F" transform="rotate(-5 548 335)"/>
<ellipse cx="545" cy="402" rx="300" ry="46" transform="rotate(-5 545 402)" fill="#4B2A6B"/>
${anim(anim(`<path d="M885,478 C865,450 835,445 815,458 C830,462 836,474 832,486 C850,476 868,480 885,492 C902,480 920,476 938,486 C934,474 940,462 955,458 C935,445 905,450 885,478 Z" fill="#1d1d1d" stroke-width="5"/>
<circle cx="885" cy="474" r="13" fill="#1d1d1d" stroke-width="5"/>`, 'animation:flap .45s ease-in-out infinite'), 'animation:bob 2.4s ease-in-out infinite')}
<ellipse cx="212" cy="1020" rx="70" ry="56" fill="#F28C28"/>
<ellipse cx="212" cy="1020" rx="30" ry="56" fill="none" stroke-width="6"/>
<path d="M212,966 L216,940" stroke="#3B7A2A" stroke-width="12"/>
<path d="M178,1005 l14,-18 l14,18 Z M232,1005 l14,-18 l14,18 Z" fill="#000" stroke-width="4"/>
<path d="M170,1040 l12,10 l12,-10 l12,10 l12,-10 l12,10 l12,-10 l12,10" fill="none" stroke-width="7"/>`,
});

V['rainy'] = svg({
    body: `<path d="M260,385 C280,250 400,215 545,215 C690,215 810,250 830,385 Q759,345 688,385 Q616,345 545,385 Q474,345 402,385 Q331,345 260,385 Z" fill="#3BA7F0"/>
<path d="M545,215 L402,385 Q474,345 545,385 Z" fill="#FFD23F" stroke-width="6"/>
<path d="M545,215 C690,215 810,250 830,385 Q759,345 688,385 Z" fill="#FFD23F" stroke-width="6"/>
<path d="M545,215 L402,385 M545,215 L545,385 M545,215 L688,385 M545,215 L545,196" fill="none" stroke-width="7"/>
${[[170, 470], [232, 600], [140, 690], [215, 800], [152, 905], [255, 470], [195, 640], [880, 470], [930, 600], [860, 700], [925, 800], [872, 905], [830, 560], [950, 450]]
        .map(([x, y], i) => anim(drop(x, y), `animation:rain 1.1s linear -${((i * 0.37) % 1.1).toFixed(2)}s infinite`)).join('')}`,
});

V['harmattan'] = svg({
    defs: '<clipPath id="scarf"><path d="M372,1002 C450,1060 625,1060 700,995 L708,1072 C625,1135 450,1135 366,1078 Z M610,1080 L700,1075 L735,1250 L640,1258 Z"/></clipPath>',
    raw: '<rect width="1085" height="1450" fill="#C9A46B" fill-opacity=".18"/>',
    body: `<g clip-path="url(#scarf)" stroke="none">${Array.from({ length: 14 }, (_, i) => `<rect x="${352 + i * 30}" y="980" width="30" height="300" fill="${['#F2C14E', '#1E8449', '#F2C14E', '#C0392B'][i % 4]}"/>`).join('')}
<path d="M350,1040 H760 M350,1092 H760 M600,1150 H760 M600,1200 H760" stroke="#000" stroke-width="6"/></g>
<path d="M372,1002 C450,1060 625,1060 700,995 L708,1072 C625,1135 450,1135 366,1078 Z" fill="none"/>
<path d="M610,1080 L700,1075 L735,1250 L640,1258 Z" fill="none"/>
${['M120,470 C180,440 230,500 290,470', 'M140,560 C190,535 230,585 275,560', 'M110,800 C170,770 220,830 280,800', 'M820,470 C880,440 930,500 975,470', 'M840,620 C890,595 930,645 970,620', 'M830,780 C890,750 940,810 975,780']
        .map((d, i) => anim(`<path d="${d}" fill="none" stroke="#B08A55" stroke-width="8" stroke-opacity=".75"/>`, `animation:drift ${(4.5 + (i % 3) * 0.7).toFixed(1)}s ease-in-out -${(i * 1.3).toFixed(1)}s infinite`)).join('')}`,
});

// Asleep: eyes painted shut (precise, no wobble), moon and stars. The Zzz lives in the
// thought bubble (scripts/avatar.js), not here.
V['sleep'] = svg({
    defs: '<clipPath id="moonOuter"><circle cx="185" cy="705" r="62"/></clipPath>'
        + '<mask id="moonCut"><rect width="1085" height="1450" fill="#fff"/><circle cx="216" cy="688" r="50" fill="#000"/></mask>',
    raw: `<rect x="358" y="584" width="112" height="56" rx="22" fill="${SKIN}"/><rect x="572" y="562" width="126" height="60" rx="24" fill="${SKIN}"/>`,
    body: `<path d="M366,610 Q414,642 464,608 M390,622 L384,636 M414,626 L414,641 M439,621 L445,635" fill="none" stroke-width="10"/>
<path d="M579,590 Q636,622 692,588 M607,602 L601,616 M636,606 L636,621 M664,601 L670,615" fill="none" stroke-width="10"/>
<g style="animation:bob 4s ease-in-out infinite">
<g mask="url(#moonCut)"><circle cx="185" cy="705" r="58" fill="#FFE066"/></g>
<circle cx="216" cy="688" r="50" fill="none" clip-path="url(#moonOuter)"/>
</g>
${[[235, 568, 16, 0], [132, 835, 14, -0.7], [252, 905, 15, -1.4]].map(([x, y, r, delay]) => anim(star(x, y, r), `animation:twinkle 2.1s ease-in-out ${delay}s infinite`)).join('')}`,
});

V['nightcap'] = svg({
    defs: '<clipPath id="capDome"><path d="M300,392 C310,280 430,215 545,215 C660,215 770,285 790,380 Z"/></clipPath>',
    body: `<path d="M360,300 C290,280 225,350 205,470 L250,478 C270,400 320,345 400,330 Z" fill="#3B5BDB"/>
<path d="M300,392 C310,280 430,215 545,215 C660,215 770,285 790,380 Z" fill="#3B5BDB"/>
<g clip-path="url(#capDome)" fill="none" stroke="#fff" stroke-width="16"><path d="M280,300 Q545,250 810,300"/><path d="M280,250 Q545,200 810,250"/></g>
<path d="M300,392 C310,280 430,215 545,215 C660,215 770,285 790,380 Z" fill="none"/>
<rect x="285" y="360" width="520" height="70" rx="35" fill="#fff" transform="rotate(-3 545 395)"/>
${anim('<circle cx="225" cy="488" r="40" fill="#fff"/>', 'animation:bob 2.6s ease-in-out infinite')}`,
});

fs.mkdirSync(OUT, { recursive: true });
for (const [name, content] of Object.entries(V)) fs.writeFileSync(path.join(OUT, `${name}.svg`), content);

// ---------- review page ----------
const bb = fs.readFileSync(path.join(ROOT, 'BB.html'), 'utf8');
const clip = bb.match(/<clipPath id="avatarScallop"[\s\S]*?<\/clipPath>/)[0].replace('avatarScallop', 'scallop');
const outline = bb.match(/class="profile-avatar-stroke"[\s\S]*?<\/defs>\s*(<path d="[^"]+")/)[1];

const cards = [
    ['Default', []],
    ['Christmas', ['christmas']], ['New Year', ['newyear']], ['Valentine’s Day', ['valentine']],
    ['Ghana Independence Day', ['ghana-independence']], ['Easter', ['easter']], ['Halloween', ['halloween']],
    ['Rainy season', ['rainy']], ['Harmattan', ['harmattan']],
    ['Beard · week 1 (stubble)', ['beard-1']], ['Beard · week 2', ['beard-2']], ['Beard · week 3', ['beard-3']], ['Beard · week 4', ['beard-4']],
    ['Asleep', ['sleep', 'nightcap']],
    ['Combo · Christmas night, asleep', ['beard-2', 'christmas', 'sleep']],
    ['Combo · rainy + full beard', ['beard-3', 'rainy']],
    ['Combo · Harmattan + long beard', ['beard-4', 'harmattan']],
    ['Combo · New Year + stubble', ['beard-1', 'newyear']],
];
const av = (layers, cls) => `<div class="av ${cls}"><img src="Profile.jpg" alt="">${layers.map(l => `<img src="avatar/${l}.svg" alt="">`).join('')}<svg class="ring" viewBox="0 0 100 100" aria-hidden="true">${outline} /></svg></div>`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Avatar variants</title>
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap" rel="stylesheet">
<style>
body{margin:0;background:#F0F0F0;font-family:Satoshi,sans-serif;color:#0b0b0b;padding:48px 40px}
h1{font-size:22px;margin:0 0 6px}
p.lead{color:#666;margin:0 0 32px;font-size:15px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:20px}
.card{background:#fff;border-radius:20px;padding:18px;display:flex;flex-direction:column;align-items:center;gap:12px}
.card h2{font-size:14px;font-weight:500;margin:0;text-align:center}
.sizes{display:flex;align-items:flex-end;gap:14px}
.av{position:relative;flex-shrink:0}
.av.big{width:180px;height:180px}
.av.real{width:72px;height:72px}
.av img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;clip-path:url(#scallop)}
.av .ring{position:absolute;inset:0;width:100%;height:100%}
.av .ring path{fill:none;stroke:#0b0b0b;stroke-width:2}
.tag{font-size:12px;color:#999}
</style>
</head>
<body>
<svg width="0" height="0" style="position:absolute"><defs>${clip}</defs></svg>
<h1>Avatar variants</h1>
<p class="lead">Each one at a large size and at the real 72px it shows on the site.</p>
<div class="grid">
${cards.map(([title, layers]) => `<div class="card"><h2>${title}</h2><div class="sizes">${av(layers, 'big')}${av(layers, 'real')}</div></div>`).join('\n')}
</div>
</body>
</html>
`;
fs.writeFileSync(path.join(ROOT, 'avatar-preview.html'), html);
console.log(`wrote ${Object.keys(V).length} overlays to avatar/ and avatar-preview.html`);
