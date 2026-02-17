-- ============================================================================
-- Nur Mushaf Intelligence + Review Engine (Additive migration)
-- ============================================================================
-- Run AFTER docs/sql/nur-tracker-migration.sql
-- This migration adds:
-- 1) Reader state persistence
-- 2) Mistake event system
-- 3) Spaced repetition cards + review history
-- 4) Recitation sessions + analytics views
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- --------------------------------------------------------------------------
-- Profile-level Mushaf state
-- --------------------------------------------------------------------------
ALTER TABLE nur_profiles
  ADD COLUMN IF NOT EXISTS mushaf_follow_playback_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS mushaf_playback_rate NUMERIC(3,2) NOT NULL DEFAULT 1.00 CHECK (mushaf_playback_rate BETWEEN 0.75 AND 1.25),
  ADD COLUMN IF NOT EXISTS mushaf_last_surah INTEGER NOT NULL DEFAULT 1 CHECK (mushaf_last_surah BETWEEN 1 AND 114),
  ADD COLUMN IF NOT EXISTS mushaf_last_ayah INTEGER NOT NULL DEFAULT 1 CHECK (mushaf_last_ayah >= 1),
  ADD COLUMN IF NOT EXISTS mushaf_last_page INTEGER NOT NULL DEFAULT 1 CHECK (mushaf_last_page BETWEEN 1 AND 604),
  ADD COLUMN IF NOT EXISTS mushaf_scroll_page INTEGER NOT NULL DEFAULT 0 CHECK (mushaf_scroll_page >= 0),
  ADD COLUMN IF NOT EXISTS mushaf_scroll_ayah INTEGER NOT NULL DEFAULT 0 CHECK (mushaf_scroll_ayah >= 0);

-- --------------------------------------------------------------------------
-- Recitation sessions
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mushaf_recitation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nur_profile_id UUID NOT NULL REFERENCES nur_profiles(id) ON DELETE CASCADE,
  surah_number INTEGER CHECK (surah_number BETWEEN 1 AND 114),
  start_ayah INTEGER CHECK (start_ayah >= 1),
  end_ayah INTEGER CHECK (end_ayah IS NULL OR end_ayah >= 1),
  reciter_id TEXT,
  playback_mode TEXT NOT NULL DEFAULT 'single_ayah'
    CHECK (playback_mode IN ('single_ayah', 'ayah_range', 'surah', 'page', 'playlist')),
  playback_speed NUMERIC(3,2) NOT NULL DEFAULT 1.00 CHECK (playback_speed BETWEEN 0.75 AND 1.25),
  loop_ayah_count INTEGER NOT NULL DEFAULT 0 CHECK (loop_ayah_count >= 0),
  loop_range_count INTEGER NOT NULL DEFAULT 0 CHECK (loop_range_count >= 0),
  loop_surah_count INTEGER NOT NULL DEFAULT 0 CHECK (loop_surah_count >= 0),
  mistake_count INTEGER NOT NULL DEFAULT 0 CHECK (mistake_count >= 0),
  confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100),
  duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mushaf_sessions_profile_started
  ON mushaf_recitation_sessions(nur_profile_id, started_at DESC);

-- --------------------------------------------------------------------------
-- Mistake events (AI-ready)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mushaf_mistake_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nur_profile_id UUID NOT NULL REFERENCES nur_profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES mushaf_recitation_sessions(id) ON DELETE SET NULL,
  verse_key TEXT NOT NULL,
  surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
  ayah_number INTEGER NOT NULL CHECK (ayah_number >= 1),
  mistake_type TEXT NOT NULL CHECK (mistake_type IN (
    'SKIP_WORD',
    'SKIP_AYAH',
    'REPEAT',
    'JUMP_SIMILAR',
    'STOP_MID',
    'PRONUNCIATION_GENERAL'
  )),
  confidence NUMERIC(4,3) NOT NULL DEFAULT 0.6 CHECK (confidence BETWEEN 0 AND 1),
  repeated_correction BOOLEAN NOT NULL DEFAULT false,
  stopped_mid_ayah BOOLEAN NOT NULL DEFAULT false,
  event_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mushaf_mistakes_profile_time
  ON mushaf_mistake_events(nur_profile_id, event_time DESC);
CREATE INDEX IF NOT EXISTS idx_mushaf_mistakes_profile_verse
  ON mushaf_mistake_events(nur_profile_id, verse_key);
CREATE INDEX IF NOT EXISTS idx_mushaf_mistakes_profile_surah
  ON mushaf_mistake_events(nur_profile_id, surah_number, ayah_number);

-- --------------------------------------------------------------------------
-- Spaced repetition cards
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mushaf_review_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nur_profile_id UUID NOT NULL REFERENCES nur_profiles(id) ON DELETE CASCADE,
  verse_key TEXT NOT NULL,
  surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
  start_ayah INTEGER NOT NULL CHECK (start_ayah >= 1),
  end_ayah INTEGER NOT NULL CHECK (end_ayah >= start_ayah),
  source_type TEXT NOT NULL DEFAULT 'manual' CHECK (source_type IN ('manual', 'mistake', 'weak_ayah', 'playlist')),
  due_date DATE NOT NULL DEFAULT CURRENT_DATE,
  interval_days INTEGER NOT NULL DEFAULT 1 CHECK (interval_days >= 1),
  ease_factor NUMERIC(4,2) NOT NULL DEFAULT 2.50 CHECK (ease_factor BETWEEN 1.30 AND 3.00),
  repetitions INTEGER NOT NULL DEFAULT 0 CHECK (repetitions >= 0),
  lapses INTEGER NOT NULL DEFAULT 0 CHECK (lapses >= 0),
  last_grade INTEGER CHECK (last_grade BETWEEN 0 AND 5),
  last_reviewed_at TIMESTAMPTZ,
  suspended BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (nur_profile_id, verse_key, start_ayah, end_ayah)
);

CREATE INDEX IF NOT EXISTS idx_mushaf_review_cards_profile_due
  ON mushaf_review_cards(nur_profile_id, due_date);
CREATE INDEX IF NOT EXISTS idx_mushaf_review_cards_profile_suspended
  ON mushaf_review_cards(nur_profile_id, suspended);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_mushaf_review_cards_updated_at'
  ) THEN
    CREATE TRIGGER update_mushaf_review_cards_updated_at
      BEFORE UPDATE ON mushaf_review_cards
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- --------------------------------------------------------------------------
-- Review grading history
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mushaf_review_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nur_profile_id UUID NOT NULL REFERENCES nur_profiles(id) ON DELETE CASCADE,
  review_card_id UUID NOT NULL REFERENCES mushaf_review_cards(id) ON DELETE CASCADE,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  grade INTEGER NOT NULL CHECK (grade BETWEEN 0 AND 5),
  previous_interval_days INTEGER NOT NULL CHECK (previous_interval_days >= 1),
  next_interval_days INTEGER NOT NULL CHECK (next_interval_days >= 1),
  due_date_before DATE,
  due_date_after DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mushaf_review_history_profile_reviewed
  ON mushaf_review_history(nur_profile_id, reviewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_mushaf_review_history_card
  ON mushaf_review_history(review_card_id);

-- --------------------------------------------------------------------------
-- Optional saved playlists
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mushaf_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nur_profile_id UUID NOT NULL REFERENCES nur_profiles(id) ON DELETE CASCADE,
  playlist_type TEXT NOT NULL CHECK (playlist_type IN ('weak_ayat', 'juz', 'custom_range', 'mistake_replay', 'taraweeh_prep')),
  label TEXT NOT NULL,
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_mushaf_playlists_updated_at'
  ) THEN
    CREATE TRIGGER update_mushaf_playlists_updated_at
      BEFORE UPDATE ON mushaf_playlists
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_mushaf_playlists_profile_type
  ON mushaf_playlists(nur_profile_id, playlist_type);

-- --------------------------------------------------------------------------
-- RLS
-- --------------------------------------------------------------------------
ALTER TABLE mushaf_recitation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mushaf_mistake_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE mushaf_review_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE mushaf_review_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE mushaf_playlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own mushaf sessions" ON mushaf_recitation_sessions;
CREATE POLICY "Users can manage own mushaf sessions"
  ON mushaf_recitation_sessions FOR ALL
  USING (nur_profile_id IN (SELECT id FROM nur_profiles WHERE clerk_id = auth.uid()::text))
  WITH CHECK (nur_profile_id IN (SELECT id FROM nur_profiles WHERE clerk_id = auth.uid()::text));

DROP POLICY IF EXISTS "Service role full access on mushaf_recitation_sessions" ON mushaf_recitation_sessions;
CREATE POLICY "Service role full access on mushaf_recitation_sessions"
  ON mushaf_recitation_sessions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage own mushaf mistakes" ON mushaf_mistake_events;
CREATE POLICY "Users can manage own mushaf mistakes"
  ON mushaf_mistake_events FOR ALL
  USING (nur_profile_id IN (SELECT id FROM nur_profiles WHERE clerk_id = auth.uid()::text))
  WITH CHECK (nur_profile_id IN (SELECT id FROM nur_profiles WHERE clerk_id = auth.uid()::text));

DROP POLICY IF EXISTS "Service role full access on mushaf_mistake_events" ON mushaf_mistake_events;
CREATE POLICY "Service role full access on mushaf_mistake_events"
  ON mushaf_mistake_events FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage own mushaf review cards" ON mushaf_review_cards;
CREATE POLICY "Users can manage own mushaf review cards"
  ON mushaf_review_cards FOR ALL
  USING (nur_profile_id IN (SELECT id FROM nur_profiles WHERE clerk_id = auth.uid()::text))
  WITH CHECK (nur_profile_id IN (SELECT id FROM nur_profiles WHERE clerk_id = auth.uid()::text));

DROP POLICY IF EXISTS "Service role full access on mushaf_review_cards" ON mushaf_review_cards;
CREATE POLICY "Service role full access on mushaf_review_cards"
  ON mushaf_review_cards FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage own mushaf review history" ON mushaf_review_history;
CREATE POLICY "Users can manage own mushaf review history"
  ON mushaf_review_history FOR ALL
  USING (nur_profile_id IN (SELECT id FROM nur_profiles WHERE clerk_id = auth.uid()::text))
  WITH CHECK (nur_profile_id IN (SELECT id FROM nur_profiles WHERE clerk_id = auth.uid()::text));

DROP POLICY IF EXISTS "Service role full access on mushaf_review_history" ON mushaf_review_history;
CREATE POLICY "Service role full access on mushaf_review_history"
  ON mushaf_review_history FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage own mushaf playlists" ON mushaf_playlists;
CREATE POLICY "Users can manage own mushaf playlists"
  ON mushaf_playlists FOR ALL
  USING (nur_profile_id IN (SELECT id FROM nur_profiles WHERE clerk_id = auth.uid()::text))
  WITH CHECK (nur_profile_id IN (SELECT id FROM nur_profiles WHERE clerk_id = auth.uid()::text));

DROP POLICY IF EXISTS "Service role full access on mushaf_playlists" ON mushaf_playlists;
CREATE POLICY "Service role full access on mushaf_playlists"
  ON mushaf_playlists FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- --------------------------------------------------------------------------
-- Analytics views
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW nur_weak_ayat_rankings AS
SELECT
  m.nur_profile_id,
  m.verse_key,
  m.surah_number,
  m.ayah_number,
  COUNT(*)::int AS mistake_count,
  SUM(CASE WHEN m.repeated_correction THEN 1 ELSE 0 END)::int AS repeated_corrections,
  SUM(CASE WHEN m.stopped_mid_ayah THEN 1 ELSE 0 END)::int AS stop_mid_count,
  SUM(CASE WHEN m.event_time >= NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END)::int AS last_7d_mistakes,
  MAX(m.event_time) AS last_mistake_at,
  ROUND((
    (COUNT(*) * 1.1) +
    (SUM(CASE WHEN m.repeated_correction THEN 1 ELSE 0 END) * 1.7) +
    (SUM(CASE WHEN m.stopped_mid_ayah THEN 1 ELSE 0 END) * 1.3) +
    (SUM(COALESCE(m.confidence, 0.6)) * 0.9)
  ) * (
    1 + EXP(-EXTRACT(EPOCH FROM (NOW() - MAX(m.event_time))) / 86400 / 14)
  ), 2) AS weak_score
FROM mushaf_mistake_events m
GROUP BY m.nur_profile_id, m.verse_key, m.surah_number, m.ayah_number;

CREATE OR REPLACE VIEW nur_due_reviews_today AS
SELECT
  c.nur_profile_id,
  c.id AS review_card_id,
  c.verse_key,
  c.surah_number,
  c.start_ayah,
  c.end_ayah,
  c.due_date,
  c.interval_days,
  c.ease_factor,
  c.repetitions,
  c.lapses
FROM mushaf_review_cards c
WHERE c.suspended = false
  AND c.due_date <= CURRENT_DATE;

CREATE OR REPLACE VIEW nur_mushaf_session_stats AS
SELECT
  s.nur_profile_id,
  COUNT(*) FILTER (WHERE s.started_at >= NOW() - INTERVAL '7 days')::int AS weekly_sessions,
  ROUND(COALESCE(SUM(s.duration_seconds) FILTER (WHERE s.started_at >= NOW() - INTERVAL '30 days'), 0) / 60.0)::int AS monthly_minutes,
  MAX(s.duration_seconds)::int AS longest_session_seconds
FROM mushaf_recitation_sessions s
GROUP BY s.nur_profile_id;
