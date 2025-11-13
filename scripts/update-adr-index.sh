#!/bin/bash

# Script to automatically update the ADR index
# This script scans docs/ADRs/ for ADR files and generates an index

ADR_DIR="docs/ADRs"
INDEX_FILE="$ADR_DIR/README.md"

echo "📚 Updating ADR index..."

# Create ADR directory if it doesn't exist
mkdir -p "$ADR_DIR"

# Start building the index
cat > "$INDEX_FILE" << 'EOF'
# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records for the Tasker project.

## What is an ADR?

An Architecture Decision Record (ADR) captures an important architectural decision made along with its context and consequences.

## ADR Format

Each ADR should follow this structure:
- **Title**: Short noun phrase describing the decision
- **Status**: Proposed, Accepted, Deprecated, Superseded
- **Context**: What is the issue that we're seeing that is motivating this decision or change
- **Decision**: What is the change that we're proposing and/or doing
- **Consequences**: What becomes easier or more difficult to do because of this change

## All ADRs

EOF

# Find all ADR markdown files (excluding README.md)
ADR_FILES=$(find "$ADR_DIR" -maxdepth 1 -name "ADR-*.md" -o -name "adr-*.md" | sort)

if [ -z "$ADR_FILES" ]; then
  echo "No ADR files found yet." >> "$INDEX_FILE"
  echo ""  >> "$INDEX_FILE"
  echo "To create your first ADR, create a file named \`ADR-001-your-decision-title.md\`" >> "$INDEX_FILE"
else
  # Process each ADR file
  while IFS= read -r adr_file; do
    filename=$(basename "$adr_file")

    # Extract title from first # heading in the file
    title=$(grep -m 1 "^# " "$adr_file" | sed 's/^# //' || echo "$filename")

    # Extract status if available
    status=$(grep -i "^##\? Status:" "$adr_file" | sed 's/^##\? Status: *//' | head -1 || echo "")

    # Build the index entry
    echo "### [$title]($filename)" >> "$INDEX_FILE"

    if [ -n "$status" ]; then
      echo "" >> "$INDEX_FILE"
      echo "**Status**: $status" >> "$INDEX_FILE"
    fi

    # Extract first paragraph after title as description
    description=$(awk '/^# /{flag=1; next} flag && /^[A-Za-z]/{print; exit}' "$adr_file" || echo "")

    if [ -n "$description" ]; then
      echo "" >> "$INDEX_FILE"
      echo "$description" >> "$INDEX_FILE"
    fi

    echo "" >> "$INDEX_FILE"
  done <<< "$ADR_FILES"
fi

# Add footer
cat >> "$INDEX_FILE" << 'EOF'

---

## Creating a New ADR

1. Create a new file: `docs/ADRs/ADR-XXX-decision-title.md`
2. Use sequential numbering (check existing ADRs for the next number)
3. Follow the ADR template structure
4. Run this script or commit (pre-commit hook will update the index automatically)

## References

- [ADR GitHub Organization](https://adr.github.io/)
- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
EOF

echo "✅ ADR index updated at $INDEX_FILE"
