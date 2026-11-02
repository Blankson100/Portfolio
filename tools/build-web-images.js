// Web copies of the site's big images, in web/ (same names and folders, as .webp), which the
// pages show instead of the originals: a few hundred kilobytes rather than several megabytes,
// so covers appear in about a second on 4G. The originals are never changed.
// Widths: images are shown at most 602px wide on computers, 382px on phones and 700px in an
// enlarged view, so 1400px stays sharp on retina screens (2x) and iPhones (3x); the photo
// behind the avatar is shown at 75px.
// Run after adding or changing one of these images: node tools/build-web-images.js
// (only images whose original changed are redone). Needs `npm install` in tools/ once.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const WIDE = 1400;
const IMAGES = {
    'OnTrack Cover.png': WIDE, 'Clostra Cover.png': WIDE, 'Rooster Cover.png': WIDE, 'Lign Cover.png': WIDE,
    'ProtoHand lightLeaf.png': WIDE, 'ProtoHand DarkLeaf.png': WIDE,
    'Crop Care Cover.png': WIDE, 'image0.png': WIDE, 'Buzz Bees.png': WIDE,
    'OnTrack run.png': WIDE, 'Bees Project.png': WIDE,
    'OnTrack Card.png': WIDE, 'Lign Card Light.png': WIDE, 'Lign Card Dark.png': WIDE, 'crop card cloud.png': WIDE, 'Crop Card cloud dark.png': WIDE,
    'LF1.png': WIDE,
    'case-studies/crop-care-cover.png': WIDE,
    'case-studies/crop-care-getting-started.png': WIDE, 'case-studies/crop-care-scan.png': WIDE, 'case-studies/crop-care-result.png': WIDE,
    'case-studies/crop-care-not-sure.png': WIDE, 'case-studies/crop-care-history.png': WIDE,
    'case-studies/inform-setup-home.png': WIDE, 'case-studies/inform-logging.png': WIDE,
    'human.jpg': 240,
};

// Where an image's web copy lives, as the pages refer to it.
const webPath = file => 'web/' + file.replace(/\.(png|jpe?g)$/i, '.webp');
module.exports = { IMAGES, webPath };

if (require.main === module) (async () => {
    let made = 0, kept = 0;
    for (const [file, width] of Object.entries(IMAGES)) {
        const src = path.join(ROOT, file), out = path.join(ROOT, webPath(file));
        if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs) { kept++; continue; }
        fs.mkdirSync(path.dirname(out), { recursive: true });
        await sharp(src).resize({ width, withoutEnlargement: true }).webp({ quality: 88, effort: 6 }).toFile(out);
        console.log(`${file.padEnd(44)} ${(fs.statSync(src).size / 1024).toFixed(0).padStart(6)} KB -> ${(fs.statSync(out).size / 1024).toFixed(0).padStart(4)} KB`);
        made++;
    }
    console.log(`${made} web copies made, ${kept} already up to date`);
})().catch(e => { console.error(e); process.exit(1); });
