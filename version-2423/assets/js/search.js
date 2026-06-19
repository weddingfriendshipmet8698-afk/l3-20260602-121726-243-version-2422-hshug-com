(function () {
  var form = document.querySelector('[data-search-form]');
  var results = document.querySelector('[data-search-results]');
  var count = document.querySelector('[data-search-count]');
  var empty = document.querySelector('[data-empty-state]');
  var movies = Array.isArray(window.MOVIES) ? window.MOVIES : [];
  var pageSize = 48;
  var currentPage = 1;
  var currentMatches = [];

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getParams() {
    var params = new URLSearchParams(window.location.search);
    return {
      q: params.get('q') || '',
      category: params.get('category') || '',
      type: params.get('type') || '',
      year: params.get('year') || ''
    };
  }

  function setFormValues(params) {
    form.querySelector('[name="q"]').value = params.q;
    form.querySelector('[name="category"]').value = params.category;
    form.querySelector('[name="type"]').value = params.type;
    form.querySelector('[name="year"]').value = params.year;
  }

  function movieMatches(movie, params) {
    var text = [
      movie.title,
      movie.region,
      movie.type,
      movie.genreRaw,
      movie.oneLine,
      movie.summary,
      movie.review,
      (movie.tags || []).join(' ')
    ].join(' ').toLowerCase();

    var query = params.q.trim().toLowerCase();
    var queryMatched = !query || query.split(/\s+/).some(function (word) {
      return text.indexOf(word) !== -1;
    });

    var categoryMatched = !params.category || movie.categoryName === params.category;
    var typeMatched = !params.type || movie.type === params.type;
    var yearMatched = !params.year || String(movie.year) === params.year;

    return queryMatched && categoryMatched && typeMatched && yearMatched;
  }

  function renderCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="movie-poster" href="movie/' + movie.id + '.html" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.classList.add(\'image-missing\');">',
      '    <span class="poster-overlay">▶</span>',
      '    <span class="type-badge">' + escapeHtml(movie.type) + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <h3><a href="movie/' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="meta-row">',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.rating) + ' 分</span>',
      '    </div>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function renderPagination(totalPages) {
    if (totalPages <= 1) {
      return '';
    }

    var html = '<nav class="pagination" aria-label="搜索结果分页">';
    for (var page = 1; page <= totalPages; page += 1) {
      if (totalPages > 9 && page !== 1 && page !== totalPages && Math.abs(page - currentPage) > 2) {
        if (page === 2 || page === totalPages - 1) {
          html += '<span>…</span>';
        }
        continue;
      }

      if (page === currentPage) {
        html += '<span class="current">' + page + '</span>';
      } else {
        html += '<a href="#" data-page="' + page + '">' + page + '</a>';
      }
    }
    html += '</nav>';
    return html;
  }

  function renderResults() {
    var totalPages = Math.max(1, Math.ceil(currentMatches.length / pageSize));
    var start = (currentPage - 1) * pageSize;
    var items = currentMatches.slice(start, start + pageSize);

    count.textContent = '找到 ' + currentMatches.length + ' 个结果';
    empty.style.display = currentMatches.length ? 'none' : 'block';
    results.innerHTML = items.map(renderCard).join('\n') + renderPagination(totalPages);

    results.querySelectorAll('[data-page]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        currentPage = Number(link.getAttribute('data-page')) || 1;
        renderResults();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  function runSearch(pushState) {
    var params = {
      q: form.querySelector('[name="q"]').value.trim(),
      category: form.querySelector('[name="category"]').value,
      type: form.querySelector('[name="type"]').value,
      year: form.querySelector('[name="year"]').value
    };

    currentMatches = movies.filter(function (movie) {
      return movieMatches(movie, params);
    });
    currentPage = 1;

    if (pushState) {
      var query = new URLSearchParams();
      Object.keys(params).forEach(function (key) {
        if (params[key]) {
          query.set(key, params[key]);
        }
      });
      history.replaceState(null, '', window.location.pathname + (query.toString() ? '?' + query.toString() : ''));
    }

    renderResults();
  }

  if (!form || !results || !count) {
    return;
  }

  setFormValues(getParams());

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    runSearch(true);
  });

  form.querySelectorAll('select').forEach(function (select) {
    select.addEventListener('change', function () {
      runSearch(true);
    });
  });

  runSearch(false);
})();
