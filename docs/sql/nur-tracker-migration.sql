-- =====================================================================
-- Nur (Glow) Recitations Tracker - Supabase Migration
-- =====================================================================
-- Run this in the Supabase SQL Editor:
--   https://supabase.com/dashboard/project/YOUR_PROJECT/sql
--
-- Features:
--   - Multi-select track types (memorization, revision, recitation)
--   - Flexible Quran units: ayah, page, juz, hizb, rub'a (quarter), surah
--   - RLS policies for Clerk auth + service role
--   - Auto updated_at triggers
--   - Streak tracking + daily logs
-- =====================================================================


-- ─────────────────────────────────────────────────────────────────────
-- STEP 0: Drop old unused tables (optional — back up first!)
-- ─────────────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS projects_backup_from_events CASCADE;
DROP TABLE IF EXISTS academy_memberships CASCADE;
DROP TABLE IF EXISTS user_library CASCADE;
DROP TABLE IF EXISTS reading_progress CASCADE;


-- ─────────────────────────────────────────────────────────────────────
-- STEP 1: Helper function
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ─────────────────────────────────────────────────────────────────────
-- STEP 2: Core tables
-- ─────────────────────────────────────────────────────────────────────

-- ── nur_profiles ──
-- One row per user. Stores preferences + current position.
CREATE TABLE IF NOT EXISTS nur_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id TEXT NOT NULL UNIQUE,
    display_name TEXT,

    -- Multi-select track types stored as a Postgres text array
    -- e.g. {'memorization','revision'} or {'recitation'}
    track_types TEXT[] NOT NULL DEFAULT '{memorization}'
        CHECK (track_types <@ ARRAY['memorization','revision','recitation']::text[]),

    -- What Quran unit does this user prefer to measure in?
    -- ayah  = individual verses
    -- page  = Mushaf page (1-604)
    -- juz   = 30 parts
    -- hizb  = 60 halves
    -- ruba  = 240 quarters (rub' al-hizb)
    -- surah = full surah
    preferred_unit TEXT NOT NULL DEFAULT 'ayah'
        CHECK (preferred_unit IN ('ayah','page','juz','hizb','ruba','surah')),

    -- Day boundary setting
    day_end_setting TEXT NOT NULL DEFAULT 'midnight'
        CHECK (day_end_setting IN ('midnight','fajr')),
    fajr_time TIME,                       -- required when day_end_setting = 'fajr'

    -- Current memorization position (ayah-level bookmark)
    memorization_current_surah INTEGER DEFAULT 1
        CHECK (memorization_current_surah BETWEEN 1 AND 114),
    memorization_current_ayah INTEGER DEFAULT 1
        CHECK (memorization_current_ayah >= 1),

    -- Daily targets (interpreted in preferred_unit)
    daily_new_amount INTEGER NOT NULL DEFAULT 5
        CHECK (daily_new_amount >= 1),
    daily_revision_amount INTEGER NOT NULL DEFAULT 2
        CHECK (daily_revision_amount >= 0),

    -- Schedule preferences
    preferred_time TIME,
    reminder_enabled BOOLEAN NOT NULL DEFAULT true,
    selected_reciter_id TEXT NOT NULL DEFAULT 'husary',
    setup_completed BOOLEAN NOT NULL DEFAULT false,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_nur_profiles_updated_at
    BEFORE UPDATE ON nur_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_nur_profiles_clerk_id
    ON nur_profiles(clerk_id);

ALTER TABLE nur_profiles
    ADD COLUMN IF NOT EXISTS selected_reciter_id TEXT NOT NULL DEFAULT 'husary';


-- ── nur_schedule_items ──
-- One row per task per day.  Supports every Quran unit type.
CREATE TABLE IF NOT EXISTS nur_schedule_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nur_profile_id UUID NOT NULL REFERENCES nur_profiles(id) ON DELETE CASCADE,

    date DATE NOT NULL,

    task_type TEXT NOT NULL DEFAULT 'memorization'
        CHECK (task_type IN ('memorization','revision','recitation')),

    -- What unit is this item measured in?
    unit_type TEXT NOT NULL DEFAULT 'ayah'
        CHECK (unit_type IN ('ayah','page','juz','hizb','ruba','surah')),

    -- ── Range fields (meaning depends on unit_type) ──
    --
    -- unit_type  | range_start / range_end meaning
    -- ---------- | -------------------------------------------------
    -- ayah       | ayah index within surah (use surah_number)
    -- page       | Mushaf page number  (1-604)
    -- juz        | Juz number          (1-30)
    -- hizb       | Hizb number         (1-60)
    -- ruba       | Rub' number         (1-240)
    -- surah      | Surah number        (1-114)
    --
    surah_number INTEGER                          -- used for ayah unit type
        CHECK (surah_number IS NULL OR surah_number BETWEEN 1 AND 114),
    range_start INTEGER NOT NULL CHECK (range_start >= 1),
    range_end   INTEGER NOT NULL CHECK (range_end >= 1),

    -- Completion
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,

    -- Carry-over from a previous day
    carried_over BOOLEAN NOT NULL DEFAULT false,
    carried_from_date DATE,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (range_end >= range_start)
);

CREATE INDEX IF NOT EXISTS idx_nur_schedule_profile_date
    ON nur_schedule_items(nur_profile_id, date);
CREATE INDEX IF NOT EXISTS idx_nur_schedule_date
    ON nur_schedule_items(date);
CREATE INDEX IF NOT EXISTS idx_nur_schedule_completed
    ON nur_schedule_items(nur_profile_id, completed);
CREATE INDEX IF NOT EXISTS idx_nur_schedule_unit
    ON nur_schedule_items(unit_type);


-- ── nur_goals ──
-- Flexible goals: complete a surah, a juz, a hizb, a page range, streak, etc.
CREATE TABLE IF NOT EXISTS nur_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nur_profile_id UUID NOT NULL REFERENCES nur_profiles(id) ON DELETE CASCADE,

    title TEXT NOT NULL,
    description TEXT,

    goal_type TEXT NOT NULL DEFAULT 'custom'
        CHECK (goal_type IN (
            'complete_surah','complete_juz','complete_hizb',
            'complete_ruba','complete_page_range',
            'daily_streak','custom'
        )),

    -- Target specifics (nullable — depends on goal_type)
    target_surah INTEGER CHECK (target_surah IS NULL OR target_surah BETWEEN 1 AND 114),
    target_juz INTEGER CHECK (target_juz IS NULL OR target_juz BETWEEN 1 AND 30),
    target_hizb INTEGER CHECK (target_hizb IS NULL OR target_hizb BETWEEN 1 AND 60),
    target_ruba INTEGER CHECK (target_ruba IS NULL OR target_ruba BETWEEN 1 AND 240),
    target_page_start INTEGER CHECK (target_page_start IS NULL OR target_page_start BETWEEN 1 AND 604),
    target_page_end INTEGER CHECK (target_page_end IS NULL OR target_page_end BETWEEN 1 AND 604),
    target_streak_days INTEGER CHECK (target_streak_days IS NULL OR target_streak_days >= 1),
    target_date DATE,

    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nur_goals_profile
    ON nur_goals(nur_profile_id);
CREATE INDEX IF NOT EXISTS idx_nur_goals_active
    ON nur_goals(nur_profile_id, completed);


-- ── nur_daily_logs ──
-- One row per user per day. Aggregated stats + reflection.
CREATE TABLE IF NOT EXISTS nur_daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nur_profile_id UUID NOT NULL REFERENCES nur_profiles(id) ON DELETE CASCADE,

    date DATE NOT NULL,

    -- Counts by task type (in whichever unit the user tracks)
    total_new INTEGER NOT NULL DEFAULT 0,
    total_revised INTEGER NOT NULL DEFAULT 0,
    total_recited INTEGER NOT NULL DEFAULT 0,
    unit_type TEXT NOT NULL DEFAULT 'ayah'
        CHECK (unit_type IN ('ayah','page','juz','hizb','ruba','surah')),

    streak_count INTEGER NOT NULL DEFAULT 0,

    day_rating INTEGER CHECK (day_rating IS NULL OR day_rating BETWEEN 1 AND 5),
    reflection TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(nur_profile_id, date)
);

CREATE INDEX IF NOT EXISTS idx_nur_daily_logs_profile_date
    ON nur_daily_logs(nur_profile_id, date);


-- ─────────────────────────────────────────────────────────────────────
-- STEP 3: Reference table — Quran structure
-- ─────────────────────────────────────────────────────────────────────
-- Lets the app look up ayah counts, page mappings, etc. without hardcoding.

CREATE TABLE IF NOT EXISTS quran_surahs (
    number INTEGER PRIMARY KEY CHECK (number BETWEEN 1 AND 114),
    name_arabic TEXT NOT NULL,
    name_english TEXT NOT NULL,
    name_transliteration TEXT NOT NULL,
    total_ayahs INTEGER NOT NULL,
    start_page INTEGER NOT NULL CHECK (start_page BETWEEN 1 AND 604),
    juz_start INTEGER NOT NULL CHECK (juz_start BETWEEN 1 AND 30)
);


-- ─────────────────────────────────────────────────────────────────────
-- STEP 4: Row Level Security (RLS)
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE nur_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nur_schedule_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE nur_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE nur_daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quran_surahs ENABLE ROW LEVEL SECURITY;

-- ── nur_profiles policies ──

CREATE POLICY "Users can view own profile"
    ON nur_profiles FOR SELECT
    USING (clerk_id = auth.uid()::text);

CREATE POLICY "Users can update own profile"
    ON nur_profiles FOR UPDATE
    USING (clerk_id = auth.uid()::text)
    WITH CHECK (clerk_id = auth.uid()::text);

CREATE POLICY "Service role full access on nur_profiles"
    ON nur_profiles FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

-- ── nur_schedule_items policies ──

CREATE POLICY "Users can view own schedule"
    ON nur_schedule_items FOR SELECT
    USING (nur_profile_id IN (
        SELECT id FROM nur_profiles WHERE clerk_id = auth.uid()::text
    ));

CREATE POLICY "Users can manage own schedule"
    ON nur_schedule_items FOR ALL
    USING (nur_profile_id IN (
        SELECT id FROM nur_profiles WHERE clerk_id = auth.uid()::text
    ))
    WITH CHECK (nur_profile_id IN (
        SELECT id FROM nur_profiles WHERE clerk_id = auth.uid()::text
    ));

CREATE POLICY "Service role full access on nur_schedule_items"
    ON nur_schedule_items FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

-- ── nur_goals policies ──

CREATE POLICY "Users can view own goals"
    ON nur_goals FOR SELECT
    USING (nur_profile_id IN (
        SELECT id FROM nur_profiles WHERE clerk_id = auth.uid()::text
    ));

CREATE POLICY "Users can manage own goals"
    ON nur_goals FOR ALL
    USING (nur_profile_id IN (
        SELECT id FROM nur_profiles WHERE clerk_id = auth.uid()::text
    ))
    WITH CHECK (nur_profile_id IN (
        SELECT id FROM nur_profiles WHERE clerk_id = auth.uid()::text
    ));

CREATE POLICY "Service role full access on nur_goals"
    ON nur_goals FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

-- ── nur_daily_logs policies ──

CREATE POLICY "Users can view own logs"
    ON nur_daily_logs FOR SELECT
    USING (nur_profile_id IN (
        SELECT id FROM nur_profiles WHERE clerk_id = auth.uid()::text
    ));

CREATE POLICY "Users can manage own logs"
    ON nur_daily_logs FOR ALL
    USING (nur_profile_id IN (
        SELECT id FROM nur_profiles WHERE clerk_id = auth.uid()::text
    ))
    WITH CHECK (nur_profile_id IN (
        SELECT id FROM nur_profiles WHERE clerk_id = auth.uid()::text
    ));

CREATE POLICY "Service role full access on nur_daily_logs"
    ON nur_daily_logs FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

-- ── quran_surahs — public read, service write ──

CREATE POLICY "Anyone can read quran_surahs"
    ON quran_surahs FOR SELECT
    USING (true);

CREATE POLICY "Service role full access on quran_surahs"
    ON quran_surahs FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────
-- STEP 5: Useful views
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW nur_user_streaks AS
SELECT
    np.clerk_id,
    np.display_name,
    np.track_types,
    np.preferred_unit,
    COALESCE(MAX(ndl.streak_count), 0) AS current_streak,
    COUNT(DISTINCT ndl.date) AS total_active_days,
    SUM(ndl.total_new) AS lifetime_new,
    SUM(ndl.total_revised) AS lifetime_revised,
    SUM(ndl.total_recited) AS lifetime_recited
FROM nur_profiles np
LEFT JOIN nur_daily_logs ndl ON ndl.nur_profile_id = np.id
GROUP BY np.clerk_id, np.display_name, np.track_types, np.preferred_unit;


-- ─────────────────────────────────────────────────────────────────────
-- STEP 6: Seed quran_surahs reference data
-- ─────────────────────────────────────────────────────────────────────

INSERT INTO quran_surahs (number, name_arabic, name_english, name_transliteration, total_ayahs, start_page, juz_start) VALUES
(1,   'الفاتحة',    'The Opening',            'Al-Fatihah',       7,   1,   1),
(2,   'البقرة',      'The Cow',                'Al-Baqarah',       286, 2,   1),
(3,   'آل عمران',    'Family of Imran',        'Aal-Imran',        200, 50,  3),
(4,   'النساء',      'The Women',              'An-Nisa',          176, 77,  4),
(5,   'المائدة',     'The Table Spread',       'Al-Maidah',        120, 106, 6),
(6,   'الأنعام',     'The Cattle',             'Al-Anam',          165, 128, 7),
(7,   'الأعراف',     'The Heights',            'Al-Araf',          206, 151, 8),
(8,   'الأنفال',     'The Spoils of War',      'Al-Anfal',         75,  177, 9),
(9,   'التوبة',      'The Repentance',         'At-Tawbah',        129, 187, 10),
(10,  'يونس',        'Jonah',                  'Yunus',            109, 208, 11),
(11,  'هود',         'Hud',                    'Hud',              123, 221, 11),
(12,  'يوسف',        'Joseph',                 'Yusuf',            111, 235, 12),
(13,  'الرعد',       'The Thunder',            'Ar-Rad',           43,  249, 13),
(14,  'إبراهيم',     'Abraham',                'Ibrahim',          52,  255, 13),
(15,  'الحجر',       'The Rocky Tract',        'Al-Hijr',          99,  262, 14),
(16,  'النحل',       'The Bee',                'An-Nahl',          128, 267, 14),
(17,  'الإسراء',     'The Night Journey',      'Al-Isra',          111, 282, 15),
(18,  'الكهف',       'The Cave',               'Al-Kahf',          110, 293, 15),
(19,  'مريم',        'Mary',                   'Maryam',           98,  305, 16),
(20,  'طه',          'Ta-Ha',                  'Ta-Ha',            135, 312, 16),
(21,  'الأنبياء',    'The Prophets',           'Al-Anbiya',        112, 322, 17),
(22,  'الحج',        'The Pilgrimage',         'Al-Hajj',          78,  332, 17),
(23,  'المؤمنون',    'The Believers',          'Al-Muminun',       118, 342, 18),
(24,  'النور',       'The Light',              'An-Nur',           64,  350, 18),
(25,  'الفرقان',     'The Criterion',          'Al-Furqan',        77,  359, 18),
(26,  'الشعراء',     'The Poets',              'Ash-Shuara',       227, 367, 19),
(27,  'النمل',       'The Ant',                'An-Naml',          93,  377, 19),
(28,  'القصص',       'The Stories',            'Al-Qasas',         88,  385, 20),
(29,  'العنكبوت',    'The Spider',             'Al-Ankabut',       69,  396, 20),
(30,  'الروم',       'The Romans',             'Ar-Rum',           60,  404, 21),
(31,  'لقمان',       'Luqman',                 'Luqman',           34,  411, 21),
(32,  'السجدة',      'The Prostration',        'As-Sajdah',        30,  415, 21),
(33,  'الأحزاب',     'The Combined Forces',    'Al-Ahzab',         73,  418, 21),
(34,  'سبأ',         'Sheba',                  'Saba',             54,  428, 22),
(35,  'فاطر',        'Originator',             'Fatir',            45,  434, 22),
(36,  'يس',          'Ya-Sin',                 'Ya-Sin',           83,  440, 22),
(37,  'الصافات',     'Those Ranged in Ranks',  'As-Saffat',        182, 446, 23),
(38,  'ص',           'The Letter Sad',         'Sad',              88,  453, 23),
(39,  'الزمر',       'The Troops',             'Az-Zumar',         75,  458, 23),
(40,  'غافر',        'The Forgiver',           'Ghafir',           85,  467, 24),
(41,  'فصلت',        'Explained in Detail',    'Fussilat',         54,  477, 24),
(42,  'الشورى',      'The Consultation',       'Ash-Shura',        53,  483, 25),
(43,  'الزخرف',      'The Ornaments of Gold',  'Az-Zukhruf',       89,  489, 25),
(44,  'الدخان',      'The Smoke',              'Ad-Dukhan',        59,  496, 25),
(45,  'الجاثية',     'The Crouching',          'Al-Jathiyah',      37,  499, 25),
(46,  'الأحقاف',     'The Wind-curved Sandhills','Al-Ahqaf',       35,  502, 26),
(47,  'محمد',        'Muhammad',               'Muhammad',         38,  507, 26),
(48,  'الفتح',       'The Victory',            'Al-Fath',          29,  511, 26),
(49,  'الحجرات',     'The Rooms',              'Al-Hujurat',       18,  515, 26),
(50,  'ق',           'The Letter Qaf',         'Qaf',              45,  518, 26),
(51,  'الذاريات',    'The Winnowing Winds',    'Adh-Dhariyat',     60,  520, 26),
(52,  'الطور',       'The Mount',              'At-Tur',           49,  523, 27),
(53,  'النجم',       'The Star',               'An-Najm',          62,  526, 27),
(54,  'القمر',       'The Moon',               'Al-Qamar',         55,  528, 27),
(55,  'الرحمن',      'The Beneficent',         'Ar-Rahman',        78,  531, 27),
(56,  'الواقعة',     'The Inevitable',         'Al-Waqiah',        96,  534, 27),
(57,  'الحديد',      'The Iron',               'Al-Hadid',         29,  537, 27),
(58,  'المجادلة',    'The Pleading Woman',     'Al-Mujadila',      22,  542, 28),
(59,  'الحشر',       'The Exile',              'Al-Hashr',         24,  545, 28),
(60,  'الممتحنة',    'She That is Examined',   'Al-Mumtahanah',    13,  549, 28),
(61,  'الصف',        'The Ranks',              'As-Saff',          14,  551, 28),
(62,  'الجمعة',      'The Congregation',       'Al-Jumuah',        11,  553, 28),
(63,  'المنافقون',   'The Hypocrites',         'Al-Munafiqun',     11,  554, 28),
(64,  'التغابن',     'The Mutual Disillusion', 'At-Taghabun',      18,  556, 28),
(65,  'الطلاق',      'The Divorce',            'At-Talaq',         12,  558, 28),
(66,  'التحريم',     'The Prohibition',        'At-Tahrim',        12,  560, 28),
(67,  'الملك',       'The Sovereignty',        'Al-Mulk',          30,  562, 29),
(68,  'القلم',       'The Pen',                'Al-Qalam',         52,  564, 29),
(69,  'الحاقة',      'The Reality',            'Al-Haqqah',        52,  566, 29),
(70,  'المعارج',     'The Ascending Stairways','Al-Maarij',        44,  568, 29),
(71,  'نوح',         'Noah',                   'Nuh',              28,  570, 29),
(72,  'الجن',        'The Jinn',               'Al-Jinn',          28,  572, 29),
(73,  'المزمل',      'The Enshrouded One',     'Al-Muzzammil',     20,  574, 29),
(74,  'المدثر',      'The Cloaked One',        'Al-Muddaththir',   56,  575, 29),
(75,  'القيامة',     'The Resurrection',       'Al-Qiyamah',       40,  577, 29),
(76,  'الإنسان',     'The Human',              'Al-Insan',         31,  578, 29),
(77,  'المرسلات',    'The Emissaries',         'Al-Mursalat',      50,  580, 29),
(78,  'النبأ',       'The Tidings',            'An-Naba',          40,  582, 30),
(79,  'النازعات',    'Those Who Drag Forth',   'An-Naziat',        46,  583, 30),
(80,  'عبس',         'He Frowned',             'Abasa',            42,  585, 30),
(81,  'التكوير',     'The Overthrowing',       'At-Takwir',        29,  586, 30),
(82,  'الانفطار',    'The Cleaving',           'Al-Infitar',       19,  587, 30),
(83,  'المطففين',    'The Defrauding',         'Al-Mutaffifin',    36,  587, 30),
(84,  'الانشقاق',    'The Sundering',          'Al-Inshiqaq',      25,  589, 30),
(85,  'البروج',      'The Mansions of Stars',  'Al-Buruj',         22,  590, 30),
(86,  'الطارق',      'The Morning Star',       'At-Tariq',         17,  591, 30),
(87,  'الأعلى',      'The Most High',          'Al-Ala',           19,  591, 30),
(88,  'الغاشية',     'The Overwhelming',       'Al-Ghashiyah',     26,  592, 30),
(89,  'الفجر',       'The Dawn',               'Al-Fajr',          30,  593, 30),
(90,  'البلد',       'The City',               'Al-Balad',         20,  594, 30),
(91,  'الشمس',       'The Sun',                'Ash-Shams',        15,  595, 30),
(92,  'الليل',       'The Night',              'Al-Layl',          21,  595, 30),
(93,  'الضحى',       'The Morning Hours',      'Ad-Duhaa',         11,  596, 30),
(94,  'الشرح',       'The Relief',             'Ash-Sharh',        8,   596, 30),
(95,  'التين',       'The Fig',                'At-Tin',           8,   597, 30),
(96,  'العلق',       'The Clot',               'Al-Alaq',          19,  597, 30),
(97,  'القدر',       'The Power',              'Al-Qadr',          5,   598, 30),
(98,  'البينة',      'The Clear Proof',        'Al-Bayyinah',      8,   598, 30),
(99,  'الزلزلة',     'The Earthquake',         'Az-Zalzalah',      8,   599, 30),
(100, 'العاديات',    'The Coursers',           'Al-Adiyat',        11,  599, 30),
(101, 'القارعة',     'The Calamity',           'Al-Qariah',        11,  600, 30),
(102, 'التكاثر',     'The Rivalry in Worldly', 'At-Takathur',      8,   600, 30),
(103, 'العصر',       'The Declining Day',      'Al-Asr',           3,   601, 30),
(104, 'الهمزة',      'The Traducer',           'Al-Humazah',       9,   601, 30),
(105, 'الفيل',       'The Elephant',           'Al-Fil',           5,   601, 30),
(106, 'قريش',        'Quraysh',                'Quraysh',          4,   602, 30),
(107, 'الماعون',     'The Small Kindnesses',   'Al-Maun',          7,   602, 30),
(108, 'الكوثر',      'The Abundance',          'Al-Kawthar',       3,   602, 30),
(109, 'الكافرون',    'The Disbelievers',       'Al-Kafirun',       6,   603, 30),
(110, 'النصر',       'The Divine Support',     'An-Nasr',          3,   603, 30),
(111, 'المسد',       'The Palm Fiber',         'Al-Masad',         5,   603, 30),
(112, 'الإخلاص',     'The Sincerity',          'Al-Ikhlas',        4,   604, 30),
(113, 'الفلق',       'The Daybreak',           'Al-Falaq',         5,   604, 30),
(114, 'الناس',       'Mankind',                'An-Nas',           6,   604, 30)
ON CONFLICT (number) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────
-- DONE
-- ─────────────────────────────────────────────────────────────────────
-- Copy everything above and paste into Supabase SQL Editor → Run.
-- Your app uses the supabase-js client with the service_role key
-- in API routes for writes, and the anon key on the client for reads.
-- ─────────────────────────────────────────────────────────────────────


-- Optional native mushaf reader preferences
ALTER TABLE nur_profiles ADD COLUMN IF NOT EXISTS mushaf_view_mode TEXT NOT NULL DEFAULT 'page' CHECK (mushaf_view_mode IN ('page','ayah'));
ALTER TABLE nur_profiles ADD COLUMN IF NOT EXISTS mushaf_tajweed_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE nur_profiles ADD COLUMN IF NOT EXISTS mushaf_mutashabihat_enabled BOOLEAN NOT NULL DEFAULT false;
