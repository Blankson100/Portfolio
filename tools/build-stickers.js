// Builds the scratch-off landmark stickers into /stickers and a review page
// sticker-preview.html. Same wobbly marker style as the avatar add-ons; each sticker
// gets a white die-cut border so it reads as something pasted onto the page.
// Run: node tools/build-stickers.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'stickers');

const f = n => Math.round(n * 10) / 10;
const star = (cx, cy, r, fill) => {
    const pts = [];
    for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r;
        pts.push(`${f(cx + Math.cos(a) * rr)},${f(cy + Math.sin(a) * rr)}`);
    }
    return `<path d="M${pts.join(' L')} Z" fill="${fill}"/>`;
};
const ground = (y = 262, x1 = 22, x2 = 278) => `<path d="M${x1},${y} H${x2}" fill="none"/>`;

// id -> landmark name, city label, drawing (viewBox 0 0 300 300)
const LANDMARKS = {
    accra: {
        name: 'Black Star Gate', city: 'Accra, Ghana',
        art: `<rect x="34" y="96" width="232" height="22" fill="#E6DCCB"/>
<rect x="46" y="118" width="208" height="136" fill="#F6F0E6"/>
<rect x="46" y="118" width="208" height="7" fill="#CE1126" stroke="none"/>
<rect x="46" y="125" width="208" height="7" fill="#FCD116" stroke="none"/>
<rect x="46" y="132" width="208" height="7" fill="#006B3F" stroke="none"/>
<rect x="46" y="118" width="208" height="136" fill="none"/>
<rect x="62" y="150" width="30" height="88" fill="#EDE4D5"/>
<rect x="208" y="150" width="30" height="88" fill="#EDE4D5"/>
<path d="M116,254 V178 Q150,148 184,178 V254 Z" fill="#9CCBEA"/>
<rect x="140" y="84" width="20" height="12" fill="#E6DCCB"/>
${star(150, 52, 36, '#111')}
${ground(256)}`,
    },
    london: {
        name: 'Big Ben', city: 'London, UK',
        art: `<path d="M150,14 L170,62 H130 Z" fill="#6F6250"/>
<rect x="130" y="62" width="40" height="22" fill="#D9BF84"/>
<path d="M122,84 L128,72 L134,84 Z M166,84 L172,72 L178,84 Z" fill="#6F6250"/>
<rect x="122" y="84" width="56" height="58" fill="#E3C98E"/>
<circle cx="150" cy="113" r="20" fill="#fff"/>
<path d="M150,113 V100 M150,113 L160,119" fill="none" stroke-width="4"/>
<rect x="128" y="142" width="44" height="112" fill="#D9BF84"/>
<path d="M141,152 V244 M159,152 V244" fill="none" stroke-width="3"/>
<rect x="118" y="252" width="64" height="12" fill="#C7AC72"/>
${ground(264, 60, 240)}`,
    },
    paris: {
        name: 'Eiffel Tower', city: 'Paris, France',
        art: `<path d="M70,262 L104,198 L128,140 L144,56 L150,22 L156,56 L172,140 L196,198 L230,262 L196,262 Q150,212 104,262 Z" fill="#8B6F55"/>
<rect x="96" y="192" width="108" height="12" fill="#6E5641"/>
<rect x="122" y="134" width="56" height="10" fill="#6E5641"/>
<rect x="140" y="50" width="20" height="8" fill="#6E5641"/>
<path d="M110,236 L130,210 M130,236 L110,210 M190,236 L170,210 M170,236 L190,210 M136,186 L164,148 M164,186 L136,148 M142,128 L158,70 M158,128 L142,70" fill="none" stroke-width="3"/>
${ground(264, 40, 260)}`,
    },
    newyork: {
        name: 'Statue of Liberty', city: 'New York, USA',
        art: `<path d="M108,264 H192 L184,214 H116 Z" fill="#D7CEC0"/>
<rect x="112" y="204" width="76" height="12" fill="#C9BFAE"/>
<path d="M124,204 C120,170 128,128 140,106 L162,106 C172,128 180,170 176,204 Z" fill="#7FB8A4"/>
<path d="M144,120 L138,198 M156,122 L162,198" fill="none" stroke-width="3"/>
<path d="M158,108 L174,58 L186,62 L170,112 Z" fill="#7FB8A4"/>
<rect x="174" y="44" width="16" height="16" fill="#6FA592"/>
<path d="M182,12 C194,26 192,40 182,42 C172,40 170,26 182,12 Z" fill="#FFB020"/>
<circle cx="151" cy="92" r="13" fill="#7FB8A4"/>
<path d="M137,84 L126,74 M141,79 L134,66 M151,78 L151,62 M161,79 L168,66 M165,84 L176,74" fill="none" stroke-width="4"/>
<rect x="126" y="130" width="16" height="24" rx="2" fill="#6FA592" transform="rotate(-12 134 142)"/>
${ground(264, 70, 230)}`,
    },
    dubai: {
        name: 'Burj Khalifa', city: 'Dubai, UAE',
        art: `<rect x="96" y="232" width="24" height="32" fill="#A9C1D9"/>
<rect x="180" y="232" width="24" height="32" fill="#A9C1D9"/>
<path d="M118,264 L118,214 L126,214 L126,168 L134,168 L134,122 L140,122 L140,80 L145,80 L145,46 L148,46 L150,10 L152,46 L155,46 L155,80 L160,80 L160,122 L166,122 L166,168 L174,168 L174,214 L182,214 L182,264 Z" fill="#B9CFE4"/>
<path d="M150,50 V262" fill="none" stroke-width="3"/>
<circle cx="232" cy="64" r="20" fill="#FFD23F"/>
${ground(264, 60, 240)}`,
    },
    tokyo: {
        name: 'Tokyo Tower', city: 'Tokyo, Japan',
        art: `<path d="M80,262 L110,200 L130,150 L142,70 L150,24 L158,70 L170,150 L190,200 L220,262 L192,262 Q150,222 108,262 Z" fill="#E8452C"/>
<path d="M104,212 L196,212 M121,170 L179,170 M138,96 L162,96" fill="none" stroke="#fff" stroke-width="9"/>
<path d="M80,262 L110,200 L130,150 L142,70 L150,24 L158,70 L170,150 L190,200 L220,262 L192,262 Q150,222 108,262 Z" fill="none"/>
<rect x="116" y="138" width="68" height="16" fill="#fff"/>
<rect x="134" y="84" width="32" height="10" fill="#fff"/>
<path d="M118,246 L134,222 M134,246 L118,222 M182,246 L166,222 M166,246 L182,222" fill="none" stroke-width="3"/>
${ground(264, 50, 250)}`,
    },
    sydney: {
        name: 'Opera House', city: 'Sydney, Australia',
        art: `<rect x="18" y="234" width="264" height="32" rx="6" fill="#6CB4E4"/>
<path d="M36,252 q10,-6 20,0 t20,0 M150,254 q10,-6 20,0 t20,0 M226,250 q10,-6 20,0 t20,0" fill="none" stroke="#fff" stroke-width="3"/>
<rect x="30" y="208" width="240" height="26" fill="#E9DCC8"/>
<path d="M100,208 C108,178 124,162 148,154 C140,178 136,194 136,208 Z" fill="#fff"/>
<path d="M66,208 C86,150 126,118 168,110 C148,150 140,180 140,208 Z" fill="#fff"/>
<path d="M140,208 C150,160 180,130 215,124 C200,160 196,186 196,208 Z" fill="#fff"/>
<path d="M196,208 C204,180 222,164 246,160 C238,184 236,198 236,208 Z" fill="#fff"/>
<path d="M96,208 C110,160 132,134 160,120 M168,208 C176,170 192,146 210,132 M216,208 C222,186 232,174 242,166" fill="none" stroke-width="2.5"/>`,
    },
    capetown: {
        name: 'Table Mountain', city: 'Cape Town, South Africa',
        art: `<path d="M18,248 L60,176 L96,120 L210,116 L240,150 L282,248 Z" fill="#8FA37E"/>
<path d="M232,248 L256,184 L274,248 Z" fill="#7E946E"/>
<path d="M120,140 L112,200 M160,138 L156,210 M196,140 L204,196" fill="none" stroke-width="3"/>
<path d="M90,124 C98,104 120,106 128,112 C138,98 160,100 168,110 C180,98 204,102 212,120 Q150,130 90,124 Z" fill="#fff"/>
<rect x="18" y="248" width="264" height="22" rx="6" fill="#6CB4E4"/>`,
    },
    lagos: {
        name: 'National Theatre', city: 'Lagos, Nigeria',
        art: `<path d="M150,104 V64" fill="none" stroke-width="4"/>
<rect x="150" y="64" width="16" height="22" fill="#008751" stroke="none"/>
<rect x="166" y="64" width="16" height="22" fill="#fff" stroke="none"/>
<rect x="182" y="64" width="16" height="22" fill="#008751" stroke="none"/>
<rect x="150" y="64" width="48" height="22" fill="none" stroke-width="4"/>
<rect x="50" y="196" width="200" height="56" rx="10" fill="#DAD3C6"/>
<rect x="60" y="212" width="180" height="10" fill="#4A5560" stroke="none"/>
<path d="M40,198 C60,150 100,128 150,124 C200,128 240,150 260,198 Z" fill="#B8BEC6"/>
<path d="M118,128 Q150,96 182,128 Z" fill="#A3AAB4"/>
<path d="M150,128 L80,196 M150,128 L120,196 M150,128 L180,196 M150,128 L220,196" fill="none" stroke-width="3"/>
${ground(256, 30, 270)}`,
    },
    nairobi: {
        name: 'KICC', city: 'Nairobi, Kenya',
        art: `<path d="M40,258 L92,194 L144,258 Z" fill="#A85F36"/>
<path d="M68,258 L92,206 M92,258 V200 M116,258 L92,206" fill="none" stroke-width="3"/>
<rect x="134" y="92" width="38" height="166" fill="#C8784A"/>
<path d="M144,104 V250 M153,104 V250 M162,104 V250" fill="none" stroke-width="2.5"/>
<rect x="142" y="64" width="22" height="18" fill="#B5653A"/>
<ellipse cx="153" cy="86" rx="46" ry="11" fill="#B5653A"/>
<ellipse cx="153" cy="64" rx="13" ry="4" fill="#B5653A"/>
${ground(260, 26, 274)}`,
    },
    toronto: {
        name: 'CN Tower', city: 'Toronto, Canada',
        art: `<path d="M128,262 L142,150 L144,112 L146,24 L150,8 L154,24 L156,112 L158,150 L172,262 Z" fill="#D3D3D3"/>
<path d="M122,104 H178 L172,128 H128 Z" fill="#9EA7B0"/>
<rect x="141" y="60" width="18" height="10" fill="#9EA7B0"/>
<path d="M150,132 V258" fill="none" stroke-width="3"/>
<rect x="40" y="262" width="220" height="12" rx="4" fill="#6CB4E4"/>`,
    },
    berlin: {
        name: 'Brandenburg Gate', city: 'Berlin, Germany',
        art: `<path d="M120,98 L128,76 L150,70 L172,76 L180,98 Z" fill="#6E9C84"/>
<path d="M150,70 V50" fill="none" stroke-width="4"/>
<circle cx="150" cy="46" r="6" fill="#6E9C84"/>
<rect x="84" y="98" width="132" height="20" fill="#DCC89A"/>
<rect x="32" y="118" width="236" height="24" fill="#E3D2A8"/>
${[44, 82, 120, 162, 200, 238].map(x => `<rect x="${x}" y="142" width="18" height="110" fill="#EADBB6"/>`).join('')}
<rect x="30" y="252" width="240" height="12" fill="#E3D2A8"/>`,
    },
};

// Themed stickers for the project pages. id -> name, caption, drawing; `raw` is drawn
// without the marker wobble (used for the embedded avatar photo).
const hexPath = (cx, cy, r) => 'M' + [0, 1, 2, 3, 4, 5].map(i => {
    const a = Math.PI / 180 * (60 * i - 90);
    return `${f(cx + r * Math.cos(a))},${f(cy + r * Math.sin(a))}`;
}).join(' L') + ' Z';
const drop = (x, y, s = 1, fill = '#6CB4E4') =>
    `<path d="M${x},${f(y - 14 * s)} C${f(x + 9 * s)},${f(y - 2 * s)} ${f(x + 9 * s)},${f(y + 8 * s)} ${x},${f(y + 8 * s)} C${f(x - 9 * s)},${f(y + 8 * s)} ${f(x - 9 * s)},${f(y - 2 * s)} ${x},${f(y - 14 * s)} Z" fill="${fill}" stroke-width="4"/>`;
const workoutHead = fs.readFileSync(path.join(__dirname, 'assets', 'workout-head.jpg')).toString('base64');

const PROJECT_ITEMS = {
    // ---- Clostra: bees and honey ----
    bee: {
        name: 'Busy bee', caption: 'Clostra',
        art: `<ellipse cx="124" cy="96" rx="36" ry="52" transform="rotate(-25 124 96)" fill="#EAF6FF"/>
<ellipse cx="182" cy="92" rx="36" ry="52" transform="rotate(22 182 92)" fill="#EAF6FF"/>
<path d="M118,70 L130,118 M184,66 L176,116" fill="none" stroke-width="3"/>
<ellipse cx="160" cy="170" rx="80" ry="58" fill="#FFC93C"/>
<path d="M136,116 C126,150 126,190 136,224 L156,227 C146,190 146,150 156,113 Z M180,114 C170,150 170,192 180,226 L200,220 C190,186 190,154 200,120 Z" fill="#1F1F1F"/>
<ellipse cx="160" cy="170" rx="80" ry="58" fill="none"/>
<path d="M238,166 L262,160 L240,180 Z" fill="#1F1F1F"/>
<path d="M76,128 Q64,94 48,88 M94,126 Q98,90 112,80" fill="none" stroke-width="4"/>
<circle cx="47" cy="86" r="6" fill="#1F1F1F"/><circle cx="113" cy="78" r="6" fill="#1F1F1F"/>
<circle cx="86" cy="164" r="36" fill="#2B2B2B"/>
<circle cx="74" cy="154" r="9" fill="#fff" stroke-width="3"/><circle cx="72" cy="156" r="4" fill="#1F1F1F" stroke="none"/>
<path d="M66,178 Q78,190 94,180" fill="none" stroke="#fff" stroke-width="4"/>`,
    },
    honey: {
        name: 'Honey pot', caption: 'Clostra',
        art: `<rect x="80" y="112" width="140" height="146" rx="34" fill="#F2A900"/>
<path d="M98,138 C96,170 96,206 104,232" fill="none" stroke="#FFD66B" stroke-width="7"/>
<rect x="100" y="164" width="100" height="46" rx="8" fill="#FFF4D6"/>
<text x="150" y="196" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="21" fill="#8A5A00" stroke="none">HONEY</text>
<rect x="72" y="88" width="156" height="32" rx="10" fill="#B87333"/>
<path d="M84,118 C84,132 96,132 96,118 C96,140 112,140 112,118 M196,118 C196,130 208,130 208,118" fill="#F2A900" stroke-width="4"/>
<path d="M196,72 L254,24" fill="none" stroke="#A0612B" stroke-width="11"/>
<ellipse cx="186" cy="80" rx="22" ry="15" transform="rotate(-38 186 80)" fill="#E8A33D"/>
<path d="M172,78 L186,66 M180,88 L196,74" fill="none" stroke-width="3"/>`,
    },
    honeycomb: {
        name: 'Honeycomb', caption: 'Clostra',
        art: `${[[120.5, 92, '#F6B93B'], [179.5, 92, '#F2A900'], [91, 143, '#F2A900'], [150, 143, '#F6B93B'], [209, 143, '#F6B93B'], [120.5, 194, '#F6B93B'], [179.5, 194, '#F2A900']]
            .map(([x, y, c]) => `<path d="${hexPath(x, y, 33)}" fill="${c}"/>`).join('')}
<path d="M106,222 C106,240 116,244 116,256 C116,268 100,268 100,256 C100,246 106,240 106,222 Z M190,224 C190,236 198,240 198,248 C198,258 184,258 184,248 C184,240 190,236 190,224 Z" fill="#F2A900"/>
<path d="M140,128 l10,-8 l10,8" fill="none" stroke="#FFE7A3" stroke-width="5"/>`,
    },
    beehive: {
        name: 'Beehive', caption: 'Clostra',
        art: `<path d="M62,250 C62,138 102,62 150,62 C198,62 238,138 238,250 Z" fill="#E8B04B"/>
<path d="M70,216 Q150,232 230,216 M78,180 Q150,196 222,180 M92,146 Q150,160 208,146 M110,114 Q150,126 190,114 M130,86 Q150,94 170,86" fill="none" stroke-width="4"/>
<path d="M128,250 V228 Q150,206 172,228 V250 Z" fill="#3B2A14"/>
<rect x="44" y="246" width="212" height="18" rx="5" fill="#A0612B"/>
<ellipse cx="236" cy="70" rx="12" ry="20" transform="rotate(-30 236 70)" fill="#EAF6FF"/>
<ellipse cx="236" cy="96" rx="20" ry="14" fill="#FFC93C"/>
<path d="M230,84 V108 M242,84 V108" fill="none" stroke-width="5"/>`,
    },
    dipper: {
        name: 'Honey dipper', caption: 'Clostra',
        art: `<path d="M184,226 C184,244 192,250 192,262" fill="none" stroke-width="22"/>
<path d="M184,226 C184,244 192,250 192,262" fill="none" stroke="#F2A900" stroke-width="10"/>
<ellipse cx="192" cy="266" rx="58" ry="12" fill="#F2A900"/>
<path d="M160,264 Q186,258 210,264" fill="none" stroke="#FFD66B" stroke-width="5"/>
<g transform="rotate(-35 150 150)">
<rect x="142" y="14" width="16" height="136" rx="8" fill="#C68642"/>
<circle cx="150" cy="20" r="13" fill="#A0612B"/>
<rect x="136" y="144" width="28" height="14" rx="5" fill="#A0612B"/>
<ellipse cx="150" cy="200" rx="42" ry="46" fill="#F2A900"/>
<path d="M112,180 Q150,190 188,180 M108,200 Q150,210 192,200 M112,220 Q150,230 188,220" fill="none" stroke="#B87333" stroke-width="6"/>
<path d="M124,172 C118,186 118,204 124,218" fill="none" stroke="#FFD66B" stroke-width="5"/>
</g>`,
    },
    sunflower: {
        name: 'Sunflower', caption: 'Clostra',
        art: `<path d="M150,150 C154,196 146,230 150,264" fill="none" stroke="#3E8E2B" stroke-width="10"/>
<path d="M150,232 C122,234 102,220 94,198 C122,194 142,208 150,232 Z" fill="#6DBE45"/>
<path d="M152,210 C178,210 198,196 206,176 C180,172 160,186 152,210 Z" fill="#6DBE45"/>
${Array.from({ length: 12 }, (_, i) => { const a = i * 30, r = a * Math.PI / 180; return `<ellipse cx="${f(150 + Math.sin(r) * 56)}" cy="${f(104 - Math.cos(r) * 56)}" rx="15" ry="30" transform="rotate(${a} ${f(150 + Math.sin(r) * 56)} ${f(104 - Math.cos(r) * 56)})" fill="#FFC93C"/>`; }).join('')}
<circle cx="150" cy="104" r="40" fill="#7A4A1E"/>
${[[136, 92], [156, 86], [168, 104], [148, 108], [132, 116], [158, 124], [142, 128]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#4A2A0E" stroke="none"/>`).join('')}
<ellipse cx="246" cy="206" rx="12" ry="20" transform="rotate(-30 246 206)" fill="#EAF6FF"/>
<ellipse cx="244" cy="232" rx="20" ry="14" fill="#FFC93C"/>
<path d="M238,220 V244 M250,220 V244" fill="none" stroke-width="5"/>`,
    },
    // ---- Lign: bus, road and traffic lights ----
    bus: {
        name: 'Lign bus', caption: 'Lign',
        art: `<rect x="18" y="222" width="264" height="38" rx="8" fill="#4A4A4A"/>
<path d="M34,241 H266" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="16 12"/>
<rect x="52" y="96" width="196" height="16" rx="7" fill="#1F7AD0"/>
<rect x="40" y="106" width="220" height="108" rx="18" fill="#289AF9"/>
${[56, 98, 140, 182].map(x => `<rect x="${x}" y="122" width="34" height="38" rx="5" fill="#CDE9FF"/>`).join('')}
<rect x="224" y="122" width="28" height="52" rx="6" fill="#CDE9FF"/>
<text x="150" y="190" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="22" fill="#fff" stroke="none">LIGN</text>
<circle cx="250" cy="192" r="7" fill="#FFE066"/>
<circle cx="88" cy="214" r="20" fill="#222"/><circle cx="88" cy="214" r="7" fill="#CFCFCF"/>
<circle cx="212" cy="214" r="20" fill="#222"/><circle cx="212" cy="214" r="7" fill="#CFCFCF"/>`,
    },
    trafficlight: {
        name: 'Traffic light', caption: 'Lign',
        // Lights cycle red -> green -> amber -> red.
        style: '.tl-r,.tl-a,.tl-g{animation-duration:6s;animation-timing-function:steps(1,end);animation-iteration-count:infinite}'
            + '.tl-r{animation-name:tl-r}.tl-a{animation-name:tl-a}.tl-g{animation-name:tl-g}'
            + '@keyframes tl-r{0%{fill:#FF4D4D}40%{fill:#5A1B1B}80%{fill:#FF4D4D}}'
            + '@keyframes tl-g{0%{fill:#1E4D2B}40%{fill:#3BD16F}66%{fill:#1E4D2B}}'
            + '@keyframes tl-a{0%{fill:#5A4A10}66%{fill:#FFC93C}80%{fill:#5A4A10}}'
            + '@media (prefers-reduced-motion:reduce){*{animation:none!important}}',
        art: `<rect x="142" y="212" width="16" height="50" fill="#5A5A5A"/>
<rect x="116" y="258" width="68" height="12" rx="4" fill="#5A5A5A"/>
<rect x="102" y="28" width="96" height="188" rx="24" fill="#2E2E2E"/>
<circle class="tl-r" cx="150" cy="72" r="25" fill="#FF4D4D"/>
<circle class="tl-a" cx="150" cy="124" r="25" fill="#5A4A10"/>
<circle class="tl-g" cx="150" cy="176" r="25" fill="#1E4D2B"/>
<path d="M102,58 L78,46 L78,92 L102,82 M198,58 L222,46 L222,92 L198,82" fill="#2E2E2E"/>`,
    },
    busstop: {
        name: 'Bus stop', caption: 'Lign',
        art: `<rect x="144" y="128" width="12" height="134" fill="#9E9E9E"/>
<rect x="120" y="258" width="60" height="10" rx="4" fill="#7A7A7A"/>
<rect x="74" y="28" width="152" height="108" rx="16" fill="#289AF9"/>
<rect x="114" y="42" width="72" height="42" rx="9" fill="#fff" stroke="none"/>
<rect x="122" y="50" width="56" height="16" rx="3" fill="#289AF9" stroke="none"/>
<circle cx="130" cy="86" r="6" fill="#fff" stroke="none"/><circle cx="170" cy="86" r="6" fill="#fff" stroke="none"/>
<text x="150" y="122" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="20" fill="#fff" stroke="none">BUS STOP</text>`,
    },
    ticket: {
        name: 'Bus ticket', caption: 'Lign',
        art: `<g transform="rotate(-10 150 150)">
<path d="M40,92 H260 V132 A18,18 0 0 0 260,168 V208 H40 V168 A18,18 0 0 0 40,132 Z" fill="#289AF9"/>
<path d="M200,100 V200" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="8 8"/>
<text x="120" y="150" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="34" fill="#fff" stroke="none">LIGN</text>
<text x="120" y="178" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="15" letter-spacing="3" fill="#fff" stroke="none">TICKET</text>
<rect x="212" y="130" width="34" height="24" rx="5" fill="#fff" stroke="none"/>
<circle cx="220" cy="156" r="4" fill="#fff" stroke="none"/><circle cx="238" cy="156" r="4" fill="#fff" stroke="none"/>
</g>`,
    },
    road: {
        name: 'The open road', caption: 'Lign',
        art: `<circle cx="226" cy="58" r="24" fill="#FFD23F"/>
<path d="M18,264 C18,176 70,112 150,104 C230,112 282,176 282,264 Z" fill="#8BC34A"/>
<path d="M70,264 C92,226 196,222 194,184 C192,156 148,146 146,106 L156,106 C160,140 214,152 216,186 C218,228 160,236 216,264 Z" fill="#555"/>
<path d="M144,262 C150,236 206,226 205,186 C204,154 155,144 151,112" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="14 12"/>
<path d="M56,206 C50,186 64,176 72,186 C80,174 96,184 88,204 Z" fill="#4C9A2A"/>`,
    },
    cone: {
        name: 'Traffic cone', caption: 'Lign',
        art: `<rect x="62" y="236" width="176" height="28" rx="7" fill="#D9531E"/>
<path d="M128,40 Q150,30 172,40 L214,240 H86 Z" fill="#FF7A21"/>
<path d="M118,90 H182 L190,130 H110 Z" fill="#fff"/>
<path d="M102,170 H198 L206,208 H94 Z" fill="#fff"/>
<path d="M140,50 L120,226" fill="none" stroke="#FFA766" stroke-width="7"/>`,
    },
    // ---- Crop Care: gardening tools ----
    wateringcan: {
        name: 'Watering can', caption: 'Crop Care',
        art: `<path d="M128,118 C128,66 210,66 210,118" fill="none" stroke-width="16"/>
<path d="M128,118 C128,66 210,66 210,118" fill="none" stroke="#4C8A2E" stroke-width="8"/>
<path d="M98,198 L40,128 L54,118 L108,176 Z" fill="#6DAE45"/>
<rect x="24" y="108" width="34" height="18" rx="5" transform="rotate(-40 41 117)" fill="#4C8A2E"/>
<path d="M96,124 H214 L226,248 H84 Z" fill="#6DAE45"/>
<rect x="90" y="116" width="130" height="16" rx="7" fill="#4C8A2E"/>
<path d="M112,148 C110,186 112,214 118,236" fill="none" stroke="#9BD06E" stroke-width="7"/>
${drop(30, 160)}${drop(18, 192, 0.8)}${drop(44, 206, 0.9)}`,
    },
    trowel: {
        name: 'Garden trowel', caption: 'Crop Care',
        art: `<path d="M24,262 C40,214 110,206 150,230 C190,206 260,214 276,262 Z" fill="#6B4423"/>
<path d="M222,236 C222,214 220,196 226,182 M226,200 C212,196 204,184 204,172 C216,174 226,186 226,200 Z M224,194 C236,188 242,176 242,164 C230,166 222,180 224,194 Z" fill="#6DBE45" stroke-width="4"/>
<g transform="rotate(-28 140 150)">
<path d="M140,34 C180,64 186,132 152,168 L128,168 C94,132 100,64 140,34 Z" fill="#B8C2CC"/>
<path d="M140,52 L140,150" fill="none" stroke="#E3E9EE" stroke-width="5"/>
<rect x="132" y="166" width="16" height="22" fill="#8F9AA5"/>
<rect x="122" y="186" width="36" height="72" rx="16" fill="#A0612B"/>
<path d="M130,206 H150 M130,222 H150 M130,238 H150" fill="none" stroke-width="3"/>
</g>`,
    },
    seedling: {
        name: 'Seedling', caption: 'Crop Care',
        art: `<path d="M150,164 C150,124 146,104 150,74" fill="none" stroke="#3E8E2B" stroke-width="8"/>
<path d="M150,114 C118,114 96,94 90,64 C122,62 146,82 150,114 Z" fill="#6DBE45"/>
<path d="M150,94 C180,92 204,70 210,40 C178,38 154,58 150,94 Z" fill="#6DBE45"/>
<path d="M150,114 C130,104 112,88 102,74 M150,94 C170,84 188,66 198,52" fill="none" stroke="#3E8E2B" stroke-width="3"/>
<path d="M94,172 H206 L192,262 H108 Z" fill="#D2693C"/>
<rect x="84" y="156" width="132" height="24" rx="6" fill="#C25A2F"/>
<ellipse cx="150" cy="158" rx="54" ry="7" fill="#5A3A22"/>`,
    },
    wheelbarrow: {
        name: 'Wheelbarrow', caption: 'Crop Care',
        art: `<path d="M206,150 L278,190" fill="none" stroke="#A0612B" stroke-width="10"/>
<path d="M196,180 L206,240" fill="none" stroke-width="7"/>
<path d="M120,180 L94,218" fill="none" stroke-width="7"/>
<path d="M70,122 Q150,74 228,122 Z" fill="#6B4423"/>
<path d="M150,96 C150,80 148,70 150,58 M150,78 C138,76 130,66 128,56 C140,56 148,66 150,78 Z M150,72 C162,70 170,60 172,50 C160,50 152,60 150,72 Z" fill="#6DBE45" stroke-width="4"/>
<path d="M60,116 H236 L214,184 H90 Z" fill="#4C9A2A"/>
<path d="M76,134 H220" fill="none" stroke="#7DC45A" stroke-width="5"/>
<circle cx="94" cy="222" r="30" fill="#2B2B2B"/><circle cx="94" cy="222" r="10" fill="#BDBDBD"/>`,
    },
    rake: {
        name: 'Garden rake', caption: 'Crop Care',
        art: `<path d="M24,268 Q74,214 128,268 Z" fill="#6B4423"/>
<path d="M60,236 C54,220 64,210 74,216 C80,204 96,212 90,230 Z" fill="#E8A33D"/>
<g transform="rotate(-22 150 150)">
<rect x="143" y="14" width="14" height="184" rx="7" fill="#C68642"/>
<rect x="84" y="196" width="132" height="18" rx="6" fill="#8F9AA5"/>
${[90, 109, 128, 147, 166, 185, 204].map(x => `<rect x="${x}" y="212" width="7" height="38" rx="3" fill="#8F9AA5"/>`).join('')}
</g>`,
    },
    shears: {
        name: 'Pruning shears', caption: 'Crop Care',
        art: `<path d="M62,104 C58,80 76,64 98,66 C100,90 84,106 62,104 Z" fill="#6DBE45" stroke-width="4"/>
<path d="M66,100 L92,72" fill="none" stroke="#3E8E2B" stroke-width="3"/>
<path d="M76,126 C70,116 72,108 80,104 C86,112 84,122 76,126 Z" fill="#6DBE45" stroke-width="4"/>
<g transform="rotate(18 150 150)">
<path d="M144,148 C134,188 116,226 102,256 C96,270 114,276 120,262 C134,230 150,192 158,156 Z" fill="#E63946"/>
<path d="M156,148 C166,188 184,226 198,256 C204,270 186,276 180,262 C166,230 150,192 142,156 Z" fill="#E63946"/>
<path d="M146,154 C126,116 126,70 152,24 C164,62 166,110 158,154 Z" fill="#C9D1D8"/>
<path d="M154,154 C180,120 188,84 176,48 C158,82 146,118 142,154 Z" fill="#8F9AA5"/>
<path d="M150,44 C142,80 142,116 150,146" fill="none" stroke="#fff" stroke-width="4"/>
<circle cx="150" cy="154" r="11" fill="#FFD23F"/>
<path d="M130,206 C140,196 160,196 170,206" fill="none" stroke-width="5"/>
</g>`,
    },
    // ---- OnTrack: working out ----
    workout: {
        name: 'Me, working out', caption: 'OnTrack',
        raw: `<defs><clipPath id="headClip"><circle cx="150" cy="124" r="92"/></clipPath></defs>
<image href="data:image/jpeg;base64,${workoutHead}" x="58" y="32" width="184" height="184" clip-path="url(#headClip)"/>`,
        art: `<circle cx="150" cy="124" r="92" fill="none"/>
<path d="M66,92 Q150,60 236,84" fill="none" stroke-width="24"/>
<path d="M66,92 Q150,60 236,84" fill="none" stroke="#E63946" stroke-width="15"/>
<rect x="88" y="236" width="124" height="14" rx="6" fill="#9E9E9E"/>
<rect x="62" y="214" width="30" height="58" rx="8" fill="#3A3A3A"/>
<rect x="208" y="214" width="30" height="58" rx="8" fill="#3A3A3A"/>
<rect x="46" y="224" width="18" height="38" rx="6" fill="#3A3A3A"/>
<rect x="236" y="224" width="18" height="38" rx="6" fill="#3A3A3A"/>
${drop(40, 70, 1.1)}${drop(262, 100)}${drop(252, 148, 0.8)}`,
    },
    sneaker: {
        name: 'Running shoe', caption: 'OnTrack',
        art: `<path d="M12,150 h22 M6,176 h30 M14,202 h22" fill="none" stroke-width="5"/>
<path d="M48,206 C46,170 66,144 104,136 L150,126 C170,152 212,164 250,180 C266,186 268,200 264,212 Z" fill="#2E6BE6"/>
<path d="M92,186 C130,176 170,182 214,198" fill="none" stroke="#fff" stroke-width="9"/>
<path d="M118,144 L134,166 M132,138 L148,160 M146,134 L162,154" fill="none" stroke="#fff" stroke-width="5"/>
<path d="M42,212 H266 C274,212 276,234 262,236 H48 C34,236 32,212 42,212 Z" fill="#fff"/>
<path d="M44,226 H264" fill="none" stroke="#FF6B35" stroke-width="5"/>`,
    },
    stopwatch: {
        name: 'Stopwatch', caption: 'OnTrack',
        art: `<rect x="128" y="34" width="44" height="16" rx="7" fill="#9E9E9E"/>
<rect x="138" y="48" width="24" height="22" fill="#9E9E9E"/>
<rect x="214" y="78" width="22" height="16" rx="5" transform="rotate(45 225 86)" fill="#9E9E9E"/>
<circle cx="150" cy="166" r="94" fill="#fff"/>
<circle cx="150" cy="166" r="78" fill="#F3F6F9"/>
<path d="M150,88 A78,78 0 0 1 222,196" fill="none" stroke="#3BD16F" stroke-width="12"/>
${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<path d="M${f(150 + Math.sin(a) * 62)},${f(166 - Math.cos(a) * 62)} L${f(150 + Math.sin(a) * 72)},${f(166 - Math.cos(a) * 72)}" fill="none" stroke-width="4"/>`; }).join('')}
<path d="M150,166 L196,128" fill="none" stroke="#E63946" stroke-width="6"/>
<circle cx="150" cy="166" r="8" fill="#1F1F1F"/>`,
    },
    bottle: {
        name: 'Water bottle', caption: 'OnTrack',
        art: `<rect x="140" y="28" width="20" height="26" rx="6" fill="#E63946"/>
<rect x="120" y="50" width="60" height="36" rx="9" fill="#2B2B2B"/>
<rect x="106" y="84" width="88" height="178" rx="28" fill="#BFE6FA"/>
<path d="M108,140 H192 V234 C192,250 180,260 166,260 H134 C120,260 108,250 108,234 Z" fill="#4FC3F7" stroke="none"/>
<rect x="106" y="84" width="88" height="178" rx="28" fill="none"/>
<rect x="106" y="158" width="88" height="44" fill="#fff"/>
<text x="150" y="190" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="22" fill="#2E6BE6" stroke="none">H2O</text>
<path d="M124,98 V140" fill="none" stroke="#fff" stroke-width="7"/>
${drop(222, 118)}${drop(80, 160, 0.8)}`,
    },
    kettlebell: {
        name: 'Kettlebell', caption: 'OnTrack',
        art: `<path d="M104,128 C90,46 210,46 196,128" fill="none" stroke-width="40"/>
<path d="M104,128 C90,46 210,46 196,128" fill="none" stroke="#3A3A3A" stroke-width="26"/>
<path d="M150,112 C214,112 250,152 250,198 C250,236 228,262 206,262 H94 C72,262 50,236 50,198 C50,152 86,112 150,112 Z" fill="#3A3A3A"/>
<path d="M78,168 C72,190 76,214 90,234" fill="none" stroke="#6A6A6A" stroke-width="8"/>
<rect x="114" y="172" width="72" height="40" rx="8" fill="#FFC93C"/>
<text x="150" y="200" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="20" fill="#1F1F1F" stroke="none">16KG</text>
${drop(262, 120)}${drop(36, 104, 0.8)}`,
    },
    medal: {
        name: 'Finisher medal', caption: 'OnTrack',
        art: `<path d="M84,18 H130 L174,150 L138,162 Z" fill="#2E6BE6"/>
<path d="M216,18 H170 L126,150 L162,162 Z" fill="#E63946"/>
<rect x="124" y="130" width="52" height="22" rx="6" fill="#C9A227"/>
<circle cx="150" cy="200" r="64" fill="#FFC93C"/>
<circle cx="150" cy="200" r="46" fill="#F2A900"/>
${star(150, 202, 32, '#FFE07A')}
<path d="M104,170 C96,186 96,206 102,222" fill="none" stroke="#FFE7A3" stroke-width="6"/>`,
    },
    // ---- Roster: networking ----
    network: {
        name: 'Networking', caption: 'Roster',
        art: `<path d="M92,126 L208,126 M92,126 L150,224 M208,126 L150,224" fill="none" stroke-width="5"/>
<path d="M50,160 C50,128 134,128 134,160 Z" fill="#F7941D"/>
<circle cx="92" cy="98" r="24" fill="#C68642"/>
<path d="M166,160 C166,128 250,128 250,160 Z" fill="#2E9BF6"/>
<circle cx="208" cy="98" r="24" fill="#8D5524"/>
<path d="M108,262 C108,230 192,230 192,262 Z" fill="#3BB273"/>
<circle cx="150" cy="202" r="24" fill="#E0AC69"/>
<path d="M118,28 H182 C190,28 194,32 194,40 V58 C194,66 190,70 182,70 H158 L146,82 L146,70 H118 C110,70 106,66 106,58 V40 C106,32 110,28 118,28 Z" fill="#fff"/>
<text x="150" y="58" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="22" fill="#1F1F1F" stroke="none">Hi!</text>`,
    },
    namebadge: {
        name: 'Hello badge', caption: 'Roster',
        art: `<path d="M130,48 L110,8 M170,48 L190,8" fill="none" stroke="#2E9BF6" stroke-width="9"/>
<rect x="128" y="44" width="44" height="30" rx="7" fill="#9E9E9E"/>
<rect x="36" y="70" width="228" height="168" rx="18" fill="#E63946"/>
<text x="150" y="122" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="40" fill="#fff" stroke="none">HELLO</text>
<text x="150" y="146" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" fill="#fff" stroke="none">my name is</text>
<rect x="54" y="156" width="192" height="64" rx="8" fill="#fff"/>
<text x="150" y="202" text-anchor="middle" font-family="Segoe Print, Bradley Hand, Comic Sans MS, cursive" font-size="34" fill="#1F1F1F" stroke="none">Bright</text>`,
    },
    goldengate: {
        name: 'Golden Gate Bridge', caption: 'San Francisco',
        art: `<rect x="14" y="236" width="272" height="30" rx="6" fill="#6CB4E4"/>
<path d="M18,190 Q56,118 93,60 Q150,190 207,60 Q244,118 282,190" fill="none" stroke="#C0362C" stroke-width="6"/>
<path d="M40,152 V196 M60,118 V196 M120,124 V196 M150,150 V196 M180,124 V196 M240,118 V196 M260,152 V196" fill="none" stroke="#C0362C" stroke-width="2.5"/>
<rect x="82" y="56" width="22" height="182" fill="#C0362C"/>
<rect x="196" y="56" width="22" height="182" fill="#C0362C"/>
<rect x="78" y="88" width="30" height="10" fill="#A62A22"/><rect x="78" y="136" width="30" height="10" fill="#A62A22"/>
<rect x="192" y="88" width="30" height="10" fill="#A62A22"/><rect x="192" y="136" width="30" height="10" fill="#A62A22"/>
<rect x="14" y="194" width="272" height="14" fill="#C0362C"/>`,
    },
};

// Which stickers each page draws from. Home/About use `cities`; each case study its own
// set; the Projects page mixes every project's.
const SETS = {
    cities: Object.keys(LANDMARKS),
    clostra: ['bee', 'honey', 'honeycomb', 'beehive', 'dipper', 'sunflower'],
    lign: ['bus', 'trafficlight', 'busstop', 'ticket', 'road', 'cone'],
    cropcare: ['wateringcan', 'trowel', 'seedling', 'wheelbarrow', 'rake', 'shears'],
    ontrack: ['workout', 'sneaker', 'stopwatch', 'bottle', 'kettlebell', 'medal'],
    roster: ['network', 'namebadge', 'goldengate', 'newyork', 'london', 'dubai'],
};
SETS.projects = Object.keys(PROJECT_ITEMS);

// Marker wobble + white die-cut sticker border around whatever is drawn.
const DEFS = '<filter id="rough" x="-10%" y="-10%" width="120%" height="120%">'
    + '<feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="5" result="n"/>'
    + '<feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" xChannelSelector="R" yChannelSelector="G"/></filter>'
    + '<filter id="diecut" x="-10%" y="-10%" width="120%" height="120%">'
    + '<feMorphology in="SourceAlpha" operator="dilate" radius="9" result="grown"/>'
    + '<feFlood flood-color="#fff"/><feComposite in2="grown" operator="in" result="border"/>'
    + '<feMerge><feMergeNode in="border"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';

const ALL = Object.assign(
    Object.fromEntries(Object.entries(LANDMARKS).map(([id, l]) => [id, { name: l.name, caption: l.city, art: l.art }])),
    PROJECT_ITEMS);

fs.mkdirSync(OUT, { recursive: true });
for (const [id, s] of Object.entries(ALL)) {
    fs.writeFileSync(path.join(OUT, `${id}.svg`),
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
<defs>${DEFS}</defs>${s.style ? `\n<style>${s.style}</style>` : ''}
<g filter="url(#diecut)">${s.raw || ''}<g filter="url(#rough)" stroke="#000" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
${s.art}
</g></g>
</svg>
`);
}

// Labels and per-page sets for scripts/sticker.js (a script, not JSON, so it also loads
// when a page is opened straight from disk).
fs.writeFileSync(path.join(OUT, 'stickers.js'), '// Generated by tools/build-stickers.js\nwindow.STICKERS = ' + JSON.stringify({
    items: Object.fromEntries(Object.entries(ALL).map(([id, s]) => [id, { name: s.name, caption: s.caption }])),
    sets: SETS,
}, null, 4) + ';\n');

const TITLES = { cities: 'Cities (Home & About)', clostra: 'Clostra', lign: 'Lign', cropcare: 'Crop Care', ontrack: 'OnTrack', roster: 'Roster' };
const sections = Object.entries(TITLES).map(([set, title]) => `<h2>${title}</h2>\n<div class="grid">\n${SETS[set].map(id =>
    `<figure><img src="stickers/${id}.svg" alt="${ALL[id].name}"><figcaption>${ALL[id].name}<span>${ALL[id].caption}</span></figcaption></figure>`).join('\n')}\n</div>`).join('\n');
fs.writeFileSync(path.join(ROOT, 'sticker-preview.html'), `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Stickers</title>
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap" rel="stylesheet">
<style>
body{margin:0;padding:40px;background:#F0F0F0;font-family:Satoshi,sans-serif;color:#0b0b0b}
h1{font-size:22px;margin:0 0 8px}
h2{font-size:16px;margin:32px 0 14px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:20px}
figure{margin:0;background:#E6E6E6;border-radius:20px;padding:18px;display:flex;flex-direction:column;align-items:center;gap:10px}
img{width:150px;height:150px;filter:drop-shadow(0 4px 6px rgba(0,0,0,.18))}
figcaption{font-size:14px;font-weight:500;text-align:center;display:flex;flex-direction:column}
figcaption span{color:#888;font-weight:400;font-size:13px}
</style></head><body>
<h1>Stickers</h1>
${sections}
</body></html>
`);
console.log(`wrote ${Object.keys(ALL).length} stickers to stickers/ and sticker-preview.html`);
