import type { LoopMode, PlaybackMode, QuranReciter } from '@/lib/quran-audio';
import type { QuranAyah } from '@/lib/quran-text';

export type MushafViewMode = 'page' | 'ayah';

export type MushafPlaybackMode = PlaybackMode;
export type MushafLoopMode = LoopMode;

export type MushafPosition = {
  surah: number;
  ayah: number;
  page: number;
};

export type Reciter = QuranReciter;

export type MushafReaderOptions = {
  tajweedEnabled: boolean;
  mutashabihatEnabled: boolean;
  followPlayback: boolean;
};

export type AyahRange = {
  startAyah: number;
  endAyah: number;
};

export type MushafReaderSelection = {
  activeAyah: QuranAyah | null;
  range: AyahRange | null;
};

export const MISTAKE_TYPES = [
  'SKIP_WORD',
  'SKIP_AYAH',
  'REPEAT',
  'JUMP_SIMILAR',
  'STOP_MID',
  'PRONUNCIATION_GENERAL',
] as const;

export type MistakeType = (typeof MISTAKE_TYPES)[number];

export type WeakAyahInsight = {
  verse_key: string;
  surah_number: number;
  ayah_number: number;
  mistake_count: number;
  repeated_corrections: number;
  stop_mid_count: number;
  last_7d_mistakes: number;
  weak_score: number;
  last_mistake_at: string;
};

export type MushafReviewCard = {
  id: string;
  verse_key: string;
  surah_number: number;
  start_ayah: number;
  end_ayah: number;
  due_date: string;
  interval_days: number;
  ease_factor: number;
  repetitions: number;
  lapses: number;
  last_grade: number | null;
};

export type MushafSessionStats = {
  weekly_sessions: number;
  monthly_minutes: number;
  most_recited_surah: number | null;
  streak_days: number;
  longest_session_minutes: number;
  total_ayat_reviewed: number;
  review_consistency: number;
  improvement_trend: number;
};

export type MushafPlaylistType =
  | 'weak_ayat'
  | 'juz'
  | 'custom_range'
  | 'mistake_replay'
  | 'taraweeh_prep';

export type MushafPlaylist = {
  type: MushafPlaylistType;
  label: string;
  items: Array<{ surah: number; ayah: number; verseKey: string }>;
};

export type MushafDashboardPayload = {
  weakAyat: WeakAyahInsight[];
  dueReviews: MushafReviewCard[];
  recentMistakes: Array<{ verse_key: string; surah_number: number; ayah_number: number; mistake_type: MistakeType; event_time: string }>;
  stats: MushafSessionStats;
};
