(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function escapeHTML(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getQuery() {
    return new URLSearchParams(window.location.search).get('q') || '';
  }

  function matches(movie, keyword) {
    if (!keyword) {
      return true;
    }
    var text = [
      movie.title,
      movie.year,
      movie.region,
      movie.type,
      movie.genre,
      movie.category,
      movie.oneLine,
      (movie.tags || []).join(' ')
    ].join(' ').toLowerCase();
    return text.indexOf(keyword.toLowerCase()) !== -1;
  }

  function renderCard(movie) {
    var title = escapeHTML(movie.title);
    var description = escapeHTML(movie.oneLine || movie.genre || '精选影片');
    return [
      '<article class="movie-card" data-movie-card>',
      '  <a href="' + escapeHTML(movie.url) + '" class="movie-card-link" title="' + title + ' 在线观看">',
      '    <div class="poster-frame">',
      '      <img src="./' + escapeHTML(movie.cover) + '" alt="' + title + ' 封面" loading="lazy" data-fallback-image>',
      '      <span class="card-badge">' + escapeHTML(movie.category) + '</span>',
      '      <span class="card-duration">⏱ ' + escapeHTML(movie.duration) + '</span>',
      '    </div>',
      '    <div class="movie-card-body">',
      '      <h3>' + title + '</h3>',
      '      <p>' + description + '</p>',
      '      <div class="card-meta">',
      '        <span>★ ' + escapeHTML(movie.rating) + '</span>',
      '        <span>' + escapeHTML(movie.year) + '</span>',
      '        <span>' + escapeHTML(movie.region) + '</span>',
      '      </div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('\n');
  }

  function renderResults(keyword) {
    var resultsContainer = document.querySelector('[data-search-results]');
    var title = document.querySelector('[data-search-title]');
    var count = document.querySelector('[data-search-count]');
    var movies = Array.isArray(window.MOVIE_INDEX) ? window.MOVIE_INDEX : [];
    var results = movies.filter(function (movie) {
      return matches(movie, keyword);
    });

    if (!keyword) {
      results = results
        .slice()
        .sort(function (a, b) {
          return Number(b.views || 0) - Number(a.views || 0);
        })
        .slice(0, 48);
    }

    if (title) {
      title.textContent = keyword ? '搜索：' + keyword : '热门推荐';
    }
    if (count) {
      count.textContent = '共找到 ' + results.length + ' 部';
    }
    if (!resultsContainer) {
      return;
    }

    if (!results.length) {
      resultsContainer.innerHTML = '<div class="detail-card"><h2>没有找到相关影片</h2><p class="review-text">请尝试更换标题、地区、年份或题材关键词。</p></div>';
      return;
    }

    resultsContainer.innerHTML = results.map(renderCard).join('\n');
  }

  ready(function () {
    var form = document.querySelector('[data-search-page-form]');
    var input = document.querySelector('[data-search-page-input]');
    var keyword = getQuery().trim();

    if (input) {
      input.value = keyword;
    }
    renderResults(keyword);

    if (form && input) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var value = input.value.trim();
        var url = new URL(window.location.href);
        if (value) {
          url.searchParams.set('q', value);
        } else {
          url.searchParams.delete('q');
        }
        window.history.pushState({}, '', url.toString());
        renderResults(value);
      });
    }
  });
})();
