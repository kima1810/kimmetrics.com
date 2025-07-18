#!/bin/bash

echo "Generating article metadata CSV..."
python3 scripts/generate_article_metadata.py

if [ $? -eq 0 ]; then
    echo "✅ Metadata generated successfully!"
else
    echo "❌ Error generating metadata."
fi
