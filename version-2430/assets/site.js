(function () {
    const toggle = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length > 0) {
        let current = 0;
        const showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
            });
        });
        showSlide(0);
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    const input = document.querySelector('[data-filter-input]');
    const yearSelect = document.querySelector('[data-filter-year]');
    const categorySelect = document.querySelector('[data-filter-category]');
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    const empty = document.querySelector('[data-empty-state]');
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';

    if (input && initialQuery) {
        input.value = initialQuery;
    }

    const applyFilters = function () {
        if (cards.length === 0) {
            return;
        }
        const q = input ? input.value.trim().toLowerCase() : '';
        const year = yearSelect ? yearSelect.value : '';
        const category = categorySelect ? categorySelect.value : '';
        let visibleCount = 0;
        cards.forEach(function (card) {
            const text = [
                card.dataset.title || '',
                card.dataset.year || '',
                card.dataset.region || '',
                card.dataset.category || '',
                card.dataset.tags || ''
            ].join(' ').toLowerCase();
            const passQuery = q === '' || text.indexOf(q) !== -1;
            const passYear = year === '' || card.dataset.year === year;
            const passCategory = category === '' || card.dataset.category === category;
            const visible = passQuery && passYear && passCategory;
            card.style.display = visible ? '' : 'none';
            if (visible) {
                visibleCount += 1;
            }
        });
        if (empty) {
            empty.classList.toggle('is-visible', visibleCount === 0);
        }
    };

    if (input) {
        input.addEventListener('input', applyFilters);
    }
    if (yearSelect) {
        yearSelect.addEventListener('change', applyFilters);
    }
    if (categorySelect) {
        categorySelect.addEventListener('change', applyFilters);
    }
    applyFilters();
})();
