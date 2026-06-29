@echo off
echo Wiping remote database...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" "postgresql://chad_tutor_db_user:tlVhag8FZs4dEXeq2KlO5Is5B1NqAEfY@dpg-d8tv7lernols73bj1uvg-a.oregon-postgres.render.com/chad_tutor_db?sslmode=require" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

echo Performing full dump and restore...
"C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" --clean --if-exists --no-owner --no-privileges "postgresql://postgres:Asdfghjkl;'@127.0.0.1:5432/chad_tutor" | "C:\Program Files\PostgreSQL\18\bin\psql.exe" "postgresql://chad_tutor_db_user:tlVhag8FZs4dEXeq2KlO5Is5B1NqAEfY@dpg-d8tv7lernols73bj1uvg-a.oregon-postgres.render.com/chad_tutor_db?sslmode=require"
echo Migration complete.
