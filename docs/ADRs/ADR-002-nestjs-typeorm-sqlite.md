# ADR-002: Use NestJS with TypeORM and SQLite

**Status:** Accepted
**Date:** 2025-11-12
**Decision Makers:** George
**Tags:** backend, database, orm

## Context

For v0.1-v1.0 of Tasker, we need:

- A Node.js backend framework that's well-structured and maintainable
- A database solution that's simple to set up and deploy locally
- An ORM that provides type safety and works well with TypeScript
- Easy local development without external dependencies (no PostgreSQL server)
- Clear migration path to more robust database for v2.0+ if needed

## Decision

We will use:

- **NestJS** as the backend framework
- **TypeORM** as the ORM
- **SQLite** (via better-sqlite3) as the database for v0.1-v1.0

## Rationale

### Why NestJS?

1. **Angular-Like Architecture**
   - Similar module structure to Angular
   - Dependency injection
   - Decorators-based routing
   - Easier mental model switching between frontend/backend

2. **Built-In Best Practices**
   - Structured project organization
   - Built-in validation (class-validator)
   - Built-in serialization (class-transformer)
   - Exception filters, guards, interceptors

3. **TypeScript-First**
   - Native TypeScript support
   - Excellent type safety
   - Shared types between frontend/backend

4. **Developer Experience**
   - CLI for scaffolding
   - Hot reload in development
   - Comprehensive documentation
   - Large ecosystem

5. **REST API Support**
   - Clean controller syntax
   - OpenAPI/Swagger integration (v1.0+)
   - Request validation out-of-the-box

### Why TypeORM?

1. **TypeScript Integration**
   - Decorators for entity definition
   - Type-safe queries
   - TypeScript-first design

2. **NestJS Integration**
   - Official `@nestjs/typeorm` package
   - Seamless dependency injection
   - Well-documented patterns

3. **Entity-Based Design**
   - Clear data models
   - Relationships defined in code
   - Automatic migrations (dev mode)

4. **Multiple Database Support**
   - SQLite for v0.1-v1.0
   - Easy switch to PostgreSQL for v2.0+
   - Same code, different driver

5. **Query Builder**
   - Type-safe queries
   - Complex queries without raw SQL
   - Chainable API

### Why SQLite?

1. **Zero Setup**
   - Single file database
   - No server to install/run
   - Included in Node.js via better-sqlite3

2. **Perfect for Local-First**
   - Fast read/write
   - No network latency
   - No connection pooling complexity

3. **Portable**
   - Copy database file = backup
   - Easy to move between machines
   - Simple export/import

4. **Sufficient for v0.1-v1.0**
   - Single user (just me)
   - Low concurrent writes
   - < 100,000 tasks expected

5. **Clear Limitations**
   - Forces good practices (efficient queries)
   - Motivates v2.0 PostgreSQL migration if multi-user needed
   - Easy to test migration path

## Implementation Examples

### Entity Definition

```typescript
// task.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Channel, { nullable: true })
  channel: Channel;

  @Column({ type: 'text', enum: TaskStatus })
  status: TaskStatus;

  @Column({ type: 'boolean', default: false })
  isRoutine: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Service Layer

```typescript
// tasks.service.ts
@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>
  ) {}

  async findAll(filters?: TaskFilters): Promise<Task[]> {
    const query = this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.channel', 'channel');

    if (filters?.status) {
      query.andWhere('task.status = :status', { status: filters.status });
    }

    if (filters?.workspace) {
      query.andWhere('task.workspace = :workspace', { workspace: filters.workspace });
    }

    return query.getMany();
  }

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.tasksRepository.create(createTaskDto);
    return this.tasksRepository.save(task);
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    await this.tasksRepository.update(id, updateTaskDto);
    return this.findOne(id);
  }
}
```

### Database Configuration

```typescript
// database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'better-sqlite3',
  database: './database/tasker.db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
};
```

## Comparison with Alternatives

### Backend Frameworks

| Feature        | NestJS     | Express     | Fastify     | Koa        |
| -------------- | ---------- | ----------- | ----------- | ---------- |
| Structure      | High       | Low         | Medium      | Low        |
| TypeScript     | Native     | Plugin      | Good        | Plugin     |
| DI System      | Yes        | No          | Plugin      | No         |
| Learning Curve | Medium     | Low         | Low         | Low        |
| Boilerplate    | Medium     | Low         | Low         | Low        |
| Best For       | Large apps | Simple APIs | Performance | Minimalism |

**Verdict:** NestJS for structure and DX

### ORMs

| Feature        | TypeORM    | Prisma      | MikroORM   | Sequelize   |
| -------------- | ---------- | ----------- | ---------- | ----------- |
| TypeScript     | Good       | Excellent   | Excellent  | Plugin      |
| NestJS Support | Official   | Community   | Community  | Community   |
| Entity Model   | Decorators | Schema file | Decorators | Class-based |
| Migrations     | Yes        | Yes         | Yes        | Yes         |
| Type Safety    | Good       | Excellent   | Excellent  | Weak        |
| SQLite Support | Yes        | Yes         | Yes        | Yes         |

**Verdict:** TypeORM for NestJS integration and familiarity

### Databases

| Feature           | SQLite      | PostgreSQL | MySQL      | MongoDB        |
| ----------------- | ----------- | ---------- | ---------- | -------------- |
| Setup             | None        | Server     | Server     | Server         |
| ACID              | Yes         | Yes        | Yes        | Limited        |
| Concurrent Writes | Low         | High       | High       | High           |
| JSON Support      | Limited     | Excellent  | Good       | Native         |
| Perfect For       | Local-first | Production | Production | Document-heavy |

**Verdict:** SQLite for v0.1-v1.0, PostgreSQL for v2.0+

## Consequences

### Positive

- ✅ Quick setup, zero infrastructure
- ✅ Type-safe full-stack TypeScript
- ✅ Structured codebase (not spaghetti Express)
- ✅ Automatic change detection in dev (synchronize: true)
- ✅ Easy database backup (copy .db file)
- ✅ No network latency
- ✅ Works offline

### Negative

- ⚠️ SQLite not suitable for multi-user (known, acceptable)
- ⚠️ TypeORM has some quirks (e.g., decorators can be verbose)
- ⚠️ NestJS has more boilerplate than Express
- ⚠️ SQLite lacks some PostgreSQL features (jsonb, full-text search)
- ⚠️ Must migrate to PostgreSQL for v2.0 if multi-user needed

### Risks & Mitigations

| Risk                     | Mitigation                                   |
| ------------------------ | -------------------------------------------- |
| SQLite file corruption   | Regular backups, export feature in v1.0      |
| Concurrent write locks   | Single-user app, not a concern for v0.1-v1.0 |
| TypeORM breaking changes | Pin versions, test before upgrading          |
| NestJS overhead          | Only concern at massive scale (not our case) |

## Migration Path to PostgreSQL (v2.0+)

When we need multi-user support:

1. **Keep TypeORM** - Just change database config
2. **Update driver** - Replace better-sqlite3 with pg
3. **Schema stays same** - Entities are database-agnostic
4. **Update queries** - Adjust SQLite-specific queries (e.g., datetime)
5. **Add migrations** - Use TypeORM migrations in production

```typescript
// Future PostgreSQL config
export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres', // Changed from 'better-sqlite3'
  host: process.env.DB_HOST,
  port: 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // Use migrations in production
  migrations: ['dist/migrations/*.js'],
};
```

## Alternatives Considered

### Express + Sequelize + SQLite

**Pros:** Lightweight, flexible, popular
**Cons:** No structure, manual everything, weak TypeScript support
**Verdict:** Too unstructured for maintainability

### Fastify + Prisma + SQLite

**Pros:** Fast, modern, excellent TypeScript
**Cons:** Less mature NestJS integration, different patterns
**Verdict:** Prisma is great but NestJS + TypeORM is more cohesive

### NestJS + Prisma + SQLite

**Pros:** Best TypeScript support, great DX
**Cons:** Extra schema file to maintain, less NestJS examples
**Verdict:** Strong alternative, but TypeORM wins for familiarity

### Serverless (Lambda + DynamoDB)

**Pros:** Scalable, no server management
**Cons:** Overkill, costs money, latency, not local-first
**Verdict:** Wrong architecture for this use case

## Performance Considerations

### SQLite Performance

- **Reads:** Extremely fast (local file)
- **Writes:** Fast for single user
- **Concurrent writes:** Limited (not a concern for solo use)
- **File size:** Compact, < 100 MB expected for years of tasks

### When to Migrate

Migrate to PostgreSQL when:

- Multiple users need simultaneous write access
- Need full-text search (FTS5 in SQLite is limited)
- Database size > 1 GB
- Need advanced features (jsonb, arrays, complex queries)

## References

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [better-sqlite3 GitHub](https://github.com/WiseLibs/better-sqlite3)
- [SQLite Limitations](https://www.sqlite.org/whentouse.html)
- [TypeORM SQLite Support](https://typeorm.io/data-source-options#sqlite-data-source-options)

## Review Schedule

- **v0.3:** Evaluate TypeORM query performance with larger datasets
- **v1.0:** Assess if SQLite is still sufficient
- **v2.0:** Plan PostgreSQL migration if multi-user needed

---

**Decision Owner:** George
**Reviewed By:** N/A (solo project)
**Next Review:** v1.0 (before production release)
