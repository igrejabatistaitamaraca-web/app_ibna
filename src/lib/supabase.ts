import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'ibna_supabase_url';
const STORAGE_KEY_ANON = 'ibna_supabase_anon_key';

export const DEFAULT_SUPABASE_URL = 'https://vnydavylxtbzcapgvyap.supabase.co';

export function getStoredSupabaseConfig() {
  const metaEnv = (import.meta as unknown as { env: Record<string, string | undefined> }).env || {};
  const envUrl = metaEnv.VITE_SUPABASE_URL;
  const envAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY;

  const localUrl = localStorage.getItem(STORAGE_KEY_URL);
  const localAnonKey = localStorage.getItem(STORAGE_KEY_ANON);

  const url = localUrl || envUrl || DEFAULT_SUPABASE_URL;
  const anonKey = localAnonKey || envAnonKey || '';

  return { url, anonKey, isEnvConfigured: Boolean(envUrl && envAnonKey) };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  localStorage.setItem(STORAGE_KEY_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
  window.location.reload();
}

export function clearCustomSupabaseConfig() {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_ANON);
  window.location.reload();
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;

  const { url, anonKey } = getStoredSupabaseConfig();

  // If no anon key is provided yet, create dummy client or handle safely
  const effectiveAnonKey = anonKey || 'placeholder-anon-key-configure-in-settings';

  supabaseInstance = createClient(url, effectiveAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return supabaseInstance;
}

export const supabase = getSupabaseClient();

/**
 * Upload file to Supabase Storage bucket securely
 */
export async function uploadFileToBucket(
  bucketName: string,
  path: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  try {
    const client = getSupabaseClient();
    const cleanPath = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const fullPath = path ? `${path}/${cleanPath}` : cleanPath;

    const { data, error } = await client.storage
      .from(bucketName)
      .upload(fullPath, file, { upsert: true, cacheControl: '3600' });

    if (error) {
      console.warn('Storage upload error (falling back to DataURL/Blob if restricted):', error);
      // Fallback to Data URL if bucket or key is restricted in preview
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ url: reader.result as string, error: null });
        };
        reader.onerror = () => {
          resolve({ url: null, error: error.message });
        };
        reader.readAsDataURL(file);
      });
    }

    const { data: publicUrlData } = client.storage.from(bucketName).getPublicUrl(data.path);
    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err.message || 'Erro ao enviar arquivo' };
  }
}
