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

type ProjectRecord = {
  id: string;
  title: string;
  description: string;
  tag: string | null;
  href: string | null;
  display_order: number | null;
  is_published: boolean | null;
  created_at: string;
};

const emptyForm = {
  title: '',
  description: '',
  tag: '',
  href: '/active-projects',
  display_order: '',
  is_published: true,
};

type FormState = typeof emptyForm;

type ProjectsManagerProps = {
  adminName?: string;
};

export function ProjectsManager({ adminName }: ProjectsManagerProps) {
  const { toast } = useToast();
  const projectsTableLink = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return null;
    try {
      const host = new URL(supabaseUrl).host;
      const projectRef = host.split('.')[0];
      if (!projectRef) return null;
      return `https://app.supabase.com/project/${projectRef}/editor?schema=public&table=projects`;
    } catch {
      return null;
    }
  }, []);

  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>(emptyForm);

  const loadProjects = useCallback(async () => {
    setStatus('loading');
    setErrorMessage(null);
    try {
      const response = await fetch('/api/admin/projects');
      const payload = (await response.json().catch(() => null)) as { error?: string; projects?: ProjectRecord[] } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Unable to load projects.');
      }

      setProjects(payload?.projects ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load projects.';
      setErrorMessage(message);
      toast({
        title: 'Projects manager unavailable',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setStatus('ready');
    }
  }, [toast]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const openCreateDialog = () => {
    setEditingProject(null);
    setFormState(emptyForm);
    setIsDialogOpen(true);
  };

  const openEditDialog = (project: ProjectRecord) => {
    setEditingProject(project);
    setFormState({
      title: project.title,
      description: project.description,
      tag: project.tag ?? '',
      href: project.href ?? '/active-projects',
      display_order: project.display_order?.toString() ?? '',
      is_published: Boolean(project.is_published),
    });
    setIsDialogOpen(true);
  };

  const handleChange = (field: keyof FormState, value: string | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        title: formState.title,
        description: formState.description,
        tag: formState.tag,
        href: formState.href,
        display_order: formState.display_order,
        is_published: formState.is_published,
      };

      const endpoint = editingProject ? `/api/admin/projects/${editingProject.id}` : '/api/admin/projects';
      const method = editingProject ? 'PUT' : 'POST';
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const responseData = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(responseData?.error ?? 'Unable to save project.');
      }

      toast({
        title: editingProject ? 'Project updated' : 'Project created',
        description: 'Project details are now available on the public projects page.',
      });
      setIsDialogOpen(false);
      setEditingProject(null);
      setFormState(emptyForm);
      await loadProjects();
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Please try again.',
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
      const response = await fetch(`/api/admin/projects/${deleteTarget.id}`, { method: 'DELETE' });
      const responseData = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(responseData?.error ?? 'Unable to delete project.');
      }

      toast({
        title: 'Project deleted',
        description: 'The project has been removed from the public list.',
      });
      setDeleteTarget(null);
      await loadProjects();
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel space-y-6 p-8 text-white">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="eyebrow">Projects Manager</p>
          <h2 className="text-2xl font-semibold">Manage landing and projects page cards</h2>
          <p className="text-sm text-white/70">
            {adminName ? `Hi ${adminName},` : 'Hi there,'} update project cards shown on the home page and /active-projects.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {projectsTableLink && (
            <Button asChild variant="outline">
              <a href={projectsTableLink} target="_blank" rel="noreferrer">
                Open Supabase table
              </a>
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>Add project</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-slate-950 text-white">
              <DialogHeader>
                <DialogTitle>{editingProject ? 'Edit project' : 'Create project'}</DialogTitle>
                <DialogDescription className="text-white/60">
                  Published projects appear on the landing page and active projects page.
                </DialogDescription>
              </DialogHeader>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="project-title">Title</Label>
                    <Input id="project-title" value={formState.title} onChange={(event) => handleChange('title', event.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-tag">Tag</Label>
                    <Input id="project-tag" value={formState.tag} onChange={(event) => handleChange('tag', event.target.value)} placeholder="Education" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-description">Description</Label>
                  <Textarea
                    id="project-description"
                    rows={4}
                    value={formState.description}
                    onChange={(event) => handleChange('description', event.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="project-link">Project link</Label>
                    <Input id="project-link" value={formState.href} onChange={(event) => handleChange('href', event.target.value)} placeholder="/active-projects" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-order">Display order</Label>
                    <Input
                      id="project-order"
                      type="number"
                      value={formState.display_order}
                      onChange={(event) => handleChange('display_order', event.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={formState.is_published}
                    onChange={(event) => handleChange('is_published', event.target.checked)}
                    className="h-4 w-4 rounded border-white/30 bg-transparent"
                  />
                  Publish this project
                </label>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : editingProject ? 'Save changes' : 'Create project'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          Could not read the <code>projects</code> table yet ({errorMessage}). Create a <code>projects</code> table in Supabase
          with columns matching this manager to enable full editing.
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Tag</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {status === 'loading' ? (
              <TableRow>
                <TableCell colSpan={5} className="text-white/60">
                  Loading projects...
                </TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-white/60">
                  No projects found. Add your first project.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <p className="font-medium text-white">{project.title}</p>
                    <p className="line-clamp-2 max-w-sm text-xs text-white/55">{project.description}</p>
                  </TableCell>
                  <TableCell>{project.tag || '—'}</TableCell>
                  <TableCell>{project.is_published ? 'Published' : 'Draft'}</TableCell>
                  <TableCell>{project.display_order ?? '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => openEditDialog(project)}>
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(project)}>
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-950 text-white">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete project?</AlertDialogTitle>
                            <AlertDialogDescription className="text-white/65">
                              This will permanently remove “{deleteTarget?.title ?? project.title}”.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting}>
                              {isSubmitting ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
