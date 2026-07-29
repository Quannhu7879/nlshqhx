import { RegisteredAccount } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const USER_STORAGE_KEY = 'edunls_registered_users_db';

const DEFAULT_SAMPLE_USERS: RegisteredAccount[] = [
  {
    id: 'user_1',
    email: 'baolam0809@gmail.com',
    displayName: 'Thầy Bảo Lâm',
    password: 'Password123!',
    role: 'teacher',
    createdAt: '25/07/2026',
    status: 'active',
    lastLogin: '28/07/2026',
  },
  {
    id: 'user_2',
    email: 'baoyen.tmxd@gmail.com',
    displayName: 'Cô Bảo Yến',
    password: 'Password123!',
    role: 'teacher',
    createdAt: '26/07/2026',
    status: 'active',
    lastLogin: '28/07/2026',
  },
  {
    id: 'user_3',
    email: 'nguyenvana@school.edu.vn',
    displayName: 'Thầy Nguyễn Văn A',
    password: 'Teacher2026@',
    role: 'teacher',
    createdAt: '27/07/2026',
    status: 'active',
    lastLogin: '27/07/2026',
  },
];

/**
 * Get all registered user accounts (Local Storage + Supabase)
 */
export function getRegisteredAccounts(): RegisteredAccount[] {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEFAULT_SAMPLE_USERS));
      return DEFAULT_SAMPLE_USERS;
    }
    const parsed: RegisteredAccount[] = JSON.parse(raw);
    return parsed && parsed.length > 0 ? parsed : DEFAULT_SAMPLE_USERS;
  } catch (err) {
    console.error('Error reading registered accounts:', err);
    return DEFAULT_SAMPLE_USERS;
  }
}

/**
 * Save / Update user account
 */
export async function saveUserAccount(account: RegisteredAccount): Promise<void> {
  const list = getRegisteredAccounts();
  const existingIdx = list.findIndex(u => u.email.toLowerCase() === account.email.toLowerCase());
  
  if (existingIdx >= 0) {
    list[existingIdx] = { ...list[existingIdx], ...account };
  } else {
    list.unshift(account);
  }

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(list));

  // Sync to Supabase user_accounts table if configured
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('user_accounts').upsert({
        id: account.id,
        email: account.email,
        display_name: account.displayName,
        password: account.password,
        role: account.role,
        status: account.status,
        created_at: new Date().toISOString(),
      }, { onConflict: 'email' });
    } catch (err) {
      console.warn('Supabase save user account warning:', err);
    }
  }
}

/**
 * Find user account by email
 */
export function findAccountByEmail(email: string): RegisteredAccount | undefined {
  const list = getRegisteredAccounts();
  return list.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
}

/**
 * Admin Reset or Update User Password
 */
export async function adminResetUserPassword(email: string, newPass: string): Promise<boolean> {
  const list = getRegisteredAccounts();
  const target = list.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!target) return false;

  target.password = newPass;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(list));

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('user_accounts').upsert({
        id: target.id,
        email: target.email,
        display_name: target.displayName,
        password: newPass,
        role: target.role,
        status: target.status,
      }, { onConflict: 'email' });
    } catch (err) {
      console.warn('Supabase update password exception:', err);
    }
  }

  return true;
}

/**
 * Delete User Account
 */
export async function deleteUserAccount(idOrEmail: string): Promise<void> {
  const list = getRegisteredAccounts();
  const updated = list.filter(u => u.id !== idOrEmail && u.email.toLowerCase() !== idOrEmail.toLowerCase());
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('user_accounts').delete().or(`id.eq.${idOrEmail},email.eq.${idOrEmail}`);
    } catch (err) {
      console.warn('Supabase delete user account exception:', err);
    }
  }
}

/**
 * Fetch accounts from Supabase async if available
 */
export async function syncAccountsFromSupabase(): Promise<RegisteredAccount[]> {
  if (!isSupabaseConfigured()) return getRegisteredAccounts();

  try {
    const { data, error } = await supabase.from('user_accounts').select('*');
    if (!error && data && data.length > 0) {
      const mapped: RegisteredAccount[] = data.map(row => ({
        id: row.id,
        email: row.email,
        displayName: row.display_name || row.email.split('@')[0],
        password: row.password || '••••••••',
        role: row.role || 'teacher',
        createdAt: row.created_at ? new Date(row.created_at).toLocaleDateString('vi-VN') : '2026',
        status: row.status || 'active',
      }));

      // Merge with local storage
      const local = getRegisteredAccounts();
      const combined = [...mapped];
      local.forEach(l => {
        if (!combined.some(c => c.email.toLowerCase() === l.email.toLowerCase())) {
          combined.push(l);
        }
      });

      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(combined));
      return combined;
    }
  } catch (err) {
    console.warn('Supabase sync accounts exception:', err);
  }

  return getRegisteredAccounts();
}
