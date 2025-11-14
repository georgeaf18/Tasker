# Technical Architecture Plan

## Project Overview

**Target:** v0.1 Alpha - Visual task management with backlog sidebar and kanban board
**Stack:** Angular 20 (frontend) + NestJS REST API (backend) + PostgreSQL (database)
**Architecture:** Nx integrated monorepo (single package.json)
**Deployment:** Separate servers for frontend and backend

---

## Frontend Architecture (Angular 20)

### Core Technologies

- **Framework:** Angular 20.x (latest)
- **Component Model:** Standalone components only (no NgModules)
- **State Management:** Signals (built-in, reactive)
- **Change Detection:** Zoneless (experimentalZoneless: true)
- **Styling:** Tailwind CSS + PrimeNG components
- **Routing:** Angular Router with lazy loading
- **Animations:** View Transitions API

### Angular Configuration

#### angular.json Key Settings

```json
{
  "projects": {
    "tasker": {
      "architect": {
        "build": {
          "options": {
            "outputPath": "dist/frontend",
            "standalone": true
          }
        },
        "serve": {
          "options": {
            "proxyConfig": "proxy.conf.json"
          }
        }
      }
    }
  }
}
```

#### main.ts (Zoneless Bootstrap)

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideExperimentalZonelessChangeDetection(), // Zoneless mode
    provideRouter(routes), // Router with lazy loading
    // Other providers...
  ],
});
```

### Signal-Based State Management

#### Task State Service Example

```typescript
import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TaskStateService {
  // Signals for reactive state
  private tasksSignal = signal<Task[]>([]);
  private loadingSignal = signal<boolean>(false);

  // Computed signals
  tasks = this.tasksSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();

  backlogTasks = computed(() =>
    this.tasksSignal().filter((t) => t.status === 'backlog'),
  );

  todayTasks = computed(() =>
    this.tasksSignal().filter((t) => t.status === 'today'),
  );

  // Methods to update state
  setTasks(tasks: Task[]) {
    this.tasksSignal.set(tasks);
  }

  addTask(task: Task) {
    this.tasksSignal.update((tasks) => [...tasks, task]);
  }
}
```

### Lazy Loading Strategy

#### Route Configuration (app.routes.ts)

```typescript
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
    canActivate: [authGuard], // Protected route
  },
  {
    path: 'tasks',
    loadChildren: () =>
      import('./features/tasks/tasks.routes').then((m) => m.TASKS_ROUTES),
    canActivate: [authGuard],
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.component').then(
        (m) => m.SettingsComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
```

### Protected Routes (Auth Guard)

#### auth.guard.ts

```typescript
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // For v0.1: Always allow (no auth yet)
  // For v0.5+: Check authentication
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
```

### View Transitions API Integration

#### app.config.ts

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withViewTransitions(), // Enable View Transitions API
    ),
    // Other providers...
  ],
};
```

#### CSS for View Transitions

```css
/* global.css */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.3s;
}

/* Disable for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}
```

### Tailwind CSS + PrimeNG Setup

#### tailwind.config.js

```javascript
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#8B7BB8',
        secondary: '#6B9AC4',
        accent: '#C89FA7',
        destructive: '#C97064',
        success: '#7A9B76',
        'bg-primary': '#FAF9F7',
        'bg-secondary': '#F0EEE9',
        'text-primary': '#2B2B2A',
        'text-secondary': '#595959',
      },
      fontFamily: {
        sans: ['Verdana', 'Open Sans', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        base: '22px',
        lg: '26px',
        xl: '33px',
      },
      spacing: {
        xs: '8px',
        sm: '16px',
        md: '24px',
        lg: '32px',
        xl: '48px',
        '2xl': '64px',
      },
    },
  },
  plugins: [],
};
```

#### PrimeNG Configuration

```typescript
// app.config.ts
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '[data-theme="dark"]',
          cssLayer: {
            name: 'primeng',
            order: 'tailwind-base, primeng, tailwind-utilities',
          },
        },
      },
    }),
    // Other providers...
  ],
};
```

### HTTP Client Service (REST API)

#### Task API Service

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, CreateTaskDto, UpdateTaskDto } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskApiService {
  private http = inject(HttpClient);
  private apiUrl = '/api/tasks';

  getTasks(filters?: {
    status?: string;
    workspace?: string;
  }): Observable<Task[]> {
    let params = new HttpParams();
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.workspace) {
      params = params.set('workspace', filters.workspace);
    }
    return this.http.get<Task[]>(this.apiUrl, { params });
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  createTask(task: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(id: number, task: UpdateTaskDto): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateTaskStatus(id: number, status: string): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}/status`, { status });
  }
}
```

#### HTTP Interceptor (Error Handling)

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error) => {
      const message = error.error?.message || 'An error occurred';
      toastService.showError(message);
      return throwError(() => error);
    }),
  );
};
```

#### app.config.ts with HTTP Interceptor

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([errorInterceptor])),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '[data-theme="dark"]',
        },
      },
    }),
  ],
};
```

### Frontend Project Structure (Nx App)

```
apps/frontend/
├── src/
│   ├── app/
│   │   ├── core/                    # Singleton services
│   │   │   ├── services/
│   │   │   │   ├── api.service.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── toast.service.ts
│   │   │   └── interceptors/
│   │   │       └── error.interceptor.ts
│   │   ├── shared/                  # Shared components
│   │   │   ├── components/
│   │   │   │   ├── button/
│   │   │   │   ├── card/
│   │   │   │   └── loader/
│   │   │   └── directives/
│   │   ├── features/                # Feature modules (lazy loaded)
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard.component.ts
│   │   │   │   └── dashboard.component.html
│   │   │   ├── tasks/
│   │   │   │   ├── tasks.routes.ts
│   │   │   │   ├── components/
│   │   │   │   │   ├── backlog-sidebar/
│   │   │   │   │   ├── kanban-board/
│   │   │   │   │   └── task-card/
│   │   │   │   └── services/
│   │   │   │       └── task-state.service.ts
│   │   │   ├── settings/
│   │   │   └── auth/
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   ├── models/
│   │   │   ├── task.model.ts
│   │   │   └── workspace.model.ts
│   │   ├── app.component.ts         # Root component
│   │   ├── app.routes.ts            # Route definitions
│   │   └── app.config.ts            # Application configuration
│   ├── assets/
│   │   ├── icons/
│   │   └── sounds/
│   ├── styles/
│   │   ├── tokens.css               # Design tokens
│   │   ├── global.css               # Global styles
│   │   └── tailwind.css             # Tailwind imports
│   ├── main.ts                      # Bootstrap file
│   └── index.html
├── project.json                     # Nx project config
├── tailwind.config.js
├── tsconfig.app.json
└── proxy.conf.json
```

---

## Backend Architecture (NestJS REST API)

### Core Technologies

- **Framework:** NestJS 10.x
- **Runtime:** Node.js 20+ LTS
- **Language:** TypeScript 5.x
- **Database:** PostgreSQL 16+
- **ORM:** Prisma 5.x
- **API:** RESTful
- **Validation:** class-validator + class-transformer
- **Protocol:** HTTP/HTTPS

### Backend Module Structure (Nx App)

```
apps/backend/
├── src/
│   ├── main.ts                      # Bootstrap file
│   ├── app.module.ts                # Root module
│   ├── config/                      # Configuration
│   │   └── app.config.ts
│   ├── common/                      # Shared utilities
│   │   ├── decorators/
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── logging.interceptor.ts
│   │   └── pipes/
│   │       └── validation.pipe.ts
│   ├── prisma/                      # Prisma service
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── tasks/                       # Tasks module
│   │   ├── tasks.module.ts
│   │   ├── tasks.controller.ts      # REST controller
│   │   ├── tasks.service.ts
│   │   └── dto/
│   │       ├── create-task.dto.ts
│   │       └── update-task.dto.ts
│   ├── channels/                    # Channels module
│   │   ├── channels.module.ts
│   │   ├── channels.controller.ts   # REST controller
│   │   ├── channels.service.ts
│   │   └── dto/
│   │       ├── create-channel.dto.ts
│   │       └── update-channel.dto.ts
│   └── auth/                        # Auth module (v0.5+)
│       ├── auth.module.ts
│       ├── auth.controller.ts
│       └── auth.service.ts
├── prisma/
│   ├── schema.prisma                # Prisma schema
│   ├── migrations/                  # Database migrations
│   └── seed.ts                      # Database seeding
├── project.json                     # Nx project config
└── tsconfig.app.json
```

### Prisma + PostgreSQL Configuration

#### prisma/schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Task {
  id          Int       @id @default(autoincrement())
  title       String
  description String?
  workspace   Workspace @default(PERSONAL)
  channelId   Int?      @map("channel_id")
  channel     Channel?  @relation(fields: [channelId], references: [id], onDelete: SetNull)
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

model Channel {
  id        Int       @id @default(autoincrement())
  name      String
  workspace Workspace @default(PERSONAL)
  color     String?
  createdAt DateTime  @default(now()) @map("created_at")
  tasks     Task[]

  @@map("channels")
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

#### prisma/prisma.service.ts

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

#### prisma/prisma.module.ts

```typescript
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

#### app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { TasksModule } from './tasks/tasks.module';
import { ChannelsModule } from './channels/channels.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    TasksModule,
    ChannelsModule,
  ],
})
export class AppModule {}
```

### REST Controllers and DTOs

#### tasks/tasks.controller.ts

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
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
  ) {
    return this.tasksService.findAll({ status, workspace });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
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

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: TaskStatus,
  ) {
    return this.tasksService.updateStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }
}
```

#### tasks/dto/create-task.dto.ts

```typescript
import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsInt,
} from 'class-validator';
import { TaskStatus, Workspace } from '@prisma/client';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(Workspace)
  workspace: Workspace;

  @IsOptional()
  @IsInt()
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

#### tasks/dto/update-task.dto.ts

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
```

### REST API Endpoints

#### Task Endpoints

| Method | Endpoint                | Description                           | Request Body             | Response         |
| ------ | ----------------------- | ------------------------------------- | ------------------------ | ---------------- |
| GET    | `/api/tasks`            | Get all tasks (with optional filters) | -                        | `Task[]`         |
| GET    | `/api/tasks/:id`        | Get single task by ID                 | -                        | `Task`           |
| POST   | `/api/tasks`            | Create new task                       | `CreateTaskDto`          | `Task`           |
| PUT    | `/api/tasks/:id`        | Update task (full update)             | `UpdateTaskDto`          | `Task`           |
| PATCH  | `/api/tasks/:id/status` | Update task status only               | `{ status: TaskStatus }` | `Task`           |
| DELETE | `/api/tasks/:id`        | Delete task                           | -                        | `204 No Content` |

#### Channel Endpoints

| Method | Endpoint            | Description              | Request Body       | Response         |
| ------ | ------------------- | ------------------------ | ------------------ | ---------------- |
| GET    | `/api/channels`     | Get all channels         | -                  | `Channel[]`      |
| GET    | `/api/channels/:id` | Get single channel by ID | -                  | `Channel`        |
| POST   | `/api/channels`     | Create new channel       | `CreateChannelDto` | `Channel`        |
| PUT    | `/api/channels/:id` | Update channel           | `UpdateChannelDto` | `Channel`        |
| DELETE | `/api/channels/:id` | Delete channel           | -                  | `204 No Content` |

#### Query Parameters

**GET `/api/tasks`:**

- `status` (optional): Filter by task status (`BACKLOG`, `TODAY`, `IN_PROGRESS`, `DONE`)
- `workspace` (optional): Filter by workspace (`WORK`, `PERSONAL`)

Example:

```
GET /api/tasks?status=TODAY&workspace=WORK
```

#### Example Responses

**GET `/api/tasks`:**

```json
[
  {
    "id": 1,
    "title": "Complete project proposal",
    "description": "Write and submit Q1 proposal",
    "workspace": "WORK",
    "channelId": 2,
    "channel": {
      "id": 2,
      "name": "Projects",
      "workspace": "WORK",
      "color": "#8B7BB8"
    },
    "status": "TODAY",
    "dueDate": "2025-11-15T00:00:00.000Z",
    "isRoutine": false,
    "createdAt": "2025-11-12T10:30:00.000Z",
    "updatedAt": "2025-11-12T14:20:00.000Z"
  }
]
```

**POST `/api/tasks`:**
Request:

```json
{
  "title": "Morning standup",
  "workspace": "WORK",
  "channelId": 3,
  "status": "TODAY",
  "isRoutine": true
}
```

Response:

```json
{
  "id": 23,
  "title": "Morning standup",
  "description": null,
  "workspace": "WORK",
  "channelId": 3,
  "status": "TODAY",
  "dueDate": null,
  "isRoutine": true,
  "createdAt": "2025-11-12T16:45:00.000Z",
  "updatedAt": "2025-11-12T16:45:00.000Z"
}
```

---

## Development Workflow (Nx Monorepo)

### Root Structure

```
tasker/
├── apps/
│   ├── frontend/          # Angular app
│   └── backend/           # NestJS app
├── libs/                  # Shared libraries (optional)
│   └── shared-types/      # Shared TypeScript types
├── tools/                 # Custom Nx generators/executors
├── nx.json                # Nx configuration
├── package.json           # Single package.json for entire monorepo
├── tsconfig.base.json     # Base TypeScript config
└── .env                   # Environment variables (root level)
```

### package.json (Single, Root Level)

```json
{
  "name": "tasker",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "nx run-many --target=serve --projects=backend,frontend --parallel",
    "dev:frontend": "nx serve frontend",
    "dev:backend": "nx serve backend",
    "build": "nx run-many --target=build --all",
    "build:frontend": "nx build frontend --prod",
    "build:backend": "nx build backend --prod",
    "test": "nx run-many --target=test --all",
    "test:frontend": "nx test frontend",
    "test:backend": "nx test backend",
    "lint": "nx run-many --target=lint --all",
    "prisma:generate": "nx run backend:prisma-generate",
    "prisma:migrate": "nx run backend:prisma-migrate",
    "prisma:studio": "nx run backend:prisma-studio",
    "prisma:seed": "nx run backend:prisma-seed",
    "prisma:reset": "nx run backend:prisma-reset",
    "graph": "nx graph"
  },
  "dependencies": {
    "@angular/animations": "^20.0.0",
    "@angular/common": "^20.0.0",
    "@angular/compiler": "^20.0.0",
    "@angular/core": "^20.0.0",
    "@angular/forms": "^20.0.0",
    "@angular/platform-browser": "^20.0.0",
    "@angular/router": "^20.0.0",
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "primeng": "^18.0.0",
    "tailwindcss": "^3.4.0",
    "rxjs": "^7.8.0",
    "reflect-metadata": "^0.1.13",
    "tslib": "^2.6.0"
  },
  "devDependencies": {
    "@nx/angular": "^18.0.0",
    "@nx/nest": "^18.0.0",
    "@nx/workspace": "^18.0.0",
    "nx": "^18.0.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0"
  }
}
```

### Environment Configuration

#### .env (Root Level)

```
# Backend
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/tasker_dev?schema=public"

# Frontend
API_URL=http://localhost:3000
```

### Nx Configuration

#### nx.json

```json
{
  "npmScope": "tasker",
  "affected": {
    "defaultBase": "main"
  },
  "targetDefaults": {
    "build": {
      "cache": true,
      "dependsOn": ["^build"]
    },
    "test": {
      "cache": true
    }
  },
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "test", "lint"]
      }
    }
  }
}
```

### Proxy Configuration (Frontend)

#### apps/frontend/proxy.conf.json

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

---

## Database Operations

### Prisma Commands

```bash
# Generate Prisma Client (run after schema changes)
npm run prisma:generate

# Create a new migration
npm run prisma:migrate
# or
npx prisma migrate dev --name add_feature_name

# Apply migrations in production
npx prisma migrate deploy

# Open Prisma Studio (visual database browser)
npm run prisma:studio

# Seed database with test data
npm run prisma:seed

# Reset database (drop, recreate, migrate, seed)
npm run prisma:reset
```

### Seeding Test Data

The seed command populates the database with realistic test data:

**What gets created:**

- 6 channels (3 work, 3 personal)
- 22 tasks across different statuses
- 7 routine tasks (daily habits)
- Tasks in all states: Backlog, Today, In Progress, Done

**Example output:**

```
🌱 Seeding database...
📂 Creating channels...
✅ Created 6 channels
📝 Creating tasks...
✅ Created 22 tasks

📊 Task breakdown:
   Backlog: 10
   Today: 9
   In Progress: 1
   Done: 2
   Routine tasks: 7

✨ Database seeded successfully!
```

**Seed file location:** `apps/backend/prisma/seed.ts`

See `docs/DATABASE_SCHEMA.md` for complete seed script implementation.

---

## Key Configuration Files

### .gitignore

```
# Dependencies
node_modules/
package-lock.json

# Build outputs
dist/
build/
.angular/

# Database
*.db
*.sqlite
database/*.db

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*

# Testing
coverage/
.nyc_output/

# Misc
.cache/
tmp/
temp/
```

### .editorconfig

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

[*.{ts,js}]
quote_type = single
```

### tsconfig.json (Frontend)

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "sourceMap": true,
    "declaration": false,
    "experimentalDecorators": true,
    "moduleResolution": "bundler",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "dom"],
    "paths": {
      "@app/*": ["src/app/*"],
      "@core/*": ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"],
      "@features/*": ["src/app/features/*"]
    }
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

### tsconfig.json (Backend)

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

---

## Testing Strategy

### Frontend Testing

- **Unit Tests:** Jasmine + Karma (Angular default)
- **E2E Tests:** Playwright (recommended over Protractor)
- **Test Signals:** Use TestBed with signal testing utilities

### Backend Testing

- **Unit Tests:** Jest (NestJS default)
- **E2E Tests:** Supertest + Jest
- **Database:** PostgreSQL test database or Docker container

---

## Performance Optimizations

### Frontend

1. **Lazy Loading:** All feature routes lazy loaded
2. **OnPush (not needed):** Zoneless + signals handle this automatically
3. **Virtual Scrolling:** For long task lists (PrimeNG p-virtualScroller)
4. **Image Optimization:** Use WebP with fallbacks
5. **Bundle Analysis:** Use webpack-bundle-analyzer

### Backend

1. **Database Indexes:** On frequently queried columns (status, workspace) - defined in Prisma schema
2. **Query Optimization:** Use Prisma's efficient query engine and select specific fields
3. **Response Caching:** Redis (v1.0+) for frequently accessed data
4. **Pagination:** Implement cursor-based pagination for large lists
5. **Compression:** Enable gzip compression for API responses

---

## Security Considerations

### v0.1 (No Auth)

- Input validation with class-validator in DTOs
- SQL injection prevention (Prisma handles parameterized queries)
- CORS configuration for frontend origin only
- Rate limiting (express-rate-limit)
- Request size limits
- Helmet.js for security headers

### v0.5+ (With Auth)

- JWT authentication
- Password hashing (bcrypt)
- CSRF protection
- Secure HTTP headers (helmet)
- Session management

---

## Deployment Strategy (Separate Servers)

### Overview

- **Frontend:** Static site hosting (Vercel, Netlify, AWS S3+CloudFront)
- **Backend:** Node.js hosting (Railway, Render, Fly.io, AWS ECS)
- **Database:** Managed PostgreSQL (Supabase, Neon, Railway, AWS RDS)

### Frontend Deployment

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Build frontend
nx build frontend --prod

# Deploy
cd dist/apps/frontend
vercel --prod
```

**vercel.json:**

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

#### Environment Variables (Vercel)

```
API_URL=https://api.yourdomain.com
```

### Backend Deployment

#### Railway (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to project
railway link

# Deploy
railway up
```

**railway.json:**

```json
{
  "build": {
    "builder": "nixpacks",
    "buildCommand": "npm run build:backend"
  },
  "deploy": {
    "startCommand": "node dist/apps/backend/main.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "on_failure"
  }
}
```

#### Environment Variables (Railway)

```
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/database
CORS_ORIGIN=https://yourdomain.com
JWT_SECRET=your-secret-key
```

#### Dockerfile (Alternative)

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production

COPY dist/apps/backend ./dist/apps/backend

RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/apps/backend/main.js"]
```

### Database Deployment

#### Neon (Serverless PostgreSQL - Recommended)

1. Create account at https://neon.tech
2. Create new project
3. Copy connection string
4. Set `DATABASE_URL` in backend environment

#### Railway PostgreSQL

```bash
# Add PostgreSQL to Railway project
railway add postgresql

# Get connection string
railway variables

# Run migrations
railway run npm run prisma:migrate deploy
```

### CI/CD Pipeline

#### GitHub Actions

**.github/workflows/deploy.yml:**

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build backend
        run: nx build backend --prod

      - name: Run Prisma migrations
        run: npm run prisma:migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build frontend
        run: nx build frontend --prod
        env:
          API_URL: ${{ secrets.API_URL }}

      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### Health Checks

#### Backend Health Endpoint

```typescript
// main.ts
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});
```

### Monitoring & Logging

**Production Setup:**

- **Application Monitoring:** Sentry for error tracking
- **Performance:** New Relic or Datadog APM
- **Logs:** Railway logs, AWS CloudWatch, or Papertrail
- **Database:** Built-in monitoring from Neon/Railway

---

## Next Steps (Implementation Order)

1. **Initialize Nx Monorepo**
   - Install Nx CLI
   - Create Nx workspace with Angular + NestJS presets
   - Initialize Git
   - Set up project structure (apps/frontend, apps/backend)

2. **Backend Setup**
   - Install Prisma and PostgreSQL driver
   - Initialize Prisma schema
   - Configure PostgreSQL connection
   - Set up REST controllers with proper decorators
   - Create Prisma service and module
   - Define DTOs with class-validator
   - Run Prisma migrations

3. **Frontend Setup**
   - Configure Angular 20 with standalone components
   - Set up zoneless change detection
   - Configure Tailwind CSS
   - Install and configure PrimeNG
   - Set up HttpClient for REST API
   - Configure proxy for /api endpoint
   - Create typed API service interfaces

4. **Connect Frontend & Backend**
   - Create HTTP API service
   - Test REST endpoints
   - Verify type safety with shared interfaces
   - Test data flow end-to-end

5. **Build v0.1 Features**
   - Task state management with signals
   - Backlog sidebar component
   - Kanban board component
   - Drag & drop (PrimeNG or Angular CDK)
   - REST API operations for CRUD

---

## Dependencies Overview

### Core Dependencies (Single package.json)

```json
{
  "dependencies": {
    "@angular/animations": "^20.0.0",
    "@angular/common": "^20.0.0",
    "@angular/compiler": "^20.0.0",
    "@angular/core": "^20.0.0",
    "@angular/forms": "^20.0.0",
    "@angular/platform-browser": "^20.0.0",
    "@angular/router": "^20.0.0",
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "primeng": "^18.0.0",
    "primeicons": "^7.0.0",
    "@primeng/themes": "^18.0.0",
    "tailwindcss": "^3.4.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "rxjs": "^7.8.0",
    "reflect-metadata": "^0.1.13",
    "tslib": "^2.6.0"
  },
  "devDependencies": {
    "@nx/angular": "^18.0.0",
    "@nx/nest": "^18.0.0",
    "@nx/workspace": "^18.0.0",
    "nx": "^18.0.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## Architecture Decision Records (ADRs)

### ADR-001: Use Signals Instead of RxJS for State

**Decision:** Use Angular Signals for all component and service state management
**Rationale:**

- Native to Angular 20
- Better performance with zoneless
- Simpler mental model
- Automatic dependency tracking
  **Alternatives Considered:** NgRx, RxJS BehaviorSubjects, Akita

### ADR-002: Use Prisma with PostgreSQL

**Decision:** Prisma as ORM with PostgreSQL database
**Rationale:**

- Type-safe database client
- Excellent TypeScript support
- Modern migration system
- GraphQL integrates naturally
- Production-ready from day 1
  **Alternatives Considered:** TypeORM, MikroORM, Sequelize

### ADR-003: Use PrimeNG + Tailwind

**Decision:** PrimeNG components with Tailwind utility classes
**Rationale:**

- PrimeNG provides complex components (datepicker, dropdown, drag-drop)
- Tailwind for custom styling and layout
- Both support theming (light/dark mode)
- No component library lock-in for custom components
  **Alternatives Considered:** Material, Ant Design, Headless UI + Tailwind

### ADR-004: Zoneless Change Detection

**Decision:** Enable experimental zoneless mode
**Rationale:**

- Better performance (no zone.js overhead)
- Forces best practices (signals, OnPush equivalent)
- Future-proof (Angular's direction)
- Works well with signals
  **Alternatives Considered:** Keep Zone.js, OnPush strategy

### ADR-005: Use Nx Monorepo

**Decision:** Nx integrated monorepo with single package.json
**Rationale:**

- Single node_modules (faster installs, less disk space)
- Shared tooling configuration
- Intelligent build caching
- Dependency graph visualization
- Easier deployment pipeline
  **Alternatives Considered:** npm workspaces, Turborepo, Lerna

---

## Estimated Timeline

### Day 1: Nx Monorepo Setup (4-6 hours)

- Initialize Nx workspace with Angular + NestJS
- Set up Prisma + PostgreSQL connection
- Configure REST controllers
- Create database schema and run migrations
- Verify dev servers run (`nx serve backend`, `nx serve frontend`)

### Day 2: Backend REST API (4-6 hours)

- Implement REST controllers (tasks, channels)
- Create Prisma service layer
- Add input validation with DTOs
- Test with Postman or similar

### Day 3: Frontend Foundation (4-6 hours)

- Set up HttpClient service
- Create typed API service interfaces
- Create task state service with signals
- Create basic layout component
- Set up routing and guards

### Day 4-7: Feature Development

- Build backlog sidebar
- Build kanban board
- Implement drag & drop
- Connect to backend via REST API
- Polish and test

**Total: ~35-40 hours over 7 days**

---

**Document Version:** 3.0
**Last Updated:** 2025-11-12
**Status:** Updated with Nx, Prisma, REST API, PostgreSQL - Ready for Implementation
