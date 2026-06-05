-- =============================================================================
-- ORKESTRANDO - Backup & Restore Script
-- =============================================================================

-- =============================================================================
-- BACKUP
-- =============================================================================

-- Full database backup (custom format, includes everything):
-- pg_dump -h <HOST> -p <PORT> -U <USER> -Fc --verbose --file=orkestrando_backup_$(date +%Y%m%d_%H%M%S).dump orkestrando

-- SQL plain-text backup (human-readable):
-- pg_dump -h <HOST> -p <PORT> -U <USER> --verbose --file=orkestrando_backup_$(date +%Y%m%d_%H%M%S).sql orkestrando

-- Data-only backup (no schema, just INSERT statements):
-- pg_dump -h <HOST> -p <PORT> -U <USER> --data-only --verbose --file=orkestrando_data_$(date +%Y%m%d_%H%M%S).sql orkestrando

-- Schema-only backup (no data, just CREATE TABLE/INDEX statements):
-- pg_dump -h <HOST> -p <PORT> -U <USER> --schema-only --verbose --file=orkestrando_schema_$(date +%Y%m%d_%H%M%S).sql orkestrando

-- Backup specific tables only:
-- pg_dump -h <HOST> -p <PORT> -U <USER> -t roles -t permissions -t role_permissions -t user_roles --verbose --file=orkestrando_rbac_$(date +%Y%m%d_%H%M%S).sql orkestrando

-- =============================================================================
-- RESTORE
-- =============================================================================

-- Restore from custom format dump:
-- pg_restore -h <HOST> -p <PORT> -U <USER> --verbose --clean --if-exists --dbname=orkestrando orkestrando_backup_YYYYMMDD_HHMMSS.dump

-- Restore from SQL plain-text:
-- psql -h <HOST> -p <PORT> -U <USER> --dbname=orkestrando -f orkestrando_backup_YYYYMMDD_HHMMSS.sql

-- Restore data-only (assumes schema already exists):
-- psql -h <HOST> -p <PORT> -U <USER> --dbname=orkestrando -f orkestrando_data_YYYYMMDD_HHMMSS.sql

-- =============================================================================
-- ENVIRONMENT VARIABLES (replace with your actual values)
-- =============================================================================
-- HOST: Your Supabase PostgreSQL host (e.g., db.xxxxx.supabase.co)
-- PORT: 5432 (default PostgreSQL port) or 6543 (Supabase pooler)
-- USER: postgres (default Supabase user)
-- DATABASE: postgres (default Supabase database name)
-- PASSWORD: From your Supabase dashboard > Settings > Database
--
-- Using .pgpass file (recommended for automation):
-- Create ~/.pgpass with: <HOST>:<PORT>:<DATABASE>:<USER>:<PASSWORD>
-- Set permissions: chmod 600 ~/.pgpass
-- =============================================================================
