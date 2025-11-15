import { PrismaClient, Workspace } from '@prisma/client';

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
