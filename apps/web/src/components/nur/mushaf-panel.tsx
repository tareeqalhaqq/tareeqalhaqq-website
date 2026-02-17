'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Flame, ListChecks, TrendingUp } from 'lucide-react';
import { DEFAULT_RECITER_ID, QURAN_RECITER_CATALOG, getReciterById, type ReciterId } from '@/lib/quran-audio';
import { getSurahsByJuz } from '@/lib/quran-data';
import { findMostRelevantPageForSurah, getAyah, getAyahsForPage, getAyahsForSurah } from '@/lib/quran-text';
import type { NurProfile } from '@/lib/nur-types';
import { MushafReader } from './mushaf/MushafReader';
import { MushafToolbar } from './mushaf/MushafToolbar';
import { PlaybackControls } from './mushaf/PlaybackControls';
import { ReciterSelector } from './mushaf/ReciterSelector';
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
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(Math.trunc(value), min), max);
}

function uniqueByVerse(items: Array<{ surah: number; ayah: number; verseKey: string }>) {
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.verseKey)) {
      return false;
    }
    seen.add(item.verseKey);
    return true;
  });
}

export function MushafPanel({ profile, onSaveSettings }: MushafPanelProps) {
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
    mutashabihatEnabled: profile.mushaf_mutashabihat_enabled ?? false,
    followPlayback: profile.mushaf_follow_playback_enabled ?? true,
  });
  const [range, setRange] = useState<AyahRange | null>(null);
  const [selection, setSelection] = useState<MushafReaderSelection>({ activeAyah: null, range: null });
  const [activePlaybackAyah, setActivePlaybackAyah] = useState<{ surah: number; ayah: number } | null>(null);
  const [scrollState, setScrollState] = useState({ page: profile.mushaf_scroll_page ?? 0, ayah: profile.mushaf_scroll_ayah ?? 0 });
  const [dashboard, setDashboard] = useState<MushafDashboardPayload>(emptyDashboard);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

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
  const pageAyahs = useMemo(() => getAyahsForPage(position.page).map(item => ({ surah: item.surah, ayah: item.ayah })), [position.page]);
  const activeSurahAyahs = useMemo(() => getAyahsForSurah(position.surah), [position.surah]);

  const readQueue = useCallback((): OfflineAction[] => {
    if (typeof window === 'undefined') {
      return [];
    }
    try {
      const raw = window.localStorage.getItem(OFFLINE_QUEUE_KEY);
      return raw ? (JSON.parse(raw) as OfflineAction[]) : [];
    } catch {
      return [];
    }
  }, []);

  const writeQueue = useCallback((queue: OfflineAction[]) => {
    if (typeof window === 'undefined') {
      return;
    }
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
      if (!res.ok) {
        throw new Error('request failed');
      }
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
      if (!res.ok) {
        return;
      }
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
    if (typeof window === 'undefined' || !navigator.onLine) {
      return;
    }
    const queue = readQueue();
    if (!queue.length) {
      setOfflineQueueCount(0);
      return;
    }
    const remaining: OfflineAction[] = [];
    for (const item of queue) {
      const ok = await postAction(item.action, item.payload, false);
      if (!ok) {
        remaining.push(item);
      }
    }
    writeQueue(remaining);
  }, [postAction, readQueue, writeQueue]);

  const endSession = useCallback(async () => {
    if (!activeSessionId || !sessionStartedAt) {
      return;
    }
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
    if (activeSessionId) {
      return;
    }
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

  useEffect(() => {
    if (hydratedRef.current) {
      return;
    }
    hydratedRef.current = true;
    setViewMode(profile.mushaf_view_mode ?? 'page');
    setSelectedReciterId(getReciterById(profile.selected_reciter_id).id);
    setOptions({
      tajweedEnabled: profile.mushaf_tajweed_enabled ?? true,
      mutashabihatEnabled: profile.mushaf_mutashabihat_enabled ?? false,
      followPlayback: profile.mushaf_follow_playback_enabled ?? true,
    });
    setPlaybackRate(Math.min(Math.max(profile.mushaf_playback_rate ?? 1, 0.75), 1.25));
    setPosition({
      surah: profile.mushaf_last_surah ?? 1,
      ayah: profile.mushaf_last_ayah ?? 1,
      page: profile.mushaf_last_page ?? 1,
    });
  }, [profile]);

  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'page' || view === 'ayah') {
      setViewMode(view);
    }
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
  }, [pathname, position.ayah, position.page, position.surah, router, searchParams, viewMode]);

  useEffect(() => {
    void fetchDashboard();
    void flushQueue();
    const onlineHandler = () => {
      void flushQueue();
    };
    window.addEventListener('online', onlineHandler);
    return () => window.removeEventListener('online', onlineHandler);
  }, [fetchDashboard, flushQueue]);

  useEffect(() => {
    return () => {
      void endSession();
    };
  }, [endSession]);

  useEffect(() => {
    setOfflineQueueCount(readQueue().length);
  }, [readQueue]);

  useEffect(() => {
    if (!hydratedRef.current) {
      return;
    }
    if (stateTimerRef.current) {
      window.clearTimeout(stateTimerRef.current);
    }
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
      if (stateTimerRef.current) {
        window.clearTimeout(stateTimerRef.current);
      }
    };
  }, [options.followPlayback, playbackRate, position.ayah, position.page, position.surah, postAction, scrollState.ayah, scrollState.page, viewMode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (window.innerWidth < 1024) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target?.closest('input,textarea,select,[contenteditable="true"]')) {
        return;
      }

      if (event.key.toLowerCase() === 'm') {
        event.preventDefault();
        setViewMode(prev => (prev === 'page' ? 'ayah' : 'page'));
      }

      if (event.key.toLowerCase() === 'j') {
        event.preventDefault();
        if (viewMode === 'page') {
          setPosition(prev => ({ ...prev, page: Math.max(prev.page - 1, 1) }));
        } else {
          setPosition(prev => ({ ...prev, surah: Math.max(prev.surah - 1, 1), ayah: 1 }));
        }
      }

      if (event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (viewMode === 'page') {
          setPosition(prev => ({ ...prev, page: Math.min(prev.page + 1, 604) }));
        } else {
          setPosition(prev => ({ ...prev, surah: Math.min(prev.surah + 1, 114), ayah: 1 }));
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [viewMode]);

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
    if (!selection.activeAyah) {
      return;
    }
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
    if (!selection.activeAyah) {
      return;
    }
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
      const surahs = new Set(getSurahsByJuz(clamp(playlistJuz, 1, 30)).map(item => item.number));
      const weak = dashboard.weakAyat.filter(item => surahs.has(item.surah_number)).map(item => ({ surah: item.surah_number, ayah: item.ayah_number, verseKey: item.verse_key }));
      return weak.length ? uniqueByVerse(weak).slice(0, 40) : Array.from(surahs).map(surah => ({ surah, ayah: 1, verseKey: `${surah}:1` }));
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

  const weakToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return dashboard.weakAyat.filter(item => item.last_mistake_at.startsWith(today)).slice(0, 4);
  }, [dashboard.weakAyat]);

  const weakLast7 = useMemo(() => dashboard.weakAyat.filter(item => item.last_7d_mistakes > 0).slice(0, 4), [dashboard.weakAyat]);
  const weakMostConfused = useMemo(() => [...dashboard.weakAyat].sort((a, b) => b.repeated_corrections - a.repeated_corrections).slice(0, 4), [dashboard.weakAyat]);
  const weakJuz30 = useMemo(() => {
    const juz30 = new Set(getSurahsByJuz(30).map(item => item.number));
    return dashboard.weakAyat.filter(item => juz30.has(item.surah_number)).slice(0, 4);
  }, [dashboard.weakAyat]);

  const loadPlaylist = () => {
    const queue = generatedPlaylist.map(item => ({ surah: item.surah, ayah: item.ayah }));
    setPlaylistAyahs(queue);
    if (!queue.length) {
      return;
    }
    const first = queue[0];
    const matched = getAyah(first.surah, first.ayah);
    setPosition(prev => ({ ...prev, surah: first.surah, ayah: first.ayah, page: matched?.page ?? findMostRelevantPageForSurah(first.surah) }));
    setPlaybackMode('playlist');
  };

  return (
    <div className="glass-panel space-y-4 p-4 pb-24 text-white md:p-6 md:pb-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-cyan-300/60">Read & Listen</p>
          <h3 className="mt-1 text-lg font-headline font-semibold">Native Mushaf & Reciters</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/60">
          <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-black/20 px-2 py-1"><ListChecks className="h-3.5 w-3.5 text-cyan-200/80" />Due: {dashboard.dueReviews.length}</span>
          {offlineQueueCount > 0 && <span className="inline-flex items-center gap-1 rounded-md border border-amber-300/30 bg-amber-400/10 px-2 py-1 text-amber-100"><AlertCircle className="h-3.5 w-3.5" />Offline: {offlineQueueCount}</span>}
        </div>
      </div>

      <MushafToolbar
        viewMode={viewMode}
        playbackMode={playbackMode}
        options={options}
        position={position}
        onViewModeChange={async nextMode => {
          setViewMode(nextMode);
          await onSaveSettings({ mushaf_view_mode: nextMode });
        }}
        onOptionsChange={async nextOptions => {
          setOptions(nextOptions);
          await onSaveSettings({
            mushaf_tajweed_enabled: nextOptions.tajweedEnabled,
            mushaf_mutashabihat_enabled: nextOptions.mutashabihatEnabled,
            mushaf_follow_playback_enabled: nextOptions.followPlayback,
          });
        }}
        onJumpToPage={page => {
          const targetPage = clamp(page, 1, 604);
          const firstAyah = getAyahsForPage(targetPage)[0];
          setViewMode('page');
          setPosition(prev => ({ ...prev, page: targetPage, surah: firstAyah?.surah ?? prev.surah, ayah: firstAyah?.ayah ?? prev.ayah }));
        }}
        onJumpToJuz={juz => {
          const firstSurah = getSurahsByJuz(clamp(juz, 1, 30))[0];
          if (!firstSurah) return;
          setViewMode('ayah');
          setPosition(prev => ({ ...prev, surah: firstSurah.number, ayah: 1, page: findMostRelevantPageForSurah(firstSurah.number) }));
        }}
        onReset={() => {
          setViewMode('page');
          setPosition(initialPosition);
          setSelectedReciterId(DEFAULT_RECITER_ID);
          setPlaybackMode('single_ayah');
          setPlaybackRate(1);
          setOptions({ tajweedEnabled: true, mutashabihatEnabled: false, followPlayback: true });
          setRange(null);
          setSelection({ activeAyah: null, range: null });
        }}
      />

      <MushafReader
        viewMode={viewMode}
        position={position}
        options={options}
        activePlaybackAyah={activePlaybackAyah}
        scrollTop={viewMode === 'page' ? scrollState.page : scrollState.ayah}
        scrollRestoreKey={viewMode}
        onPositionChange={setPosition}
        onPlayAyah={handlePlayAyah}
        onRangeChange={setRange}
        onSelectionChange={setSelection}
        onScrollPositionChange={next => setScrollState(prev => viewMode === 'page' ? { ...prev, page: next } : { ...prev, ayah: next })}
      />

      <ReciterSelector reciters={QURAN_RECITER_CATALOG} selectedReciterId={selectedReciter.id} onReciterChange={handleReciterChange} />

      <div className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">Ayah Quick Actions</p>
          <p className="text-xs text-white/55">{selection.activeAyah ? `${selection.activeAyah.surah}:${selection.activeAyah.ayah}` : 'Select an ayah'}</p>
        </div>
        {selection.activeAyah ? (
          <>
            <button
              type="button"
              onClick={handleEnqueueReview}
              className="rounded-lg border border-cyan-300/40 bg-cyan-400/10 px-3 py-1.5 text-xs text-cyan-100"
            >
              Add to Due Reviews
            </button>
            <div className="flex flex-wrap gap-2">
              {MISTAKE_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleLogMistake(type)}
                  className="rounded-md border border-white/15 px-2 py-1 text-[11px] text-white/80 transition hover:border-amber-300/40 hover:text-amber-100"
                >
                  {MISTAKE_LABELS[type]}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="text-xs text-white/50">Tap an ayah, then log a mistake type or enqueue spaced review.</p>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <p className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.16em] text-white/40">
            <Flame className="h-3.5 w-3.5 text-amber-300/80" />
            Weak Ayat
          </p>
          {loadingDashboard && <p className="text-xs text-white/45">Refreshing analytics...</p>}
          {!dashboard.weakAyat.length && !loadingDashboard && <p className="text-xs text-white/50">No weak ayat yet. Mistake logs will populate this.</p>}
          {dashboard.weakAyat.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-md border border-white/10 bg-black/15 p-2">
                <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">Today&apos;s Weak Ayat</p>
                {weakToday.length ? weakToday.map(item => <p key={`today-${item.verse_key}`} className="mt-1 text-xs text-white/80">{item.verse_key}</p>) : <p className="mt-1 text-xs text-white/50">No events today.</p>}
              </div>
              <div className="rounded-md border border-white/10 bg-black/15 p-2">
                <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">Weak Ayat in Juz 30</p>
                {weakJuz30.length ? weakJuz30.map(item => <p key={`juz30-${item.verse_key}`} className="mt-1 text-xs text-white/80">{item.verse_key}</p>) : <p className="mt-1 text-xs text-white/50">No Juz 30 weak ayat yet.</p>}
              </div>
              <div className="rounded-md border border-white/10 bg-black/15 p-2">
                <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">Most Confused</p>
                {weakMostConfused.length ? weakMostConfused.map(item => <p key={`confused-${item.verse_key}`} className="mt-1 text-xs text-white/80">{item.verse_key}</p>) : <p className="mt-1 text-xs text-white/50">No confusion data.</p>}
              </div>
              <div className="rounded-md border border-white/10 bg-black/15 p-2">
                <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">Last 7 Days Mistakes</p>
                {weakLast7.length ? weakLast7.map(item => <p key={`w7-${item.verse_key}`} className="mt-1 text-xs text-white/80">{item.verse_key}</p>) : <p className="mt-1 text-xs text-white/50">No recent mistakes.</p>}
              </div>
            </div>
          )}
        </div>
        <div className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <p className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.16em] text-white/40">
            <TrendingUp className="h-3.5 w-3.5 text-cyan-300/90" />
            Due Reviews & Stats
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md border border-white/10 bg-black/15 p-2">
              <p className="text-[11px] text-white/45">Weekly sessions</p>
              <p className="text-sm font-semibold text-white">{dashboard.stats.weekly_sessions}</p>
            </div>
            <div className="rounded-md border border-white/10 bg-black/15 p-2">
              <p className="text-[11px] text-white/45">Monthly minutes</p>
              <p className="text-sm font-semibold text-white">{dashboard.stats.monthly_minutes}</p>
            </div>
            <div className="rounded-md border border-white/10 bg-black/15 p-2">
              <p className="text-[11px] text-white/45">Streak</p>
              <p className="text-sm font-semibold text-white">{dashboard.stats.streak_days}d</p>
            </div>
            <div className="rounded-md border border-white/10 bg-black/15 p-2">
              <p className="text-[11px] text-white/45">Trend</p>
              <p className={`text-sm font-semibold ${dashboard.stats.improvement_trend >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{dashboard.stats.improvement_trend}%</p>
            </div>
          </div>
          <div className="space-y-2">
            {dashboard.dueReviews.slice(0, 6).map(card => (
              <div key={card.id} className="rounded-md border border-white/10 bg-black/15 p-2">
                <p className="text-xs text-white/80">{card.surah_number}:{card.start_ayah}-{card.end_ayah}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {[0, 1, 2, 3, 4, 5].map(grade => (
                    <button
                      key={`${card.id}-${grade}`}
                      type="button"
                      onClick={() => handleGradeReview(card.id, grade)}
                      className="rounded border border-white/15 px-1.5 py-0.5 text-[10px] text-white/75 hover:border-cyan-300/45 hover:text-cyan-100"
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {!dashboard.dueReviews.length && <p className="text-xs text-white/50">Nothing due today.</p>}
          </div>
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
        <p className="text-xs uppercase tracking-[0.16em] text-white/40">Review Playlists</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <select
            value={playlistType}
            onChange={event => setPlaylistType(event.target.value as typeof playlistType)}
            className="rounded-lg border border-white/[0.1] bg-black/20 px-2 py-2 text-xs text-white outline-none"
          >
            <option value="weak_ayat">Weak Ayat Playlist</option>
            <option value="juz">Juz Playlist</option>
            <option value="custom_range">Custom Range Playlist</option>
            <option value="mistake_replay">Mistake Replay Playlist</option>
            <option value="taraweeh_prep">Taraweeh Prep Mode</option>
          </select>
          {playlistType === 'juz' ? (
            <input
              type="number"
              min={1}
              max={30}
              value={playlistJuz}
              onChange={event => setPlaylistJuz(clamp(Number(event.target.value), 1, 30))}
              className="rounded-lg border border-white/[0.1] bg-black/20 px-2 py-2 text-xs text-white outline-none"
            />
          ) : (
            <div className="rounded-lg border border-white/[0.1] bg-black/10 px-2 py-2 text-xs text-white/45">No Juz filter</div>
          )}
          {playlistType === 'custom_range' ? (
            <div className="flex gap-1">
              <input
                type="number"
                min={1}
                max={114}
                value={customRange.surah}
                onChange={event => setCustomRange(prev => ({ ...prev, surah: clamp(Number(event.target.value), 1, 114) }))}
                className="w-1/3 rounded-lg border border-white/[0.1] bg-black/20 px-2 py-2 text-xs text-white outline-none"
              />
              <input
                type="number"
                min={1}
                value={customRange.startAyah}
                onChange={event => setCustomRange(prev => ({ ...prev, startAyah: Math.max(Number(event.target.value), 1) }))}
                className="w-1/3 rounded-lg border border-white/[0.1] bg-black/20 px-2 py-2 text-xs text-white outline-none"
              />
              <input
                type="number"
                min={1}
                value={customRange.endAyah}
                onChange={event => setCustomRange(prev => ({ ...prev, endAyah: Math.max(Number(event.target.value), prev.startAyah) }))}
                className="w-1/3 rounded-lg border border-white/[0.1] bg-black/20 px-2 py-2 text-xs text-white outline-none"
              />
            </div>
          ) : (
            <div className="rounded-lg border border-white/[0.1] bg-black/10 px-2 py-2 text-xs text-white/45">No custom range</div>
          )}
          <button
            type="button"
            onClick={loadPlaylist}
            disabled={!generatedPlaylist.length}
            className={`rounded-lg border px-3 py-2 text-xs ${generatedPlaylist.length ? 'border-cyan-300/40 bg-cyan-400/10 text-cyan-100' : 'border-white/[0.1] bg-black/10 text-white/45'}`}
          >
            Load ({generatedPlaylist.length})
          </button>
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
        <p className="text-xs uppercase tracking-[0.16em] text-white/40">Session Confidence</p>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={sessionConfidence}
            onChange={event => setSessionConfidence(Number(event.target.value))}
            className="w-full accent-cyan-300"
          />
          <p className="w-10 text-right text-xs text-cyan-100">{sessionConfidence}</p>
        </div>
      </div>

      <div className="md:hidden fixed bottom-3 left-3 right-3 z-20 rounded-xl border border-cyan-400/20 bg-slate-950/95 p-3 backdrop-blur">
        <PlaybackControls
          playbackMode={playbackMode}
          position={position}
          selectedReciter={selectedReciter}
          range={range}
          pageAyahs={pageAyahs}
          playlistAyahs={playlistAyahs}
          playbackRate={playbackRate}
          onPlaybackModeChange={setPlaybackMode}
          onPlaybackRateChange={setPlaybackRate}
          onActiveAyahChange={(surah, ayah) => {
            const matched = getAyah(surah, ayah);
            setActivePlaybackAyah({ surah, ayah });
            setPosition(prev => ({ ...prev, surah, ayah, page: matched?.page ?? prev.page }));
          }}
          onPlayStateChange={isPlaying => {
            if (isPlaying) void startSession();
            else void endSession();
          }}
          onLoopModeChange={(mode: MushafLoopMode) => {
            if (mode === 'off') return;
            setSessionLoopCounts(prev => {
              if (mode === 'track') return { ...prev, ayah: prev.ayah + 1 };
              if (playbackMode === 'surah') return { ...prev, surah: prev.surah + 1 };
              return { ...prev, range: prev.range + 1 };
            });
          }}
        />
      </div>

      <div className="hidden md:block">
        <PlaybackControls
          playbackMode={playbackMode}
          position={position}
          selectedReciter={selectedReciter}
          range={range}
          pageAyahs={viewMode === 'page' ? pageAyahs : activeSurahAyahs.map(item => ({ surah: item.surah, ayah: item.ayah }))}
          playlistAyahs={playlistAyahs}
          playbackRate={playbackRate}
          onPlaybackModeChange={setPlaybackMode}
          onPlaybackRateChange={setPlaybackRate}
          onActiveAyahChange={(surah, ayah) => {
            const matched = getAyah(surah, ayah);
            setActivePlaybackAyah({ surah, ayah });
            setPosition(prev => ({ ...prev, surah, ayah, page: matched?.page ?? prev.page }));
          }}
          onPlayStateChange={isPlaying => {
            if (isPlaying) void startSession();
            else void endSession();
          }}
          onLoopModeChange={(mode: MushafLoopMode) => {
            if (mode === 'off') return;
            setSessionLoopCounts(prev => {
              if (mode === 'track') return { ...prev, ayah: prev.ayah + 1 };
              if (playbackMode === 'surah') return { ...prev, surah: prev.surah + 1 };
              return { ...prev, range: prev.range + 1 };
            });
          }}
        />
      </div>
    </div>
  );
}
