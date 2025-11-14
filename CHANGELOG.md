# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive E2E test suite with Playwright
- Page Object Model pattern for maintainability
- Test coverage for task creation, editing, deletion, kanban workflow, workspace filtering
- E2E documentation (QUICKSTART.md, DATA_TESTID_REQUIREMENTS.md, README.md)
- API helper for backend test data management

### Changed

- Optimized kanban column header sizing (reduced padding to 0px 4px)
- Increased column header font size to 26px for better readability
- Maintained letter spacing at 0.5px per ADHD-friendly design requirements
- Applied ADHD-friendly design system colors to column headers (blue, purple, green)
- Removed duplicate "Backlog" label from sidebar
- Removed all padding from backlog sidebar panel for flush layout
- Updated app test to use proper Angular testing providers (HttpClient, Animations)

### Fixed

- Broken Tailwind conversion that broke PrimeNG component styling
- Restored custom CSS classes for PrimeNG compatibility (::ng-deep selectors required)
- Fixed failing unit test by providing HttpClient and NoopAnimations in test config
- Removed broken TaskFormComponent references from app

### Technical

- Reverted inline Tailwind utilities that conflicted with PrimeNG ::ng-deep selectors
- Frontend compiling successfully at 166.78 kB dev bundle
- All unit tests passing (2/2)

## [0.0.1] - 2025-01-XX

### Added

- Initial project setup with Nx monorepo
- Angular 20 frontend with signals and zoneless architecture
- NestJS backend with Prisma ORM
- PostgreSQL database
- PrimeNG UI component library
- Tailwind CSS integration
- Basic kanban board structure
- Backlog sidebar with task organization
- Workspace and channel management
- Task CRUD operations via REST API
