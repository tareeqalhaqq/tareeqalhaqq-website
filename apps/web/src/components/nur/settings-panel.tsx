'use client';

import { useEffect, useState } from 'react';
import { Settings, Save, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { NurProfile, TrackType, DayEndSetting, QuranUnit } from '@/lib/nur-types';
import { TRACK_LABELS, UNIT_LABELS } from '@/lib/nur-types';

type SettingsPanelProps = {
  profile: NurProfile;
  onSave: (updates: Partial<NurProfile>) => void;
  isSaving?: boolean;
};

const allTrackTypes: TrackType[] = ['memorization', 'revision', 'recitation'];
const allUnits: QuranUnit[] = ['ayah', 'page', 'surah', 'juz', 'hizb', 'ruba'];

export function SettingsPanel({ profile, onSave, isSaving }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [trackTypes, setTrackTypes] = useState<TrackType[]>(profile.track_types);
  const [preferredUnit, setPreferredUnit] = useState<QuranUnit>(profile.preferred_unit);
  const [dayEnd, setDayEnd] = useState<DayEndSetting>(profile.day_end_setting);
  const [fajrTime, setFajrTime] = useState(profile.fajr_time ?? '05:30');
  const [dailyNew, setDailyNew] = useState(profile.daily_new_amount);
  const [dailyRevision, setDailyRevision] = useState(profile.daily_revision_amount);
  const [preferredTime, setPreferredTime] = useState(profile.preferred_time ?? '06:00');
  const [noPreferredTime, setNoPreferredTime] = useState(!profile.preferred_time);
  const [reminderEnabled, setReminderEnabled] = useState(profile.reminder_enabled);


  useEffect(() => {
    if (noPreferredTime) {
      setPreferredTime('06:00');
    }
  }, [noPreferredTime]);
  const toggleTrack = (type: TrackType) => {
    setTrackTypes(prev => {
      const has = prev.includes(type);
      if (has && prev.length === 1) return prev;
      return has ? prev.filter(t => t !== type) : [...prev, type];
    });
  };

  const handleSave = () => {
    onSave({
      track_types: trackTypes,
      preferred_unit: preferredUnit,
      day_end_setting: dayEnd,
      fajr_time: fajrTime,
      daily_new_amount: dailyNew,
      daily_revision_amount: dailyRevision,
      preferred_time: noPreferredTime ? null : preferredTime,
      reminder_enabled: reminderEnabled,
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm text-white/50 hover:text-white/70 transition-colors"
      >
        <Settings className="h-4 w-4" />
        Settings
      </button>
    );
  }

  return (
    <div className="glass-panel space-y-4 p-6 text-white">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-headline font-semibold">Settings</h3>
        <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white text-sm">
          Close
        </button>
      </div>

      <div className="space-y-4">
        {/* Track types (multi-select) */}
        <div>
          <Label className="text-white/70 text-sm mb-2 block">Track Types</Label>
          <div className="flex flex-wrap gap-2">
            {allTrackTypes.map(type => {
              const selected = trackTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleTrack(type)}
                  className={`rounded-lg border px-3 py-1.5 text-xs transition-all ${
                    selected
                      ? 'border-cyan-400/30 bg-cyan-400/[0.08] text-cyan-200'
                      : 'border-white/[0.06] bg-white/[0.02] text-white/50 hover:border-white/[0.12]'
                  }`}
                >
                  {TRACK_LABELS[type]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferred unit */}
        <div>
          <Label className="text-white/70 text-sm">Tracking Unit</Label>
          <select
            value={preferredUnit}
            onChange={e => setPreferredUnit(e.target.value as QuranUnit)}
            className="mt-1 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white"
          >
            {allUnits.map(u => (
              <option key={u} value={u} className="bg-[hsl(220,20%,8%)]">
                {UNIT_LABELS[u]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label className="text-white/70 text-sm">
            Daily new {UNIT_LABELS[preferredUnit].toLowerCase()}
          </Label>
          <Input
            type="number"
            min={1}
            max={300}
            value={dailyNew}
            onChange={e => setDailyNew(Number(e.target.value))}
            className="mt-1 border-white/[0.08] bg-white/[0.04] text-white"
          />
        </div>

        {trackTypes.includes('memorization') && (
          <div>
            <Label className="text-white/70 text-sm">
              Revision {UNIT_LABELS[preferredUnit].toLowerCase()} per day
            </Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={dailyRevision}
              onChange={e => setDailyRevision(Number(e.target.value))}
              className="mt-1 border-white/[0.08] bg-white/[0.04] text-white"
            />
          </div>
        )}

        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="mb-2 flex items-center justify-between">
            <Label className="text-white/70 text-sm">Preferred study time</Label>
            <button
              type="button"
              onClick={() => setNoPreferredTime(prev => !prev)}
              className={`rounded-md border px-2 py-1 text-[0.65rem] transition ${
                noPreferredTime
                  ? 'border-cyan-400/30 bg-cyan-400/[0.06] text-cyan-200'
                  : 'border-white/[0.08] text-white/60 hover:text-white/80'
              }`}
            >
              {noPreferredTime ? 'No preferred time selected' : 'Set no preferred time'}
            </button>
          </div>
          <Input
            type="time"
            value={preferredTime}
            disabled={noPreferredTime}
            onChange={e => setPreferredTime(e.target.value)}
            className="mt-1 border-white/[0.08] bg-white/[0.04] text-white disabled:opacity-50"
          />
        </div>

        <div>
          <Label className="text-white/70 text-sm mb-2 block">Day ends at</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDayEnd('midnight')}
              className={`flex items-center gap-2 rounded-lg border p-3 text-xs transition-all ${
                dayEnd === 'midnight'
                  ? 'border-cyan-400/30 bg-cyan-400/[0.06]'
                  : 'border-white/[0.06] bg-white/[0.02]'
              }`}
            >
              <Moon className="h-4 w-4" /> Midnight
            </button>
            <button
              onClick={() => setDayEnd('fajr')}
              className={`flex items-center gap-2 rounded-lg border p-3 text-xs transition-all ${
                dayEnd === 'fajr'
                  ? 'border-cyan-400/30 bg-cyan-400/[0.06]'
                  : 'border-white/[0.06] bg-white/[0.02]'
              }`}
            >
              <Sun className="h-4 w-4" /> Fajr
            </button>
          </div>
        </div>

        {dayEnd === 'fajr' && (
          <div>
            <Label className="text-white/70 text-sm">Fajr time</Label>
            <Input
              type="time"
              value={fajrTime}
              onChange={e => setFajrTime(e.target.value)}
              className="mt-1 border-white/[0.08] bg-white/[0.04] text-white"
            />
          </div>
        )}

        <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
          <input
            type="checkbox"
            checked={reminderEnabled}
            onChange={e => setReminderEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-white/5"
          />
          <div>
            <p className="text-sm font-medium">Task crossover</p>
            <p className="text-xs text-white/40">Carry incomplete tasks to the next day</p>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/20 hover:bg-cyan-500/30"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
