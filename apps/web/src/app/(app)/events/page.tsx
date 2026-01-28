'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const dynamic = 'force-dynamic';

type EventRecord = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  date: string | null;
  time: string | null;
  image_url: string | null;
  event_type: string | null;
  is_ongoing: boolean | null;
  form_embed_url: string | null;
};

const formatDate = (date: string | null) => {
  if (!date) {
    return 'Date TBA';
  }

  return new Date(date).toLocaleDateString('en-GB', {
    dateStyle: 'full',
  });
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useMemo(
    () =>
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );

  useEffect(() => {
    let isMounted = true;
    const fetchEvents = async () => {
      const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true });

      if (error) {
        console.error('Events fetch error:', error);
        if (isMounted) {
          setError(error);
        }
      }

      if (data && isMounted) {
        setEvents(data);
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    fetchEvents();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const showUnableToLoad = !isLoading && (!!error || events.length === 0);

  return (
    <section className="page-section">
      <div className="page-section__inner space-y-10">
        <div className="space-y-3 text-center">
          <p className="eyebrow">Gatherings</p>
          <h1 className="text-3xl uppercase tracking-[0.16em] text-white md:text-4xl">Upcoming Events</h1>
          <p className="mx-auto max-w-2xl text-sm text-white/70 md:text-base">
            Join us for workshops and seminars focused on practical learning, research skills, and applying authentic guidance in everyday life.
          </p>
        </div>

        <div className="space-y-6">
          {showUnableToLoad && (
            <div className="glass-panel p-6 text-center text-sm text-white/70">
              Unable to load events right now. Please check back soon.
            </div>
          )}
          {!showUnableToLoad &&
            events.map((event: EventRecord) => {
              const eventLabel =
                event.event_type === 'markaz' ? 'Markaz Al Haqq Event' : 'Tareeq Al Haqq Event';
              const isVirtual = event.location === 'Virtual';
              const locationLabel = isVirtual ? 'Virtual' : event.location ?? 'Location TBA';
              const displayDate = event.is_ongoing ? 'Ongoing' : formatDate(event.date);
              const displayTime = event.is_ongoing ? 'In progress' : event.time ?? 'Time TBA';
              return (
                <div key={event.id} className="glass-panel overflow-hidden p-0">
                  <div className="grid gap-0 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-stretch">
                    <div className="relative min-h-[200px] overflow-hidden md:min-h-[240px]">
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
                              className="h-20 w-20 object-contain md:h-24 md:w-24"
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex flex-col justify-between space-y-5 p-6 md:p-7">
                      <div className="space-y-3">
                        <p className="text-[0.65rem] uppercase tracking-[0.32em] text-primary/80">{eventLabel}</p>
                        <h2 className="text-xl font-headline uppercase tracking-[0.16em] text-white md:text-2xl">
                          {event.title}
                        </h2>
                        <div className="flex flex-col gap-3 text-xs text-white/70 md:flex-row md:items-center md:text-sm">
                          <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            {displayDate}
                          </span>
                          <span className="hidden h-1 w-1 rounded-full bg-primary/60 md:inline-block" />
                          <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            {displayTime}
                          </span>
                          <span className="hidden h-1 w-1 rounded-full bg-primary/60 md:inline-block" />
                          <span className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            {locationLabel}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {event.is_ongoing && (
                            <span className="inline-flex w-fit rounded-full border border-primary/30 px-3 py-1 text-[0.65rem] uppercase tracking-[0.28em] text-primary/80">
                              Ongoing Event
                            </span>
                          )}
                          {isVirtual && (
                            <span className="inline-flex w-fit rounded-full border border-primary/30 px-3 py-1 text-[0.65rem] uppercase tracking-[0.28em] text-primary/80">
                              Virtual Event
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-white/70">{event.description}</p>
                      {isVirtual && event.form_embed_url && (
                        <div className="space-y-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button className="w-full sm:w-auto">Open registration form</Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-4xl gap-6 overflow-hidden border-white/10 bg-neutral-950 p-4 text-white sm:p-6">
                              <DialogHeader className="text-left">
                                <DialogTitle className="text-xl text-white">Register for {event.title}</DialogTitle>
                                <DialogDescription className="text-sm text-white/70">
                                  Complete the form below to confirm your attendance.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
                                <iframe
                                  title={`${event.title} registration form`}
                                  src={event.form_embed_url}
                                  className="h-[70vh] w-full"
                                  loading="lazy"
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
}
