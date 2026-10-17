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
const DOWNLOAD_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19.5h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

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
    const project = p.project + (dark ? 'Dark' : '') + '.html';
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
    <link rel="stylesheet" href="BB.css">${dark ? '\n    <link rel="stylesheet" href="bbdark.css">' : ''}
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
            <li><a href="${dark ? 'aboutDark' : 'about'}.html">About</a></li>
        </ul>
    </nav>
    <div id="content">
        <div class="project-page-container">
            <div class="project-layout">
                <div class="project-sidebar">
                    <button class="back-button" onclick="smartBack()">${BACK_ICON}<span>Back</span></button>
${sections.map(id => `                    <a href="#${id}">${LABELS[id]}</a>`).join('\n')}
                    <a class="cs-download" href="${c.pdf}" download="${esc(c.pdfName)}">${DOWNLOAD_ICON}<span>Download PDF</span></a>
                </div>
                <main class="project-main">
            <p class="hero-title-standalone">${esc(c.name)} · Full case study</p>
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
    <footer class="footer">
        <p>© 2025 • Nyame Dua Inc • the body is finally at rest.</p>
        <div class="footer-icons">
            <img src="xxx.svg" alt="X" width="24" height="24">
            <img src="Linkedin.svg" alt="LinkedIn" width="24" height="24">
        </div>
    </footer>
    <script>
        // Back returns to this case study's project page: back through history when we came
        // straight from it (so it opens where it was left), otherwise to it in this mode.
        function smartBack() {
            const project = '${project}';
            const from = document.referrer.split(/[?#]/)[0].split('/').pop().toLowerCase();
            if (from === '${p.project.toLowerCase()}.html' || from === '${p.project.toLowerCase()}dark.html') {
                history.back();
                return;
            }
            const params = new URLSearchParams(window.location.search);
            window.fadeNavigate(project + '?from=' + (params.get('from') || 'projects'));
        }

        function updateTime() {
            const now = new Date();
            let hours = now.getHours() % 12;
            hours = hours ? hours : 12;
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const ampm = now.getHours() >= 12 ? 'pm' : 'am';
            document.getElementById('time-location').innerHTML = String(hours).padStart(2, '0') + ':' + minutes + ' ' + ampm + ' in Accra, Ghana';
        }
        updateTime();
        setInterval(updateTime, 60000);

        // Mode switching: the same case study in the other mode.
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(function (btn, index) {
            btn.addEventListener('click', function () {
                modeButtons.forEach(function (b) { b.classList.remove('active'); });
                this.classList.add('active');
                window.fadeNavigate((index === 0 ? '${darkPage}' : '${light}') + window.location.search);
            });
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
    <script src="stickers/stickers.js"></script>
    <script src="scripts/sticker.js" data-set="${p.stickers}" data-count="6"></script>
</body>
</html>
`;
}

for (const key of Object.keys(PAGES)) {
    for (const dark of [false, true]) {
        const name = PAGES[key].file + (dark ? 'Dark' : '') + '.html';
        fs.writeFileSync(path.join(ROOT, name), page(key, dark));
        console.log('wrote ' + name);
    }
}
