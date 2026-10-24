// Draws the two stickers beside Projects on the phone homepage, styled like a printed vinyl
// sticker kit. They're always uncovered and stay where they are; the page adds the soft
// shadow, like the other stickers. Each suits both the light and the dark page.
// - stickers/tap-on-projects.png: a long, vibrant cobalt oval with a thick white die-cut
//   edge, "tap on" in a serif and "projects" in a larger italic, and a faint gloss.
// - stickers/dont-just-read.png: a lemon-yellow label with a black outline, a pair of
//   cartoon eyes glancing across at the other sticker, and "don't just read" in a bold
//   grotesk. It's drawn flat: scripts/peel.js tilts it and peels its top-right corner,
//   which visitors can drag.
// Rendered in Chrome (for the fonts).
// Run: node tools/build-projects-stickers.js (needs `npm install` in tools/ once).
const path = require('path');
const puppeteer = require('puppeteer-core');
const sharp = require('sharp');

const OUT = path.join(__dirname, '..', 'stickers');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const SCALE = 3;
const FONTS = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@700&display=block';

// A faint gloss across the top of the vinyl.
const GLOSS = `<linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.22"/>
        <stop offset="0.45" stop-color="#FFFFFF" stop-opacity="0.04"/>
        <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>`;

// "tap on projects": the oval, two and a half times as wide as it is tall.
const TAP = (() => {
    const W = 226, H = 110, RX = 100, RY = 40;
    return { file: 'tap-on-projects.png', W, H, fonts: ["24px 'Instrument Serif'", "italic 36px 'Instrument Serif'"], svg: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
    ${GLOSS}
    <clipPath id="oval"><ellipse cx="0" cy="0" rx="${RX}" ry="${RY}"/></clipPath>
</defs>
<g transform="translate(113 55) rotate(-7)">
    <!-- The white die-cut edge: the same shape underneath with a wide rounded white outline -->
    <ellipse cx="0" cy="0" rx="${RX}" ry="${RY}" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="13"/>
    <ellipse cx="0" cy="0" rx="${RX}" ry="${RY}" fill="#2B57E8"/>
    <rect x="${-RX}" y="${-RY}" width="${RX * 2}" height="${RY * 2}" fill="url(#gloss)" clip-path="url(#oval)"/>
    <g fill="#FFFFFF" text-anchor="middle">
        <text x="-18" y="-5" font-family="'Instrument Serif', serif" font-size="24">tap on</text>
        <text x="0" y="24" font-family="'Instrument Serif', serif" font-style="italic" font-size="36">projects</text>
    </g>
</g>
</svg>` };
})();

// "don't just read": the label is drawn flat and square-on, in its own space (0,0 to
// 190,72) with room round it (the -15,-20 to 205,92 view scripts/peel.js uses too); the
// page tilts it and peels its corner live.
const READ = (() => {
    const W = 220, H = 112, LW = 190, LH = 72, R = 14, EDGE = 6;
    return { file: 'dont-just-read.png', W, H, fonts: ["700 22px 'Space Grotesk'"], svg: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-15 -20 ${W} ${H}" width="${W}" height="${H}">
<defs>
    ${GLOSS}
    <clipPath id="label"><rect width="${LW}" height="${LH}" rx="${R}"/></clipPath>
</defs>
    <!-- The white die-cut edge, then the yellow label with its black outline -->
    <rect width="${LW}" height="${LH}" rx="${R}" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="${EDGE * 2}"/>
    <rect width="${LW}" height="${LH}" rx="${R}" fill="#F3EE5E" stroke="#0B0B0B" stroke-width="2.6"/>
    <rect width="${LW}" height="${LH}" fill="url(#gloss)" clip-path="url(#label)"/>
    <!-- A pair of eyes, glancing across at the other sticker -->
    <g fill="none" stroke="#0B0B0B" stroke-width="2.6" stroke-linecap="round">
        <path d="M12,17 Q22,11 32,16"/>
        <path d="M39,16 Q49,11 59,17"/>
    </g>
    <g fill="#FFFFFF" stroke="#0B0B0B" stroke-width="2.8">
        <ellipse cx="22" cy="39" rx="12" ry="15"/>
        <ellipse cx="49" cy="39" rx="12" ry="15"/>
    </g>
    <circle cx="27" cy="41" r="6.5" fill="#0B0B0B"/>
    <circle cx="54" cy="41" r="6.5" fill="#0B0B0B"/>
    <circle cx="29.5" cy="38" r="2" fill="#FFFFFF"/>
    <circle cx="56.5" cy="38" r="2" fill="#FFFFFF"/>
    <g fill="#0B0B0B" font-family="'Space Grotesk', sans-serif" font-weight="700" font-size="22" letter-spacing="-0.3">
        <text x="74" y="31">don’t</text>
        <text x="74" y="57">just read</text>
    </g>
</svg>` };
})();

(async () => {
    const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
    for (const s of [TAP, READ]) {
        const page = await browser.newPage();
        await page.setViewport({ width: s.W, height: s.H, deviceScaleFactor: SCALE });
        await page.setContent(`<!doctype html><html><head>
<link href="${FONTS}" rel="stylesheet">
<style>html,body{margin:0;background:transparent}svg{display:block}</style></head>
<body>${s.svg}</body></html>`, { waitUntil: 'load' });
        await page.evaluate(() => document.fonts.ready);
        for (const f of s.fonts) {
            if (!(await page.evaluate(font => document.fonts.check(font), f))) throw new Error(`${f} did not load`);
        }
        const shot = await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: s.W, height: s.H } });
        await sharp(shot).png({ compressionLevel: 9, effort: 10 }).toFile(path.join(OUT, s.file));
        console.log(`wrote stickers/${s.file} ${s.W * SCALE}x${s.H * SCALE}`);
        await page.close();
    }
    await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
