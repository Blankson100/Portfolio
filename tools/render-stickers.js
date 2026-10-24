// Renders each sticker SVG in /stickers to a 400x400 PNG beside it. The SVGs' marker wobble
// and die-cut border are SVG filters, which Safari draws at low resolution, so the pages
// use these PNGs instead (Chrome renders the filters at full resolution here). Animated
// stickers (those with a <style>) stay SVG so they keep moving.
// Run after build-stickers.js: node tools/render-stickers.js, or name sets or stickers to render
// just those (node tools/render-stickers.js halloween ghost).
// Needs `npm install` in tools/ once, and Chrome (set CHROME to its path if it's elsewhere).
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const puppeteer = require('puppeteer-core');
const sharp = require('sharp');

const OUT = path.join(__dirname, '..', 'stickers');
const SIZE = 400;
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

// Sets named on the command line stand for their stickers (from the stickers.js the build wrote).
const STICKERS = (() => { const w = {}; new Function('window', fs.readFileSync(path.join(OUT, 'stickers.js'), 'utf8'))(w); return w.STICKERS; })();
const ONLY = process.argv.slice(2).flatMap(name => STICKERS.sets[name] || [name]);

(async () => {
    const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
    const page = await browser.newPage();
    // The SVGs are 300x300, so this scale gives 400x400 pixels.
    await page.setViewport({ width: 300, height: 300, deviceScaleFactor: SIZE / 300 });
    let count = 0;
    for (const file of fs.readdirSync(OUT).filter(f => f.endsWith('.svg') && (!ONLY.length || ONLY.includes(f.slice(0, -4))))) {
        const svg = path.join(OUT, file);
        if (fs.readFileSync(svg, 'utf8').includes('<style>')) continue;
        await page.goto(pathToFileURL(svg).href, { waitUntil: 'load' });
        const shot = await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: 300, height: 300 } });
        await sharp(shot).png({ compressionLevel: 9, effort: 10 }).toFile(svg.replace(/\.svg$/, '.png'));
        count++;
    }
    await browser.close();
    console.log(`rendered ${count} sticker PNGs`);
})().catch(e => { console.error(e); process.exit(1); });
