const { execSync } = require('child_process');

const localUrl = `postgresql://postgres:Asdfghjkl;'@127.0.0.1:5432/chad_tutor`;
const remoteUrl = `postgresql://chad_tutor_db_user:tlVhag8FZs4dEXeq2KlO5Is5B1NqAEfY@dpg-d8tv7lernols73bj1uvg-a.oregon-postgres.render.com/chad_tutor_db?sslmode=require`;

console.log('Starting data migration from local to Render...');

try {
  // We use pg_dump to dump data only, since the schema was already pushed by Prisma
  // --data-only ensures we don't recreate tables. --disable-triggers prevents foreign key errors during restore
  const command = `""C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe"" --data-only --disable-triggers "${localUrl}" | ""C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe"" "${remoteUrl}"`;
  
  console.log('Running: ', command.replace(/:Asdfghjkl;'/g, ':***').replace(/:tlVhag8FZs4dEXeq2KlO5Is5B1NqAEfY/g, ':***'));
  
  execSync(command, { stdio: 'inherit', shell: 'cmd.exe' });
  console.log('Migration successful!');
} catch (error) {
  console.error('Migration failed:', error.message);
}
