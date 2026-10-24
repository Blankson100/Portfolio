// Holiday stickers: ten for each day the site dresses up for (the days are set in
// scripts/holiday.js). Drawn like the rest (black marker outline over flat colour, viewBox
// 0 0 300 300); on a holiday every scratch-off sticker on the site comes from its set.
// build-stickers.js adds them to the collection, keyed by the holiday's name.
module.exports = function ({ f, star, person, BLACK }) {
    const INK = '#1F1F1F', SOOT = '#2B2B2B', GLOW = '#FFD23F';

    // A heart centred on (cx, cy), about 2s wide and tall.
    const heartD = (cx, cy, s) => {
        const p = (x, y) => `${f(cx + x * s)},${f(cy + y * s)}`;
        return `M${p(0, 0.9)} C${p(-0.8, 0.3)} ${p(-1.1, -0.2)} ${p(-0.94, -0.62)} C${p(-0.8, -1)} ${p(-0.28, -1.06)} ${p(0, -0.64)}`
            + ` C${p(0.28, -1.06)} ${p(0.8, -1)} ${p(0.94, -0.62)} C${p(1.1, -0.2)} ${p(0.8, 0.3)} ${p(0, 0.9)} Z`;
    };
    // An egg centred on (cx, cy), narrower at the top.
    const eggD = (cx, cy, rx, ry) => {
        const p = (x, y) => `${f(cx + x * rx)},${f(cy + y * ry)}`;
        return `M${p(0, -1)} C${p(0.62, -1)} ${p(1, -0.25)} ${p(1, 0.25)} C${p(1, 0.72)} ${p(0.56, 1)} ${p(0, 1)}`
            + ` C${p(-0.56, 1)} ${p(-1, 0.72)} ${p(-1, 0.25)} C${p(-1, -0.25)} ${p(-0.62, -1)} ${p(0, -1)} Z`;
    };
    // A flame, point up, from `top` down h tall and 2w wide.
    const flame = (x, top, h, w, fill) => `<path d="M${x},${top} C${f(x + w * 0.2)},${f(top + h * 0.35)} ${x + w},${f(top + h * 0.45)} ${x + w},${f(top + h * 0.75)} C${x + w},${f(top + h * 0.92)} ${f(x + w * 0.5)},${top + h} ${x},${top + h} C${f(x - w * 0.5)},${top + h} ${x - w},${f(top + h * 0.92)} ${x - w},${f(top + h * 0.75)} C${x - w},${f(top + h * 0.45)} ${f(x - w * 0.2)},${f(top + h * 0.35)} ${x},${top} Z" fill="${fill}"/>`;
    // A line drawn as a coloured band with a black edge.
    const band = (d, color, w) => `<path d="${d}" fill="none" stroke-width="${w + 8}"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}"/>`;
    // A firework burst: n rays from inner*r out to r, with a spark past the end of each.
    const burst = (cx, cy, r, n, color, { inner = 0.32, rot = 0, w = 6 } = {}) => {
        let d = '', dots = '';
        for (let i = 0; i < n; i++) {
            const a = (rot + i * 360 / n) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
            d += `M${f(cx + c * r * inner)},${f(cy + s * r * inner)} L${f(cx + c * r)},${f(cy + s * r)} `;
            dots += `<circle cx="${f(cx + c * r * 1.16)}" cy="${f(cy + s * r * 1.16)}" r="${f(w * 0.75)}" fill="${color}" stroke-width="3"/>`;
        }
        return band(d.trim(), color, w) + dots;
    };
    // Shapes merged into one silhouette: all their edges in black first, then all the fills.
    const unite = (shapes, fill, w = 12) => `<g fill="#000" stroke-width="${w}">${shapes}</g><g fill="${fill}" stroke="none">${shapes}</g>`;
    // Icing or piping: a zigzag from p to q.
    const zig = (p, q, n = 5, a = 4.5) => {
        const dx = q[0] - p[0], dy = q[1] - p[1], len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
        const pts = Array.from({ length: n + 1 }, (_, i) => {
            const t = i / n, o = i % 2 ? a : -a;
            return `${f(p[0] + dx * t + nx * o)},${f(p[1] + dy * t + ny * o)}`;
        });
        return `M${pts.join(' L')}`;
    };
    const icing = d => `<path d="${d}" fill="none" stroke-width="10"/><path d="${d}" fill="none" stroke="#fff" stroke-width="4.5"/>`;
    // A bat with its wings spread, centred on (x, y); s = 1 is about 92 wide.
    const bat = (x, y, s = 1, fill = INK) => `<g transform="translate(${x},${y}) scale(${s})" stroke-width="${f(6 / s)}">
<path d="M6,-6 C18,-16 32,-20 46,-18 C41,-13 40,-7 41,-1 C36,-5 30,-4 27,1 C23,-3 17,-2 15,4 C12,1 9,1 6,4 Z M-6,-6 C-18,-16 -32,-20 -46,-18 C-41,-13 -40,-7 -41,-1 C-36,-5 -30,-4 -27,1 C-23,-3 -17,-2 -15,4 C-12,1 -9,1 -6,4 Z" fill="${fill}"/>
<path d="M-6,-14 L-8,-24 L-1,-17 Z M6,-14 L8,-24 L1,-17 Z" fill="${fill}"/>
<ellipse cx="0" cy="2" rx="8" ry="11" fill="${fill}"/><circle cx="0" cy="-11" r="7.5" fill="${fill}"/>
<circle cx="-3" cy="-12" r="1.9" fill="#fff" stroke="none"/><circle cx="3" cy="-12" r="1.9" fill="#fff" stroke="none"/>
${s >= 1.5 ? '<path d="M-3.4,-6.6 L-2.4,-3.6 L-1.4,-6.6 Z M1.4,-6.6 L2.4,-3.6 L3.4,-6.6 Z" fill="#fff" stroke="none"/>' : ''}</g>`;
    // A wrapped sweet.
    const sweet = (x, y, fill, rot = 0) => `<g transform="rotate(${rot} ${x} ${y})"><path d="M${x - 14},${y} L${x - 30},${y - 12} L${x - 30},${y + 12} Z M${x + 14},${y} L${x + 30},${y - 12} L${x + 30},${y + 12} Z" fill="${fill}"/>
<ellipse cx="${x}" cy="${y}" rx="18" ry="13" fill="${fill}"/><path d="M${x - 6},${y - 10} L${x},${y + 10} M${x + 6},${y - 10} L${x + 12},${y + 6}" fill="none" stroke="#fff" stroke-width="4"/></g>`;
    // A sprig of holly: two leaves and three berries, s = 1 about 100 wide.
    const holly = (x, y, s = 1) => {
        const p = (dx, dy) => `${f(x + dx * s)},${f(y + dy * s)}`;
        return `<path d="M${p(0, 0)} C${p(-14, -22)} ${p(-40, -24)} ${p(-52, -8)} C${p(-36, 6)} ${p(-14, 8)} ${p(0, 0)} Z M${p(0, 0)} C${p(10, -24)} ${p(36, -32)} ${p(50, -20)} C${p(38, -2)} ${p(14, 4)} ${p(0, 0)} Z" fill="#2E8B3E" stroke-width="${f(Math.max(3, 5 * s))}"/>
<path d="M${p(-4, -2)} L${p(-40, -10)} M${p(4, -3)} L${p(38, -18)}" fill="none" stroke="#8FD18F" stroke-width="${f(Math.max(2, 3 * s))}"/>
<circle cx="${f(x - 6 * s)}" cy="${f(y + 2 * s)}" r="${f(9 * s)}" fill="#D7262E" stroke-width="${f(Math.max(3, 5 * s))}"/><circle cx="${f(x + 10 * s)}" cy="${f(y + 4 * s)}" r="${f(9 * s)}" fill="#D7262E" stroke-width="${f(Math.max(3, 5 * s))}"/><circle cx="${f(x + 2 * s)}" cy="${f(y - 9 * s)}" r="${f(9 * s)}" fill="#D7262E" stroke-width="${f(Math.max(3, 5 * s))}"/>`;
    };
    // A small star with a thinner outline, so it doesn't clog up.
    const twinkle = (x, y, r, c) => `<g stroke-width="${r < 16 ? 4 : 6}">${star(x, y, r, c)}</g>`;
    // Little stars thrown about, as [x, y, size, colour].
    const sparkles = list => list.map(([x, y, r, c]) => twinkle(x, y, r, c)).join('');
    const confetti = list => list.map(([x, y, c, rot]) => `<rect x="${x - 7}" y="${y - 4}" width="14" height="8" rx="2" fill="${c}" stroke-width="3" transform="rotate(${rot} ${x} ${y})"/>`).join('');

    // ---------------- Halloween ----------------
    const PUMPKIN = '#F28C28', PUMPKIN_DARK = '#D9701A', WITCH = '#4B2A6B', MOON = '#FFE9A8', SLIME = '#7CD957';
    const webLines = (() => {
        // A web in the top-left corner: threads out from the corner, joined by sagging rings.
        const ang = [90, 62, 36, 6].map(a => a * Math.PI / 180), pt = (a, r) => [20 + Math.cos(a) * r, 20 + Math.sin(a) * r];
        let d = ang.map(a => `M20,20 L${pt(a, 132).map(f).join(',')}`).join(' ');
        [34, 66, 98].forEach(r => {
            for (let i = 0; i < ang.length - 1; i++) {
                const p = pt(ang[i], r), q = pt(ang[i + 1], r), m = pt((ang[i] + ang[i + 1]) / 2, r * 0.82);
                d += ` M${p.map(f).join(',')} Q${m.map(f).join(',')} ${q.map(f).join(',')}`;
            }
        });
        return `<path d="${d}" fill="none" stroke-width="3"/>`;
    })();
    const HALLOWEEN = {
        pumpkin: {
            name: 'Jack-o’-lantern', caption: 'Halloween',
            art: `<path d="M140,84 C138,66 142,50 152,38 L168,46 C160,56 158,70 162,84 Z" fill="#5A8A2E"/>
<ellipse cx="98" cy="172" rx="62" ry="80" fill="${PUMPKIN_DARK}"/>
<ellipse cx="202" cy="172" rx="62" ry="80" fill="${PUMPKIN_DARK}"/>
<ellipse cx="150" cy="170" rx="70" ry="88" fill="${PUMPKIN}"/>
<path d="M58,128 C50,160 52,196 64,222" fill="none" stroke="#F5A04D" stroke-width="7"/>
<path d="M164,52 C182,34 206,44 200,62 C196,72 184,70 186,60" fill="none" stroke-width="5"/>
<path d="M104,150 L122,116 L140,150 Z M160,150 L178,116 L196,150 Z" fill="${GLOW}"/>
<path d="M140,178 L150,162 L160,178 Z" fill="${GLOW}"/>
<path d="M90,192 Q150,214 210,192 Q200,244 150,246 Q100,244 90,192 Z" fill="${GLOW}"/>
<path d="M121,199 V214 H139 V202" fill="${PUMPKIN}" stroke-width="5"/>
<path d="M160,246 V228 H178 V245" fill="${PUMPKIN}" stroke-width="5"/>`,
        },
        batmoon: {
            name: 'Night flyer', caption: 'Halloween',
            art: `<circle cx="150" cy="146" r="104" fill="${MOON}"/>
<circle cx="96" cy="212" r="16" fill="#F2D27A"/><circle cx="206" cy="216" r="11" fill="#F2D27A"/><circle cx="214" cy="84" r="13" fill="#F2D27A"/>
${bat(150, 152, 2.5)}
${sparkles([[44, 50, 14, GLOW], [264, 254, 11, GLOW], [268, 40, 8, GLOW]])}`,
        },
        ghost: {
            name: 'Friendly ghost', caption: 'Halloween',
            art: `<path d="M82,244 C74,170 80,56 150,52 C220,56 226,170 218,244 Q205,228 192,244 Q178,262 164,244 Q150,228 136,244 Q122,262 108,244 Q95,228 82,244 Z" fill="#F7F5FF"/>
<path d="M86,138 C66,128 52,142 56,158 C68,150 78,154 86,164" fill="#F7F5FF"/>
<path d="M214,138 C234,128 248,142 244,158 C232,150 222,154 214,164" fill="#F7F5FF"/>
<ellipse cx="126" cy="118" rx="11" ry="15" fill="${INK}"/><ellipse cx="174" cy="118" rx="11" ry="15" fill="${INK}"/>
<circle cx="130" cy="112" r="4" fill="#fff" stroke="none"/><circle cx="178" cy="112" r="4" fill="#fff" stroke="none"/>
<ellipse cx="150" cy="162" rx="13" ry="17" fill="${INK}"/>
<circle cx="106" cy="146" r="9" fill="#FF8FA3" stroke="none" opacity="0.8"/><circle cx="194" cy="146" r="9" fill="#FF8FA3" stroke="none" opacity="0.8"/>
<text x="240" y="70" ${BLACK} font-size="26" fill="${WITCH}" stroke="none" transform="rotate(12 240 62)">BOO!</text>`,
        },
        witchhat: {
            name: 'Witch’s hat', caption: 'Halloween',
            art: `<ellipse cx="150" cy="232" rx="126" ry="30" fill="${WITCH}"/>
<path d="M82,228 C108,176 118,116 134,76 C144,50 172,30 220,32 C192,46 180,72 178,104 C178,144 196,192 220,228 Q150,246 82,228 Z" fill="#5C3784"/>
<path d="M90,208 Q150,224 212,208 L220,228 Q150,246 82,228 Z" fill="${PUMPKIN}"/>
<rect x="132" y="208" width="36" height="30" rx="4" fill="${GLOW}"/>
<rect x="142" y="216" width="16" height="14" fill="${PUMPKIN}"/>
${sparkles([[146, 150, 11, GLOW], [164, 106, 8, GLOW], [128, 186, 7, GLOW]])}
${bat(250, 76, 0.6)}`,
        },
        cauldron: {
            name: 'Bubbling cauldron', caption: 'Halloween',
            art: `<rect x="196" y="30" width="14" height="110" rx="7" fill="#A0612B" transform="rotate(24 203 85)"/>
<rect x="88" y="222" width="16" height="30" rx="4" fill="${SOOT}"/><rect x="196" y="222" width="16" height="30" rx="4" fill="${SOOT}"/>
${flame(126, 224, 40, 16, '#FF7A21')}${flame(174, 224, 40, 16, '#FF7A21')}${flame(150, 216, 52, 20, '#FF7A21')}
${flame(150, 238, 28, 10, GLOW)}
<rect x="90" y="262" width="120" height="14" rx="6" fill="#8B5A2B"/>
<path d="M70,120 C46,186 84,236 150,236 C216,236 254,186 230,120 Z" fill="${SOOT}"/>
<path d="M92,150 C88,180 100,206 122,218" fill="none" stroke="#5A5A5A" stroke-width="7"/>
<ellipse cx="150" cy="120" rx="92" ry="20" fill="#3A3A3A"/>
<ellipse cx="150" cy="118" rx="76" ry="11" fill="${SLIME}"/>
<path d="M98,124 C98,148 112,148 112,126 Z M186,126 C186,142 198,142 198,124 Z" fill="${SLIME}"/>
<circle cx="122" cy="94" r="12" fill="${SLIME}"/><circle cx="168" cy="76" r="16" fill="${SLIME}"/><circle cx="202" cy="100" r="8" fill="${SLIME}"/><circle cx="138" cy="52" r="8" fill="${SLIME}"/><circle cx="184" cy="38" r="5" fill="${SLIME}"/>`,
        },
        treatbucket: {
            name: 'Trick or treat', caption: 'Halloween',
            art: `${band('M76,128 C66,40 234,40 224,128', '#8F9AA5', 7)}
${sweet(110, 104, '#E63946', -20)}${sweet(196, 100, '#2E9BF6', 25)}
${band('M148,124 L160,60', '#fff', 6)}
<circle cx="162" cy="52" r="22" fill="#FF5FA2"/><path d="M162,52 m-4,0 a4,4 0 1 1 8,0 a8,8 0 1 1 -16,0 a12,12 0 1 1 24,0" fill="none" stroke="#fff" stroke-width="4"/>
<path d="M70,128 C60,190 82,258 150,260 C218,258 240,190 230,128 Z" fill="${PUMPKIN}"/>
<path d="M84,150 C80,190 92,226 112,242" fill="none" stroke="#F5A04D" stroke-width="7"/>
<ellipse cx="150" cy="128" rx="80" ry="16" fill="${PUMPKIN_DARK}"/>
<path d="M106,170 L120,146 L134,170 Z M166,170 L180,146 L194,170 Z" fill="${INK}"/>
<path d="M100,196 L114,204 L126,194 L138,206 L150,194 L162,206 L174,194 L186,204 L200,196 Q150,250 100,196 Z" fill="${INK}"/>`,
        },
        spider: {
            name: 'Little spider', caption: 'Halloween',
            art: `${webLines}
<path d="M178,14 V146" fill="none" stroke-width="3"/>
<path d="M150,170 Q114,134 98,154 M146,184 Q102,170 90,196 M148,198 Q108,210 100,238 M156,210 Q132,236 128,262 M206,170 Q242,134 258,154 M210,184 Q254,170 266,196 M208,198 Q248,210 256,238 M200,210 Q224,236 228,262" fill="none" stroke-width="8"/>
<circle cx="178" cy="188" r="42" fill="${SOOT}"/>
<circle cx="164" cy="180" r="11" fill="#fff" stroke-width="3"/><circle cx="192" cy="180" r="11" fill="#fff" stroke-width="3"/>
<circle cx="166" cy="182" r="5" fill="${INK}" stroke="none"/><circle cx="194" cy="182" r="5" fill="${INK}" stroke="none"/>
<path d="M164,204 Q178,214 192,204" fill="none" stroke="#fff" stroke-width="4"/>
<path d="M168,158 L178,150 L168,142 Z M188,158 L178,150 L188,142 Z" fill="${PUMPKIN}" stroke-width="4"/><circle cx="178" cy="150" r="4" fill="${PUMPKIN}" stroke-width="3"/>`,
        },
        blackcat: {
            name: 'Black cat', caption: 'Halloween',
            art: `${band('M194,240 C254,244 266,186 232,164', SOOT, 14)}
${unite(`<path d="M100,252 C88,188 108,146 150,142 C192,146 212,188 200,252 Z"/><circle cx="150" cy="104" r="50"/>
<path d="M108,84 L100,34 L142,62 Z"/><path d="M192,84 L200,34 L158,62 Z"/>
<ellipse cx="128" cy="252" rx="20" ry="11"/><ellipse cx="172" cy="252" rx="20" ry="11"/>`, SOOT)}
<path d="M112,74 L108,48 L132,64 Z M188,74 L192,48 L168,64 Z" fill="#E879A6" stroke-width="3"/>
<ellipse cx="130" cy="102" rx="13" ry="15" fill="${GLOW}" stroke-width="4"/><ellipse cx="170" cy="102" rx="13" ry="15" fill="${GLOW}" stroke-width="4"/>
<ellipse cx="130" cy="102" rx="3.5" ry="11" fill="${INK}" stroke="none"/><ellipse cx="170" cy="102" rx="3.5" ry="11" fill="${INK}" stroke="none"/>
<path d="M143,120 H157 L150,128 Z" fill="#E879A6" stroke-width="3"/>
${['M110,124 L76,118', 'M110,132 L78,140', 'M190,124 L224,118', 'M190,132 L222,140'].map(d => icing(d)).join('')}
${band('M112,152 Q150,168 188,152', PUMPKIN, 8)}
<circle cx="150" cy="166" r="9" fill="${GLOW}" stroke-width="4"/>`,
        },
        hauntedhouse: {
            name: 'Haunted house', caption: 'Halloween',
            art: `<circle cx="232" cy="64" r="40" fill="${MOON}"/>
${bat(92, 48, 0.7)}${bat(186, 26, 0.5)}
<rect x="14" y="250" width="272" height="24" rx="8" fill="#4E6B3A"/>
<rect x="176" y="68" width="24" height="46" fill="#3D2E5C" transform="rotate(8 188 90)"/>
<path d="M74,256 L78,136 L204,132 L210,256 Z" fill="#7A6A9C"/>
<path d="M56,148 L136,56 L226,144 Z" fill="#3D2E5C"/>
<circle cx="138" cy="112" r="14" fill="${GLOW}"/><path d="M138,98 V126 M124,112 H152" fill="none" stroke-width="4"/>
<rect x="94" y="164" width="34" height="38" fill="${GLOW}"/><path d="M111,164 V202 M94,183 H128" fill="none" stroke-width="4"/>
<rect x="156" y="160" width="34" height="38" fill="${GLOW}" transform="rotate(-4 173 179)"/>
<path d="M165,196 C163,180 166,170 173,170 C180,170 184,180 182,196 L178,192 L174,196 L170,192 Z" fill="#fff" stroke-width="3"/>
<circle cx="170" cy="178" r="1.6" fill="${INK}" stroke="none"/><circle cx="176" cy="178" r="1.6" fill="${INK}" stroke="none"/>
<rect x="88" y="176" width="48" height="10" rx="2" fill="#A0612B" transform="rotate(-24 112 181)"/>
<path d="M120,256 V222 Q139,200 158,222 V256 Z" fill="#3B2A14"/>
<circle cx="150" cy="238" r="3" fill="${GLOW}" stroke="none"/>`,
        },
        mummy: {
            name: 'Peeking mummy', caption: 'Halloween',
            art: `<defs><clipPath id="mummyHead"><ellipse cx="150" cy="156" rx="94" ry="104"/></clipPath></defs>
<path d="M226,196 C258,204 274,232 260,258 L244,250 C254,230 244,214 222,208 Z" fill="#F3EBDD"/>
<ellipse cx="150" cy="156" rx="94" ry="104" fill="#F3EBDD"/>
<g clip-path="url(#mummyHead)">
<path d="M40,132 L260,124 L260,178 L40,186 Z" fill="${SOOT}"/>
<path d="M40,72 L260,100 M40,102 L260,86 M40,118 L260,112 M40,210 L260,196 M40,226 L260,242 M40,250 L260,236" fill="none" stroke-width="4"/>
<path d="M60,84 L120,92 M170,98 L232,94 M70,234 L130,226" fill="none" stroke="#D8CBB5" stroke-width="5"/>
</g>
<ellipse cx="150" cy="156" rx="94" ry="104" fill="none"/>
<circle cx="118" cy="155" r="20" fill="#fff"/><circle cx="184" cy="152" r="15" fill="#fff"/>
<circle cx="122" cy="157" r="8" fill="${INK}" stroke="none"/><circle cx="186" cy="154" r="6.5" fill="${INK}" stroke="none"/>`,
        },
    };

    // ---------------- Christmas ----------------
    const PINE = '#3E9E4F', XRED = '#D7262E', XGOLD = '#FFC93C', TRUNK = '#8B5A2B';
    const bell = (x, y, rot) => `<g transform="rotate(${rot} ${x} ${y})"><circle cx="${x}" cy="${y + 60}" r="12" fill="#F2A900"/>
<path d="M${x - 40},${y + 44} C${x - 34},${y + 10} ${x - 36},${y - 34} ${x},${y - 44} C${x + 36},${y - 34} ${x + 34},${y + 10} ${x + 40},${y + 44} Z" fill="${XGOLD}"/>
<rect x="${x - 46}" y="${y + 38}" width="92" height="16" rx="8" fill="#F2A900"/>
<path d="M${x - 18},${y - 22} C${x - 26},${y} ${x - 26},${y + 18} ${x - 24},${y + 30}" fill="none" stroke="#FFE7A3" stroke-width="7"/></g>`;
    const CHRISTMAS = {
        xmastree: {
            name: 'Christmas tree', caption: 'Christmas',
            art: `<rect x="134" y="226" width="32" height="36" fill="${TRUNK}"/>
<path d="M150,108 L250,234 Q150,250 50,234 Z" fill="${PINE}"/>
<path d="M150,70 L226,174 Q150,188 74,174 Z" fill="${PINE}"/>
<path d="M150,40 L200,116 Q150,126 100,116 Z" fill="${PINE}"/>
${band('M84,206 Q150,232 216,202', XGOLD, 5)}${band('M100,150 Q150,168 198,148', XGOLD, 5)}
${[[100, 222, XRED], [158, 226, '#2E9BF6'], [210, 214, XGOLD], [122, 162, XGOLD], [182, 158, XRED], [150, 102, '#2E9BF6']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="10" fill="${c}" stroke-width="4"/>`).join('')}
${star(150, 40, 28, XGOLD)}
<rect x="56" y="234" width="48" height="34" rx="3" fill="${XRED}"/><rect x="76" y="234" width="8" height="34" fill="${XGOLD}" stroke-width="3"/>
<rect x="196" y="240" width="44" height="28" rx="3" fill="#2E9BF6"/><rect x="214" y="240" width="8" height="28" fill="${XGOLD}" stroke-width="3"/>`,
        },
        santahat: {
            name: 'Santa hat', caption: 'Christmas',
            art: `<path d="M66,206 C70,128 118,66 188,62 C232,60 258,92 254,132 C242,112 222,106 208,114 C220,142 230,172 236,206 Z" fill="${XRED}"/>
<path d="M104,196 C108,150 136,108 178,92" fill="none" stroke="#A81E25" stroke-width="9"/>
<rect x="44" y="194" width="212" height="54" rx="27" fill="#fff"/>
<path d="M72,212 q8,-8 16,0 M108,226 q8,-8 16,0 M150,210 q8,-8 16,0 M190,228 q8,-8 16,0 M222,212 q8,-8 16,0" fill="none" stroke="#D9D9D9" stroke-width="4"/>
<circle cx="252" cy="146" r="28" fill="#fff"/>
<path d="M240,140 q6,-6 12,0 M250,156 q6,-6 12,0" fill="none" stroke="#D9D9D9" stroke-width="4"/>`,
        },
        reindeer: {
            name: 'Red-nosed reindeer', caption: 'Christmas',
            art: `${band('M120,104 C112,74 98,54 76,38 M102,66 C90,64 74,72 64,84 M110,84 C118,64 118,48 112,32', '#C68642', 11)}
${band('M180,104 C188,74 202,54 224,38 M198,66 C210,64 226,72 236,84 M190,84 C182,64 182,48 188,32', '#C68642', 11)}
<ellipse cx="80" cy="142" rx="32" ry="14" transform="rotate(-25 80 142)" fill="#A0673A"/><ellipse cx="82" cy="141" rx="18" ry="6" transform="rotate(-25 82 141)" fill="#E3B98E" stroke-width="3"/>
<ellipse cx="220" cy="142" rx="32" ry="14" transform="rotate(25 220 142)" fill="#A0673A"/><ellipse cx="218" cy="141" rx="18" ry="6" transform="rotate(25 218 141)" fill="#E3B98E" stroke-width="3"/>
${band('M150,240 V250', XRED, 6)}<circle cx="150" cy="262" r="13" fill="${XGOLD}"/><path d="M142,264 H158" fill="none" stroke-width="3"/>
<ellipse cx="150" cy="166" rx="66" ry="78" fill="#A0673A"/>
<ellipse cx="150" cy="212" rx="50" ry="36" fill="#D9A877"/>
<circle cx="122" cy="156" r="11" fill="${INK}"/><circle cx="178" cy="156" r="11" fill="${INK}"/>
<circle cx="126" cy="152" r="4" fill="#fff" stroke="none"/><circle cx="182" cy="152" r="4" fill="#fff" stroke="none"/>
<circle cx="104" cy="186" r="9" fill="#FF8FA3" stroke="none" opacity="0.7"/><circle cx="196" cy="186" r="9" fill="#FF8FA3" stroke="none" opacity="0.7"/>
<path d="M134,228 Q150,240 166,228" fill="none" stroke-width="5"/>
<circle cx="150" cy="198" r="22" fill="#E63946"/><ellipse cx="143" cy="191" rx="7" ry="5" fill="#fff" stroke="none" opacity="0.8"/>`,
        },
        present: {
            name: 'A present for you', caption: 'Christmas',
            art: `<rect x="60" y="126" width="180" height="134" rx="6" fill="${XRED}"/>
${[[86, 162], [106, 216], [208, 172], [196, 234], [88, 246], [214, 206]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#fff" stroke="none"/>`).join('')}
<rect x="136" y="126" width="28" height="134" fill="${XGOLD}"/>
<rect x="48" y="100" width="204" height="38" rx="6" fill="#E8454C"/>
<rect x="136" y="100" width="28" height="38" fill="${XGOLD}"/>
<rect x="48" y="100" width="204" height="38" rx="6" fill="none"/>
<path d="M146,100 L128,134 L138,130 L140,142 Z M154,100 L172,134 L162,130 L160,142 Z" fill="${XGOLD}" stroke-width="4"/>
<path d="M150,98 C120,60 82,62 92,86 C98,100 124,102 150,98 Z" fill="${XGOLD}"/>
<path d="M150,98 C180,60 218,62 208,86 C202,100 176,102 150,98 Z" fill="${XGOLD}"/>
<ellipse cx="150" cy="98" rx="14" ry="11" fill="#F2A900"/>
<path d="M210,196 Q188,180 166,160" fill="none" stroke-width="3"/>
<g transform="rotate(14 236 196)"><path d="M218,182 H262 V210 H218 L208,196 Z" fill="#FFF4D6"/><circle cx="217" cy="196" r="3" fill="${INK}" stroke="none"/><path d="${heartD(242, 197, 9)}" fill="${XRED}" stroke-width="3"/></g>`,
        },
        gingerbread: {
            name: 'Gingerbread man', caption: 'Christmas',
            art: `${unite(`<circle cx="150" cy="74" r="42"/><rect x="110" y="106" width="80" height="100" rx="34"/>
<ellipse cx="86" cy="138" rx="42" ry="20" transform="rotate(-24 86 138)"/><ellipse cx="214" cy="138" rx="42" ry="20" transform="rotate(24 214 138)"/>
<ellipse cx="120" cy="226" rx="24" ry="46" transform="rotate(18 120 226)"/><ellipse cx="180" cy="226" rx="24" ry="46" transform="rotate(-18 180 226)"/>`, '#C47A3D')}
${icing(zig([55.5, 138.4], [65.3, 160.4], 4))}${icing(zig([244.5, 138.4], [234.7, 160.4], 4))}
${icing(zig([97.7, 252.4], [122.5, 260.4], 4))}${icing(zig([202.3, 252.4], [177.5, 260.4], 4))}
${icing('M134,86 Q150,100 166,86')}
<circle cx="136" cy="66" r="6" fill="${INK}" stroke="none"/><circle cx="164" cy="66" r="6" fill="${INK}" stroke="none"/>
<circle cx="150" cy="128" r="8" fill="${XRED}" stroke-width="4"/><circle cx="150" cy="156" r="8" fill="${PINE}" stroke-width="4"/><circle cx="150" cy="184" r="8" fill="#fff" stroke-width="4"/>`,
        },
        snowman: {
            name: 'Snowman in Accra', caption: 'Christmas',
            art: `${burst(250, 50, 36, 10, '#FFB020', { inner: 0.7, w: 5 })}<circle cx="250" cy="50" r="22" fill="${GLOW}"/>
<ellipse cx="150" cy="268" rx="96" ry="12" fill="#CDE9FF"/>
${band('M96,184 L52,152 M66,162 L58,140', TRUNK, 6)}${band('M204,184 L248,160 M232,169 L246,148', TRUNK, 6)}
<circle cx="150" cy="206" r="64" fill="#F4FAFF"/>
<circle cx="150" cy="104" r="46" fill="#F4FAFF"/>
<path d="M174,160 L182,206 H202 L190,156 Z" fill="${XRED}"/>
<path d="M180,186 L197,184 M182,196 L199,194" fill="none" stroke="#fff" stroke-width="4"/>
<path d="M181,206 L180,214 M187,206 L187,214 M193,206 L194,214 M199,206 L201,213" fill="none" stroke-width="3"/>
<path d="M106,138 Q150,158 194,138 L196,162 Q150,182 104,162 Z" fill="${XRED}"/>
<path d="M118,150 Q150,166 182,150" fill="none" stroke="#fff" stroke-width="4"/>
<rect x="116" y="88" width="30" height="20" rx="7" fill="${INK}"/><rect x="154" y="88" width="30" height="20" rx="7" fill="${INK}"/>
<path d="M146,95 H154 M116,94 L106,90 M184,94 L194,90" fill="none" stroke-width="4"/>
<path d="M122,94 L130,92" fill="none" stroke="#fff" stroke-width="3"/><path d="M160,94 L168,92" fill="none" stroke="#fff" stroke-width="3"/>
<path d="M150,112 L184,118 L150,124 Z" fill="#FF7A21" stroke-width="4"/>
${[[134, 132], [142, 136], [150, 137], [158, 136], [166, 132]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${INK}" stroke="none"/>`).join('')}
${[198, 220, 242].map(y => `<circle cx="150" cy="${y}" r="6" fill="${INK}" stroke="none"/>`).join('')}
<path d="M110,68 C102,82 104,90 110,90 C116,90 118,82 110,68 Z" fill="#9CD3F0" stroke-width="3.5"/>`,
        },
        candycane: {
            name: 'Candy cane', caption: 'Christmas',
            art: `<g transform="rotate(-14 150 150)">
<path d="M126,266 V112 C126,46 222,46 222,112 V134" fill="none" stroke-width="50"/>
<path d="M126,266 V112 C126,46 222,46 222,112 V134" fill="none" stroke="#fff" stroke-width="38"/>
<path d="M126,266 V112 C126,46 222,46 222,112 V134" fill="none" stroke="${XRED}" stroke-width="38" stroke-dasharray="16 16" stroke-linecap="butt"/>
<path d="M116,250 V120" fill="none" stroke="#fff" stroke-width="5" opacity="0.7"/>
</g>
${holly(110, 196, 0.85)}`,
        },
        stocking: {
            name: 'Christmas stocking', caption: 'Christmas',
            art: `<path d="M200,46 C206,22 228,24 224,48" fill="none" stroke-width="6"/>
<g transform="rotate(10 130 40)">
<path d="M120,72 V30 C120,10 148,10 148,30" fill="none" stroke-width="22"/>
<path d="M120,72 V30 C120,10 148,10 148,30" fill="none" stroke="#fff" stroke-width="12"/>
<path d="M120,72 V30 C120,10 148,10 148,30" fill="none" stroke="${XRED}" stroke-width="12" stroke-dasharray="8 8" stroke-linecap="butt"/></g>
<path d="M106,70 H200 V168 C200,196 214,210 232,220 C262,236 256,276 222,272 C198,270 168,262 144,250 C110,232 106,208 106,172 Z" fill="${XRED}"/>
<path d="M108,132 L120,120 L132,132 L144,120 L156,132 L168,120 L180,132 L192,120 L198,126" fill="none" stroke="${PINE}" stroke-width="8"/>
${[[126, 176], [168, 164], [150, 214], [196, 238], [234, 248]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#fff" stroke="none"/>`).join('')}
<rect x="94" y="46" width="118" height="44" rx="14" fill="#fff"/>
${holly(150, 70, 0.55)}`,
        },
        bells: {
            name: 'Jingle bells', caption: 'Christmas',
            art: `${band('M150,84 L114,122 M150,84 L186,122', XRED, 7)}
${bell(110, 166, -16)}${bell(190, 166, 16)}
${holly(150, 90, 0.75)}
<path d="M150,84 C120,50 92,56 100,78 C106,92 128,92 150,84 Z M150,84 C180,50 208,56 200,78 C194,92 172,92 150,84 Z" fill="${XRED}"/>
<ellipse cx="150" cy="84" rx="12" ry="10" fill="#A81E25"/>
<path d="M44,126 Q34,148 42,170 M30,138 Q24,150 28,162 M256,126 Q266,148 258,170 M270,138 Q276,150 272,162" fill="none" stroke-width="4"/>`,
        },
        jollof: {
            name: 'Christmas jollof', caption: 'Christmas',
            art: `<path d="M112,96 C102,80 122,70 112,54 M150,90 C140,74 160,64 150,48 M188,96 C178,80 198,70 188,54" fill="none" stroke-width="4"/>
<ellipse cx="150" cy="202" rx="130" ry="54" fill="#fff"/>
<ellipse cx="150" cy="198" rx="102" ry="38" fill="#F2F2F2"/>
<path d="M60,202 C66,150 110,124 150,122 C196,124 236,150 240,202 Q150,226 60,202 Z" fill="#E8652A"/>
${[[92, 180, 20], [110, 160, -30], [128, 192, 10], [146, 146, 40], [168, 176, -10], [186, 152, 30], [204, 186, -40], [126, 136, 0], [96, 200, 30], [214, 168, 10], [150, 204, -20], [176, 132, 20]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="2.4" transform="rotate(${r} ${x} ${y})" fill="#F7A86A" stroke="none"/>`).join('')}
<path d="M168,170 C176,140 214,126 236,146 C256,166 240,198 210,198 C196,198 186,190 180,184 Z" fill="#B8652A"/>
<path d="M196,154 C206,146 220,146 228,154" fill="none" stroke="#D9894A" stroke-width="6"/>
${band('M176,182 L152,198', '#FFF4D6', 8)}<circle cx="148" cy="194" r="7" fill="#FFF4D6"/><circle cx="152" cy="204" r="7" fill="#FFF4D6"/>
<ellipse cx="88" cy="222" rx="20" ry="12" transform="rotate(-14 88 222)" fill="#F2A900"/><ellipse cx="116" cy="230" rx="18" ry="11" transform="rotate(8 116 230)" fill="#E89A00"/>
${holly(124, 134, 0.6)}`,
        },
    };

    // ---------------- New Year ----------------
    const NAVY = '#2B2D5C', NPINK = '#FF5FA2', NTEAL = '#2EC4B6', NPURPLE = '#8E5CF7', NBLUE = '#2E9BF6';
    const balloon = (x, y, fill) => `<path d="M${x - 8},${y + 60} L${x},${y + 52} L${x + 8},${y + 60} Z" fill="${fill}" stroke-width="4"/>
<ellipse cx="${x}" cy="${y}" rx="44" ry="54" fill="${fill}"/>
<path d="M${x - 24},${y - 18} Q${x - 26},${y - 36} ${x - 10},${y - 42}" fill="none" stroke="#fff" stroke-width="7"/>`;
    const glass = (x, y, rot) => `<g transform="rotate(${rot} ${x} ${y + 70})">
${band(`M${x},${y} V${y + 66}`, '#EAF6FF', 5)}
<ellipse cx="${x}" cy="${y + 70}" rx="30" ry="9" fill="#EAF6FF"/>
<path d="M${x - 26},${y - 96} H${x + 26} C${x + 28},${y - 40} ${x + 16},${y} ${x},${y} C${x - 16},${y} ${x - 28},${y - 40} ${x - 26},${y - 96} Z" fill="#EAF6FF"/>
<path d="M${x - 25.6},${y - 66} H${x + 25.6} C${x + 25},${y - 34} ${x + 15},${y - 2} ${x},${y - 2} C${x - 15},${y - 2} ${x - 25},${y - 34} ${x - 25.6},${y - 66} Z" fill="${XGOLD}" stroke="none"/>
<path d="M${x - 25.6},${y - 66} H${x + 25.6}" fill="none" stroke-width="4"/>
${[[-8, -40], [6, -24], [-2, -54], [10, -48]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="3" fill="#fff" stroke="none"/>`).join('')}
<path d="M${x - 26},${y - 96} H${x + 26} C${x + 28},${y - 40} ${x + 16},${y} ${x},${y} C${x - 16},${y} ${x - 28},${y - 40} ${x - 26},${y - 96} Z" fill="none"/>
<path d="M${x - 16},${y - 84} C${x - 18},${y - 60} ${x - 14},${y - 40} ${x - 8},${y - 28}" fill="none" stroke="#fff" stroke-width="5" opacity="0.8"/></g>`;
    // A party popper's stripes: lines across the cone, from its tip (50,262) towards the middle
    // of its open end (141,161), as wide as the cone is there.
    const popperStripes = [0.38, 0.62, 0.84].map(t => {
        const tip = [50, 262], mid = [141, 161], perp = [0.743, 0.669], hw = 35.5 * t;
        const c = [tip[0] + (mid[0] - tip[0]) * t, tip[1] + (mid[1] - tip[1]) * t];
        return `M${f(c[0] - perp[0] * hw)},${f(c[1] - perp[1] * hw)} L${f(c[0] + perp[0] * hw)},${f(c[1] + perp[1] * hw)}`;
    }).join(' ');
    const NEWYEAR = {
        fireworks: {
            name: 'Fireworks', caption: 'New Year',
            art: `<defs><clipPath id="fwSky"><circle cx="150" cy="150" r="128"/></clipPath></defs>
<circle cx="150" cy="150" r="128" fill="${NAVY}"/>
<g clip-path="url(#fwSky)"><path d="M14,252 V226 H44 V206 H70 V232 H96 V214 H120 V198 H138 V230 H170 V210 H196 V236 H226 V218 H250 V240 H286 V290 H14 Z" fill="#1B1C3A" stroke-width="4"/>
${[[52, 216], [78, 240], [104, 224], [126, 208], [180, 222], [234, 228], [258, 248]].map(([x, y]) => `<rect x="${x}" y="${y}" width="6" height="7" fill="${XGOLD}" stroke="none"/>`).join('')}</g>
<circle cx="150" cy="150" r="128" fill="none"/>
${burst(132, 112, 70, 12, NPINK)}${burst(214, 168, 42, 10, XGOLD, { w: 5 })}${burst(80, 178, 32, 8, NTEAL, { w: 5 })}
<circle cx="132" cy="112" r="8" fill="#fff" stroke-width="4"/>
${[[60, 92], [226, 74], [250, 120], [100, 56], [186, 46]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#fff" stroke="none"/>`).join('')}`,
        },
        rocket: {
            name: 'Rocket', caption: 'New Year',
            art: `${sparkles([[96, 214, 11, XGOLD], [70, 168, 8, NPINK], [128, 262, 8, XGOLD], [54, 236, 7, NTEAL]])}
<g transform="rotate(30 150 150)">
<path d="M132,186 Q140,222 150,240 Q160,222 168,186 Z" fill="#FF7A21"/>
<path d="M141,186 Q146,206 150,216 Q154,206 159,186 Z" fill="${XGOLD}" stroke="none"/>
<rect x="146" y="180" width="8" height="96" rx="4" fill="#C68642"/>
<path d="M122,150 L94,194 L124,184 Z M178,150 L206,194 L176,184 Z" fill="${NBLUE}"/>
<rect x="122" y="76" width="56" height="112" rx="8" fill="${XRED}"/>
<rect x="122" y="100" width="56" height="14" fill="#fff" stroke-width="3"/><rect x="122" y="158" width="56" height="14" fill="#fff" stroke-width="3"/>
${twinkle(150, 136, 13, XGOLD)}
<path d="M116,80 L150,22 L184,80 Z" fill="${XGOLD}"/>
<path d="M134,52 L142,40" fill="none" stroke="#fff" stroke-width="5"/>
</g>`,
        },
        partypopper: {
            name: 'Party popper', caption: 'New Year',
            art: `<path d="M50,262 L114,138 L168,184 Z" fill="${NPURPLE}"/>
<path d="${popperStripes}" fill="none" stroke="${XGOLD}" stroke-width="8"/>
<path d="M50,262 L114,138 L168,184 Z" fill="none"/>
<ellipse cx="141" cy="161" rx="36" ry="12" transform="rotate(40.4 141 161)" fill="#5A3AA0"/>
${band('M146,150 C164,110 136,90 166,64 C186,46 210,60 228,38', NPINK, 6)}
${band('M156,162 C192,152 204,118 238,120 C260,122 266,104 274,90', NTEAL, 6)}
${band('M138,148 C124,112 100,106 94,74 C90,54 106,42 100,24', XGOLD, 6)}
${confetti([[208, 74, NPURPLE, 30], [250, 160, NPINK, -20], [124, 40, NTEAL, 15], [180, 26, XGOLD, -30], [70, 112, NPINK, 40], [232, 206, XGOLD, 10], [262, 54, NBLUE, 60]])}
${[[178, 98, NTEAL], [256, 26, XGOLD], [58, 70, NPURPLE], [212, 236, NPINK]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="6" fill="${c}" stroke-width="3"/>`).join('')}
${sparkles([[44, 150, 10, XGOLD], [268, 250, 9, NPINK]])}`,
        },
        midnight: {
            name: 'The countdown', caption: 'New Year',
            art: `<g transform="rotate(-14 150 60)"><path d="M126,72 L152,8 L178,72 Z" fill="${NPINK}"/>
<circle cx="146" cy="50" r="4" fill="${XGOLD}" stroke="none"/><circle cx="160" cy="36" r="4" fill="${XGOLD}" stroke="none"/><circle cx="156" cy="60" r="4" fill="${XGOLD}" stroke="none"/>
<circle cx="152" cy="10" r="10" fill="${XGOLD}"/></g>
<circle cx="150" cy="166" r="104" fill="${XGOLD}"/>
<circle cx="150" cy="166" r="86" fill="#fff"/>
<path d="${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6, r0 = i % 3 ? 74 : 68; return `M${f(150 + Math.sin(a) * r0)},${f(166 - Math.cos(a) * r0)} L${f(150 + Math.sin(a) * 80)},${f(166 - Math.cos(a) * 80)}`; }).join(' ')}" fill="none" stroke-width="5"/>
<text x="150" y="122" ${BLACK} font-size="24" fill="${INK}" stroke="none">12</text>
<text x="208" y="175" ${BLACK} font-size="22" fill="${INK}" stroke="none">3</text>
<text x="150" y="228" ${BLACK} font-size="22" fill="${INK}" stroke="none">6</text>
<text x="92" y="175" ${BLACK} font-size="22" fill="${INK}" stroke="none">9</text>
<path d="M150,166 L150,112" fill="none" stroke-width="10"/>
<path d="M150,166 L142,92" fill="none" stroke-width="6"/>
<circle cx="150" cy="166" r="8" fill="${XRED}" stroke-width="4"/>
${confetti([[34, 90, NPINK, 30], [270, 110, NTEAL, -20], [40, 240, NBLUE, 15], [262, 236, NPURPLE, -40]])}
${sparkles([[54, 40, 11, XGOLD], [256, 50, 9, NPINK]])}`,
        },
        partyhat: {
            name: 'Party hat', caption: 'New Year',
            art: `<path d="M84,252 C110,286 190,286 216,252" fill="none" stroke-width="3"/>
<path d="M82,248 L150,52 L218,248 Z" fill="${NTEAL}"/>
${[[150, 104, XGOLD], [126, 156, NPINK], [174, 168, XGOLD], [112, 214, XGOLD], [164, 222, NPINK], [150, 140, '#fff'], [196, 214, '#fff']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="9" fill="${c}" stroke-width="4"/>`).join('')}
<path d="M74,236 Q150,262 226,236 L232,256 Q150,284 68,256 Z" fill="${NPINK}"/>
${burst(150, 46, 28, 10, NPINK, { inner: 0.2, w: 5 })}<circle cx="150" cy="46" r="13" fill="${XGOLD}"/>
${confetti([[48, 110, XGOLD, 30], [256, 96, NPURPLE, -20], [244, 176, NPINK, 10], [56, 186, NBLUE, -30]])}
${sparkles([[234, 40, 11, XGOLD], [64, 50, 9, NTEAL]])}`,
        },
        sparkler: {
            name: 'Sparkler', caption: 'New Year',
            art: `${band('M70,274 L178,112', '#9EA7B0', 7)}
${band('M150,154 L178,112', '#5A5A5A', 12)}
${burst(186, 100, 74, 16, XGOLD, { inner: 0.22, w: 4 })}
${burst(186, 100, 50, 8, '#FF7A21', { inner: 0.3, rot: 11, w: 4 })}
<circle cx="186" cy="100" r="14" fill="#FFF4C2" stroke-width="4"/>
${sparkles([[94, 66, 13, XGOLD], [262, 196, 12, XGOLD], [260, 34, 9, '#fff'], [110, 150, 8, NPINK]])}`,
        },
        discoball: {
            name: 'Disco ball', caption: 'New Year',
            art: `<path d="M150,12 V50" fill="none" stroke-width="4"/>
<rect x="138" y="44" width="24" height="16" rx="3" fill="#9EA7B0"/>
${(() => { let d = ''; for (const a of [200, 225, 250, 290, 315, 340, 20, 45, 135, 160]) { const r = a * Math.PI / 180; d += `M${f(150 + Math.cos(r) * 106)},${f(150 + Math.sin(r) * 106)} L${f(150 + Math.cos(r) * 128)},${f(150 + Math.sin(r) * 128)} `; } return band(d.trim(), XGOLD, 5); })()}
<defs><clipPath id="discoClip"><circle cx="150" cy="150" r="92"/></clipPath></defs>
<circle cx="150" cy="150" r="92" fill="#C9D1D8"/>
<g clip-path="url(#discoClip)">
${[[94, 108, 28, '#fff'], [122, 87, 28, '#fff'], [70, 129, 24, '#EAF6FF'], [150, 171, 28, NTEAL], [178, 129, 28, NPINK], [122, 192, 28, XGOLD], [206, 171, 24, '#8E9AA6'], [94, 213, 28, '#8E9AA6'], [178, 213, 28, '#8E9AA6'], [206, 87, 24, '#fff']].map(([x, y, w, c]) => `<rect x="${x}" y="${y}" width="${w}" height="21" fill="${c}" stroke="none"/>`).join('')}
<path d="${[-3, -2, -1, 0, 1, 2, 3].map(k => `M50,${150 + k * 21 - 10.5} H250`).join(' ')}" fill="none" stroke-width="3"/>
<path d="M150,50 V250" fill="none" stroke-width="3"/>
${[28, 56, 80].map(rx => `<ellipse cx="150" cy="150" rx="${rx}" ry="92" fill="none" stroke-width="3"/>`).join('')}
</g>
<circle cx="150" cy="150" r="92" fill="none"/>
${sparkles([[54, 58, 12, '#fff'], [250, 250, 11, NPINK], [52, 248, 9, NTEAL]])}`,
        },
        calendar: {
            name: 'Fresh start', caption: 'New Year',
            art: `<rect x="58" y="54" width="184" height="210" rx="16" fill="#fff"/>
<path d="M58,118 V70 Q58,54 74,54 H226 Q242,54 242,70 V118 Z" fill="${XRED}"/>
<text x="150" y="98" ${BLACK} font-size="24" fill="#fff" stroke="none">JANUARY</text>
<text x="150" y="238" ${BLACK} font-size="118" fill="${INK}" stroke="none">1</text>
<path d="M58,232 L80,264 H74 Q58,264 58,248 Z" fill="#E6E6E6" stroke-width="4"/>
<rect x="96" y="34" width="16" height="40" rx="8" fill="#9EA7B0"/><rect x="188" y="34" width="16" height="40" rx="8" fill="#9EA7B0"/>
${sparkles([[34, 152, 12, XGOLD], [268, 112, 11, NPINK], [262, 246, 13, XGOLD], [38, 46, 9, NTEAL]])}`,
        },
        cheers: {
            name: 'Cheers!', caption: 'New Year',
            art: `${glass(112, 164, 14)}${glass(188, 164, -14)}
${star(150, 40, 18, XGOLD)}
<path d="M120,30 L108,18 M180,30 L192,18 M150,12 V2 M118,52 L102,52 M182,52 L198,52" fill="none" stroke-width="4"/>
${confetti([[48, 120, NPINK, 30], [256, 110, NTEAL, -30], [44, 220, XGOLD, 10], [258, 214, NPURPLE, -15]])}`,
        },
        balloons: {
            name: 'Balloons', caption: 'New Year',
            art: `<path d="M100,162 C100,200 140,222 150,256 M200,156 C200,200 160,222 150,256 M150,128 C140,170 160,210 150,256" fill="none" stroke-width="3"/>
${balloon(150, 70, XGOLD)}${balloon(96, 104, NPINK)}${balloon(204, 98, NTEAL)}
<path d="M150,256 C134,240 118,246 124,258 C128,266 142,262 150,256 Z M150,256 C166,240 182,246 176,258 C172,266 158,262 150,256 Z" fill="${NPURPLE}"/>
<circle cx="150" cy="256" r="6" fill="${NPURPLE}" stroke-width="4"/>
${confetti([[44, 210, XGOLD, 30], [256, 206, NPINK, -20], [36, 40, NTEAL, 15], [264, 30, NPURPLE, -30]])}`,
        },
    };

    // ---------------- Valentine's Day (and Ghana's Chocolate Day) ----------------
    const LRED = '#E63946', LPINK = '#FF8FAB', LBLUSH = '#FFD1DC', CHOC = '#6B3A1E';
    const bird = (x, y, body, wing, flip) => `<g transform="translate(${x},${y}) scale(${flip ? -1 : 1},1)">
<path d="M-38,8 L-66,24 L-60,4 Z" fill="${wing}"/>
<ellipse cx="0" cy="0" rx="44" ry="34" fill="${body}"/>
<ellipse cx="10" cy="14" rx="24" ry="14" fill="#fff" opacity="0.45" stroke="none"/>
<circle cx="34" cy="-28" r="24" fill="${body}"/>
<path d="M-26,-6 C-8,-22 18,-12 22,4 C8,18 -16,16 -26,-6 Z" fill="${wing}"/>
<path d="M54,-34 L70,-26 L54,-18 Z" fill="#FF9F1C" stroke-width="4"/>
<circle cx="42" cy="-34" r="4.5" fill="${INK}" stroke="none"/>
<circle cx="32" cy="-18" r="6" fill="${LPINK}" stroke="none" opacity="0.8"/>
<path d="M-8,32 L-10,44 M8,32 L8,44" fill="none" stroke-width="5"/></g>`;
    const candyHeart = (cx, cy, s, fill, rot, lines, size) => `<g transform="rotate(${rot} ${cx} ${cy})"><path d="${heartD(cx, cy, s)}" fill="${fill}"/>
${lines.map((t, i) => `<text x="${cx}" y="${f(cy - 0.08 * s + (i - (lines.length - 1) / 2) * size * 1.05 + size * 0.36)}" ${BLACK} font-size="${size}" fill="${LRED}" stroke="none">${t}</text>`).join('')}</g>`;
    const VALENTINE = {
        cupidheart: {
            name: 'Cupid’s arrow', caption: 'Valentine’s Day',
            art: `${band('M30,214 L272,86', '#C68642', 7)}
<path d="${heartD(150, 150, 96)}" fill="${LRED}"/>
<path d="M90,96 C80,110 80,126 88,138" fill="none" stroke="#fff" stroke-width="10"/>
<path d="M30,214 L23.5,201.6 L50,187.6 L56.5,200 Z M30,214 L36.5,226.4 L63,212.4 L56.5,200 Z" fill="${LPINK}"/>
<path d="M282.6,80.4 L269.3,102.2 L257.1,79.2 Z" fill="#9EA7B0"/>
<path d="${heartD(56, 58, 16)}" fill="${LPINK}"/><path d="${heartD(240, 236, 13)}" fill="${LPINK}"/>`,
        },
        loveletter: {
            name: 'Love letter', caption: 'Valentine’s Day',
            art: `<path d="${heartD(214, 52, 16)}" fill="${LRED}"/><path d="${heartD(250, 82, 10)}" fill="${LPINK}"/><path d="${heartD(86, 50, 12)}" fill="${LPINK}"/>
<g transform="rotate(-6 150 170)">
<rect x="38" y="100" width="224" height="150" rx="10" fill="${LBLUSH}"/>
<path d="M42,244 L128,176 M258,244 L172,176" fill="none" stroke-width="5"/>
<path d="M42,106 L150,186 L258,106 Z" fill="#FFB8C9"/>
<path d="${heartD(150, 184, 24)}" fill="${LRED}"/>
</g>`,
        },
        chocbox: {
            name: 'Box of chocolates', caption: 'Chocolate Day',
            art: `<path d="${heartD(180, 104, 72)}" fill="#C81D3A" transform="rotate(24 180 104)"/>
<path d="${heartD(140, 166, 96)}" fill="${LRED}"/>
<path d="${heartD(140, 166, 76)}" fill="#7A2E1C"/>
${[[102, 124], [178, 124], [90, 166], [140, 166], [190, 166], [118, 204], [162, 204]].map(([x, y], i) => i % 3 === 1
        ? `<rect x="${x - 16}" y="${y - 16}" width="32" height="32" rx="8" fill="${CHOC}" stroke-width="4"/><path d="M${x - 9},${y - 4} q4,-6 9,0 t9,0" fill="none" stroke="${LPINK}" stroke-width="3"/>`
        : `<circle cx="${x}" cy="${y}" r="17" fill="${i % 2 ? '#8B4A2B' : CHOC}" stroke-width="4"/><path d="M${x - 8},${y - 3} Q${x},${y - 11} ${x + 8},${y - 3}" fill="none" stroke="#A0612B" stroke-width="3"/>`).join('')}
<path d="${heartD(246, 238, 18)}" fill="${LPINK}"/>`,
        },
        cocoapod: {
            name: 'Ghana cocoa', caption: 'Chocolate Day',
            art: `<g transform="rotate(-28 156 118)">
${band('M56,118 L30,112', '#7A4A22', 7)}
<path d="M56,118 C56,74 104,52 156,52 C214,52 258,82 270,118 C258,154 214,184 156,184 C104,184 56,162 56,118 Z" fill="#F2A900"/>
<path d="M72,118 C120,104 200,104 256,118 M78,96 C126,80 200,80 246,96 M78,140 C126,156 200,156 246,140" fill="none" stroke="#C97A00" stroke-width="5"/>
</g>
<g transform="rotate(10 150 214)">
<rect x="70" y="176" width="160" height="80" rx="8" fill="${CHOC}"/>
<path d="M110,176 V256 M150,176 V256 M70,216 H150" fill="none" stroke="#4A2614" stroke-width="5"/>
<path d="M150,170 H236 V262 H150 Z" fill="${LRED}"/>
<path d="M150,170 V262" fill="none" stroke="#FFC93C" stroke-width="10"/>
<text x="194" y="214" ${BLACK} font-size="18" fill="#fff" stroke="none">GHANA</text>
<text x="194" y="236" ${BLACK} font-size="13" fill="${XGOLD}" stroke="none">COCOA</text>
</g>`,
        },
        rose: {
            name: 'Red rose', caption: 'Valentine’s Day',
            art: `${band('M150,176 C146,214 154,244 150,276', '#3E8E2B', 8)}
<path d="M150,226 C126,206 98,208 82,226 C104,240 130,240 150,226 Z" fill="#6DBE45"/>
<path d="M152,248 C176,228 204,230 220,248 C198,262 172,262 152,248 Z" fill="#6DBE45"/>
<path d="M146,226 L100,222 M156,248 L202,246" fill="none" stroke="#3E8E2B" stroke-width="3"/>
<path d="M144,196 L134,190 L144,188 Z M154,266 L164,260 L154,256 Z" fill="#3E8E2B" stroke-width="3"/>
<path d="M118,168 L150,186 L182,168 L164,176 L150,166 L136,176 Z" fill="#3E8E2B"/>
<path d="M92,104 C86,60 120,40 150,52 C180,40 214,60 208,104 C206,150 182,180 150,182 C118,180 94,150 92,104 Z" fill="${LRED}"/>
<path d="M96,112 C104,156 130,176 150,178 C130,160 118,138 116,112 Z M204,112 C196,156 170,176 150,178 C170,160 182,138 184,112 Z" fill="#C81D3A"/>
<path d="M150,72 C126,72 116,98 130,112 C144,126 172,118 172,96 C172,80 154,76 146,88 C140,98 152,108 160,100" fill="none" stroke-width="5"/>`,
        },
        teddy: {
            name: 'Teddy bear', caption: 'Valentine’s Day',
            art: `<circle cx="104" cy="56" r="22" fill="#B07A4F"/><circle cx="196" cy="56" r="22" fill="#B07A4F"/>
<circle cx="104" cy="56" r="11" fill="#E3B98E" stroke-width="4"/><circle cx="196" cy="56" r="11" fill="#E3B98E" stroke-width="4"/>
<ellipse cx="100" cy="248" rx="30" ry="22" fill="#B07A4F"/><ellipse cx="200" cy="248" rx="30" ry="22" fill="#B07A4F"/>
<ellipse cx="96" cy="252" rx="14" ry="11" fill="#E3B98E" stroke-width="4"/><ellipse cx="204" cy="252" rx="14" ry="11" fill="#E3B98E" stroke-width="4"/>
<ellipse cx="150" cy="196" rx="66" ry="64" fill="#B07A4F"/>
<circle cx="150" cy="94" r="54" fill="#B07A4F"/>
<ellipse cx="150" cy="114" rx="24" ry="18" fill="#E3B98E"/>
<ellipse cx="150" cy="105" rx="9" ry="6.5" fill="${INK}" stroke="none"/>
<path d="M150,110 V118 M150,118 Q142,126 136,120 M150,118 Q158,126 164,120" fill="none" stroke-width="3.5"/>
<circle cx="128" cy="82" r="6.5" fill="${INK}" stroke="none"/><circle cx="172" cy="82" r="6.5" fill="${INK}" stroke="none"/>
<circle cx="130" cy="80" r="2.2" fill="#fff" stroke="none"/><circle cx="174" cy="80" r="2.2" fill="#fff" stroke="none"/>
<path d="${heartD(150, 196, 50)}" fill="${LRED}"/>
<path d="M118,170 C112,180 112,192 116,200" fill="none" stroke="#fff" stroke-width="6"/>
<ellipse cx="106" cy="190" rx="17" ry="36" transform="rotate(-30 106 190)" fill="#B07A4F"/>
<ellipse cx="194" cy="190" rx="17" ry="36" transform="rotate(30 194 190)" fill="#B07A4F"/>`,
        },
        heartballoon: {
            name: 'Heart balloon', caption: 'Valentine’s Day',
            art: `<path d="M86,154 C92,200 122,232 146,276 M162,206 C150,226 172,246 146,276" fill="none" stroke-width="3"/>
<path d="${heartD(84, 110, 46)}" fill="${LPINK}" transform="rotate(-14 84 110)"/>
<path d="M78,150 L86,142 L94,150 Z" fill="${LPINK}" stroke-width="4"/>
<path d="${heartD(166, 116, 86)}" fill="${LRED}"/>
<path d="M156,206 L166,194 L176,206 Z" fill="${LRED}" stroke-width="4"/>
<path d="M112,74 C102,88 102,104 110,116" fill="none" stroke="#fff" stroke-width="9"/>
${sparkles([[262, 236, 11, LPINK], [40, 236, 9, LRED]])}`,
        },
        lovebirds: {
            name: 'Lovebirds', caption: 'Valentine’s Day',
            art: `${band('M18,224 C90,212 210,212 284,222', '#8B5A2B', 9)}
<path d="M40,220 C30,200 44,190 54,200 C54,210 48,216 40,220 Z M262,220 C272,200 258,190 248,200 C248,210 254,216 262,220 Z" fill="#6DBE45" stroke-width="4"/>
${bird(86, 178, '#FF8FAB', '#E86F8F', false)}${bird(214, 178, '#8CD867', '#5FB33A', true)}
<path d="${heartD(150, 92, 24)}" fill="${LRED}"/><path d="${heartD(186, 56, 12)}" fill="${LPINK}"/><path d="${heartD(118, 50, 10)}" fill="${LPINK}"/>`,
        },
        candyhearts: {
            name: 'Sweet hearts', caption: 'Valentine’s Day',
            art: `${candyHeart(92, 104, 54, '#C8F2D4', -14, ['XOXO'], 20)}
${candyHeart(214, 100, 50, '#D9C8FF', 12, ['HUG', 'ME'], 19)}
${candyHeart(236, 226, 36, '#FFF1A8', 18, ['LOVE'], 14)}
${candyHeart(140, 186, 76, LBLUSH, -4, ['BE', 'MINE'], 30)}`,
        },
        heartshades: {
            name: 'Heart shades', caption: 'Valentine’s Day',
            art: `${band('M42,118 L22,96 M258,118 L278,96', LRED, 7)}
<path d="${heartD(90, 150, 56)}" fill="${LRED}"/><path d="${heartD(210, 150, 56)}" fill="${LRED}"/>
${band('M140,128 Q150,118 160,128', LRED, 6)}
<path d="${heartD(90, 152, 40)}" fill="#3A2A3A"/><path d="${heartD(210, 152, 40)}" fill="#3A2A3A"/>
<path d="M66,128 L84,118 M64,144 L74,138 M186,128 L204,118 M184,144 L194,138" fill="none" stroke="#fff" stroke-width="5"/>
${sparkles([[150, 64, 14, XGOLD], [262, 240, 11, LPINK], [40, 236, 9, XGOLD]])}`,
        },
    };

    // ---------------- Ghana Independence Day ----------------
    const GR = '#CE1126', GG = '#FCD116', GN = '#006B3F', GSTAR = '#111';
    const pent = (cx, cy, r, rot) => 'M' + [0, 1, 2, 3, 4].map(i => {
        const a = (rot + i * 72 - 90) * Math.PI / 180;
        return `${f(cx + r * Math.cos(a))},${f(cy + r * Math.sin(a))}`;
    }).join(' L') + ' Z';
    // Pleats round a rosette: a zigzag circle.
    const pleats = (cx, cy, r1, r2, n) => 'M' + Array.from({ length: n * 2 }, (_, i) => {
        const a = i * Math.PI / n, r = i % 2 ? r2 : r1;
        return `${f(cx + Math.cos(a) * r)},${f(cy + Math.sin(a) * r)}`;
    }).join(' L') + ' Z';
    // Pennants hung along a curve from a to c (through control b), colours in turn; gold ones carry the star.
    const pennants = (a, b, c, n, offset) => {
        let out = band(`M${a.join(',')} Q${b.join(',')} ${c.join(',')}`, '#8B5A2B', 3);
        const colours = [GR, GG, GN];
        for (let i = 0; i < n; i++) {
            const t = (i + 0.5) / n, q = (u, k) => (1 - u) * (1 - u) * a[k] + 2 * (1 - u) * u * b[k] + u * u * c[k];
            const p0 = [q(t - 0.045, 0), q(t - 0.045, 1)], p1 = [q(t + 0.045, 0), q(t + 0.045, 1)];
            const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, dx = p1[0] - p0[0], dy = p1[1] - p0[1], len = Math.hypot(dx, dy);
            const tip = [mx - dy / len * 46, my + dx / len * 46], col = colours[(i + offset) % 3];
            out += `<path d="M${f(p0[0])},${f(p0[1])} L${f(p1[0])},${f(p1[1])} L${f(tip[0])},${f(tip[1])} Z" fill="${col}"/>`;
            if (col === GG) out += twinkle(f(mx - dy / len * 17), f(my + dx / len * 17), 8, GSTAR);
        }
        return out;
    };
    const smockStripes = (() => {
        let out = '';
        for (let x = 30, i = 0; x < 270; x += 10, i++) out += `<rect x="${x}" y="30" width="10" height="240" fill="${i % 4 === 3 ? GR : i % 2 ? '#F4F1EA' : '#2B3F8F'}" stroke="none"/>`;
        return out;
    })();
    const SMOCK = 'M96,52 L128,42 Q150,62 172,42 L204,52 L262,108 L238,140 L214,118 L226,264 H74 L86,118 L62,140 L38,108 Z';
    const INDEPENDENCE = {
        ghflag: {
            name: 'Ghana flag', caption: 'Independence Day',
            art: `<rect x="44" y="26" width="12" height="248" rx="5" fill="#8F9AA5"/><circle cx="50" cy="22" r="10" fill="${GG}"/>
<path d="M56,50 C108,30 170,74 258,50 V98 C170,122 108,78 56,98 Z" fill="${GR}" stroke="none"/>
<path d="M56,98 C108,78 170,122 258,98 V146 C170,170 108,126 56,146 Z" fill="${GG}" stroke="none"/>
<path d="M56,146 C108,126 170,170 258,146 V194 C170,218 108,174 56,194 Z" fill="${GN}" stroke="none"/>
${star(157, 123, 26, GSTAR)}
<path d="M56,50 C108,30 170,74 258,50 V194 C170,218 108,174 56,194 Z" fill="none"/>
<path d="M210,62 C206,100 210,150 206,198" fill="none" stroke="#fff" stroke-width="5" opacity="0.35"/>`,
        },
        blackstar: {
            name: 'The Black Star', caption: 'Independence Day',
            art: `<path d="M110,200 L84,282 L106,268 L120,288 L140,210 Z" fill="${GR}"/>
<path d="M190,200 L216,282 L194,268 L180,288 L160,210 Z" fill="${GN}"/>
<path d="${pleats(150, 140, 120, 100, 16)}" fill="${GG}"/>
<circle cx="150" cy="140" r="88" fill="${GG}"/>
${star(150, 146, 82, GSTAR)}
<path d="M118,108 L136,96" fill="none" stroke="#fff" stroke-width="6" opacity="0.6"/>`,
        },
        kente: {
            name: 'Kente cloth', caption: 'Independence Day',
            art: `<g transform="rotate(-12 150 150)">
<path d="${Array.from({ length: 14 }, (_, i) => `M40,${84 + i * 10} H24 M260,${84 + i * 10} H276`).join(' ')}" fill="none" stroke-width="4"/>
<rect x="40" y="76" width="220" height="148" fill="${GG}"/>
${[0, 1, 2, 3, 4].map(c => {
        const x = 40 + c * 44, kind = [0, 1, 2, 1, 0][c];
        if (kind === 0) return `<rect x="${x}" y="76" width="44" height="148" fill="${GN}" stroke="none"/>${[90, 116, 190, 208].map(y => `<rect x="${x}" y="${y}" width="44" height="9" fill="${GG}" stroke="none"/>`).join('')}<path d="M${x},${103} H${x + 44} M${x},${200} H${x + 44}" fill="none" stroke-width="3"/>`;
        if (kind === 1) return `<rect x="${x + 17}" y="76" width="10" height="148" fill="${GR}" stroke="none"/><path d="${zig([x + 4, 92], [x + 40, 92], 6, 6)} ${zig([x + 4, 208], [x + 40, 208], 6, 6)}" fill="none" stroke-width="3.5"/>`;
        return `<rect x="${x}" y="76" width="44" height="148" fill="${GR}" stroke="none"/><path d="M${x + 12},76 V224 M${x + 32},76 V224" fill="none" stroke="${GG}" stroke-width="5"/><path d="${[88, 104, 196, 212].map(y => `M${x + 12},${y} H${x + 32}`).join(' ')}" fill="none" stroke="${GG}" stroke-width="4"/>`;
    }).join('')}
<rect x="40" y="138" width="220" height="24" fill="${INK}" stroke="none"/>
${[50, 72, 94, 116, 138, 160, 182, 204, 226, 248].map((x, i) => `<rect x="${x - 5}" y="145" width="10" height="10" fill="${i % 2 ? GR : GG}" stroke="none"/>`).join('')}
<rect x="40" y="76" width="220" height="148" fill="none"/>
</g>`,
        },
        talkingdrum: {
            name: 'Talking drum', caption: 'Independence Day',
            art: `${band('M232,256 C258,216 260,154 244,122 C238,110 224,108 218,116', '#A0612B', 9)}
<ellipse cx="150" cy="236" rx="56" ry="16" fill="#E8D3A4"/>
<path d="M96,74 C138,120 138,190 96,236 H204 C162,190 162,120 204,74 Z" fill="#A0612B"/>
<path d="M134,155 H166" fill="none" stroke="#7A4A22" stroke-width="6"/>
${(() => { const d = Array.from({ length: 11 }, (_, i) => { const x = 100 + i * 10; return `M${x},78 Q${f(150 + (x - 150) * 0.3)},155 ${x},232`; }).join(' '); return `<path d="${d}" fill="none" stroke-width="5"/><path d="${d}" fill="none" stroke="#F3E3B5" stroke-width="2.4"/>`; })()}
<ellipse cx="150" cy="74" rx="56" ry="16" fill="#F3E3B5"/>
<ellipse cx="150" cy="74" rx="48" ry="11" fill="none" stroke="#C9B48A" stroke-width="3"/>
<path d="M58,52 Q48,42 56,30 M74,40 Q68,30 74,20" fill="none" stroke-width="4"/>`,
        },
        marchpast: {
            name: 'March past', caption: 'Independence Day',
            art: `<g transform="translate(150,270) scale(1.15) translate(-150,-270)">
<path d="M112,206 V56" fill="none" stroke-width="10"/><path d="M112,206 V56" fill="none" stroke="#A0612B" stroke-width="4"/>
<path d="M52,58 H112 V72 H52 Z" fill="${GR}" stroke="none"/><path d="M52,72 H112 V86 H52 Z" fill="${GG}" stroke="none"/><path d="M52,86 H112 V100 H52 Z" fill="${GN}" stroke="none"/>
${twinkle(82, 79, 7, GSTAR)}<rect x="52" y="58" width="60" height="42" fill="none" stroke-width="5"/>
${person({ x: 150, foot: 262, skin: '#6B3E26', top: '#F2B33D', pants: '#7A4A22', arms: [[[171, 148], [192, 132], [166, 112]], [[129, 148], [118, 172], [112, 186]]] })}
<path d="M141,146 L150,160 L159,146" fill="none" stroke="#7A4A22" stroke-width="4"/>
</g>`,
        },
        blackstars: {
            name: 'Black Stars', caption: 'Independence Day',
            art: `<path d="M30,118 H64 M22,146 H58 M30,174 H64" fill="none" stroke-width="5"/>
<defs><clipPath id="starBall"><circle cx="160" cy="128" r="94"/></clipPath></defs>
<circle cx="160" cy="128" r="94" fill="#fff"/>
<g clip-path="url(#starBall)">
${[0, 1, 2, 3, 4].map(k => { const a = (-90 + k * 72) * Math.PI / 180; return `<path d="${pent(f(160 + Math.cos(a) * 86), f(128 + Math.sin(a) * 86), 26, 180 + k * 72)}" fill="${INK}" stroke="none"/><path d="M${f(160 + Math.cos(a) * 46)},${f(128 + Math.sin(a) * 46)} L${f(160 + Math.cos(a) * 62)},${f(128 + Math.sin(a) * 62)}" fill="none" stroke-width="3"/>`; }).join('')}
</g>
<circle cx="160" cy="128" r="94" fill="none"/>
${star(160, 130, 40, GSTAR)}
<path d="M40,214 H260 L250,236 L260,258 H40 L50,236 Z" fill="${GG}"/>
<path d="M40,214 L22,206 L30,234 L22,262 L40,258 Z" fill="${GR}"/><path d="M260,214 L278,206 L270,234 L278,262 L260,258 Z" fill="${GN}"/>
<text x="150" y="245" ${BLACK} font-size="25" fill="${INK}" stroke="none">BLACK STARS</text>`,
        },
        rosette: {
            name: '6 March 1957', caption: 'Independence Day',
            art: `<path d="M120,190 L92,282 L114,270 L128,288 L150,200 Z" fill="${GR}"/>
<path d="M180,190 L208,282 L186,270 L172,288 L150,200 Z" fill="${GN}"/>
<path d="${pleats(150, 128, 110, 96, 28)}" fill="${GR}"/>
<circle cx="150" cy="128" r="88" fill="${GG}"/>
<circle cx="150" cy="128" r="72" fill="${GN}"/>
<circle cx="150" cy="128" r="56" fill="#fff"/>
${twinkle(150, 96, 13, GSTAR)}
<text x="150" y="141" ${BLACK} font-size="30" fill="${INK}" stroke="none">1957</text>
<text x="150" y="163" ${BLACK} font-size="12" fill="${GR}" stroke="none">6 MARCH</text>`,
        },
        bunting: {
            name: 'Bunting', caption: 'Independence Day',
            art: `${pennants([18, 54], [150, 128], [282, 54], 7, 0)}
${pennants([18, 158], [150, 232], [282, 158], 7, 1)}
<circle cx="18" cy="54" r="7" fill="#9EA7B0" stroke-width="4"/><circle cx="282" cy="54" r="7" fill="#9EA7B0" stroke-width="4"/>
<circle cx="18" cy="158" r="7" fill="#9EA7B0" stroke-width="4"/><circle cx="282" cy="158" r="7" fill="#9EA7B0" stroke-width="4"/>`,
        },
        motto: {
            name: 'Freedom and Justice', caption: 'Independence Day',
            art: `${star(150, 98, 60, GSTAR)}
<path d="M58,182 L16,186 L32,214 L16,242 L66,242 L58,228 Z" fill="${GR}"/>
<path d="M242,182 L284,186 L268,214 L284,242 L234,242 L242,228 Z" fill="${GN}"/>
<path d="M50,172 Q150,152 250,172 V232 Q150,212 50,232 Z" fill="${GG}"/>
<text x="150" y="191" ${BLACK} font-size="20" fill="${INK}" stroke="none">FREEDOM AND</text>
<text x="150" y="217" ${BLACK} font-size="20" fill="${INK}" stroke="none">JUSTICE</text>`,
        },
        fugu: {
            name: 'Fugu smock', caption: 'Independence Day',
            art: `<defs><clipPath id="smock"><path d="${SMOCK}"/></clipPath></defs>
<g clip-path="url(#smock)">${smockStripes}</g>
<path d="${SMOCK}" fill="none"/>
<path d="M128,44 L150,92 L172,44" fill="none" stroke-width="9"/><path d="M128,44 L150,92 L172,44" fill="none" stroke="${GG}" stroke-width="4"/>
<path d="M136,70 L124,82 M164,70 L176,82 M142,84 L132,96 M158,84 L168,96 M150,92 V112" fill="none" stroke="${GG}" stroke-width="4"/>
<rect x="166" y="150" width="34" height="38" rx="4" fill="#2B3F8F"/><path d="M166,160 H200" fill="none" stroke="${GG}" stroke-width="3"/>`,
        },
    };

    // ---------------- Easter (with paragliding at Kwahu) ----------------
    const EBLUE = '#9CD3F0', EPINK = '#FFB3C6', EYEL = '#FFE066', ELILAC = '#C9B6F2', EMINT = '#A8E6C1', CREAM = '#F7F2EA';
    const zigBand = (x0, x1, y, a, n) => zig([x0, y], [x1, y], n, a);
    const decoEgg = (cx, cy, rx, ry, fill, deco, rot = 0, id) => `<g transform="rotate(${rot} ${cx} ${cy})"><defs><clipPath id="${id}"><path d="${eggD(cx, cy, rx, ry)}"/></clipPath></defs>
<path d="${eggD(cx, cy, rx, ry)}" fill="${fill}"/><g clip-path="url(#${id})">${deco}</g><path d="${eggD(cx, cy, rx, ry)}" fill="none"/></g>`;
    // A fringe of grass blades along y, from x0 to x1.
    const grass = (x0, x1, y, h) => {
        let d = `M${x0},${y}`;
        for (let x = x0, i = 0; x < x1; x += 18, i++) d += ` Q${x + 6},${y - h * 0.5} ${x + 9},${y - h * (i % 3 === 1 ? 1 : 0.75)} Q${x + 12},${y - h * 0.4} ${Math.min(x + 18, x1)},${y}`;
        return `<path d="${d} Z" fill="#6DBE45" stroke-width="4"/>`;
    };
    const EASTER = {
        easteregg: {
            name: 'Easter egg', caption: 'Easter',
            art: `${decoEgg(150, 150, 96, 118, EBLUE, `<path d="${zigBand(40, 260, 118, 12, 14)} L260,150 ${zigBand(260, 40, 150, 12, 14).replace('M', 'L')} Z" fill="${EYEL}" stroke-width="5"/>
<rect x="40" y="184" width="220" height="18" fill="${EPINK}" stroke-width="5"/>
<path d="M40,226 H260" fill="none" stroke="${ELILAC}" stroke-width="10"/>
${[[110, 70], [150, 60], [190, 70], [130, 92], [170, 92], [96, 250], [150, 254], [204, 250]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#fff" stroke-width="3"/>`).join('')}`, 0, 'bigEgg')}
${grass(24, 276, 274, 22)}`,
        },
        bunny: {
            name: 'Easter bunny', caption: 'Easter',
            art: `<ellipse cx="120" cy="60" rx="20" ry="52" transform="rotate(-10 120 60)" fill="${CREAM}"/><ellipse cx="121" cy="66" rx="9" ry="38" transform="rotate(-10 121 66)" fill="${EPINK}" stroke-width="3"/>
<ellipse cx="180" cy="60" rx="20" ry="52" transform="rotate(10 180 60)" fill="${CREAM}"/><ellipse cx="179" cy="66" rx="9" ry="38" transform="rotate(10 179 66)" fill="${EPINK}" stroke-width="3"/>
<ellipse cx="150" cy="212" rx="70" ry="58" fill="${CREAM}"/>
<ellipse cx="104" cy="262" rx="30" ry="14" fill="${CREAM}"/><ellipse cx="196" cy="262" rx="30" ry="14" fill="${CREAM}"/>
<ellipse cx="150" cy="130" rx="58" ry="50" fill="${CREAM}"/>
<circle cx="128" cy="122" r="7" fill="${INK}" stroke="none"/><circle cx="172" cy="122" r="7" fill="${INK}" stroke="none"/>
<circle cx="130" cy="119" r="2.4" fill="#fff" stroke="none"/><circle cx="174" cy="119" r="2.4" fill="#fff" stroke="none"/>
<circle cx="112" cy="142" r="9" fill="${EPINK}" stroke="none" opacity="0.8"/><circle cx="188" cy="142" r="9" fill="${EPINK}" stroke="none" opacity="0.8"/>
<path d="M144,140 H156 L150,148 Z" fill="${EPINK}" stroke-width="3"/>
<rect x="144" y="155" width="12" height="11" rx="2" fill="#fff" stroke-width="3"/>
<path d="M150,148 V155 M150,155 Q142,162 134,156 M150,155 Q158,162 166,156 M104,146 L80,140 M104,154 L82,158 M196,146 L220,140 M196,154 L218,158" fill="none" stroke-width="3"/>
${decoEgg(150, 214, 30, 38, EBLUE, `<path d="${zigBand(110, 190, 208, 7, 10)}" fill="none" stroke="${EYEL}" stroke-width="8"/><path d="M110,232 H190" fill="none" stroke="${EPINK}" stroke-width="8"/>`, 0, 'bunnyEgg')}
<ellipse cx="118" cy="224" rx="16" ry="12" fill="${CREAM}"/><ellipse cx="182" cy="224" rx="16" ry="12" fill="${CREAM}"/>`,
        },
        chick: {
            name: 'Just hatched', caption: 'Easter',
            art: `<circle cx="150" cy="150" r="66" fill="${EYEL}"/>
<path d="M86,160 C64,150 58,176 72,186 C78,180 86,178 92,182 Z" fill="${EYEL}"/><path d="M214,160 C236,150 242,176 228,186 C222,180 214,178 208,182 Z" fill="${EYEL}"/>
<circle cx="128" cy="140" r="7" fill="${INK}" stroke="none"/><circle cx="172" cy="140" r="7" fill="${INK}" stroke="none"/>
<circle cx="130" cy="137" r="2.4" fill="#fff" stroke="none"/><circle cx="174" cy="137" r="2.4" fill="#fff" stroke="none"/>
<circle cx="112" cy="160" r="9" fill="${EPINK}" stroke="none" opacity="0.8"/><circle cx="188" cy="160" r="9" fill="${EPINK}" stroke="none" opacity="0.8"/>
<path d="M136,156 L150,150 L164,156 L150,172 Z" fill="#FF9F1C" stroke-width="4"/>
<path d="M136,156 H164" fill="none" stroke-width="3"/>
<path d="M106,104 L122,116 L136,100 L150,116 L164,100 L178,116 L194,104 C192,74 172,56 150,56 C128,56 108,74 106,104 Z" fill="${CREAM}"/>
<path d="M66,188 L84,170 L102,188 L120,168 L138,188 L156,168 L174,188 L192,168 L210,188 L228,170 L236,190 C236,240 200,272 150,272 C100,272 64,240 66,188 Z" fill="${CREAM}"/>
${[[110, 220], [176, 236], [196, 210], [128, 250], [146, 76], [168, 86]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#E6DCCB" stroke="none"/>`).join('')}
${sparkles([[50, 90, 11, EYEL], [254, 72, 9, EPINK], [258, 250, 10, EBLUE]])}`,
        },
        eggbasket: {
            name: 'Egg hunt', caption: 'Easter',
            art: `${band('M64,170 C60,40 240,40 236,170', '#C68642', 14)}
<path d="M64,170 C60,40 240,40 236,170" fill="none" stroke="#8B5A2B" stroke-width="4" stroke-dasharray="10 12"/>
${decoEgg(96, 152, 26, 34, EPINK, `<path d="${zigBand(66, 126, 150, 6, 8)}" fill="none" stroke="#fff" stroke-width="6"/>`, -20, 'basketEgg1')}
${decoEgg(138, 142, 26, 34, EBLUE, `${[[128, 130], [146, 138], [134, 156], [150, 160]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#fff" stroke="none"/>`).join('')}`, -6, 'basketEgg2')}
${decoEgg(180, 144, 26, 34, EYEL, `<path d="M150,136 H210 M150,154 H210" fill="none" stroke="${EPINK}" stroke-width="7"/>`, 8, 'basketEgg3')}
${decoEgg(216, 158, 24, 30, ELILAC, `<path d="${zigBand(188, 244, 158, 6, 8)}" fill="none" stroke="${EMINT}" stroke-width="6"/>`, 22, 'basketEgg4')}
${grass(56, 244, 178, 22)}
<path d="M52,172 H248 L230,256 Q150,272 70,256 Z" fill="#C68642"/>
<path d="M60,202 H240 M66,230 H234" fill="none" stroke="#8B5A2B" stroke-width="5"/>
<path d="M90,180 V196 M130,180 V196 M170,180 V196 M210,180 V196 M110,208 V224 M150,208 V224 M190,208 V224" fill="none" stroke="#8B5A2B" stroke-width="4"/>
<rect x="44" y="164" width="212" height="18" rx="9" fill="#A0612B"/>
<path d="M150,60 C128,36 104,42 112,60 C118,72 136,68 150,60 Z M150,60 C172,36 196,42 188,60 C182,72 164,68 150,60 Z" fill="${EPINK}"/><circle cx="150" cy="60" r="7" fill="#FF8FAB" stroke-width="4"/>`,
        },
        paraglider: {
            name: 'Kwahu paragliding', caption: 'Easter',
            art: `<circle cx="58" cy="60" r="26" fill="${EYEL}"/>
<path d="M14,252 C50,198 90,190 120,214 C150,172 200,162 286,202 V276 H14 Z" fill="#4E9A2E"/>
<path d="M14,276 V246 C70,228 140,242 200,254 C240,242 270,238 286,242 V276 Z" fill="#6DBE45"/>
${(() => {
        const cub = (p, t) => { const u = 1 - t; return [0, 1].map(k => u * u * u * p[0][k] + 3 * u * u * t * p[1][k] + 3 * u * t * t * p[2][k] + t * t * t * p[3][k]); };
        const top = [[66, 98], [88, 48], [212, 48], [234, 98]], bot = [[82, 110], [102, 78], [198, 78], [218, 110]];
        const colours = ['#E63946', '#FFC93C', '#2E9BF6', '#E63946', '#FFC93C', '#2E9BF6', '#E63946'];
        let cells = '', lines = '';
        for (let i = 0; i < 7; i++) {
            const a = cub(top, i / 7), b = cub(top, (i + 1) / 7), c = cub(bot, (i + 1) / 7), d = cub(bot, i / 7);
            cells += `<path d="M${a.map(f)} L${b.map(f)} L${c.map(f)} L${d.map(f)} Z" fill="${colours[i]}" stroke-width="4"/>`;
        }
        for (let i = 0; i <= 7; i += 1) { const p = cub(bot, i / 7); lines += `M${p.map(f)} L164,192 `; }
        return `<path d="${lines.trim()}" fill="none" stroke-width="2"/>${cells}`;
    })()}
<rect x="156" y="196" width="18" height="24" rx="6" fill="#2E9BF6"/>
${band('M170,218 L196,226', '#3A3A3A', 6)}
<circle cx="165" cy="186" r="10" fill="#8D5524"/><path d="M155,184 A10,10 0 0 1 175,184 Z" fill="${XGOLD}"/>
<path d="M236,40 q6,-6 12,0 q6,-6 12,0 M100,30 q5,-5 10,0 q5,-5 10,0" fill="none" stroke-width="3.5"/>`,
        },
        hotcrossbun: {
            name: 'Hot cross bun', caption: 'Easter',
            art: `<path d="M112,64 C102,48 122,38 112,22 M150,58 C140,42 160,32 150,16 M188,64 C178,48 198,38 188,22" fill="none" stroke-width="4"/>
<ellipse cx="150" cy="238" rx="128" ry="30" fill="#fff"/><ellipse cx="150" cy="234" rx="100" ry="20" fill="#F2F2F2"/>
<path d="M44,214 C44,120 96,80 150,80 C204,80 256,120 256,214 C256,236 214,250 150,250 C86,250 44,236 44,214 Z" fill="#D98A4A"/>
<path d="M78,140 C88,116 110,100 132,94" fill="none" stroke="#F2B37A" stroke-width="9"/>
${[[90, 196], [204, 132], [116, 218], [196, 214], [228, 186], [104, 128]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="3.5" fill="#5A2E14" stroke="none"/>`).join('')}
${band('M64,172 Q150,150 236,172', '#FFF8EC', 18)}
${band('M150,94 C140,150 140,200 150,240', '#FFF8EC', 18)}`,
        },
        lily: {
            name: 'Easter lily', caption: 'Easter',
            art: `${band('M150,276 C146,232 150,196 158,160', '#3E8E2B', 7)}
${band('M156,190 C176,160 192,140 210,130', '#3E8E2B', 5)}
<path d="M150,262 C120,230 98,190 92,150 C116,180 138,214 152,252 Z" fill="#5FB33A"/>
<path d="M152,250 C176,224 198,206 236,196 C210,222 182,244 156,262 Z" fill="#5FB33A"/>
<path d="M206,132 C214,108 236,98 256,100 C244,114 232,128 212,138 Z" fill="#F4FFF0"/>
${[0, 60, 120, 180, 240, 300].map(a => `<path d="M150,118 C164,98 162,62 150,42 C138,62 136,98 150,118 Z" transform="rotate(${a + 15} 150 118)" fill="#fff"/><path d="M150,112 V58" transform="rotate(${a + 15} 150 118)" fill="none" stroke="#D9E8C8" stroke-width="3"/>`).join('')}
<circle cx="150" cy="118" r="18" fill="#E8F8C8"/>
${[[-30, 42], [10, 40], [50, 44], [-70, 38], [90, 40], [130, 42]].map(([a, r]) => { const t = a * Math.PI / 180, x = f(150 + Math.cos(t) * r), y = f(118 + Math.sin(t) * r); return `<path d="M150,118 L${x},${y}" fill="none" stroke="#7CB342" stroke-width="3"/><ellipse cx="${x}" cy="${y}" rx="6" ry="3.5" transform="rotate(${a} ${x} ${y})" fill="#E8742A" stroke-width="2.5"/>`; }).join('')}`,
        },
        chocbunny: {
            name: 'Chocolate bunny', caption: 'Easter',
            art: `${unite(`<ellipse cx="160" cy="204" rx="70" ry="60"/><circle cx="118" cy="128" r="44"/>
<ellipse cx="102" cy="58" rx="17" ry="46" transform="rotate(-14 102 58)"/>
<path d="M120,100 C116,62 124,26 140,16 L146,26 L138,32 L148,38 L142,48 L152,54 C154,74 148,94 140,102 Z"/>
<ellipse cx="116" cy="258" rx="38" ry="14"/><circle cx="232" cy="214" r="16"/>`, '#7A4A2B')}
<path d="M98,26 C92,48 92,72 98,90 M140,30 C134,52 134,74 136,92" fill="none" stroke="#A0673A" stroke-width="6"/>
<path d="M200,168 C222,184 226,214 214,238" fill="none" stroke="#A0673A" stroke-width="7"/>
<path d="M98,124 Q106,116 114,124" fill="none" stroke="#3E2010" stroke-width="5"/>
<path d="M80,140 L88,136 L84,146 Z" fill="#3E2010" stroke="none"/>
<path d="M104,252 Q116,244 128,252" fill="none" stroke="#3E2010" stroke-width="4"/>
${band('M84,164 Q120,182 160,158', LRED, 9)}
<path d="M150,162 C130,140 112,148 120,162 C126,172 140,170 150,162 Z M150,162 C172,144 190,152 182,166 C176,176 162,172 150,162 Z" fill="${LRED}"/>
<circle cx="150" cy="163" r="7" fill="#A81E2D" stroke-width="4"/>
<circle cx="150" cy="186" r="9" fill="${XGOLD}" stroke-width="4"/>
${[[160, 30], [170, 44], [162, 52]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="#7A4A2B" stroke-width="2.5"/>`).join('')}`,
        },
        sunrise: {
            name: 'Sunrise service', caption: 'Easter',
            art: `${(() => { let d = ''; for (let a = 196; a <= 344; a += 18.5) { const r = a * Math.PI / 180; d += `M${f(150 + Math.cos(r) * 96)},${f(178 + Math.sin(r) * 96)} L${f(150 + Math.cos(r) * 126)},${f(178 + Math.sin(r) * 126)} `; } return band(d.trim(), '#FFB020', 7); })()}
<circle cx="150" cy="178" r="84" fill="${GLOW}"/>
<rect x="142" y="78" width="16" height="114" rx="3" fill="#A0612B"/>
<rect x="112" y="106" width="76" height="15" rx="3" fill="#A0612B"/>
<path d="M14,276 V214 C70,172 230,172 286,214 V276 Z" fill="#6DBE45"/>
${[[60, 236, '#fff'], [92, 214, EPINK], [214, 222, '#fff'], [244, 244, ELILAC], [126, 252, EYEL], [180, 248, EPINK]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="7" fill="${c}" stroke-width="3.5"/><circle cx="${x}" cy="${y}" r="2.4" fill="#FFB020" stroke="none"/>`).join('')}
<path d="M44,70 q6,-6 12,0 q6,-6 12,0 M236,48 q5,-5 10,0 q5,-5 10,0" fill="none" stroke-width="3.5"/>`,
        },
        eggspoon: {
            name: 'Egg and spoon race', caption: 'Easter',
            art: `<path d="M24,170 H66 M16,196 H54 M28,222 H62" fill="none" stroke-width="5"/>
${band('M56,270 L164,163', '#C9D1D8', 9)}
<ellipse cx="196" cy="132" rx="50" ry="28" transform="rotate(-44 196 132)" fill="#C9D1D8"/>
<ellipse cx="200" cy="128" rx="30" ry="14" transform="rotate(-44 200 128)" fill="#E6EBEF" stroke="none"/>
${decoEgg(202, 98, 30, 38, EPINK, `<path d="${zigBand(168, 236, 96, 6, 8)}" fill="none" stroke="${EYEL}" stroke-width="7"/><path d="M168,118 H236" fill="none" stroke="${EBLUE}" stroke-width="7"/>`, -10, 'spoonEgg')}
<path d="M156,56 Q148,70 154,84 M250,58 Q258,72 252,86" fill="none" stroke-width="4"/>
<path d="M220,232 L206,280 L222,272 L232,286 L240,236 Z" fill="${EBLUE}"/>
<path d="${pleats(236, 222, 34, 28, 14)}" fill="${GLOW}"/><circle cx="236" cy="222" r="22" fill="#fff"/>
<text x="236" y="229" ${BLACK} font-size="17" fill="${INK}" stroke="none">1ST</text>`,
        },
    };

    return {
        halloween: HALLOWEEN,
        christmas: CHRISTMAS,
        newyear: NEWYEAR,
        valentine: VALENTINE,
        'ghana-independence': INDEPENDENCE,
        easter: EASTER,
    };
};
