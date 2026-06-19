(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function setSlide(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        setSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setSlide(Number(dot.getAttribute('data-hero-dot') || 0));
        startTimer();
      });
    });

    startTimer();
  }

  var searchInput = document.querySelector('[data-search-input]');
  var clearButton = document.querySelector('[data-clear-search]');
  var filterRow = document.querySelector('[data-filter-row]');
  var activeFilter = '';

  function applySearch() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchedFilter = !activeFilter || text.indexOf(activeFilter.toLowerCase()) !== -1;
      card.classList.toggle('hidden', !(matchedKeyword && matchedFilter));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applySearch);
  }

  if (clearButton && searchInput) {
    clearButton.addEventListener('click', function () {
      searchInput.value = '';
      activeFilter = '';
      document.querySelectorAll('[data-filter]').forEach(function (chip) {
        chip.classList.toggle('active', chip.getAttribute('data-filter') === '');
      });
      applySearch();
      searchInput.focus();
    });
  }

  if (filterRow) {
    filterRow.addEventListener('click', function (event) {
      var chip = event.target.closest('[data-filter]');
      if (!chip) {
        return;
      }
      activeFilter = chip.getAttribute('data-filter') || '';
      filterRow.querySelectorAll('[data-filter]').forEach(function (item) {
        item.classList.toggle('active', item === chip);
      });
      applySearch();
    });
  }
})();
