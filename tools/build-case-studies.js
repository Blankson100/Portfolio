// Builds the full case study pages, a light and a dark one per project, from the text in
// tools/case-study-content.js. Each page opens with the case study's cover, then the six
// sections and the references, with the sections listed in the sidebar (highlighted as you
// read) and the original PDF to download. "View Full Case Study" on each project page
// links here; Back returns to that project page.
// Run: node tools/build-case-studies.js
const fs = require('fs');
const path = require('path');
const CONTENT = require('./case-study-content');

const ROOT = path.join(__dirname, '..');
const PAGES = {   // content key: the page's file name, its project page, its stickers
    cropcare: { file: 'cropcare-case-study', project: 'leafai', stickers: 'cropcare' },
    ontrack: { file: 'ontrack-case-study', project: 'ontrack', stickers: 'ontrack' },
    lign: { file: 'lign-case-study', project: 'LignTransport', stickers: 'lign' },
};
const LABELS = {   // sidebar names for the sections, as on the project pages
    introduction: 'Introduction', 'the-problem': 'The Problem', 'the-app': 'The App', 'design-process': 'Design Process',
    challenges: 'Challenges', 'whats-next': "What's Next", references: 'References',
};

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// **bold**, _italic_ and [text](url); links open in a new tab.
function inline(s) {
    const links = [];
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, text, url) => { links.push([text, url]); return `\u0000${links.length - 1}\u0000`; });
    s = esc(s)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[\s(])_(.+?)_(?=[\s.,;:()]|$)/g, '$1<em>$2</em>');
    return s.replace(/\u0000(\d+)\u0000/g, (m, i) => `<a href="${esc(links[i][1])}" target="_blank" rel="noopener">${esc(links[i][0])}</a>`);
}
// The markup in case-study-content.js to HTML, and the list of sections for the sidebar.
// A PNG's width and height, read from its header, so the page saves the image's space
// before it loads.
function pngSize(file) {
    const head = fs.readFileSync(path.join(ROOT, file)).subarray(16, 24);
    return [head.readUInt32BE(0), head.readUInt32BE(4)];
}
function render(body) {
    const sections = [];
    let html = '', open = false, afterImage = false;
    for (const block of body.trim().split(/\n\s*\n/)) {
        const lines = block.split('\n').map(l => l.trim());
        const h2 = block.match(/^## (.+?) \{#([\w-]+)\}$/);
        const caption = afterImage && /^_[^_]+_$/.test(block);   // an italic line straight under an image
        afterImage = /^!\[/.test(block);
        if (caption) {
            html += `                <p class="cs-caption">${esc(block.slice(1, -1))}</p>\n`;
        } else if (h2) {
            if (open) html += '            </section>\n';
            sections.push(h2[2]);
            html += `            <section class="toc-section cs-section${h2[2] === 'references' ? ' cs-refs' : ''}" id="${h2[2]}">\n                <h2>${inline(h2[1])}</h2>\n`;
            open = true;
        } else if (/^!\[[^\]]*\]\([^)\s]+\)$/.test(block)) {
            const [, alt, src] = block.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
            const [w, h] = pngSize(src);
            html += `                <img class="cs-shot" src="${esc(src)}" alt="${esc(alt)}" width="${w}" height="${h}" loading="lazy" decoding="async">\n`;
        } else if (block.startsWith('### ')) {
            html += `                <h3>${inline(block.slice(4))}</h3>\n`;
        } else if (block.startsWith('@meta ')) {
            html += `                <p class="cs-meta">${block.slice(6).split(' | ').map(i => `<span>${inline(i)}</span>`).join('')}</p>\n`;
        } else if (lines.every(l => l.startsWith('- '))) {
            html += `                <ul>\n${lines.map(l => `                    <li>${inline(l.slice(2))}</li>\n`).join('')}                </ul>\n`;
        } else if (lines.every(l => /^\d+\. /.test(l))) {
            html += `                <ol>\n${lines.map(l => `                    <li>${inline(l.replace(/^\d+\. /, ''))}</li>\n`).join('')}                </ol>\n`;
        } else {
            html += `                <p>${inline(lines.join(' '))}</p>\n`;
        }
    }
    if (open) html += '            </section>\n';
    return { html, sections };
}

const BACK_ICON = '<svg width="16" height="16" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5.06836 12.1833C5.06836 12.4187 5.17038 12.6542 5.35086 12.8268L10.5301 17.9982C10.7185 18.1787 10.9225 18.265 11.1501 18.265C11.6445 18.265 12.0054 17.9119 12.0054 17.4332C12.0054 17.1821 11.9113 16.9702 11.7465 16.8133L9.98082 15.0241L7.70508 12.9445L9.53352 13.0544H19.0445C19.5625 13.0544 19.9234 12.6934 19.9234 12.1833C19.9234 11.6654 19.5625 11.3044 19.0445 11.3044H9.53352L7.71293 11.4143L9.98082 9.33472L11.7465 7.54551C11.9113 7.38857 12.0054 7.17669 12.0054 6.92557C12.0054 6.44688 11.6445 6.09375 11.1501 6.09375C10.9225 6.09375 10.7106 6.18007 10.5066 6.37626L5.35086 11.532C5.17038 11.7046 5.06836 11.94 5.06836 12.1833Z" fill="currentColor"/></svg>';
const PREV_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5v14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M19 5.5v13L9 12z" fill="currentColor"/></svg>';
const NEXT_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 5v14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M5 5.5v13L15 12z" fill="currentColor"/></svg>';
const STOP_ICON ='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const DOWNLOAD_ICON ='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19.5h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Layout as on the project pages (fixed sidebar, 602px column), then the reading styles.
const STYLE = `
        #content {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }
        html {
            scroll-behavior: smooth;
        }
        .project-page-container {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            width: 100%;
            margin: 90px 0 100px;
            flex: 1;
        }
        .project-layout {
            width: 100%;
        }
        .project-sidebar {
            width: 140px;
            position: fixed;
            left: 70px;
            top: 90px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .project-sidebar a {
            font-family: Satoshi, sans-serif;
            font-size: 15px;
            color: #a8a8a8;
            text-decoration: none;
            transition: color 0.3s var(--transition-easing);
        }
        .project-sidebar a:hover,
        .project-sidebar a.active {
            color: #0b0b0b;
        }
        .back-button {
            height: 24px;
            background: none;
            border: none;
            padding: 0;
            margin-bottom: 4px;
            font-size: 15px;
            line-height: 24px;
            font-family: Satoshi, sans-serif;
            color: #a8a8a8;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: color 0.3s var(--transition-easing);
        }
        .back-button:hover {
            color: #0b0b0b;
        }
        .project-sidebar .cs-download {
            margin-top: 12px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .project-main {
            width: 602px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }
        .hero-title-standalone {
            font-family: Satoshi, sans-serif;
            font-weight: 500;
            font-size: 16px;
            line-height: 24px;
            color: #000000;
            margin: 0 0 16px 0;
        }
        /* The case study's cover, its title, then the reading */
        .cs-cover {
            display: block;
            width: 100%;
            height: auto;
            border-radius: 42px;
            margin: 0 0 40px;
        }
        .cs-title {
            font-family: Satoshi, sans-serif;
            font-weight: 700;
            font-size: 32px;
            line-height: 1.25;
            color: #0b0b0b;
            margin: 0;
        }
        .cs-subtitle {
            font-family: Satoshi, sans-serif;
            font-style: italic;
            font-size: 18px;
            line-height: 1.6;
            color: #666666;
            margin: 8px 0 0;
        }
        .cs-head {
            margin-bottom: 40px;
        }
        .cs-section {
            width: 100%;
            margin-bottom: 48px;
            scroll-margin-top: 110px;
        }
        .cs-section:last-child {
            margin-bottom: 0;
        }
        .cs-section h2 {
            font-family: Satoshi, sans-serif;
            font-weight: 700;
            font-size: 24px;
            line-height: 1.3;
            color: #0b0b0b;
            margin: 0 0 12px;
        }
        .cs-section h3 {
            font-family: Satoshi, sans-serif;
            font-weight: 700;
            font-size: 18px;
            line-height: 1.4;
            color: #0b0b0b;
            margin: 32px 0 8px;
        }
        .cs-section p,
        .cs-section li {
            font-family: Satoshi, sans-serif;
            font-size: 16px;
            line-height: 1.8;
            color: #666666;
        }
        .cs-section p {
            margin: 0 0 16px;
        }
        .cs-section ul,
        .cs-section ol {
            margin: 0 0 16px;
            padding-left: 22px;
        }
        .cs-section li {
            margin-bottom: 8px;
            padding-left: 4px;
        }
        .cs-section li::marker {
            color: #a8a8a8;
        }
        .cs-section strong {
            font-weight: 700;
            color: #0b0b0b;
        }
        .cs-section a {
            color: #0b0b0b;
            text-decoration: underline;
            text-decoration-color: rgba(11, 11, 11, 0.3);
            text-underline-offset: 3px;
            overflow-wrap: anywhere;
            transition: text-decoration-color 0.3s var(--transition-easing);
        }
        .cs-section a:hover {
            text-decoration-color: currentColor;
        }
        /* Screens from the app, as in the PDF: on black, rounded like the cover */
        .cs-shot {
            display: block;
            width: 100%;
            height: auto;
            border-radius: 42px;
            background: #000000;
            margin: 8px 0 24px;
        }
        .cs-section .cs-caption {
            margin: -12px 0 24px;
            font-size: 14px;
            line-height: 1.6;
            font-style: italic;
            color: #8a8a8a;
        }
        body.dark-mode .cs-section .cs-caption {
            color: #888888;
        }
        .cs-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 4px 24px;
        }
        .cs-refs li,
        .cs-refs p {
            font-size: 14px;
            line-height: 1.7;
        }
        body.dark-mode .project-sidebar a {
            color: #777777;
        }
        body.dark-mode .back-button {
            color: #777777;
        }
        body.dark-mode .project-sidebar a:hover,
        body.dark-mode .project-sidebar a.active,
        body.dark-mode .back-button:hover,
        body.dark-mode .hero-title-standalone,
        body.dark-mode .cs-title,
        body.dark-mode .cs-section h2,
        body.dark-mode .cs-section h3,
        body.dark-mode .cs-section strong,
        body.dark-mode .cs-section a {
            color: #f5f5f5;
        }
        body.dark-mode .cs-subtitle,
        body.dark-mode .cs-section p,
        body.dark-mode .cs-section li {
            color: #aaaaaa;
        }
        body.dark-mode .cs-section li::marker {
            color: #777777;
        }
        body.dark-mode .cs-section a {
            text-decoration-color: rgba(245, 245, 245, 0.35);
        }
        body.dark-mode .cs-section a:hover {
            text-decoration-color: currentColor;
        }
        /* Download the case study: under the title, and again at the end. Black like the
           "View Full Case Study" button (white in dark mode), with the file's size. */
        .cs-download-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            height: 42px;
            padding: 0 18px;
            border-radius: 14px;
            background: #000000;
            color: #ffffff;
            font-family: Satoshi, sans-serif;
            font-size: 15px;
            line-height: 20px;
            white-space: nowrap;
            text-decoration: none;
            transition: opacity 0.3s var(--transition-easing);
        }
        .cs-download-btn:hover {
            opacity: 0.8;
        }
        .cs-download-btn span {
            opacity: 0.6;
        }
        .cs-head .cs-download-btn {
            margin-top: 20px;
        }
        .cs-end {
            width: 100%;
            margin-top: 48px;
            padding-top: 32px;
            border-top: 1px solid #dddddd;
        }
        .cs-end p {
            font-family: Satoshi, sans-serif;
            font-size: 16px;
            line-height: 1.8;
            color: #666666;
            margin: 0 0 16px;
        }
        body.dark-mode .cs-download-btn {
            background: #ffffff;
            color: #000000;
        }
        body.dark-mode .cs-end {
            border-top-color: #2a2a2a;
        }
        body.dark-mode .cs-end p {
            color: #aaaaaa;
        }
        /* Listen: the case study read aloud (scripts/case-read-aloud.js), from the top of the
           page and from the sidebar. The paragraph being read is highlighted. */
        .cs-top {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 16px;
        }
        .cs-top .hero-title-standalone {
            margin: 0;
        }
        /* This row stays pinned at the top (over the top blur) as the page scrolls, so Listen
           and, while it reads, Pause, back, on and stop are always in reach. */
        .cs-top {
            position: sticky;
            top: 26px;
            z-index: 60;
        }
        /* One pill until it's pressed; then it splits like a drop of liquid: it squishes, the
           round buttons (back a paragraph, on a paragraph, stop) pull out of it one after
           another and snap off with a little bounce, and it shrinks to Pause. Stopping melts
           them back in. The shapes are drawn on a layer behind the buttons (.cs-listen-blobs,
           kept in step by scripts/case-read-aloud.js) through a "goo" filter that joins them
           while they're close; at rest the filter is off, so the edges stay crisp. */
        .cs-listen {
            --blob: #ffffff;
            --ink: #0b0b0b;
            position: relative;
            display: flex;
            align-items: center;
        }
        .cs-listen.is-open {
            --blob: #000000;
            --ink: #ffffff;
        }
        .cs-goo {
            position: absolute;
        }
        .cs-listen-blobs {
            position: absolute;
            inset: -20px;
            pointer-events: none;
        }
        .cs-listen.is-morphing .cs-listen-blobs {
            filter: url(#cs-goo);
        }
        .cs-listen-blobs span {
            position: absolute;
            border-radius: 999px;
            background: var(--blob);
            transition: background 0.3s var(--transition-easing);
        }
        .cs-listen-btn,
        .cs-listen-more {
            position: relative;
            z-index: 1;
            height: 34px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            border: 0;
            border-radius: 999px;
            -webkit-appearance: none;
            appearance: none;
            background: transparent;
            color: var(--ink);
            font-family: Satoshi, sans-serif;
            font-size: 14px;
            white-space: nowrap;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
        }
        .cs-listen-btn {
            padding: 0 14px;
            overflow: hidden;
            transition: color 0.3s var(--transition-easing), width 0.45s var(--transition-easing), transform 0.15s ease;
        }
        .cs-listen-btn:active {
            transform: scale(0.94);
        }
        .cs-listen-more {
            flex: none;
            width: 34px;
            margin-left: -34px;
            padding: 0;
            visibility: hidden;
            transition: margin-left 0.45s cubic-bezier(0.5, 0, 0.75, 0) var(--dc, 0s), color 0.3s, visibility 0s linear 0.6s;
        }
        .cs-listen.is-open .cs-listen-more {
            margin-left: 8px;
            visibility: visible;
            transition: margin-left 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) var(--d, 0s), color 0.3s, visibility 0s;
        }
        .cs-listen-more svg {
            flex: none;
            opacity: 0;
            transform: scale(0.3) rotate(-30deg);
            transition: opacity 0.15s ease, transform 0.2s ease;
        }
        .cs-listen.is-open .cs-listen-more svg {
            opacity: 1;
            transform: none;
            transition: opacity 0.25s ease calc(var(--d, 0s) + 0.2s), transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) calc(var(--d, 0s) + 0.15s);
        }
        .cs-listen.is-open .cs-listen-more:hover svg {
            transform: scale(1.18);
        }
        .cs-listen-btn[hidden],
        .cs-listen-side[hidden] {
            display: none;
        }
        .cs-listen-time {
            opacity: 0.55;
        }
        .project-sidebar .cs-listen-side {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 0;
            border: 0;
            background: none;
            font-family: Satoshi, sans-serif;
            font-size: 15px;
            color: #a8a8a8;
            cursor: pointer;
            transition: color 0.3s var(--transition-easing);
        }
        .project-sidebar .cs-listen-side:hover,
        .project-sidebar .cs-listen-side.is-active {
            color: #0b0b0b;
        }
        .cs-listen-side .cs-listen-time {
            display: none;
        }
        .cs-reading {
            background: rgba(255, 201, 60, 0.22);
            box-shadow: 0 0 0 6px rgba(255, 201, 60, 0.22);
            border-radius: 6px;
            transition: background 0.3s ease, box-shadow 0.3s ease;
        }
        body.dark-mode .cs-listen {
            --blob: #161616;
            --ink: #f5f5f5;
        }
        body.dark-mode .cs-listen.is-open {
            --blob: #ffffff;
            --ink: #000000;
        }
        @media (prefers-reduced-motion: reduce) {
            .cs-listen-btn,
            .cs-listen-more,
            .cs-listen.is-open .cs-listen-more,
            .cs-listen-more svg,
            .cs-listen.is-open .cs-listen-more svg {
                transition: none;
            }
            .cs-listen.is-morphing .cs-listen-blobs {
                filter: none;
            }
        }
        body.dark-mode .project-sidebar .cs-listen-side {
            color: #777777;
        }
        body.dark-mode .project-sidebar .cs-listen-side:hover,
        body.dark-mode .project-sidebar .cs-listen-side.is-active {
            color: #f5f5f5;
        }
        body.dark-mode .cs-reading {
            background: rgba(255, 201, 60, 0.16);
            box-shadow: 0 0 0 6px rgba(255, 201, 60, 0.16);
        }`;

// The PDF's size for the download button: "3.6 MB" or "232 KB".
function fileSize(file) {
    const bytes = fs.statSync(path.join(ROOT, file)).size;
    return bytes >= 1048576 ? (bytes / 1048576).toFixed(1) + ' MB' : Math.round(bytes / 1024) + ' KB';
}

function page(key, dark) {
    const c = CONTENT[key], p = PAGES[key];
    const { html, sections } = render(c.body);
    const download = `<a class="cs-download-btn" href="${c.pdf}" download="${esc(c.pdfName)}">${DOWNLOAD_ICON}Download case study <span>PDF · ${fileSize(c.pdf)}</span></a>`;
    const light = p.file + '.html', darkPage = p.file + 'Dark.html';
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(c.title)} - PortoBlknszzz</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&family=Libre+Barcode+39&display=swap" rel="stylesheet">
    <link rel="preconnect" href="https://api.fontshare.com">
    <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="BB.css">
    <link rel="stylesheet" href="bbdark.css"><!-- only styles body.dark-mode: loaded in both modes so switching is instant -->
    <script src="scripts/screen-switch.js"></script>
    <script src="scripts/reveal.js"></script>
    <script src="scripts/analytics.js"></script>
    <script src="scripts/page-fade.js"></script>
    <!-- Built by tools/build-case-studies.js from tools/case-study-content.js: edit those, not this file. -->
    <style>${STYLE}
    </style>
</head>
<body${dark ? ' class="dark-mode"' : ''}>
    <div class="grad-blur" aria-hidden="true"><div></div><div></div><div></div><div></div><div></div><div></div><span class="grad-blur-grain"></span></div>
    <div class="time-location-display" id="time-location"></div>
    <div class="right-pill">
        <div class="mode-container">
            <button class="mode-btn${dark ? ' active' : ''}" title="Dark Mode"><img src="Darkmode.svg" alt="Dark"></button>
            <button class="mode-btn${dark ? '' : ' active'}" title="Light Mode"><img src="BrightMode.svg" alt="Light"></button>
        </div>
    </div>
    <nav class="navbar">
        <ul class="nav-menu">
            <li id="nav-home"><a href="${dark ? 'BBDark' : 'BB'}.html">Home</a></li>
            <li id="nav-projects"><a href="${dark ? 'projectsDark' : 'projects'}.html">Projects</a></li>
            <li id="nav-about"><a href="${dark ? 'aboutDark' : 'about'}.html">About</a></li>
        </ul>
    </nav>
    <div id="content">
        <div class="project-page-container">
            <div class="project-layout">
                <div class="project-sidebar">
                    <button class="back-button" onclick="smartBack()">${BACK_ICON}<span>Back</span></button>
${sections.map(id => `                    <a href="#${id}">${LABELS[id]}</a>`).join('\n')}
                    <a class="cs-download" href="${c.pdf}" download="${esc(c.pdfName)}">${DOWNLOAD_ICON}<span>Download PDF</span></a>
                    <button type="button" class="cs-listen-side" data-read-aloud>Listen</button>
                </div>
                <main class="project-main">
            <div class="cs-top">
                <p class="hero-title-standalone">${esc(c.name)} · Full case study</p>
                <div class="cs-listen" data-read-controls>
                    <svg class="cs-goo" width="0" height="0" aria-hidden="true"><filter id="cs-goo"><feGaussianBlur stdDeviation="5"/><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"/></filter></svg>
                    <div class="cs-listen-blobs" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
                    <button type="button" class="cs-listen-btn" data-read-aloud>Listen</button>
                    <button type="button" class="cs-listen-more" style="--d: 0s; --dc: 0.16s" data-read-prev aria-label="Back a paragraph" tabindex="-1">${PREV_ICON}</button>
                    <button type="button" class="cs-listen-more" style="--d: 0.09s; --dc: 0.08s" data-read-next aria-label="On a paragraph" tabindex="-1">${NEXT_ICON}</button>
                    <button type="button" class="cs-listen-more" style="--d: 0.18s; --dc: 0s" data-read-stop aria-label="Stop reading" tabindex="-1">${STOP_ICON}</button>
                </div>
            </div>
            <img class="cs-cover" src="${c.cover}" alt="${esc(c.coverAlt)}" width="1588" height="2246">
            <header class="cs-head">
                <h1 class="cs-title">${esc(c.title)}</h1>${c.subtitle ? `\n                <p class="cs-subtitle">${esc(c.subtitle)}</p>` : ''}
                ${download}
            </header>
${html}            <div class="cs-end">
                <p>Want to keep it or share it? Download the full case study as a PDF.</p>
                ${download}
            </div>
                </main>
            </div>
        </div>
    </div>
${M_BEE}
    <script>
        // Back returns to this case study's project page: back through history when we came
        // straight from it (so it opens where it was left), otherwise to it in this mode.
        function smartBack() {
            const project = '${p.project}' + (document.body.classList.contains('dark-mode') ? 'Dark' : '') + '.html';
            const from = document.referrer.split(/[?#]/)[0].split('/').pop().toLowerCase();
            if (from === '${p.project.toLowerCase()}.html' || from === '${p.project.toLowerCase()}dark.html') {
                history.back();
                return;
            }
            const params = new URLSearchParams(window.location.search);
            window.fadeNavigate(project + '?from=' + (params.get('from') || 'projects'));
        }

        function updateTime() {
            // The time in Accra, whatever the visitor's own time zone is.
            const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Accra', hour: 'numeric', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
            const hour = parseInt(parts.find(p => p.type === 'hour').value, 10), minute = parts.find(p => p.type === 'minute').value;
            document.getElementById('time-location').innerHTML = String(hour % 12 || 12).padStart(2, '0') + ':' + minute + ' ' + (hour >= 12 ? 'pm' : 'am') + ' in Accra, Ghana';
        }
        updateTime();
        setInterval(updateTime, 60000);

        // Mode switching happens in place, with the same blur crossfade as moving between pages,
        // so a case study being read aloud keeps talking and the place on the page stays. The
        // address becomes the other mode's page, so reloading or sharing it keeps the mode, and
        // the menu points at that mode's pages.
        const modeButtons = document.querySelectorAll('.mode-btn');
        const MENU = { 'nav-home': ['BB.html', 'BBDark.html'], 'nav-projects': ['projects.html', 'projectsDark.html'], 'nav-about': ['about.html', 'aboutDark.html'] };
        function setMode(dark) {
            if (document.body.classList.contains('dark-mode') === dark) return;
            function apply() {
                document.body.classList.toggle('dark-mode', dark);
                modeButtons[0].classList.toggle('active', dark);
                modeButtons[1].classList.toggle('active', !dark);
                Object.keys(MENU).forEach(function (id) {
                    document.querySelector('#' + id + ' a').setAttribute('href', MENU[id][dark ? 1 : 0]);
                });
                history.replaceState(history.state, '', (dark ? '${darkPage}' : '${light}') + location.search + location.hash);
                document.dispatchEvent(new Event('modechange'));
            }
            if (document.startViewTransition) document.startViewTransition(apply);
            else apply();
        }
        modeButtons.forEach(function (btn, index) {
            btn.addEventListener('click', function () { setMode(index === 0); });
        });

        // The menu shows where the visit came from: Home, or Projects.
        (function () {
            const from = new URLSearchParams(window.location.search).get('from');
            const home = from === 'home' || (!from && /bb(dark)?\\.html/.test(document.referrer.toLowerCase()));
            document.getElementById(home ? 'nav-home' : 'nav-projects').classList.add('nav-item-active');
        })();

        // The sidebar highlights the section being read.
        (function () {
            const sections = document.querySelectorAll('.cs-section');
            const links = document.querySelectorAll('.project-sidebar a[href^="#"]');
            function onScroll() {
                let current = null;
                sections.forEach(function (s) { if (s.getBoundingClientRect().top <= 150) current = s.id; });
                if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = sections[sections.length - 1].id;
                links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + current); });
            }
            window.addEventListener('scroll', onScroll, { passive: true });
            window.addEventListener('pageshow', onScroll);
            onScroll();
        })();
    </script>
    <script src="scripts/case-read-aloud.js"></script>
    <script src="stickers/stickers.js"></script>
    <script src="scripts/sticker.js" data-set="${p.stickers}" data-count="6"></script>
</body>
</html>
`;
}

// Phone pages, in the style of the phone homepage (portfolio-mobile-light/dark.html and
// mobile.css), with Back pinned top left and the moon/sun switch top right (scripts/mobile-page.js
// changes mode in place). Every project in the homepage list gets one, under its name and
// tagline from that list:
// - a project page (file): the desktop project page's sections, read from it so the two stay
//   the same: cover, Introduction, The Problem, The App (its video and "See how it works"),
//   the Design Process notebook, Challenges as rows, and the link to
// - the full case study (studyFile, from tools/case-study-content.js): the case study as
//   writing, with Listen and the PDF;
// - or, for a project still being built (crew), its cover with the crew from
//   scripts/sticker-crew.js working around it, sized for the phone.
// Pauses between sections give the scratch-off stickers somewhere to sit.
const PHONE = [
    { home: 'InForm', project: 'ontrack', file: 'inform-mobile', study: 'ontrack', studyFile: 'inform-case-study-mobile' },
    { home: 'Crop Care', project: 'leafai', file: 'cropcare-mobile', study: 'cropcare', studyFile: 'cropcare-case-study-mobile' },
    { home: 'Lign', project: 'LignTransport', file: 'lign-transport-mobile', study: 'lign', studyFile: 'lign-case-study-mobile' },
    { home: 'Clostra', project: 'clostra', file: 'clostra-mobile', crew: 'bees' },
    { home: 'Roster', project: 'roster', file: 'roster-mobile', crew: 'construction' },
];
const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a6.6 6.6 0 0 0 10.7 10.7z"/></svg>';
const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/></svg>';
const LEFT_ARROW = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
const RIGHT_ARROW = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const PAUSE = '<div class="m-pause" aria-hidden="true"></div>\n';
const both = name => ({ light: name + '.html', dark: name + 'Dark.html' });
// A link or image that follows the mode: href/src for this mode, the other in data-*.
const modal = (attr, pair, dark) => `${attr}="${dark ? pair.dark : pair.light}" data-light="${pair.light}" data-dark="${pair.dark}"`;
const textOf = s => s.replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

// Each project's name and tagline as the phone homepage lists them.
const HOME_ROWS = {};
fs.readFileSync(path.join(ROOT, 'portfolio-mobile-light.html'), 'utf8')
    .replace(/<(?:div|a) class="m-item[^"]*"[^>]*>\s*<h3 class="m-title">([\s\S]*?)<\/h3>\s*<p class="m-desc">([\s\S]*?)<\/p>/g, (m, t, d) => { HOME_ROWS[textOf(t)] = textOf(d); return m; });

function mobileShell({ title, dark, pages, back, body, scripts, extraHead = '', bodyClass = '' }) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(title)} - PortoBlknszzz</title>
    <link rel="preconnect" href="https://api.fontshare.com">
    <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,501&display=swap" rel="stylesheet">${extraHead}
    <link rel="stylesheet" href="BB.css">
    <link rel="stylesheet" href="mobile.css">
    <script src="scripts/screen-switch.js"></script>
    <script src="scripts/reveal.js"></script>
    <script src="scripts/analytics.js"></script>
    <script src="scripts/page-fade.js"></script>
    <!-- Built by tools/build-case-studies.js: edit the desktop project page or tools/case-study-content.js, then rebuild. -->
</head>
<body class="m-page m-case${bodyClass}${dark ? ' dark-mode' : ''}" data-light-page="${pages.light}" data-dark-page="${pages.dark}">
    <button type="button" class="m-mode" aria-label="Switch to ${dark ? 'light' : 'dark'} mode" data-sticker-avoid>${dark ? SUN : MOON}</button>
    <a class="m-back" ${modal('href', back.pair, dark)} data-sticker-avoid>${LEFT_ARROW}<span>${esc(back.label)}</span></a>
    <main class="m-main" id="top">
${body}    </main>
${M_BEE}
    <script src="scripts/mobile-page.js"></script>
${scripts}
</body>
</html>
`;
}
// The end of every page in place of a footer: two tiny stick-drawn bees flying across a thin
// strip, each with a dotted trail and little Zs (BB.css animates them; the same drawing is
// pasted into the hand-written pages).
const M_BEE = `    <footer class="bee-end" aria-hidden="true" data-sticker-avoid>
        <svg class="bee bee-1" viewBox="0 -12 92 52" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
            <path class="bee-trail" d="M3 31 C11 31 14 21 21 24 S27 35 33 29 S38 21 42 23" stroke-dasharray="1.5 3.5"/>
            <g class="bee-fly">
                <g class="bee-wing"><ellipse cx="51" cy="9.8" rx="4.4" ry="6.6" transform="rotate(-24 51 9.8)"/></g>
                <g class="bee-wing bee-wing-2"><ellipse cx="57.6" cy="9" rx="4.4" ry="6.6" transform="rotate(18 57.6 9)"/></g>
                <ellipse cx="55" cy="22" rx="9" ry="6.4"/>
                <path d="M52 16.2 Q50 22 52 27.8 M57 16 Q55 22 57 28"/>
                <path d="M46 22 L42.8 22.9"/>
                <circle cx="66.6" cy="21" r="3.6"/>
                <circle cx="67.8" cy="20.2" r="0.7" fill="currentColor" stroke="none"/>
                <path d="M67.5 17.6 Q68.6 13.8 71.6 13 M65.6 17.5 Q65.4 13.6 67.6 12.2"/>
            </g>
            <path class="bee-z" d="M74 5.5 h3.2 L74 8.7 h3.2"/>
            <path class="bee-z bee-z-2" d="M79 -1.5 h4.2 L79 2.7 h4.2"/>
            <path class="bee-z bee-z-3" d="M85 -10 h5.2 L85 -4.8 h5.2"/>
        </svg>
        <svg class="bee bee-2" viewBox="0 -12 92 52" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
            <path class="bee-trail" d="M3 31 C11 31 14 21 21 24 S27 35 33 29 S38 21 42 23" stroke-dasharray="1.5 3.5"/>
            <g class="bee-fly">
                <g class="bee-wing"><ellipse cx="51" cy="9.8" rx="4.4" ry="6.6" transform="rotate(-24 51 9.8)"/></g>
                <g class="bee-wing bee-wing-2"><ellipse cx="57.6" cy="9" rx="4.4" ry="6.6" transform="rotate(18 57.6 9)"/></g>
                <ellipse cx="55" cy="22" rx="9" ry="6.4"/>
                <path d="M52 16.2 Q50 22 52 27.8 M57 16 Q55 22 57 28"/>
                <path d="M46 22 L42.8 22.9"/>
                <circle cx="66.6" cy="21" r="3.6"/>
                <circle cx="67.8" cy="20.2" r="0.7" fill="currentColor" stroke="none"/>
                <path d="M67.5 17.6 Q68.6 13.8 71.6 13 M65.6 17.5 Q65.4 13.6 67.6 12.2"/>
            </g>
            <path class="bee-z" d="M74 5.5 h3.2 L74 8.7 h3.2"/>
            <path class="bee-z bee-z-2" d="M79 -1.5 h4.2 L79 2.7 h4.2"/>
            <path class="bee-z bee-z-3" d="M85 -10 h5.2 L85 -4.8 h5.2"/>
        </svg>
    </footer>`;
const TO_HOME = { label: 'Projects', pair: { light: 'portfolio-mobile-light.html#projects', dark: 'portfolio-mobile-dark.html#projects' } };

// One element from a hand-written page: from its opening tag to the matching close.
function element(html, startTag) {
    const start = html.indexOf(startTag);
    if (start < 0) return null;
    const tag = startTag.match(/^<(\w+)/)[1], re = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'g');
    re.lastIndex = start;
    let depth = 0, m;
    while ((m = re.exec(html))) {
        depth += m[0][1] === '/' ? -1 : 1;
        if (depth === 0) return html.slice(start, m.index + m[0].length);
    }
    return null;
}
const paragraphs = block => {
    const ps = (block.match(/<p\b[^>]*>[\s\S]*?<\/p>/g) || []).map(p => p.replace(/^<p\b[^>]*>/, '<p>'));
    if (ps.length) return ps;
    const text = block.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return text ? [`<p>${text}</p>`] : [];
};

// The header and cover, shared by both kinds of project page. The cover follows the mode.
function mobileTop(entry, dark) {
    const read = d => fs.readFileSync(path.join(ROOT, entry.project + (d ? 'Dark' : '') + '.html'), 'utf8');
    const desk = read(dark);
    const coverOf = page => page.match(/class="project-hero-inner"><img src="([^"]+)" alt="([^"]*)"/);
    const cover = coverOf(desk), other = coverOf(read(!dark));
    const covers = { light: dark ? other[1] : cover[1], dark: dark ? cover[1] : other[1] };
    const tagline = HOME_ROWS[entry.home];
    // While the full cover downloads, a tiny soft preview of it shows underneath (from
    // tools/cover-previews.json; the cover itself is never changed). It follows the mode too.
    const previews = JSON.parse(fs.readFileSync(path.join(__dirname, 'cover-previews.json'), 'utf8'));
    const prev = { light: previews[covers.light] || '', dark: previews[covers.dark] || '' };
    const img = `<img class="m-cover" ${modal('src', covers, dark)} alt="${esc(cover[2])}" fetchpriority="high"`
        + (prev.light ? ` style="background-image: url(${dark ? prev.dark : prev.light})" data-preview-light="${prev.light}" data-preview-dark="${prev.dark}"` : '')
        + ' data-sticker-avoid>';
    return {
        desk,
        // The cover starts downloading as soon as the page arrives.
        preload: `\n    <link rel="preload" as="image" href="${esc(dark ? covers.dark : covers.light)}" fetchpriority="high">`,
        header: `        <header class="m-header">
            <h1 class="m-name">${esc(entry.home)}</h1>${tagline ? `\n            <p class="m-role">${esc(tagline)}</p>` : ''}
        </header>
`,
        cover: entry.crew ? `        <div class="project-hero m-hero">${img}</div>\n` : `        ${img}\n`,
    };
}

function mobileProjectPage(entry, dark) {
    const top = mobileTop(entry, dark), desk = top.desk;
    const section = id => element(desk, `<div class="toc-section" id="${id}">`);
    const heading = s => textOf((s.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || [, ''])[1]);
    const out = [];
    for (const id of ['introduction', 'the-problem', 'the-app', 'design-process', 'challenges']) {
        const s = section(id);
        if (!s) continue;
        let inner = '';
        if (id === 'the-app') {
            const video = (s.match(/<div class="case-video"[^>]*><\/div>/) || [''])[0].replace('></div>', ' data-sticker-avoid></div>');
            const how = textOf((s.match(/<div class="see-how-title">([\s\S]*?)<\/div>/) || [, ''])[1]);
            const desc = element(s, '<div class="see-how-desc">') || '';
            inner = `                ${video}\n${how ? `                <h3>${how}</h3>\n` : ''}${paragraphs(desc).map(x => `                ${x}\n`).join('')}`;
        } else if (id === 'design-process') {
            // Its cards have blank paper, so stickers are told to keep off it.
            const notebook = (element(s, '<div class="notebook') || '').replace(/^<div class="notebook([^"]*)"/, '<div class="notebook$1" data-sticker-avoid');
            inner = `                ${notebook}\n`;
        } else if (id === 'challenges') {
            // The table as rows: each challenge, and the response under it.
            const cells = (s.match(/<span class="chg-cell(?! chg-head)[^"]*">[\s\S]*?<\/span>|<span class="chg-text chg-text-body"[^>]*>[\s\S]*?<\/span>/g) || []).map(textOf);
            const rows = [];
            for (let i = 0; i + 1 < cells.length; i += 2) rows.push(`                    <div class="m-chg-row"><p class="m-chg-q">${cells[i]}</p><p class="m-chg-a">${cells[i + 1]}</p></div>`);
            inner = `                <div class="m-chg">\n${rows.join('\n')}\n                </div>\n`;
        } else {
            inner = paragraphs(element(s, '<div class="toc-content">') || '').map(x => `                ${x}\n`).join('');
        }
        if (id === 'the-app' || id === 'challenges') out.push('        ' + PAUSE);
        out.push(`        <section class="cs-section" id="${id}">\n                <h2>${heading(s)}</h2>\n${inner}        </section>\n`);
    }
    // The way into the full case study, with the line from the desktop card.
    const cta = textOf((desk.match(/<p class="cta-compact-text">([\s\S]*?)<\/p>/) || [, ''])[1]);
    out.push('        ' + PAUSE);
    out.push(`        <section class="cs-section" id="whats-next">
                <h2>Full case study</h2>
${cta ? `                <p>${cta}</p>\n` : ''}                <a class="m-act m-go" ${modal('href', both(entry.studyFile), dark)}>Read the full case study ${RIGHT_ARROW}</a>
        </section>
`);
    return mobileShell({
        title: entry.home, dark, pages: both(entry.file), back: TO_HOME,
        extraHead: top.preload + '\n    <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap" rel="stylesheet">',
        body: top.header + top.cover + out.join(''),
        scripts: `    <script src="scripts/case-video.js"></script>
    <script src="scripts/notebook-row.js"></script>
    <script src="stickers/stickers.js"></script>
    <script src="scripts/sticker.js" data-set="${PAGES[entry.study].stickers}" data-count="3" data-place="free" data-size="88"></script>`,
    });
}

// A project still being built: its cover with the crew working around it.
function mobileCrewPage(entry, dark) {
    const top = mobileTop(entry, dark);
    return mobileShell({
        title: entry.home, dark, pages: both(entry.file), back: TO_HOME, bodyClass: ' m-wip', extraHead: top.preload,
        body: top.header + top.cover,
        scripts: `    <script src="stickers/stickers.js"></script>
    <script src="scripts/sticker-crew.js" data-crew="${entry.crew}" data-size="84"></script>`,
    });
}

function mobileStudyPage(entry, dark) {
    const c = CONTENT[entry.study];
    let { html } = render(c.body);
    html = html.replace(/<img class="cs-shot"/g, '<img class="cs-shot" data-sticker-avoid');
    ['the-app', 'challenges', 'references'].forEach(function (id) {
        html = html.replace(`<section class="toc-section cs-section${id === 'references' ? ' cs-refs' : ''}" id="${id}">`, PAUSE + '            $&');
    });
    const body = `        <header class="m-header">
            <h1 class="m-name cs-title">${esc(c.title)}</h1>${c.subtitle ? `\n            <p class="m-role">${esc(c.subtitle)}</p>` : ''}
        </header>
        <div class="m-actions" data-sticker-avoid>
            <button type="button" class="m-act" data-read-aloud>Listen</button>
            <button type="button" class="m-act m-act-stop" data-read-stop hidden>${STOP_ICON}<span>Stop</span></button>
            <a class="m-act" href="${c.pdf}" download="${esc(c.pdfName)}">${DOWNLOAD_ICON}<span>PDF</span><span class="cs-listen-time">${fileSize(c.pdf)}</span></a>
        </div>
${html}`;
    return mobileShell({
        title: c.title, dark, pages: both(entry.studyFile),
        back: { label: entry.home, pair: both(entry.file) },
        body,
        scripts: `    <script src="scripts/case-read-aloud.js"></script>
    <script src="stickers/stickers.js"></script>
    <script src="scripts/sticker.js" data-set="${PAGES[entry.study].stickers}" data-count="3" data-place="free" data-size="88"></script>`,
    });
}

const write = (name, html) => { fs.writeFileSync(path.join(ROOT, name), html); console.log('wrote ' + name); };
for (const dark of [false, true]) {
    for (const key of Object.keys(PAGES)) write(PAGES[key].file + (dark ? 'Dark' : '') + '.html', page(key, dark));
    for (const entry of PHONE) {
        if (entry.crew) { write(entry.file + (dark ? 'Dark' : '') + '.html', mobileCrewPage(entry, dark)); continue; }
        write(entry.file + (dark ? 'Dark' : '') + '.html', mobileProjectPage(entry, dark));
        write(entry.studyFile + (dark ? 'Dark' : '') + '.html', mobileStudyPage(entry, dark));
    }
}
