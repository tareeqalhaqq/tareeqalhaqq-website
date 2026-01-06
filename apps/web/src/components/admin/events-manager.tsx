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
  location: string;
  date: string;
  time: string | null;
  image_url: string | null;
  created_at: string;
};

const emptyForm = {
  title: '',
  description: '',
  location: '',
  date: '',
  time: '',
  image_url: '',
};

type FormState = typeof emptyForm;

type EventsManagerProps = {
  adminName?: string;
};

export function EventsManager({ adminName }: EventsManagerProps) {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [formState, setFormState] = useState<FormState>(emptyForm);
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EventRecord | null>(null);

  const loadEvents = useCallback(async () => {
    setStatus('loading');
    try {
      const response = await fetch('/api/admin/events');
      if (!response.ok) {
        throw new Error('Unable to load events.');
      }
      const payload = (await response.json()) as { events: EventRecord[] };
      setEvents(payload.events ?? []);
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
    setIsDialogOpen(true);
  };

  const openEditDialog = (event: EventRecord) => {
    setEditingEvent(event);
    setFormState({
      title: event.title,
      description: event.description,
      location: event.location,
      date: event.date,
      time: event.time ?? '',
      image_url: event.image_url ?? '',
    });
    setIsDialogOpen(true);
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(editingEvent ? `/api/admin/events/${editingEvent.id}` : '/api/admin/events', {
        method: editingEvent ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formState,
          time: formState.time || null,
          image_url: formState.image_url || null,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || 'Unable to save the event.');
      }

      toast({
        title: editingEvent ? 'Event updated' : 'Event created',
        description: 'Your event details have been saved.',
      });
      setIsDialogOpen(false);
      setEditingEvent(null);
      setFormState(emptyForm);
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
      const response = await fetch(`/api/admin/events/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || 'Unable to delete the event.');
      }

      toast({
        title: 'Event deleted',
        description: 'The event has been removed.',
      });
      setDeleteTarget(null);
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
      events.map((event) => ({
        ...event,
        formattedDate: event.date ? new Date(event.date).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : '—',
      })),
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
                  <Label htmlFor="event-location">Location</Label>
                  <Input
                    id="event-location"
                    value={formState.location}
                    onChange={(event) => handleChange('location', event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-date">Date</Label>
                  <Input
                    id="event-date"
                    type="date"
                    value={formState.date}
                    onChange={(event) => handleChange('date', event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-time">Time</Label>
                  <Input
                    id="event-time"
                    type="time"
                    value={formState.time}
                    onChange={(event) => handleChange('time', event.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="event-image">Image URL</Label>
                  <Input
                    id="event-image"
                    value={formState.image_url}
                    onChange={(event) => handleChange('image_url', event.target.value)}
                    placeholder="https://"
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

      <div className="rounded-lg border border-white/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white/60">Event</TableHead>
              <TableHead className="text-white/60">Date</TableHead>
              <TableHead className="text-white/60">Time</TableHead>
              <TableHead className="text-white/60">Location</TableHead>
              <TableHead className="text-right text-white/60">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {status === 'loading' && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-white/60">
                  Loading events…
                </TableCell>
              </TableRow>
            )}
            {status === 'ready' && events.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-white/60">
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
                  <TableCell className="align-top text-sm text-white/70">{event.formattedDate}</TableCell>
                  <TableCell className="align-top text-sm text-white/70">{event.time || '—'}</TableCell>
                  <TableCell className="align-top text-sm text-white/70">{event.location}</TableCell>
                  <TableCell className="align-top text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => openEditDialog(event)}>
                        Edit
                      </Button>
                      <AlertDialog>
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
