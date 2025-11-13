# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive code quality tooling for AI-assisted development
- ESLint complexity rules (max 10, depth 3, 50 lines per function)
- Jest coverage thresholds (75% global, 85% backend business logic)
- Dependency Cruiser for architectural enforcement
- AI code validation script (pre-commit hook)
- Pull request template with comprehensive checklists
- AI Coding Guidelines documentation
- TypeDoc for API documentation generation
- Renovate bot configuration for automated dependency updates
- Danger.js for PR automation and checks
- CHANGELOG automation with conventional-changelog

### Changed

- TypeScript strict mode enabled in tsconfig.base.json
- Git hooks updated with lint-staged and AI validation
- Pre-push hook now runs unit tests and critical e2e tests

## [0.0.1] - 2024-11-12

### Added

- Initial NX monorepo setup
- Angular 20 frontend with signals-based state management
- NestJS backend
- SQLite database with better-sqlite3
- Git hooks with Husky
- Commit message validation with TASK-xxx requirement
- Pre-push hook to prevent direct pushes to main/develop
- Prettier and ESLint configuration
- EditorConfig and VS Code settings

[Unreleased]: https://github.com/yourusername/tasker/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/yourusername/tasker/releases/tag/v0.0.1
