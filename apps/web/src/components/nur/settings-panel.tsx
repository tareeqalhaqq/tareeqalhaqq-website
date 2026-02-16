'use client';

import { useState } from 'react';
import { Settings, Save, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { surahs } from '@/lib/quran-data';
import type { NurProfile, TrackType, DayEndSetting } from '@/lib/nur-types';

type SettingsPanelProps = {
  profile: NurProfile;
  onSave: (updates: Partial<NurProfile>) => void;
  isSaving?: boolean;
};

export function SettingsPanel({ profile, onSave, isSaving }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [trackType, setTrackType] = useState<TrackType>(profile.track_type);
  const [dayEnd, setDayEnd] = useState<DayEndSetting>(profile.day_end_setting);
  const [fajrTime, setFajrTime] = useState(profile.fajr_time ?? '05:30');
  const [dailyVerses, setDailyVerses] = useState(profile.daily_new_verses);
  const [revisionPages, setRevisionPages] = useState(profile.daily_revision_pages);
  const [preferredTime, setPreferredTime] = useState(profile.preferred_time ?? '06:00');
  const [reminderEnabled, setReminderEnabled] = useState(profile.reminder_enabled);

  const handleSave = () => {
    onSave({
      track_type: trackType,
      day_end_setting: dayEnd,
      fajr_time: fajrTime,
      daily_new_verses: dailyVerses,
      daily_revision_pages: revisionPages,
      preferred_time: preferredTime,
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
        <div>
          <Label className="text-white/70 text-sm">Track Type</Label>
          <select
            value={trackType}
            onChange={e => setTrackType(e.target.value as TrackType)}
            className="mt-1 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white"
          >
            <option value="memorization" className="bg-[hsl(220,20%,8%)]">Memorization (Hifz)</option>
            <option value="revision" className="bg-[hsl(220,20%,8%)]">Revision (Muraja&apos;ah)</option>
            <option value="recitation" className="bg-[hsl(220,20%,8%)]">Recitation (Tilawah)</option>
          </select>
        </div>

        <div>
          <Label className="text-white/70 text-sm">Daily new verses</Label>
          <Input
            type="number"
            min={1}
            max={50}
            value={dailyVerses}
            onChange={e => setDailyVerses(Number(e.target.value))}
            className="mt-1 border-white/[0.08] bg-white/[0.04] text-white"
          />
        </div>

        {trackType === 'memorization' && (
          <div>
            <Label className="text-white/70 text-sm">Revision pages per day</Label>
            <Input
              type="number"
              min={0}
              max={30}
              value={revisionPages}
              onChange={e => setRevisionPages(Number(e.target.value))}
              className="mt-1 border-white/[0.08] bg-white/[0.04] text-white"
            />
          </div>
        )}

        <div>
          <Label className="text-white/70 text-sm">Preferred study time</Label>
          <Input
            type="time"
            value={preferredTime}
            onChange={e => setPreferredTime(e.target.value)}
            className="mt-1 border-white/[0.08] bg-white/[0.04] text-white"
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
