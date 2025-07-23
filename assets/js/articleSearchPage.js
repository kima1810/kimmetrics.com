document.addEventListener('DOMContentLoaded', () => {
  const ARTICLES_PER_PAGE = 15;
  const articlesContainer = document.getElementById('recent-articles-container');
  const paginationContainer = document.querySelector('.pagination');
  const tagButtons = document.querySelectorAll('.tag-filter');

  let allArticles = [];
  let filteredArticles = [];
  let currentPage = 1;
  let currentTag = 'All';

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

  function filterArticlesByTag(tag) {
    currentTag = tag;
    currentPage = 1;

    if (tag === 'All') {
      filteredArticles = [...allArticles];
    } else {
      filteredArticles = allArticles.filter(article => {
        const tags = article.tags ? article.tags.split(',').map(t => t.trim()) : [];
        return tags.includes(tag);
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

      // Remove 'active' from all buttons
      tagButtons.forEach(btn => btn.classList.remove('primary'));

      // Add 'active' to the clicked one
      button.classList.add('primary');

      // Filter logic
      if (!tag || tag.toLowerCase() === 'all') {
        filteredArticles = [...allArticles];
      } else {
        filteredArticles = allArticles.filter(article =>
          article.tags && article.tags.toLowerCase().includes(tag.toLowerCase())
        );
      }

      currentPage = 1;
      renderArticles();
      renderPagination();
    });
  });
  }

  fetch('/pages/articles/articles.csv')
    .then(res => res.text())
    .then(csvText => {
      const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
      allArticles = parsed.data
        .filter(article =>
          article.title && article.slug && article.image && article.summary
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      filteredArticles = [...allArticles];

      renderArticles();
      renderPagination();
      setupTagButtons();
    });

  paginationContainer.addEventListener('click', handlePaginationClick);
});
