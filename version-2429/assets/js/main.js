(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function setupMobileMenu() {
    var button = document.querySelector('.mobile-menu-toggle');
    var menu = document.querySelector('.mobile-menu');
    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      button.textContent = open ? '×' : '☰';
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }

    var track = slider.querySelector('[data-hero-track]');
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function goTo(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        goTo(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        goTo(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        goTo(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        goTo(dotIndex);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    goTo(0);
    start();
  }

  function setupCardFilters() {
    var list = document.querySelector('[data-card-list]');
    var search = document.querySelector('[data-card-search]');
    var year = document.querySelector('[data-year-filter]');
    var count = document.querySelector('[data-filter-count]');
    if (!list || (!search && !year)) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));

    function applyFilter() {
      var keyword = search ? search.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var cardTitle = (card.getAttribute('data-title') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1 || cardTitle.indexOf(keyword) !== -1;
        var yearMatch = !selectedYear || cardYear === selectedYear;
        var shouldShow = keywordMatch && yearMatch;
        card.classList.toggle('is-hidden', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '显示 ' + visible + ' 部';
      }
    }

    if (search) {
      search.addEventListener('input', applyFilter);
    }
    if (year) {
      year.addEventListener('change', applyFilter);
    }
    applyFilter();
  }

  function setupImageFallbacks() {
    var images = Array.prototype.slice.call(document.querySelectorAll('[data-fallback-image]'));
    images.forEach(function (image) {
      image.addEventListener('error', function () {
        var frame = image.closest('.poster-frame') || image.parentElement;
        if (frame) {
          frame.classList.add('is-missing');
          frame.setAttribute('data-title', image.getAttribute('alt') || '影片封面');
        }
        image.remove();
      }, { once: true });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHeroSlider();
    setupCardFilters();
    setupImageFallbacks();
  });
})();
