import { getJestProjectsAsync } from '@nx/jest';
import type { Config } from 'jest';

export default async (): Promise<Config> => ({
  projects: await getJestProjectsAsync(),
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.spec.ts',
    '!**/*.test.ts',
    '!**/*.interface.ts',
    '!**/*.module.ts',
    '!**/*.config.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/.nx/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75,
    },
    // Stricter for backend business logic (when created)
    './backend/src/**/!(*.spec|*.module|*.config).ts': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
});
