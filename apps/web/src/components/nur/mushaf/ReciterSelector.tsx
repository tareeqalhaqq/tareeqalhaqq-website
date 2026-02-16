'use client';

import { Headphones } from 'lucide-react';
import type { Reciter } from './types';

type ReciterSelectorProps = {
  reciters: readonly Reciter[];
  selectedReciterId: string;
  onReciterChange: (reciterId: string) => void;
};

export function ReciterSelector({ reciters, selectedReciterId, onReciterChange }: ReciterSelectorProps) {
  return (
    <div className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-white/40">Reciter</p>
      <label className="flex items-center gap-2 rounded-lg border border-white/[0.1] bg-black/20 px-3 py-2 text-sm text-white/85">
        <Headphones className="h-4 w-4 text-cyan-300/80" />
        <select
          value={selectedReciterId}
          onChange={event => onReciterChange(event.target.value)}
          className="w-full bg-transparent text-sm text-white outline-none"
        >
          {reciters.map(reciter => (
            <option key={reciter.id} value={reciter.id} className="bg-slate-900 text-white">
              {reciter.displayName} ({reciter.bitrateKbps}kbps)
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
