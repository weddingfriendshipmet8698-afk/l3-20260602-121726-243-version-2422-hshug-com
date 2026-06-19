(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileNav() {
    var toggle = $(".mobile-toggle");
    var nav = $(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var opened = nav.classList.toggle("is-open");
      toggle.classList.toggle("is-open", opened);
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
      document.body.classList.toggle("no-scroll", opened);
    });
    $$(".mobile-nav a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("no-scroll");
      });
    });
  }

  function initHero() {
    var hero = $(".hero");
    if (!hero) {
      return;
    }
    var slides = $$(".hero-slide", hero);
    var dots = $$(".hero-dot", hero);
    var prev = $("[data-hero-prev]", hero);
    var next = $("[data-hero-next]", hero);
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function nextSlide() {
      show(current + 1);
    }

    function resetTimer() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(nextSlide, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
        resetTimer();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        resetTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        nextSlide();
        resetTimer();
      });
    }

    resetTimer();
  }

  function initFilters() {
    var search = $(".site-search");
    var region = $(".region-filter");
    var genre = $(".genre-filter");
    var cards = $$(".movie-card");
    if (!cards.length || (!search && !region && !genre)) {
      return;
    }

    function normalize(value) {
      return (value || "").toString().trim().toLowerCase();
    }

    function filter() {
      var q = normalize(search && search.value);
      var regionValue = normalize(region && region.value);
      var genreValue = normalize(genre && genre.value);

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year"),
          card.getAttribute("data-category")
        ].join(" "));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardGenre = normalize(card.getAttribute("data-genre"));
        var matchesSearch = !q || text.indexOf(q) !== -1;
        var matchesRegion = !regionValue || cardRegion.indexOf(regionValue) !== -1;
        var matchesGenre = !genreValue || cardGenre.indexOf(genreValue) !== -1;
        card.hidden = !(matchesSearch && matchesRegion && matchesGenre);
      });
    }

    [search, region, genre].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener("input", filter);
      control.addEventListener("change", filter);
    });
  }

  function initRail() {
    var rail = $("[data-rail]");
    if (!rail) {
      return;
    }
    var left = $("[data-rail-left]");
    var right = $("[data-rail-right]");
    function move(direction) {
      rail.scrollBy({
        left: direction * Math.max(260, rail.clientWidth * 0.72),
        behavior: "smooth"
      });
    }
    if (left) {
      left.addEventListener("click", function () {
        move(-1);
      });
    }
    if (right) {
      right.addEventListener("click", function () {
        move(1);
      });
    }
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        if (window.Hls) {
          resolve();
          return;
        }
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      var script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function attemptPlay(video) {
    var play = video.play();
    if (play && typeof play.catch === "function") {
      play.catch(function () {});
    }
    return play || Promise.resolve();
  }

  function setVideo(video, url) {
    if (video.getAttribute("data-ready") === "1") {
      return attemptPlay(video);
    }

    video.setAttribute("controls", "controls");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.setAttribute("data-ready", "1");
      return attemptPlay(video);
    }

    return loadScript("https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js")
      .then(function () {
        if (window.Hls && window.Hls.isSupported()) {
          if (video._hlsPlayer) {
            video._hlsPlayer.destroy();
          }
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 60
          });
          video._hlsPlayer = hls;
          hls.loadSource(url);
          hls.attachMedia(video);
          video.setAttribute("data-ready", "1");
          return new Promise(function (resolve) {
            var done = false;
            function playNow() {
              if (done) {
                return;
              }
              done = true;
              resolve(attemptPlay(video));
            }
            hls.on(window.Hls.Events.MANIFEST_PARSED, playNow);
            hls.on(window.Hls.Events.ERROR, function () {
              if (!video.src) {
                video.src = url;
              }
              playNow();
            });
            setTimeout(playNow, 1500);
          });
        }
        video.src = url;
        video.setAttribute("data-ready", "1");
        return attemptPlay(video);
      })
      .catch(function () {
        video.src = url;
        video.setAttribute("data-ready", "1");
        return attemptPlay(video);
      });
  }

  window.initMoviePlayer = function (url) {
    ready(function () {
      var shell = $(".player-shell");
      if (!shell) {
        return;
      }
      var video = $(".movie-video", shell);
      var overlay = $(".player-overlay", shell);
      if (!video) {
        return;
      }
      var started = false;

      function start() {
        started = true;
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        setVideo(video, url);
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }

      video.addEventListener("click", function () {
        if (!started || video.paused) {
          start();
        }
      });
    });
  };

  ready(function () {
    initMobileNav();
    initHero();
    initFilters();
    initRail();
  });
})();
