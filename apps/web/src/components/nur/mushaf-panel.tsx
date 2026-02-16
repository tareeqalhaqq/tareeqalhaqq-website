'use client';

import { BookMarked, ExternalLink, Headphones } from 'lucide-react';

const reciters = [
  { name: 'Sheikh Al Hussary', url: 'https://everyayah.com/data/Husary_64kbps/' },
  { name: 'Sheikh Al Minshawi', url: 'https://everyayah.com/data/Minshawy_Murattal_128kbps/' },
  { name: 'Sheikh Abdul Basit', url: 'https://everyayah.com/data/Abdul_Basit_Murattal_64kbps/' },
  { name: 'Sheikh Ahmed Al Nufais', url: 'https://everyayah.com/data/Ahmed_Neana_32kbps/' },
];

export function MushafPanel() {
  return (
    <div className="glass-panel space-y-4 p-6 text-white">
      <div>
        <p className="eyebrow text-cyan-300/60">Read & Listen</p>
        <h3 className="mt-1 text-lg font-headline font-semibold">Mushaf & Reciters</h3>
      </div>

      <a
        href="https://quran.com"
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between rounded-xl border border-cyan-400/20 bg-cyan-400/[0.04] p-4 transition hover:bg-cyan-400/[0.08]"
      >
        <div className="flex items-center gap-3">
          <BookMarked className="h-5 w-5 text-cyan-300" />
          <div>
            <p className="text-sm font-semibold">Open Mushaf</p>
            <p className="text-xs text-white/50">Read directly from Quran.com</p>
          </div>
        </div>
        <ExternalLink className="h-4 w-4 text-cyan-200/80" />
      </a>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.16em] text-white/40">Available reciters</p>
        {reciters.map(reciter => (
          <a
            key={reciter.name}
            href={reciter.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-sm transition hover:border-white/[0.14]"
          >
            <span className="flex items-center gap-2 text-white/85">
              <Headphones className="h-3.5 w-3.5 text-cyan-300/80" />
              {reciter.name}
            </span>
            <ExternalLink className="h-3.5 w-3.5 text-white/40" />
          </a>
        ))}
      </div>
    </div>
  );
}
