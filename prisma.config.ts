import "dotenv/config";

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  experimental: {
    externalTables: true,
  },
  tables: {
    external: [
      "auth.audit_log_entries",
      "auth.custom_oauth_providers",
      "auth.flow_state",
      "auth.identities",
      "auth.instances",
      "auth.mfa_amr_claims",
      "auth.mfa_challenges",
      "auth.mfa_factors",
      "auth.mfa_recovery_code_sets",
      "auth.mfa_recovery_codes",
      "auth.oauth_authorizations",
      "auth.oauth_client_states",
      "auth.oauth_clients",
      "auth.oauth_consents",
      "auth.one_time_tokens",
      "auth.refresh_tokens",
      "auth.saml_providers",
      "auth.saml_relay_states",
      "auth.schema_migrations",
      "auth.scim_tokens",
      "auth.scim_users",
      "auth.sessions",
      "auth.sso_domains",
      "auth.sso_providers",
      "auth.users",
      "auth.webauthn_challenges",
      "auth.webauthn_credentials",
    ],
  },
  enums: {
    external: [
      "auth.aal_level",
      "auth.code_challenge_method",
      "auth.factor_status",
      "auth.factor_type",
      "auth.oauth_authorization_status",
      "auth.oauth_client_type",
      "auth.oauth_registration_type",
      "auth.oauth_response_type",
      "auth.one_time_token_type",
    ],
  },
  migrations: {
    path: "prisma/migrations",
    initShadowDb: `
      CREATE SCHEMA IF NOT EXISTS auth;

      CREATE TABLE IF NOT EXISTS auth.users (
        id UUID PRIMARY KEY
      );

      CREATE OR REPLACE FUNCTION auth.uid()
      RETURNS UUID
      LANGUAGE sql
      STABLE
      AS 'SELECT NULL::UUID';

      DO $block$
      BEGIN
        CREATE ROLE anon NOLOGIN;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END
      $block$;

      DO $block$
      BEGIN
        CREATE ROLE authenticated NOLOGIN;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END
      $block$;

      DO $block$
      BEGIN
        CREATE ROLE service_role NOLOGIN;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END
      $block$;
    `,
  },
  datasource: {
    // Prisma Migrate must use the direct local PostgreSQL connection.
    url: env("DIRECT_URL"),
  },
});
