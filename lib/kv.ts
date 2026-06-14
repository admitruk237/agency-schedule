import { kv } from '@vercel/kv';

// In-memory fallback so the app works locally without a Vercel KV store
// configured. On Vercel, set up a KV store and the env vars below to get
// persistent storage shared across all visitors.
const memoryStore = new Map<string, unknown>();

function hasKvConfig(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export async function kvGet<T>(key: string): Promise<T | null> {
  if (hasKvConfig()) {
    return (await kv.get<T>(key)) ?? null;
  }
  return (memoryStore.get(key) as T | undefined) ?? null;
}

export async function kvSet<T>(key: string, value: T): Promise<void> {
  if (hasKvConfig()) {
    await kv.set(key, value);
    return;
  }
  memoryStore.set(key, value);
}

export async function kvDel(key: string): Promise<void> {
  if (hasKvConfig()) {
    await kv.del(key);
    return;
  }
  memoryStore.delete(key);
}
