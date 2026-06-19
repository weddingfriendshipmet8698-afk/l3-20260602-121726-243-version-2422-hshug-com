(function () {
  function showMessage(player, text) {
    var message = player.querySelector('[data-player-message]');

    if (message) {
      message.textContent = text;
      message.classList.add('is-visible');
    }
  }

  function setupPlayer(player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-player-overlay]');
    var src = player.getAttribute('data-src');
    var started = false;
    var hls = null;

    if (!video || !overlay || !src) {
      return;
    }

    function startPlayback() {
      if (!started) {
        started = true;
        overlay.classList.add('is-hidden');
        video.controls = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.play().catch(function () {
            showMessage(player, '请点击播放器中的播放按钮继续播放。');
          });
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {
              showMessage(player, '请点击播放器中的播放按钮继续播放。');
            });
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showMessage(player, '视频加载失败，请刷新页面或稍后重试。');
            }
          });
          return;
        }

        showMessage(player, '当前浏览器不支持 HLS 播放，请更换浏览器或确认 hls.js 已加载。');
        return;
      }

      video.play().catch(function () {
        showMessage(player, '请点击播放器中的播放按钮继续播放。');
      });
    }

    overlay.addEventListener('click', startPlayback);

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll('[data-video-player]').forEach(setupPlayer);
})();
