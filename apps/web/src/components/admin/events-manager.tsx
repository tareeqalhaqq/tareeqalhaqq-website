'use client';

import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
  created_at: string;
};

const emptyForm = {
  title: '',
  description: '',
  location: '',
  date: '',
  time: '',
  image_url: '',
  event_type: 'tareeq',
  is_virtual: false,
  is_ongoing: false,
  form_embed_url: '',
};

type FormState = typeof emptyForm;
type TBAState = {
  location: boolean;
  date: boolean;
  time: boolean;
  image_url: boolean;
};
type TextField = Exclude<keyof FormState, 'is_virtual' | 'is_ongoing'>;

type EventsManagerProps = {
  adminName?: string;
};

export function EventsManager({ adminName }: EventsManagerProps) {
  const { toast } = useToast();
  const eventsTableLink = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return null;
    try {
      const host = new URL(supabaseUrl).host;
      const projectRef = host.split('.')[0];
      if (!projectRef) return null;
      return `https://app.supabase.com/project/${projectRef}/editor?schema=public&table=events`;
    } catch {
      return null;
    }
  }, []);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [formState, setFormState] = useState<FormState>(emptyForm);
  const [tbaState, setTbaState] = useState<TBAState>({
    location: false,
    date: false,
    time: false,
    image_url: false,
  });
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EventRecord | null>(null);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [isFetchingLocations, setIsFetchingLocations] = useState(false);

  const loadEvents = useCallback(async () => {
    setStatus('loading');
    try {
      const response = await fetch('/api/admin/events');
      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errorData?.error ?? 'Unable to fetch events.');
      }
      const data = (await response.json()) as { events?: EventRecord[] };
      setEvents(data.events ?? []);
    } catch (error) {
      toast({
        title: 'Unable to load events',
        description: error instanceof Error ? error.message : 'Please try again shortly.',
        variant: 'destructive',
      });
    } finally {
      setStatus('ready');
    }
  }, [toast]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const openCreateDialog = () => {
    setEditingEvent(null);
    setFormState(emptyForm);
    setTbaState({
      location: false,
      date: false,
      time: false,
      image_url: false,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (event: EventRecord) => {
    const normalizedTime = event.time ? event.time.slice(0, 5) : '';
    // DB doesn't have is_virtual column, so we derive it from location string
    const isVirtual = event.location === 'Virtual';
    const isTbaLocation = !event.location || event.location.toLowerCase() === 'to be announced';
    setEditingEvent(event);
    setFormState({
      title: event.title,
      description: event.description,
      location: isVirtual ? 'Virtual' : event.location ?? '',
      date: event.date ?? '',
      time: normalizedTime,
      image_url: event.image_url ?? '',
      event_type: event.event_type ?? 'tareeq',
      is_virtual: isVirtual,
      is_ongoing: Boolean(event.is_ongoing),
      form_embed_url: event.form_embed_url ?? '',
    });
    setTbaState({
      location: !isVirtual && isTbaLocation,
      date: !event.date,
      time: !event.time,
      image_url: !event.image_url,
    });
    setLocationQuery(isVirtual ? 'Virtual' : event.location || '');
    setLocationSuggestions([]);
    setIsDialogOpen(true);
  };

  const handleChange = (field: TextField, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    if (field === 'location') {
      setLocationQuery(value);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const query = locationQuery.trim();
    if (tbaState.location || formState.is_virtual || query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsFetchingLocations(true);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
          {
            headers: { 'Accept-Language': 'en' },
            signal: controller.signal,
          },
        );
        if (!response.ok) return;
        const results = (await response.json()) as { display_name: string }[];
        setLocationSuggestions(results.map((item) => item.display_name));
      } catch {
        // ignore network errors, keep UX quiet
      } finally {
        setIsFetchingLocations(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [formState.is_virtual, locationQuery, tbaState.location]);

  const applyLocationSuggestion = (value: string) => {
    setFormState((prev) => ({ ...prev, location: value, is_virtual: false }));
    setLocationQuery(value);
    setLocationSuggestions([]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const normalizedDate = tbaState.date ? null : formState.date || null;
      const normalizedTime = tbaState.time ? null : formState.time || null;
      const normalizedImage = tbaState.image_url ? null : formState.image_url || null;
      const normalizedFormEmbedUrl = formState.is_virtual ? formState.form_embed_url.trim() || null : null;
      const payload = {
        title: formState.title,
        description: formState.description,
        location: formState.is_virtual ? 'Virtual' : tbaState.location ? 'To be announced' : formState.location,
        date: normalizedDate,
        time: normalizedTime,
        image_url: normalizedImage,
        event_type: formState.event_type,
        is_ongoing: formState.is_ongoing,
        form_embed_url: normalizedFormEmbedUrl,
      };

      const endpoint = editingEvent ? `/api/admin/events/${editingEvent.id}` : '/api/admin/events';
      const response = await fetch(endpoint, {
        method: editingEvent ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errorData?.error ?? 'Unable to save event.');
      }

      toast({
        title: editingEvent ? 'Event updated' : 'Event created',
        description: 'Your event details have been saved.',
      });
      setIsDialogOpen(false);
      setEditingEvent(null);
      setFormState(emptyForm);
      setTbaState({
        location: false,
        date: false,
        time: false,
        image_url: false,
      });
      await loadEvents();
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Please check the details and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/events/${deleteTarget.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errorData?.error ?? 'Unable to delete event.');
      }

      toast({
        title: 'Event deleted',
        description: 'The event has been removed.',
      });
      setEvents((prev) => prev.filter((event) => event.id !== deleteTarget.id));
      setDeleteTarget(null);
      setIsDialogOpen(false);
      await loadEvents();
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Please try again shortly.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedEvents = useMemo(
    () =>
      events.map((event) => {
        // Derive virtual status for display
        const isVirtual = event.location === 'Virtual';
        return {
          ...event,
          eventLabel: event.event_type === 'markaz' ? 'Markaz Al Haqq' : 'Tareeq Al Haqq',
          formattedDate: event.is_ongoing
            ? 'Ongoing'
            : event.date
              ? new Date(event.date).toLocaleDateString('en-GB', { dateStyle: 'medium' })
              : 'To be announced',
          formattedTime: event.is_ongoing ? 'In progress' : event.time || 'To be announced',
          formattedLocation: isVirtual ? 'Virtual' : event.location || 'To be announced',
          hasFormEmbed: Boolean(event.form_embed_url),
        };
      }),
    [events],
  );

  return (
    <div className="glass-panel space-y-6 p-8 text-white">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="eyebrow">Events Manager</p>
          <h2 className="text-2xl font-semibold">Manage community gatherings</h2>
          <p className="text-sm text-white/70">
            {adminName ? `Hi ${adminName},` : 'Hi there,'} keep event details accurate for the public schedule.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {eventsTableLink && (
            <Button asChild variant="outline">
              <a href={eventsTableLink} target="_blank" rel="noreferrer">
                Open Supabase table
              </a>
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>Add event</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-slate-950 text-white">
              <DialogHeader>
                <DialogTitle>{editingEvent ? 'Edit event' : 'Create new event'}</DialogTitle>
                <DialogDescription className="text-white/60">
                  Provide the details for your upcoming gathering. Save to update the public events page.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="event-title">Title</Label>
                    <Input
                      id="event-title"
                      value={formState.title}
                      onChange={(event) => handleChange('title', event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-type">Event label</Label>
                    <select
                      id="event-type"
                      value={formState.event_type}
                      onChange={(event) => handleChange('event_type', event.target.value)}
                      className="flex h-10 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    >
                      <option value="tareeq">Tareeq Al Haqq</option>
                      <option value="markaz">Markaz Al Haqq</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="event-location">Location</Label>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-white/60">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formState.is_virtual}
                            onChange={(event) => {
                              const checked = event.target.checked;
                              setFormState((prev) => ({
                                ...prev,
                                is_virtual: checked,
                                location: checked ? 'Virtual' : '',
                              }));
                              if (checked) {
                                setTbaState((prev) => ({ ...prev, location: false }));
                                setLocationSuggestions([]);
                                setLocationQuery('Virtual');
                              } else {
                                setLocationQuery('');
                              }
                            }}
                          />
                          Virtual
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={tbaState.location}
                            onChange={(event) => {
                              const checked = event.target.checked;
                              setTbaState((prev) => ({ ...prev, location: checked }));
                              if (checked) {
                                setFormState((prev) => ({ ...prev, location: '' }));
                                setLocationSuggestions([]);
                              }
                            }}
                            disabled={formState.is_virtual}
                          />
                          To be announced
                        </label>
                      </div>
                    </div>
                    <Input
                      id="event-location"
                      value={formState.location}
                      onChange={(event) => handleChange('location', event.target.value)}
                      placeholder={
                        formState.is_virtual
                          ? 'Virtual'
                          : tbaState.location
                            ? 'To be announced'
                            : 'Search for a venue or address'
                      }
                      disabled={tbaState.location || formState.is_virtual}
                      required={!tbaState.location && !formState.is_virtual}
                    />
                    {!tbaState.location && !formState.is_virtual && (
                      <div className="space-y-1">
                        {isFetchingLocations && (
                          <p className="text-xs text-white/50">Searching maps for addresses…</p>
                        )}
                        {locationSuggestions.length > 0 && (
                          <div className="rounded-lg border border-white/10 bg-black/50">
                            {locationSuggestions.map((suggestion) => (
                              <button
                                key={suggestion}
                                type="button"
                                className="block w-full px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5"
                                onClick={() => applyLocationSuggestion(suggestion)}
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="event-date">Date</Label>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-white/60">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formState.is_ongoing}
                            onChange={(event) => {
                              const checked = event.target.checked;
                              setFormState((prev) => ({ ...prev, is_ongoing: checked }));
                            }}
                          />
                          Ongoing
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={tbaState.date}
                            onChange={(event) => {
                              const checked = event.target.checked;
                              setTbaState((prev) => ({ ...prev, date: checked }));
                              if (checked) {
                                setFormState((prev) => ({ ...prev, date: '' }));
                              }
                            }}
                          />
                          To be announced
                        </label>
                      </div>
                    </div>
                    <Input
                      id="event-date"
                      type="date"
                      value={formState.date}
                      onChange={(event) => handleChange('date', event.target.value)}
                      required={!tbaState.date}
                      disabled={tbaState.date}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="event-time">Time</Label>
                      <label className="flex items-center gap-2 text-xs text-white/60">
                        <input
                          type="checkbox"
                          checked={tbaState.time}
                          onChange={(event) => {
                            const checked = event.target.checked;
                            setTbaState((prev) => ({ ...prev, time: checked }));
                            if (checked) {
                              setFormState((prev) => ({ ...prev, time: '' }));
                            }
                          }}
                        />
                        To be announced
                      </label>
                    </div>
                    <Input
                      id="event-time"
                      type="time"
                      value={formState.time}
                      onChange={(event) => handleChange('time', event.target.value)}
                      disabled={tbaState.time}
                    />
                  </div>
                  {formState.is_virtual && (
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="event-form-embed">Virtual form embed URL</Label>
                      <Input
                        id="event-form-embed"
                        value={formState.form_embed_url}
                        onChange={(event) => handleChange('form_embed_url', event.target.value)}
                        placeholder="https://docs.google.com/forms/..."
                      />
                      <p className="text-xs text-white/50">
                        Paste the embed URL (iframe src) for your virtual event registration form. This will show a
                        “Fill out form now” button on the public events page.
                      </p>
                    </div>
                  )}
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="event-image">Image URL</Label>
                      <label className="flex items-center gap-2 text-xs text-white/60">
                        <input
                          type="checkbox"
                          checked={tbaState.image_url}
                          onChange={(event) => {
                            const checked = event.target.checked;
                            setTbaState((prev) => ({ ...prev, image_url: checked }));
                            if (checked) {
                              setFormState((prev) => ({ ...prev, image_url: '' }));
                            }
                          }}
                        />
                        To be announced
                      </label>
                    </div>
                    <Input
                      id="event-image"
                      value={formState.image_url}
                      onChange={(event) => handleChange('image_url', event.target.value)}
                      placeholder="https://"
                      disabled={tbaState.image_url}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-description">Description</Label>
                  <Textarea
                    id="event-description"
                    value={formState.description}
                    onChange={(event) => handleChange('description', event.target.value)}
                    rows={4}
                    required
                  />
                </div>
                <div className="flex flex-wrap justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving…' : 'Save event'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-lg border border-white/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white/60">Event</TableHead>
              <TableHead className="text-white/60">Label</TableHead>
              <TableHead className="text-white/60">Status</TableHead>
              <TableHead className="text-white/60">Date</TableHead>
              <TableHead className="text-white/60">Time</TableHead>
              <TableHead className="text-white/60">Location</TableHead>
              <TableHead className="text-right text-white/60">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {status === 'loading' && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-white/60">
                  Loading events…
                </TableCell>
              </TableRow>
            )}
            {status === 'ready' && events.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-white/60">
                  No events available yet.
                </TableCell>
              </TableRow>
            )}
            {status === 'ready' &&
              formattedEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="align-top">
                    <div className="space-y-1">
                      <p className="font-semibold text-white">{event.title}</p>
                      <p className="text-xs text-white/60">{event.description}</p>
                    </div>
                  </TableCell>
                  <TableCell className="align-top text-sm text-white/70">
                    <span className="inline-flex rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/70">
                      {event.eventLabel}
                    </span>
                  </TableCell>
                  <TableCell className="align-top text-sm text-white/70">
                    <div className="flex flex-col gap-2">
                      {event.is_ongoing && (
                        <span className="inline-flex w-fit rounded-full border border-primary/30 px-3 py-1 text-xs uppercase tracking-[0.3em] text-primary/80">
                          Ongoing
                        </span>
                      )}
                      {event.hasFormEmbed && (
                        <span className="inline-flex w-fit rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60">
                          Form embedded
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="align-top text-sm text-white/70">{event.formattedDate}</TableCell>
                  <TableCell className="align-top text-sm text-white/70">{event.formattedTime}</TableCell>
                  <TableCell className="align-top text-sm text-white/70">{event.formattedLocation}</TableCell>
                  <TableCell className="align-top text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => openEditDialog(event)}>
                        Edit
                      </Button>
                      <AlertDialog
                        open={deleteTarget?.id === event.id}
                        onOpenChange={(open) => {
                          if (!open) setDeleteTarget(null);
                        }}
                      >
                        <AlertDialogTrigger asChild>
                          <Button type="button" variant="destructive" onClick={() => setDeleteTarget(event)}>
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-950 text-white">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete {event.title}?</AlertDialogTitle>
                            <AlertDialogDescription className="text-white/60">
                              This action cannot be undone. The event will be removed from the public schedule.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel asChild>
                              <Button type="button" variant="outline">
                                Cancel
                              </Button>
                            </AlertDialogCancel>
                            <AlertDialogAction asChild>
                              <Button type="button" variant="destructive" disabled={isSubmitting} onClick={handleDelete}>
                                {isSubmitting ? 'Deleting…' : 'Delete'}
                              </Button>
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
