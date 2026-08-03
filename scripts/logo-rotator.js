// Static logo setup: show a single circular image without animation
(function () {
    function init() {
        const logos = document.querySelectorAll('.barcode-logo img');

        if (!logos || !logos.length) return;

        logos.forEach(function (img) {
            img.width = 50;
            img.height = 50;
            img.style.width = '50px';
            img.style.height = '50px';
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
