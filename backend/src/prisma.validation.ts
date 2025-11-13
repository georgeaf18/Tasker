import { Task, Channel, Workspace, TaskStatus } from '@prisma/client';

// Type checking - proves types are correctly generated from Prisma schema
const exampleTask: Task = {
  id: 1,
  title: 'Example Task',
  description: 'This validates Prisma type generation',
  workspace: Workspace.PERSONAL,
  channelId: null,
  status: TaskStatus.BACKLOG,
  dueDate: null,
  isRoutine: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const exampleChannel: Channel = {
  id: 1,
  name: 'Work Projects',
  workspace: Workspace.WORK,
  color: '#3B82F6',
  createdAt: new Date(),
};

// Validate enum values work
const workspaceValues = [Workspace.WORK, Workspace.PERSONAL];
const taskStatusValues = [
  TaskStatus.BACKLOG,
  TaskStatus.TODAY,
  TaskStatus.IN_PROGRESS,
  TaskStatus.DONE,
];

// Log validation success
console.log('✅ Prisma types validated successfully');
console.log('✅ Task model fields:', Object.keys(exampleTask));
console.log('✅ Channel model fields:', Object.keys(exampleChannel));
console.log('✅ Workspace enum values:', workspaceValues);
console.log('✅ TaskStatus enum values:', taskStatusValues);
console.log(
  '\n✅ All Prisma types compile and generate correctly without database connection!',
);
