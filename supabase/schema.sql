-- SQL Schema for EduNLS AI Supabase Integration
-- Execute these statements in Supabase SQL Editor (https://supabase.com/dashboard/project/ggegueyqsnovnanfwuto/sql)

-- 1. Table for storing digital competency integrated lesson plans (KHBD)
CREATE TABLE IF NOT EXISTS public.lesson_plans (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT DEFAULT 'Toán học',
  grade TEXT DEFAULT 'Lớp 10',
  framework TEXT DEFAULT 'TT 02/2025/TT-BGDĐT',
  template TEXT DEFAULT 'CV 5512/BGDĐT-GDTrH',
  status TEXT DEFAULT 'Đã tích hợp NLS',
  original_html TEXT,
  integrated_html TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  date_string TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable Row Level Security (RLS) and permissive policies
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to lesson_plans" ON public.lesson_plans;
CREATE POLICY "Allow public read access to lesson_plans"
  ON public.lesson_plans FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public insert and update access to lesson_plans" ON public.lesson_plans;
CREATE POLICY "Allow public insert and update access to lesson_plans"
  ON public.lesson_plans FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. Table for custom Admin Digital Competency Indicator Tags (Thẻ chỉ báo NLS)
CREATE TABLE IF NOT EXISTS public.indicator_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  framework TEXT DEFAULT 'TT 02/2025',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.indicator_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access to indicator_tags" ON public.indicator_tags;
CREATE POLICY "Allow public access to indicator_tags"
  ON public.indicator_tags FOR ALL
  USING (true)
  WITH CHECK (true);

-- Seed default indicator tags
INSERT INTO public.indicator_tags (code, name, framework, active) VALUES
  ('[NLS 1.1-a]', 'Duyệt, tìm kiếm và lọc dữ liệu số', 'TT 02/2025', true),
  ('[NLS 1.2-b]', 'Đánh giá độ tin cậy và tính xác thực dữ liệu', 'TT 02/2025', true),
  ('[NLS 2.4-a]', 'Hợp tác và đồng sáng tạo tài nguyên số', 'TT 02/2025', true),
  ('[NLS 3.1-a]', 'Phát triển và chỉnh sửa nội dung đa phương tiện', 'TT 02/2025', true),
  ('[NLS 5.3-a]', 'Sử dụng sáng tạo công nghệ số', 'TT 02/2025', true),
  ('[AI-NLa: Human Centered]', 'Tư duy AI lấy con người làm trung tâm', 'QĐ 3439', true),
  ('[AI-NLb: AI Ethics]', 'Đạo đức AI & Trách nhiệm số', 'QĐ 3439', true),
  ('[AI-NLc: Prompting]', 'Kĩ thuật Kỹ năng Prompt Engineering', 'QĐ 3439', true)
ON CONFLICT (code) DO NOTHING;

-- 3. Table for System Configuration & AI Rules
CREATE TABLE IF NOT EXISTS public.system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access to system_config" ON public.system_config;
CREATE POLICY "Allow public access to system_config"
  ON public.system_config FOR ALL
  USING (true)
  WITH CHECK (true);

-- Seed default prompt config
INSERT INTO public.system_config (key, value) VALUES
  ('system_prompt', 'Bạn là Chuyên gia Giáo dục & AI Cao cấp của Bộ Giáo dục và Đào tạo Việt Nam. Nhiệm vụ của bạn là bóc tách và chèn thẻ Năng lực số (TT 02/2025) và Mạch AI (QĐ 3439) vào Công văn 5512.')
ON CONFLICT (key) DO NOTHING;

-- 4. Table for User Accounts & Password Management
CREATE TABLE IF NOT EXISTS public.user_accounts (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  password TEXT,
  role TEXT DEFAULT 'teacher',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access to user_accounts" ON public.user_accounts;
CREATE POLICY "Allow public access to user_accounts"
  ON public.user_accounts FOR ALL
  USING (true)
  WITH CHECK (true);
