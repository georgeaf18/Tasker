#!/bin/bash

# AI-Generated Code Validation Script
# Validates code quality standards for AI-generated code

set -e

echo "🤖 Validating AI-generated code quality..."

# Check for common issues in staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

if [ -z "$STAGED_FILES" ]; then
  echo "✅ No staged files to validate"
  exit 0
fi

# Check TypeScript files for 'any' types
TS_FILES=$(echo "$STAGED_FILES" | grep -E '\.(ts|tsx)$' || true)
if [ -n "$TS_FILES" ]; then
  echo "📝 Checking TypeScript files for type safety..."

  # Check for explicit 'any' types (allowing comments)
  ANY_FOUND=$(echo "$TS_FILES" | xargs grep -n ": any\|<any>\|any\[\]" 2>/dev/null || true)

  if [ -n "$ANY_FOUND" ]; then
    echo "⚠️  Warning: Found 'any' types in code:"
    echo "$ANY_FOUND"
    echo ""
    echo "💡 Consider using specific types instead of 'any' for better type safety"
    echo "   (This is a warning, not blocking the commit)"
  fi
fi

# Check for TODO/FIXME comments added by AI
TODO_FOUND=$(echo "$STAGED_FILES" | xargs grep -n "TODO\|FIXME" 2>/dev/null || true)
if [ -n "$TODO_FOUND" ]; then
  echo "📋 Found TODO/FIXME comments:"
  echo "$TODO_FOUND"
  echo ""
fi

# Check for console.log in production code (excluding test files)
NON_TEST_FILES=$(echo "$STAGED_FILES" | grep -vE '\.(spec|test)\.(ts|tsx|js|jsx)$' || true)
if [ -n "$NON_TEST_FILES" ]; then
  CONSOLE_FOUND=$(echo "$NON_TEST_FILES" | xargs grep -n "console\.log\|console\.debug" 2>/dev/null || true)

  if [ -n "$CONSOLE_FOUND" ]; then
    echo "⚠️  Warning: Found console.log/debug statements in non-test files:"
    echo "$CONSOLE_FOUND"
    echo ""
    echo "💡 Consider removing debug statements or using a proper logging framework"
    echo "   (This is a warning, not blocking the commit)"
  fi
fi

echo "✅ AI code validation complete"
exit 0
