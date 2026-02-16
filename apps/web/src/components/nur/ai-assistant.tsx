'use client';

import { useState } from 'react';
import { Sparkles, Send, Loader2, BookOpen, Target, Calendar, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { surahs } from '@/lib/quran-data';
import type { NurProfile, NurScheduleItem, NurGoal } from '@/lib/nur-types';

type AiAssistantProps = {
  profile: NurProfile;
  scheduleItems: NurScheduleItem[];
  goals: NurGoal[];
  onApplySuggestion: (suggestion: AiSuggestion) => void;
};

export type AiSuggestion = {
  type: 'adjust_pace' | 'add_goal' | 'reschedule' | 'motivation';
  title: string;
  description: string;
  action?: {
    label: string;
    dailyVerses?: number;
    goalTitle?: string;
    goalType?: NurGoal['goal_type'];
    targetSurah?: number;
  };
};

function generateSuggestions(profile: NurProfile, items: NurScheduleItem[], goals: NurGoal[]): AiSuggestion[] {
  const suggestions: AiSuggestion[] = [];
  const todayStr = new Date().toISOString().split('T')[0];
  const recentItems = items.filter(i => i.date <= todayStr).slice(-14);
  const completedCount = recentItems.filter(i => i.completed).length;
  const totalCount = recentItems.length;
  const completionRate = totalCount > 0 ? completedCount / totalCount : 0;
  const carriedOverCount = recentItems.filter(i => i.carried_over).length;

  // Completion rate feedback
  if (completionRate >= 0.9 && totalCount >= 7) {
    suggestions.push({
      type: 'adjust_pace',
      title: 'Increase your pace',
      description: `You've completed ${Math.round(completionRate * 100)}% of your tasks recently. You may be ready to increase your daily target from ${profile.daily_new_verses} to ${profile.daily_new_verses + 2} verses.`,
      action: {
        label: `Set to ${profile.daily_new_verses + 2} verses/day`,
        dailyVerses: profile.daily_new_verses + 2,
      },
    });
  } else if (completionRate < 0.5 && totalCount >= 5) {
    suggestions.push({
      type: 'adjust_pace',
      title: 'Adjust your pace',
      description: `Your completion rate has been ${Math.round(completionRate * 100)}% recently. Consider reducing your daily target to ${Math.max(1, profile.daily_new_verses - 2)} verses to build consistency first.`,
      action: {
        label: `Set to ${Math.max(1, profile.daily_new_verses - 2)} verses/day`,
        dailyVerses: Math.max(1, profile.daily_new_verses - 2),
      },
    });
  }

  // Carry-over suggestions
  if (carriedOverCount > 3) {
    suggestions.push({
      type: 'reschedule',
      title: 'Too many carry-overs',
      description: `You have ${carriedOverCount} carried-over tasks in the last 2 weeks. This might lead to burnout. Consider clearing your backlog by focusing on completion today.`,
    });
  }

  // Goal suggestions
  if (goals.filter(g => !g.completed).length === 0) {
    const currentSurah = profile.memorization_current_surah ?? profile.memorization_start_surah ?? 1;
    const surahData = surahs.find(s => s.number === currentSurah);
    suggestions.push({
      type: 'add_goal',
      title: `Set a goal for ${surahData?.name ?? 'your current surah'}`,
      description: `You don't have any active goals. Setting a goal helps maintain focus and motivation on your journey.`,
      action: {
        label: `Add goal: Complete ${surahData?.name}`,
        goalTitle: `Complete ${surahData?.name}`,
        goalType: 'complete_surah',
        targetSurah: currentSurah,
      },
    });
  }

  // Motivational
  const streakDays = recentItems.filter((item, idx) => {
    const dayItems = recentItems.filter(i => i.date === item.date);
    return dayItems.every(i => i.completed);
  });
  if (streakDays.length >= 7) {
    suggestions.push({
      type: 'motivation',
      title: 'Keep going!',
      description: 'The Prophet (peace be upon him) said: "The most beloved of deeds to Allah are those that are most consistent, even if they are small." You are building a beautiful habit.',
    });
  }

  // Default motivation if nothing else
  if (suggestions.length === 0) {
    suggestions.push({
      type: 'motivation',
      title: 'Stay consistent',
      description: 'Allah says in the Quran: "And We have certainly made the Quran easy for remembrance, so is there any who will remember?" (54:17). Every verse you engage with brings you closer to its light.',
    });
  }

  return suggestions;
}

export function AiAssistant({ profile, scheduleItems, goals, onApplySuggestion }: AiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  const suggestions = generateSuggestions(profile, scheduleItems, goals);

  const handleAsk = async () => {
    if (!question.trim()) return;
    const userMsg = question.trim();
    setQuestion('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsThinking(true);

    // Local AI response based on context
    await new Promise(r => setTimeout(r, 800));

    let response = '';
    const lowerQ = userMsg.toLowerCase();

    if (lowerQ.includes('how long') || lowerQ.includes('when will')) {
      const totalVerses = 6236;
      const remaining = totalVerses - ((profile.memorization_current_ayah ?? 1) + ((profile.memorization_current_surah ?? 1) - 1) * 20);
      const daysLeft = Math.ceil(remaining / profile.daily_new_verses);
      response = `At your current pace of ${profile.daily_new_verses} new verses per day, you'll complete the Quran in approximately ${daysLeft} days (${Math.ceil(daysLeft / 30)} months). Remember, consistency matters more than speed.`;
    } else if (lowerQ.includes('suggest') || lowerQ.includes('recommend') || lowerQ.includes('schedule')) {
      response = `Based on your ${profile.track_type} track, I recommend:\n\n1. Focus on ${profile.daily_new_verses} new verses in the morning\n2. Revise ${profile.daily_revision_pages} pages of previous material after Dhuhr\n3. Listen to the audio of tomorrow's portion before bed\n\nThis spaced approach helps with long-term retention.`;
    } else if (lowerQ.includes('motivat') || lowerQ.includes('struggling') || lowerQ.includes('hard')) {
      response = `The journey of Quran can be challenging, but remember: "Verily, with hardship comes ease" (94:6). The one who struggles with the Quran gets double the reward. Every moment of effort is recorded. Take it one ayah at a time.`;
    } else if (lowerQ.includes('revision') || lowerQ.includes('forget')) {
      response = `For effective revision:\n\n1. Review each new page 5 times on the day you memorize it\n2. Revise it the next day, then after 3 days, then after a week\n3. Once solid, add it to your rolling revision cycle\n4. Recite to a partner or teacher weekly\n\nThe key is to never let more than a week pass without revising memorized portions.`;
    } else {
      response = `I can help you with your Quran journey! Try asking about:\n\n- Your schedule and pace adjustments\n- Memorization and revision tips\n- How long until you reach a goal\n- Motivation and encouragement\n\nWhat would you like to know?`;
    }

    setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
    setIsThinking(false);
  };

  return (
    <div className="space-y-4">
      {/* AI Suggestions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="h-4 w-4 text-cyan-300/70 glow-icon" />
          <h3 className="text-lg font-headline font-semibold">Nur AI</h3>
        </div>

        {suggestions.map((sug, i) => (
          <div
            key={i}
            className={`rounded-xl border p-4 transition-all ${
              sug.type === 'motivation'
                ? 'border-amber-400/10 bg-amber-400/[0.02]'
                : 'border-cyan-400/10 bg-cyan-400/[0.02]'
            }`}
          >
            <div className="flex items-start gap-3">
              {sug.type === 'adjust_pace' ? (
                <RotateCcw className="h-4 w-4 mt-0.5 text-cyan-300/60 shrink-0" />
              ) : sug.type === 'add_goal' ? (
                <Target className="h-4 w-4 mt-0.5 text-emerald-300/60 shrink-0" />
              ) : sug.type === 'reschedule' ? (
                <Calendar className="h-4 w-4 mt-0.5 text-orange-300/60 shrink-0" />
              ) : (
                <BookOpen className="h-4 w-4 mt-0.5 text-amber-300/60 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white/90">{sug.title}</p>
                <p className="text-xs text-white/50 mt-1">{sug.description}</p>
                {sug.action && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onApplySuggestion(sug)}
                    className="mt-2 h-7 text-xs text-cyan-300/70 hover:text-cyan-200 hover:bg-cyan-500/10"
                  >
                    {sug.action.label}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat */}
      <div className="glass-panel p-4 text-white space-y-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between"
        >
          <span className="text-sm font-medium text-white/70">Ask Nur AI</span>
          <Sparkles className={`h-3.5 w-3.5 transition-colors ${isOpen ? 'text-cyan-300' : 'text-white/30'}`} />
        </button>

        {isOpen && (
          <>
            {chatHistory.length > 0 && (
              <div className="max-h-60 overflow-y-auto space-y-2 rounded-lg border border-white/[0.04] bg-white/[0.01] p-3">
                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`rounded-lg px-3 py-2 text-xs ${
                      msg.role === 'user'
                        ? 'ml-8 bg-cyan-500/10 text-cyan-200/80'
                        : 'mr-4 bg-white/[0.03] text-white/70'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))}
                {isThinking && (
                  <div className="flex items-center gap-2 text-xs text-white/40 px-3 py-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Thinking...
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Ask about your schedule, tips, motivation..."
                className="min-h-[40px] max-h-[80px] resize-none border-white/[0.08] bg-white/[0.04] text-sm text-white placeholder:text-white/30"
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
              />
              <Button
                size="sm"
                onClick={handleAsk}
                disabled={!question.trim() || isThinking}
                className="h-auto bg-cyan-500/20 text-cyan-200 border border-cyan-400/20 hover:bg-cyan-500/30"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
