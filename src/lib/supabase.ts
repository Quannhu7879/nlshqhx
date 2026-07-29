import { createClient } from '@supabase/supabase-js';

// Get Vite environment variables safely
const metaEnv = (import.meta as any).env || {};
const procEnv = typeof process !== 'undefined' ? process.env || {} : {};

// Supabase configuration provided for EduNLS AI
export const SUPABASE_URL =
  metaEnv.VITE_SUPABASE_URL ||
  procEnv.VITE_SUPABASE_URL ||
  'https://ggegueyqsnovnanfwuto.supabase.co';

export const SUPABASE_ANON_KEY =
  metaEnv.VITE_SUPABASE_ANON_KEY ||
  procEnv.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnZWd1ZXlxc25vdm5hbmZ3dXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNzg5MDksImV4cCI6MjEwMDg1NDkwOX0.N4zDBlJMJoVoPWDB5P0vIbIB3apA18chxIar_g5MyJ0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith('https://'));
};
