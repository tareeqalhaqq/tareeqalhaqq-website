'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { academyCourses } from '@/lib/data';
import { createClient } from '@/utils/supabase/clients';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email('Please provide a valid email.'),
  password: z.string().min(6, 'Passwords are at least 6 characters.'),
  confirmPassword: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SignInPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUserEmail(session?.user.email ?? null);
      if (session) {
        router.replace('/mobile');
      }
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUserEmail(session?.user.email ?? null);

      if (event === 'SIGNED_IN') {
        setStatus('success');
        router.push('/mobile');
      }

      if (event === 'SIGNED_OUT') {
        setStatus('idle');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  const availableCourses = useMemo(() => academyCourses, []);

  useEffect(() => {
    form.clearErrors();
    setErrorMessage(null);
    form.setValue('password', '');
    form.setValue('confirmPassword', '');
  }, [authMode, form]);

  const handleSubmit = async (values: FormValues) => {
    setStatus('loading');
    setErrorMessage(null);
    try {
      if (authMode === 'signup') {
        if (!values.confirmPassword) {
          form.setError('confirmPassword', { type: 'manual', message: 'Please confirm your password.' });
          setStatus('idle');
          return;
        }
        if (values.password !== values.confirmPassword) {
          form.setError('confirmPassword', { type: 'manual', message: 'Passwords must match.' });
          setStatus('idle');
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
        });

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (error) {
          throw error;
        }
      }
      setStatus('success');
      router.push('/mobile');
    } catch (error) {
      const message = (error as { message?: string }).message;
      setErrorMessage(message ?? 'Unable to sign in. Please verify your details and try again.');
      setStatus('idle');
    }
  };

  const handleSignOut = async () => {
    setStatus('loading');
    await supabase.auth.signOut();
    form.reset();
    setUserEmail(null);
    setStatus('idle');
  };

  const handleResetPassword = async () => {
    if (!form.getValues('email')) {
      setErrorMessage('Enter your email above before requesting a reset link.');
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(form.getValues('email'));

      if (error) {
        throw error;
      }

      setErrorMessage('Password reset link sent. Please check your inbox.');
    } catch (error) {
      const message = (error as { message?: string }).message;
      setErrorMessage(message ?? 'Unable to send reset email. Please try again later.');
    }
  };

  return (
    <section className="page-section">
      <div className="page-section__inner mx-auto max-w-6xl space-y-12">
        <div className="space-y-4 text-center">
          <p className="eyebrow">Member Access</p>
          <h1 className="text-4xl uppercase tracking-[0.2em] text-white md:text-5xl">Sign In</h1>
          <p className="text-base text-white/70">
            Access your personalised Academy dashboard and pick up where you left off with our curated learning tracks.
          </p>
        </div>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-6">
            <div className="glass-panel space-y-6 p-8">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {authMode === 'signin' ? 'Secure Login' : 'Create an Account'}
                    </h2>
                    <p className="text-sm text-white/60">
                      {authMode === 'signin'
                        ? 'Authenticate with your Academy credentials to unlock your courses.'
                        : 'Register with your email to unlock the Academy portal instantly.'}
                    </p>
                  </div>
                  <div className="rounded-full bg-white/5 p-1 text-xs text-white/70">
                    <button
                      type="button"
                      className={`rounded-full px-3 py-1 font-semibold transition ${
                        authMode === 'signin' ? 'bg-white text-slate-900' : 'text-white/70'
                      }`}
                      onClick={() => setAuthMode('signin')}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      className={`rounded-full px-3 py-1 font-semibold transition ${
                        authMode === 'signup' ? 'bg-white text-slate-900' : 'text-white/70'
                      }`}
                      onClick={() => setAuthMode('signup')}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              </div>
              {userEmail ? (
                <div className="space-y-4 text-white">
                  <p className="text-sm text-white/70">Signed in as</p>
                  <p className="text-lg font-semibold">{userEmail}</p>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleSignOut} variant="secondary">
                      Sign Out
                    </Button>
                  </div>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">Authenticated</p>
                </div>
              ) : (
                <Form {...form}>
                  <form className="space-y-5" onSubmit={form.handleSubmit(handleSubmit)}>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" autoComplete="email" placeholder="you@example.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" autoComplete="current-password" placeholder="••••••••" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {authMode === 'signup' && (
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" autoComplete="new-password" placeholder="••••••••" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <div className="flex items-center justify-between text-sm text-white/70">
                      {authMode === 'signin' ? (
                        <button type="button" onClick={handleResetPassword} className="underline-offset-4 hover:underline">
                          Forgot password?
                        </button>
                      ) : (
                        <span>Already registered? Switch to sign in.</span>
                      )}
                    </div>
                    <Button className="w-full" type="submit" disabled={status === 'loading'}>
                      {status === 'loading'
                        ? authMode === 'signin'
                          ? 'Signing In…'
                          : 'Creating Account…'
                        : authMode === 'signin'
                          ? 'Access Dashboard'
                          : 'Create Account'}
                    </Button>
                  </form>
                </Form>
              )}
              {errorMessage && (
                <p className="text-sm text-rose-300" role="status">
                  {errorMessage}
                </p>
              )}
              {status === 'success' && !userEmail && (
                <p className="text-sm text-emerald-400">Successfully authenticated.</p>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="eyebrow">Available Courses</p>
              <h2 className="text-2xl font-semibold text-white">Start learning right away</h2>
              <p className="text-sm text-white/60">
                These pilot cohorts are ready for early access members. Sign in to join a track or bookmark your spot.
              </p>
            </div>
            <div className="space-y-4">
              {availableCourses.map((course) => (
                <div key={course.id} className="glass-panel space-y-3 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-lg font-semibold text-white">{course.title}</p>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70">
                      {course.level}
                    </span>
                  </div>
                  <p className="text-sm text-white/70">{course.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-white/60">
                    <span className="rounded-full bg-white/5 px-3 py-1">{course.duration}</span>
                    <span className="rounded-full bg-white/5 px-3 py-1">{course.format}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
