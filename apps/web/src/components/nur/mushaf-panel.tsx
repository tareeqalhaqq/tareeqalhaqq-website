'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_RECITER_ID,
  QURAN_RECITER_CATALOG,
  getReciterById,
  type ReciterId,
} from '@/lib/quran-audio';
import type { NurProfile } from '@/lib/nur-types';
import { MushafReader } from './mushaf/MushafReader';
import { MushafToolbar } from './mushaf/MushafToolbar';
import { PlaybackControls } from './mushaf/PlaybackControls';
import { ReciterSelector } from './mushaf/ReciterSelector';
import type { MushafPlaybackMode, MushafPosition, MushafViewMode } from './mushaf/types';

const initialPosition: MushafPosition = { surah: 1, ayah: 1, page: 1 };

type MushafPanelProps = {
  profile: NurProfile;
  onSaveSettings: (updates: Partial<NurProfile>) => Promise<void>;
};

export function MushafPanel({ profile, onSaveSettings }: MushafPanelProps) {
  const [viewMode, setViewMode] = useState<MushafViewMode>('page');
  const [position, setPosition] = useState<MushafPosition>(initialPosition);
  const [selectedReciterId, setSelectedReciterId] = useState<ReciterId>(
    getReciterById(profile.selected_reciter_id).id,
  );
  const [playbackMode, setPlaybackMode] = useState<MushafPlaybackMode>('single_ayah');

  useEffect(() => {
    setSelectedReciterId(getReciterById(profile.selected_reciter_id).id);
  }, [profile.selected_reciter_id]);

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
  };

  return (
    <div className="glass-panel space-y-4 p-6 text-white">
      <div>
        <p className="eyebrow text-cyan-300/60">Read & Listen</p>
        <h3 className="mt-1 text-lg font-headline font-semibold">Mushaf & Reciters</h3>
      </div>

      <MushafToolbar
        viewMode={viewMode}
        playbackMode={playbackMode}
        position={position}
        onViewModeChange={setViewMode}
        onReset={handleReset}
      />

      <MushafReader
        viewMode={viewMode}
        position={position}
        onPositionChange={setPosition}
      />

      <ReciterSelector
        reciters={QURAN_RECITER_CATALOG}
        selectedReciterId={selectedReciter.id}
        onReciterChange={handleReciterChange}
      />

      <PlaybackControls
        playbackMode={playbackMode}
        position={position}
        selectedReciter={selectedReciter}
        onPlaybackModeChange={setPlaybackMode}
      />
    </div>
  );
}
