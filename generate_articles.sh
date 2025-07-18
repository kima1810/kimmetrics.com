#!/bin/bash

echo "Generating article metadata CSV..."
py assets/py/writeToArticleCSV.py

if [ $? -eq 0 ]; then
    echo "✅ Metadata generated successfully!"
else
    echo "❌ Error generating metadata."
fi
