fetch('/pages/articles/articles.csv')
  .then(res => res.text())
  .then(csvText => {
    const parsed = Papa.parse(csvText, { header: true });
    const articles = parsed.data;
    const container = document.getElementById('recent-articles-container');
    articles
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6)
      .forEach(article => {
        container.innerHTML += `
          <article>
            <a href="/pages/articles/published/${article.slug}.html" class="image">
              <img src="${article.image}" alt="${article.title}" />
            </a>
            <h3>${article.title}</h3>
            <p>${article.summary}</p>
            <ul class="actions">
              <li><a href="/pages/articles/published/${article.slug}.html" class="button">More</a></li>
            </ul>
          </article>
        `;
      });
  });