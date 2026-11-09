-- Proposta para revisão. A implementação passa por uma migration Prisma.
CREATE TABLE dev.login_attempts (
    id uuid PRIMARY KEY,
    account_key bytea NOT NULL CHECK (octet_length(account_key) = 32),
    ip_key bytea NOT NULL CHECK (octet_length(ip_key) = 32),
    attempted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX login_attempts_account_time_idx
    ON dev.login_attempts (account_key, attempted_at);
CREATE INDEX login_attempts_ip_time_idx
    ON dev.login_attempts (ip_key, attempted_at);
CREATE INDEX login_attempts_expiration_idx
    ON dev.login_attempts (attempted_at);

ALTER TABLE dev.login_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE dev.login_attempts FROM PUBLIC, anon, authenticated, service_role;
CREATE POLICY login_attempts_deny_client
    ON dev.login_attempts AS RESTRICTIVE
    FOR ALL TO anon, authenticated, service_role
    USING (false) WITH CHECK (false);
