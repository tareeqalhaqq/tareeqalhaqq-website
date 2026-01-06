import { Calendar, Clock, MapPin } from 'lucide-react';
import { cookies } from 'next/headers';

import { createClient } from '@/utils/supabase/server';

type EventRecord = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  date: string | null;
  time: string | null;
  image_url: string | null;
};

const formatDate = (date: string | null) => {
  if (!date) {
    return 'Date TBA';
  }

  return new Date(date).toLocaleDateString('en-GB', {
    dateStyle: 'full',
  });
};

export default async function EventsPage() {
  const supabase = createClient(cookies());
  const { data: events } = await supabase
    .from('events')
    .select('id, title, description, location, date, time, image_url')
    .order('date', { ascending: true });

  return (
    <section className="page-section">
      <div className="page-section__inner space-y-12">
        <div className="space-y-4 text-center">
          <p className="eyebrow">Gatherings</p>
          <h1 className="text-4xl uppercase tracking-[0.2em] text-white md:text-5xl">Upcoming Events</h1>
          <p className="mx-auto max-w-3xl text-base text-white/70">
            Join us for workshops and seminars focused on practical learning, research skills, and applying authentic guidance in everyday life.
          </p>
        </div>

        <div className="space-y-10">
          {!events?.length && (
            <div className="glass-panel p-8 text-center text-sm text-white/70">No upcoming events.</div>
          )}
          {(events ?? []).map((event: EventRecord) => (
            <div key={event.id} className="glass-panel overflow-hidden p-0">
              <div className="grid gap-0 md:grid-cols-[1.1fr_1.2fr]">
                <div className="relative h-full min-h-[240px]">
                  {event.image_url ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={event.image_url} alt={event.title} className="h-full w-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <p className="absolute bottom-4 left-4 text-xs uppercase tracking-[0.4em] text-white/60">
                        Tareeq Al Haqq Event
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex h-full w-full items-center justify-center bg-black/20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/images/logo1.png"
                          alt="Tareeq Al Haqq logo"
                          className="h-24 w-24 object-contain md:h-32 md:w-32"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                      <p className="absolute bottom-4 left-4 text-xs uppercase tracking-[0.4em] text-white/60">
                        Tareeq Al Haqq Event
                      </p>
                    </>
                  )}
                </div>
                <div className="flex flex-col justify-between space-y-6 p-8">
                  <div className="space-y-4">
                    <h2 className="text-2xl font-headline uppercase tracking-[0.2em] text-white">{event.title}</h2>
                    <div className="flex flex-col gap-3 text-sm text-white/70 md:flex-row md:items-center">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        {formatDate(event.date)}
                      </span>
                      <span className="hidden h-1 w-1 rounded-full bg-primary/60 md:inline-block" />
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        {event.time ?? 'Time TBA'}
                      </span>
                      <span className="hidden h-1 w-1 rounded-full bg-primary/60 md:inline-block" />
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        {event.location ?? 'Location TBA'}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-white/70">{event.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
