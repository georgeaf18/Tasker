import {
  PrismaClient,
  Workspace,
  TaskStatus,
  SubtaskStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

interface SeedTag {
  name: string;
  color: string;
  workspaces: Workspace[];
}

const defaultTags: SeedTag[] = [
  {
    name: 'blocked',
    color: '#EF4444',
    workspaces: [Workspace.WORK, Workspace.PERSONAL],
  },
  {
    name: 'urgent',
    color: '#F97316',
    workspaces: [Workspace.WORK, Workspace.PERSONAL],
  },
  {
    name: 'bug',
    color: '#DC2626',
    workspaces: [Workspace.WORK],
  },
  {
    name: 'feature',
    color: '#10B981',
    workspaces: [Workspace.WORK],
  },
  {
    name: 'enhancement',
    color: '#3B82F6',
    workspaces: [Workspace.WORK],
  },
  {
    name: 'documentation',
    color: '#8B5CF6',
    workspaces: [Workspace.WORK],
  },
];

async function main(): Promise<void> {
  console.log('Starting database seeding...');

  // Create default tags
  for (const tag of defaultTags) {
    const created = await prisma.tag.upsert({
      where: { name: tag.name },
      update: {
        color: tag.color,
        workspaces: tag.workspaces,
      },
      create: {
        name: tag.name,
        color: tag.color,
        workspaces: tag.workspaces,
      },
    });
    console.log(`Seeded tag: ${created.name} (${created.color})`);
  }

  // Create sample channels
  const workChannel = await prisma.channel.upsert({
    where: { name: 'Development' },
    update: {
      workspace: Workspace.WORK,
      color: '#3B82F6',
    },
    create: {
      name: 'Development',
      workspace: Workspace.WORK,
      color: '#3B82F6',
    },
  });
  console.log(`Seeded channel: ${workChannel.name}`);

  const personalChannel = await prisma.channel.upsert({
    where: { name: 'Home Projects' },
    update: {
      workspace: Workspace.PERSONAL,
      color: '#10B981',
    },
    create: {
      name: 'Home Projects',
      workspace: Workspace.PERSONAL,
      color: '#10B981',
    },
  });
  console.log(`Seeded channel: ${personalChannel.name}`);

  // Create sample task with subtasks
  const sampleTask = await prisma.task.upsert({
    where: { id: 1 },
    update: {
      title: 'Implement subtasks feature',
      description:
        'Add subtask functionality to the task management system with proper database schema, API endpoints, and UI components.',
      workspace: Workspace.WORK,
      channelId: workChannel.id,
      status: TaskStatus.IN_PROGRESS,
    },
    create: {
      id: 1,
      title: 'Implement subtasks feature',
      description:
        'Add subtask functionality to the task management system with proper database schema, API endpoints, and UI components.',
      workspace: Workspace.WORK,
      channelId: workChannel.id,
      status: TaskStatus.IN_PROGRESS,
    },
  });
  console.log(`Seeded task: ${sampleTask.title}`);

  // Create sample subtasks
  const subtask1 = await prisma.subtask.upsert({
    where: { id: 1 },
    update: {
      taskId: sampleTask.id,
      title: 'Design database schema for subtasks',
      status: SubtaskStatus.DONE,
      position: 0,
      completedAt: new Date(),
    },
    create: {
      id: 1,
      taskId: sampleTask.id,
      title: 'Design database schema for subtasks',
      status: SubtaskStatus.DONE,
      position: 0,
      completedAt: new Date(),
    },
  });
  console.log(`Seeded subtask: ${subtask1.title} [${subtask1.status}]`);

  const subtask2 = await prisma.subtask.upsert({
    where: { id: 2 },
    update: {
      taskId: sampleTask.id,
      title: 'Create Prisma migration and update seed script',
      status: SubtaskStatus.DOING,
      position: 1,
    },
    create: {
      id: 2,
      taskId: sampleTask.id,
      title: 'Create Prisma migration and update seed script',
      status: SubtaskStatus.DOING,
      position: 1,
    },
  });
  console.log(`Seeded subtask: ${subtask2.title} [${subtask2.status}]`);

  const subtask3 = await prisma.subtask.upsert({
    where: { id: 3 },
    update: {
      taskId: sampleTask.id,
      title: 'Implement NestJS API endpoints for subtask CRUD operations',
      status: SubtaskStatus.TODO,
      position: 2,
    },
    create: {
      id: 3,
      taskId: sampleTask.id,
      title: 'Implement NestJS API endpoints for subtask CRUD operations',
      status: SubtaskStatus.TODO,
      position: 2,
    },
  });
  console.log(`Seeded subtask: ${subtask3.title} [${subtask3.status}]`);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e: Error) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
