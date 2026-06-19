(function () {
  function startPlayer(player) {
    var video = player.querySelector('video');
    if (!video) {
      return;
    }

    var url = video.getAttribute('data-stream');
    if (!url) {
      return;
    }

    if (!video.getAttribute('src')) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    player.classList.add('is-playing');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var trigger = player.querySelector('[data-player-trigger]');
    var video = player.querySelector('video');

    if (trigger) {
      trigger.addEventListener('click', function () {
        startPlayer(player);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        startPlayer(player);
      });
    }
  });
})();
