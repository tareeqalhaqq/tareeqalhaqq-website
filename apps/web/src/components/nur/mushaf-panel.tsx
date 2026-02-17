'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  BookOpen,
  Columns2,
  Flame,
  LayoutGrid,
  ScrollText,
  Settings2,
  TrendingUp,
  X,
} from 'lucide-react';
import { DEFAULT_RECITER_ID, QURAN_RECITER_CATALOG, getReciterById, type ReciterId } from '@/lib/quran-audio';
import { getSurahByNumber, getSurahsByJuz, surahs } from '@/lib/quran-data';
import { findMostRelevantPageForSurah, getAyah } from '@/lib/quran-text';
import type { NurProfile } from '@/lib/nur-types';
import { MushafReader } from './mushaf/MushafReader';
import { PlaybackControls } from './mushaf/PlaybackControls';
import {
  MISTAKE_TYPES,
  type AyahRange,
  type MistakeType,
  type MushafDashboardPayload,
  type MushafLoopMode,
  type MushafPlaybackMode,
  type MushafPosition,
  type MushafReaderOptions,
  type MushafReaderSelection,
  type MushafViewMode,
} from './mushaf/types';

const OFFLINE_QUEUE_KEY = 'nur.mushaf.offline-queue.v1';
const initialPosition: MushafPosition = { surah: 1, ayah: 1, page: 1 };
const emptyDashboard: MushafDashboardPayload = {
  weakAyat: [],
  dueReviews: [],
  recentMistakes: [],
  stats: {
    weekly_sessions: 0,
    monthly_minutes: 0,
    most_recited_surah: null,
    streak_days: 0,
    longest_session_minutes: 0,
    total_ayat_reviewed: 0,
    review_consistency: 0,
    improvement_trend: 0,
  },
};

const MISTAKE_LABELS: Record<MistakeType, string> = {
  SKIP_WORD: 'Skip Word',
  SKIP_AYAH: 'Skip Ayah',
  REPEAT: 'Repeat',
  JUMP_SIMILAR: 'Jump Similar',
  STOP_MID: 'Stop Mid',
  PRONUNCIATION_GENERAL: 'Pronunciation',
};

type OfflineAction = {
  action: string;
  payload: Record<string, unknown>;
  created_at: string;
};

type MushafPanelProps = {
  profile: NurProfile;
  onSaveSettings: (updates: Partial<NurProfile>) => Promise<void>;
  isFullScreen?: boolean;
  onClose?: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(Math.trunc(value), min), max);
}

function uniqueByVerse(items: Array<{ surah: number; ayah: number; verseKey: string }>) {
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.verseKey)) return false;
    seen.add(item.verseKey);
    return true;
  });
}

export function MushafPanel({ profile, onSaveSettings, isFullScreen = false, onClose }: MushafPanelProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const hydratedRef = useRef(false);
  const stateTimerRef = useRef<number | null>(null);

  const [viewMode, setViewMode] = useState<MushafViewMode>(profile.mushaf_view_mode ?? 'page');
  const [position, setPosition] = useState<MushafPosition>(initialPosition);
  const [selectedReciterId, setSelectedReciterId] = useState<ReciterId>(getReciterById(profile.selected_reciter_id).id);
  const [playbackMode, setPlaybackMode] = useState<MushafPlaybackMode>('single_ayah');
  const [playbackRate, setPlaybackRate] = useState(Math.min(Math.max(profile.mushaf_playback_rate ?? 1, 0.75), 1.25));
  const [options, setOptions] = useState<MushafReaderOptions>({
    tajweedEnabled: profile.mushaf_tajweed_enabled ?? true,
    followPlayback: profile.mushaf_follow_playback_enabled ?? true,
  });
  const [range, setRange] = useState<AyahRange | null>(null);
  const [selection, setSelection] = useState<MushafReaderSelection>({ activeAyah: null, range: null });
  const [activePlaybackAyah, setActivePlaybackAyah] = useState<{ surah: number; ayah: number } | null>(null);
  const [scrollState, setScrollState] = useState({ page: profile.mushaf_scroll_page ?? 0, ayah: profile.mushaf_scroll_ayah ?? 0 });
  const [dashboard, setDashboard] = useState<MushafDashboardPayload>(emptyDashboard);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [twoPageSpread, setTwoPageSpread] = useState(false);

  // Audio fix: store verse positions loaded by MushafReader
  const [loadedPageAyahs, setLoadedPageAyahs] = useState<Array<{ surah: number; ayah: number }>>([]);

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(null);
  const [sessionMistakeCount, setSessionMistakeCount] = useState(0);
  const [sessionLoopCounts, setSessionLoopCounts] = useState({ ayah: 0, range: 0, surah: 0 });
  const [sessionConfidence, setSessionConfidence] = useState(75);

  const [playlistType, setPlaylistType] = useState<'weak_ayat' | 'juz' | 'custom_range' | 'mistake_replay' | 'taraweeh_prep'>('weak_ayat');
  const [playlistJuz, setPlaylistJuz] = useState(30);
  const [customRange, setCustomRange] = useState({ surah: 1, startAyah: 1, endAyah: 5 });
  const [playlistAyahs, setPlaylistAyahs] = useState<Array<{ surah: number; ayah: number }>>([]);

  const selectedReciter = useMemo(() => getReciterById(selectedReciterId), [selectedReciterId]);

  // Callback from MushafReader when verses are loaded from API
  const handleVersesLoaded = useCallback((verses: Array<{ surah: number; ayah: number }>) => {
    setLoadedPageAyahs(verses);
  }, []);

  const readQueue = useCallback((): OfflineAction[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(OFFLINE_QUEUE_KEY);
      return raw ? (JSON.parse(raw) as OfflineAction[]) : [];
    } catch {
      return [];
    }
  }, []);

  const writeQueue = useCallback((queue: OfflineAction[]) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue.slice(-100)));
    } catch {
      // ignore
    }
    setOfflineQueueCount(queue.length);
  }, []);

  const postAction = useCallback(async (action: string, payload: Record<string, unknown>, queueOnFail = true) => {
    try {
      const res = await fetch('/api/nur/mushaf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });
      if (!res.ok) throw new Error('request failed');
      return await res.json();
    } catch {
      if (queueOnFail) {
        const queue = readQueue();
        queue.push({ action, payload, created_at: new Date().toISOString() });
        writeQueue(queue);
      }
      return null;
    }
  }, [readQueue, writeQueue]);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoadingDashboard(true);
      const res = await fetch('/api/nur/mushaf', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setDashboard({
        weakAyat: data.weakAyat ?? [],
        dueReviews: data.dueReviews ?? [],
        recentMistakes: data.recentMistakes ?? [],
        stats: data.stats ?? emptyDashboard.stats,
      });
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  const flushQueue = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.onLine) return;
    const queue = readQueue();
    if (!queue.length) {
      setOfflineQueueCount(0);
      return;
    }
    const remaining: OfflineAction[] = [];
    for (const item of queue) {
      const ok = await postAction(item.action, item.payload, false);
      if (!ok) remaining.push(item);
    }
    writeQueue(remaining);
  }, [postAction, readQueue, writeQueue]);

  const endSession = useCallback(async () => {
    if (!activeSessionId || !sessionStartedAt) return;
    const duration = Math.max(0, Math.round((Date.now() - new Date(sessionStartedAt).getTime()) / 1000));
    await postAction('end_session', {
      session_id: activeSessionId,
      duration_seconds: duration,
      surah: position.surah,
      ayah: position.ayah,
      loop_ayah_count: sessionLoopCounts.ayah,
      loop_range_count: sessionLoopCounts.range,
      loop_surah_count: sessionLoopCounts.surah,
      mistake_count: sessionMistakeCount,
      confidence_score: sessionConfidence,
    });
    setActiveSessionId(null);
    setSessionStartedAt(null);
    setSessionMistakeCount(0);
    setSessionLoopCounts({ ayah: 0, range: 0, surah: 0 });
    void fetchDashboard();
  }, [activeSessionId, fetchDashboard, position.ayah, position.surah, postAction, sessionConfidence, sessionLoopCounts.ayah, sessionLoopCounts.range, sessionLoopCounts.surah, sessionMistakeCount, sessionStartedAt]);

  const startSession = useCallback(async () => {
    if (activeSessionId) return;
    const result = await postAction('start_session', {
      surah: position.surah,
      ayah: position.ayah,
      reciter_id: selectedReciterId,
      playback_mode: playbackMode,
      playback_rate: playbackRate,
    });
    if (result?.session?.id) {
      setActiveSessionId(result.session.id);
      setSessionStartedAt(result.session.started_at ?? new Date().toISOString());
      setSessionMistakeCount(0);
      setSessionLoopCounts({ ayah: 0, range: 0, surah: 0 });
    }
  }, [activeSessionId, playbackMode, playbackRate, position.ayah, position.surah, postAction, selectedReciterId]);

  // Hydrate from profile
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    setViewMode(profile.mushaf_view_mode ?? 'page');
    setSelectedReciterId(getReciterById(profile.selected_reciter_id).id);
    setOptions({
      tajweedEnabled: profile.mushaf_tajweed_enabled ?? true,
      followPlayback: profile.mushaf_follow_playback_enabled ?? true,
    });
    setPlaybackRate(Math.min(Math.max(profile.mushaf_playback_rate ?? 1, 0.75), 1.25));
    setPosition({
      surah: profile.mushaf_last_surah ?? 1,
      ayah: profile.mushaf_last_ayah ?? 1,
      page: profile.mushaf_last_page ?? 1,
    });
  }, [profile]);

  // URL params
  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'page' || view === 'ayah') setViewMode(view);
    const page = Number(searchParams.get('page'));
    const surah = Number(searchParams.get('surah'));
    const ayah = Number(searchParams.get('ayah'));
    setPosition(prev => ({
      page: Number.isFinite(page) && page > 0 ? page : prev.page,
      surah: Number.isFinite(surah) && surah > 0 ? surah : prev.surah,
      ayah: Number.isFinite(ayah) && ayah > 0 ? ayah : prev.ayah,
    }));
  }, [searchParams]);

  useEffect(() => {
    if (!isFullScreen) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', viewMode);
    if (viewMode === 'page') {
      params.set('page', String(position.page));
      params.delete('surah');
      params.delete('ayah');
    } else {
      params.set('surah', String(position.surah));
      params.set('ayah', String(position.ayah));
      params.delete('page');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [isFullScreen, pathname, position.ayah, position.page, position.surah, router, searchParams, viewMode]);

  useEffect(() => {
    void fetchDashboard();
    void flushQueue();
    const onlineHandler = () => void flushQueue();
    window.addEventListener('online', onlineHandler);
    return () => window.removeEventListener('online', onlineHandler);
  }, [fetchDashboard, flushQueue]);

  useEffect(() => {
    return () => { void endSession(); };
  }, [endSession]);

  useEffect(() => {
    setOfflineQueueCount(readQueue().length);
  }, [readQueue]);

  // Debounced state save
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (stateTimerRef.current) window.clearTimeout(stateTimerRef.current);
    stateTimerRef.current = window.setTimeout(() => {
      void postAction('reader_state', {
        view_mode: viewMode,
        surah: position.surah,
        ayah: position.ayah,
        page: position.page,
        scroll_page: scrollState.page,
        scroll_ayah: scrollState.ayah,
        playback_rate: playbackRate,
        follow_playback: options.followPlayback,
      });
    }, 600);
    return () => {
      if (stateTimerRef.current) window.clearTimeout(stateTimerRef.current);
    };
  }, [options.followPlayback, playbackRate, position.ayah, position.page, position.surah, postAction, scrollState.ayah, scrollState.page, viewMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('input,textarea,select,[contenteditable="true"]')) return;

      if (event.key.toLowerCase() === 'm') {
        event.preventDefault();
        setViewMode(prev => (prev === 'page' ? 'ayah' : 'page'));
      }
      if (event.key.toLowerCase() === 'j' || event.key === 'ArrowLeft') {
        event.preventDefault();
        if (viewMode === 'page') {
          setPosition(prev => ({ ...prev, page: Math.min(prev.page + 1, 604) }));
        } else {
          setPosition(prev => ({ ...prev, surah: Math.min(prev.surah + 1, 114), ayah: 1 }));
        }
      }
      if (event.key.toLowerCase() === 'k' || event.key === 'ArrowRight') {
        event.preventDefault();
        if (viewMode === 'page') {
          setPosition(prev => ({ ...prev, page: Math.max(prev.page - 1, 1) }));
        } else {
          setPosition(prev => ({ ...prev, surah: Math.max(prev.surah - 1, 1), ayah: 1 }));
        }
      }
      if (event.key === 'Escape' && isFullScreen && onClose) {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullScreen, onClose, viewMode]);

  const handleReciterChange = async (reciterId: string) => {
    const nextReciter = getReciterById(reciterId).id;
    setSelectedReciterId(nextReciter);
    await onSaveSettings({ selected_reciter_id: nextReciter });
  };

  const handlePlayAyah = (surah: number, ayah: number) => {
    const matched = getAyah(surah, ayah);
    setPosition(prev => ({ ...prev, surah, ayah, page: matched?.page ?? prev.page }));
    setPlaybackMode('single_ayah');
    setRange(null);
    setActivePlaybackAyah({ surah, ayah });
  };

  const handleLogMistake = async (mistakeType: MistakeType) => {
    if (!selection.activeAyah) return;
    await postAction('log_mistake', {
      session_id: activeSessionId,
      verse_key: selection.activeAyah.key,
      surah: selection.activeAyah.surah,
      ayah: selection.activeAyah.ayah,
      mistake_type: mistakeType,
      confidence: 0.7,
      repeated_correction: mistakeType === 'REPEAT',
      stopped_mid_ayah: mistakeType === 'STOP_MID',
    });
    setSessionMistakeCount(prev => prev + 1);
    void fetchDashboard();
  };

  const handleEnqueueReview = async () => {
    if (!selection.activeAyah) return;
    const startAyah = selection.range?.startAyah ?? selection.activeAyah.ayah;
    const endAyah = selection.range?.endAyah ?? selection.activeAyah.ayah;
    await postAction('enqueue_review', {
      verse_key: `${selection.activeAyah.surah}:${startAyah}-${endAyah}`,
      surah: selection.activeAyah.surah,
      start_ayah: startAyah,
      end_ayah: endAyah,
      source_type: 'manual',
    });
    void fetchDashboard();
  };

  const handleGradeReview = async (cardId: string, grade: number) => {
    await postAction('grade_review', { card_id: cardId, grade });
    setDashboard(prev => ({ ...prev, dueReviews: prev.dueReviews.filter(card => card.id !== cardId) }));
  };

  const generatedPlaylist = useMemo(() => {
    if (playlistType === 'weak_ayat') {
      return dashboard.weakAyat.slice(0, 40).map(item => ({ surah: item.surah_number, ayah: item.ayah_number, verseKey: item.verse_key }));
    }
    if (playlistType === 'mistake_replay') {
      return uniqueByVerse(dashboard.recentMistakes.map(item => ({ surah: item.surah_number, ayah: item.ayah_number, verseKey: item.verse_key }))).slice(0, 40);
    }
    if (playlistType === 'juz') {
      const juzSurahs = new Set(getSurahsByJuz(clamp(playlistJuz, 1, 30)).map(item => item.number));
      const weak = dashboard.weakAyat.filter(item => juzSurahs.has(item.surah_number)).map(item => ({ surah: item.surah_number, ayah: item.ayah_number, verseKey: item.verse_key }));
      return weak.length ? uniqueByVerse(weak).slice(0, 40) : Array.from(juzSurahs).map(surah => ({ surah, ayah: 1, verseKey: `${surah}:1` }));
    }
    if (playlistType === 'custom_range') {
      const surah = clamp(customRange.surah, 1, 114);
      const start = Math.max(customRange.startAyah, 1);
      const end = Math.max(customRange.endAyah, start);
      return Array.from({ length: Math.min(end - start + 1, 120) }, (_, idx) => ({ surah, ayah: start + idx, verseKey: `${surah}:${start + idx}` }));
    }
    const taraweehSurahs = new Set([...getSurahsByJuz(29).map(item => item.number), ...getSurahsByJuz(30).map(item => item.number)]);
    return uniqueByVerse(dashboard.weakAyat.filter(item => taraweehSurahs.has(item.surah_number)).map(item => ({ surah: item.surah_number, ayah: item.ayah_number, verseKey: item.verse_key }))).slice(0, 60);
  }, [customRange.endAyah, customRange.startAyah, customRange.surah, dashboard.recentMistakes, dashboard.weakAyat, playlistJuz, playlistType]);

  const loadPlaylist = () => {
    const queue = generatedPlaylist.map(item => ({ surah: item.surah, ayah: item.ayah }));
    setPlaylistAyahs(queue);
    if (!queue.length) return;
    const first = queue[0];
    const matched = getAyah(first.surah, first.ayah);
    setPosition(prev => ({ ...prev, surah: first.surah, ayah: first.ayah, page: matched?.page ?? findMostRelevantPageForSurah(first.surah) }));
    setPlaybackMode('playlist');
  };

  const playbackControlsProps = {
    playbackMode,
    position,
    selectedReciter,
    range,
    pageAyahs: loadedPageAyahs,
    playlistAyahs,
    playbackRate,
    onPlaybackModeChange: setPlaybackMode,
    onPlaybackRateChange: setPlaybackRate,
    onActiveAyahChange: (surah: number, ayah: number) => {
      const matched = getAyah(surah, ayah);
      setActivePlaybackAyah({ surah, ayah });
      setPosition(prev => ({ ...prev, surah, ayah, page: matched?.page ?? prev.page }));
    },
    onPlayStateChange: (isPlaying: boolean) => {
      if (isPlaying) void startSession();
      else void endSession();
    },
    onLoopModeChange: (mode: MushafLoopMode) => {
      if (mode === 'off') return;
      setSessionLoopCounts(prev => {
        if (mode === 'track') return { ...prev, ayah: prev.ayah + 1 };
        if (playbackMode === 'surah') return { ...prev, surah: prev.surah + 1 };
        return { ...prev, range: prev.range + 1 };
      });
    },
  };

  // ──────────────────────────────────────────────
  // Full-screen layout
  // ──────────────────────────────────────────────
  if (isFullScreen) {
    const currentSurah = getSurahByNumber(position.surah);

    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[hsl(220,20%,4%)]">
        {/* Slim header with integrated navigation */}
        <header className="flex items-center gap-2 border-b border-white/[0.06] bg-black/30 px-3 py-1.5 backdrop-blur">
          {/* Left: Logo + View toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <BookOpen className="h-4 w-4 text-cyan-300/50" />
            <div className="flex rounded-md border border-white/[0.08] overflow-hidden">
              <button
                type="button"
                onClick={async () => { setViewMode('page'); await onSaveSettings({ mushaf_view_mode: 'page' }); }}
                className={`px-2 py-1 text-[11px] flex items-center gap-1 transition ${
                  viewMode === 'page' ? 'bg-cyan-500/15 text-cyan-200' : 'text-white/40 hover:text-white/70'
                }`}
              >
                <LayoutGrid className="h-3 w-3" />
                Page
              </button>
              <button
                type="button"
                onClick={async () => { setViewMode('ayah'); await onSaveSettings({ mushaf_view_mode: 'ayah' }); }}
                className={`px-2 py-1 text-[11px] flex items-center gap-1 transition ${
                  viewMode === 'ayah' ? 'bg-cyan-500/15 text-cyan-200' : 'text-white/40 hover:text-white/70'
                }`}
              >
                <ScrollText className="h-3 w-3" />
                Ayah
              </button>
            </div>
          </div>

          {/* Center: Navigation dropdowns */}
          <div className="flex items-center gap-1.5 flex-1 justify-center">
            {/* Page selector */}
            <select
              value={position.page}
              onChange={e => {
                const p = Number(e.target.value);
                setViewMode('page');
                setPosition(prev => ({ ...prev, page: p }));
              }}
              className="bg-transparent border border-white/[0.08] rounded px-1.5 py-1 text-[11px] text-white/70 outline-none cursor-pointer hover:border-white/15"
            >
              {Array.from({ length: 604 }, (_, i) => i + 1).map(p => (
                <option key={p} value={p} className="bg-slate-900">Page {p}</option>
              ))}
            </select>

            {/* Surah selector */}
            <select
              value={position.surah}
              onChange={e => {
                const num = Number(e.target.value);
                const s = getSurahByNumber(num);
                setPosition(prev => ({
                  ...prev,
                  surah: num,
                  ayah: 1,
                  page: findMostRelevantPageForSurah(num),
                }));
              }}
              className="bg-transparent border border-white/[0.08] rounded px-1.5 py-1 text-[11px] text-white/70 outline-none cursor-pointer hover:border-white/15 max-w-[160px]"
            >
              {surahs.map(s => (
                <option key={s.number} value={s.number} className="bg-slate-900">
                  {s.number}. {s.name}
                </option>
              ))}
            </select>

            {/* Juz selector */}
            <select
              value=""
              onChange={e => {
                const juz = Number(e.target.value);
                if (!juz) return;
                const firstSurah = getSurahsByJuz(juz)[0];
                if (!firstSurah) return;
                setPosition(prev => ({
                  ...prev,
                  surah: firstSurah.number,
                  ayah: 1,
                  page: findMostRelevantPageForSurah(firstSurah.number),
                }));
              }}
              className="bg-transparent border border-white/[0.08] rounded px-1.5 py-1 text-[11px] text-white/70 outline-none cursor-pointer hover:border-white/15"
            >
              <option value="" className="bg-slate-900">Juz</option>
              {Array.from({ length: 30 }, (_, i) => i + 1).map(j => (
                <option key={j} value={j} className="bg-slate-900">Juz {j}</option>
              ))}
            </select>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Two-page spread toggle (page view only) */}
            {viewMode === 'page' && (
              <button
                type="button"
                onClick={() => setTwoPageSpread(prev => !prev)}
                className={`hidden lg:inline-flex items-center justify-center w-7 h-7 rounded border transition ${
                  twoPageSpread
                    ? 'border-cyan-400/30 text-cyan-200 bg-cyan-500/10'
                    : 'border-white/[0.08] text-white/35 hover:text-white/60'
                }`}
                title="Two-page spread"
              >
                <Columns2 className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Reciter dropdown */}
            <select
              value={selectedReciterId}
              onChange={e => handleReciterChange(e.target.value)}
              className="bg-transparent border border-white/[0.08] rounded px-1.5 py-1 text-[11px] text-white/50 outline-none cursor-pointer hover:border-white/15 max-w-[120px] hidden sm:block"
            >
              {QURAN_RECITER_CATALOG.map(r => (
                <option key={r.id} value={r.id} className="bg-slate-900">{r.displayName.split(' ').slice(-1)[0]}</option>
              ))}
            </select>

            {offlineQueueCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded border border-amber-300/25 bg-amber-400/10 px-1.5 py-0.5 text-[10px] text-amber-100">
                <AlertCircle className="h-2.5 w-2.5" />{offlineQueueCount}
              </span>
            )}

            {/* Settings/tools toggle */}
            <button
              type="button"
              onClick={() => setShowSidebar(prev => !prev)}
              className={`inline-flex items-center justify-center w-7 h-7 rounded border transition ${
                showSidebar
                  ? 'border-cyan-400/30 text-cyan-200 bg-cyan-500/10'
                  : 'border-white/[0.08] text-white/35 hover:text-white/60'
              }`}
              title="Tools panel"
            >
              <Settings2 className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center w-7 h-7 rounded border border-white/[0.08] text-white/35 transition hover:text-white/70 hover:bg-white/5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Mushaf area */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-hidden">
              <MushafReader
                viewMode={viewMode}
                position={position}
                options={options}
                activePlaybackAyah={activePlaybackAyah}
                scrollTop={viewMode === 'page' ? scrollState.page : scrollState.ayah}
                scrollRestoreKey={viewMode}
                twoPageSpread={twoPageSpread}
                onPositionChange={setPosition}
                onPlayAyah={handlePlayAyah}
                onRangeChange={setRange}
                onSelectionChange={setSelection}
                onScrollPositionChange={next => setScrollState(prev => viewMode === 'page' ? { ...prev, page: next } : { ...prev, ayah: next })}
                onVersesLoaded={handleVersesLoaded}
              />
            </div>
          </div>

          {/* Sidebar panel */}
          {showSidebar && (
            <aside className="w-72 border-l border-white/[0.06] bg-black/20 overflow-y-auto p-3 space-y-3 hidden lg:block">
              {/* Selected ayah actions */}
              <div className="space-y-2 rounded-lg border border-white/[0.05] bg-white/[0.02] p-2.5">
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">Selected Ayah</p>
                <p className="text-[11px] text-white/50">{selection.activeAyah ? `${selection.activeAyah.surah}:${selection.activeAyah.ayah}` : 'Tap an ayah'}</p>
                {selection.activeAyah && (
                  <>
                    <button type="button" onClick={handleEnqueueReview} className="w-full rounded border border-cyan-300/30 bg-cyan-400/[0.08] px-2 py-1 text-[11px] text-cyan-100 hover:bg-cyan-400/15 transition">
                      Add to Reviews
                    </button>
                    <div className="flex flex-wrap gap-1">
                      {MISTAKE_TYPES.map(type => (
                        <button key={type} type="button" onClick={() => handleLogMistake(type)} className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-white/60 transition hover:border-amber-300/30 hover:text-amber-100">
                          {MISTAKE_LABELS[type]}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Weak ayat */}
              {dashboard.weakAyat.length > 0 && (
                <div className="space-y-1.5 rounded-lg border border-white/[0.05] bg-white/[0.02] p-2.5">
                  <p className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-white/35">
                    <Flame className="h-3 w-3 text-amber-300/70" />Weak Ayat
                  </p>
                  {dashboard.weakAyat.slice(0, 5).map(item => (
                    <p key={item.verse_key} className="text-[11px] text-white/60">{item.verse_key} &middot; {item.mistake_count} mistakes</p>
                  ))}
                </div>
              )}

              {/* Due reviews */}
              {dashboard.dueReviews.length > 0 && (
                <div className="space-y-1.5 rounded-lg border border-white/[0.05] bg-white/[0.02] p-2.5">
                  <p className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-white/35">
                    <TrendingUp className="h-3 w-3 text-cyan-300/70" />Due Reviews ({dashboard.dueReviews.length})
                  </p>
                  {dashboard.dueReviews.slice(0, 3).map(card => (
                    <div key={card.id} className="rounded border border-white/[0.06] bg-black/15 p-1.5">
                      <p className="text-[11px] text-white/60">{card.surah_number}:{card.start_ayah}-{card.end_ayah}</p>
                      <div className="mt-1 flex gap-0.5">
                        {[0, 1, 2, 3, 4, 5].map(grade => (
                          <button key={`${card.id}-${grade}`} type="button" onClick={() => handleGradeReview(card.id, grade)} className="rounded border border-white/10 px-1 py-0.5 text-[9px] text-white/55 hover:border-cyan-300/35 hover:text-cyan-100 transition">
                            {grade}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reciter (mobile fallback since header hides on small screens) */}
              <div className="space-y-1.5 rounded-lg border border-white/[0.05] bg-white/[0.02] p-2.5 sm:hidden">
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">Reciter</p>
                <select
                  value={selectedReciterId}
                  onChange={e => handleReciterChange(e.target.value)}
                  className="w-full bg-transparent border border-white/[0.08] rounded px-2 py-1 text-[11px] text-white/70 outline-none"
                >
                  {QURAN_RECITER_CATALOG.map(r => (
                    <option key={r.id} value={r.id} className="bg-slate-900">{r.displayName}</option>
                  ))}
                </select>
              </div>

              {/* Session confidence */}
              <div className="space-y-1 rounded-lg border border-white/[0.05] bg-white/[0.02] p-2.5">
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">Confidence</p>
                <div className="flex items-center gap-2">
                  <input type="range" min={0} max={100} step={5} value={sessionConfidence} onChange={e => setSessionConfidence(Number(e.target.value))} className="w-full accent-cyan-300 h-1" />
                  <span className="text-[11px] text-cyan-100 tabular-nums w-6 text-right">{sessionConfidence}</span>
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* Slim playback bar */}
        <div className="border-t border-white/[0.06] bg-black/40 backdrop-blur px-3 py-1.5">
          <PlaybackControls {...playbackControlsProps} />
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // Compact card layout (for Nur dashboard grid)
  // ──────────────────────────────────────────────
  return (
    <div className="glass-panel space-y-3 p-4 text-white md:p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow text-cyan-300/60">Read & Listen</p>
          <h3 className="mt-0.5 text-base font-headline font-semibold">Mushaf</h3>
        </div>
        <span className="text-[11px] text-white/40">
          {viewMode === 'page' ? `Page ${position.page}` : `Surah ${position.surah}`}
        </span>
      </div>

      <select
        value={selectedReciterId}
        onChange={e => handleReciterChange(e.target.value)}
        className="w-full bg-transparent border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white/70 outline-none cursor-pointer"
      >
        {QURAN_RECITER_CATALOG.map(r => (
          <option key={r.id} value={r.id} className="bg-slate-900">{r.displayName} ({r.bitrateKbps}kbps)</option>
        ))}
      </select>

      <PlaybackControls {...playbackControlsProps} />
    </div>
  );
}
