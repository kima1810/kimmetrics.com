import site
site.addsitedir('C:/Users/alexy/AppData/Roaming/Python/Python313/site-packages')
import os
import csv
from bs4 import BeautifulSoup

folder = './pages/articles/published/'
output = './pages/articles/articles.csv'

data = []

# Limit size of preview text
def trim_text(text, limit=150):
    return text if len(text) <= limit else text[:limit].rstrip() + "..."

for filename in os.listdir(folder):
    if filename.endswith('.html'):
        with open(os.path.join(folder, filename), 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f, 'lxml')

            # Get <h1> or fallback to <title> or filename
            h1 = soup.find('h1')
            title = h1.get_text(strip=True) if h1 else (soup.title.string.strip() if soup.title else filename)

            # Get <time> or fallback to date from filename
            time_tag = soup.find('time')
            date = time_tag.get('datetime', '') if time_tag and time_tag.has_attr('datetime') else filename[:10]

            # Get first <img> or fallback
            img_tag = soup.find('img')
            image_src = img_tag['src'] if img_tag and img_tag.has_attr('src') else '/images/default.jpg'

            # Get first <p> or fallback
            p_tag = soup.find('p')
            summary = trim_text(p_tag.get_text(strip=True) if p_tag else 'No summary available.')

            # Get tags from <meta name="tags" content="tag1, tag2, ...">
            meta_tags = soup.find('meta', attrs={'name': 'tags'})
            tags = meta_tags['content'].strip() if meta_tags and meta_tags.has_attr('content') else ''

            slug = os.path.splitext(filename)[0]

            data.append([slug, title, date, image_src, summary, tags])

with open(output, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['slug', 'title', 'date', 'image', 'summary', 'tags'])
    writer.writerows(data)
