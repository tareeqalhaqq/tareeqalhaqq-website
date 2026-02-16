export type TrackType = 'memorization' | 'revision' | 'recitation';

export type DayEndSetting = 'midnight' | 'fajr';

export type NurProfile = {
  id: string;
  clerk_id: string;
  display_name: string | null;
  track_type: TrackType;
  day_end_setting: DayEndSetting;
  fajr_time: string | null; // HH:MM format
  memorization_start_surah: number | null;
  memorization_start_ayah: number | null;
  memorization_current_surah: number | null;
  memorization_current_ayah: number | null;
  daily_new_verses: number;
  daily_revision_pages: number;
  preferred_time: string | null; // HH:MM format
  reminder_enabled: boolean;
  setup_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type NurScheduleItem = {
  id: string;
  nur_profile_id: string;
  date: string; // YYYY-MM-DD
  task_type: TrackType;
  surah_number: number;
  start_ayah: number;
  end_ayah: number;
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
  goal_type: 'complete_surah' | 'complete_juz' | 'daily_streak' | 'custom';
  target_surah: number | null;
  target_juz: number | null;
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
  total_verses_new: number;
  total_verses_revised: number;
  total_verses_recited: number;
  streak_count: number;
  day_rating: number | null; // 1-5
  reflection: string | null;
  created_at: string;
};

export type SetupWizardData = {
  trackType: TrackType;
  dayEndSetting: DayEndSetting;
  fajrTime: string;
  startSurah: number;
  startAyah: number;
  dailyNewVerses: number;
  dailyRevisionPages: number;
  preferredTime: string;
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
