'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  DEFAULT_RECITER_ID,
  QURAN_RECITER_CATALOG,
  getReciterById,
  type ReciterId,
} from '@/lib/quran-audio';
import { getAyahsForPage, getAyahsForSurah } from '@/lib/quran-text';
import type { NurProfile } from '@/lib/nur-types';
import { MushafReader } from './mushaf/MushafReader';
import { MushafToolbar } from './mushaf/MushafToolbar';
import { PlaybackControls } from './mushaf/PlaybackControls';
import { ReciterSelector } from './mushaf/ReciterSelector';
import type { AyahRange, MushafPlaybackMode, MushafPosition, MushafReaderOptions, MushafReaderSelection, MushafViewMode } from './mushaf/types';

const initialPosition: MushafPosition = { surah: 1, ayah: 1, page: 1 };

type MushafPanelProps = {
  profile: NurProfile;
  onSaveSettings: (updates: Partial<NurProfile>) => Promise<void>;
};

export function MushafPanel({ profile, onSaveSettings }: MushafPanelProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [viewMode, setViewMode] = useState<MushafViewMode>(profile.mushaf_view_mode ?? 'page');
  const [position, setPosition] = useState<MushafPosition>(initialPosition);
  const [selectedReciterId, setSelectedReciterId] = useState<ReciterId>(
    getReciterById(profile.selected_reciter_id).id,
  );
  const [playbackMode, setPlaybackMode] = useState<MushafPlaybackMode>('single_ayah');
  const [options, setOptions] = useState<MushafReaderOptions>({
    tajweedEnabled: profile.mushaf_tajweed_enabled ?? true,
    mutashabihatEnabled: profile.mushaf_mutashabihat_enabled ?? false,
  });
  const [range, setRange] = useState<AyahRange | null>(null);
  const [, setSelection] = useState<MushafReaderSelection>({ activeAyah: null, range: null });

  useEffect(() => {
    setSelectedReciterId(getReciterById(profile.selected_reciter_id).id);
  }, [profile.selected_reciter_id]);

  useEffect(() => {
    setViewMode(profile.mushaf_view_mode ?? 'page');
    setOptions({
      tajweedEnabled: profile.mushaf_tajweed_enabled ?? true,
      mutashabihatEnabled: profile.mushaf_mutashabihat_enabled ?? false,
    });
  }, [profile.mushaf_mutashabihat_enabled, profile.mushaf_tajweed_enabled, profile.mushaf_view_mode]);

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

  const selectedReciter = useMemo(() => getReciterById(selectedReciterId), [selectedReciterId]);

  const handleReciterChange = async (reciterId: string) => {
    const nextReciter = getReciterById(reciterId).id;
    setSelectedReciterId(nextReciter);
    await onSaveSettings({ selected_reciter_id: nextReciter });
  };

  const handleReset = () => {
    setViewMode('page');
    setPosition(initialPosition);
    setSelectedReciterId(DEFAULT_RECITER_ID);
    setPlaybackMode('single_ayah');
    setOptions({ tajweedEnabled: true, mutashabihatEnabled: false });
    setRange(null);
  };

  const pageAyahs = useMemo(() => getAyahsForPage(position.page).map(item => ({ surah: item.surah, ayah: item.ayah })), [position.page]);

  const handlePlayAyah = (surah: number, ayah: number) => {
    setPosition(prev => ({ ...prev, surah, ayah }));
    setPlaybackMode('single_ayah');
    setRange(null);
  };

  const activeSurahAyahs = getAyahsForSurah(position.surah);

  return (
    <div className="glass-panel space-y-4 p-4 pb-24 text-white md:p-6 md:pb-6">
      <div>
        <p className="eyebrow text-cyan-300/60">Read & Listen</p>
        <h3 className="mt-1 text-lg font-headline font-semibold">Native Mushaf & Reciters</h3>
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
          });
        }}
        onReset={handleReset}
      />

      <MushafReader
        viewMode={viewMode}
        position={position}
        options={options}
        onPositionChange={setPosition}
        onPlayAyah={handlePlayAyah}
        onRangeChange={setRange}
        onSelectionChange={setSelection}
      />

      <ReciterSelector
        reciters={QURAN_RECITER_CATALOG}
        selectedReciterId={selectedReciter.id}
        onReciterChange={handleReciterChange}
      />

      <div className="md:hidden fixed bottom-3 left-3 right-3 z-20 rounded-xl border border-cyan-400/20 bg-slate-950/95 p-3 backdrop-blur">
        <PlaybackControls
          playbackMode={playbackMode}
          position={position}
          selectedReciter={selectedReciter}
          range={range}
          pageAyahs={pageAyahs}
          onPlaybackModeChange={setPlaybackMode}
        />
      </div>

      <div className="hidden md:block">
        <PlaybackControls
          playbackMode={playbackMode}
          position={position}
          selectedReciter={selectedReciter}
          range={range}
          pageAyahs={viewMode === 'page' ? pageAyahs : activeSurahAyahs.map(item => ({ surah: item.surah, ayah: item.ayah }))}
          onPlaybackModeChange={setPlaybackMode}
        />
      </div>
    </div>
  );
}
