/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies cause hard-to-debug issues and prevent proper tree-shaking',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment: 'Orphaned modules may indicate dead code that should be removed',
      from: {
        orphan: true,
        pathNot: ['\\.spec\\.ts$', '\\.module\\.ts$', 'main\\.ts$', '\\.config\\.(ts|js|mjs)$'],
      },
      to: {},
    },
    {
      name: 'backend-cannot-import-frontend',
      severity: 'error',
      comment: 'Backend should never depend on frontend code',
      from: { path: '^backend/' },
      to: { path: '^frontend/' },
    },
    {
      name: 'frontend-cannot-import-backend',
      severity: 'error',
      comment: 'Frontend should never directly import backend code',
      from: { path: '^frontend/' },
      to: { path: '^backend/' },
    },
    {
      name: 'no-test-dependencies-in-production',
      severity: 'error',
      comment: 'Test dependencies should not be imported in production code',
      from: {
        path: '^(frontend|backend)/src',
        pathNot: '\\.spec\\.ts$',
      },
      to: {
        dependencyTypes: ['devDependencies'],
        pathNot: [
          'node_modules/@types',
          'node_modules/tslib',
          'node_modules/rxjs',
          'node_modules/reflect-metadata',
        ],
      },
    },
  ],
  options: {
    doNotFollow: {
      path: ['node_modules', 'dist', '.nx', 'coverage'],
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.base.json',
    },
    reporterOptions: {
      dot: {
        collapsePattern: '^(node_modules|frontend/src|backend/src)/[^/]+',
      },
      archi: {
        collapsePattern: '^(node_modules|frontend|backend)/[^/]+',
      },
    },
  },
};
