// The picture link previews show (og:image on every page, served as /share-card.jpg through
// vercel.json): on a holiday in Accra that holiday's card, otherwise the everyday one, from
// share-cards/ (built by tools/build-share-card.js). Preview a day with
// /share-card.jpg?date=2026-12-25.
const fs = require('fs');
const path = require('path');
const { holidayOn, accraToday } = require('../scripts/holiday.js');

module.exports = function (req, res) {
    const day = holidayOn(accraToday(req.query && req.query.date));
    const card = path.join(__dirname, '..', 'share-cards', (day ? day.id : 'everyday') + '.jpg');
    res.setHeader('Content-Type', 'image/jpeg');
    // Kept for an hour at most, so the card changes soon after midnight on a holiday.
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.end(fs.readFileSync(card));
};
