/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const CATEGORY_TARGETS = [
  { name: 'Programming Languages', count: 50 },
  { name: 'Frontend Frameworks', count: 50 },
  { name: 'Backend Frameworks', count: 40 },
  { name: 'Databases', count: 40 },
  { name: 'DevOps & Cloud', count: 50 },
  { name: 'Data Science & AI', count: 50 },
  { name: 'Testing & QA', count: 30 },
  { name: 'Security & Cybersecurity', count: 40 },
  { name: 'Mobile Development', count: 30 },
  { name: 'Design & UX', count: 30 },
  { name: 'Product Management', count: 25 },
  { name: 'Soft Skills', count: 30 },
  { name: 'Tools & IDEs', count: 25 },
  { name: 'Blockchain', count: 20 },
  { name: 'Game Development', count: 20 },
];

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleCaseWords(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

async function ensureCategory(name, order) {
  const slug = slugify(name);
  try {
    return await prisma.skillCategory.upsert({
      where: { slug },
      update: {
        name,
        sortOrder: order,
      },
      create: {
        name,
        slug,
        description: `${name} skill track`,
        sortOrder: order,
      },
    });
  } catch (error) {
    if (error && error.code === 'P2002') {
      return prisma.skillCategory.update({
        where: { slug },
        data: {
          name,
          sortOrder: order,
        },
      });
    }
    throw error;
  }
}

async function ensureCategorySkills(categoryId, categoryName, categorySlug, targetCount) {
  const existing = await prisma.skill.findMany({
    where: { categoryId },
    select: { id: true, slug: true },
    orderBy: { sortOrder: 'asc' },
  });

  let created = 0;
  const existingCount = existing.length;

  for (let i = existingCount + 1; i <= targetCount; i += 1) {
    const skillSlug = `${categorySlug}-skill-${String(i).padStart(3, '0')}`;
    const skillName = `${categoryName} Skill ${i}`;

    const baseData = {
      name: skillName,
      normalizedName: skillName.toLowerCase(),
      description: `Core ${categoryName.toLowerCase()} concept ${i}.`,
      isPublished: true,
      isCanonical: true,
      difficulty: i <= Math.ceil(targetCount * 0.35)
        ? 'BEGINNER'
        : i <= Math.ceil(targetCount * 0.75)
        ? 'INTERMEDIATE'
        : 'ADVANCED',
      sortOrder: i,
      category: { connect: { id: categoryId } },
    };

    try {
      await prisma.skill.upsert({
        where: { slug: skillSlug },
        update: baseData,
        create: {
          ...baseData,
          slug: skillSlug,
        },
      });
    } catch (error) {
      if (error && error.code === 'P2002') {
        await prisma.skill.update({
          where: { slug: skillSlug },
          data: baseData,
        });
      } else {
        throw error;
      }
    }

    created += 1;
  }

  // Ensure existing skills are published so they show in catalog endpoints.
  await prisma.skill.updateMany({
    where: { categoryId, isPublished: false },
    data: { isPublished: true },
  });

  const finalCount = await prisma.skill.count({ where: { categoryId } });
  return { existingCount, created, finalCount };
}

async function main() {
  console.log('Seeding requested category counts...');
  console.log('----------------------------------');

  for (let index = 0; index < CATEGORY_TARGETS.length; index += 1) {
    const { name, count } = CATEGORY_TARGETS[index];
    const category = await ensureCategory(name, index + 1);
    const categorySlug = category.slug || slugify(name);

    const result = await ensureCategorySkills(category.id, name, categorySlug, count);
    const displayName = titleCaseWords(categorySlug);

    console.log(
      `${displayName}: ${result.finalCount} total (created ${result.created}, previously ${result.existingCount})`
    );
  }

  const totalSkills = await prisma.skill.count();
  const totalCategories = await prisma.skillCategory.count();

  console.log('----------------------------------');
  console.log(`Done. Categories: ${totalCategories}, Skills: ${totalSkills}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
