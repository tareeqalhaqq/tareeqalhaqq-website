'use client';

import { useMemo, useState } from 'react';
import { MushafReader } from './mushaf/MushafReader';
import { MushafToolbar } from './mushaf/MushafToolbar';
import { PlaybackControls } from './mushaf/PlaybackControls';
import { ReciterSelector } from './mushaf/ReciterSelector';
import type { MushafPlaybackMode, MushafPosition, MushafViewMode, Reciter } from './mushaf/types';

const reciters: Reciter[] = [
  { id: 'husary', name: 'Sheikh Al Hussary', baseUrl: 'https://everyayah.com/data/Husary_64kbps/' },
  { id: 'minshawi', name: 'Sheikh Al Minshawi', baseUrl: 'https://everyayah.com/data/Minshawy_Murattal_128kbps/' },
  { id: 'abdul-basit', name: 'Sheikh Abdul Basit', baseUrl: 'https://everyayah.com/data/Abdul_Basit_Murattal_64kbps/' },
  { id: 'ahmed-neana', name: 'Sheikh Ahmed Al Nufais', baseUrl: 'https://everyayah.com/data/Ahmed_Neana_32kbps/' },
];

const initialPosition: MushafPosition = { surah: 1, ayah: 1, page: 1 };

export function MushafPanel() {
  const [viewMode, setViewMode] = useState<MushafViewMode>('page');
  const [position, setPosition] = useState<MushafPosition>(initialPosition);
  const [selectedReciterId, setSelectedReciterId] = useState(reciters[0].id);
  const [playbackMode, setPlaybackMode] = useState<MushafPlaybackMode>('single_ayah');

  const selectedReciter = useMemo(
    () => reciters.find(reciter => reciter.id === selectedReciterId) ?? reciters[0],
    [selectedReciterId],
  );

  const handleReset = () => {
    setViewMode('page');
    setPosition(initialPosition);
    setSelectedReciterId(reciters[0].id);
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
        reciters={reciters}
        selectedReciterId={selectedReciter.id}
        onReciterChange={setSelectedReciterId}
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
