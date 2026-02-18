// src/lib/qfAuth.ts
// Server-only — never import from client components.

import { getQfConfig } from "./qfConfig";

type TokenCache = {
  accessToken: string;
  expiresAtMs: number;
} | null;

let tokenCache: TokenCache = null;

export async function getQfAccessToken(): Promise<string> {
  const { authBaseUrl, clientId, clientSecret } = getQfConfig();

  const now = Date.now();
  if (tokenCache && tokenCache.expiresAtMs > now) {
    return tokenCache.accessToken;
  }

  const url = `${authBaseUrl}/oauth2/token`;

  const body = new URLSearchParams();
  body.set("grant_type", "client_credentials");
  body.set("client_id", clientId);
  body.set("client_secret", clientSecret);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Quran Foundation auth failed (status ${res.status}).`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };

  const safetyMs = 60_000;
  tokenCache = {
    accessToken: data.access_token,
    expiresAtMs: Date.now() + data.expires_in * 1000 - safetyMs,
  };

  return tokenCache.accessToken;
}
