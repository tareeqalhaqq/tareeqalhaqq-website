'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSurahByNumber } from '@/lib/quran-data';
import type { NurScheduleItem, NurDailyLog, CalendarDay } from '@/lib/nur-types';

type NurCalendarProps = {
  items: NurScheduleItem[];
  logs: NurDailyLog[];
  onToggleComplete: (itemId: string, completed: boolean) => void;
  onSelectDate: (date: string) => void;
  selectedDate: string;
};

function getMonthDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  // Pad to start of week (Sunday)
  const startPad = firstDay.getDay();
  for (let i = startPad - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }

  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  // Pad to end of week
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }
  }

  return days;
}

function formatDateStr(date: Date): string {
  return date.toISOString().split('T')[0];
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function NurCalendar({ items, logs, onToggleComplete, onSelectDate, selectedDate }: NurCalendarProps) {
  const today = new Date();
  const todayStr = formatDateStr(today);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const calendarDays: CalendarDay[] = useMemo(() => {
    const days = getMonthDays(viewYear, viewMonth);
    return days.map(date => {
      const dateStr = formatDateStr(date);
      const dayItems = items.filter(i => i.date === dateStr);
      const dayLog = logs.find(l => l.date === dateStr) ?? null;
      return {
        date,
        dateStr,
        isToday: dateStr === todayStr,
        isCurrentMonth: date.getMonth() === viewMonth,
        items: dayItems,
        log: dayLog,
        hasCarryOver: dayItems.some(i => i.carried_over),
      };
    });
  }, [items, logs, viewYear, viewMonth, todayStr]);

  const selectedDayItems = items.filter(i => i.date === selectedDate);
  const selectedDayLog = logs.find(l => l.date === selectedDate);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(y => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(y => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const goToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    onSelectDate(todayStr);
  };

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {/* Calendar Grid */}
      <div className="glass-panel-glow p-6 text-white">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-headline font-semibold glow-text">{monthLabel}</h3>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={goToToday} className="text-xs text-cyan-300/70 hover:text-cyan-200">
              Today
            </Button>
            <Button variant="ghost" size="sm" onClick={prevMonth} className="h-8 w-8 p-0 text-white/60 hover:text-white">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={nextMonth} className="h-8 w-8 p-0 text-white/60 hover:text-white">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Day headers */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {dayNames.map(d => (
            <div key={d} className="py-1 text-center text-[0.65rem] font-medium uppercase tracking-wider text-white/40">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            const hasItems = day.items.length > 0;
            const allComplete = hasItems && day.items.every(i => i.completed);
            const someComplete = hasItems && day.items.some(i => i.completed) && !allComplete;
            const isSelected = day.dateStr === selectedDate;

            return (
              <button
                key={idx}
                onClick={() => onSelectDate(day.dateStr)}
                className={`relative flex h-12 sm:h-14 flex-col items-center justify-center rounded-lg border text-sm transition-all duration-200 ${
                  isSelected
                    ? 'border-cyan-400/30 bg-cyan-400/[0.08] shadow-[0_0_16px_rgba(56,189,248,0.12)]'
                    : day.isToday
                    ? 'border-cyan-400/15 bg-cyan-400/[0.04]'
                    : day.isCurrentMonth
                    ? 'border-white/[0.04] bg-white/[0.01] hover:border-white/[0.08] hover:bg-white/[0.03]'
                    : 'border-transparent text-white/20'
                }`}
              >
                <span className={`text-xs ${day.isToday ? 'font-bold text-cyan-300' : day.isCurrentMonth ? 'text-white/80' : 'text-white/20'}`}>
                  {day.date.getDate()}
                </span>
                {hasItems && (
                  <div className="mt-0.5 flex gap-0.5">
                    {allComplete ? (
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                    ) : someComplete ? (
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.4)]" />
                    ) : (
                      <div className="h-1.5 w-1.5 rounded-full bg-white/30" />
                    )}
                    {day.hasCarryOver && (
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-400/60" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-[0.65rem] text-white/40">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-400" /> All complete
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-amber-400" /> Partial
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-white/30" /> Pending
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-orange-400/60" /> Carried over
          </div>
        </div>
      </div>

      {/* Day Detail Panel */}
      <div className="glass-panel p-6 text-white space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">
            {selectedDate === todayStr ? 'Today' : new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
          <h4 className="text-lg font-semibold mt-1">
            {selectedDayItems.length > 0
              ? `${selectedDayItems.filter(i => i.completed).length}/${selectedDayItems.length} tasks`
              : 'No tasks scheduled'}
          </h4>
        </div>

        {selectedDayItems.length > 0 ? (
          <div className="space-y-2">
            {selectedDayItems.map(item => {
              const surah = getSurahByNumber(item.surah_number);
              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 rounded-lg border p-3 transition-all ${
                    item.completed
                      ? 'border-emerald-400/15 bg-emerald-400/[0.04]'
                      : 'border-white/[0.06] bg-white/[0.02]'
                  }`}
                >
                  <button
                    onClick={() => onToggleComplete(item.id, !item.completed)}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                      item.completed
                        ? 'border-emerald-400/40 bg-emerald-400/20 text-emerald-300'
                        : 'border-white/20 bg-white/5 hover:border-cyan-400/30'
                    }`}
                  >
                    {item.completed && <Check className="h-3 w-3" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${item.completed ? 'text-emerald-300/70 line-through' : 'text-white/90'}`}>
                      {surah?.name ?? `Surah ${item.surah_number}`}
                    </p>
                    <p className="text-[0.7rem] text-white/40">
                      {item.unit_type === 'ayah' ? 'Ayah' : item.unit_type === 'page' ? 'Page' : item.unit_type} {item.range_start}–{item.range_end} &middot; {item.task_type}
                      {item.carried_over && (
                        <span className="ml-1.5 text-orange-300/60">
                          <ArrowRight className="inline h-3 w-3" /> carried over
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BookOpen className="h-8 w-8 text-white/15 mb-3" />
            <p className="text-sm text-white/40">No tasks for this day</p>
            <p className="text-xs text-white/25 mt-1">Select a date with scheduled items to view details</p>
          </div>
        )}

        {/* Day summary */}
        {selectedDayLog && (
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-white/40">Day Summary</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-semibold text-cyan-300">{selectedDayLog.total_new}</p>
                <p className="text-[0.6rem] text-white/40">New</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-emerald-300">{selectedDayLog.total_revised}</p>
                <p className="text-[0.6rem] text-white/40">Revised</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-amber-300">{selectedDayLog.streak_count}</p>
                <p className="text-[0.6rem] text-white/40">Streak</p>
              </div>
            </div>
            {selectedDayLog.reflection && (
              <p className="text-xs text-white/50 italic mt-2">&ldquo;{selectedDayLog.reflection}&rdquo;</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
