'use client';

import { useState } from 'react';
import { BookOpen, Clock, Target, Sparkles, ChevronRight, ChevronLeft, Sun, Moon, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { surahs } from '@/lib/quran-data';
import type { SetupWizardData, TrackType, DayEndSetting, QuranUnit } from '@/lib/nur-types';
import { TRACK_LABELS, UNIT_LABELS } from '@/lib/nur-types';

type SetupWizardProps = {
  onComplete: (data: SetupWizardData) => void;
  isSubmitting?: boolean;
};

const steps = [
  { title: 'Your Path', icon: BookOpen, description: 'Choose your Quran journey type(s)' },
  { title: 'Tracking Unit', icon: Ruler, description: 'How do you want to measure progress?' },
  { title: 'Starting Point', icon: Target, description: 'Where will you begin?' },
  { title: 'Daily Goals', icon: Sparkles, description: 'Set your pace' },
  { title: 'Day Settings', icon: Clock, description: 'Customize your schedule' },
];

const trackOptions: { type: TrackType; label: string; desc: string }[] = [
  { type: 'memorization', label: 'Memorization (Hifz)', desc: 'Memorize new portions of the Quran with structured daily assignments and revision cycles.' },
  { type: 'revision', label: "Revision (Muraja'ah)", desc: 'Strengthen and maintain what you have already memorized through systematic review.' },
  { type: 'recitation', label: 'Recitation (Tilawah)', desc: 'Read through the Quran at your own pace, tracking progress day by day.' },
];

const unitOptions: { unit: QuranUnit; label: string; desc: string }[] = [
  { unit: 'ayah', label: 'Ayahs (Verses)', desc: 'Track individual verses — the most precise way to measure your progress.' },
  { unit: 'page', label: 'Pages (Mushaf)', desc: 'Track by Mushaf page (1–604). Great for revision and recitation.' },
  { unit: 'surah', label: 'Surahs', desc: 'Track by complete surah. Best for recitation or surah-by-surah memorization.' },
  { unit: 'juz', label: 'Juz (30 parts)', desc: "Track by juz — each juz is roughly 20 pages of the Qur'an." },
  { unit: 'hizb', label: 'Hizb (60 halves)', desc: 'Track by hizb — each juz is split into two ahzab.' },
  { unit: 'ruba', label: "Rub' al-Hizb (quarters)", desc: "Track by rub' — each hizb is split into four quarters (240 total)." },
];

export function SetupWizard({ onComplete, isSubmitting }: SetupWizardProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<SetupWizardData>({
    trackTypes: ['memorization'],
    preferredUnit: 'ayah',
    dayEndSetting: 'midnight',
    fajrTime: '05:30',
    startSurah: 1,
    startAyah: 1,
    dailyNewAmount: 5,
    dailyRevisionAmount: 2,
    preferredTime: '06:00',
    reminderEnabled: true,
  });

  const update = <K extends keyof SetupWizardData>(key: K, val: SetupWizardData[K]) => {
    setData(prev => ({ ...prev, [key]: val }));
  };

  const toggleTrackType = (type: TrackType) => {
    setData(prev => {
      const has = prev.trackTypes.includes(type);
      if (has && prev.trackTypes.length === 1) return prev; // must keep at least one
      return {
        ...prev,
        trackTypes: has
          ? prev.trackTypes.filter(t => t !== type)
          : [...prev.trackTypes, type],
      };
    });
  };

  const canNext = () => {
    if (step === 0) return data.trackTypes.length > 0;
    if (step === 1) return true; // unit always has a default
    if (step === 2) return data.startSurah >= 1 && data.startSurah <= 114;
    if (step === 3) return data.dailyNewAmount > 0;
    return true;
  };

  const handleFinish = () => {
    onComplete(data);
  };

  /** Dynamic label for the daily amount field based on selected unit */
  const amountLabel = () => {
    const unit = UNIT_LABELS[data.preferredUnit].toLowerCase();
    if (data.trackTypes.includes('memorization')) return `New ${unit} per day`;
    if (data.trackTypes.includes('revision')) return `${UNIT_LABELS[data.preferredUnit]} to revise per day`;
    return `${UNIT_LABELS[data.preferredUnit]} to recite per day`;
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isComplete = i < step;
            return (
              <div key={s.title} className="flex flex-col items-center gap-1.5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ${
                  isActive
                    ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                    : isComplete
                    ? 'border-cyan-400/20 bg-cyan-400/5 text-cyan-400/60'
                    : 'border-white/10 bg-white/[0.02] text-white/30'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`text-[0.65rem] font-medium hidden sm:block ${isActive ? 'text-cyan-300' : 'text-white/40'}`}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
        <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="glass-panel-glow space-y-6 p-8 text-white min-h-[360px]">
        <div>
          <p className="eyebrow mb-2">{steps[step].description}</p>
          <h2 className="text-2xl font-headline font-semibold">{steps[step].title}</h2>
        </div>

        {/* ── Step 0: Track Types (multi-select) ── */}
        {step === 0 && (
          <div className="space-y-3">
            <p className="text-xs text-white/40">Select one or more — you can always change this later.</p>
            {trackOptions.map(opt => {
              const selected = data.trackTypes.includes(opt.type);
              return (
                <button
                  key={opt.type}
                  onClick={() => toggleTrackType(opt.type)}
                  className={`w-full rounded-xl border p-4 text-left transition-all duration-200 ${
                    selected
                      ? 'border-cyan-400/30 bg-cyan-400/[0.06] shadow-[0_0_20px_rgba(56,189,248,0.08)]'
                      : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <div className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${
                      selected
                        ? 'border-cyan-400/50 bg-cyan-400/20 text-cyan-300'
                        : 'border-white/20 bg-white/5'
                    }`}>
                      {selected && (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-white/50 mt-1">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Step 1: Quran Unit ── */}
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-xs text-white/40">How do you want to measure your daily progress?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {unitOptions.map(opt => (
                <button
                  key={opt.unit}
                  onClick={() => update('preferredUnit', opt.unit)}
                  className={`rounded-xl border p-4 text-left transition-all duration-200 ${
                    data.preferredUnit === opt.unit
                      ? 'border-cyan-400/30 bg-cyan-400/[0.06] shadow-[0_0_20px_rgba(56,189,248,0.08)]'
                      : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                  }`}
                >
                  <p className="font-semibold text-sm">{opt.label}</p>
                  <p className="text-xs text-white/50 mt-1">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Starting Point ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label className="text-white/70 text-sm">Starting Surah</Label>
              <select
                value={data.startSurah}
                onChange={e => update('startSurah', Number(e.target.value))}
                className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white focus:border-cyan-400/30 focus:outline-none focus:ring-1 focus:ring-cyan-400/20"
              >
                {surahs.map(s => (
                  <option key={s.number} value={s.number} className="bg-[hsl(220,20%,8%)]">
                    {s.number}. {s.name} ({s.nameArabic}) - {s.verses} ayat
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-white/70 text-sm">Starting Ayah</Label>
              <Input
                type="number"
                min={1}
                max={surahs.find(s => s.number === data.startSurah)?.verses ?? 1}
                value={data.startAyah}
                onChange={e => update('startAyah', Number(e.target.value))}
                className="mt-1.5 border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/30"
              />
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <p className="text-xs text-white/50">
                {data.trackTypes.includes('memorization')
                  ? 'This is where your new memorization will begin. Your daily schedule will generate from this point forward.'
                  : data.trackTypes.includes('revision')
                  ? 'This is the starting point for your revision cycle. The schedule will loop through from here.'
                  : 'You will begin your daily recitation from this surah and ayah.'}
              </p>
            </div>
          </div>
        )}

        {/* ── Step 3: Daily Goals ── */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label className="text-white/70 text-sm">{amountLabel()}</Label>
              <Input
                type="number"
                min={1}
                max={300}
                value={data.dailyNewAmount}
                onChange={e => update('dailyNewAmount', Number(e.target.value))}
                className="mt-1.5 border-white/[0.08] bg-white/[0.04] text-white"
              />
            </div>
            {data.trackTypes.includes('memorization') && (
              <div>
                <Label className="text-white/70 text-sm">
                  Revision {UNIT_LABELS[data.preferredUnit].toLowerCase()} per day
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={data.dailyRevisionAmount}
                  onChange={e => update('dailyRevisionAmount', Number(e.target.value))}
                  className="mt-1.5 border-white/[0.08] bg-white/[0.04] text-white"
                />
              </div>
            )}
            <div>
              <Label className="text-white/70 text-sm">Preferred study time</Label>
              <Input
                type="time"
                value={data.preferredTime}
                onChange={e => update('preferredTime', e.target.value)}
                className="mt-1.5 border-white/[0.08] bg-white/[0.04] text-white"
              />
            </div>
            {data.preferredUnit === 'ayah' && (
              <div className="rounded-lg border border-cyan-400/10 bg-cyan-400/[0.03] p-3">
                <p className="text-xs text-cyan-200/60">
                  At this pace, you&apos;ll complete a full cycle in approximately{' '}
                  <strong className="text-cyan-300">
                    {Math.ceil(6236 / (data.dailyNewAmount || 1))} days
                  </strong>
                  {' '}({Math.ceil(6236 / (data.dailyNewAmount || 1) / 30)} months).
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Step 4: Day Settings ── */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <Label className="text-white/70 text-sm mb-3 block">When does your day end?</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => update('dayEndSetting', 'midnight')}
                  className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${
                    data.dayEndSetting === 'midnight'
                      ? 'border-cyan-400/30 bg-cyan-400/[0.06]'
                      : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                  }`}
                >
                  <Moon className="h-5 w-5 text-cyan-300/70" />
                  <div className="text-left">
                    <p className="text-sm font-semibold">Midnight</p>
                    <p className="text-[0.65rem] text-white/40">12:00 AM</p>
                  </div>
                </button>
                <button
                  onClick={() => update('dayEndSetting', 'fajr')}
                  className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${
                    data.dayEndSetting === 'fajr'
                      ? 'border-cyan-400/30 bg-cyan-400/[0.06]'
                      : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                  }`}
                >
                  <Sun className="h-5 w-5 text-amber-300/70" />
                  <div className="text-left">
                    <p className="text-sm font-semibold">Fajr time</p>
                    <p className="text-[0.65rem] text-white/40">Until next Fajr</p>
                  </div>
                </button>
              </div>
            </div>
            {data.dayEndSetting === 'fajr' && (
              <div>
                <Label className="text-white/70 text-sm">Fajr time (approximate)</Label>
                <Input
                  type="time"
                  value={data.fajrTime}
                  onChange={e => update('fajrTime', e.target.value)}
                  className="mt-1.5 border-white/[0.08] bg-white/[0.04] text-white"
                />
              </div>
            )}
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <input
                type="checkbox"
                checked={data.reminderEnabled}
                onChange={e => update('reminderEnabled', e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/5"
              />
              <div>
                <p className="text-sm font-medium">Enable crossover</p>
                <p className="text-xs text-white/50">Incomplete tasks carry over to the next day automatically</p>
              </div>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <p className="text-xs text-white/50">
                {data.dayEndSetting === 'fajr'
                  ? 'Your day will reset at Fajr time. Tasks completed after midnight but before Fajr will count for the previous day.'
                  : 'Your day will reset at midnight. Any incomplete tasks will carry over if crossover is enabled.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Summary before finish */}
      {step === steps.length - 1 && (
        <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-white">
          <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Summary</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-white/50">
            <span>Track types</span>
            <span className="text-white/80">{data.trackTypes.map(t => TRACK_LABELS[t]).join(', ')}</span>
            <span>Measuring in</span>
            <span className="text-white/80">{UNIT_LABELS[data.preferredUnit]}</span>
            <span>Daily target</span>
            <span className="text-white/80">{data.dailyNewAmount} {UNIT_LABELS[data.preferredUnit].toLowerCase()}/day</span>
            <span>Day boundary</span>
            <span className="text-white/80 capitalize">{data.dayEndSetting}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          className="text-white/60 hover:text-white"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>

        {step < steps.length - 1 ? (
          <Button
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext()}
            className="bg-cyan-500/20 text-cyan-200 border border-cyan-400/20 hover:bg-cyan-500/30 hover:border-cyan-400/30"
          >
            Continue
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleFinish}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-cyan-500/30 to-cyan-400/20 text-cyan-200 border border-cyan-400/25 hover:from-cyan-500/40 hover:to-cyan-400/30 shadow-[0_0_20px_rgba(56,189,248,0.15)]"
          >
            {isSubmitting ? 'Setting up...' : 'Begin Your Journey'}
            <Sparkles className="ml-1.5 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
