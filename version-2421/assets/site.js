(function () {
    var hero = document.querySelector('[data-hero-slider]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')));
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        hero.addEventListener('mouseenter', stopTimer);
        hero.addEventListener('mouseleave', startTimer);
        startTimer();
    }

    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var localFilter = document.querySelector('[data-local-filter]');
    var localResults = document.querySelector('[data-local-results]');

    if (localFilter && localResults) {
        var localInput = localFilter.querySelector('input');
        var localCards = Array.prototype.slice.call(localResults.querySelectorAll('[data-search-text]'));

        localInput.addEventListener('input', function () {
            var keyword = localInput.value.trim().toLowerCase();
            localCards.forEach(function (card) {
                var text = card.getAttribute('data-search-text').toLowerCase();
                card.style.display = text.indexOf(keyword) > -1 ? '' : 'none';
            });
        });
    }

    function loadHlsLibrary() {
        return new Promise(function (resolve, reject) {
            if (window.Hls) {
                resolve(window.Hls);
                return;
            }

            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = function () {
                reject(new Error('hls-load-failed'));
            };
            document.head.appendChild(script);
        });
    }

    function initializePlayer(player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-player-start]');
        var status = player.querySelector('[data-player-status]');
        var source = player.getAttribute('data-src');
        var initialized = false;
        var hlsInstance = null;

        function setStatus(text) {
            if (status) {
                status.textContent = text;
            }
        }

        function playVideo() {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    setStatus('视频已就绪，请再次点击播放');
                    player.classList.remove('is-playing');
                });
            }
        }

        function bindNative() {
            video.src = source;
            video.addEventListener('loadedmetadata', function () {
                setStatus('视频已就绪');
                player.classList.add('is-playing');
                playVideo();
            }, { once: true });
            video.load();
        }

        function bindHls(Hls) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 60
            });

            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                setStatus('视频已就绪');
                player.classList.add('is-playing');
                playVideo();
            });
            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setStatus('视频加载失败，请稍后重试');
                }
            });
        }

        function start() {
            player.classList.add('is-playing');

            if (initialized) {
                playVideo();
                return;
            }

            initialized = true;
            setStatus('视频加载中...');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                bindNative();
                return;
            }

            loadHlsLibrary()
                .then(function (Hls) {
                    if (Hls && Hls.isSupported()) {
                        bindHls(Hls);
                    } else {
                        setStatus('当前浏览器不支持 HLS 播放');
                        player.classList.remove('is-playing');
                    }
                })
                .catch(function () {
                    setStatus('播放器组件加载失败');
                    player.classList.remove('is-playing');
                });
        }

        if (button) {
            button.addEventListener('click', start);
        }

        video.addEventListener('play', function () {
            player.classList.add('is-playing');
        });

        video.addEventListener('pause', function () {
            if (!video.ended) {
                player.classList.remove('is-playing');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.querySelectorAll('.stream-player').forEach(initializePlayer);

    var searchPage = document.querySelector('[data-search-page]');

    if (searchPage && window.MOVIES) {
        var input = searchPage.querySelector('[data-search-input]');
        var categorySelect = searchPage.querySelector('[data-category-select]');
        var yearSelect = searchPage.querySelector('[data-year-select]');
        var results = searchPage.querySelector('[data-search-results]');
        var status = searchPage.querySelector('[data-search-status]');
        var params = new URLSearchParams(window.location.search);
        var years = Array.from(new Set(window.MOVIES.map(function (movie) {
            return movie.year;
        }))).sort().reverse();

        years.forEach(function (year) {
            var option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });

        if (params.get('q')) {
            input.value = params.get('q');
        }

        function movieCard(movie) {
            var tags = movie.tags.slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return '<article class="movie-card">' +
                '<a class="movie-poster" href="movies/' + movie.id + '.html" aria-label="观看' + escapeHtml(movie.title) + '">' +
                    '<img src="./' + movie.coverIndex + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="poster-gradient"></span>' +
                    '<span class="poster-type">' + escapeHtml(movie.type) + '</span>' +
                    '<span class="poster-score">' + escapeHtml(movie.score) + '</span>' +
                    '<span class="poster-play">▶</span>' +
                '</a>' +
                '<div class="movie-card-body">' +
                    '<div class="movie-card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>' +
                    '<h3><a href="movies/' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h3>' +
                    '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
            '</article>';
        }

        function escapeHtml(text) {
            return String(text).replace(/[&<>"']/g, function (character) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#039;'
                }[character];
            });
        }

        function renderSearch() {
            var keyword = input.value.trim().toLowerCase();
            var category = categorySelect.value;
            var year = yearSelect.value;
            var filtered = window.MOVIES.filter(function (movie) {
                var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.categoryName, movie.oneLine, movie.tags.join(' ')].join(' ').toLowerCase();
                var keywordMatch = !keyword || text.indexOf(keyword) > -1;
                var categoryMatch = !category || movie.category === category;
                var yearMatch = !year || movie.year === year;
                return keywordMatch && categoryMatch && yearMatch;
            }).slice(0, 80);

            results.innerHTML = filtered.map(movieCard).join('');
            status.textContent = filtered.length ? '已展示相关结果' : '没有找到匹配影片';
        }

        input.addEventListener('input', renderSearch);
        categorySelect.addEventListener('change', renderSearch);
        yearSelect.addEventListener('change', renderSearch);
        renderSearch();
    }
})();
