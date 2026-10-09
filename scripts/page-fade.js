// Smooth fade between page navigations (nav menu + light/dark mode toggle)
(function () {
    function fadeIn() {
        document.body.classList.remove('page-leaving');
        document.body.classList.add('page-loaded');
    }

    // pageshow fires on every view of the page, including back/forward-cache
    // restores (where DOMContentLoaded never fires again) - this keeps
    // forward and back navigation equally smooth.
    window.addEventListener('pageshow', fadeIn);

    window.fadeNavigate = function (href) {
        document.body.classList.remove('page-loaded');
        document.body.classList.add('page-leaving');
        setTimeout(function () {
            window.location.href = href;
        }, 120);
    };

    document.addEventListener('click', function (e) {
        const link = e.target.closest('.nav-menu a');
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href) return;
        e.preventDefault();
        window.fadeNavigate(href);
    });
})();
