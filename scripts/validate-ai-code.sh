#!/bin/bash

echo "🤖 Validating AI-generated code..."
echo ""

# Exit immediately if a command exits with a non-zero status
set -e

ERRORS=0

# Check for console.log statements (allow console.warn and console.error)
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR || true)
if [ -n "$STAGED_FILES" ]; then
  if echo "$STAGED_FILES" | xargs -I {} sh -c 'git diff --cached {} | grep -E "^\+.*console\.log\(" && echo "Found in {}"' 2>/dev/null; then
    echo "❌ Found console.log statements. Please remove or use console.warn/console.error for logging."
    ERRORS=$((ERRORS + 1))
  fi
fi

# Check for TODO comments
if [ -n "$STAGED_FILES" ]; then
  if echo "$STAGED_FILES" | xargs -I {} sh -c 'git diff --cached {} | grep -E "^\+.*//\s*TODO" && echo "Found in {}"' 2>/dev/null; then
    echo "⚠️  Found TODO comments. Create Linear tasks (TASK-xxx) instead of leaving TODOs in code."
    ERRORS=$((ERRORS + 1))
  fi
fi

# Check for 'any' types in TypeScript files
TS_FILES=$(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(ts|tsx)$' || true)
if [ -n "$TS_FILES" ]; then
  if echo "$TS_FILES" | xargs -I {} sh -c 'git diff --cached {} | grep -E "^\+.*:\s*any[^A-Za-z]" && echo "Found in {}"'; then
    echo "⚠️  Found 'any' types. Consider using specific types or 'unknown' for better type safety."
    ERRORS=$((ERRORS + 1))
  fi
fi

# Check for FIXME comments
if [ -n "$STAGED_FILES" ]; then
  if echo "$STAGED_FILES" | xargs -I {} sh -c 'git diff --cached {} | grep -E "^\+.*//\s*FIXME" && echo "Found in {}"' 2>/dev/null; then
    echo "⚠️  Found FIXME comments. Create Linear tasks (TASK-xxx) to track fixes properly."
    ERRORS=$((ERRORS + 1))
  fi
fi

# Check test files exist for new source files
NEW_SOURCE_FILES=$(git diff --cached --name-only --diff-filter=A | grep -E '\.(ts|tsx)$' | grep -v '\.spec\.ts$' | grep -v '\.test\.ts$' | grep -v '\.config\.ts$' | grep -v '\.module\.ts$' | grep -E '(frontend|backend)/src/' || true)

if [ -n "$NEW_SOURCE_FILES" ]; then
  for file in $NEW_SOURCE_FILES; do
    # Determine the test file extension based on the project
    if [[ $file == *"frontend"* ]]; then
      test_file="${file%.ts}.spec.ts"
      test_file="${test_file%.tsx}.spec.ts"
    else
      test_file="${file%.ts}.spec.ts"
    fi

    # Check if test file exists or is being added in this commit
    if [ ! -f "$test_file" ] && ! git diff --cached --name-only | grep -q "^${test_file}$"; then
      echo "❌ Missing test file for $file"
      echo "   Expected: $test_file"
      ERRORS=$((ERRORS + 1))
    fi
  done
fi

echo ""

# Exit with error if any issues found
if [ $ERRORS -gt 0 ]; then
  echo "❌ Validation failed with $ERRORS error(s)!"
  echo ""
  echo "💡 Tips:"
  echo "  - Remove console.log statements or use proper logging"
  echo "  - Create Linear tasks instead of TODO/FIXME comments"
  echo "  - Add specific TypeScript types instead of 'any'"
  echo "  - Add test files for all new source files"
  echo ""
  exit 1
fi

echo "✅ AI code validation passed!"
echo ""
