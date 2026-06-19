(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call(
      (root || document).querySelectorAll(selector),
    );
  }

  function nestedPrefix() {
    return location.pathname.indexOf("/movie/") !== -1 ||
      location.pathname.indexOf("/category/") !== -1
      ? "../"
      : "./";
  }

  function openLink(link) {
    return nestedPrefix() + link;
  }

  function setupMobileNav() {
    var button = qs(".js-mobile-toggle");
    var nav = qs(".js-mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = nav.hasAttribute("hidden");
      if (opened) {
        nav.removeAttribute("hidden");
        document.body.classList.add("menu-open");
      } else {
        nav.setAttribute("hidden", "");
        document.body.classList.remove("menu-open");
      }
    });
  }

  function setupHero() {
    var slides = qsa(".hero-slide");
    var dots = qsa(".hero-dot");
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    show(0);
    window.setInterval(function () {
      show(current + 1);
    }, 5600);
  }

  function setupCardFilter() {
    var input = qs(".js-card-filter");
    var cards = qsa(".movie-card");
    if (!input || !cards.length) {
      return;
    }
    input.addEventListener("input", function () {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = card.textContent.toLowerCase();
        card.hidden = value && text.indexOf(value) === -1;
      });
    });
  }

  function setupSearch() {
    var inputs = qsa(".js-search-input");
    if (!inputs.length || !window.SiteSearch) {
      return;
    }
    inputs.forEach(function (input) {
      var panel = input.parentElement.querySelector(".js-search-panel");
      if (!panel) {
        return;
      }
      input.addEventListener("input", function () {
        var value = input.value.trim().toLowerCase();
        if (!value) {
          panel.hidden = true;
          panel.innerHTML = "";
          return;
        }
        var hits = window.SiteSearch.filter(function (item) {
          return item.keywords.indexOf(value) !== -1;
        }).slice(0, 30);
        if (!hits.length) {
          panel.hidden = false;
          panel.innerHTML = '<div class="empty-search">没有找到匹配影片</div>';
          return;
        }
        var prefix = nestedPrefix();
        panel.hidden = false;
        panel.innerHTML = hits
          .map(function (item) {
            return (
              '<a class="search-hit" href="' +
              openLink(item.link) +
              '">' +
              '<img src="' +
              prefix +
              item.cover +
              '" alt="' +
              escapeHtml(item.title) +
              '" loading="lazy" />' +
              "<span><strong>" +
              escapeHtml(item.title) +
              "</strong><span>" +
              escapeHtml(item.meta) +
              "</span></span>" +
              "</a>"
            );
          })
          .join("");
      });
      document.addEventListener("click", function (event) {
        if (!input.parentElement.contains(event.target)) {
          panel.hidden = true;
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
      }[char];
    });
  }

  window.initMoviePlayer = function (url) {
    var video = document.getElementById("moviePlayer");
    var gate = document.getElementById("playGate");
    if (!video || !url) {
      return;
    }

    var attached = false;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function start() {
      attach();
      if (gate) {
        gate.setAttribute("hidden", "");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (gate) {
      gate.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (gate) {
        gate.setAttribute("hidden", "");
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileNav();
    setupHero();
    setupCardFilter();
    setupSearch();
  });
})();
