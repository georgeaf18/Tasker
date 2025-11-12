# AI Implementation Guide v2 - Micro-Task Parallelization

**Purpose:** Orchestration guide for micro-task parallel execution
**Timeline:** 6-8 hours with 5+ agents per ticket
**Strategy:** Break each Linear issue into micro-tasks, launch agents in parallel

---

## Core Principles

### 1. Always Use Strategic-Planner First

Before implementing ANY Linear ticket, use strategic-planner to break it into micro-tasks.

### 2. Keep Context Small (300-500 lines per agent)

Each agent works on 1-2 files max to avoid context overload.

### 3. Launch 5-7 Agents in Parallel Per Ticket

Maximize parallelization - don't wait for sequential completion.

### 4. Every Agent Reads Quality Docs First

All agents must read CLAUDE.md + AI_IMPLEMENTATION_GUIDE.md before starting.

### 5. **CRITICAL: Only Orchestrator Commits**

❌ **Individual agents DO NOT commit** - They only create/modify files
✅ **Orchestrator (Claude Code) commits** - After all agents complete and integration is verified

**Workflow:**

```
Agents 1-5 work in parallel → Create/modify files
  ↓
Agent 6 integrates → Verifies everything works
  ↓
Agent 7 reviews → Checks quality
  ↓
ORCHESTRATOR commits → Single comprehensive commit with Linear reference
```

**Why orchestrator commits:**

- Sees full picture across all agent work
- Writes comprehensive commit message
- Ensures Linear reference included
- Maintains clean git history
- Can verify integration before committing

---

## Complete Example: TASK-33 (Tasks REST API)

### Step 1: Strategic Planning (2 minutes)

**Orchestrator launches strategic-planner:**

```typescript
Task: "Break down TASK-33 (Tasks REST API) into micro-tasks

Linear TASK-33 acceptance criteria:
- CRUD endpoints: GET /api/tasks, POST, PUT, DELETE
- Filter by status, workspace, channelId
- DTOs with class-validator decorators
- Relations loaded (channel) to prevent N+1
- Error handling for not found
- Unit tests with 90%+ coverage

Analyze dependencies and create micro-task breakdown.
Each micro-task should be 300-500 lines max.
Identify which can run in parallel vs sequential."
```

**Strategic-planner response:**

```
Micro-Task Breakdown for TASK-33:

✅ CAN RUN IN PARALLEL (launch all 5 agents simultaneously):

Agent 1: Create DTOs
- Files: create-task.dto.ts, update-task.dto.ts
- Lines: ~100 total
- Dependencies: None
- Time: 5 minutes

Agent 2: Create TasksService
- File: tasks.service.ts
- Lines: ~200
- Dependencies: PrismaService (exists from TASK-32)
- Time: 10 minutes

Agent 3: Create TasksController
- File: tasks.controller.ts
- Lines: ~150
- Dependencies: TasksService (will exist from Agent 2)
- Time: 8 minutes

Agent 4: Create TasksModule
- File: tasks.module.ts
- Lines: ~30
- Dependencies: TasksService, TasksController (from Agents 2 & 3)
- Time: 3 minutes

Agent 5: Write Unit Tests
- File: tasks.service.spec.ts
- Lines: ~250
- Dependencies: TasksService structure (from Agent 2)
- Time: 12 minutes

⚠️ SEQUENTIAL (after above complete):

Agent 6: Wire up in AppModule
- File: app.module.ts (modification)
- Lines: +5 lines
- Dependencies: TasksModule must exist
- Time: 2 minutes

Agent 7: Integration Verification
- No files, just testing
- Run curl commands + unit tests
- Time: 3 minutes

TOTAL TIME: 25 minutes (parallel) + 5 minutes (sequential) = 30 minutes
VS SEQUENTIAL: ~60 minutes
SPEEDUP: 2x
```

### Step 2: Launch Parallel Agents (5 agents simultaneously)

#### Agent 1 Prompt: DTOs

````
REQUIRED READING:
1. /Users/george/side-projects/tasker/CLAUDE.md
   - Focus on: TypeScript Strictness, NestJS Patterns
2. /Users/george/side-projects/tasker/docs/AI_IMPLEMENTATION_GUIDE_V2.md
   - Focus on: DTO Template (see below)
3. Linear TASK-33 acceptance criteria

YOUR MICRO-TASK:
Create CreateTaskDto and UpdateTaskDto with class-validator decorators

CONTEXT:
You are Agent 1 of 5 working on TASK-33.
Other agents are working on Service, Controller, Module, and Tests simultaneously.

FILES TO CREATE:
- apps/tasker-backend/src/tasks/dto/create-task.dto.ts
- apps/tasker-backend/src/tasks/dto/update-task.dto.ts

REQUIREMENTS:
1. CreateTaskDto properties:
   - title: string (required)
   - description?: string (optional)
   - workspace?: Workspace (optional, default PERSONAL)
   - channelId?: number (optional)
   - status?: TaskStatus (optional, default BACKLOG)
   - dueDate?: string (optional, ISO format)
   - isRoutine?: boolean (optional, default false)

2. Use class-validator decorators:
   - @IsString(), @IsOptional(), @IsEnum(), @IsInt(), @IsDateString(), @IsBoolean()

3. UpdateTaskDto extends PartialType(CreateTaskDto)

4. Import enums from '@prisma/client'

CODE TEMPLATE:
```typescript
import { IsString, IsOptional, IsEnum, IsBoolean, IsDateString, IsInt } from 'class-validator';
import { TaskStatus, Workspace } from '@prisma/client';

export class CreateTaskDto {
  @IsString()
  title: string;

  // ... add remaining properties
}
````

VERIFICATION:

- [ ] TypeScript compiles (no 'any' types)
- [ ] All properties have decorators
- [ ] UpdateTaskDto properly extends CreateTaskDto
- [ ] Imports are correct

EXPECTED OUTPUT:
~100 lines total across 2 files

IMPORTANT: DO NOT COMMIT YOUR CHANGES.
The orchestrator (Claude Code) will commit after all agents complete.

DELIVERABLE:
Report back with:
"✅ Agent 1 complete: DTOs created

- create-task.dto.ts: XX lines
- update-task.dto.ts: XX lines
- TypeScript compiles: YES/NO
- Ready for integration"

```

#### Agent 2 Prompt: Service

```

REQUIRED READING:

1. /Users/george/side-projects/tasker/CLAUDE.md
   - Focus on: NestJS Patterns, Prisma Best Practices
2. /Users/george/side-projects/tasker/docs/AI_IMPLEMENTATION_GUIDE_V2.md
   - Focus on: Service Template (see below)
3. Linear TASK-33 acceptance criteria

YOUR MICRO-TASK:
Create TasksService with Prisma queries and full CRUD operations

CONTEXT:
You are Agent 2 of 5 working on TASK-33.
Agent 1 is creating DTOs, Agent 3 is creating Controller.
You need PrismaService which exists from TASK-32.

FILE TO CREATE:

- apps/tasker-backend/src/tasks/tasks.service.ts

REQUIREMENTS:

1. Inject PrismaService via constructor
2. Implement methods:
   - findAll(filters?: {status, workspace, channelId}): Promise<Task[]>
   - findOne(id: number): Promise<Task>
   - create(dto: CreateTaskDto): Promise<Task>
   - update(id: number, dto: UpdateTaskDto): Promise<Task>
   - remove(id: number): Promise<Task>
   - updateStatus(id: number, status: TaskStatus): Promise<Task>

3. CRITICAL: Include channel relations to prevent N+1 queries

   ```typescript
   include: {
     channel: true;
   }
   ```

4. Error handling: Throw NotFoundException when task not found

5. Add JSDoc comments to all methods

CODE TEMPLATE:

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus, Workspace } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  /**
   * Retrieves all tasks with optional filtering.
   * Includes channel relation to prevent N+1 queries.
   */
  async findAll(filters?: { status?: TaskStatus; workspace?: Workspace; channelId?: number }) {
    return this.prisma.task.findMany({
      where: {
        status: filters?.status,
        workspace: filters?.workspace,
        channelId: filters?.channelId,
      },
      include: {
        channel: true, // CRITICAL: Prevents N+1
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // ... implement remaining methods
}
```

VERIFICATION:

- [ ] PrismaService injected via constructor
- [ ] All methods include { channel: true }
- [ ] NotFoundException thrown for not found
- [ ] JSDoc comments present
- [ ] TypeScript fully typed (no 'any')

EXPECTED OUTPUT:
~200 lines

DELIVERABLE:
Report back with:
"✅ Agent 2 complete: TasksService created

- tasks.service.ts: XX lines
- All CRUD methods: YES/NO
- N+1 prevention: YES/NO
- Error handling: YES/NO
- TypeScript compiles: YES/NO"

```

#### Agent 3 Prompt: Controller

```

REQUIRED READING:

1. /Users/george/side-projects/tasker/CLAUDE.md
   - Focus on: NestJS Patterns, REST API standards
2. /Users/george/side-projects/tasker/docs/AI_IMPLEMENTATION_GUIDE_V2.md
   - Focus on: Controller Template (see below)
3. Linear TASK-33 acceptance criteria

YOUR MICRO-TASK:
Create TasksController with REST endpoints

CONTEXT:
You are Agent 3 of 5 working on TASK-33.
Agent 2 is creating TasksService which you'll inject.
Agent 4 is creating TasksModule.

FILE TO CREATE:

- apps/tasker-backend/src/tasks/tasks.controller.ts

REQUIREMENTS:

1. Controller route: @Controller('api/tasks')
2. Inject TasksService via constructor
3. Implement endpoints:
   - GET /api/tasks → findAll() with query filters
   - GET /api/tasks/:id → findOne()
   - POST /api/tasks → create() with @HttpCode(201)
   - PATCH /api/tasks/:id → update()
   - PATCH /api/tasks/:id/status → updateStatus()
   - DELETE /api/tasks/:id → remove() with @HttpCode(204)

4. Use decorators:
   - @Query() for filters
   - @Param('id', ParseIntPipe) for ID validation
   - @Body() for DTOs

5. Proper HTTP status codes

CODE TEMPLATE:

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus, Workspace } from '@prisma/client';

@Controller('api/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(
    @Query('status') status?: TaskStatus,
    @Query('workspace') workspace?: Workspace,
    @Query('channelId', new ParseIntPipe({ optional: true })) channelId?: number
  ) {
    return this.tasksService.findAll({ status, workspace, channelId });
  }

  // ... implement remaining endpoints
}
```

VERIFICATION:

- [ ] All 6 endpoints implemented
- [ ] ParseIntPipe used for ID validation
- [ ] Proper HTTP status codes
- [ ] TypeScript fully typed
- [ ] TasksService injected

EXPECTED OUTPUT:
~150 lines

DELIVERABLE:
"✅ Agent 3 complete: TasksController created

- tasks.controller.ts: XX lines
- Endpoints: 6/6
- Validation: YES/NO
- TypeScript compiles: YES/NO"

```

#### Agent 4 Prompt: Module

```

REQUIRED READING:

1. /Users/george/side-projects/tasker/CLAUDE.md
   - Focus on: NestJS Patterns
2. Linear TASK-33 acceptance criteria

YOUR MICRO-TASK:
Create TasksModule to wire up service and controller

CONTEXT:
You are Agent 4 of 5 working on TASK-33.
Agents 2 & 3 are creating Service and Controller.
You're creating the module that exports both.

FILE TO CREATE:

- apps/tasker-backend/src/tasks/tasks.module.ts

REQUIREMENTS:

1. Import TasksService and TasksController
2. Export TasksService (so other modules can use it)
3. Include TasksController in controllers array

CODE TEMPLATE:

```typescript
import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';

@Module({
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
```

VERIFICATION:

- [ ] Service and Controller imported
- [ ] Service exported
- [ ] Proper @Module decorator

EXPECTED OUTPUT:
~15 lines

DELIVERABLE:
"✅ Agent 4 complete: TasksModule created

- tasks.module.ts: XX lines
- Exports service: YES/NO"

```

#### Agent 5 Prompt: Unit Tests

```

REQUIRED READING:

1. /Users/george/side-projects/tasker/CLAUDE.md
   - Focus on: Testing Requirements, Test Pattern for Signals
2. /Users/george/side-projects/tasker/docs/AI_IMPLEMENTATION_GUIDE_V2.md
   - Focus on: Testing section
3. Linear TASK-33 acceptance criteria

YOUR MICRO-TASK:
Write comprehensive unit tests for TasksService

CONTEXT:
You are Agent 5 of 5 working on TASK-33.
Agent 2 is creating TasksService which you're testing.
You need to mock PrismaService.

FILE TO CREATE:

- apps/tasker-backend/src/tasks/tasks.service.spec.ts

REQUIREMENTS:

1. Mock PrismaService with jest.fn()
2. Test all CRUD methods:
   - findAll() with no filters
   - findAll() with status filter
   - findAll() with workspace filter
   - findOne() success case
   - findOne() not found (should throw NotFoundException)
   - create() success
   - update() success
   - update() not found
   - remove() success
   - updateStatus() success

3. Verify channel relations are included (N+1 prevention)
4. Achieve 90%+ coverage

CODE TEMPLATE:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus, Workspace } from '@prisma/client';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: PrismaService;

  const mockPrismaService = {
    task: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all tasks with channel relations', async () => {
      const mockTasks = [{ id: 1, title: 'Task 1', channel: { id: 1, name: 'Work' } }];
      mockPrismaService.task.findMany.mockResolvedValue(mockTasks);

      const result = await service.findAll();

      expect(result).toEqual(mockTasks);
      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: { status: undefined, workspace: undefined, channelId: undefined },
        include: { channel: true }, // Verify N+1 prevention
        orderBy: { createdAt: 'desc' },
      });
    });

    // ... add remaining tests
  });
});
```

VERIFICATION:

- [ ] All CRUD methods tested
- [ ] Error cases tested (NotFoundException)
- [ ] Mocks properly configured
- [ ] Tests pass: npm run test
- [ ] 90%+ coverage

EXPECTED OUTPUT:
~250 lines

DELIVERABLE:
"✅ Agent 5 complete: TasksService tests written

- tasks.service.spec.ts: XX lines
- Tests passing: X/X
- Coverage: XX%
- All edge cases covered: YES/NO"

```

### Step 3: Integration Agent (After agents 1-5 complete)

#### Agent 6 Prompt: Wire Up Module

```

INTEGRATION TASK for TASK-33

PREVIOUS AGENTS COMPLETED:

- Agent 1: DTOs ✅
- Agent 2: TasksService ✅
- Agent 3: TasksController ✅
- Agent 4: TasksModule ✅
- Agent 5: Unit Tests ✅

YOUR TASK:
Wire TasksModule into AppModule and verify integration

FILES TO MODIFY:

- apps/tasker-backend/src/app.module.ts

STEPS:

1. Import TasksModule
2. Add to imports array
3. Start backend: npm run start:backend
4. Run tests: nx test backend
5. Verify with curl:

   ```bash
   # Should return empty array (no tasks yet)
   curl http://localhost:3000/api/tasks

   # Should create task
   curl -X POST http://localhost:3000/api/tasks \
     -H "Content-Type: application/json" \
     -d '{"title":"Test task","workspace":"PERSONAL"}'
   ```

VERIFICATION CHECKLIST:

- [ ] TasksModule imported in AppModule
- [ ] Backend starts without errors
- [ ] All tests pass
- [ ] GET /api/tasks returns 200
- [ ] POST /api/tasks returns 201 with created task
- [ ] Task has proper structure with channel: null

DELIVERABLE:
"✅ Agent 6 complete: TASK-33 integration successful

- AppModule updated
- Backend running: YES/NO
- Tests passing: X/X
- API endpoints verified: YES/NO
- Ready for commit: YES/NO"

```

### Step 4: Code Review (Optional)

#### Agent 7 Prompt: Quality Check

```

CODE REVIEW for TASK-33

FILES TO REVIEW:

- apps/tasker-backend/src/tasks/\*\*

REVIEW CHECKLIST:

1. TypeScript Strictness
   - [ ] No 'any' types used
   - [ ] All parameters and return types specified
   - [ ] Proper enum usage

2. NestJS Patterns
   - [ ] Dependency injection via constructor
   - [ ] Proper decorators used
   - [ ] HTTP status codes correct

3. Prisma Best Practices
   - [ ] include: { channel: true } in all queries
   - [ ] No N+1 query patterns
   - [ ] Proper error handling

4. Testing
   - [ ] 90%+ coverage
   - [ ] Edge cases tested
   - [ ] Mocks properly configured

5. Code Quality
   - [ ] JSDoc comments present
   - [ ] Consistent naming
   - [ ] No console.logs
   - [ ] Error messages clear

DELIVERABLE:
"✅ Agent 7 complete: Code review for TASK-33

- Type safety: PASS/FAIL
- Patterns followed: PASS/FAIL
- N+1 prevention: PASS/FAIL
- Test coverage: XX%
- Issues found: X
- Ready for production: YES/NO"

````

### Step 5: Commit & Update Linear

**Orchestrator commits all work:**

```bash
git add apps/tasker-backend/src/tasks
git add apps/tasker-backend/src/app.module.ts
git commit -m "feat: implement Tasks REST API endpoints (TASK-33)

Generated by: 7 AI agents (code-implementer, integration, code-reviewer)

Agent breakdown:
- Agent 1: DTOs with validation
- Agent 2: TasksService with Prisma
- Agent 3: TasksController with REST endpoints
- Agent 4: TasksModule wiring
- Agent 5: Comprehensive unit tests (92% coverage)
- Agent 6: AppModule integration
- Agent 7: Code review and quality validation

Features:
- Full CRUD operations (GET, POST, PATCH, DELETE)
- Filters by status, workspace, channelId
- Channel relations loaded (N+1 prevention)
- Error handling for not found (404)
- 92% test coverage

All acceptance criteria met ✅

Linear: TASK-33"

git push origin main
````

**Update Linear issue TASK-33 to "Done"**

---

## Summary: Micro-Task Parallelization Benefits

### Traditional Approach (Sequential)

```
Agent 1 creates DTOs → 10 min
  ↓ (waits)
Agent 1 creates Service → 15 min
  ↓ (waits)
Agent 1 creates Controller → 12 min
  ↓ (waits)
Agent 1 creates Tests → 15 min
  ↓ (waits)
Agent 1 wires up → 5 min

TOTAL: 57 minutes
```

### Micro-Task Approach (Parallel)

```
Agent 1: DTOs ────────────→ 10 min ──┐
Agent 2: Service ─────────→ 15 min ──┤
Agent 3: Controller ──────→ 12 min ──┼→ Integration → 5 min → Review → 5 min
Agent 4: Module ──────────→ 5 min ───┤
Agent 5: Tests ───────────→ 15 min ──┘

TOTAL: 15 min (parallel) + 5 min (integration) + 5 min (review) = 25 minutes
SPEEDUP: 2.3x faster
```

### Key Advantages

1. **Smaller Context** - Each agent handles 300-500 lines, not 1000+
2. **Faster Completion** - 2-3x speedup through parallelization
3. **Better Quality** - Focused agents make fewer mistakes
4. **Easier Recovery** - If one agent fails, only redo that micro-task
5. **Scalable** - Can add more agents for larger tickets

---

## Template for Other Tasks

Use this pattern for all remaining tasks:

```typescript
TASK-XX: [Feature Name]

Step 1: Strategic-planner breaks down
  ↓
Step 2: Launch N agents in parallel (DTOs, Service, Controller, etc.)
  ↓
Step 3: Integration agent wires up
  ↓
Step 4: Code reviewer validates
  ↓
Step 5: Commit with Linear reference
```

**Expected time per ticket: 30-45 minutes** (vs 2-3 hours sequential)

---

**Next:** Apply this pattern to TASK-30, TASK-31, TASK-32, TASK-34, TASK-35, and all remaining tasks.
