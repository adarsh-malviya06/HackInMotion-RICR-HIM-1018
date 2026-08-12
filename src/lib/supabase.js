import { createClient } from '@supabase/supabase-js';

// Get credentials from env or localStorage override
export const getStoredSupabaseCredentials = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const customUrl = localStorage.getItem('finly_supabase_url') || envUrl;
  const customKey = localStorage.getItem('finly_supabase_anon_key') || envKey;

  return {
    url: customUrl,
    key: customKey,
    isConfigured: Boolean(customUrl && customKey && !customUrl.includes('YOUR_SUPABASE'))
  };
};

// Initialize Supabase Client
let supabaseInstance = null;

export const getSupabaseClient = () => {
  const { url, key, isConfigured } = getStoredSupabaseCredentials();

  if (!isConfigured) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key);
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseInstance;
};

export const saveSupabaseCredentials = (url, key) => {
  localStorage.setItem('finly_supabase_url', url);
  localStorage.setItem('finly_supabase_anon_key', key);
  supabaseInstance = null; // reset instance
  return getSupabaseClient();
};
