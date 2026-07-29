import { supabase, isSupabaseConfigured } from './supabase';
import { LessonPlan } from '../types';

export interface IndicatorTag {
  code: string;
  name: string;
  framework: string;
  active: boolean;
}

// Transform database row to LessonPlan object
function mapRowToLessonPlan(row: any): LessonPlan {
  return {
    id: row.id,
    title: row.title || 'Bài dạy chưa đặt tên',
    subject: row.subject || 'Toán học',
    grade: row.grade || 'Lớp 10',
    framework: row.framework || 'TT 02/2025/TT-BGDĐT',
    template: row.template || 'CV 5512/BGDĐT-GDTrH',
    status: row.status || 'Đã tích hợp NLS',
    originalHtml: row.original_html || '',
    integratedHtml: row.integrated_html || '',
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    dateString: row.date_string || (row.created_at ? new Date(row.created_at).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN')),
  };
}

// Transform LessonPlan object to database row
function mapLessonPlanToRow(plan: LessonPlan) {
  return {
    id: plan.id,
    title: plan.title,
    subject: plan.subject,
    grade: plan.grade,
    framework: plan.framework,
    template: plan.template,
    status: plan.status,
    original_html: plan.originalHtml,
    integrated_html: plan.integratedHtml,
    created_at: new Date(plan.createdAt).toISOString(),
    date_string: plan.dateString,
  };
}

/**
 * FETCH ALL LESSON PLANS FROM SUPABASE
 */
export async function fetchLessonPlansFromSupabase(): Promise<{ data: LessonPlan[] | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Supabase URL hoặc Anon Key chưa được định dạng đúng' };
  }

  try {
    const { data, error } = await supabase
      .from('lesson_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch error:', error.message);
      return { data: null, error: error.message };
    }

    const mapped = (data || []).map(mapRowToLessonPlan);
    return { data: mapped, error: null };
  } catch (err: any) {
    console.warn('Supabase request exception:', err);
    return { data: null, error: err.message || 'Không thể kết nối Supabase' };
  }
}

/**
 * SAVE/UPSERT LESSON PLAN TO SUPABASE
 */
export async function saveLessonPlanToSupabase(plan: LessonPlan): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase chưa kết nối' };
  }

  try {
    const row = mapLessonPlanToRow(plan);
    const { error } = await supabase.from('lesson_plans').upsert(row, { onConflict: 'id' });

    if (error) {
      console.error('Supabase save error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    console.error('Supabase save exception:', err);
    return { success: false, error: err.message || 'Lỗi khi lưu bài dạy vào Supabase' };
  }
}

/**
 * DELETE LESSON PLAN FROM SUPABASE
 */
export async function deleteLessonPlanFromSupabase(id: string): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase chưa kết nối' };
  }

  try {
    const { error } = await supabase.from('lesson_plans').delete().eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    console.error('Supabase delete exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * FETCH INDICATOR TAGS FROM SUPABASE
 */
export async function fetchIndicatorTagsFromSupabase(): Promise<{ data: IndicatorTag[] | null; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: null, error: 'Supabase chưa kết nối' };

  try {
    const { data, error } = await supabase.from('indicator_tags').select('*').order('code');

    if (error) return { data: null, error: error.message };

    const mapped: IndicatorTag[] = (data || []).map(row => ({
      code: row.code,
      name: row.name,
      framework: row.framework,
      active: row.active ?? true,
    }));

    return { data: mapped, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/**
 * SAVE INDICATOR TAG TO SUPABASE
 */
export async function saveIndicatorTagToSupabase(tag: IndicatorTag): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase chưa kết nối' };

  try {
    const { error } = await supabase.from('indicator_tags').upsert(
      {
        code: tag.code,
        name: tag.name,
        framework: tag.framework,
        active: tag.active,
      },
      { onConflict: 'code' }
    );

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * FETCH SYSTEM PROMPT FROM SUPABASE
 */
export async function fetchSystemPromptFromSupabase(): Promise<{ prompt: string | null; error: string | null }> {
  if (!isSupabaseConfigured()) return { prompt: null, error: 'Supabase chưa kết nối' };

  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'system_prompt')
      .single();

    if (error) return { prompt: null, error: error.message };
    return { prompt: data?.value || null, error: null };
  } catch (err: any) {
    return { prompt: null, error: err.message };
  }
}

/**
 * SAVE SYSTEM PROMPT TO SUPABASE
 */
export async function saveSystemPromptToSupabase(promptText: string): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase chưa kết nối' };

  try {
    const { error } = await supabase.from('system_config').upsert(
      {
        key: 'system_prompt',
        value: promptText,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
