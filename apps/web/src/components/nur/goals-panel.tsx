'use client';

import { useState } from 'react';
import { Target, Plus, Trophy, Flame, BookOpen, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { surahs } from '@/lib/quran-data';
import type { NurGoal } from '@/lib/nur-types';

type GoalsPanelProps = {
  goals: NurGoal[];
  onAddGoal: (goal: Omit<NurGoal, 'id' | 'nur_profile_id' | 'progress' | 'completed' | 'completed_at' | 'created_at'>) => void;
  onDeleteGoal: (goalId: string) => void;
};

type GoalType = NurGoal['goal_type'];

export function GoalsPanel({ goals, onAddGoal, onDeleteGoal }: GoalsPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [goalType, setGoalType] = useState<GoalType>('complete_surah');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetSurah, setTargetSurah] = useState(2);
  const [targetJuz, setTargetJuz] = useState(1);
  const [targetStreak, setTargetStreak] = useState(30);
  const [targetDate, setTargetDate] = useState('');

  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  const goalTypeOptions: { type: GoalType; label: string; icon: typeof Target }[] = [
    { type: 'complete_surah', label: 'Complete Surah', icon: BookOpen },
    { type: 'complete_juz', label: 'Complete Juz', icon: Trophy },
    { type: 'daily_streak', label: 'Daily Streak', icon: Flame },
    { type: 'custom', label: 'Custom Goal', icon: Target },
  ];

  const handleSubmit = () => {
    const goal = {
      title: title || `Complete ${goalType === 'complete_surah' ? surahs.find(s => s.number === targetSurah)?.name : goalType === 'complete_juz' ? `Juz ${targetJuz}` : goalType === 'daily_streak' ? `${targetStreak}-day streak` : 'goal'}`,
      description: description || null,
      goal_type: goalType,
      target_surah: goalType === 'complete_surah' ? targetSurah : null,
      target_juz: goalType === 'complete_juz' ? targetJuz : null,
      target_streak_days: goalType === 'daily_streak' ? targetStreak : null,
      target_date: targetDate || null,
    };
    onAddGoal(goal);
    setShowForm(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-headline font-semibold text-white">Goals</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="text-cyan-300/70 hover:text-cyan-200"
        >
          {showForm ? <X className="h-4 w-4" /> : <><Plus className="mr-1 h-4 w-4" /> Add Goal</>}
        </Button>
      </div>

      {showForm && (
        <div className="glass-panel-glow space-y-4 p-6 text-white">
          <p className="text-sm font-semibold">New Goal</p>
          <div className="grid grid-cols-2 gap-2">
            {goalTypeOptions.map(opt => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.type}
                  onClick={() => setGoalType(opt.type)}
                  className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs transition-all ${
                    goalType === opt.type
                      ? 'border-cyan-400/30 bg-cyan-400/[0.06]'
                      : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 text-cyan-300/60" />
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div>
            <Label className="text-white/70 text-sm">Title (optional)</Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Auto-generated if left blank"
              className="mt-1 border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/30"
            />
          </div>

          {goalType === 'complete_surah' && (
            <div>
              <Label className="text-white/70 text-sm">Target Surah</Label>
              <select
                value={targetSurah}
                onChange={e => setTargetSurah(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white"
              >
                {surahs.map(s => (
                  <option key={s.number} value={s.number} className="bg-[hsl(220,20%,8%)]">
                    {s.number}. {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {goalType === 'complete_juz' && (
            <div>
              <Label className="text-white/70 text-sm">Target Juz</Label>
              <select
                value={targetJuz}
                onChange={e => setTargetJuz(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white"
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map(j => (
                  <option key={j} value={j} className="bg-[hsl(220,20%,8%)]">Juz {j}</option>
                ))}
              </select>
            </div>
          )}

          {goalType === 'daily_streak' && (
            <div>
              <Label className="text-white/70 text-sm">Streak target (days)</Label>
              <Input
                type="number"
                min={7}
                max={365}
                value={targetStreak}
                onChange={e => setTargetStreak(Number(e.target.value))}
                className="mt-1 border-white/[0.08] bg-white/[0.04] text-white"
              />
            </div>
          )}

          <div>
            <Label className="text-white/70 text-sm">Target date (optional)</Label>
            <Input
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              className="mt-1 border-white/[0.08] bg-white/[0.04] text-white"
            />
          </div>

          <div>
            <Label className="text-white/70 text-sm">Notes</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Any additional notes for this goal..."
              className="mt-1 border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/30 min-h-[60px]"
            />
          </div>

          <Button onClick={handleSubmit} className="w-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/20 hover:bg-cyan-500/30">
            Create Goal
          </Button>
        </div>
      )}

      {/* Active Goals */}
      {activeGoals.length > 0 ? (
        <div className="space-y-2">
          {activeGoals.map(goal => (
            <div key={goal.id} className="glass-panel p-4 text-white space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {goal.goal_type === 'daily_streak' ? (
                    <Flame className="h-4 w-4 text-amber-400/70" />
                  ) : goal.goal_type === 'complete_juz' ? (
                    <Trophy className="h-4 w-4 text-emerald-400/70" />
                  ) : (
                    <Target className="h-4 w-4 text-cyan-400/70" />
                  )}
                  <p className="text-sm font-semibold">{goal.title}</p>
                </div>
                <button onClick={() => onDeleteGoal(goal.id)} className="text-white/30 hover:text-red-400 transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {goal.description && <p className="text-xs text-white/40">{goal.description}</p>}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span>{goal.progress}%</span>
                  {goal.target_date && <span>Due: {new Date(goal.target_date + 'T12:00:00').toLocaleDateString()}</span>}
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !showForm ? (
        <div className="glass-panel flex flex-col items-center justify-center py-8 text-center text-white">
          <Target className="h-8 w-8 text-white/15 mb-3" />
          <p className="text-sm text-white/40">No active goals</p>
          <p className="text-xs text-white/25 mt-1">Set goals to keep yourself motivated</p>
        </div>
      ) : null}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-white/30">Completed</p>
          {completedGoals.slice(0, 3).map(goal => (
            <div key={goal.id} className="flex items-center gap-2 rounded-lg border border-emerald-400/10 bg-emerald-400/[0.02] p-3">
              <Check className="h-4 w-4 text-emerald-400/60" />
              <p className="text-sm text-emerald-300/50 line-through">{goal.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
