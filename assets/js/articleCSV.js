fetch('/pages/articles/articles.csv')
  .then(res => res.text())
  .then(csvText => {
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    let articles = parsed.data;

    // Log raw articles for debugging
    console.log('Parsed articles:', articles);

    // Filter out articles missing required fields, trim to avoid whitespace issues
    articles = articles.filter(article => {
      return article.title && article.title.trim() !== '' &&
             article.slug && article.slug.trim() !== '' &&
             article.image && article.image.trim() !== '' &&
             article.summary && article.summary.trim() !== '';
    });

    // Log after filtering
    console.log('Filtered articles:', articles);

    // Sort by date descending (assuming date field exists and is ISO format)
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));

    const container = document.getElementById('recent-articles-container');
    container.innerHTML = '';  // Clear container first

    // Limit to 6 articles or fewer if less available
    const maxArticles = 6;
    const articlesToShow = articles.slice(0, maxArticles);

    if (articlesToShow.length === 0) {
      container.innerHTML = '<p>No articles found.</p>';
      console.warn('No articles to display');
      return;
    }

    // Character limit for summary preview
    const charLimit = 150;

    articlesToShow.forEach(article => {
      // Truncate summary if needed
      let summary = article.summary;
      if (summary.length > charLimit) {
        summary = summary.slice(0, charLimit).trim() + '...';
      }

      container.innerHTML += `
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
  })
  .catch(err => {
    console.error('Error loading articles:', err);
  });
