/**
 * Cleanup Roadmaps Script
 * 
 * Removes unwanted roadmaps from the database.
 * 
 * Usage:
 *   npx ts-node prisma/roadmap-automation/cleanup-roadmaps.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Roadmaps to delete (by slug)
const ROADMAPS_TO_DELETE = ['postgresql', 'roadmap-slug'];

async function main() {
  console.log('Starting roadmap cleanup...');

  for (const slug of ROADMAPS_TO_DELETE) {
    console.log(`\nProcessing roadmap: ${slug}`);

    // Find the roadmap
    const roadmap = await prisma.roadmap.findUnique({
      where: { slug },
      include: { skills: true },
    });

    if (!roadmap) {
      console.log(`  Roadmap "${slug}" not found, skipping.`);
      continue;
    }

    const skillIds = roadmap.skills.map(s => s.id);
    const skillSlugs = roadmap.skills.map(s => s.slug);

    console.log(`  Found ${skillIds.length} skills linked to this roadmap.`);

    // Delete edges associated with skills
    if (skillIds.length > 0) {
      const deletedEdges = await prisma.skillEdge.deleteMany({
        where: {
          OR: [
            { sourceId: { in: skillIds } },
            { targetId: { in: skillIds } },
          ],
        },
      });
      console.log(`  Deleted ${deletedEdges.count} edges.`);
    }

    // Unlink skills from roadmap (set roadmapId to null)
    await prisma.skill.updateMany({
      where: { roadmapId: roadmap.id },
      data: { roadmapId: null },
    });
    console.log(`  Unlinked skills from roadmap.`);

    // Delete the roadmap
    await prisma.roadmap.delete({
      where: { slug },
    });
    console.log(`  Deleted roadmap "${slug}".`);

    // Delete orphaned skills (skills that were only used in this roadmap)
    // Only delete if they don't have other relationships
    if (skillSlugs.length > 0) {
      const deletedSkills = await prisma.skill.deleteMany({
        where: {
          slug: { in: skillSlugs },
          roadmapId: null,
        },
      });
      console.log(`  Deleted ${deletedSkills.count} orphaned skills.`);
    }
  }

  console.log('\n✓ Cleanup complete!');
}

main()
  .catch((e) => {
    console.error('Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
