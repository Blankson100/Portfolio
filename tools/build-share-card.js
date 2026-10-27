// Builds the share cards in share-cards/ (1200x630 each): the picture X, WhatsApp, LinkedIn
// and iMessage show when someone shares a link to the site. Each is Home in small: the avatar,
// the name, "I Make things.", the three project cards and the strip of flyers along the
// bottom, drawn with the site's own BB.css, avatar.js and holiday.js so it matches the site
// on that day. everyday.jpg has the bees and the avatar's everyday look (clear glasses,
// earring); each holiday's card (named as in scripts/holiday.js) has that day's outfit, its
// wish in the thought bubble and its flyers. Previews show one frame, so the flyers stand
// still. api/share-card.js picks the card for the day.
// Run: node tools/build-share-card.js (needs `npm install` in tools/ once, and Chrome).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');
const puppeteer = require('puppeteer-core');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'share-cards');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
// Laid out at Home's own sizes on a 600x315 page, then drawn at twice that.
const W = 600, H = 315, SCALE = 2;

// Which day each card shows (an evening, so the glasses are clear and he's awake). The
// everyday card is early in a month, before the beard starts to grow.
const CARDS = {
    everyday: '2026-10-05T19',
    halloween: '2026-10-31T19',
    christmas: '2026-12-25T19',
    newyear: '2027-01-01T19',
    valentine: '2027-02-14T19',
    'ghana-independence': '2027-03-06T19',
    easter: '2027-03-28T19',
};

// Home's avatar (with its scalloped clip and outline), fonts and footer of bees.
const bb = fs.readFileSync(path.join(ROOT, 'BB.html'), 'utf8');
const avatar = bb.match(/<div class="profile-avatar-wrap">[\s\S]*?<\/svg>\s*<\/div>/)[0];
const fonts = bb.match(/<link href="https:\/\/fonts\.googleapis\.com[^>]+>|<link href="https:\/\/api\.fontshare\.com[^>]+>/g).join('\n');
const footer = bb.match(/<footer class="bee-end"[\s\S]*?<\/footer>/)[0];

const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<base href="${pathToFileURL(ROOT).href}/">
${fonts}
<link rel="stylesheet" href="BB.css">
<script src="scripts/holiday.js"></script>
<style>
html, body { width: ${W}px; height: ${H}px; overflow: hidden; }
body { opacity: 1 !important; margin: 0; background: #F0F0F0; }
.share-me { position: absolute; left: 34px; top: 74px; }
.share-name { font-size: 23px; line-height: 1.15; margin-top: 14px; }
.share-role { font-size: 16px; color: var(--muted); margin-top: 3px; }
.share-line { font-family: 'Bodoni Moda', serif; font-size: 15px; margin-top: 12px; }
.share-cards { position: absolute; left: 272px; top: 22px; width: 620px; display: flex; flex-wrap: wrap; gap: 20px; transform: scale(0.474); transform-origin: 0 0; }
/* The flyers a little bigger than on the page, so they still show in a small preview. */
.share-strip { position: absolute; left: 0; right: 0; bottom: 0; }
.share-strip .bee-end { height: 54px; }
.share-strip .bee-end .bee-1 { left: 14%; top: 2px; width: 92px; }
.share-strip .bee-end .bee-2 { left: 66%; top: 14px; width: 72px; }
.share-strip .bee-end .firework { top: 4px; width: 46px; height: 46px; margin-left: -23px; }
</style></head><body>
<div class="share-me">
    ${avatar}
    <div class="share-name">Akornor Blankson</div>
    <div class="share-role">Product Design</div>
    <div class="share-line">I Make things.</div>
</div>
<div class="share-cards">
    <div class="leafAi"><div class="grid-container"></div></div>
    <div class="Lign"><div class="grid-container"></div></div>
    <div class="IncFig"><div class="grid-container"></div></div>
</div>
<div class="share-strip">${footer}</div>
<script src="scripts/avatar.js"></script>
</body></html>`;

(async () => {
    fs.mkdirSync(OUT, { recursive: true });
    const file = path.join(os.tmpdir(), 'share-card.html');
    fs.writeFileSync(file, html);
    const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
    for (const [name, date] of Object.entries(CARDS)) {
        const page = await browser.newPage();
        // Reduced motion holds every flyer still, wings and all, with the fireworks burst.
        await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
        await page.setViewport({ width: W, height: H, deviceScaleFactor: SCALE * 2 });
        await page.goto(pathToFileURL(file).href + '?avatarDate=' + date, { waitUntil: 'networkidle0' });
        await page.evaluate(() => document.fonts.ready);
        // The thought bubble pops up a moment after the page opens.
        if (name !== 'everyday') await page.waitForSelector('.avatar-bubble', { timeout: 5000 });
        await new Promise(r => setTimeout(r, 1500));
        const shot = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H } });
        await page.close();
        await sharp(shot).resize(W * SCALE, H * SCALE).jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(OUT, name + '.jpg'));
        console.log(`wrote share-cards/${name}.jpg (${Math.round(fs.statSync(path.join(OUT, name + '.jpg')).size / 1024)} KB)`);
    }
    await browser.close();
    fs.unlinkSync(file);
})().catch(e => { console.error(e); process.exit(1); });
