const { execSync } = require('child_process');

const RENDER_DB = {
  host: 'dpg-d6jcnnruibrs73ainhng-a.oregon-postgres.render.com',
  user: 'chad_tutor_user',
  password: 'PlyoTGZW2E6wjXRhnFGqlEPios4rHF6t',
  database: 'chad_tutor'
};

const PG_BIN = "C:\\Program Files\\PostgreSQL\\18\\bin";

const tables = [
  'User', 'UserSettings', 'Enforcement', 'Goal', 'SettingsChangeLog',
  'University', 'Course', 'Semester', 'Subject', 'ExternalSource',
  'SearchCache', 'SearchLog', 'ContentUsage', 'ContentRefresh',
  'SkillCategory', 'SkillTag', 'Skill', 'SkillEdge', 'Roadmap',
  'UserSkillProgress', 'UserSelectedSkill', '_SkillToSkillTag'
];

process.env.PGPASSWORD = RENDER_DB.password;

console.log('Render Database Contents:');
console.log('='.repeat(40));

for (const table of tables) {
  try {
    const cmd = `"${PG_BIN}\\psql.exe" -h ${RENDER_DB.host} -U ${RENDER_DB.user} -d ${RENDER_DB.database} -t -A -c "SELECT count(*) FROM \\"${table}\\""`;
    const count = execSync(cmd, { encoding: 'utf8' }).trim();
    console.log(`${table.padEnd(25)} ${count}`);
  } catch (e) {
    console.log(`${table.padEnd(25)} ERROR`);
  }
}

console.log('='.repeat(40));

// Check FK constraints count
try {
  const cmd = `"${PG_BIN}\\psql.exe" -h ${RENDER_DB.host} -U ${RENDER_DB.user} -d ${RENDER_DB.database} -t -A -c "SELECT count(*) FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public'"`;
  const count = execSync(cmd, { encoding: 'utf8' }).trim();
  console.log(`FK Constraints: ${count}`);
} catch (e) {
  console.log('FK Constraints: ERROR');
}
