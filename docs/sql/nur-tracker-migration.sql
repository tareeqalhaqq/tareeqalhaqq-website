-- =====================================================================
-- Nur Recitations Tracker - Supabase Migration
-- =====================================================================
-- This migration:
-- 1. Drops unused tables (projects, projects_backup_from_events,
--    academy_memberships, user_library, reading_progress)
-- 2. Creates the Nur tracker tables (profiles, schedule, goals, logs)
-- 3. Sets up RLS policies, indexes, and triggers
-- =====================================================================

-- ─────────────────────────────────────────────────────────────────────
-- STEP 1: Drop unused tables (run these carefully, backup if needed)
-- ─────────────────────────────────────────────────────────────────────

-- Drop projects table and related objects
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS projects_backup_from_events CASCADE;

-- Drop academy memberships (if you want to remove it)
DROP TABLE IF EXISTS academy_memberships CASCADE;

-- Drop user library and reading progress
DROP TABLE IF EXISTS user_library CASCADE;
DROP TABLE IF EXISTS reading_progress CASCADE;


-- ─────────────────────────────────────────────────────────────────────
-- STEP 2: Create Nur tracker tables
-- ─────────────────────────────────────────────────────────────────────

-- Helper: auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ── nur_profiles ──
-- Stores each user's Nur tracker configuration
CREATE TABLE IF NOT EXISTS nur_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id TEXT NOT NULL UNIQUE,
    display_name TEXT,

    -- Track configuration
    track_type TEXT NOT NULL DEFAULT 'memorization'
        CHECK (track_type IN ('memorization', 'revision', 'recitation')),

    -- Day settings
    day_end_setting TEXT NOT NULL DEFAULT 'midnight'
        CHECK (day_end_setting IN ('midnight', 'fajr')),
    fajr_time TIME,

    -- Memorization position
    memorization_start_surah INTEGER DEFAULT 1
        CHECK (memorization_start_surah >= 1 AND memorization_start_surah <= 114),
    memorization_start_ayah INTEGER DEFAULT 1,
    memorization_current_surah INTEGER DEFAULT 1
        CHECK (memorization_current_surah >= 1 AND memorization_current_surah <= 114),
    memorization_current_ayah INTEGER DEFAULT 1,

    -- Daily targets
    daily_new_verses INTEGER NOT NULL DEFAULT 5
        CHECK (daily_new_verses >= 1 AND daily_new_verses <= 300),
    daily_revision_pages INTEGER NOT NULL DEFAULT 2
        CHECK (daily_revision_pages >= 0 AND daily_revision_pages <= 30),

    -- Schedule preferences
    preferred_time TIME,
    reminder_enabled BOOLEAN NOT NULL DEFAULT true,
    setup_completed BOOLEAN NOT NULL DEFAULT false,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update trigger
CREATE TRIGGER update_nur_profiles_updated_at
    BEFORE UPDATE ON nur_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_nur_profiles_clerk_id ON nur_profiles(clerk_id);


-- ── nur_schedule_items ──
-- Individual schedule items (daily tasks assigned to users)
CREATE TABLE IF NOT EXISTS nur_schedule_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nur_profile_id UUID NOT NULL REFERENCES nur_profiles(id) ON DELETE CASCADE,

    -- Schedule data
    date DATE NOT NULL,
    task_type TEXT NOT NULL DEFAULT 'memorization'
        CHECK (task_type IN ('memorization', 'revision', 'recitation')),

    -- Quran position
    surah_number INTEGER NOT NULL
        CHECK (surah_number >= 1 AND surah_number <= 114),
    start_ayah INTEGER NOT NULL CHECK (start_ayah >= 1),
    end_ayah INTEGER NOT NULL CHECK (end_ayah >= 1),

    -- Completion
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,

    -- Crossover
    carried_over BOOLEAN NOT NULL DEFAULT false,
    carried_from_date DATE,

    -- Notes
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Ensure end_ayah >= start_ayah
    CHECK (end_ayah >= start_ayah)
);

-- Indexes for schedule queries
CREATE INDEX IF NOT EXISTS idx_nur_schedule_profile_date
    ON nur_schedule_items(nur_profile_id, date);
CREATE INDEX IF NOT EXISTS idx_nur_schedule_date
    ON nur_schedule_items(date);
CREATE INDEX IF NOT EXISTS idx_nur_schedule_completed
    ON nur_schedule_items(nur_profile_id, completed);


-- ── nur_goals ──
-- User-defined goals (complete surah, streak, etc.)
CREATE TABLE IF NOT EXISTS nur_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nur_profile_id UUID NOT NULL REFERENCES nur_profiles(id) ON DELETE CASCADE,

    -- Goal details
    title TEXT NOT NULL,
    description TEXT,
    goal_type TEXT NOT NULL DEFAULT 'custom'
        CHECK (goal_type IN ('complete_surah', 'complete_juz', 'daily_streak', 'custom')),

    -- Target specifics (depending on goal_type)
    target_surah INTEGER CHECK (target_surah IS NULL OR (target_surah >= 1 AND target_surah <= 114)),
    target_juz INTEGER CHECK (target_juz IS NULL OR (target_juz >= 1 AND target_juz <= 30)),
    target_streak_days INTEGER CHECK (target_streak_days IS NULL OR target_streak_days >= 1),
    target_date DATE,

    -- Progress
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_nur_goals_profile
    ON nur_goals(nur_profile_id);
CREATE INDEX IF NOT EXISTS idx_nur_goals_active
    ON nur_goals(nur_profile_id, completed);


-- ── nur_daily_logs ──
-- Daily summary logs (verse counts, streaks, reflections)
CREATE TABLE IF NOT EXISTS nur_daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nur_profile_id UUID NOT NULL REFERENCES nur_profiles(id) ON DELETE CASCADE,

    -- Date (one log per day per user)
    date DATE NOT NULL,

    -- Verse counts
    total_verses_new INTEGER NOT NULL DEFAULT 0,
    total_verses_revised INTEGER NOT NULL DEFAULT 0,
    total_verses_recited INTEGER NOT NULL DEFAULT 0,

    -- Streak
    streak_count INTEGER NOT NULL DEFAULT 0,

    -- User input
    day_rating INTEGER CHECK (day_rating IS NULL OR (day_rating >= 1 AND day_rating <= 5)),
    reflection TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One log per profile per date
    UNIQUE(nur_profile_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_nur_daily_logs_profile_date
    ON nur_daily_logs(nur_profile_id, date);


-- ─────────────────────────────────────────────────────────────────────
-- STEP 3: Row Level Security (RLS)
-- ─────────────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE nur_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nur_schedule_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE nur_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE nur_daily_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own Nur profile
CREATE POLICY "Users can view their own nur profile"
    ON nur_profiles
    FOR SELECT
    USING (clerk_id = auth.uid()::text);

-- Policy: Service role can do everything (for API routes)
CREATE POLICY "Service role full access on nur_profiles"
    ON nur_profiles
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Policy: Users can view their own schedule items
CREATE POLICY "Users can view their own schedule items"
    ON nur_schedule_items
    FOR SELECT
    USING (
        nur_profile_id IN (
            SELECT id FROM nur_profiles WHERE clerk_id = auth.uid()::text
        )
    );

CREATE POLICY "Service role full access on nur_schedule_items"
    ON nur_schedule_items
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Policy: Users can view their own goals
CREATE POLICY "Users can view their own goals"
    ON nur_goals
    FOR SELECT
    USING (
        nur_profile_id IN (
            SELECT id FROM nur_profiles WHERE clerk_id = auth.uid()::text
        )
    );

CREATE POLICY "Service role full access on nur_goals"
    ON nur_goals
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Policy: Users can view their own daily logs
CREATE POLICY "Users can view their own daily logs"
    ON nur_daily_logs
    FOR SELECT
    USING (
        nur_profile_id IN (
            SELECT id FROM nur_profiles WHERE clerk_id = auth.uid()::text
        )
    );

CREATE POLICY "Service role full access on nur_daily_logs"
    ON nur_daily_logs
    FOR ALL
    USING (true)
    WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────
-- STEP 4: Useful views (optional)
-- ─────────────────────────────────────────────────────────────────────

-- View: User's current streak
CREATE OR REPLACE VIEW nur_user_streaks AS
SELECT
    np.clerk_id,
    np.display_name,
    COALESCE(MAX(ndl.streak_count), 0) AS current_streak,
    COUNT(DISTINCT ndl.date) AS total_active_days,
    SUM(ndl.total_verses_new) AS lifetime_new_verses,
    SUM(ndl.total_verses_revised) AS lifetime_revised_verses,
    SUM(ndl.total_verses_recited) AS lifetime_recited_verses
FROM nur_profiles np
LEFT JOIN nur_daily_logs ndl ON ndl.nur_profile_id = np.id
GROUP BY np.clerk_id, np.display_name;


-- ─────────────────────────────────────────────────────────────────────
-- DONE
-- ─────────────────────────────────────────────────────────────────────
-- To run: Copy and paste into Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
-- ─────────────────────────────────────────────────────────────────────
