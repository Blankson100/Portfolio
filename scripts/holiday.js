// The holidays the site dresses up for, by the calendar in Accra: New Year (31 Dec to 2 Jan),
// Valentine's Day (14 Feb), Ghana's Independence Day (6 Mar), Easter (Good Friday to Easter
// Monday), Halloween (31 Oct) and Christmas (24 to 26 Dec). On one of them:
//   - the avatar wears the day's outfit and says the wish (scripts/avatar.js),
//   - every scratch-off sticker comes from the day's set (scripts/sticker.js),
//   - the bees at the end of each page make way for the day's flyers: fireworks going off at
//     New Year, hearts on wings for Valentine's Day, black stars trailing the flag's colours on
//     Independence Day, bunnies hopping at Easter, bats at Halloween and reindeer at Christmas
//     (the first with a red nose). They're drawn like the bees and BB.css moves them.
// Preview any day as for the avatar, e.g. ?avatarDate=2026-10-31.
// The share card behind every link preview (api/share-card.js) uses the same calendar: in
// Node this file just hands over holidayOn and accraToday.
(function () {
    // Today's date in Accra, or the date in a "YYYY-MM-DD..." string.
    function accraToday(preview) {
        const m = preview && preview.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (m) return { y: +m[1], m: +m[2], d: +m[3] };
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Africa/Accra', year: 'numeric', month: 'numeric', day: 'numeric'
        }).formatToParts(new Date());
        const get = type => parseInt(parts.find(p => p.type === type).value, 10);
        return { y: get('year'), m: get('month'), d: get('day') };
    }

    // Easter Sunday as a UTC timestamp (anonymous Gregorian algorithm).
    function easterSunday(y) {
        const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
        const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7, n = Math.floor((a + 11 * h + 22 * l) / 451);
        return Date.UTC(y, Math.floor((h + l - 7 * n + 114) / 31) - 1, ((h + l - 7 * n + 114) % 31) + 1);
    }

    // `id` names the avatar's outfit (avatar/<id>.svg) and the sticker set; `hat` = the outfit
    // covers the head, so no nightcap or umbrella alongside it.
    function holidayOn({ y, m, d }) {
        const md = m * 100 + d;
        if (md >= 1231 || md <= 102) return { id: 'newyear', wish: 'Happy New Year!', hat: true };
        if (md >= 1224 && md <= 1226) return { id: 'christmas', wish: 'Merry Christmas!', hat: true };
        if (md === 214) return { id: 'valentine', wish: 'Happy Valentine’s Day!' };
        if (md === 306) return { id: 'ghana-independence', wish: 'Happy Independence Day!' };
        if (md === 1031) return { id: 'halloween', wish: 'Happy Halloween!', hat: true };
        const day = 86400000, now = Date.UTC(y, m - 1, d), easter = easterSunday(y);
        if (now >= easter - 2 * day && now <= easter + day) return { id: 'easter', wish: 'Happy Easter!', hat: true };
        return null;
    }

    if (typeof window === 'undefined') {
        module.exports = { holidayOn: holidayOn, accraToday: accraToday };
        return;
    }

    const holiday = holidayOn(accraToday(new URLSearchParams(window.location.search).get('avatarDate')));
    window.brightHoliday = holiday;
    if (!holiday) return;
    // BB.css keeps the bees hidden from here on, so they never flash up before the flyers.
    document.documentElement.setAttribute('data-holiday', holiday.id);

    // The flyers, on the bees' drawing (viewBox 0 -12 92 52, facing right, a dotted trail
    // behind). .bee/.bee-1/.bee-2 give them the bees' flight across the strip; n is which one.
    const TRAIL = '<path class="bee-trail" d="M3 31 C11 31 14 21 21 24 S27 35 33 29 S38 21 42 23" stroke-dasharray="1.5 3.5"/>';
    const FLYERS = {
        halloween: () => '<path class="bee-trail" d="M3 31 C10 31 12 22 18 25 S24 34 29 29 S34 22 37 24" stroke-dasharray="1.5 3.5"/>'
            + '<g class="bee-fly">'
            + '<g class="bat-wing"><path d="M57 18 C52 12 46 10 40 11 C42 14 42 17 41 20 C44 18.5 46 19 47 21 C49 19.5 51 20 52 22 C54 21 55.5 21 57 22.5 Z"/></g>'
            + '<g class="bat-wing bat-wing-2"><path d="M63 18 C68 12 74 10 80 11 C78 14 78 17 79 20 C76 18.5 74 19 73 21 C71 19.5 69 20 68 22 C66 21 64.5 21 63 22.5 Z"/></g>'
            + '<path d="M58.2 13 L57.6 9.6 L59.7 12.1 M61.8 13 L62.4 9.6 L60.3 12.1"/>'
            + '<circle cx="60" cy="14.6" r="2.6"/><ellipse cx="60" cy="21" rx="2.8" ry="4"/>'
            + '<circle cx="59" cy="14.3" r="0.6" fill="currentColor" stroke="none"/><circle cx="61" cy="14.3" r="0.6" fill="currentColor" stroke="none"/>'
            + '</g>',
        christmas: n => TRAIL + '<g class="bee-fly">'
            + '<g class="deer-legs"><path d="M48.5 25.6 L44.6 29.6 M51 26 L47.8 30.6"/></g>'
            + '<g class="deer-legs deer-legs-2"><path d="M58.4 26.2 L62 30.4 M60.6 25.6 L64.6 29.4"/></g>'
            + '<path d="M45 20.6 L42.6 18.6"/>'
            + '<ellipse cx="53.5" cy="22" rx="9" ry="4.8"/>'
            + '<path d="M60.2 19 L64.6 13.6 M62.4 21.4 L66.6 15.6"/>'
            + '<ellipse cx="67.8" cy="13.4" rx="4.4" ry="2.8" transform="rotate(-10 67.8 13.4)"/>'
            + '<path d="M65.2 11.2 L62.8 10.2 M66 10.8 Q64.8 7 62.4 5 M65.2 8 L62.6 8.4 M68 10.6 Q68.8 6.6 71.2 4 M68.8 7.4 L71.4 8"/>'
            + '<circle cx="68.6" cy="12.4" r="0.6" fill="currentColor" stroke="none"/>'
            + (n === 1 ? '<circle cx="72.4" cy="13" r="1.4" fill="#E63946" stroke="#E63946"/>' : '<circle cx="72.4" cy="13" r="1" fill="currentColor" stroke="none"/>')
            + '</g>',
        valentine: () => TRAIL + '<g class="bee-fly">'
            + '<g class="bee-wing"><ellipse cx="53.6" cy="11.6" rx="3.8" ry="5.8" transform="rotate(-28 53.6 11.6)"/></g>'
            + '<g class="bee-wing bee-wing-2"><ellipse cx="60" cy="11" rx="3.8" ry="5.8" transform="rotate(16 60 11)"/></g>'
            + '<path d="M57 29 C51.5 25 49.4 21.4 50.6 18.6 C51.6 16 55.2 15.6 57 18.4 C58.8 15.6 62.4 16 63.4 18.6 C64.6 21.4 62.5 25 57 29 Z" fill="#E63946"/>'
            + '</g>',
        'ghana-independence': () => '<g class="streamer" stroke-width="1.8">'
            + '<path d="M6 16 C16 12 24 20 34 16 S46 12 52 16" stroke="#CE1126"/>'
            + '<path d="M6 19.5 C16 15.5 24 23.5 34 19.5 S46 15.5 52 19.5" stroke="#FCD116"/>'
            + '<path d="M6 23 C16 19 24 27 34 23 S46 19 52 23" stroke="#006B3F"/></g>'
            + '<g class="bee-fly"><path class="star-spin" d="' + starPath(59, 19.5, 8.5) + '" fill="currentColor"/></g>',
        easter: () => '<path class="bee-trail" d="M3 31 Q8 23 13 31 Q18 23 23 31 Q28 23 33 31 Q38 23 43 31" stroke-dasharray="1.5 3.5"/>'
            + '<g class="bunny-hop">'
            + '<path d="M61.2 15.4 C59.4 10 59.6 6.6 61 6.4 C62.6 6.4 63 10.6 62.8 15.2 M63.8 15 C64 10.6 65.2 6.6 66.6 7 C68 7.4 66.8 11.6 65.4 15.4"/>'
            + '<ellipse cx="55" cy="24" rx="7.6" ry="5.6"/><circle cx="64.4" cy="18.4" r="3.6"/><circle cx="47.2" cy="22.6" r="1.8"/>'
            + '<path d="M56.4 29.6 H62 M61 27 L62.6 29"/>'
            + '<circle cx="65.6" cy="17.7" r="0.6" fill="currentColor" stroke="none"/><circle cx="67.9" cy="18.9" r="0.55" fill="currentColor" stroke="none"/>'
            + '</g>',
    };
    function starPath(cx, cy, r) {
        let d = '';
        for (let i = 0; i < 10; i++) {
            const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r;
            d += (i ? ' L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1);
        }
        return d + ' Z';
    }

    // New Year: fireworks along the strip instead, each rocket climbing on a dotted trail and
    // bursting, at its own pace. [left %, colour, seconds per launch, head start]
    const FIREWORKS = [[7, '#FFB020', 3.2, -0.4], [21, '#FF5FA2', 2.7, -1.9], [36, '#2EC4B6', 3.5, -2.6], [50, '#8E5CF7', 2.9, -0.9],
        [64, '#FFB020', 3.3, -2.2], [78, '#FF5FA2', 3, -1.3], [92, '#2EC4B6', 3.6, -0.2]];
    function fireworks() {
        let rays = '', sparks = '';
        for (let i = 0; i < 8; i++) {
            const a = i * Math.PI / 4, c = Math.cos(a), s = Math.sin(a);
            rays += 'M' + (20 + c * 3.5).toFixed(1) + ' ' + (13 + s * 3.5).toFixed(1) + ' L' + (20 + c * 9.5).toFixed(1) + ' ' + (13 + s * 9.5).toFixed(1) + ' ';
            sparks += '<circle cx="' + (20 + c * 12.5).toFixed(1) + '" cy="' + (13 + s * 12.5).toFixed(1) + '" r="0.9" stroke="none"/>';
        }
        return FIREWORKS.map(([x, colour, dur, delay]) => '<svg class="firework" viewBox="0 0 40 40" style="left:' + x + '%;--dur:' + dur + 's;--delay:' + delay + 's"'
            + ' fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">'
            + '<path class="fw-trail" d="M20 40 V18" stroke-dasharray="1.5 3"/>'
            + '<g class="fw-burst" stroke="' + colour + '" fill="' + colour + '"><path d="' + rays.trim() + '"/>' + sparks + '</g></svg>').join('');
    }

    function dress() {
        document.querySelectorAll('.bee-end').forEach(function (end) {
            end.innerHTML = holiday.id === 'newyear' ? fireworks() : [1, 2].map(n =>
                '<svg class="bee bee-' + n + ' flyer-' + holiday.id + '" viewBox="0 -12 92 52" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">'
                + FLYERS[holiday.id](n) + '</svg>').join('');
            end.classList.add('is-dressed');
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', dress);
    else dress();
})();
