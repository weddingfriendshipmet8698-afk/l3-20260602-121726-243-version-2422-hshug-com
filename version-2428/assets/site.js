(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;

    function setHero(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        setHero(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setHero(index + 1);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        setHero(i);
      });
    });

    window.setInterval(function () {
      setHero(index + 1);
    }, 5200);
  }

  var searchInput = document.getElementById('site-search-input');
  var searchGrid = document.getElementById('search-results');
  if (searchInput && searchGrid) {
    var cards = Array.prototype.slice.call(searchGrid.querySelectorAll('.movie-card'));
    var query = new URLSearchParams(window.location.search).get('q') || '';
    searchInput.value = query;

    function filterCards() {
      var value = searchInput.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-year') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        card.style.display = !value || haystack.indexOf(value) >= 0 ? '' : 'none';
      });
    }

    searchInput.addEventListener('input', filterCards);
    filterCards();
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('.player-wrap'));
  players.forEach(function (wrap) {
    var video = wrap.querySelector('video');
    var button = wrap.querySelector('.play-overlay');
    var stream = wrap.getAttribute('data-stream');
    var ready = false;
    var hlsInstance = null;

    function bindStream() {
      if (!video || !stream || ready) {
        return;
      }
      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function playVideo() {
      bindStream();
      if (!video) {
        return;
      }
      wrap.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          wrap.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        wrap.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        wrap.classList.remove('is-playing');
      });
      video.addEventListener('ended', function () {
        wrap.classList.remove('is-playing');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
