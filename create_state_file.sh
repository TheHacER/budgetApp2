#!/bin/bash

# This script gathers specific project code and config files into a single text file.

OUTPUT_FILE="project_state.txt"

# Delete the old output file if it exists
rm -f $OUTPUT_FILE

echo "Gathering project code and config files into $OUTPUT_FILE..."

# Define a list of file patterns to find
find . \
-type f \( \
    -name "*.js" -o \
    -name "*.jsx" -o \
    -name "*.json" -o \
    -name "*.yml" -o \
    -name "*.sh" -o \
    -name "*.css" -o \
    -name "*.html" -o \
    -name "Dockerfile*" -o \
    -name "*.conf" \
\) \
-not -path '*/node_modules/*' \
-not -path '*/build/*' \
-not -path '*/.git/*' \
-not -name "$OUTPUT_FILE" \
-not -name ".DS_Store" | while read -r file; do
  # Print a header for each file
  echo "--- FILE: $file ---" >> $OUTPUT_FILE
  # Append the content of the file
  cat "$file" >> $OUTPUT_FILE
  # Add a newline for separation
  echo "" >> $OUTPUT_FILE
done

echo "Done. Please upload the file named '$OUTPUT_FILE'."
