document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.mini-posts');
  console.log('mini-posts container:', container);
});

document.addEventListener('DOMContentLoaded', () => {
  fetch('/pages/articles/articles.csv')
    .then(res => res.text())
    .then(csvText => {
      const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
      let articles = parsed.data;

      /*
      articles = articles.filter(article => {
        const title = (article.title ?? '').toString().trim();
        const slug = (article.slug ?? '').toString().trim();
        const image = (article.image ?? '').toString().trim();
        const summary = (article.summary ?? '').toString().trim();
        return title !== '' && slug !== '' && image !== '' && summary !== '';
      });
      */

      articles.sort((a, b) => new Date(b.date) - new Date(a.date));

      const sidebarArticles = articles.slice(0, 3);

      const container = document.querySelector('.mini-posts');
      container.innerHTML = '';

      const charLimit = 100;

      sidebarArticles.forEach(article => {
        let summary = article.summary;
        if (summary.length > charLimit) {
          summary = summary.slice(0, charLimit).trim() + '...';
        }

        container.innerHTML += `
          <article>
            <a href="/pages/articles/published/${article.slug}.html" class="image">
              <img src="${article.image}" alt="${article.title}" />
            </a>
            <p>${summary}</p>
          </article>
        `;
      });
    })
    .catch(err => {
      console.error('Error loading sidebar articles:', err);
    });
});
