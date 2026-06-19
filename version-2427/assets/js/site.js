(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initFilters();
    initPlayers();
  });

  function initMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      toggle.textContent = panel.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    }

    function restart(index) {
      if (timer) {
        window.clearInterval(timer);
      }
      activate(index);
      start();
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        restart(index);
      });
    });

    hero.addEventListener("mouseenter", function () {
      if (timer) {
        window.clearInterval(timer);
      }
    });

    hero.addEventListener("mouseleave", function () {
      start();
    });

    start();
  }

  function initFilters() {
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get("q") || "";
    document.querySelectorAll("[data-filter-root]").forEach(function (root) {
      var input = root.querySelector("[data-filter-input]");
      var year = root.querySelector("[data-filter-year]");
      var scope = root.parentElement || document;
      var empty = scope.querySelector("[data-empty-state]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      if (!cards.length) {
        return;
      }
      if (input && queryValue) {
        input.value = queryValue;
      }

      function apply() {
        var term = input ? input.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-category"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var yearOk = !selectedYear || card.getAttribute("data-year") === selectedYear;
          var termOk = !term || text.indexOf(term) !== -1;
          var show = yearOk && termOk;
          card.classList.toggle("is-hidden", !show);
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
      apply();
    });
  }

  function initPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector("[data-overlay]");
      var playButton = player.querySelector("[data-play]");
      var muteButton = player.querySelector("[data-mute]");
      var fullButton = player.querySelector("[data-fullscreen]");
      var stream = player.getAttribute("data-stream");
      var hls = null;
      var attached = false;

      if (!video || !stream) {
        return;
      }

      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function updatePlayState() {
        if (playButton) {
          playButton.textContent = video.paused ? "▶" : "❚❚";
        }
      }

      function start(event) {
        if (event) {
          event.preventDefault();
        }
        attach();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }
      if (playButton) {
        playButton.addEventListener("click", function (event) {
          event.preventDefault();
          attach();
          if (video.paused) {
            start();
          } else {
            video.pause();
          }
        });
      }
      video.addEventListener("click", function () {
        attach();
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      });
      if (muteButton) {
        muteButton.addEventListener("click", function () {
          video.muted = !video.muted;
          muteButton.textContent = video.muted ? "静音" : "声音";
        });
      }
      if (fullButton) {
        fullButton.addEventListener("click", function () {
          var target = player;
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (target.requestFullscreen) {
            target.requestFullscreen();
          }
        });
      }
      video.addEventListener("play", updatePlayState);
      video.addEventListener("pause", updatePlayState);
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
      updatePlayState();
    });
  }
})();
