import os
import csv
import re
from bs4 import BeautifulSoup

folder = './pages/articles/published/'
output = './pages/articles/articles.csv'

data = []

for filename in os.listdir(folder):
    if filename.endswith('.html'):
        with open(os.path.join(folder, filename), 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f, 'html.parser')
            title = soup.find('h1').get_text(strip=True) if soup.find('h1') else ''
            time_tag = soup.find('time')
            date = time_tag.get('datetime', '') if time_tag else filename[:10]
            img = soup.find('img')
            image_src = img['src'] if img else ''
            p = soup.find('p')
            summary = p.get_text(strip=True) if p else ''
            slug = os.path.splitext(filename)[0]
            data.append([slug, title, date, image_src, summary])

with open(output, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['slug', 'title', 'date', 'image', 'summary'])
    writer.writerows(data)
