// Migration script using Prisma Client with batching and retry
const { PrismaClient } = require('@prisma/client');

// Local DB connection
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:Asdfghjkl;'@localhost:5432/chad_tutor?schema=public"
    }
  }
});

// Render DB connection (from .env with connection pool settings)
const renderPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

const BATCH_SIZE = 50;
const DELAY_MS = 100;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`  Retry ${i + 1}/${retries}...`);
      await delay(2000);
      await renderPrisma.$disconnect();
      await renderPrisma.$connect();
    }
  }
}

async function main() {
  console.log('=== Complete Migration to Render (with batching) ===\n');

  try {
    // Step 1: Clear existing data on Render (in reverse dependency order)
    console.log('Step 1: Clearing existing data on Render...');
    await renderPrisma.$executeRawUnsafe('TRUNCATE TABLE "_SkillToSkillTag" CASCADE');
    await renderPrisma.$executeRawUnsafe('TRUNCATE TABLE "UserSelectedSkill" CASCADE');
    await renderPrisma.$executeRawUnsafe('TRUNCATE TABLE "UserSkillProgress" CASCADE');
    await renderPrisma.$executeRawUnsafe('TRUNCATE TABLE "SkillEdge" CASCADE');
    await renderPrisma.$executeRawUnsafe('TRUNCATE TABLE "Skill" CASCADE');
    await renderPrisma.$executeRawUnsafe('TRUNCATE TABLE "Roadmap" CASCADE');
    await renderPrisma.$executeRawUnsafe('TRUNCATE TABLE "SkillTag" CASCADE');
    await renderPrisma.$executeRawUnsafe('TRUNCATE TABLE "SkillCategory" CASCADE');
    console.log('  Done\n');

    // Step 2: Import SkillCategory (no dependencies)
    console.log('Step 2: Importing SkillCategory...');
    const categories = await localPrisma.skillCategory.findMany();
    await renderPrisma.skillCategory.createMany({ 
      data: categories,
      skipDuplicates: true 
    });
    console.log(`  Imported ${categories.length} categories\n`);

    // Step 3: Import SkillTag (no dependencies)
    console.log('Step 3: Importing SkillTag...');
    const tags = await localPrisma.skillTag.findMany();
    await renderPrisma.skillTag.createMany({ 
      data: tags,
      skipDuplicates: true 
    });
    console.log(`  Imported ${tags.length} tags\n`);

    // Step 4: Import Roadmap WITHOUT rootSkillId first (to break circular dep)
    console.log('Step 4: Importing Roadmap (without rootSkillId)...');
    const roadmaps = await localPrisma.roadmap.findMany();
    const roadmapRoots = [];
    const roadmapData = roadmaps.map(roadmap => {
      roadmapRoots.push({ id: roadmap.id, rootSkillId: roadmap.rootSkillId });
      const { rootSkillId, ...data } = roadmap;
      return { ...data, rootSkillId: null };
    });
    await renderPrisma.roadmap.createMany({ 
      data: roadmapData,
      skipDuplicates: true 
    });
    console.log(`  Imported ${roadmaps.length} roadmaps\n`);

    // Step 5: Import Skills in batches
    console.log('Step 5: Importing Skills...');
    const skills = await localPrisma.skill.findMany({
      include: { tags: true }
    });
    
    // First, get just skill data without tags
    const skillDataOnly = skills.map(skill => {
      const { tags, canonical, ...data } = skill;
      return data;
    });
    
    // Insert in batches
    for (let i = 0; i < skillDataOnly.length; i += BATCH_SIZE) {
      const batch = skillDataOnly.slice(i, i + BATCH_SIZE);
      await retry(async () => {
        await renderPrisma.skill.createMany({ 
          data: batch,
          skipDuplicates: true 
        });
      });
      process.stdout.write(`\r  Imported ${Math.min(i + BATCH_SIZE, skillDataOnly.length)}/${skillDataOnly.length} skills`);
      await delay(DELAY_MS);
    }
    console.log(`\n  Imported ${skills.length} skills\n`);

    // Step 6: Update Roadmap.rootSkillId now that Skills exist
    console.log('Step 6: Updating Roadmap rootSkillId...');
    for (const { id, rootSkillId } of roadmapRoots) {
      if (rootSkillId) {
        await retry(async () => {
          await renderPrisma.roadmap.update({
            where: { id },
            data: { rootSkillId }
          });
        });
      }
    }
    console.log(`  Updated ${roadmapRoots.filter(r => r.rootSkillId).length} roadmaps\n`);

    // Step 7: Import SkillEdge in batches
    console.log('Step 7: Importing SkillEdge...');
    const edges = await localPrisma.skillEdge.findMany();
    
    for (let i = 0; i < edges.length; i += BATCH_SIZE) {
      const batch = edges.slice(i, i + BATCH_SIZE);
      await retry(async () => {
        await renderPrisma.skillEdge.createMany({ 
          data: batch,
          skipDuplicates: true 
        });
      });
      process.stdout.write(`\r  Imported ${Math.min(i + BATCH_SIZE, edges.length)}/${edges.length} edges`);
      await delay(DELAY_MS);
    }
    console.log(`\n  Imported ${edges.length} edges\n`);

    // Step 8: Connect Skills to Tags
    console.log('Step 8: Connecting Skills to Tags...');
    let tagCount = 0;
    for (const skill of skills) {
      if (skill.tags && skill.tags.length > 0) {
        await retry(async () => {
          await renderPrisma.skill.update({
            where: { id: skill.id },
            data: {
              tags: {
                connect: skill.tags.map(t => ({ id: t.id }))
              }
            }
          });
        });
        tagCount++;
        if (tagCount % 50 === 0) {
          process.stdout.write(`\r  Connected ${tagCount} skills with tags`);
          await delay(DELAY_MS);
        }
      }
    }
    console.log(`\n  Connected ${tagCount} skills with tags\n`);

    // Step 9: Verify
    console.log('=== Verification ===');
    const verifyData = {
      SkillCategory: await renderPrisma.skillCategory.count(),
      SkillTag: await renderPrisma.skillTag.count(),
      Roadmap: await renderPrisma.roadmap.count(),
      Skill: await renderPrisma.skill.count(),
      SkillEdge: await renderPrisma.skillEdge.count(),
    };
    
    for (const [table, count] of Object.entries(verifyData)) {
      console.log(`  ${table.padEnd(20)} ${count}`);
    }

    console.log('\n=== Migration Complete! ===');
    console.log('Your database is now on Render. All changes will sync to Render.');

  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    await localPrisma.$disconnect();
    await renderPrisma.$disconnect();
  }
}

main().catch(console.error);
