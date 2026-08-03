(function () {
    const style = document.createElement('style');
    style.textContent = `
        .barba-wrapper {
            position: relative;
            min-height: 100vh;
        }
        .barba-container {
            opacity: 1;
            will-change: opacity, transform;
        }
        .page-transition-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;
            pointer-events: none;
            background: linear-gradient(135deg, rgba(11,11,11,0.95), rgba(24,24,24,0.9));
            opacity: 0;
            transform: scaleX(0);
            transform-origin: left center;
        }
        body.dark-mode .page-transition-overlay {
            background: linear-gradient(135deg, rgba(255,255,255,0.94), rgba(240,240,240,0.9));
        }
    `;
    document.head.appendChild(style);

    function addTransitionOverlay() {
        if (document.querySelector('.page-transition-overlay')) return;
        const overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        document.body.appendChild(overlay);
        return overlay;
    }

    function wrapPageContent() {
        if (!document.body || document.querySelector('[data-barba="wrapper"]')) return;

        const wrapper = document.createElement('div');
        wrapper.setAttribute('data-barba', 'wrapper');
        wrapper.className = 'barba-wrapper';

        const container = document.createElement('div');
        container.setAttribute('data-barba', 'container');
        container.className = 'barba-container';

        const preserveTags = ['SCRIPT', 'STYLE', 'LINK', 'META', 'TITLE', 'NOSCRIPT'];
        const nodesToMove = [];

        Array.from(document.body.childNodes).forEach((node) => {
            if (node.nodeType !== 1) {
                return;
            }

            const tagName = node.tagName;
            if (tagName && preserveTags.includes(tagName)) {
                return;
            }

            if (node.classList && node.classList.contains('page-transition-overlay')) {
                return;
            }

            nodesToMove.push(node);
        });

        nodesToMove.forEach((node) => {
            container.appendChild(node);
        });

        wrapper.appendChild(container);
        document.body.appendChild(wrapper);
        document.body.insertBefore(wrapper, document.body.firstChild);
    }

    function initLenis() {
        if (!window.Lenis) return;

        const lenis = new Lenis({
            duration: 1.2,
            smoothWheel: true,
            touchMultiplier: 1.6,
            wheelMultiplier: 1.1
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
    }

    function initBarba() {
        if (!window.barba || !window.gsap) return;

        const overlay = addTransitionOverlay();
        wrapPageContent();

        barba.init({
            transitions: [{
                name: 'smooth-page-transition',
                once(data) {
                    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
                    tl.fromTo(data.next.container, { opacity: 0 }, { opacity: 1, duration: 0.35 });
                    return tl;
                },
                leave(data) {
                    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
                    tl.set(overlay, { opacity: 1, scaleX: 0.001, transformOrigin: 'left center' });
                    tl.to(overlay, { scaleX: 1, duration: 0.42 });
                    tl.to(data.current.container, { opacity: 0, duration: 0.25 }, '-=0.2');
                    return tl;
                },
                enter(data) {
                    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
                    tl.fromTo(data.next.container, { opacity: 0 }, { opacity: 1, duration: 0.35 });
                    tl.to(overlay, { opacity: 0, duration: 0.2, scaleX: 1 }, '-=0.1');
                    return tl;
                }
            }]
        });
    }

    function init() {
        addTransitionOverlay();
        initLenis();
        initBarba();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
