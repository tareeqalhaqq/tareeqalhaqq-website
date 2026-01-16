import { Calendar, Clock, MapPin } from 'lucide-react';
import { createSupabaseClient } from '@/lib/supabase';

type EventRecord = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  date: string | null;
  time: string | null;
  image_url: string | null;
  event_type: string | null;
  is_virtual: boolean | null;
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
  const supabase = await createSupabaseClient();
  const { data: events } = await supabase
    .from('events')
    .select('id, title, description, location, date, time, image_url, event_type, is_virtual')
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
          {(events ?? []).map((event: EventRecord) => {
            const eventLabel =
              event.event_type === 'markaz' ? 'Markaz Al Haqq Event' : 'Tareeq Al Haqq Event';
            const locationLabel = event.is_virtual ? 'Virtual' : event.location ?? 'Location TBA';
            return (
            <div key={event.id} className="glass-panel overflow-hidden p-0">
              <div className="grid gap-0 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-stretch">
                <div className="relative min-h-[220px] overflow-hidden md:min-h-[300px]">
                  {event.image_url ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
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
                    </>
                  )}
                </div>
                <div className="flex flex-col justify-between space-y-6 p-8">
                  <div className="space-y-4">
                    <p className="text-xs uppercase tracking-[0.4em] text-primary/80">{eventLabel}</p>
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
                        {locationLabel}
                      </span>
                    </div>
                    {event.is_virtual && (
                      <span className="inline-flex w-fit rounded-full border border-primary/30 px-3 py-1 text-xs uppercase tracking-[0.3em] text-primary/80">
                        Virtual Event
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/70">{event.description}</p>
                </div>
              </div>
            </div>
          )})}
        </div>
      </div>
    </section>
  );
}
