export type TrackType = 'memorization' | 'revision' | 'recitation';

export type DayEndSetting = 'midnight' | 'fajr';

export type QuranUnit = 'ayah' | 'page' | 'juz' | 'hizb' | 'ruba' | 'surah';

export type GoalType =
  | 'complete_surah'
  | 'complete_juz'
  | 'complete_hizb'
  | 'complete_ruba'
  | 'complete_page_range'
  | 'daily_streak'
  | 'custom';

export type NurProfile = {
  id: string;
  clerk_id: string;
  display_name: string | null;
  track_types: TrackType[];
  preferred_unit: QuranUnit;
  day_end_setting: DayEndSetting;
  fajr_time: string | null; // HH:MM format
  memorization_current_surah: number | null;
  memorization_current_ayah: number | null;
  daily_new_amount: number;
  daily_revision_amount: number;
  preferred_time: string | null; // HH:MM format
  reminder_enabled: boolean;
  selected_reciter_id: string | null;
  setup_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type NurScheduleItem = {
  id: string;
  nur_profile_id: string;
  date: string; // YYYY-MM-DD
  task_type: TrackType;
  unit_type: QuranUnit;
  surah_number: number | null; // used when unit_type = 'ayah'
  range_start: number;
  range_end: number;
  completed: boolean;
  completed_at: string | null;
  carried_over: boolean;
  carried_from_date: string | null;
  notes: string | null;
  created_at: string;
};

export type NurGoal = {
  id: string;
  nur_profile_id: string;
  title: string;
  description: string | null;
  goal_type: GoalType;
  target_surah: number | null;
  target_juz: number | null;
  target_hizb: number | null;
  target_ruba: number | null;
  target_page_start: number | null;
  target_page_end: number | null;
  target_streak_days: number | null;
  target_date: string | null; // YYYY-MM-DD
  progress: number; // 0-100
  completed: boolean;
  completed_at: string | null;
  created_at: string;
};

export type NurDailyLog = {
  id: string;
  nur_profile_id: string;
  date: string; // YYYY-MM-DD
  total_new: number;
  total_revised: number;
  total_recited: number;
  unit_type: QuranUnit;
  streak_count: number;
  day_rating: number | null; // 1-5
  reflection: string | null;
  created_at: string;
};

export type SetupWizardData = {
  trackTypes: TrackType[];
  preferredUnit: QuranUnit;
  dayEndSetting: DayEndSetting;
  fajrTime: string;
  startSurah: number;
  startAyah: number;
  dailyNewAmount: number;
  dailyRevisionAmount: number;
  preferredTime: string | null;
  reminderEnabled: boolean;
};

export type CalendarDay = {
  date: Date;
  dateStr: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  items: NurScheduleItem[];
  log: NurDailyLog | null;
  hasCarryOver: boolean;
};

/** Labels for display */
export const UNIT_LABELS: Record<QuranUnit, string> = {
  ayah: 'Ayahs',
  page: 'Pages',
  juz: 'Juz',
  hizb: 'Ahzab',
  ruba: "Arba'",
  surah: 'Surahs',
};

export const UNIT_SINGULAR: Record<QuranUnit, string> = {
  ayah: 'Ayah',
  page: 'Page',
  juz: 'Juz',
  hizb: 'Hizb',
  ruba: "Rub'",
  surah: 'Surah',
};

export const TRACK_LABELS: Record<TrackType, string> = {
  memorization: 'Memorization (Hifz)',
  revision: "Revision (Muraja'ah)",
  recitation: 'Recitation (Tilawah)',
};
