// Tiny soft previews of the big cover images (about half a kilobyte each), shown the moment
// a phone page opens while the full original downloads over them. The originals are never
// changed. Writes tools/cover-previews.json, which tools/build-case-studies.js reads.
// Run after adding or changing a cover: node tools/build-previews.js
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const COVERS = ['OnTrack Cover.png', 'ProtoHand lightLeaf.png', 'ProtoHand DarkLeaf.png', 'Lign Cover.png', 'Clostra Cover.png', 'Rooster Cover.png'];

(async () => {
    const out = {};
    for (const file of COVERS) {
        const buf = await sharp(path.join(ROOT, file)).resize({ width: 32 }).webp({ quality: 60 }).toBuffer();
        out[file] = 'data:image/webp;base64,' + buf.toString('base64');
        console.log(file.padEnd(26), buf.length + ' bytes');
    }
    fs.writeFileSync(path.join(__dirname, 'cover-previews.json'), JSON.stringify(out, null, 2) + '\n');
})().catch(e => { console.error(e); process.exit(1); });
