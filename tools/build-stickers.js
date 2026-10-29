// Builds the scratch-off landmark stickers into /stickers and a review page
// sticker-preview.html. Same wobbly marker style as the avatar add-ons; each sticker
// gets a white die-cut border so it reads as something pasted onto the page.
// Run: node tools/build-stickers.js, then node tools/render-stickers.js for the PNGs the pages use.
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
    nkrumah: {
        name: 'Nkrumah Mausoleum', city: 'Accra, Ghana',
        art: `<rect x="14" y="240" width="272" height="26" rx="6" fill="#6CB4E4"/>
<rect x="116" y="226" width="148" height="16" fill="#E6E0D6"/>
<path d="M164,226 L216,226 C208,170 214,116 236,80 H144 C166,116 172,170 164,226 Z" fill="#ECE8E0"/>
<path d="M176,222 C172,170 166,124 158,86 M190,222 V86 M204,222 C208,170 214,124 222,86" fill="none" stroke-width="2.5"/>
<rect x="138" y="70" width="104" height="12" rx="3" fill="#D9D3C7"/>
${star(190, 42, 26, '#111')}
<rect x="50" y="176" width="48" height="66" fill="#D9D3C7"/>
<path d="M84,130 L108,100" fill="none" stroke-width="16"/>
<path d="M84,130 L108,100" fill="none" stroke="#7A5A3A" stroke-width="8"/>
<path d="M58,176 L62,126 Q74,116 86,126 L90,176 Z" fill="#7A5A3A"/>
<circle cx="74" cy="106" r="13" fill="#7A5A3A"/>`,
    },
    jamestown: {
        name: 'Jamestown Lighthouse', city: 'Accra, Ghana',
        art: `<path d="M136,48 L98,30 M136,56 L96,64 M164,48 L202,30 M164,56 L204,64" fill="none" stroke-width="4"/>
<path d="M96,238 Q150,206 204,238 Z" fill="#8D7B68"/>
<path d="M118,232 L134,72 H166 L182,232 Z" fill="#fff"/>
<path d="M134,72 H166 L169.2,104 H130.8 Z M127.6,136 H172.4 L175.6,168 H124.4 Z M121.2,200 H178.8 L182,232 H118 Z" fill="#D7262E" stroke="none"/>
<path d="M118,232 L134,72 H166 L182,232 Z" fill="none"/>
<path d="M142,232 V214 Q150,206 158,214 V232 Z" fill="#3B2A14"/>
<rect x="124" y="62" width="52" height="12" rx="3" fill="#2B2B2B"/>
<rect x="136" y="36" width="28" height="26" fill="#FFE066"/>
<path d="M130,38 L150,16 L170,38 Z" fill="#D7262E"/>
<rect x="14" y="236" width="272" height="30" rx="6" fill="#6CB4E4"/>
<path d="M122,240 Q200,262 280,236 L266,260 Q200,280 136,262 Z" fill="#FCD116"/>
<path d="M130,252 Q200,272 272,248" fill="none" stroke="#D7262E" stroke-width="6"/>
<path d="M36,256 q10,-6 20,0 t20,0" fill="none" stroke="#fff" stroke-width="3"/>`,
    },
    capecoast: {
        name: 'Cape Coast Castle', city: 'Cape Coast, Ghana',
        art: `<path d="M98,58 V22" fill="none" stroke-width="4"/>
<rect x="98" y="22" width="36" height="8" fill="#CE1126" stroke="none"/>
<rect x="98" y="30" width="36" height="8" fill="#FCD116" stroke="none"/>
<rect x="98" y="38" width="36" height="8" fill="#006B3F" stroke="none"/>
<rect x="98" y="22" width="36" height="24" fill="none" stroke-width="4"/>
${[0, 1, 2, 3].map(i => `<rect x="${f(66 + i * 52 / 3)}" y="58" width="12" height="16" fill="#F6F0E6"/>`).join('')}
<rect x="66" y="72" width="64" height="70" fill="#F6F0E6"/>
<rect x="90" y="88" width="16" height="22" rx="3" fill="#3B2A14"/>
${Array.from({ length: 10 }, (_, i) => `<rect x="${36 + i * 24}" y="126" width="12" height="16" fill="#F6F0E6"/>`).join('')}
<rect x="36" y="140" width="228" height="76" fill="#F6F0E6"/>
<path d="M136,216 V186 Q150,170 164,186 V216 Z" fill="#3B2A14"/>
${[58, 100, 192, 232].map(x => `<rect x="${x}" y="166" width="14" height="18" rx="2" fill="#3B2A14"/>`).join('')}
<path d="M26,240 L36,214 H264 L274,240 Z" fill="#8D7B68"/>
<rect x="208" y="196" width="58" height="16" rx="7" fill="#2B2B2B" transform="rotate(-18 222 210)"/>
<circle cx="222" cy="222" r="11" fill="#6B4423"/>
<rect x="14" y="238" width="272" height="30" rx="6" fill="#6CB4E4"/>
<path d="M40,254 q10,-6 20,0 t20,0 M150,256 q10,-6 20,0 t20,0" fill="none" stroke="#fff" stroke-width="3"/>`,
    },
    larabanga: {
        name: 'Larabanga Mosque', city: 'Larabanga, Ghana',
        art: `<path d="M77,100 H63 M107,100 H121 M80,150 H66 M104,150 H118 M84,206 H70 M100,206 H114 M192,130 H180 M216,130 H228 M188,190 H176 M220,190 H232 M50,180 H36 M250,180 H264" fill="none" stroke="#3B2A14" stroke-width="5"/>
<path d="M14,262 Q150,250 286,262 V272 H14 Z" fill="#E2C391"/>
<path d="M44,256 L52,150 H248 L256,256 Z" fill="#F4F1EA"/>
<path d="M66,256 L80,60 Q92,40 104,60 L118,256 Z" fill="#F4F1EA"/>
<path d="M184,256 L194,92 Q204,76 214,92 L224,256 Z" fill="#F4F1EA"/>
${[128, 172].map(x => `<path d="M${x - 9},256 L${x - 6},132 Q${x},118 ${x + 6},132 L${x + 9},256 Z" fill="#F4F1EA"/>`).join('')}
<path d="M140,256 V218 Q150,206 160,218 V256 Z" fill="#3B2A14"/>
<path d="M88,90 L92,80 L96,90 Z M200,118 L204,108 L208,118 Z" fill="#3B2A14"/>`,
    },
    kakum: {
        name: 'Kakum Canopy Walk', city: 'Central Region, Ghana',
        art: `<rect x="46" y="80" width="16" height="176" fill="#8B5A2B"/>
<rect x="238" y="80" width="16" height="176" fill="#8B5A2B"/>
<circle cx="54" cy="66" r="32" fill="#3E8E2B"/><circle cx="36" cy="92" r="16" fill="#3E8E2B"/><circle cx="76" cy="94" r="18" fill="#3E8E2B"/>
<circle cx="246" cy="66" r="32" fill="#3E8E2B"/><circle cx="264" cy="92" r="16" fill="#3E8E2B"/><circle cx="224" cy="94" r="18" fill="#3E8E2B"/>
<rect x="34" y="134" width="44" height="10" rx="3" fill="#A0612B"/>
<rect x="222" y="134" width="44" height="10" rx="3" fill="#A0612B"/>
${Array.from({ length: 9 }, (_, i) => { const t = (i + 1) / 10, q = (a, b, c) => f((1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c), x = f(74 + 152 * t); return `<path d="M${x},${q(104, 184, 104)} L${x},${q(138, 222, 138)}" fill="none" stroke-width="2.5"/>`; }).join('')}
<path d="M74,104 Q150,184 226,104" fill="none" stroke-width="4"/>
<path d="M74,138 Q150,222 226,138" fill="none" stroke-width="14"/>
<path d="M74,138 Q150,222 226,138" fill="none" stroke="#C68642" stroke-width="7"/>
<path d="M74,138 Q150,222 226,138" fill="none" stroke="#6B4423" stroke-width="7" stroke-dasharray="2 9"/>
<path d="M14,268 V236 C24,214 48,214 58,232 C66,210 96,210 104,230 C114,212 140,212 148,232 C158,212 186,212 194,230 C204,210 232,210 240,232 C250,214 276,214 286,236 V268 Z" fill="#6DBE45"/>`,
    },
    manhyia: {
        name: 'Manhyia Palace', city: 'Kumasi, Ghana',
        art: `<rect x="34" y="132" width="196" height="126" fill="#F3E3B5"/>
<path d="M22,134 L62,92 H202 L242,134 Z" fill="#B5532F"/>
<path d="M34,194 H230" fill="none" stroke-width="4"/>
${[54, 93, 132, 171, 210].map(c => `<path d="M${c - 10},180 V156 Q${c},144 ${c + 10},156 V180 Z" fill="#6B4423"/>`).join('')}
${[54, 93, 171].map(c => `<rect x="${c - 10}" y="210" width="20" height="30" fill="#6B4423"/>`).join('')}
<path d="M118,258 V222 Q132,206 146,222 V258 Z" fill="#6B4423"/>
<path d="M206,212 L204,228 M268,212 L270,228" fill="none" stroke-width="3"/>
<circle cx="204" cy="232" r="6" fill="#F2A900"/><circle cx="270" cy="232" r="6" fill="#F2A900"/>
<rect x="208" y="218" width="10" height="32" fill="#F2A900"/>
<rect x="254" y="218" width="10" height="32" fill="#F2A900"/>
<rect x="226" y="218" width="20" height="32" fill="#FFC93C"/>
<path d="M196,198 Q236,222 276,198 L272,214 Q236,234 200,214 Z" fill="#FFC93C"/>
<rect x="200" y="248" width="72" height="14" rx="4" fill="#FFC93C"/>
${ground(262, 22, 196)}`,
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
    cairo: {
        name: 'Pyramids of Giza', city: 'Cairo, Egypt',
        art: `<circle cx="238" cy="62" r="24" fill="#FFD23F"/>
<path d="M166,256 L226,150 L282,256 Z" fill="#E8C27A"/>
<path d="M226,150 L282,256 H244 Z" fill="#C99A4E"/>
<path d="M22,256 L120,90 L216,256 Z" fill="#E8C27A"/>
<path d="M120,90 L216,256 H152 Z" fill="#C99A4E"/>
<path d="M84,152 H156 M60,192 H180 M40,228 H200" fill="none" stroke-width="2.5"/>
<path d="M14,266 Q80,246 150,256 Q220,266 286,248 V272 H14 Z" fill="#F2D9A0"/>`,
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
// A small bee in flight, body centred on (x, y).
const miniBee = (x, y) => `<ellipse cx="${x + 2}" cy="${y - 26}" rx="12" ry="20" transform="rotate(-30 ${x + 2} ${y - 26})" fill="#EAF6FF"/>
<ellipse cx="${x}" cy="${y}" rx="20" ry="14" fill="#FFC93C"/>
<path d="M${x - 6},${y - 12} V${y + 12} M${x + 6},${y - 12} V${y + 12}" fill="none" stroke-width="5"/>`;
const workoutHead = fs.readFileSync(path.join(__dirname, 'assets', 'workout-head.jpg')).toString('base64');
// Bright's drawn head (cropped from the avatar) filling a circle; used as a sticker's `raw`.
const myHead = (cx, cy, r) => `<defs><clipPath id="headClip"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath></defs>
<image href="data:image/jpeg;base64,${workoutHead}" x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" clip-path="url(#headClip)"/>`;
// An outlined arm or leg through the given points.
const SKIN = '#B87A58';
const limb = (pts, color = SKIN, w = 13) => {
    const d = 'M' + pts.map(p => p.join(',')).join(' L');
    return `<path d="${d}" fill="none" stroke-width="${w + 10}"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}"/>`;
};

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
${miniBee(244, 232)}`,
    },
    smoker: {
        name: 'Bee smoker', caption: 'Clostra',
        art: `<path d="M120,244 L34,206 L44,186 L58,188 L54,170 L72,160 L76,146 L90,140 L122,226 Z" fill="#7A4A1E"/>
<path d="M120,244 L30,212 L36,194 L122,232 Z" fill="#C68642"/>
<path d="M120,240 L80,140 L96,134 L126,226 Z" fill="#C68642"/>
<rect x="122" y="122" width="90" height="136" rx="10" fill="#C9D1D8"/>
<path d="M140,150 V230 M158,150 V230 M176,150 V230 M194,150 V230" fill="none" stroke="#8F9AA5" stroke-width="5"/>
<path d="M118,126 H216 L192,94 H142 Z" fill="#AEB8C2"/>
<path d="M156,94 L162,66 H180 L178,94 Z" fill="#AEB8C2"/>
<circle cx="176" cy="46" r="14" fill="#E6E6E6"/><circle cx="198" cy="30" r="18" fill="#E6E6E6"/><circle cx="230" cy="24" r="13" fill="#E6E6E6"/>
${miniBee(66, 82)}`,
    },
    beekeeper: {
        name: 'Beekeeper’s hat', caption: 'Clostra',
        art: `<path d="M64,266 C70,228 230,228 236,266 Z" fill="#F7F7F7"/>
<ellipse cx="150" cy="182" rx="40" ry="50" fill="#8D5524"/>
<path d="M120,176 a12,12 0 1 0 24,0 a12,12 0 1 0 -24,0 M156,176 a12,12 0 1 0 24,0 a12,12 0 1 0 -24,0 M144,176 H156" fill="none" stroke-width="4"/>
<path d="M72,120 L58,250 Q150,272 242,250 L228,120 Z" fill="#fff" fill-opacity="0.6"/>
<path d="M96,130 L90,256 M124,130 L122,262 M150,130 V264 M176,130 L178,262 M204,130 L210,256 M66,170 Q150,184 234,170 M62,212 Q150,226 238,212" fill="none" stroke="#9E9E9E" stroke-width="3"/>
<path d="M72,120 L58,250 Q150,272 242,250 L228,120" fill="none"/>
<ellipse cx="150" cy="118" rx="112" ry="26" fill="#F3E3B5"/>
<path d="M92,116 C92,52 208,52 208,116 Z" fill="#F3E3B5"/>
<path d="M94,100 Q150,110 206,100 L208,116 Q150,126 92,116 Z" fill="#F2A900"/>
${miniBee(244, 64)}`,
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
    routemap: {
        name: 'Route map', caption: 'Lign',
        art: `<path d="M40,90 L106,70 L106,240 L40,260 Z" fill="#CDE9FF"/>
<path d="M106,70 L194,92 L194,262 L106,240 Z" fill="#E8F4FF"/>
<path d="M194,92 L260,72 L260,242 L194,262 Z" fill="#CDE9FF"/>
<path d="M150,190 C158,172 186,176 188,196 C190,216 158,222 150,190 Z" fill="#9CD67A"/>
<path d="M62,226 C92,200 88,168 128,160 C170,152 180,134 212,128" fill="none" stroke="#289AF9" stroke-width="6" stroke-dasharray="12 10"/>
<circle cx="62" cy="226" r="9" fill="#fff"/>
<path d="M214,130 C196,106 190,94 190,82 C190,68 200,58 214,58 C228,58 238,68 238,82 C238,94 232,106 214,130 Z" fill="#E63946"/>
<circle cx="214" cy="82" r="8" fill="#fff"/>`,
    },
    busapp: {
        name: 'Bus in 3 min', caption: 'Lign',
        art: `<path d="M226,46 L242,32 M230,64 L250,62 M74,46 L58,32 M70,64 L50,62" fill="none" stroke-width="4"/>
<rect x="88" y="22" width="124" height="254" rx="24" fill="#2B2B2B"/>
<rect x="100" y="44" width="100" height="210" rx="10" fill="#fff"/>
<path d="M100,84 V54 Q100,44 110,44 H190 Q200,44 200,54 V84 Z" fill="#289AF9"/>
<text x="150" y="72" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="18" fill="#fff" stroke="none">LIGN</text>
<rect x="124" y="102" width="52" height="40" rx="8" fill="#289AF9"/>
<rect x="130" y="108" width="40" height="14" rx="3" fill="#CDE9FF"/>
<circle cx="136" cy="146" r="6" fill="#222"/><circle cx="164" cy="146" r="6" fill="#222"/>
<text x="150" y="190" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="26" fill="#1F1F1F" stroke="none">3 min</text>
<rect x="114" y="208" width="72" height="10" rx="5" fill="#E3E9EE"/>
<rect x="114" y="208" width="50" height="10" rx="5" fill="#3BD16F"/>`,
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
    leafcheck: {
        name: 'Leaf check', caption: 'Crop Care',
        art: `<path d="M58,242 L30,270" fill="none" stroke="#3E8E2B" stroke-width="9"/>
<path d="M58,242 C38,150 90,60 232,42 C252,170 170,252 58,242 Z" fill="#6DBE45"/>
<path d="M58,242 C110,190 160,130 224,54 M112,182 L96,140 M150,140 L136,92 M128,164 L178,170 M168,118 L212,124" fill="none" stroke="#3E8E2B" stroke-width="4"/>
<circle cx="92" cy="214" r="6" fill="#8B5A2B"/><circle cx="196" cy="96" r="7" fill="#8B5A2B"/>
<path d="M174,214 L232,272" fill="none" stroke-width="26"/>
<path d="M174,214 L232,272" fill="none" stroke="#2B2B2B" stroke-width="14"/>
<circle cx="140" cy="180" r="50" fill="#2B2B2B"/>
<circle cx="140" cy="180" r="38" fill="#B5E88F"/>
<circle cx="132" cy="172" r="15" fill="#8B5A2B"/><circle cx="156" cy="196" r="8" fill="#8B5A2B"/>
<path d="M114,166 A28,28 0 0 1 132,150" fill="none" stroke="#fff" stroke-width="5"/>`,
    },
    carrot: {
        name: 'Fresh carrot', caption: 'Crop Care',
        art: `<g transform="rotate(-16 150 150)">
<path d="M150,104 C140,70 116,52 94,48 C110,72 122,92 140,106 Z" fill="#6DBE45"/>
<path d="M150,104 C148,64 156,36 168,20 C176,50 168,80 158,106 Z" fill="#6DBE45"/>
<path d="M156,106 C176,76 200,64 222,62 C208,86 186,102 160,110 Z" fill="#6DBE45"/>
<path d="M110,112 C110,96 190,96 190,112 C188,172 168,232 150,266 C132,232 112,172 110,112 Z" fill="#FF8C2E"/>
<path d="M124,138 H146 M160,166 H178 M130,194 H150 M156,222 H166" fill="none" stroke-width="4"/>
</g>
<path d="M22,268 C36,214 116,200 150,212 C188,200 262,214 278,268 Z" fill="#6B4423"/>
<circle cx="84" cy="206" r="6" fill="#6B4423"/><circle cx="222" cy="200" r="5" fill="#6B4423"/>`,
    },
    // ---- OnTrack: working out ----
    workout: {
        name: 'Me, working out', caption: 'OnTrack',
        raw: myHead(150, 124, 92),
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
    heartrate: {
        name: 'Heart rate', caption: 'OnTrack',
        // The heart beats.
        style: '.hr{transform-origin:150px 112px;animation:hr 1.1s ease-in-out infinite}'
            + '@keyframes hr{0%,40%,100%{transform:scale(1)}15%{transform:scale(1.18)}}'
            + '@media (prefers-reduced-motion:reduce){*{animation:none!important}}',
        art: `<rect x="112" y="14" width="76" height="80" rx="14" fill="#2E6BE6"/>
<rect x="112" y="206" width="76" height="80" rx="14" fill="#2E6BE6"/>
<circle cx="150" cy="242" r="4" fill="#1B4BB0" stroke="none"/><circle cx="150" cy="262" r="4" fill="#1B4BB0" stroke="none"/>
<rect x="220" y="122" width="14" height="30" rx="5" fill="#9E9E9E"/>
<rect x="78" y="70" width="144" height="160" rx="36" fill="#2B2B2B"/>
<path class="hr" d="M150,136 C134,126 122,116 122,102 C122,93 129,88 137,88 C143,88 148,92 150,97 C152,92 157,88 163,88 C171,88 178,93 178,102 C178,116 166,126 150,136 Z" fill="#E63946" stroke="none"/>
<path d="M100,162 H124 L132,148 L142,178 L152,152 L158,162 H200" fill="none" stroke="#3BD16F" stroke-width="4"/>
<text x="150" y="208" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="17" fill="#fff" stroke="none">128 BPM</text>`,
    },
    jumprope: {
        name: 'Jump rope', caption: 'OnTrack',
        art: `<path d="M84,108 C50,220 100,272 150,272 C200,272 250,220 216,108" fill="none" stroke-width="13"/>
<path d="M84,108 C50,220 100,272 150,272 C200,272 250,220 216,108" fill="none" stroke="#E63946" stroke-width="6"/>
<g transform="rotate(-20 70 70)"><rect x="56" y="20" width="28" height="80" rx="13" fill="#FFC93C"/><rect x="58" y="96" width="24" height="12" rx="4" fill="#9E9E9E"/></g>
<g transform="rotate(20 230 70)"><rect x="216" y="20" width="28" height="80" rx="13" fill="#FFC93C"/><rect x="218" y="96" width="24" height="12" rx="4" fill="#9E9E9E"/></g>
<text x="150" y="180" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="40" fill="#1F1F1F" stroke="none">x100</text>`,
    },
    // Bright staying healthy: the drawn head on a marker body (`under` is drawn below it).
    running: {
        name: 'Me, out for a run', caption: 'OnTrack',
        under: `<path d="M24,152 H60 M14,182 H54 M26,212 H56" fill="none" stroke-width="5"/>
${limb([[128, 142], [102, 164], [98, 194]])}
${limb([[140, 212], [114, 238], [82, 232]])}
${limb([[162, 212], [196, 230], [188, 266]])}
<ellipse cx="78" cy="236" rx="17" ry="9" transform="rotate(-10 78 236)" fill="#FF6B35"/>
<ellipse cx="198" cy="272" rx="18" ry="9" fill="#FF6B35"/>
<path d="M124,196 H176 L182,226 H154 L150,214 L146,226 H118 Z" fill="#2E6BE6"/>
<path d="M122,128 Q150,118 178,128 L174,200 H126 Z" fill="#E63946"/>
${limb([[172, 142], [192, 176], [218, 156]])}`,
        raw: myHead(150, 76, 52),
        art: `<circle cx="150" cy="76" r="52" fill="none"/>
${drop(232, 70)}${drop(80, 88, 0.8)}`,
    },
    cycling: {
        name: 'Me, on my bike', caption: 'OnTrack',
        under: `${[74, 226].map(x => `<circle cx="${x}" cy="230" r="42" fill="#F3F6F9" stroke-width="10"/>
<path d="M${x},192 V268 M${x - 38},230 H${x + 38} M${x - 27},203 L${x + 27},257 M${x + 27},203 L${x - 27},257" fill="none" stroke="#9E9E9E" stroke-width="2.5"/>
<circle cx="${x}" cy="230" r="6" fill="#9E9E9E"/>`).join('\n')}
${limb([[126, 160], [166, 186], [124, 222]], '#2E6BE6', 16)}
<path d="M74,230 L140,232 L200,180 L226,230 M74,230 L122,172 L200,180 L194,160 M140,232 L122,172" fill="none" stroke-width="14"/>
<path d="M74,230 L140,232 L200,180 L226,230 M74,230 L122,172 L200,180 L194,160 M140,232 L122,172" fill="none" stroke="#E63946" stroke-width="7"/>
<path d="M182,160 H212" fill="none" stroke-width="7"/>
<path d="M104,166 H140 L134,175 H110 Z" fill="#2B2B2B"/>
<circle cx="140" cy="232" r="12" fill="#9E9E9E"/>
${limb([[126, 160], [176, 206], [160, 250]], '#2E6BE6', 16)}
<rect x="148" y="248" width="24" height="8" rx="3" fill="#2B2B2B"/>
<path d="M104,170 C104,156 112,150 124,148 L170,112 C184,106 204,114 204,128 L146,172 Z" fill="#3BD16F"/>
${limb([[190, 128], [212, 160]])}`,
        raw: myHead(190, 76, 46),
        art: `<circle cx="190" cy="76" r="46" fill="none"/>
<path d="M144,58 A50,50 0 0 1 236,58 Q190,42 144,58 Z" fill="#3BD16F"/>
<path d="M174,32 L177,48 M190,28 V46 M206,32 L203,48" fill="none" stroke-width="3"/>`,
    },
    yoga: {
        name: 'Me, finding my calm', caption: 'OnTrack',
        under: `<rect x="26" y="248" width="248" height="18" rx="8" fill="#8E7CC3"/>
<path d="M56,236 C70,206 120,204 150,214 C180,204 230,206 244,236 C244,256 200,258 150,252 C100,258 56,256 56,236 Z" fill="#4A4A4A"/>
<path d="M104,232 C130,226 170,226 196,240" fill="none" stroke-width="4"/>
<ellipse cx="112" cy="240" rx="16" ry="9" fill="${SKIN}"/>
<ellipse cx="190" cy="236" rx="16" ry="9" fill="${SKIN}"/>
<path d="M118,130 Q150,120 182,130 L180,216 H120 Z" fill="#2EC4B6"/>
${limb([[124, 142], [94, 184], [80, 214]])}
${limb([[176, 142], [206, 184], [220, 214]])}
<circle cx="80" cy="218" r="10" fill="${SKIN}"/><circle cx="220" cy="218" r="10" fill="${SKIN}"/>`,
        raw: myHead(150, 80, 52),
        art: `<circle cx="150" cy="80" r="52" fill="none"/>
<g stroke-width="3.5">${star(58, 66, 16, '#FFC93C')}${star(244, 96, 12, '#FFC93C')}${star(232, 42, 9, '#FFC93C')}</g>`,
    },
    salad: {
        name: 'Me, eating clean', caption: 'OnTrack',
        under: `<path d="M62,282 C62,190 238,190 238,282 Z" fill="#2E6BE6"/>`,
        raw: myHead(150, 94, 60),
        art: `<circle cx="150" cy="94" r="60" fill="none"/>
<path d="M200,198 L236,124" fill="none" stroke-width="14"/>
<path d="M200,198 L236,124" fill="none" stroke="#C9D1D8" stroke-width="6"/>
<path d="M228,128 L232,104 M236,130 L242,108 M244,134 L252,112" fill="none" stroke-width="5"/>
<circle cx="96" cy="200" r="18" fill="#6DBE45"/><circle cx="132" cy="190" r="20" fill="#3E8E2B"/>
<circle cx="170" cy="192" r="20" fill="#6DBE45"/><circle cx="206" cy="200" r="18" fill="#3E8E2B"/>
<circle cx="116" cy="196" r="9" fill="#E63946"/><circle cx="188" cy="188" r="9" fill="#E63946"/><circle cx="152" cy="198" r="8" fill="#FF8C2E"/>
<path d="M58,206 H242 Q236,268 150,270 Q64,268 58,206 Z" fill="#fff"/>
<path d="M72,230 Q150,242 228,230" fill="none" stroke="#2E9BF6" stroke-width="6"/>
<circle cx="60" cy="218" r="12" fill="${SKIN}"/><circle cx="240" cy="218" r="12" fill="${SKIN}"/>
<path d="M250,62 C250,62 236,53 236,44 C236,39 240,35 244,35 C247,35 250,38 250,41 C250,38 253,35 256,35 C260,35 264,39 264,44 C264,53 250,62 250,62 Z" fill="#E63946"/>`,
    },
    swimming: {
        name: 'Me, doing laps', caption: 'OnTrack',
        raw: myHead(150, 134, 56),
        art: `<circle cx="150" cy="134" r="56" fill="none"/>
<path d="M100,108 A56,56 0 0 1 200,108 Q150,92 100,108 Z" fill="#2E6BE6"/>
<path d="M14,186 Q31,174 48,186 T82,186 T116,186 T150,186 T184,186 T218,186 T252,186 T286,186 V266 Q286,272 280,272 H20 Q14,272 14,266 Z" fill="#6CB4E4"/>
<path d="M40,210 q10,-6 20,0 t20,0 M200,214 q10,-6 20,0 t20,0" fill="none" stroke="#fff" stroke-width="3"/>
<path d="M22,246 H278" fill="none" stroke-width="4"/>
${Array.from({ length: 11 }, (_, i) => `<circle cx="${30 + i * 24}" cy="246" r="9" fill="${i % 2 ? '#fff' : '#E63946'}"/>`).join('')}
${limb([[202, 196], [240, 128], [210, 92]])}
<circle cx="208" cy="88" r="11" fill="${SKIN}"/>
${drop(248, 82, 0.7)}${drop(70, 168, 0.7)}${drop(52, 140, 0.55)}`,
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
    coffee: {
        name: 'Coffee chat', caption: 'Roster',
        art: `<path d="M150,82 C150,82 134,72 134,62 C134,56 138,52 143,52 C147,52 150,55 150,58 C150,55 153,52 157,52 C162,52 166,56 166,62 C166,72 150,82 150,82 Z" fill="#E63946"/>
<g transform="rotate(8 92 190)">
<path d="M48,160 C18,160 18,214 48,214" fill="none" stroke-width="18"/>
<path d="M48,160 C18,160 18,214 48,214" fill="none" stroke="#F7941D" stroke-width="7"/>
<rect x="48" y="132" width="88" height="108" rx="14" fill="#F7941D"/>
<ellipse cx="92" cy="136" rx="40" ry="8" fill="#6B4423"/>
<path d="M80,114 C70,100 90,92 80,76 M104,114 C94,100 114,92 104,76" fill="none" stroke-width="5"/>
</g>
<g transform="rotate(-8 208 190)">
<path d="M252,160 C282,160 282,214 252,214" fill="none" stroke-width="18"/>
<path d="M252,160 C282,160 282,214 252,214" fill="none" stroke="#2E9BF6" stroke-width="7"/>
<rect x="164" y="132" width="88" height="108" rx="14" fill="#2E9BF6"/>
<ellipse cx="208" cy="136" rx="40" ry="8" fill="#6B4423"/>
<path d="M196,114 C186,100 206,92 196,76 M220,114 C210,100 230,92 220,76" fill="none" stroke-width="5"/>
</g>`,
    },
    businesscard: {
        name: 'Business card', caption: 'Roster',
        art: `<rect x="56" y="62" width="216" height="128" rx="12" fill="#2E9BF6" transform="rotate(8 164 126)"/>
<g transform="rotate(-6 150 170)">
<rect x="32" y="104" width="236" height="134" rx="12" fill="#fff"/>
<circle cx="84" cy="158" r="28" fill="#CDE9FF"/>
<path d="M62,182 C62,162 106,162 106,182" fill="#2E9BF6" stroke-width="4"/>
<circle cx="84" cy="150" r="11" fill="#8D5524" stroke-width="4"/>
<text x="124" y="160" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="26" fill="#1F1F1F" stroke="none">Bright</text>
<text x="124" y="182" font-family="Arial, sans-serif" font-size="14" fill="#555" stroke="none">Product Designer</text>
<path d="M56,206 H150 M56,222 H120" fill="none" stroke="#BDBDBD" stroke-width="4"/>
<rect x="204" y="190" width="40" height="40" rx="4" fill="#fff" stroke-width="4"/>
<path d="M210,196 h10 v10 h-10 Z M228,196 h10 v10 h-10 Z M210,214 h10 v10 h-10 Z M228,214 h4 v4 h-4 Z M234,220 h4 v4 h-4 Z" fill="#1F1F1F" stroke="none"/>
</g>`,
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

// Knicks fan stickers for the About page: team colours and fan gear, not the team's logo.
const KB = '#006BB6', KO = '#F58426';
const ball = (cx, cy, r, sw = 4) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${KO}"/>
<path d="M${cx - r},${cy} H${cx + r} M${cx},${cy - r} V${cy + r} M${f(cx - r * 0.64)},${f(cy - r * 0.77)} Q${f(cx - r * 0.16)},${cy} ${f(cx - r * 0.64)},${f(cy + r * 0.77)} M${f(cx + r * 0.64)},${f(cy - r * 0.77)} Q${f(cx + r * 0.16)},${cy} ${f(cx + r * 0.64)},${f(cy + r * 0.77)}" fill="none" stroke-width="${sw}"/>`;
const BLACK = 'font-family="Arial Black, Arial, sans-serif" font-weight="900" text-anchor="middle"';
const KNICKS = {
    knicksjersey: {
        name: 'My Knicks jersey', caption: 'New York Knicks',
        art: `<path d="M96,34 L124,28 C130,44 140,50 150,50 C160,50 170,44 176,28 L204,34 C206,68 220,96 242,110 L238,266 H62 L58,110 C80,96 94,68 96,34 Z" fill="${KB}"/>
<path d="M124,28 C130,44 140,50 150,50 C160,50 170,44 176,28 M97,42 C94,70 82,96 62,108 M203,42 C206,70 218,96 238,108" fill="none" stroke="${KO}" stroke-width="7"/>
<path d="M66,150 L67,258 M234,150 L233,258" fill="none" stroke="${KO}" stroke-width="8"/>
<text x="150" y="102" ${BLACK} font-size="28" fill="#fff" stroke="${KO}" stroke-width="1.5">BRIGHT</text>
<text x="150" y="216" ${BLACK} font-size="100" fill="#fff" stroke="${KO}" stroke-width="3">10</text>`,
    },
    msg: {
        name: 'Madison Square Garden', caption: 'New York Knicks',
        art: `<ellipse cx="150" cy="92" rx="118" ry="26" fill="#C9CDD2"/>
<rect x="46" y="200" width="208" height="58" fill="#B9C1C9"/>
<path d="M32,92 A118,26 0 0 0 268,92 V194 A118,26 0 0 1 32,194 Z" fill="#E3E6EA"/>
${Array.from({ length: 11 }, (_, i) => { const x = 50 + i * 20, e = 26 * Math.sqrt(1 - ((x - 150) / 118) ** 2); return `<path d="M${x},${f(96 + e)} V${f(190 + e)}" fill="none" stroke="#B9C1C9" stroke-width="5"/>`; }).join('')}
<rect x="84" y="238" width="132" height="20" fill="#6CB4E4"/>
<rect x="96" y="204" width="108" height="30" rx="5" fill="${KB}"/>
<text x="150" y="226" ${BLACK} font-size="18" fill="${KO}" stroke="none">KNICKS</text>
${ground(262, 30, 270)}`,
    },
    foamfinger: {
        name: 'Foam finger', caption: 'New York Knicks',
        art: `<rect x="128" y="22" width="44" height="120" rx="22" fill="${KO}"/>
<ellipse cx="86" cy="168" rx="18" ry="34" transform="rotate(-25 86 168)" fill="${KO}"/>
<path d="M84,130 C84,112 96,104 112,104 H190 C206,104 216,116 216,132 V212 C216,240 196,256 170,256 H130 C104,256 84,240 84,212 Z" fill="${KO}"/>
<path d="M176,116 Q196,110 214,122" fill="none" stroke-width="4"/>
<text x="150" y="198" ${BLACK} font-size="56" fill="${KB}" stroke="none">#1</text>
<text x="150" y="236" ${BLACK} font-size="22" fill="${KB}" stroke="none">KNICKS</text>
<rect x="108" y="252" width="84" height="24" rx="6" fill="${KB}"/>`,
    },
    knicksfan: {
        name: 'Me, courtside', caption: 'New York Knicks',
        under: `<rect x="128" y="140" width="44" height="60" fill="${SKIN}"/>
<path d="M50,280 C50,150 250,150 250,280 Z" fill="${KB}"/>
<path d="M120,186 L150,220 L180,186 Z" fill="${SKIN}" stroke="none"/>
<path d="M120,186 L150,220 L180,186" fill="none" stroke="${KO}" stroke-width="8"/>`,
        raw: myHead(150, 104, 58),
        art: `<circle cx="150" cy="104" r="58" fill="none"/>
<path d="M94,82 A58,58 0 0 1 206,82 Q150,64 94,82 Z" fill="${KB}"/>
<path d="M100,72 Q150,54 200,72" fill="none" stroke="${KO}" stroke-width="8"/>
<circle cx="150" cy="32" r="12" fill="${KO}"/>
${ball(234, 222, 36)}
<circle cx="206" cy="248" r="13" fill="${SKIN}"/>`,
    },
    hoop: {
        name: 'Nothing but net', caption: 'New York Knicks',
        art: `<rect x="60" y="24" width="180" height="112" rx="6" fill="#fff"/>
<rect x="116" y="72" width="68" height="54" fill="none" stroke="${KO}" stroke-width="6"/>
<path d="M126,96 L132,122 M150,92 V120 M174,96 L168,122" fill="none" stroke-width="4"/>
${ball(150, 178, 30)}
${(() => { const top = i => f(100 + i * 12.5), bot = i => f(116 + i * 8.5); const d = Array.from({ length: 8 }, (_, i) => `M${top(i)},142 L${bot(i + 1)},212 M${top(i + 1)},142 L${bot(i)},212`).join(' ') + ' M116,212 H184'; return `<path d="${d}" fill="none" stroke-width="6"/><path d="${d}" fill="none" stroke="#fff" stroke-width="3"/>`; })()}
<ellipse cx="150" cy="142" rx="50" ry="10" fill="none" stroke-width="14"/>
<ellipse cx="150" cy="142" rx="50" ry="10" fill="none" stroke="${KO}" stroke-width="7"/>`,
    },
    gameticket: {
        name: 'Game night', caption: 'New York Knicks',
        art: `<g transform="rotate(8 150 150)">
<path d="M40,92 H260 V132 A18,18 0 0 0 260,168 V208 H40 V168 A18,18 0 0 0 40,132 Z" fill="${KB}"/>
<path d="M200,100 V200" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="8 8"/>
<text x="120" y="144" ${BLACK} font-size="28" fill="#fff" stroke="none">KNICKS</text>
<text x="120" y="168" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="11" letter-spacing="1" fill="${KO}" stroke="none">GAME NIGHT · MSG</text>
<text x="120" y="188" text-anchor="middle" font-family="Arial, sans-serif" font-size="9.5" fill="#fff" stroke="none">SEC 101 · ROW A · SEAT 10</text>
${ball(230, 150, 17, 3)}
</g>`,
    },
    pennant: {
        name: 'Knicks pennant', caption: 'New York Knicks',
        art: `<g transform="rotate(-8 150 150)">
<rect x="20" y="40" width="12" height="226" rx="5" fill="#A0612B"/>
<path d="M32,66 L270,150 L32,234 Z" fill="${KB}"/>
<rect x="32" y="66" width="22" height="168" fill="${KO}"/>
<path d="M32,66 L270,150 L32,234" fill="none"/>
<text x="140" y="162" ${BLACK} font-size="32" fill="${KO}" stroke="none">KNICKS</text>
</g>`,
    },
    hightop: {
        name: 'Hoop shoes', caption: 'New York Knicks',
        art: `<path d="M48,236 H262 C272,236 272,264 258,264 H54 C42,264 40,236 48,236 Z" fill="#fff"/>
<path d="M58,238 L60,96 C60,84 70,76 82,76 H128 C140,76 146,86 148,98 L154,146 C196,154 236,170 252,196 C260,210 260,232 250,238 Z" fill="${KB}"/>
<path d="M206,178 C230,186 248,198 254,214 C258,226 256,236 250,238 H214 C214,212 212,194 206,178 Z" fill="#fff"/>
<path d="M74,206 C118,188 176,194 214,218" fill="none" stroke-width="20"/>
<path d="M74,206 C118,188 176,194 214,218" fill="none" stroke="${KO}" stroke-width="11"/>
<path d="M140,108 L160,104 M142,124 L164,122 M146,140 L170,140 M152,156 L180,160" fill="none" stroke="#fff" stroke-width="6"/>
<rect x="56" y="70" width="94" height="22" rx="10" fill="${KO}"/>
<rect x="48" y="98" width="16" height="54" rx="6" fill="${KO}"/>`,
    },
    scoreboard: {
        name: 'Final score', caption: 'New York Knicks',
        art: `<path d="M90,14 L110,56 M210,14 L190,56" fill="none" stroke-width="4"/>
<rect x="30" y="56" width="240" height="184" rx="16" fill="#1F1F1F"/>
<text x="150" y="90" ${BLACK} font-size="20" fill="#fff" stroke="none">FINAL</text>
<rect x="46" y="104" width="96" height="94" rx="8" fill="#2B2B2B"/>
<rect x="158" y="104" width="96" height="94" rx="8" fill="#2B2B2B"/>
<text x="94" y="128" ${BLACK} font-size="15" fill="#fff" stroke="none">KNICKS</text>
<text x="206" y="128" ${BLACK} font-size="15" fill="#fff" stroke="none">AWAY</text>
<text x="94" y="182" ${BLACK} font-size="38" fill="${KO}" stroke="none">112</text>
<text x="206" y="182" ${BLACK} font-size="38" fill="#7A7A7A" stroke="none">108</text>
<text x="150" y="226" ${BLACK} font-size="16" fill="#E63946" stroke="none">0:00</text>`,
    },
    ballspin: {
        name: 'On my finger', caption: 'New York Knicks',
        art: `${limb([[230, 262], [184, 232]], SKIN, 34)}
${limb([[216, 255], [206, 248]], KB, 34)}
${limb([[152, 210], [150, 168]], SKIN, 16)}
<ellipse cx="162" cy="224" rx="30" ry="24" transform="rotate(-30 162 224)" fill="${SKIN}"/>
<path d="M146,232 Q156,244 170,240 M156,222 Q166,232 180,228" fill="none" stroke-width="3.5"/>
${ball(150, 104, 70)}
<path d="M58,92 Q66,52 104,36 M242,116 Q234,156 196,172" fill="none" stroke-width="5"/>
<path d="M94,28 L106,36 L96,48 M206,180 L194,172 L204,160" fill="none" stroke-width="5"/>`,
    },
};

// Manchester United fan stickers (About and the phone page): club colours and fan gear,
// not the club's crest.
const UR = '#DA291C', UB = '#1F1F1F';
const pent = (cx, cy, r, rot) => 'M' + [0, 1, 2, 3, 4].map(i => {
    const a = (rot + i * 72 - 90) * Math.PI / 180;
    return `${f(cx + r * Math.cos(a))},${f(cy + r * Math.sin(a))}`;
}).join(' L') + ' Z';
const UNITED = {
    unitedjersey: {
        name: 'My United shirt', caption: 'Manchester United',
        art: `<path d="M100,40 C112,52 130,58 150,58 C170,58 188,52 200,40 L248,62 L274,120 L236,138 L226,116 L226,264 H74 L74,116 L64,138 L26,120 L52,62 Z" fill="${UR}"/>
<path d="M104,44 C116,54 132,60 150,60 C168,60 184,54 196,44" fill="none" stroke="#fff" stroke-width="7"/>
<path d="M30,113 L66,130 M270,113 L234,130" fill="none" stroke="#fff" stroke-width="7"/>
<text x="150" y="106" ${BLACK} font-size="28" fill="#fff" stroke="${UB}" stroke-width="1.5">BRIGHT</text>
<text x="150" y="228" ${BLACK} font-size="112" fill="#fff" stroke="${UB}" stroke-width="3">7</text>`,
    },
    oldtrafford: {
        name: 'Old Trafford', caption: 'Theatre of Dreams',
        art: `<path d="M18,66 H282 L270,92 H30 Z" fill="#D9D9D9"/>
<path d="M40,70 L60,88 L80,70 L100,88 L120,70 L140,88 L160,70 L180,88 L200,70 L220,88 L240,70 L260,88" fill="none" stroke="#9E9E9E" stroke-width="3"/>
<rect x="30" y="92" width="240" height="106" fill="${UR}"/>
<path d="M30,122 H270 M30,170 H270" fill="none" stroke="#A81E15" stroke-width="4"/>
<text x="150" y="153" ${BLACK} font-size="17" fill="#fff" stroke="none">MANCHESTER UNITED</text>
${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${f(14 + i * 45.3)},198 H${f(59.3 + i * 45.3)} L${f(57 + i * 41.2)},262 H${f(16 + i * 41.2)} Z" fill="${i % 2 ? '#5DB85F' : '#43A047'}" stroke="none"/>`).join('')}
<path d="M14,198 H286 L276,262 H24 Z" fill="none"/>
<path d="M150,198 V262 M110,262 Q150,232 190,262" fill="none" stroke="#fff" stroke-width="3"/>`,
    },
    unitedscarf: {
        name: 'United scarf', caption: 'Manchester United',
        art: `<g transform="rotate(-24 150 150)">
<path d="M26,114 V186 M36,114 V186 M46,114 V186 M254,114 V186 M264,114 V186 M274,114 V186" fill="none" stroke-width="4"/>
<rect x="50" y="118" width="200" height="64" fill="${UR}"/>
${[[54, '#fff'], [68, UB], [82, '#fff'], [206, '#fff'], [220, UB], [234, '#fff']].map(([x, c]) => `<rect x="${x}" y="118" width="12" height="64" fill="${c}" stroke="none"/>`).join('')}
<rect x="50" y="118" width="200" height="64" fill="none"/>
<text x="150" y="160" ${BLACK} font-size="20" fill="#fff" stroke="none">UNITED</text>
</g>`,
    },
    redfork: {
        name: 'Red Devil fork', caption: 'Red Devils',
        art: `<g transform="rotate(18 150 150)">
<rect x="144" y="104" width="12" height="168" rx="5" fill="${UR}"/>
<path d="M144,110 C112,110 98,92 98,62 L90,62 L104,30 L118,62 L110,62 C110,84 120,94 144,96 L144,56 L136,56 L150,20 L164,56 L156,56 L156,96 C180,94 190,84 190,62 L182,62 L196,30 L210,62 L202,62 C202,92 188,110 156,110 Z" fill="${UR}"/>
<path d="M124,40 L118,52 M176,40 L182,52" fill="none" stroke="#fff" stroke-width="3"/>
</g>`,
    },
    matchball: {
        name: 'Matchday ball', caption: 'Manchester United',
        art: `<path d="M24,118 H58 M14,148 H52 M24,178 H58" fill="none" stroke-width="5"/>
<ellipse cx="160" cy="258" rx="74" ry="11" fill="#CFCFCF" stroke="none"/>
<defs><clipPath id="ballClip"><circle cx="160" cy="146" r="94"/></clipPath></defs>
<circle cx="160" cy="146" r="94" fill="#fff"/>
<g clip-path="url(#ballClip)">
${[0, 1, 2, 3, 4].map(k => { const a = (-90 + k * 72) * Math.PI / 180; return `<path d="${pent(f(160 + Math.cos(a) * 84), f(146 + Math.sin(a) * 84), 28, 180 + k * 72)}" fill="${UB}" stroke="none"/><path d="M${f(160 + Math.cos(a) * 32)},${f(146 + Math.sin(a) * 32)} L${f(160 + Math.cos(a) * 56)},${f(146 + Math.sin(a) * 56)}" fill="none" stroke-width="3"/>`; }).join('')}
</g>
<path d="${pent(160, 146, 32, 0)}" fill="${UB}"/>
<circle cx="160" cy="146" r="94" fill="none"/>
<path d="M98,92 Q110,72 132,62" fill="none" stroke="${UR}" stroke-width="6"/>`,
    },
    unitedfan: {
        name: 'Me, Red Devil', caption: 'Manchester United',
        under: `<rect x="128" y="140" width="44" height="60" fill="${SKIN}"/>
<path d="M50,280 C50,150 250,150 250,280 Z" fill="${UR}"/>
<path d="M120,184 Q150,204 180,184" fill="none" stroke="#fff" stroke-width="7"/>`,
        raw: myHead(150, 104, 58),
        art: `<circle cx="150" cy="104" r="58" fill="none"/>
<path d="M100,72 C88,52 94,30 110,20 C110,38 118,48 130,52 Z" fill="${UR}"/>
<path d="M200,72 C212,52 206,30 190,20 C190,38 182,48 170,52 Z" fill="${UR}"/>
<path d="M96,196 L118,280 L146,280 L128,190 Z" fill="${UR}"/>
<path d="M104,222 L131,214 M112,250 L138,243" fill="none" stroke="#fff" stroke-width="8"/>
<path d="M107,236 L134,229" fill="none" stroke="${UB}" stroke-width="7"/>
<path d="M204,196 L182,280 L154,280 L172,190 Z" fill="${UR}"/>
<path d="M196,222 L169,214 M188,250 L162,243" fill="none" stroke="#fff" stroke-width="8"/>
<path d="M193,236 L166,229" fill="none" stroke="${UB}" stroke-width="7"/>`,
    },
    unitedticket: {
        name: 'Matchday', caption: 'Old Trafford',
        art: `<g transform="rotate(-8 150 150)">
<path d="M40,92 H260 V132 A18,18 0 0 0 260,168 V208 H40 V168 A18,18 0 0 0 40,132 Z" fill="${UR}"/>
<path d="M200,100 V200" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="8 8"/>
<text x="120" y="144" ${BLACK} font-size="24" fill="#fff" stroke="none">MAN UTD</text>
<text x="120" y="168" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="11" letter-spacing="1" fill="${UB}" stroke="none">OLD TRAFFORD</text>
<text x="120" y="188" text-anchor="middle" font-family="Arial, sans-serif" font-size="9.5" fill="#fff" stroke="none">STRETFORD END · SEAT 7</text>
<circle cx="230" cy="150" r="17" fill="#fff" stroke-width="4"/>
<path d="${pent(230, 150, 7, 0)}" fill="${UB}" stroke="none"/>
</g>`,
    },
    ggmuflag: {
        name: 'Glory Glory Man United', caption: 'Red Devils',
        art: `<rect x="56" y="34" width="12" height="240" rx="5" fill="#8F9AA5"/>
<circle cx="62" cy="30" r="10" fill="#FBE122"/>
<path d="M68,48 C118,28 172,72 252,50 V170 C172,194 118,148 68,168 Z" fill="${UR}"/>
<path d="M68,148 C118,128 172,172 252,150 V170 C172,194 118,148 68,168 Z" fill="${UB}"/>
<text x="160" y="124" ${BLACK} font-size="46" fill="#fff" stroke="${UB}" stroke-width="2" transform="rotate(4 160 110)">GGMU</text>`,
    },
};

// Construction crew for Roster while it's being built: builders, machines and people
// networking while they wait. Not scratch-off: scripts/sticker-crew.js moves them about.
const HAT = '#FFC93C', VEST = '#FF7A21', JEANS = '#2E4A7D', MACHINE = '#F2B300';
// The yellow-and-black hazard stripe, as a pattern filled over yellow.
const HAZARD = `<defs><pattern id="hz" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="14" fill="#1F1F1F"/></pattern></defs>`;
// A builder standing with feet at (x, foot): hard hat, hi-vis vest, boots. `arms` are
// limb point lists drawn in front; `legs` can replace the straight stance (e.g. a stride).
const worker = ({ x, foot = 266, skin = '#8D5524', vest = VEST, hat = HAT, pants = JEANS, arms = [], legs }) => {
    const hip = foot - 70, sh = foot - 120, hy = foot - 142;
    const [l, r] = legs || [[[x - 9, hip], [x - 12, foot - 6]], [[x + 9, hip], [x + 12, foot - 6]]];
    return `${limb(l, pants, 13)}${limb(r, pants, 13)}
<ellipse cx="${l[l.length - 1][0] - 3}" cy="${foot - 2}" rx="12" ry="6" fill="#4A3426"/><ellipse cx="${r[r.length - 1][0] + 3}" cy="${foot - 2}" rx="12" ry="6" fill="#4A3426"/>
<path d="M${x - 24},${sh} Q${x},${sh - 8} ${x + 24},${sh} L${x + 21},${hip + 4} H${x - 21} Z" fill="${vest}"/>
<path d="M${x - 22},${sh + 24} H${x + 22} M${x - 21},${hip - 8} H${x + 21}" fill="none" stroke="#F4F4F4" stroke-width="6"/>
<circle cx="${x}" cy="${hy}" r="16" fill="${skin}"/>
<path d="M${x - 18},${hy - 7} A18,18 0 0 1 ${x + 18},${hy - 7} Z" fill="${hat}"/>
<rect x="${x - 24}" y="${hy - 11}" width="48" height="6" rx="3" fill="${hat}"/>
${arms.map(a => limb(a, skin, 11)).join('')}`;
};
// Someone in everyday clothes, feet at (x, foot).
const person = ({ x, foot = 266, skin = '#E0AC69', top = '#2E9BF6', pants = '#3A3A3A', hair = '#1F1F1F', arms = [], dress = false, longHair = false }) => {
    const hip = foot - 70, sh = foot - 120, hy = foot - 142;
    const legs = dress
        ? `${limb([[x - 8, hip + 20], [x - 9, foot - 6]], skin, 10)}${limb([[x + 8, hip + 20], [x + 9, foot - 6]], skin, 10)}`
        : `${limb([[x - 9, hip], [x - 11, foot - 6]], pants, 13)}${limb([[x + 9, hip], [x + 11, foot - 6]], pants, 13)}`;
    const body = dress
        ? `<path d="M${x - 22},${sh} Q${x},${sh - 8} ${x + 22},${sh} L${x + 30},${hip + 26} H${x - 30} Z" fill="${top}"/>`
        : `<path d="M${x - 23},${sh} Q${x},${sh - 8} ${x + 23},${sh} L${x + 20},${hip + 4} H${x - 20} Z" fill="${top}"/>`;
    const hairBack = longHair ? `<path d="M${x - 18},${hy + 18} C${x - 22},${hy - 4} ${x - 16},${hy - 20} ${x},${hy - 20} C${x + 16},${hy - 20} ${x + 22},${hy - 4} ${x + 18},${hy + 18} Z" fill="${hair}"/>` : '';
    return `${legs}
<ellipse cx="${x - 13}" cy="${foot - 2}" rx="11" ry="6" fill="#1F1F1F"/><ellipse cx="${x + 13}" cy="${foot - 2}" rx="11" ry="6" fill="#1F1F1F"/>
${body}${hairBack}
<circle cx="${x}" cy="${hy}" r="16" fill="${skin}"/>
<path d="M${x - 16},${hy - 2} C${x - 16},${hy - 22} ${x + 16},${hy - 22} ${x + 16},${hy - 2} C${x + 8},${hy - 10} ${x - 8},${hy - 10} ${x - 16},${hy - 2} Z" fill="${hair}"/>
${arms.map(a => limb(a, skin, 10)).join('')}`;
};
// Someone in a suit, feet at (x, foot): jacket with lapels and two buttons, white shirt and
// tie (tie: null for none), trousers or a skirt, sleeves down to a hand at the end of each
// arm. `legs` can replace the straight stance; `hat` puts a hard hat on for a site visit.
const suit = ({ x, foot = 266, skin = '#E0AC69', cloth = '#2B3A55', tie = '#C8102E', hair = '#1F1F1F', arms = [], legs, skirt = false, longHair = false, hat = false }) => {
    const hip = foot - 70, sh = foot - 120, hy = foot - 142;
    const [l, r] = legs || [[[x - 9, hip], [x - 11, foot - 6]], [[x + 9, hip], [x + 11, foot - 6]]];
    const lower = skirt
        ? `${limb([[x - 8, hip + 24], [x - 9, foot - 6]], skin, 10)}${limb([[x + 8, hip + 24], [x + 9, foot - 6]], skin, 10)}
<path d="M${x - 21},${hip} L${x - 25},${hip + 30} H${x + 25} L${x + 21},${hip} Z" fill="${cloth}"/>`
        : `${limb(l, cloth, 13)}${limb(r, cloth, 13)}`;
    const feet = skirt ? [[x - 13, foot - 2], [x + 13, foot - 2]] : [[l[l.length - 1][0] - 2, foot - 2], [r[r.length - 1][0] + 2, foot - 2]];
    const hairBack = longHair ? `<path d="M${x - 18},${hy + 18} C${x - 22},${hy - 4} ${x - 16},${hy - 20} ${x},${hy - 20} C${x + 16},${hy - 20} ${x + 22},${hy - 4} ${x + 18},${hy + 18} Z" fill="${hair}"/>` : '';
    const top = hat
        ? `<path d="M${x - 18},${hy - 7} A18,18 0 0 1 ${x + 18},${hy - 7} Z" fill="${HAT}"/><rect x="${x - 24}" y="${hy - 11}" width="48" height="6" rx="3" fill="${HAT}"/>`
        : `<path d="M${x - 16},${hy - 2} C${x - 16},${hy - 22} ${x + 16},${hy - 22} ${x + 16},${hy - 2} C${x + 8},${hy - 10} ${x - 8},${hy - 10} ${x - 16},${hy - 2} Z" fill="${hair}"/>`;
    return `${lower}
${feet.map(([fx, fy]) => `<ellipse cx="${fx}" cy="${fy}" rx="11" ry="6" fill="#1F1F1F"/>`).join('')}
<path d="M${x - 24},${sh} Q${x},${sh - 8} ${x + 24},${sh} L${x + 22},${hip + 10} H${x - 22} Z" fill="${cloth}"/>
<path d="M${x - 10},${sh - 4} H${x + 10} L${x},${sh + 30} Z" fill="#fff" stroke-width="3"/>
${tie ? `<path d="M${x - 4},${sh - 3} H${x + 4} L${x + 2},${sh + 4} L${x + 5},${sh + 22} L${x},${sh + 28} L${x - 5},${sh + 22} L${x - 2},${sh + 4} Z" fill="${tie}" stroke-width="2.5"/>` : ''}
<path d="M${x - 13},${sh - 3} L${x - 5},${sh + 14} L${x},${sh + 30} M${x + 13},${sh - 3} L${x + 5},${sh + 14} L${x},${sh + 30} V${hip + 10}" fill="none" stroke-width="3"/>
<path d="M${x + 11},${sh + 24} l4,-6 l4,6 Z" fill="#fff" stroke-width="2"/>
<circle cx="${x}" cy="${sh + 40}" r="3" fill="#1F1F1F" stroke="none"/><circle cx="${x}" cy="${sh + 54}" r="3" fill="#1F1F1F" stroke="none"/>
${hairBack}<circle cx="${x}" cy="${hy}" r="16" fill="${skin}"/>${top}
${arms.map(a => `${limb(a, cloth, 12)}<circle cx="${a[a.length - 1][0]}" cy="${a[a.length - 1][1]}" r="7" fill="${skin}"/>`).join('')}`;
};
// A briefcase hanging from a hand at (x, y).
const briefcase = (x, y, skin) => `<path d="M${x - 8},${y + 8} V${y} H${x + 8} V${y + 8}" fill="none" stroke-width="4"/>
<rect x="${x - 21}" y="${y + 6}" width="42" height="30" rx="4" fill="#6B4423"/><path d="M${x - 21},${y + 16} H${x + 21}" fill="none" stroke="#4A2E17" stroke-width="3"/>
<circle cx="${x}" cy="${y}" r="7" fill="${skin}"/>`;
const bubble = (x, y, w, text, size = 15) => `<path d="M${x},${y} H${x + w} Q${x + w + 8},${y} ${x + w + 8},${y + 8} V${y + 26} Q${x + w + 8},${y + 34} ${x + w},${y + 34} H${x + 26} L${x + 14},${y + 46} L${x + 16},${y + 34} H${x} Q${x - 8},${y + 34} ${x - 8},${y + 26} V${y + 8} Q${x - 8},${y} ${x},${y} Z" fill="#fff" stroke-width="4"/>
<text x="${x + (w) / 2}" y="${y + 23}" ${BLACK} font-size="${size}" fill="#1F1F1F" stroke="none">${text}</text>`;
const CONSTRUCTION = {
    signcarry: {
        name: 'Site under construction', caption: 'Builders at work',
        art: `${HAZARD}
${worker({ x: 76, arms: [[[56, 150], [44, 126], [54, 104]], [[96, 150], [108, 126], [98, 104]]] })}
${worker({ x: 224, skin: '#C68642', vest: '#B9E23B', hat: VEST, arms: [[[204, 150], [192, 126], [202, 104]], [[244, 150], [256, 126], [246, 104]]] })}
<rect x="30" y="14" width="240" height="88" rx="6" fill="${HAT}"/>
<rect x="30" y="14" width="240" height="13" fill="url(#hz)" stroke="none"/>
<rect x="30" y="89" width="240" height="13" fill="url(#hz)" stroke="none"/>
<rect x="30" y="14" width="240" height="88" rx="6" fill="none"/>
<text x="150" y="52" ${BLACK} font-size="23" fill="#1F1F1F" stroke="none">SITE UNDER</text>
<text x="150" y="79" ${BLACK} font-size="21" fill="#1F1F1F" stroke="none">CONSTRUCTION</text>`,
    },
    hammering: {
        name: 'Nailing it', caption: 'Builders at work',
        art: `<path d="M160,208 L148,264 M180,208 L190,264 M252,208 L242,264 M272,208 L284,264" fill="none" stroke-width="13"/>
<path d="M160,208 L148,264 M180,208 L190,264 M252,208 L242,264 M272,208 L284,264" fill="none" stroke="#A0612B" stroke-width="6"/>
<rect x="140" y="192" width="148" height="18" rx="3" fill="#D9A066"/>
<path d="M156,201 H186 M228,199 H262" fill="none" stroke="#B57A3E" stroke-width="3"/>
<path d="M214,178 V193" fill="none" stroke="#5A5A5A" stroke-width="5"/><path d="M208,177 H220" fill="none" stroke="#5A5A5A" stroke-width="5"/>
${worker({ x: 92, arms: [[[110, 150], [148, 176], [200, 184]], [[104, 146], [126, 112], [156, 102]]] })}
<path d="M154,104 L190,78" fill="none" stroke-width="14"/><path d="M154,104 L190,78" fill="none" stroke="#A0612B" stroke-width="7"/>
<rect x="180" y="58" width="16" height="38" rx="3" transform="rotate(-36 188 77)" fill="#5A5A5A"/>
<path d="M206,92 Q224,112 222,140 M216,86 Q238,110 236,140" fill="none" stroke-width="3" stroke-dasharray="6 6"/>
<path d="${(() => { const pts = []; for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, r = i % 2 ? 24 : 38; pts.push(`${f(250 + Math.cos(a) * r)},${f(146 + Math.sin(a) * r)}`); } return 'M' + pts.join(' L') + ' Z'; })()}" fill="${HAT}"/>
<text x="250" y="151" ${BLACK} font-size="12" fill="#1F1F1F" stroke="none">BANG!</text>`,
    },
    plankcarry: {
        name: 'Plank run', caption: 'Builders at work',
        art: `<rect x="14" y="134" width="276" height="16" rx="3" transform="rotate(-8 150 142)" fill="#D9A066"/>
<path d="M40,142 H90 M206,142 H256" fill="none" stroke="#B57A3E" stroke-width="3" transform="rotate(-8 150 142)"/>
${worker({ x: 150, skin: '#B87A58', vest: '#B9E23B', legs: [[[141, 196], [124, 228], [118, 260]], [[159, 196], [172, 226], [186, 258]]],
           arms: [[[170, 150], [188, 146], [184, 134]], [[130, 150], [118, 182], [126, 210]]] })}`,
    },
    crane: {
        name: 'Tower crane', caption: 'Under construction',
        art: `<path d="M92,24 L40,58 M92,24 L270,58" fill="none" stroke-width="3"/>
<path d="M82,58 L92,24 L102,58 Z" fill="${HAT}"/>
<rect x="40" y="58" width="236" height="16" fill="${HAT}"/>
<path d="M${Array.from({ length: 12 }, (_, i) => `${40 + i * 20},${i % 2 ? 58 : 74}`).join(' L')}" fill="none" stroke-width="3"/>
<rect x="40" y="74" width="30" height="24" fill="#8F9AA5"/>
<rect x="80" y="74" width="24" height="186" fill="${HAT}"/>
<path d="M${Array.from({ length: 9 }, (_, i) => `${i % 2 ? 104 : 80},${74 + i * 23}`).join(' L')}" fill="none" stroke-width="3"/>
<rect x="104" y="74" width="22" height="20" rx="3" fill="#CDE9FF"/>
<rect x="62" y="258" width="60" height="12" rx="3" fill="#8F9AA5"/>
<rect x="210" y="72" width="20" height="10" fill="#5A5A5A"/>
<path d="M220,82 V164 M220,164 L188,176 M220,164 L252,176" fill="none" stroke-width="3"/>
<path d="M216,160 a5,5 0 1 0 8,4" fill="none" stroke-width="3"/>
<rect x="184" y="176" width="72" height="36" fill="#C1502E"/>
<path d="M184,188 H256 M184,200 H256 M202,176 V188 M226,176 V188 M250,176 V188 M190,188 V200 M214,188 V200 M238,188 V200 M202,200 V212 M226,200 V212 M250,200 V212" fill="none" stroke="#F3D3C2" stroke-width="2.5"/>
<rect x="180" y="212" width="80" height="8" fill="#A0612B"/>`,
    },
    excavator: {
        name: 'Digger', caption: 'Under construction',
        art: `<path d="M196,264 C210,226 250,214 288,238 V264 Z" fill="#8B5A2B"/>
<rect x="24" y="228" width="174" height="34" rx="17" fill="#3A3A3A"/>
${[44, 78, 112, 146, 178].map(x => `<circle cx="${x}" cy="245" r="9" fill="#8F9AA5"/>`).join('')}
<rect x="38" y="176" width="140" height="54" rx="8" fill="${MACHINE}"/>
<rect x="38" y="190" width="18" height="30" fill="#2B2B2B" stroke="none"/>
<rect x="48" y="120" width="58" height="62" rx="6" fill="${MACHINE}"/>
<rect x="56" y="128" width="42" height="36" rx="4" fill="#CDE9FF"/>
<path d="M132,196 L194,126" fill="none" stroke="#8F9AA5" stroke-width="6"/>
${limb([[150, 192], [214, 110], [258, 168]], MACHINE, 20)}
<path d="M246,160 L280,168 L274,204 L250,206 Z" fill="${MACHINE}"/>
<path d="M252,206 l2,9 M260,206 l2,9 M268,205 l2,9" fill="none" stroke-width="4"/>
<circle cx="240" cy="222" r="5" fill="#8B5A2B"/><circle cx="232" cy="210" r="4" fill="#8B5A2B"/>`,
    },
    bulldozer: {
        name: 'Bulldozer', caption: 'Under construction',
        art: `<path d="M12,264 C18,228 46,218 64,236 V264 Z" fill="#8B5A2B"/>
<path d="M64,166 Q50,212 64,258 L86,258 L86,168 Z" fill="${MACHINE}"/>
${limb([[86, 214], [124, 206]], '#3A3A3A', 10)}
<rect x="108" y="226" width="178" height="36" rx="18" fill="#3A3A3A"/>
${[128, 160, 192, 224, 256].map(x => `<circle cx="${x}" cy="244" r="9" fill="#8F9AA5"/>`).join('')}
<rect x="116" y="168" width="156" height="60" rx="8" fill="${MACHINE}"/>
<path d="M126,186 H176 M126,200 H176 M126,214 H176" fill="none" stroke="#B88700" stroke-width="4"/>
<rect x="148" y="128" width="12" height="42" fill="#3A3A3A"/>
<circle cx="158" cy="112" r="10" fill="#D9D9D9"/><circle cx="174" cy="96" r="13" fill="#D9D9D9"/><circle cx="194" cy="82" r="9" fill="#D9D9D9"/>
<path d="M196,170 V112 H262 V170" fill="none" stroke-width="12"/>
<path d="M196,170 V112 H262 V170" fill="none" stroke="${MACHINE}" stroke-width="5"/>
<rect x="204" y="120" width="50" height="40" fill="#CDE9FF" fill-opacity="0.75" stroke="none"/>`,
    },
    barrier: {
        name: 'Work in progress', caption: 'Under construction',
        // The lamp on top blinks.
        style: '.bl{animation:bl 1.2s steps(1,end) infinite}@keyframes bl{0%{fill:#FFC93C}50%{fill:#7A5A10}}@media (prefers-reduced-motion:reduce){*{animation:none!important}}',
        art: `<defs><pattern id="st" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="11" height="22" fill="${VEST}"/></pattern></defs>
<path d="M62,264 L90,118 L118,264 M182,264 L210,118 L238,264" fill="none" stroke-width="14"/>
<path d="M62,264 L90,118 L118,264 M182,264 L210,118 L238,264" fill="none" stroke="#8F9AA5" stroke-width="7"/>
${[132, 190].map(y => `<rect x="30" y="${y}" width="240" height="34" rx="4" fill="#fff"/><rect x="30" y="${y}" width="240" height="34" rx="4" fill="url(#st)" stroke="none"/><rect x="30" y="${y}" width="240" height="34" rx="4" fill="none"/>`).join('\n')}
<rect x="138" y="100" width="24" height="32" rx="4" fill="#3A3A3A"/>
<circle class="bl" cx="150" cy="90" r="16" fill="#FFC93C"/>
<path d="M120,74 L110,64 M180,74 L190,64 M150,62 V48" fill="none" stroke-width="4"/>`,
    },
    siteme: {
        name: 'Me, on site', caption: 'Under construction',
        under: `<rect x="128" y="142" width="44" height="60" fill="${SKIN}"/>
<path d="M54,282 C54,168 246,168 246,282 Z" fill="${VEST}"/>
<path d="M72,230 H228 M64,258 H236" fill="none" stroke="#F4F4F4" stroke-width="9"/>
<path d="M120,186 L150,214 L180,186" fill="none" stroke="#B85A10" stroke-width="5"/>`,
        raw: myHead(150, 102, 56),
        art: `<circle cx="150" cy="102" r="56" fill="none"/>
<path d="M94,74 A56,56 0 0 1 206,74 Z" fill="${HAT}"/>
<rect x="84" y="68" width="132" height="11" rx="5" fill="${HAT}"/>
<path d="M150,22 V70" fill="none" stroke="#E0A800" stroke-width="5"/>
<rect x="200" y="182" width="66" height="88" rx="6" fill="#C68642"/>
<rect x="208" y="196" width="50" height="66" fill="#fff"/>
<rect x="220" y="176" width="26" height="14" rx="3" fill="#8F9AA5"/>
<path d="M216,212 H250 M216,226 H250 M216,240 H240" fill="none" stroke-width="3"/>
<circle cx="204" cy="236" r="12" fill="${SKIN}"/>`,
    },
    handshake: {
        name: 'Nice to meet you', caption: 'Networking',
        art: `${person({ x: 90, skin: '#E0AC69', top: '#2E9BF6', arms: [[[72, 150], [62, 186], [68, 214]], [[110, 150], [128, 186], [146, 196]]] })}
${person({ x: 210, skin: '#8D5524', top: '#F7941D', dress: true, longHair: true, arms: [[[228, 150], [238, 186], [232, 214]], [[190, 150], [172, 186], [154, 196]]] })}
<circle cx="150" cy="196" r="10" fill="#B87A58"/>
<rect x="76" y="160" width="20" height="13" rx="2" fill="#fff"/><rect x="214" y="160" width="20" height="13" rx="2" fill="#fff"/>
${bubble(70, 22, 160, 'Nice to meet you!')}`,
    },
    waiting: {
        name: 'Is it ready yet?', caption: 'Networking',
        art: `${person({ x: 62, skin: '#C68642', top: '#3BB273', arms: [[[44, 150], [34, 186], [40, 212]], [[80, 150], [94, 176], [86, 196]]] })}
<rect x="80" y="182" width="16" height="20" rx="3" fill="#fff"/>
${person({ x: 150, skin: '#E0AC69', top: '#E63946', dress: true, longHair: true, hair: '#6B4423', arms: [[[132, 150], [122, 186], [128, 212]], [[168, 150], [178, 176], [168, 192]]] })}
<rect x="160" y="178" width="12" height="20" rx="3" fill="#2B2B2B"/>
${person({ x: 238, skin: '#8D5524', top: '#2E9BF6', arms: [[[220, 150], [210, 186], [216, 212]], [[256, 150], [270, 124], [282, 102]]] })}
${bubble(36, 20, 150, 'Is it ready yet?')}`,
    },
    // People in suits, here to see how it's going.
    suitdeal: {
        name: 'Deal!', caption: 'Suits on site',
        art: `${suit({ x: 90, skin: '#8D5524', arms: [[[72, 150], [62, 180], [62, 204]], [[110, 150], [128, 184], [145, 196]]] })}
${briefcase(62, 204, '#8D5524')}
${suit({ x: 210, skin: '#E0AC69', cloth: '#3A3A3A', tie: null, skirt: true, longHair: true, hair: '#6B4423', arms: [[[228, 150], [238, 186], [232, 214]], [[190, 150], [172, 184], [155, 196]]] })}
${bubble(110, 26, 80, 'Deal!', 20)}`,
    },
    suitvisit: {
        name: 'Site visit', caption: 'Suits on site',
        art: `${suit({ x: 128, skin: '#C68642', cloth: '#5A5F66', tie: '#2E9BF6', hat: true, arms: [[[146, 150], [170, 142], [186, 118]], [[110, 150], [96, 176], [86, 196]]] })}
<rect x="34" y="176" width="54" height="74" rx="6" fill="#C68642"/>
<rect x="41" y="189" width="40" height="54" fill="#fff"/>
<rect x="50" y="170" width="22" height="12" rx="3" fill="#8F9AA5"/>
<path d="M47,203 H75 M47,216 H75 M47,229 H68" fill="none" stroke-width="3"/>
<circle cx="86" cy="196" r="7" fill="#C68642"/>
${bubble(172, 40, 100, 'Looking good!', 13)}`,
    },
    suitwalk: {
        name: 'On my way!', caption: 'Suits on site',
        art: `${suit({ x: 150, skin: '#E0AC69', cloth: '#1F2A44', tie: '#F2A900', hair: '#3B2A1A',
            legs: [[[141, 196], [124, 228], [118, 260]], [[159, 196], [172, 226], [186, 258]]],
            arms: [[[134, 150], [118, 178], [108, 200]], [[166, 150], [184, 138], [168, 118]]] })}
${briefcase(108, 200, '#E0AC69')}
<rect x="165" y="100" width="12" height="24" rx="3" fill="#2B2B2B"/>
<circle cx="168" cy="118" r="7" fill="#E0AC69"/>
${bubble(186, 34, 92, 'On my way!', 14)}`,
    },
    suitplans: {
        name: 'Big plans', caption: 'Suits on site',
        art: `${suit({ x: 62, skin: '#8D5524', cloth: '#7A1F3D', tie: null, skirt: true, longHair: true, arms: [[[44, 150], [36, 186], [42, 212]], [[80, 150], [92, 168], [100, 178]]] })}
${suit({ x: 238, skin: '#E0AC69', cloth: '#2B3A55', tie: '#F2A900', arms: [[[256, 150], [264, 186], [258, 212]], [[220, 150], [208, 168], [200, 178]]] })}
<rect x="96" y="140" width="108" height="78" fill="#2E6FD8"/>
<path d="M112,204 V172 L134,156 L156,172 V204 Z M166,204 V160 H192 V204 M172,172 H186 M172,186 H186 M126,204 V188 H142 V204" fill="none" stroke="#fff" stroke-width="3"/>
<path d="M104,148 H196" fill="none" stroke="#9CC2FF" stroke-width="2" stroke-dasharray="6 5"/>
<ellipse cx="96" cy="179" rx="8" ry="39" fill="#255CB8"/><ellipse cx="204" cy="179" rx="8" ry="39" fill="#255CB8"/>
<circle cx="100" cy="178" r="7" fill="#8D5524"/><circle cx="200" cy="178" r="7" fill="#E0AC69"/>`,
    },
};

// Clostra's bees while the page is being built (Clostra's brand): bees building honeycomb,
// filling and capping cells, dancing, and flying in with pollen, nectar and wax. Not
// scratch-off: scripts/sticker-crew.js moves them about, so the flyers need no speed lines.
// A bee facing right, body centred on (x, y); flip turns it to face left.
const beeFig = (x, y, s = 1, { flip = false } = {}) => `<g transform="translate(${x},${y}) scale(${flip ? -s : s},${s})">
<ellipse cx="-8" cy="-34" rx="18" ry="28" transform="rotate(-24 -8 -34)" fill="#EAF6FF"/>
<ellipse cx="14" cy="-36" rx="18" ry="28" transform="rotate(16 14 -36)" fill="#EAF6FF"/>
<path d="M-12,30 L-16,44 M2,32 L2,46 M16,30 L20,43" fill="none" stroke-width="5"/>
<path d="M-42,-2 L-58,2 L-42,8 Z" fill="#1F1F1F"/>
<ellipse cx="0" cy="0" rx="44" ry="32" fill="#FFC93C"/>
<path d="M-20,-29 C-28,-10 -28,10 -20,29 L-8,31 C-16,10 -16,-10 -8,-31 Z M8,-31 C0,-10 0,10 8,31 L20,28 C12,10 12,-10 20,-28 Z" fill="#1F1F1F" stroke-width="3"/>
<ellipse cx="0" cy="0" rx="44" ry="32" fill="none"/>
<path d="M38,-26 Q34,-46 24,-52 M50,-26 Q56,-46 66,-50" fill="none" stroke-width="4"/><circle cx="24" cy="-52" r="4" fill="#1F1F1F"/><circle cx="66" cy="-50" r="4" fill="#1F1F1F"/>
<circle cx="44" cy="-6" r="22" fill="#2B2B2B"/>
<circle cx="52" cy="-8" r="6.5" fill="#fff" stroke-width="2.5"/><circle cx="53.5" cy="-7" r="3" fill="#1F1F1F" stroke="none"/>
<path d="M42,8 Q51,14 60,7" fill="none" stroke="#fff" stroke-width="3"/>
</g>`;
const HONEY = ['#F6B93B', '#F2A900'], WAX = '#F7E3A1';
// Pointy-top honeycomb cells of radius r: [x, y, fill] (fill 'none' = still being built).
const cells = (list, r) => list.map(([x, y, fill]) => `<path d="${hexPath(x, y, r)}" fill="${fill}"/>`).join('');
// Just some edges of a cell, for one a bee is still building.
const partCell = (x, y, r, edges) => {
    const p = i => { const a = Math.PI / 180 * (60 * i - 90); return `${f(x + r * Math.cos(a))},${f(y + r * Math.sin(a))}`; };
    return `<path d="M${p(0)}${Array.from({ length: edges }, (_, i) => ` L${p(i + 1)}`).join('')}" fill="none"/>`;
};
const BEES = {
    combbuild: {
        name: 'Building the comb', caption: 'Busy bees',
        art: `${cells([[80, 70, HONEY[0]], [125, 70, HONEY[1]], [170, 70, 'none'], [102.5, 109, HONEY[1]], [147.5, 109, HONEY[0]], [192.5, 109, 'none'], [80, 148, HONEY[0]]], 26)}
${partCell(125, 148, 26, 4)}${partCell(170, 148, 26, 2)}
<ellipse cx="158" cy="196" rx="6" ry="3.5" fill="${WAX}"/><ellipse cx="140" cy="208" rx="5" ry="3" fill="${WAX}"/><ellipse cx="176" cy="214" rx="4" ry="2.5" fill="${WAX}"/>
${beeFig(232, 196, 0.62, { flip: true })}`,
    },
    combfill: {
        name: 'Filling it with honey', caption: 'Busy bees',
        art: `${cells([[105, 196, HONEY[1]], [195, 196, HONEY[0]], [127.5, 235, HONEY[0]], [172.5, 235, HONEY[1]]], 26)}
<path d="${hexPath(150, 196, 26)}" fill="${WAX}"/>
<path d="M150,206 m-14,0 a14,8 0 0 0 28,0 Z" fill="#F2A900" stroke="none"/>
<path d="M150,120 C160,136 160,148 150,150 C140,148 140,136 150,120 Z" fill="#F2A900" stroke-width="4"/>
${beeFig(150, 70, 0.6)}`,
    },
    combcap: {
        name: 'Capping the cells', caption: 'Busy bees',
        art: `${cells([[83, 150, WAX], [128, 150, WAX], [173, 150, HONEY[1]], [218, 150, HONEY[0]], [105.5, 189, WAX], [150.5, 189, WAX], [195.5, 189, HONEY[1]], [128, 228, WAX], [173, 228, WAX]], 26)}
${[[83, 150], [128, 150], [105.5, 189], [150.5, 189], [128, 228], [173, 228]].map(([x, y]) => `<path d="M${x - 10},${y - 4} Q${x},${y - 12} ${x + 10},${y - 4}" fill="none" stroke="#FFFBEA" stroke-width="3"/>`).join('')}
${beeFig(176, 92, 0.6)}`,
    },
    beecomb: {
        name: 'Honeycomb going up', caption: 'Busy bees',
        art: `${[[91, 238], [150, 238], [209, 238], [120.5, 187], [179.5, 187]].map(([x, y], i) => `<path d="${hexPath(x, y, 34)}" fill="${HONEY[i % 2]}"/>`).join('')}
<path d="M84,250 C84,262 92,264 92,272 C92,280 80,280 80,272 C80,264 84,262 84,250 Z" fill="#F2A900"/>
<path d="${hexPath(150, 128, 30)}" fill="${HONEY[0]}"/>
<path d="M132,104 L138,92 M168,104 L162,92" fill="none" stroke-width="4"/>
${beeFig(150, 60, 0.55)}`,
    },
    beedance: {
        name: 'Waggle dance', caption: 'Busy bees',
        art: `${cells([[60, 70, WAX], [105, 70, HONEY[0]], [195, 70, WAX], [240, 70, HONEY[1]], [60, 230, HONEY[1]], [105, 230, WAX], [195, 230, HONEY[0]], [240, 230, WAX]], 24)}
<path d="M150,150 C150,96 74,96 74,150 C74,204 150,204 150,150 C150,96 226,96 226,150 C226,204 150,204 150,150 Z" fill="none" stroke-width="3" stroke-dasharray="7 9"/>
<g transform="rotate(-30 150 150)">${beeFig(150, 150, 0.6)}</g>`,
    },
    hivebusy: {
        name: 'Busy hive', caption: 'Busy bees',
        art: `<path d="M70,250 C70,150 104,84 150,84 C196,84 230,150 230,250 Z" fill="#E8B04B"/>
<path d="M78,220 Q150,236 222,220 M86,186 Q150,200 214,186 M98,152 Q150,164 202,152 M116,120 Q150,130 184,120" fill="none" stroke-width="4"/>
<path d="M130,250 V232 Q150,212 170,232 V250 Z" fill="#3B2A14"/>
<rect x="52" y="246" width="196" height="18" rx="5" fill="#A0612B"/>
<path d="M190,236 Q226,226 236,192 M110,236 Q72,214 70,178" fill="none" stroke-width="2.5" stroke-dasharray="5 7"/>
${miniBee(244, 168)}${miniBee(62, 150)}${miniBee(196, 66)}`,
    },
    flowerbee: {
        name: 'Gathering nectar', caption: 'Busy bees',
        art: `<path d="M150,170 C152,206 146,236 150,268" fill="none" stroke="#3E8E2B" stroke-width="10"/>
<path d="M150,236 C124,238 104,224 96,204 C122,200 142,214 150,236 Z" fill="#6DBE45"/>
<path d="M152,214 C178,214 198,200 206,180 C180,176 160,190 152,214 Z" fill="#6DBE45"/>
${Array.from({ length: 8 }, (_, i) => { const a = i * 45, r = a * Math.PI / 180, x = f(150 + Math.sin(r) * 46), y = f(150 - Math.cos(r) * 46); return `<ellipse cx="${x}" cy="${y}" rx="18" ry="30" transform="rotate(${a} ${x} ${y})" fill="#E879A6"/>`; }).join('')}
<circle cx="150" cy="150" r="30" fill="#FFD23F"/>
${beeFig(156, 112, 0.55)}`,
    },
    pollenbee: {
        name: 'Pollen run', caption: 'Busy bees',
        art: `<circle cx="138" cy="206" r="17" fill="#FFB020"/><circle cx="168" cy="210" r="17" fill="#FFB020"/>
${beeFig(156, 152, 0.95)}`,
    },
    nectarbee: {
        name: 'Nectar delivery', caption: 'Busy bees',
        art: `<path d="M140,166 L134,190 M160,166 L166,190" fill="none" stroke-width="4"/>
<path d="M150,182 C176,218 182,240 168,256 C158,266 142,266 132,256 C118,240 124,218 150,182 Z" fill="#F2A900"/>
<path d="M140,224 C136,236 138,246 146,252" fill="none" stroke="#FFD66B" stroke-width="5"/>
${beeFig(150, 120, 0.9, { flip: true })}`,
    },
    waxbee: {
        name: 'Fresh wax', caption: 'Busy bees',
        art: `<path d="M140,152 L134,176 M160,152 L166,176" fill="none" stroke-width="4"/>
<path d="${hexPath(150, 214, 40)}" fill="${WAX}"/>
<path d="${hexPath(150, 214, 24)}" fill="none" stroke="#E8C66A" stroke-width="4"/>
${beeFig(150, 108, 0.85)}`,
    },
};

// Ten stickers for each holiday (tools/holiday-stickers.js), as sets named like the days in
// scripts/holiday.js.
const HOLIDAYS = require('./holiday-stickers.js')({ f, star, person, BLACK });

// Which stickers each page draws from. Home takes one from `ghana` and two from `world`; About
// one each from `knicks`, `united`, `ghana` and `world`; the phone page adds a project and any city; each
// case study its own set; Projects mixes every project's. On a holiday every page draws from
// that holiday's set instead (scripts/sticker.js).
const isGhana = id => /Ghana$/.test(LANDMARKS[id].city);
const SETS = {
    cities: Object.keys(LANDMARKS),
    ghana: Object.keys(LANDMARKS).filter(isGhana),
    world: Object.keys(LANDMARKS).filter(id => !isGhana(id)),
    knicks: Object.keys(KNICKS),
    united: Object.keys(UNITED),
    construction: Object.keys(CONSTRUCTION),
    bees: Object.keys(BEES),
    clostra: ['bee', 'honey', 'honeycomb', 'beehive', 'dipper', 'sunflower', 'smoker', 'beekeeper'],
    lign: ['bus', 'trafficlight', 'busstop', 'ticket', 'road', 'cone', 'routemap', 'busapp'],
    cropcare: ['wateringcan', 'trowel', 'seedling', 'wheelbarrow', 'rake', 'shears', 'leafcheck', 'carrot'],
    ontrack: ['workout', 'running', 'cycling', 'yoga', 'salad', 'swimming',
        'sneaker', 'stopwatch', 'bottle', 'kettlebell', 'medal', 'heartrate', 'jumprope'],
    roster: ['network', 'namebadge', 'coffee', 'businesscard', 'goldengate', 'newyork', 'london', 'dubai', 'tokyo', 'paris'],
};
SETS.projects = Object.keys(PROJECT_ITEMS);
for (const [day, items] of Object.entries(HOLIDAYS)) SETS[day] = Object.keys(items);

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
    PROJECT_ITEMS, KNICKS, UNITED, CONSTRUCTION, BEES, ...Object.values(HOLIDAYS));

fs.mkdirSync(OUT, { recursive: true });
const ROUGH = '<g filter="url(#rough)" stroke="#000" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">';
for (const [id, s] of Object.entries(ALL)) {
    fs.writeFileSync(path.join(OUT, `${id}.svg`),
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
<defs>${DEFS}</defs>${s.style ? `\n<style>${s.style}</style>` : ''}
<g filter="url(#diecut)">${s.under ? `${ROUGH}\n${s.under}\n</g>` : ''}${s.raw || ''}${ROUGH}
${s.art}
</g></g>
</svg>
`);
}

// Labels and per-page sets for scripts/sticker.js (a script, not JSON, so it also loads
// when a page is opened straight from disk).
fs.writeFileSync(path.join(OUT, 'stickers.js'), '// Generated by tools/build-stickers.js\nwindow.STICKERS = ' + JSON.stringify({
    // Pages load the PNG render (sharper on phones), or the SVG for animated stickers.
    items: Object.fromEntries(Object.entries(ALL).map(([id, s]) => [id, { name: s.name, caption: s.caption, file: id + (s.style ? '.svg' : '.png') }])),
    sets: SETS,
    // Sets that only come out on their holiday.
    holidays: Object.keys(HOLIDAYS),
}, null, 4) + ';\n');

const TITLES = { ghana: 'Ghana (Home & About)', world: 'World cities (Home & About)', knicks: 'Knicks (About)', united: 'Manchester United (About)', construction: 'Construction crew (Roster)', bees: 'Bee crew (Clostra)', clostra: 'Clostra', lign: 'Lign', cropcare: 'Crop Care', ontrack: 'OnTrack', roster: 'Roster',
    birthday: 'My birthday (29 Nov)', newyear: 'New Year (31 Dec to 2 Jan)', valentine: 'Valentine’s Day (14 Feb)', 'ghana-independence': 'Independence Day (6 Mar)', easter: 'Easter (Good Friday to Easter Monday)', halloween: 'Halloween (31 Oct)', christmas: 'Christmas (24 to 26 Dec)' };
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
