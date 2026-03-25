const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const names = [
  'Programming Languages',
  'Frontend Frameworks',
  'Backend Frameworks',
  'Databases',
  'DevOps & Cloud',
  'Data Science & AI',
  'Testing & QA',
  'Security & Cybersecurity',
  'Mobile Development',
  'Design & UX',
  'Product Management',
  'Soft Skills',
  'Tools & IDEs',
  'Blockchain',
  'Game Development',
];

async function main() {
  for (const name of names) {
    const category = await prisma.skillCategory.findFirst({ where: { name } });
    const count = category
      ? await prisma.skill.count({ where: { categoryId: category.id } })
      : 0;

    console.log(`${name}: ${count}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
