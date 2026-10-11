// Lets a mouse drag the sideways notebook (.nb-row) left and right. Touch screens and
// trackpads already scroll it natively, and keyboard users can focus it and use the arrows.
(function () {
    document.querySelectorAll('.nb-row').forEach(function (row) {
        let drag = null;
        row.addEventListener('pointerdown', function (e) {
            if (e.pointerType !== 'mouse' || e.button !== 0) return;
            drag = { id: e.pointerId, x: e.clientX, left: row.scrollLeft };
            row.setPointerCapture(e.pointerId);
            row.classList.add('is-dragging');
        });
        row.addEventListener('pointermove', function (e) {
            if (!drag || e.pointerId !== drag.id) return;
            row.scrollLeft = drag.left - (e.clientX - drag.x);
        });
        function end() {
            if (!drag) return;
            drag = null;
            // Turning snapping back on lets the row settle on the nearest page.
            row.classList.remove('is-dragging');
        }
        row.addEventListener('pointerup', end);
        row.addEventListener('pointercancel', end);
        row.addEventListener('lostpointercapture', end);
    });
})();
