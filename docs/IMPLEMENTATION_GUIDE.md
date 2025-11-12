# Implementation Guide - Step-by-Step

**Goal:** Build Tasker v0.1 in 7 days
**Approach:** Backend first → Frontend → Connect → Features → Polish

---

## Prerequisites

### System Requirements
- Node.js 20+ LTS
- npm 10+ or pnpm 8+
- Git 2.40+
- VS Code (recommended) with extensions:
  - Angular Language Service
  - Tailwind CSS IntelliSense
  - ESLint
  - Prettier

### Knowledge Assumed
- TypeScript basics
- Angular fundamentals
- NestJS basics (can learn as you go)
- SQL basics
- Git basics

---

## Day 1: Project Setup (4-6 hours)

### Phase 1: Initialize Monorepo (30 minutes)

```bash
cd /Users/george/side-projects/tasker

# Initialize Git (if not done)
git init
git add .
git commit -m "Initial commit: documentation"

# Create project structure
mkdir -p frontend backend database mcp-server docs/ADRs .vscode

# Initialize root package.json
npm init -y
```

**Edit `package.json`:**
```json
{
  "name": "tasker-monorepo",
  "version": "0.1.0",
  "private": true,
  "workspaces": [
    "frontend",
    "backend"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "cd frontend && npm run start",
    "dev:backend": "cd backend && npm run start:dev",
    "build": "npm run build:backend && npm run build:frontend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

```bash
npm install
```

**Create `.gitignore`:**
```
node_modules/
dist/
build/
.angular/
*.db
*.sqlite
database/*.db
.env
.env.local
.env.*.local
.DS_Store
.vscode/
.idea/
*.log
coverage/
tmp/
temp/
```

**Create `.editorconfig`:**
```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

**Commit:**
```bash
git add .
git commit -m "chore: initialize monorepo structure"
```

### Phase 2: Backend Setup (2-3 hours)

```bash
cd backend

# Install NestJS CLI globally (optional)
npm install -g @nestjs/cli

# Initialize NestJS project
nest new . --skip-git --package-manager npm

# Install dependencies
npm install @nestjs/typeorm typeorm better-sqlite3 class-validator class-transformer dotenv
npm install -D @types/node
```

**Create `backend/.env`:**
```
PORT=3000
NODE_ENV=development
DATABASE_PATH=../database/tasker.db
```

**Create database directory:**
```bash
mkdir -p ../database
```

**Create `backend/src/config/database.config.ts`:**
```typescript
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'better-sqlite3',
  database: join(process.cwd(), '..', 'database', 'tasker.db'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
};
```

**Generate modules:**
```bash
cd backend

# Generate tasks module
nest g module tasks
nest g controller tasks
nest g service tasks

# Generate channels module
nest g module channels
nest g controller channels
nest g service channels
```

**Create entities** (copy from DATABASE_SCHEMA.md):
- `backend/src/tasks/entities/task.entity.ts`
- `backend/src/channels/entities/channel.entity.ts`

**Update `backend/src/app.module.ts`:**
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './config/database.config';
import { TasksModule } from './tasks/tasks.module';
import { ChannelsModule } from './channels/channels.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig),
    TasksModule,
    ChannelsModule,
  ],
})
export class AppModule {}
```

**Update `backend/src/main.ts`:**
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  await app.listen(3000);
  console.log('Backend running on http://localhost:3000');
}
bootstrap();
```

**Test backend:**
```bash
cd backend
npm run start:dev
```

Should see: "Backend running on http://localhost:3000"

**Commit:**
```bash
git add .
git commit -m "feat(backend): setup NestJS with TypeORM and SQLite"
```

### Phase 3: Frontend Setup (2-3 hours)

```bash
cd ../frontend

# Install Angular CLI globally (if not installed)
npm install -g @angular/cli@20

# Create Angular project
ng new . --standalone --routing --style=css --skip-git

# Install dependencies
npm install primeng primeicons @primeng/themes
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind
npx tailwindcss init
```

**Update `tailwind.config.js`:** (copy from TECHNICAL_ARCHITECTURE.md)

**Create `frontend/src/styles/tailwind.css`:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Update `frontend/src/styles.css`:**
```css
@import './styles/tailwind.css';
@import 'primeicons/primeicons.css';

/* Design tokens */
:root {
  --color-bg-primary: #FAF9F7;
  --color-bg-secondary: #F0EEE9;
  --color-text-primary: #2B2B2A;
  --color-text-secondary: #595959;
  --color-primary: #8B7BB8;
  --font-family-base: Verdana, 'Open Sans', Helvetica, Arial, sans-serif;
  --font-size-base: 22px;
  --line-height: 1.5;
  --letter-spacing: 0.12em;
}

[data-theme="dark"] {
  --color-bg-primary: #1C1B1A;
  --color-bg-secondary: #2B2A28;
  --color-text-primary: #E8E6E1;
  --color-text-secondary: #B8B6B1;
}

body {
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  line-height: var(--line-height);
  letter-spacing: var(--letter-spacing);
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  margin: 0;
  padding: 0;
}
```

**Update `frontend/src/main.ts`:**
```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '[data-theme="dark"]',
        },
      },
    }),
  ],
}).catch((err) => console.error(err));
```

**Create `frontend/proxy.conf.json`:**
```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

**Update `angular.json` serve options:**
```json
"serve": {
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

**Test frontend:**
```bash
cd frontend
npm start
```

Should see Angular running on http://localhost:4200

**Commit:**
```bash
git add .
git commit -m "feat(frontend): setup Angular 20 with Tailwind and PrimeNG"
```

---

## Day 2: Backend API (4-6 hours)

### Create DTOs

**`backend/src/tasks/dto/create-task.dto.ts`:**
```typescript
import { IsString, IsEnum, IsOptional, IsBoolean, IsDateString, IsNumber } from 'class-validator';
import { TaskStatus, Workspace } from '../entities/task.entity';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(Workspace)
  workspace: Workspace;

  @IsOptional()
  @IsNumber()
  channelId?: number;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsBoolean()
  @IsOptional()
  isRoutine?: boolean;
}
```

**`backend/src/tasks/dto/update-task.dto.ts`:**
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
```

### Implement Services

**`backend/src/tasks/tasks.service.ts`:** (copy from DATABASE_SCHEMA.md queries)

**`backend/src/tasks/tasks.controller.ts`:**
```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from './entities/task.entity';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(
    @Query('status') status?: TaskStatus,
    @Query('workspace') workspace?: string,
  ) {
    return this.tasksService.findAll({ status, workspace });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }
}
```

### Test with Thunder Client / Postman

```http
# Create task
POST http://localhost:3000/api/tasks
Content-Type: application/json

{
  "title": "Test Task",
  "workspace": "personal",
  "status": "backlog"
}

# Get all tasks
GET http://localhost:3000/api/tasks

# Update task
PUT http://localhost:3000/api/tasks/1
Content-Type: application/json

{
  "status": "today"
}
```

**Commit:**
```bash
git add .
git commit -m "feat(backend): implement tasks CRUD API"
```

---

## Day 3: Frontend Foundation (4-6 hours)

### Create Folder Structure

```bash
cd frontend/src/app

mkdir -p core/services
mkdir -p core/interceptors
mkdir -p shared/components
mkdir -p features/dashboard
mkdir -p features/tasks/components
mkdir -p features/tasks/services
mkdir -p models
mkdir -p guards
```

### Create Models

**`frontend/src/app/models/task.model.ts`:**
```typescript
export enum TaskStatus {
  BACKLOG = 'backlog',
  TODAY = 'today',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export enum Workspace {
  WORK = 'work',
  PERSONAL = 'personal',
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  workspace: Workspace;
  channel?: Channel;
  status: TaskStatus;
  dueDate?: string;
  isRoutine: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Channel {
  id: number;
  name: string;
  workspace: Workspace;
  color?: string;
}
```

### Create API Service

**`frontend/src/app/core/services/task-api.service.ts`:**
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskApiService {
  private http = inject(HttpClient);
  private apiUrl = '/api/tasks';

  getTasks(filters?: { status?: string; workspace?: string }): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl, { params: { ...filters } });
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  createTask(task: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(id: number, task: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

### Create Task State Service

**`frontend/src/app/features/tasks/services/task-state.service.ts`:**
```typescript
import { Injectable, inject, signal, computed } from '@angular/core';
import { Task, TaskStatus } from '../../../models/task.model';
import { TaskApiService } from '../../../core/services/task-api.service';

@Injectable({ providedIn: 'root' })
export class TaskStateService {
  private api = inject(TaskApiService);

  private tasksSignal = signal<Task[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly tasks = this.tasksSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly backlogTasks = computed(() =>
    this.tasksSignal().filter(t => t.status === TaskStatus.BACKLOG)
  );

  readonly todayTasks = computed(() =>
    this.tasksSignal().filter(t => t.status === TaskStatus.TODAY)
  );

  readonly inProgressTasks = computed(() =>
    this.tasksSignal().filter(t => t.status === TaskStatus.IN_PROGRESS)
  );

  readonly doneTasks = computed(() =>
    this.tasksSignal().filter(t => t.status === TaskStatus.DONE)
  );

  loadTasks() {
    this.loadingSignal.set(true);
    this.api.getTasks().subscribe({
      next: tasks => {
        this.tasksSignal.set(tasks);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(err.message);
        this.loadingSignal.set(false);
      }
    });
  }

  addTask(task: Partial<Task>) {
    this.api.createTask(task).subscribe({
      next: newTask => {
        this.tasksSignal.update(tasks => [...tasks, newTask]);
      },
      error: err => this.errorSignal.set(err.message)
    });
  }

  updateTask(id: number, updates: Partial<Task>) {
    this.api.updateTask(id, updates).subscribe({
      next: updated => {
        this.tasksSignal.update(tasks =>
          tasks.map(t => t.id === id ? updated : t)
        );
      },
      error: err => this.errorSignal.set(err.message)
    });
  }

  deleteTask(id: number) {
    this.api.deleteTask(id).subscribe({
      next: () => {
        this.tasksSignal.update(tasks => tasks.filter(t => t.id !== id));
      },
      error: err => this.errorSignal.set(err.message)
    });
  }
}
```

**Test:**
```bash
# Run both servers
npm run dev

# Open browser to http://localhost:4200
# Open console and run:
# inject(TaskStateService).loadTasks()
```

**Commit:**
```bash
git add .
git commit -m "feat(frontend): create API service and state management"
```

---

## Day 4-6: Feature Development

Build UI components following the patterns in TECHNICAL_ARCHITECTURE.md:

1. **Dashboard layout component**
2. **Backlog sidebar component**
3. **Kanban board component**
4. **Task card component**
5. **Task form component**
6. **Drag & drop functionality**

---

## Day 7: Polish & Testing

1. **Add loading states**
2. **Add error handling**
3. **Add empty states**
4. **Test full flow**
5. **Fix bugs**

---

## Development Commands

```bash
# Run both frontend and backend
npm run dev

# Run separately
npm run dev:frontend
npm run dev:backend

# Build for production
npm run build

# Run tests
npm run test
```

---

**Ready to start implementation!**
