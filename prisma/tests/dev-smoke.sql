-- Run only against the disposable local Supabase database with ON_ERROR_STOP=1.
-- Fixtures are rolled back, including the temporary Supabase Auth users.
BEGIN;

DO $$
BEGIN
  IF (SELECT count(*) FROM pg_tables WHERE schemaname = 'dev'
      AND tablename <> '_prisma_migrations') <> 6 THEN
    RAISE EXCEPTION 'Expected six domain tables in dev';
  END IF;
  IF (SELECT count(*) FROM pg_tables WHERE schemaname = 'dev' AND rowsecurity) <> 6 THEN
    RAISE EXCEPTION 'Every domain table must have RLS';
  END IF;
  IF (SELECT count(*) FROM pg_policies WHERE schemaname = 'dev') <> 14 THEN
    RAISE EXCEPTION 'Expected fourteen explicit RLS policies';
  END IF;
  IF to_regclass('auth.users') IS NULL THEN
    RAISE EXCEPTION 'Supabase Auth must remain available';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public'
      AND tablename IN ('tenants', 'memberships', 'equipment_categories',
        'equipment', 'loans', 'audit_logs')) THEN
    RAISE EXCEPTION 'The dev baseline must not create domain tables in public';
  END IF;
  IF has_schema_privilege('anon', 'dev', 'USAGE') THEN
    RAISE EXCEPTION 'Anonymous users must not have access to dev';
  END IF;
END;
$$;

INSERT INTO auth.users (id) VALUES
  ('10000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002');
INSERT INTO dev.tenants (id, slug, name) VALUES
  ('20000000-0000-0000-0000-000000000001', 'smoke_a', 'Smoke A'),
  ('20000000-0000-0000-0000-000000000002', 'smoke_b', 'Smoke B');
INSERT INTO dev.memberships (id, tenant_id, user_id, display_name) VALUES
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001', 'User A'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002', 'User B');
INSERT INTO dev.equipment_categories (id, tenant_id, name) VALUES
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Notebook'),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Notebook');
INSERT INTO dev.equipment (id, tenant_id, category_id, name, asset_tag, pickup_location) VALUES
  ('50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001', 'Notebook A', 'A-1', 'Desk'),
  ('50000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002',
    '40000000-0000-0000-0000-000000000002', 'Notebook B', 'B-1', 'Desk');
INSERT INTO dev.loans (tenant_id, equipment_id, borrower_membership_id) VALUES
  ('20000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001');

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM dev.loans WHERE due_at <> borrowed_at + interval '14 days') THEN
    RAISE EXCEPTION 'The default loan deadline must be fourteen days';
  END IF;
  BEGIN
    INSERT INTO dev.loans (tenant_id, equipment_id, borrower_membership_id) VALUES
      ('20000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001');
    RAISE EXCEPTION 'A second open loan for one equipment must fail';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
  BEGIN
    INSERT INTO dev.equipment (tenant_id, category_id, name, asset_tag, pickup_location) VALUES
      ('20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002',
        'Cross tenant', 'A-2', 'Desk');
    RAISE EXCEPTION 'Cross-tenant category references must fail';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;
END;
$$;

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
DO $$
BEGIN
  IF (SELECT count(*) FROM dev.tenants) <> 1
      OR (SELECT count(*) FROM dev.memberships) <> 1
      OR (SELECT count(*) FROM dev.equipment) <> 1
      OR (SELECT count(*) FROM dev.loans) <> 1 THEN
    RAISE EXCEPTION 'RLS must expose only the authenticated tenant records';
  END IF;
  IF EXISTS (SELECT 1 FROM dev.tenants WHERE slug = 'smoke_b') THEN
    RAISE EXCEPTION 'Tenant A must not see tenant B';
  END IF;
  BEGIN
    INSERT INTO dev.equipment (tenant_id, category_id, name, asset_tag, pickup_location) VALUES
      ('20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001',
        'Unauthorized', 'A-3', 'Desk');
    RAISE EXCEPTION 'Collaborators must not create equipment';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END;
$$;
RESET ROLE;
ROLLBACK;
SELECT 'dev schema smoke checks passed' AS result;
