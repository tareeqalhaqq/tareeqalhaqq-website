'use client';

import { useEffect, useState, useCallback } from 'react';
import { BookOpen, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthProfile } from '@/hooks/use-auth-profile';
import { SetupWizard } from '@/components/nur/setup-wizard';
import { NurCalendar } from '@/components/nur/nur-calendar';
import { StatsOverview } from '@/components/nur/stats-overview';
import { GoalsPanel } from '@/components/nur/goals-panel';
import { AiAssistant } from '@/components/nur/ai-assistant';
import type { AiSuggestion } from '@/components/nur/ai-assistant';
import { SettingsPanel } from '@/components/nur/settings-panel';
import { DailyLog } from '@/components/nur/daily-log';
import { MushafPanel } from '@/components/nur/mushaf-panel';
import type { NurProfile, NurScheduleItem, NurGoal, NurDailyLog, SetupWizardData } from '@/lib/nur-types';
import Link from 'next/link';

type NurState = {
  profile: NurProfile | null;
  items: NurScheduleItem[];
  goals: NurGoal[];
  logs: NurDailyLog[];
  loading: boolean;
  error: string | null;
};

export default function NurTrackerClient() {
  const { status, user } = useAuthProfile();
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [state, setState] = useState<NurState>({
    profile: null,
    items: [],
    goals: [],
    logs: [],
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/nur');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setState({
        profile: data.profile,
        items: data.items ?? [],
        goals: data.goals ?? [],
        logs: data.logs ?? [],
        loading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: 'Failed to load data' }));
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, fetchData]);

  const handleSetupComplete = async (data: SetupWizardData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/nur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Setup failed');
      await fetchData();
    } catch {
      setState(prev => ({ ...prev, error: 'Setup failed. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (itemId: string, completed: boolean) => {
    // Optimistic update
    setState(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === itemId ? { ...i, completed, completed_at: completed ? new Date().toISOString() : null } : i),
    }));

    try {
      const res = await fetch('/api/nur/items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, completed }),
      });
      if (!res.ok) {
        // Revert on failure
        setState(prev => ({
          ...prev,
          items: prev.items.map(i => i.id === itemId ? { ...i, completed: !completed } : i),
        }));
      }
    } catch {
      setState(prev => ({
        ...prev,
        items: prev.items.map(i => i.id === itemId ? { ...i, completed: !completed } : i),
      }));
    }
  };

  const handleAddGoal = async (goal: Omit<NurGoal, 'id' | 'nur_profile_id' | 'progress' | 'completed' | 'completed_at' | 'created_at'>) => {
    try {
      const res = await fetch('/api/nur/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal),
      });
      if (!res.ok) throw new Error('Failed to create goal');
      const data = await res.json();
      setState(prev => ({
        ...prev,
        goals: [data.goal, ...prev.goals],
      }));
    } catch {
      // silent fail
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== goalId),
    }));
    try {
      await fetch(`/api/nur/goals?id=${goalId}`, { method: 'DELETE' });
    } catch {
      await fetchData();
    }
  };

  const handleSaveSettings = async (updates: Partial<NurProfile>) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/nur', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to save');
      const data = await res.json();
      setState(prev => ({ ...prev, profile: data.profile }));
    } catch {
      // silent fail
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLog = async (log: { date: string; day_rating: number | null; reflection: string | null }) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/nur/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      });
      if (!res.ok) throw new Error('Failed to save');
      const data = await res.json();
      setState(prev => ({
        ...prev,
        logs: prev.logs.some(l => l.date === log.date)
          ? prev.logs.map(l => l.date === log.date ? data.log : l)
          : [...prev.logs, data.log],
      }));
    } catch {
      // silent fail
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateMore = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/nur/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to generate');
      await fetchData();
    } catch {
      // silent fail
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplySuggestion = async (suggestion: AiSuggestion) => {
    if (suggestion.action?.dailyVerses) {
      await handleSaveSettings({ daily_new_amount: suggestion.action.dailyVerses });
    }
    if (suggestion.action?.goalTitle && suggestion.action?.goalType) {
      await handleAddGoal({
        title: suggestion.action.goalTitle,
        description: null,
        goal_type: suggestion.action.goalType,
        target_surah: suggestion.action.targetSurah ?? null,
        target_juz: null,
        target_hizb: null,
        target_ruba: null,
        target_page_start: null,
        target_page_end: null,
        target_streak_days: null,
        target_date: null,
      });
    }
  };

  // Loading states
  if (status === 'loading' || state.loading) {
    return (
      <section className="page-section">
        <div className="page-section__inner">
          <div className="glass-panel flex flex-col items-center justify-center py-20 text-white">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-300/50 mb-4" />
            <p className="text-sm text-white/50">Loading Nur...</p>
          </div>
        </div>
      </section>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <section className="page-section">
        <div className="page-section__inner">
          <div className="glass-panel space-y-4 p-8 text-center text-white">
            <BookOpen className="mx-auto h-12 w-12 text-cyan-300/30" />
            <h1 className="text-2xl font-headline font-semibold glow-text">Nur - Quran Tracker</h1>
            <p className="text-sm text-white/60 max-w-md mx-auto">
              Sign in to access your personal Quran memorization, revision, and recitation tracker.
            </p>
            <Button asChild>
              <Link href="/login">Sign in to continue</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Setup wizard (no profile yet)
  if (!state.profile) {
    return (
      <section className="page-section">
        <div className="page-section__inner">
          <div className="mb-8 text-center text-white">
            <BookOpen className="mx-auto h-10 w-10 text-cyan-300/50 glow-icon mb-4" />
            <h1 className="text-3xl font-headline font-semibold glow-text">Welcome to Nur</h1>
            <p className="text-sm text-white/50 mt-2 max-w-lg mx-auto">
              Your personal Quran companion. Let&apos;s set up your journey — choose your path,
              set your pace, and begin with barakah.
            </p>
          </div>
          <SetupWizard onComplete={handleSetupComplete} isSubmitting={isSubmitting} />
        </div>
      </section>
    );
  }

  // Main tracker view
  const selectedLog = state.logs.find(l => l.date === selectedDate) ?? null;

  return (
    <section className="page-section">
      <div className="page-section__inner space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-white">
            <p className="eyebrow text-cyan-300/60 glow-text">Nur</p>
            <h1 className="text-2xl font-headline font-semibold">Your Personal Quran Tracker</h1>
            <p className="mt-1 text-xs text-white/50">
              {state.profile.track_types.length > 1
                ? `Tracking: ${state.profile.track_types.map(track => track.charAt(0).toUpperCase() + track.slice(1)).join(', ')}`
                : `Tracking: ${state.profile.track_types[0].charAt(0).toUpperCase() + state.profile.track_types[0].slice(1)}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerateMore}
              disabled={isGenerating}
              className="text-cyan-300/70 hover:text-cyan-200"
            >
              {isGenerating ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              )}
              Generate Week
            </Button>
            <SettingsPanel
              profile={state.profile}
              onSave={handleSaveSettings}
              isSaving={isSaving}
            />
          </div>
        </div>

        {/* Stats Overview */}
        <StatsOverview
          profile={state.profile}
          items={state.items}
          logs={state.logs}
        />

        {/* Calendar */}
        <NurCalendar
          items={state.items}
          logs={state.logs}
          onToggleComplete={handleToggleComplete}
          onSelectDate={setSelectedDate}
          selectedDate={selectedDate}
        />

        {/* Daily Log */}
        <DailyLog
          date={selectedDate}
          existingLog={selectedLog}
          onSave={handleSaveLog}
          isSaving={isSaving}
        />

        {/* Bottom section: Goals + AI + Mushaf */}
        <div className="grid gap-6 lg:grid-cols-3">
          <GoalsPanel
            goals={state.goals}
            onAddGoal={handleAddGoal}
            onDeleteGoal={handleDeleteGoal}
          />
          <AiAssistant
            profile={state.profile}
            scheduleItems={state.items}
            goals={state.goals}
            onApplySuggestion={handleApplySuggestion}
          />
          <MushafPanel />
        </div>

        {/* Error display */}
        {state.error && (
          <div className="rounded-lg border border-red-400/20 bg-red-400/[0.05] p-4 text-center">
            <p className="text-sm text-red-300">{state.error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchData}
              className="mt-2 text-red-300/70 hover:text-red-200"
            >
              Retry
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
