import { X509Certificate } from "node:crypto";

export function databaseConnectionOptions(connectionString: string, certificate?: string) {
  if (!certificate?.trim()) return { connectionString };

  const url = new URL(connectionString);
  const ca = new X509Certificate(certificate).toString();
  // The pg connection string takes precedence over an explicit ssl object.
  for (const name of ["sslmode", "sslrootcert", "sslcert", "sslkey", "ssl"]) {
    url.searchParams.delete(name);
  }
  return { connectionString: url.href, ssl: { ca, rejectUnauthorized: true } };
}
