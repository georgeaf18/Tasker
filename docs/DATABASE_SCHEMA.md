# Database Schema Design

**Database:** PostgreSQL (all versions)
**ORM:** Prisma
**Migrations:** Prisma Migrate
**Seeding:** Prisma seed script

---

## Schema Evolution Strategy

### v0.1 (Basic Task Management)

- `tasks` - Core task data
- `channels` - Task organization (like Slack channels)

### v0.2 (Routines & Streaks)

- Add: `routine_completions` - Track daily routine completions
- Add: `streaks` - Streak tracking data

### v0.3 (Subtasks)

- Add: `parent_id` to `tasks` - Self-referencing for subtasks

### v0.4 (Archives)

- Add: `archived_at` to `tasks` - Soft delete/archive

### v0.5 (Integrations)

- Add: `integrations` - Jira, Calendar, etc.
- Add: `external_tasks` - Synced from external sources
- Add: `time_logs` - Time tracking data

### v1.0+ (Users & Auth)

- Add: `users` - User accounts
- Add: `user_id` foreign keys to all tables

---

## v0.1 Schema (MVP)

### Entity Relationship Diagram

```
┌─────────────┐           ┌─────────────┐
│   channels  │           │    tasks    │
├─────────────┤           ├─────────────┤
│ id (PK)     │◄──────────┤ id (PK)     │
│ name        │         1 │ title       │
│ workspace   │           │ description │
│ color       │        * │ workspace   │
│ created_at  │           │ channel_id  │
└─────────────┘           │ status      │
                          │ due_date    │
                          │ is_routine  │
                          │ created_at  │
                          │ updated_at  │
                          └─────────────┘
```

### Tables

#### `channels`

**Purpose:** Organize tasks into categories within workspaces (work/personal)

| Column       | Type                     | Constraints               | Description                                |
| ------------ | ------------------------ | ------------------------- | ------------------------------------------ |
| `id`         | INTEGER                  | PRIMARY KEY AUTOINCREMENT | Unique channel ID                          |
| `name`       | VARCHAR(255)             | NOT NULL                  | Channel name (e.g., "Projects", "Errands") |
| `workspace`  | ENUM('work', 'personal') | NOT NULL                  | Workspace this channel belongs to          |
| `color`      | VARCHAR(7)               | NULL                      | Hex color for visual identification        |
| `created_at` | TIMESTAMP                | NOT NULL DEFAULT NOW      | When channel was created                   |

**Indexes:**

- PRIMARY KEY on `id`
- INDEX on `workspace`

**Sample Data:**

```sql
INSERT INTO channels (name, workspace, color) VALUES
  ('Projects', 'work', '#8B7BB8'),
  ('Meetings', 'work', '#6B9AC4'),
  ('Errands', 'personal', '#C89FA7'),
  ('Health', 'personal', '#7A9B76');
```

#### `tasks`

**Purpose:** Store all task data

| Column        | Type                                            | Constraints                 | Description                      |
| ------------- | ----------------------------------------------- | --------------------------- | -------------------------------- |
| `id`          | INTEGER                                         | PRIMARY KEY AUTOINCREMENT   | Unique task ID                   |
| `title`       | VARCHAR(500)                                    | NOT NULL                    | Task title/summary               |
| `description` | TEXT                                            | NULL                        | Full task description (Markdown) |
| `workspace`   | ENUM('work', 'personal')                        | NOT NULL DEFAULT 'personal' | Work or personal task            |
| `channel_id`  | INTEGER                                         | NULL, FK → channels(id)     | Category within workspace        |
| `status`      | ENUM('backlog', 'today', 'in_progress', 'done') | NOT NULL DEFAULT 'backlog'  | Current task status              |
| `due_date`    | TIMESTAMP                                       | NULL                        | When task is due                 |
| `is_routine`  | BOOLEAN                                         | NOT NULL DEFAULT FALSE      | Whether this is a daily routine  |
| `created_at`  | TIMESTAMP                                       | NOT NULL DEFAULT NOW        | When task was created            |
| `updated_at`  | TIMESTAMP                                       | NOT NULL DEFAULT NOW        | Last update timestamp            |

**Indexes:**

- PRIMARY KEY on `id`
- INDEX on `status` (frequent filtering)
- INDEX on `workspace` (frequent filtering)
- INDEX on `channel_id` (join performance)
- INDEX on `due_date` (for "due soon" queries)

**Foreign Keys:**

- `channel_id` → `channels(id)` ON DELETE SET NULL

**Sample Data:**

```sql
INSERT INTO tasks (title, description, workspace, channel_id, status, due_date, is_routine) VALUES
  ('Review PRs', 'Review team pull requests', 'work', 1, 'today', NULL, TRUE),
  ('Sprint planning', 'Prepare for sprint planning meeting', 'work', 2, 'backlog', '2025-11-15', FALSE),
  ('Buy groceries', 'Milk, eggs, bread', 'personal', 3, 'today', NULL, FALSE),
  ('Morning workout', '30 min cardio', 'personal', 4, 'today', NULL, TRUE);
```

---

## TypeORM Entity Definitions

### Channel Entity

```typescript
// channels/entities/channel.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';

export enum Workspace {
  WORK = 'work',
  PERSONAL = 'personal',
}

@Entity('channels')
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'text',
    enum: Workspace,
    default: Workspace.PERSONAL,
  })
  workspace: Workspace;

  @Column({ type: 'varchar', length: 7, nullable: true })
  color: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Task, (task) => task.channel)
  tasks: Task[];
}
```

### Task Entity

```typescript
// tasks/entities/task.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Channel } from '../../channels/entities/channel.entity';
import { Workspace } from '../../channels/entities/channel.entity';

export enum TaskStatus {
  BACKLOG = 'backlog',
  TODAY = 'today',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'text',
    enum: Workspace,
    default: Workspace.PERSONAL,
  })
  workspace: Workspace;

  @ManyToOne(() => Channel, (channel) => channel.tasks, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'channel_id' })
  channel: Channel | null;

  @Column({
    type: 'text',
    enum: TaskStatus,
    default: TaskStatus.BACKLOG,
  })
  status: TaskStatus;

  @Column({ type: 'datetime', nullable: true })
  dueDate: Date | null;

  @Column({ type: 'boolean', default: false })
  isRoutine: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## Common Queries

### Get All Tasks for Backlog Sidebar

```typescript
// tasks.service.ts
async getBacklogTasks(workspace?: Workspace): Promise<Task[]> {
  const query = this.tasksRepository
    .createQueryBuilder('task')
    .leftJoinAndSelect('task.channel', 'channel')
    .where('task.status = :status', { status: TaskStatus.BACKLOG })
    .orderBy('task.createdAt', 'DESC');

  if (workspace) {
    query.andWhere('task.workspace = :workspace', { workspace });
  }

  return query.getMany();
}
```

### Get Tasks by Status (for Kanban Board)

```typescript
async getTasksByStatus(status: TaskStatus): Promise<Task[]> {
  return this.tasksRepository.find({
    where: { status },
    relations: ['channel'],
    order: { createdAt: 'DESC' },
  });
}
```

### Get Tasks Grouped by Channel

```typescript
async getTasksGroupedByChannel(workspace: Workspace): Promise<Record<string, Task[]>> {
  const tasks = await this.tasksRepository.find({
    where: { workspace, status: TaskStatus.BACKLOG },
    relations: ['channel'],
    order: { createdAt: 'DESC' },
  });

  // Group by channel name
  return tasks.reduce((acc, task) => {
    const channelName = task.channel?.name || 'Uncategorized';
    if (!acc[channelName]) {
      acc[channelName] = [];
    }
    acc[channelName].push(task);
    return acc;
  }, {} as Record<string, Task[]>);
}
```

### Get Routine Tasks

```typescript
async getRoutineTasks(): Promise<Task[]> {
  return this.tasksRepository.find({
    where: { isRoutine: true },
    relations: ['channel'],
    order: { title: 'ASC' },
  });
}
```

### Get Tasks Due Soon

```typescript
async getTasksDueSoon(days: number = 7): Promise<Task[]> {
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);

  return this.tasksRepository
    .createQueryBuilder('task')
    .leftJoinAndSelect('task.channel', 'channel')
    .where('task.dueDate IS NOT NULL')
    .andWhere('task.dueDate >= :now', { now })
    .andWhere('task.dueDate <= :future', { future })
    .andWhere('task.status != :done', { done: TaskStatus.DONE })
    .orderBy('task.dueDate', 'ASC')
    .getMany();
}
```

### Update Task Status (for Drag & Drop)

```typescript
async updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
  await this.tasksRepository.update(id, { status });
  return this.findOne(id);
}
```

---

## v0.2 Schema Changes (Routines & Streaks)

### Add: `routine_completions`

**Purpose:** Track when routine tasks are completed

```typescript
@Entity('routine_completions')
export class RoutineCompletion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ type: 'date' })
  completedDate: Date;

  @CreateDateColumn()
  createdAt: Date;
}
```

### Add: `streaks`

**Purpose:** Track user streaks

```typescript
@Entity('streaks')
export class Streak {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: 0 })
  currentStreak: number;

  @Column({ type: 'int', default: 0 })
  longestStreak: number;

  @Column({ type: 'date', nullable: true })
  lastCompletionDate: Date | null;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## v0.3 Schema Changes (Subtasks)

### Add: `parent_id` to `tasks`

```typescript
@Entity('tasks')
export class Task {
  // ... existing fields ...

  @ManyToOne(() => Task, (task) => task.subtasks, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Task | null;

  @OneToMany(() => Task, (task) => task.parent)
  subtasks: Task[];
}
```

**Query for Tasks with Subtasks:**

```typescript
async getTaskWithSubtasks(id: number): Promise<Task> {
  return this.tasksRepository.findOne({
    where: { id },
    relations: ['subtasks', 'channel'],
  });
}
```

---

## v0.4 Schema Changes (Archives)

### Add: `archived_at` to `tasks`

```typescript
@Entity('tasks')
export class Task {
  // ... existing fields ...

  @Column({ type: 'datetime', nullable: true })
  archivedAt: Date | null;
}
```

**Soft Delete Implementation:**

```typescript
async archiveTask(id: number): Promise<Task> {
  await this.tasksRepository.update(id, { archivedAt: new Date() });
  return this.findOne(id);
}

async getActiveTasks(): Promise<Task[]> {
  return this.tasksRepository.find({
    where: { archivedAt: IsNull() },
    relations: ['channel'],
  });
}
```

---

## v0.5 Schema Changes (Integrations)

### Add: `integrations`

```typescript
export enum IntegrationType {
  JIRA = 'jira',
  CALENDAR = 'calendar',
  REMINDERS = 'reminders',
  EMAIL = 'email',
}

@Entity('integrations')
export class Integration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', enum: IntegrationType })
  type: IntegrationType;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'json', nullable: true })
  config: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Add: `external_tasks`

```typescript
@Entity('external_tasks')
export class ExternalTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  externalId: string; // Jira ticket ID, calendar event ID, etc.

  @Column({ type: 'text', enum: IntegrationType })
  source: IntegrationType;

  @OneToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ type: 'datetime' })
  lastSyncedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
```

### Add: `time_logs`

```typescript
@Entity('time_logs')
export class TimeLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ type: 'datetime' })
  startedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  endedAt: Date | null;

  @Column({ type: 'int' }) // Duration in seconds
  duration: number;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

## Migration Strategy

### Development (v0.1-v1.0)

Use `synchronize: true` for automatic schema updates:

```typescript
// database.config.ts
export const databaseConfig: TypeOrmModuleOptions = {
  type: 'better-sqlite3',
  database: './database/tasker.db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // Auto-create tables
  logging: true,
};
```

### Production (v1.0+)

Use TypeORM migrations:

```bash
# Generate migration
npm run migration:generate -- -n AddArchivedAtToTasks

# Run migrations
npm run migration:run

# Revert migrations
npm run migration:revert
```

```typescript
// database.config.ts
export const databaseConfig: TypeOrmModuleOptions = {
  type: 'better-sqlite3',
  database: './database/tasker.db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // Don't auto-create in production
  migrations: ['dist/migrations/*.js'],
  migrationsRun: true,
};
```

---

## Data Seeding

### Prisma Seed Configuration

**package.json:**

```json
{
  "prisma": {
    "seed": "ts-node apps/backend/prisma/seed.ts"
  },
  "scripts": {
    "prisma:seed": "nx run backend:prisma-seed",
    "prisma:reset": "nx run backend:prisma-reset"
  }
}
```

**apps/backend/project.json (add prisma-seed target):**

```json
{
  "targets": {
    "prisma-seed": {
      "executor": "nx:run-commands",
      "options": {
        "command": "npx prisma db seed",
        "cwd": "apps/backend"
      }
    },
    "prisma-reset": {
      "executor": "nx:run-commands",
      "options": {
        "command": "npx prisma migrate reset --force",
        "cwd": "apps/backend"
      }
    }
  }
}
```

### Seed Script

**apps/backend/prisma/seed.ts:**

```typescript
import { PrismaClient, TaskStatus, Workspace } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (optional - useful for development)
  await prisma.task.deleteMany();
  await prisma.channel.deleteMany();

  console.log('📂 Creating channels...');

  // Create channels
  const workProjects = await prisma.channel.create({
    data: {
      name: 'Projects',
      workspace: Workspace.WORK,
      color: '#8B7BB8',
    },
  });

  const workMeetings = await prisma.channel.create({
    data: {
      name: 'Meetings',
      workspace: Workspace.WORK,
      color: '#6B9AC4',
    },
  });

  const workLearning = await prisma.channel.create({
    data: {
      name: 'Learning',
      workspace: Workspace.WORK,
      color: '#7A9B76',
    },
  });

  const personalErrands = await prisma.channel.create({
    data: {
      name: 'Errands',
      workspace: Workspace.PERSONAL,
      color: '#C89FA7',
    },
  });

  const personalHealth = await prisma.channel.create({
    data: {
      name: 'Health',
      workspace: Workspace.PERSONAL,
      color: '#7A9B76',
    },
  });

  const personalHome = await prisma.channel.create({
    data: {
      name: 'Home',
      workspace: Workspace.PERSONAL,
      color: '#C97064',
    },
  });

  console.log('✅ Created 6 channels');

  console.log('📝 Creating tasks...');

  // Create test tasks
  const tasks = [
    // Work - Projects (Backlog)
    {
      title: 'Design new dashboard layout',
      description: 'Create mockups for the new analytics dashboard with improved UX',
      workspace: Workspace.WORK,
      channelId: workProjects.id,
      status: TaskStatus.BACKLOG,
      dueDate: new Date('2025-11-20'),
      isRoutine: false,
    },
    {
      title: 'Refactor authentication module',
      description: 'Update auth module to use new JWT library and improve security',
      workspace: Workspace.WORK,
      channelId: workProjects.id,
      status: TaskStatus.BACKLOG,
      dueDate: null,
      isRoutine: false,
    },
    {
      title: 'Write API documentation',
      description: 'Document all REST endpoints with OpenAPI/Swagger',
      workspace: Workspace.WORK,
      channelId: workProjects.id,
      status: TaskStatus.BACKLOG,
      dueDate: new Date('2025-11-25'),
      isRoutine: false,
    },

    // Work - Projects (Today)
    {
      title: 'Review pull requests',
      description: 'Review 3 pending PRs from team members',
      workspace: Workspace.WORK,
      channelId: workProjects.id,
      status: TaskStatus.TODAY,
      dueDate: new Date(),
      isRoutine: true,
    },
    {
      title: 'Fix bug in user profile page',
      description: 'Avatar upload not working for some image formats',
      workspace: Workspace.WORK,
      channelId: workProjects.id,
      status: TaskStatus.TODAY,
      dueDate: new Date(),
      isRoutine: false,
    },

    // Work - Projects (In Progress)
    {
      title: 'Implement real-time notifications',
      description: 'Add WebSocket support for push notifications',
      workspace: Workspace.WORK,
      channelId: workProjects.id,
      status: TaskStatus.IN_PROGRESS,
      dueDate: new Date('2025-11-15'),
      isRoutine: false,
    },

    // Work - Projects (Done)
    {
      title: 'Set up CI/CD pipeline',
      description: 'Configure GitHub Actions for automated testing and deployment',
      workspace: Workspace.WORK,
      channelId: workProjects.id,
      status: TaskStatus.DONE,
      dueDate: null,
      isRoutine: false,
    },

    // Work - Meetings (Today)
    {
      title: 'Sprint planning meeting',
      description: 'Plan next 2-week sprint with the team',
      workspace: Workspace.WORK,
      channelId: workMeetings.id,
      status: TaskStatus.TODAY,
      dueDate: new Date(),
      isRoutine: false,
    },
    {
      title: '1-on-1 with manager',
      description: 'Weekly sync with manager',
      workspace: Workspace.WORK,
      channelId: workMeetings.id,
      status: TaskStatus.TODAY,
      dueDate: new Date(),
      isRoutine: true,
    },

    // Work - Meetings (Done)
    {
      title: 'Daily standup',
      description: 'Team standup meeting',
      workspace: Workspace.WORK,
      channelId: workMeetings.id,
      status: TaskStatus.DONE,
      dueDate: new Date(),
      isRoutine: true,
    },

    // Work - Learning (Backlog)
    {
      title: 'Learn Rust basics',
      description: 'Complete online Rust tutorial',
      workspace: Workspace.WORK,
      channelId: workLearning.id,
      status: TaskStatus.BACKLOG,
      dueDate: null,
      isRoutine: false,
    },
    {
      title: 'Read "Clean Architecture" book',
      description: 'Finish reading and take notes',
      workspace: Workspace.WORK,
      channelId: workLearning.id,
      status: TaskStatus.BACKLOG,
      dueDate: new Date('2025-12-01'),
      isRoutine: false,
    },

    // Personal - Errands (Today)
    {
      title: 'Buy groceries',
      description: 'Milk, eggs, bread, vegetables',
      workspace: Workspace.PERSONAL,
      channelId: personalErrands.id,
      status: TaskStatus.TODAY,
      dueDate: new Date(),
      isRoutine: false,
    },
    {
      title: 'Pick up dry cleaning',
      description: 'Suits need to be picked up before 6pm',
      workspace: Workspace.PERSONAL,
      channelId: personalErrands.id,
      status: TaskStatus.TODAY,
      dueDate: new Date(),
      isRoutine: false,
    },

    // Personal - Errands (Backlog)
    {
      title: 'Schedule car maintenance',
      description: 'Oil change and tire rotation',
      workspace: Workspace.PERSONAL,
      channelId: personalErrands.id,
      status: TaskStatus.BACKLOG,
      dueDate: new Date('2025-11-18'),
      isRoutine: false,
    },
    {
      title: 'Renew gym membership',
      description: 'Membership expires at end of month',
      workspace: Workspace.PERSONAL,
      channelId: personalErrands.id,
      status: TaskStatus.BACKLOG,
      dueDate: new Date('2025-11-30'),
      isRoutine: false,
    },

    // Personal - Health (Today)
    {
      title: 'Morning workout',
      description: '30 minutes cardio + stretching',
      workspace: Workspace.PERSONAL,
      channelId: personalHealth.id,
      status: TaskStatus.TODAY,
      dueDate: new Date(),
      isRoutine: true,
    },
    {
      title: 'Take vitamins',
      description: 'Vitamin D and Omega-3',
      workspace: Workspace.PERSONAL,
      channelId: personalHealth.id,
      status: TaskStatus.TODAY,
      dueDate: new Date(),
      isRoutine: true,
    },

    // Personal - Health (Done)
    {
      title: 'Morning meditation',
      description: '10 minutes mindfulness meditation',
      workspace: Workspace.PERSONAL,
      channelId: personalHealth.id,
      status: TaskStatus.DONE,
      dueDate: new Date(),
      isRoutine: true,
    },

    // Personal - Home (Backlog)
    {
      title: 'Fix leaky faucet',
      description: 'Kitchen sink faucet needs new washer',
      workspace: Workspace.PERSONAL,
      channelId: personalHome.id,
      status: TaskStatus.BACKLOG,
      dueDate: new Date('2025-11-16'),
      isRoutine: false,
    },
    {
      title: 'Clean garage',
      description: 'Organize tools and donate unused items',
      workspace: Workspace.PERSONAL,
      channelId: personalHome.id,
      status: TaskStatus.BACKLOG,
      dueDate: null,
      isRoutine: false,
    },

    // Personal - Home (Today)
    {
      title: 'Water plants',
      description: 'Water all indoor plants',
      workspace: Workspace.PERSONAL,
      channelId: personalHome.id,
      status: TaskStatus.TODAY,
      dueDate: new Date(),
      isRoutine: true,
    },
  ];

  // Bulk create tasks
  const createdTasks = await prisma.task.createMany({
    data: tasks,
  });

  console.log(`✅ Created ${createdTasks.count} tasks`);

  // Count tasks by status
  const backlogCount = await prisma.task.count({ where: { status: TaskStatus.BACKLOG } });
  const todayCount = await prisma.task.count({ where: { status: TaskStatus.TODAY } });
  const inProgressCount = await prisma.task.count({ where: { status: TaskStatus.IN_PROGRESS } });
  const doneCount = await prisma.task.count({ where: { status: TaskStatus.DONE } });

  console.log('\n📊 Task breakdown:');
  console.log(`   Backlog: ${backlogCount}`);
  console.log(`   Today: ${todayCount}`);
  console.log(`   In Progress: ${inProgressCount}`);
  console.log(`   Done: ${doneCount}`);

  // Count routine tasks
  const routineCount = await prisma.task.count({ where: { isRoutine: true } });
  console.log(`   Routine tasks: ${routineCount}`);

  console.log('\n✨ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Running Seed Commands

```bash
# Seed the database with test data
npm run prisma:seed

# Or via Nx
nx run backend:prisma-seed

# Reset database and re-seed (useful for development)
npm run prisma:reset
# This will:
# 1. Drop the database
# 2. Recreate it
# 3. Run migrations
# 4. Run seed script
```

### Seed Output Example

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

### Conditional Seeding (Production vs Development)

For production, you might want different or no seed data:

```typescript
async function main() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    console.log('⚠️  Production environment detected');
    console.log('Skipping seed data...');
    return;
  }

  console.log('🌱 Development environment - seeding database...');
  // ... rest of seed logic
}
```

### Custom Seed Scripts

You can create multiple seed files for different purposes:

```bash
# Directory structure
apps/backend/prisma/
├── schema.prisma
├── seed.ts              # Main seed file
├── seeds/
│   ├── channels.ts      # Channel data
│   ├── tasks.ts         # Task data
│   └── minimal.ts       # Minimal seed for testing
```

**apps/backend/prisma/seed.ts:**

```typescript
import { seedChannels } from './seeds/channels';
import { seedTasks } from './seeds/tasks';

async function main() {
  const prisma = new PrismaClient();

  await seedChannels(prisma);
  await seedTasks(prisma);

  await prisma.$disconnect();
}

main();
```

---

## Database Backup Strategy

### Export to JSON

```typescript
async exportDatabase(): Promise<string> {
  const tasks = await this.tasksRepository.find({ relations: ['channel'] });
  const channels = await this.channelsRepository.find();

  return JSON.stringify({ tasks, channels }, null, 2);
}
```

### Import from JSON

```typescript
async importDatabase(data: string): Promise<void> {
  const parsed = JSON.parse(data);

  // Clear existing data (optional)
  await this.tasksRepository.clear();
  await this.channelsRepository.clear();

  // Import channels first
  await this.channelsRepository.save(parsed.channels);

  // Import tasks
  await this.tasksRepository.save(parsed.tasks);
}
```

### File System Backup

```bash
# Simple file copy
cp database/tasker.db database/backups/tasker-$(date +%Y%m%d).db

# Automated daily backup (cron)
0 3 * * * cp /path/to/tasker.db /path/to/backups/tasker-$(date +\%Y\%m\%d).db
```

---

## Performance Optimization

### Indexes

```sql
-- Already covered in table definitions
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_workspace ON tasks(workspace);
CREATE INDEX idx_tasks_channel_id ON tasks(channel_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

### Query Optimization Tips

1. **Use `leftJoinAndSelect` sparingly** - Only load relations when needed
2. **Paginate large results** - Use `skip()` and `take()` for pagination
3. **Use `select()` for specific fields** - Don't fetch entire entities if not needed
4. **Cache frequent queries** - Consider caching channel lists (rarely change)

---

## SQLite → PostgreSQL Migration (v2.0+)

### Changes Required

1. **Connection Config**

   ```typescript
   type: 'postgres',
   host: process.env.DB_HOST,
   port: 5432,
   username: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_NAME,
   ```

2. **Date Handling**
   - SQLite uses strings for dates
   - PostgreSQL uses native DATE/TIMESTAMP

3. **JSON Columns**
   - SQLite: `type: 'text'` with JSON.parse/stringify
   - PostgreSQL: `type: 'jsonb'` (native JSON)

4. **Enums**
   - SQLite: `type: 'text'` with validation
   - PostgreSQL: Native ENUM types

5. **Full-Text Search**
   - SQLite: FTS5 extension (limited)
   - PostgreSQL: Native full-text search (better)

---

## Summary

### v0.1 Schema (Ready to Implement)

- ✅ `channels` - Task categories
- ✅ `tasks` - Core task data
- ✅ Indexes for performance
- ✅ Foreign keys for data integrity

### Future Additions

- v0.2: `routine_completions`, `streaks`
- v0.3: `parent_id` for subtasks
- v0.4: `archived_at` for soft deletes
- v0.5: `integrations`, `external_tasks`, `time_logs`
- v1.0+: `users`, `sessions` (if multi-user)

---

**Document Version:** 1.0
**Last Updated:** 2025-11-12
**Status:** Ready for Implementation
