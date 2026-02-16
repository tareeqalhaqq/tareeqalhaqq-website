'use client';

import { BookOpen, Flame, Target, TrendingUp } from 'lucide-react';
import type { NurProfile, NurScheduleItem, NurDailyLog } from '@/lib/nur-types';
import { getSurahByNumber } from '@/lib/quran-data';

type StatsOverviewProps = {
  profile: NurProfile;
  items: NurScheduleItem[];
  logs: NurDailyLog[];
};

export function StatsOverview({ profile, items, logs }: StatsOverviewProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate streak
  let streak = 0;
  const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    const dayItems = items.filter(item => item.date === dateStr);
    if (dayItems.length > 0 && dayItems.every(item => item.completed)) {
      streak++;
    } else if (dayItems.length > 0) {
      break;
    } else if (i > 0) {
      // Allow today to be incomplete
      break;
    }
  }

  // Total completed
  const totalCompleted = items.filter(i => i.completed).length;
  const totalVerses = items.filter(i => i.completed).reduce((sum, item) => sum + (item.end_ayah - item.start_ayah + 1), 0);

  // Today's progress
  const todayItems = items.filter(i => i.date === todayStr);
  const todayCompleted = todayItems.filter(i => i.completed).length;
  const todayTotal = todayItems.length;
  const todayPercent = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  // Current position
  const currentSurah = getSurahByNumber(profile.memorization_current_surah ?? profile.memorization_start_surah ?? 1);

  const stats = [
    {
      label: 'Current Streak',
      value: `${streak}`,
      unit: 'days',
      icon: Flame,
      color: 'text-amber-400',
      glow: 'shadow-[0_0_12px_rgba(251,191,36,0.15)]',
    },
    {
      label: 'Today',
      value: `${todayPercent}%`,
      unit: `${todayCompleted}/${todayTotal} tasks`,
      icon: Target,
      color: 'text-cyan-300',
      glow: 'shadow-[0_0_12px_rgba(56,189,248,0.15)]',
    },
    {
      label: 'Total Verses',
      value: totalVerses.toLocaleString(),
      unit: 'completed',
      icon: BookOpen,
      color: 'text-emerald-300',
      glow: 'shadow-[0_0_12px_rgba(52,211,153,0.15)]',
    },
    {
      label: 'Position',
      value: currentSurah?.name ?? 'Not set',
      unit: profile.memorization_current_ayah ? `Ayah ${profile.memorization_current_ayah}` : '',
      icon: TrendingUp,
      color: 'text-violet-300',
      glow: 'shadow-[0_0_12px_rgba(167,139,250,0.15)]',
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(stat => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`glass-panel flex items-center gap-4 p-4 text-white ${stat.glow}`}
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] ${stat.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</p>
              <p className={`text-lg font-semibold truncate ${stat.color}`}>{stat.value}</p>
              {stat.unit && <p className="text-[0.6rem] text-white/30">{stat.unit}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
