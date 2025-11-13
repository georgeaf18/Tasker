import baseConfig from '../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: {
      // NestJS-specific best practices
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // Stricter rules for backend
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'off', // Handled by unused-imports plugin

      // NestJS decorators and dependency injection
      '@typescript-eslint/no-extraneous-class': 'off', // Allow classes for DI
      'no-useless-constructor': 'off',
      '@typescript-eslint/no-useless-constructor': 'off',

      // Security and best practices
      'no-console': ['error', { allow: ['warn', 'error'] }], // Stricter for backend
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
    rules: {
      // Relaxed rules for test files
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
];
