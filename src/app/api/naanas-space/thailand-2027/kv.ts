export interface KvCredentials {
  url: string;
  token: string;
}

export function getKvCredentials(): KvCredentials | null {
  const url =
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.STORAGE_REST_API_URL;
  const token =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.STORAGE_REST_API_TOKEN;

  if (!url || !token) {
    return null;
  }

  return { url: url.replace(/\/$/, ""), token };
}

export type KvCommandResult<T = unknown> =
  | { ok: true; result: T }
  | { ok: false; reason: "unconfigured" | "http-error" | "network-error"; message: string };

export async function execKvCommand<T = unknown>(
  command: (string | number)[]
): Promise<KvCommandResult<T>> {
  const creds = getKvCredentials();
  if (!creds) {
    return {
      ok: false,
      reason: "unconfigured",
      message:
        "Vercel KV / Upstash Redis environment variables not yet configured.",
    };
  }

  try {
    const response = await fetch(creds.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${creds.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        ok: false,
        reason: "http-error",
        message: `KV command failed with HTTP ${response.status}`,
      };
    }

    const data = (await response.json()) as { result?: T };
    return { ok: true, result: data.result as T };
  } catch (error) {
    return {
      ok: false,
      reason: "network-error",
      message: error instanceof Error ? error.message : "Unknown KV error",
    };
  }
}
