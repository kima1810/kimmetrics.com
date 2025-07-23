document.addEventListener('DOMContentLoaded', () => {
  const ARTICLES_PER_PAGE = 15;
  const articlesContainer = document.getElementById('recent-articles-container');
  const paginationContainer = document.querySelector('.pagination');
  const tagButtons = document.querySelectorAll('.tag-filter');
  const activeTags = new Set();

  let allArticles = [];
  let filteredArticles = [];
  let currentPage = 1;

  function renderArticles() {
    const start = (currentPage - 1) * ARTICLES_PER_PAGE;
    const end = start + ARTICLES_PER_PAGE;
    const pageArticles = filteredArticles.slice(start, end);

    articlesContainer.innerHTML = '';
    const charLimit = 250;

    pageArticles.forEach(article => {
      let summary = article.summary;
      if (summary.length > charLimit) {
        summary = summary.slice(0, charLimit).trim() + '...';
      }

      articlesContainer.innerHTML += `
        <article>
          <a href="/pages/articles/published/${article.slug}.html" class="image">
            <img src="${article.image}" alt="${article.title}" />
          </a>
          <h3>${article.title}</h3>
          <p>${summary}</p>
          <ul class="actions">
            <li><a href="/pages/articles/published/${article.slug}.html" class="button">More</a></li>
          </ul>
        </article>
      `;
    });
  }

  function renderPagination() {
    const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return;

    const createPageButton = (page, text = page, active = false, disabled = false) => {
      const classList = [];
      if (active) classList.push('active');
      if (disabled) classList.push('disabled');
      return `<li><a href="#" class="page ${classList.join(' ')}" data-page="${page}">${text}</a></li>`;
    };

    paginationContainer.innerHTML += createPageButton(currentPage - 1, 'Prev', false, currentPage === 1);

    const delta = 2;
    let lastPage = 0;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        if (i - lastPage > 1) {
          paginationContainer.innerHTML += `<li><span>&hellip;</span></li>`;
        }
        paginationContainer.innerHTML += createPageButton(i, i, currentPage === i);
        lastPage = i;
      }
    }

    paginationContainer.innerHTML += createPageButton(currentPage + 1, 'Next', false, currentPage === totalPages);
  }

  function filterArticlesByActiveTags() {
    currentPage = 1;

    if (activeTags.size === 0) {
      filteredArticles = [...allArticles];
    } else {
      filteredArticles = allArticles.filter(article => {
        const tags = article.tags ? article.tags.split(',').map(t => t.trim()) : [];
        return [...activeTags].every(tag => tags.includes(tag));
      });
    }

    renderArticles();
    renderPagination();
  }

  function handlePaginationClick(e) {
    if (!e.target.dataset.page) return;
    const page = parseInt(e.target.dataset.page);
    const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    renderArticles();
    renderPagination();
  }

  function setupTagButtons() {
    const tagButtons = document.querySelectorAll('.tag-button');

    tagButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const tag = button.dataset.tag;

        if (button.classList.contains('active')) {
          button.classList.remove('active');
          activeTags.delete(tag);
        } else {
          button.classList.add('active');
          activeTags.add(tag);
        }

        filterArticlesByActiveTags();
      });
    });
  }

  function getActiveTagsFromURL() {
    const params = new URLSearchParams(window.location.search);
    const tagParam = params.get("tags");
    return tagParam ? tagParam.split(',') : [];
  }

  // MAIN FETCH AND INIT LOGIC
  fetch('/pages/articles/articles.csv')
    .then(res => res.text())
    .then(csvText => {
      const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
      allArticles = parsed.data
        .filter(article =>
          article.title && article.slug && article.image && article.summary
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      // Activate tags from URL (before filtering)
      const urlTags = getActiveTagsFromURL();
      const tagButtons = document.querySelectorAll('.tag-button');

      urlTags.forEach(tag => {
        const button = [...tagButtons].find(btn =>
          btn.textContent.trim().toLowerCase() === tag.toLowerCase()
        );
        if (button) {
          button.classList.add('active');
          activeTags.add(tag);
        }
      });

      // Then filter and render
      filterArticlesByActiveTags();
      setupTagButtons();
    });

  paginationContainer.addEventListener('click', handlePaginationClick);
});
