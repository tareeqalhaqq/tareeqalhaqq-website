// src/lib/qfConfig.ts
// Server-only — never import from client components.

type QfEnv = "prelive" | "production";

const ENVIRONMENT_MAP: Record<QfEnv, { authBaseUrl: string; apiBaseUrl: string }> = {
  prelive: {
    authBaseUrl: "https://prelive-oauth2.quran.foundation",
    apiBaseUrl: "https://apis-prelive.quran.foundation",
  },
  production: {
    authBaseUrl: "https://oauth2.quran.foundation",
    apiBaseUrl: "https://apis.quran.foundation",
  },
};

export function getQfConfig() {
  const clientId = process.env.QURAN_CLIENT_ID;
  const clientSecret = process.env.QURAN_CLIENT_SECRET;
  const rawEnv = (process.env.QF_ENV ?? "prelive") as QfEnv;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing Quran Foundation API credentials. Set QURAN_CLIENT_ID and QURAN_CLIENT_SECRET. Request access: https://api-docs.quran.foundation/request-access"
    );
  }

  if (rawEnv !== "prelive" && rawEnv !== "production") {
    throw new Error(`Invalid QF_ENV value "${rawEnv}". Allowed values: "prelive" | "production"`);
  }

  const { authBaseUrl, apiBaseUrl } = ENVIRONMENT_MAP[rawEnv];

  return { env: rawEnv, clientId, clientSecret, authBaseUrl, apiBaseUrl };
}
