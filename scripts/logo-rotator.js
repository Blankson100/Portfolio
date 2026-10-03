// Static logo setup: show a single circular image without animation
(function () {
    function init() {
        const logos = document.querySelectorAll('.barcode-logo img');

        if (!logos || !logos.length) return;

        logos.forEach(function (img) {
            const size = img.closest('.profile-header') ? 72 : 50;
            img.width = size;
            img.height = size;
            img.style.width = size + 'px';
            img.style.height = size + 'px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '50%';
            img.style.display = 'block';
            img.src = 'unnamed.jpg';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
