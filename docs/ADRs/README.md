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

### [ADR-001: Use Angular Signals for State Management](ADR-001-signals-state-management.md)

For v0.1 of Tasker, we need a state management solution that:

### [ADR-002: Use NestJS with Prisma and PostgreSQL](ADR-002-nestjs-prisma-postgresql.md)

For Tasker (v0.1-v2.0+), we need:

### [ADR-002: Use NestJS with TypeORM and SQLite](ADR-002-nestjs-typeorm-sqlite.md)

For v0.1-v1.0 of Tasker, we need:

### [ADR-003: Use PrimeNG + Tailwind CSS](ADR-003-primeng-tailwind.md)

For Tasker's UI, we need:

### [ADR-004: Enable Zoneless Change Detection](ADR-004-zoneless-change-detection.md)

Angular traditionally uses Zone.js to automatically detect when to update the view. However, Zone.js:

---

## Creating a New ADR

1. Create a new file: `docs/ADRs/ADR-XXX-decision-title.md`
2. Use sequential numbering (check existing ADRs for the next number)
3. Follow the ADR template structure
4. Run this script or commit (pre-commit hook will update the index automatically)

## References

- [ADR GitHub Organization](https://adr.github.io/)
- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
