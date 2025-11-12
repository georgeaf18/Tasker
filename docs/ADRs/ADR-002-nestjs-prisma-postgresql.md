# ADR-002: Use NestJS with Prisma and PostgreSQL

**Status:** Accepted
**Date:** 2025-11-12 (Updated)
**Decision Makers:** George
**Tags:** backend, database, orm, rest-api

## Context

For Tasker (v0.1-v2.0+), we need:
- A Node.js backend framework that's well-structured and maintainable
- A database solution that's production-ready and scalable
- An ORM that provides type safety and works excellently with TypeScript
- RESTful API with proper validation
- Production deployment from day 1 (separate frontend/backend servers)

## Decision

We will use:
- **NestJS** as the backend framework
- **Prisma** as the ORM
- **PostgreSQL** as the database (all versions)
- **REST API** as the API layer

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
   - Built-in decorators for HTTP methods (@Get, @Post, @Put, @Delete)
   - Automatic validation with class-validator
   - Exception filters for error handling
   - Swagger/OpenAPI integration available

### Why Prisma?

1. **Best-in-Class TypeScript Support**
   - Generates fully-typed client from schema
   - Autocomplete for all queries
   - Compile-time type safety
   - Zero runtime type checking overhead

2. **Modern Developer Experience**
   - Intuitive Prisma Schema Language (PSL)
   - Visual database browser (Prisma Studio)
   - Excellent VS Code extension
   - Clear, readable queries

3. **Production-Ready Migrations**
   - Git-friendly migration files
   - Automatic migration generation
   - Safe database schema evolution
   - Rollback support

4. **Clean API Integration**
   - Works seamlessly with REST controllers
   - No impedance mismatch
   - Clean separation: Prisma handles DB, NestJS handles API
   - Can use Prisma models directly or map to DTOs

5. **Performance**
   - Efficient query engine (written in Rust)
   - Connection pooling built-in
   - Query optimization
   - N+1 query prevention with `include`

6. **Ecosystem**
   - Active development and community
   - Excellent documentation
   - Regular updates
   - Commercial support available

### Why PostgreSQL?

1. **Production-Ready from Day 1**
   - Battle-tested, mature database
   - Used by companies at all scales
   - No need to migrate later (v0.1 → v2.0+)

2. **Rich Feature Set**
   - JSONB for flexible data
   - Full-text search
   - Advanced indexing (GIN, GiST)
   - Row-level security
   - Triggers and stored procedures

3. **Excellent TypeScript/Prisma Support**
   - First-class Prisma support
   - Type-safe queries
   - All PostgreSQL features accessible

4. **Managed Hosting Options**
   - Neon (serverless, generous free tier)
   - Supabase (includes auth, storage, realtime)
   - Railway (simple deployment)
   - AWS RDS, GCP Cloud SQL (enterprise)

5. **Developer Tools**
   - pgAdmin, Postico, TablePlus
   - Prisma Studio works great with PostgreSQL
   - Docker for local development

6. **Scalability**
   - Handles millions of rows efficiently
   - Read replicas for scaling reads
   - Horizontal scaling with Citus
   - Partitioning for large tables

## Implementation Examples

### Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Task {
  id          Int        @id @default(autoincrement())
  title       String
  description String?
  workspace   Workspace  @default(PERSONAL)
  channelId   Int?       @map("channel_id")
  channel     Channel?   @relation(fields: [channelId], references: [id], onDelete: SetNull)
  status      TaskStatus @default(BACKLOG)
  dueDate     DateTime?  @map("due_date")
  isRoutine   Boolean    @default(false) @map("is_routine")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")

  @@index([status])
  @@index([workspace])
  @@index([channelId])
  @@map("tasks")
}

enum TaskStatus {
  BACKLOG
  TODAY
  IN_PROGRESS
  DONE
}

enum Workspace {
  WORK
  PERSONAL
}
```

### Service Layer with Prisma

```typescript
@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { status?: TaskStatus; workspace?: Workspace }) {
    return this.prisma.task.findMany({
      where: {
        status: filters?.status,
        workspace: filters?.workspace,
      },
      include: {
        channel: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(input: CreateTaskDto) {
    return this.prisma.task.create({
      data: input,
      include: {
        channel: true,
      },
    });
  }

  async update(id: number, input: UpdateTaskDto) {
    return this.prisma.task.update({
      where: { id },
      data: input,
      include: {
        channel: true,
      },
    });
  }
}
```

### REST Controller

```typescript
@Controller('api/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(
    @Query('status') status?: TaskStatus,
    @Query('workspace') workspace?: Workspace,
  ) {
    return this.tasksService.findAll({ status, workspace });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Put(':id')
  updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, updateTaskDto);
  }
}
```

## Comparison with Alternatives

### ORMs

| Feature | Prisma | TypeORM | MikroORM | Sequelize |
|---------|--------|---------|----------|-----------|
| TypeScript | Excellent | Good | Excellent | Poor |
| Developer Experience | Excellent | Good | Good | Fair |
| Migration System | Excellent | Good | Good | Fair |
| Type Safety | Excellent | Good | Excellent | Weak |
| REST API Integration | Excellent | Good | Good | Fair |
| Documentation | Excellent | Good | Good | Good |
| Performance | Excellent | Good | Good | Fair |
| Learning Curve | Low | Medium | Medium | Low |
| Active Development | High | Medium | Medium | Low |

**Verdict:** Prisma for best DX and type safety

### Databases

| Feature | PostgreSQL | MySQL | MongoDB | SQLite |
|---------|-----------|-------|---------|--------|
| Type System | Strong | Good | Flexible | Limited |
| JSONB Support | Native | JSON | Native | Limited |
| Full-Text Search | Excellent | Good | Good | Basic |
| Scalability | Excellent | Excellent | Excellent | Poor |
| Transactions | ACID | ACID | Limited | ACID |
| Setup Complexity | Low (managed) | Low | Low | None |
| Production Ready | Yes | Yes | Yes | No (multi-user) |
| Managed Hosting | Many options | Many options | Many options | N/A |

**Verdict:** PostgreSQL for production-ready features and ecosystem

## Consequences

### Positive

- ✅ Production-ready from day 1 (no migration needed)
- ✅ Best-in-class TypeScript support
- ✅ Type-safe database queries
- ✅ Clean REST API integration with NestJS
- ✅ Modern migration system
- ✅ Rich PostgreSQL features (JSONB, full-text search, etc.)
- ✅ Scalable from the start
- ✅ Many managed hosting options (Neon free tier!)
- ✅ Prisma Studio for visual database management
- ✅ Type safety across full stack

### Negative

- ⚠️ Requires PostgreSQL server (can't just "copy a file")
- ⚠️ Slightly more setup than SQLite (but managed hosting makes this easy)
- ⚠️ Prisma adds small bundle size (~1-2MB)
- ⚠️ Some PostgreSQL-specific features may lock us in (mitigated: industry standard)

### Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| PostgreSQL server required | Use Neon (serverless, free tier) or Docker locally |
| Prisma breaking changes | Pin versions, test before upgrading |
| Vendor lock-in to PostgreSQL | PostgreSQL is industry standard, not a risk |
| Learning curve for Prisma | Excellent docs, intuitive API |
| Migration complexity | Prisma migrations are Git-friendly and declarative |

## Local Development Setup

### Option 1: Docker (Recommended)

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: tasker
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: tasker_dev
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
# Start PostgreSQL
docker-compose up -d

# Run migrations
npm run prisma:migrate dev

# Open Prisma Studio
npm run prisma:studio
```

### Option 2: Neon (Serverless)

1. Sign up at https://neon.tech (free tier)
2. Create new project
3. Copy connection string to `.env`
4. Run migrations: `npm run prisma:migrate dev`

### Option 3: Local PostgreSQL

```bash
# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Create database
createdb tasker_dev

# Update .env
DATABASE_URL="postgresql://yourusername@localhost:5432/tasker_dev"
```

## Migration Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create migration (dev)
npx prisma migrate dev --name add_subtasks

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Seed database
npx prisma db seed
```

## Production Deployment

### Railway (One-Click PostgreSQL)

```bash
# Add PostgreSQL to project
railway add postgresql

# Get DATABASE_URL
railway variables

# Deploy with migrations
railway up
```

### Neon (Serverless PostgreSQL)

1. Create production branch in Neon dashboard
2. Copy production connection string
3. Set `DATABASE_URL` in production environment
4. Run migrations in CI/CD: `npx prisma migrate deploy`

## Performance Considerations

### Prisma Query Optimization

```typescript
// ✅ Good: Select specific fields
await prisma.task.findMany({
  select: {
    id: true,
    title: true,
    status: true,
  },
});

// ✅ Good: Use include for relations (avoids N+1)
await prisma.task.findMany({
  include: {
    channel: true,
  },
});

// ❌ Bad: Fetching all fields when not needed
await prisma.task.findMany(); // Returns all fields
```

### Connection Pooling

Prisma handles connection pooling automatically. For production:

```env
DATABASE_URL="postgresql://user:password@host:5432/db?connection_limit=5&pool_timeout=10"
```

### Indexing

Defined in Prisma schema:

```prisma
model Task {
  // ...fields

  @@index([status])          // Query by status frequently
  @@index([workspace])       // Query by workspace frequently
  @@index([channelId])       // Foreign key index
  @@index([dueDate])         // Query by due date
}
```

## Alternatives Considered

### TypeORM + SQLite
**Pros:** Zero setup, single file database, portable
**Cons:** Not production-ready for multi-user, limited features, worse TypeScript support than Prisma
**Verdict:** SQLite is not suitable for separate server deployment

### TypeORM + PostgreSQL
**Pros:** Similar to what we learned, decorators
**Cons:** TypeScript support weaker than Prisma, less modern DX, migration system not as good
**Verdict:** Prisma is better for TypeScript-first development

### MikroORM + PostgreSQL
**Pros:** Excellent TypeScript, modern, good DX
**Cons:** Smaller ecosystem than Prisma, less documentation
**Verdict:** Prisma has better community and tooling

### Kysely + PostgreSQL
**Pros:** Pure TypeScript query builder, no code generation
**Cons:** More verbose, no migrations, no visual tools
**Verdict:** Prisma provides more complete solution

## REST API Integration

Prisma and NestJS REST work exceptionally well together:

1. **Type Safety**
   - Prisma generates TypeScript types from schema
   - Use same types in DTOs with class-validator
   - Single source of truth for data models

2. **No Impedance Mismatch**
   - Prisma models map cleanly to REST response types
   - Can use Prisma models directly or map to DTOs
   - Straightforward CRUD operations

3. **Efficient Queries**
   - Prisma's `include` prevents N+1 queries
   - Query only the fields you need with `select`
   - Automatic relation loading

4. **Example**
   ```typescript
   @Controller('api/tasks')
   export class TasksController {
     @Get(':id')
     async findOne(@Param('id', ParseIntPipe) id: number) {
       return this.prisma.task.findUnique({
         where: { id },
         include: { channel: true }, // Efficiently load relation
       });
     }
   }
   ```

## References

- [Prisma Documentation](https://www.prisma.io/docs/)
- [NestJS Prisma Integration](https://docs.nestjs.com/recipes/prisma)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Neon Serverless PostgreSQL](https://neon.tech/)
- [Railway PostgreSQL](https://railway.app/)

## Review Schedule

- **v0.3:** Evaluate Prisma performance with larger datasets
- **v1.0:** Assess if PostgreSQL features are being utilized effectively
- **v2.0:** Consider read replicas or Citus if scaling needed

---

**Decision Owner:** George
**Reviewed By:** N/A (solo project)
**Next Review:** v1.0 (before production release)
