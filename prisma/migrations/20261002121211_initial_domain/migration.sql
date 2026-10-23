-- CreateEnum
CREATE TYPE "membership_role" AS ENUM ('COLLABORATOR', 'OPERATIONS');

-- CreateEnum
CREATE TYPE "equipment_status" AS ENUM ('AVAILABLE', 'MAINTENANCE', 'RETIRED');

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "membership_role" NOT NULL DEFAULT 'COLLABORATOR',
    "display_name" TEXT NOT NULL,
    "department" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "asset_tag" TEXT NOT NULL,
    "serial_number" TEXT,
    "pickup_location" TEXT NOT NULL,
    "status" "equipment_status" NOT NULL DEFAULT 'AVAILABLE',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "equipment_id" UUID NOT NULL,
    "borrower_membership_id" UUID NOT NULL,
    "borrowed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_at" TIMESTAMPTZ(6) NOT NULL,
    "returned_at" TIMESTAMPTZ(6),
    "returned_by_membership_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "actor_membership_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" UUID NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "memberships_user_id_idx" ON "memberships"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_tenant_user_key" ON "memberships"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_tenant_id_id_key" ON "memberships"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_categories_tenant_id_id_key" ON "equipment_categories"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "equipment_tenant_category_idx" ON "equipment"("tenant_id", "category_id");

-- CreateIndex
CREATE INDEX "equipment_tenant_status_idx" ON "equipment"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_tenant_id_id_key" ON "equipment"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_tenant_asset_tag_key" ON "equipment"("tenant_id", "asset_tag");

-- CreateIndex
CREATE UNIQUE INDEX "loans_tenant_id_id_key" ON "loans"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_occurred_at_idx" ON "audit_logs"("tenant_id", "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs"("tenant_id", "resource_type", "resource_id");

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_categories" ADD CONSTRAINT "equipment_categories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_tenant_id_category_id_fkey" FOREIGN KEY ("tenant_id", "category_id") REFERENCES "equipment_categories"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_tenant_id_equipment_id_fkey" FOREIGN KEY ("tenant_id", "equipment_id") REFERENCES "equipment"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_tenant_id_borrower_membership_id_fkey" FOREIGN KEY ("tenant_id", "borrower_membership_id") REFERENCES "memberships"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_tenant_id_returned_by_membership_id_fkey" FOREIGN KEY ("tenant_id", "returned_by_membership_id") REFERENCES "memberships"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_actor_membership_id_fkey" FOREIGN KEY ("tenant_id", "actor_membership_id") REFERENCES "memberships"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Relate memberships to the user identity managed by Supabase Auth.
ALTER TABLE public.memberships
ADD CONSTRAINT memberships_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Domain checks.
ALTER TABLE public.tenants
ADD CONSTRAINT tenants_slug_not_blank CHECK (btrim(slug) <> ''),
ADD CONSTRAINT tenants_name_not_blank CHECK (btrim(name) <> '');

ALTER TABLE public.memberships
ADD CONSTRAINT memberships_display_name_not_blank
  CHECK (btrim(display_name) <> ''),
ADD CONSTRAINT memberships_department_not_blank
  CHECK (department IS NULL OR btrim(department) <> '');

ALTER TABLE public.equipment_categories
ADD CONSTRAINT equipment_categories_name_not_blank
  CHECK (btrim(name) <> '');

ALTER TABLE public.equipment
ADD CONSTRAINT equipment_name_not_blank CHECK (btrim(name) <> ''),
ADD CONSTRAINT equipment_asset_tag_not_blank CHECK (btrim(asset_tag) <> ''),
ADD CONSTRAINT equipment_serial_number_not_blank
  CHECK (serial_number IS NULL OR btrim(serial_number) <> ''),
ADD CONSTRAINT equipment_pickup_location_not_blank
  CHECK (btrim(pickup_location) <> '');

ALTER TABLE public.loans
ADD CONSTRAINT loans_due_after_borrowed CHECK (due_at > borrowed_at),
ADD CONSTRAINT loans_return_fields_consistent CHECK (
  (returned_at IS NULL AND returned_by_membership_id IS NULL)
  OR
  (returned_at IS NOT NULL AND returned_by_membership_id IS NOT NULL)
),
ADD CONSTRAINT loans_return_after_borrowed
  CHECK (returned_at IS NULL OR returned_at >= borrowed_at);

ALTER TABLE public.audit_logs
ADD CONSTRAINT audit_logs_action_not_blank CHECK (btrim(action) <> ''),
ADD CONSTRAINT audit_logs_resource_type_not_blank
  CHECK (btrim(resource_type) <> ''),
ADD CONSTRAINT audit_logs_metadata_is_object
  CHECK (jsonb_typeof(metadata) = 'object');

-- Indexes that Prisma cannot express.
CREATE UNIQUE INDEX equipment_categories_tenant_name_key
ON public.equipment_categories (tenant_id, lower(btrim(name)));

CREATE UNIQUE INDEX loans_one_open_per_equipment_key
ON public.loans (tenant_id, equipment_id)
WHERE returned_at IS NULL;

CREATE INDEX loans_open_borrower_idx
ON public.loans (tenant_id, borrower_membership_id)
WHERE returned_at IS NULL;

CREATE INDEX loans_open_due_at_idx
ON public.loans (tenant_id, due_at)
WHERE returned_at IS NULL;

-- Keep updated_at under database control.
CREATE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER tenants_set_updated_at
BEFORE UPDATE ON public.tenants
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER memberships_set_updated_at
BEFORE UPDATE ON public.memberships
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER equipment_categories_set_updated_at
BEFORE UPDATE ON public.equipment_categories
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER equipment_set_updated_at
BEFORE UPDATE ON public.equipment
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Every loan receives the fixed fourteen-day deadline.
CREATE FUNCTION public.set_loan_due_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.due_at := NEW.borrowed_at + interval '14 days';
  RETURN NEW;
END;
$$;

CREATE TRIGGER loans_set_due_at
BEFORE INSERT ON public.loans
FOR EACH ROW
EXECUTE FUNCTION public.set_loan_due_at();

-- Preserve the historical identity of a loan and of a completed return.
CREATE FUNCTION public.guard_loan_immutability()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
    OR NEW.equipment_id IS DISTINCT FROM OLD.equipment_id
    OR NEW.borrower_membership_id IS DISTINCT FROM OLD.borrower_membership_id
    OR NEW.borrowed_at IS DISTINCT FROM OLD.borrowed_at
    OR NEW.due_at IS DISTINCT FROM OLD.due_at
  THEN
    RAISE EXCEPTION 'Core loan data is immutable';
  END IF;

  IF OLD.returned_at IS NOT NULL
    AND (
      NEW.returned_at IS DISTINCT FROM OLD.returned_at
      OR NEW.returned_by_membership_id
        IS DISTINCT FROM OLD.returned_by_membership_id
    )
  THEN
    RAISE EXCEPTION 'A recorded return is immutable';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER loans_10_guard_immutability
BEFORE UPDATE ON public.loans
FOR EACH ROW
EXECUTE FUNCTION public.guard_loan_immutability();

CREATE TRIGGER loans_90_set_updated_at
BEFORE UPDATE ON public.loans
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Audit records are append-only, including for roles that bypass RLS.
CREATE FUNCTION public.guard_audit_log_append_only()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION 'Audit records cannot be updated or deleted';
  RETURN NULL;
END;
$$;

CREATE TRIGGER audit_logs_append_only
BEFORE UPDATE OR DELETE ON public.audit_logs
FOR EACH ROW
EXECUTE FUNCTION public.guard_audit_log_append_only();

-- SECURITY DEFINER helpers avoid recursive membership policies.
CREATE FUNCTION public.current_membership_id(target_tenant_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT membership.id
  FROM public.memberships AS membership
  WHERE membership.tenant_id = target_tenant_id
    AND membership.user_id = (SELECT auth.uid())
  LIMIT 1;
$$;

CREATE FUNCTION public.is_tenant_member(target_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.current_membership_id(target_tenant_id) IS NOT NULL;
$$;

CREATE FUNCTION public.is_tenant_operations(target_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.memberships AS membership
    WHERE membership.tenant_id = target_tenant_id
      AND membership.user_id = (SELECT auth.uid())
      AND membership.role = 'OPERATIONS'
  );
$$;

REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_loan_due_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.guard_loan_immutability() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.guard_audit_log_append_only() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_membership_id(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_tenant_member(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_tenant_operations(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.current_membership_id(UUID)
TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_tenant_member(UUID)
TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_tenant_operations(UUID)
TO authenticated, service_role;

-- Row Level Security.
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenants_select_member
ON public.tenants
FOR SELECT
TO authenticated
USING (public.is_tenant_member(id));

CREATE POLICY memberships_select_self_or_operations
ON public.memberships
FOR SELECT
TO authenticated
USING (
  user_id = (SELECT auth.uid())
  OR public.is_tenant_operations(tenant_id)
);

CREATE POLICY equipment_categories_select_member
ON public.equipment_categories
FOR SELECT
TO authenticated
USING (public.is_tenant_member(tenant_id));

CREATE POLICY equipment_categories_insert_operations
ON public.equipment_categories
FOR INSERT
TO authenticated
WITH CHECK (public.is_tenant_operations(tenant_id));

CREATE POLICY equipment_categories_update_operations
ON public.equipment_categories
FOR UPDATE
TO authenticated
USING (public.is_tenant_operations(tenant_id))
WITH CHECK (public.is_tenant_operations(tenant_id));

CREATE POLICY equipment_categories_delete_operations
ON public.equipment_categories
FOR DELETE
TO authenticated
USING (public.is_tenant_operations(tenant_id));

CREATE POLICY equipment_select_member
ON public.equipment
FOR SELECT
TO authenticated
USING (public.is_tenant_member(tenant_id));

CREATE POLICY equipment_insert_operations
ON public.equipment
FOR INSERT
TO authenticated
WITH CHECK (public.is_tenant_operations(tenant_id));

CREATE POLICY equipment_update_operations
ON public.equipment
FOR UPDATE
TO authenticated
USING (public.is_tenant_operations(tenant_id))
WITH CHECK (public.is_tenant_operations(tenant_id));

CREATE POLICY loans_select_owner_or_operations
ON public.loans
FOR SELECT
TO authenticated
USING (
  borrower_membership_id = public.current_membership_id(tenant_id)
  OR public.is_tenant_operations(tenant_id)
);

CREATE POLICY loans_insert_owner
ON public.loans
FOR INSERT
TO authenticated
WITH CHECK (
  borrower_membership_id = public.current_membership_id(tenant_id)
);

CREATE POLICY loans_update_owner_or_operations
ON public.loans
FOR UPDATE
TO authenticated
USING (
  borrower_membership_id = public.current_membership_id(tenant_id)
  OR public.is_tenant_operations(tenant_id)
)
WITH CHECK (
  borrower_membership_id = public.current_membership_id(tenant_id)
  OR public.is_tenant_operations(tenant_id)
);

CREATE POLICY audit_logs_select_operations
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.is_tenant_operations(tenant_id));

CREATE POLICY audit_logs_insert_current_actor
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (
  actor_membership_id = public.current_membership_id(tenant_id)
);

-- Explicit grants complement RLS. Anonymous access remains denied.
REVOKE ALL ON public.tenants,
  public.memberships,
  public.equipment_categories,
  public.equipment,
  public.loans,
  public.audit_logs
FROM anon, authenticated;

GRANT USAGE ON SCHEMA public TO authenticated, service_role;
GRANT USAGE ON TYPE public.membership_role, public.equipment_status
TO authenticated, service_role;

GRANT SELECT ON public.tenants, public.memberships TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipment_categories
TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.equipment, public.loans
TO authenticated;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;

GRANT ALL ON public.tenants,
  public.memberships,
  public.equipment_categories,
  public.equipment,
  public.loans,
  public.audit_logs
TO service_role;
