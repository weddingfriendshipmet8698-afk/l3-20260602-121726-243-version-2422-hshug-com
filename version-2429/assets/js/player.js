(function () {
  'use strict';

  var HLS_LIBRARY_URL = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';
  var hlsScriptPromise = null;

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsScriptPromise) {
      return hlsScriptPromise;
    }

    hlsScriptPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = HLS_LIBRARY_URL;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error('HLS 播放库加载失败'));
      };
      document.head.appendChild(script);
    });

    return hlsScriptPromise;
  }

  function setupPlayer(wrapper) {
    var video = wrapper.querySelector('video');
    var startButton = wrapper.querySelector('.player-start');
    var status = wrapper.querySelector('.player-status');
    var source = wrapper.getAttribute('data-src');
    var hlsInstance = null;
    var prepared = null;

    if (!video || !startButton || !source) {
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function prepareVideo() {
      if (prepared) {
        return prepared;
      }

      setStatus('正在初始化播放源...');
      prepared = new Promise(function (resolve, reject) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            setStatus('播放源已就绪');
            resolve();
          }, { once: true });
          video.addEventListener('error', function () {
            reject(new Error('视频源加载失败'));
          }, { once: true });
          video.load();
          return;
        }

        loadHlsLibrary().then(function (Hls) {
          if (!Hls || !Hls.isSupported()) {
            video.src = source;
            video.load();
            resolve();
            return;
          }

          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            setStatus('播放源已就绪');
            resolve();
          });
          hlsInstance.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('视频加载失败，请刷新后重试');
              reject(new Error(data.details || 'HLS fatal error'));
            }
          });
        }).catch(function (error) {
          setStatus(error.message || '播放器初始化失败');
          reject(error);
        });
      });

      return prepared;
    }

    startButton.addEventListener('click', function () {
      prepareVideo().then(function () {
        video.setAttribute('controls', 'controls');
        wrapper.classList.add('is-playing');
        return video.play();
      }).catch(function () {
        wrapper.classList.remove('is-playing');
      });
    });

    video.addEventListener('play', function () {
      wrapper.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        wrapper.classList.remove('is-playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-video-player]'));
    players.forEach(setupPlayer);
  });
})();
