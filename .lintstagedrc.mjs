export default {
  '*.{ts,tsx,js,jsx,mjs}': ['prettier --write', 'eslint --fix --max-warnings=0'],
  '*.{html,css,scss,json,md}': ['prettier --write'],
  'docs/ADRs/ADR-*.md': ['bash scripts/update-adr-index.sh', () => 'git add docs/ADRs/README.md'],
};
