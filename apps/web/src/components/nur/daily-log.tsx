'use client';

import { useState } from 'react';
import { Star, MessageSquare, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { NurDailyLog } from '@/lib/nur-types';

type DailyLogProps = {
  date: string;
  existingLog: NurDailyLog | null;
  onSave: (log: { date: string; day_rating: number | null; reflection: string | null }) => void;
  isSaving?: boolean;
};

export function DailyLog({ date, existingLog, onSave, isSaving }: DailyLogProps) {
  const [rating, setRating] = useState<number>(existingLog?.day_rating ?? 0);
  const [reflection, setReflection] = useState(existingLog?.reflection ?? '');
  const [isExpanded, setIsExpanded] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = date === todayStr;
  const isPast = date < todayStr;

  const handleSave = () => {
    onSave({
      date,
      day_rating: rating > 0 ? rating : null,
      reflection: reflection.trim() || null,
    });
  };

  return (
    <div className="glass-panel p-4 text-white space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-white/40" />
          <span className="text-sm font-medium text-white/70">
            {isToday ? 'Today\'s Reflection' : 'Day Reflection'}
          </span>
        </div>
        {existingLog?.day_rating && (
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
              <Star
                key={s}
                className={`h-3 w-3 ${s <= (existingLog.day_rating ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-white/20'}`}
              />
            ))}
          </div>
        )}
      </button>

      {isExpanded && (
        <>
          <div>
            <p className="text-xs text-white/40 mb-2">How was your session?</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  className="group p-1"
                >
                  <Star
                    className={`h-5 w-5 transition-all ${
                      s <= rating
                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]'
                        : 'text-white/20 group-hover:text-amber-400/40'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-white/40 mb-2">Reflection (optional)</p>
            <Textarea
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              placeholder="What went well? What can you improve?"
              className="min-h-[60px] resize-none border-white/[0.08] bg-white/[0.04] text-sm text-white placeholder:text-white/30"
            />
          </div>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/20 hover:bg-cyan-500/30"
          >
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {isSaving ? 'Saving...' : 'Save Reflection'}
          </Button>
        </>
      )}
    </div>
  );
}
