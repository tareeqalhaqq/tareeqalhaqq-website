"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuthProfile } from "@/hooks/use-auth-profile";
import { createBrowserClient } from "@/lib/supabase/client";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

export function ContactForm() {
  const { toast } = useToast();
  const { status, user, profile } = useAuthProfile();
  const supabase = useMemo(() => createBrowserClient(), []);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: profile?.full_name ?? "",
      email: user?.email ?? "",
      subject: "",
      message: "",
    },
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (profile?.full_name && !form.getValues("name")) {
      form.setValue("name", profile.full_name);
    }
    if (user?.email && !form.getValues("email")) {
      form.setValue("email", user.email);
    }
  }, [form, profile?.full_name, status, user?.email]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitError(null);

    if (status !== "authenticated") {
      setSubmitError("Please sign in to send a message.");
      toast({
        title: "Sign in required",
        description: "Please sign in before sending a message.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("contact_messages").insert({
      name: values.name,
      email: values.email,
      subject: values.subject,
      message: values.message,
      status: "unread",
    });

    if (error) {
      setSubmitError("We could not send your message. Please try again.");
      toast({
        title: "Message Failed",
        description: "We could not send your message. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We will get back to you shortly.",
    });
    form.reset();
  }

  return (
    <div className="glass-panel w-full max-w-2xl space-y-6 text-left">
      <div className="space-y-2">
        <h2 className="text-2xl font-headline uppercase tracking-[0.2em] text-white">Send us a Message</h2>
        <p className="text-sm text-white/70">We would love to hear from you. Please fill out the form and our team will respond shortly.</p>
      </div>
      {status === "unauthenticated" && (
        <div className="rounded-3xl border border-white/10 bg-black/40 p-6 text-sm text-white/70">
          <p className="text-base font-semibold text-white">Sign in to continue</p>
          <p className="mt-1 text-white/70">Please sign in to send a message to the team.</p>
          <Button asChild className="mt-4 w-full">
            <a href="/login">Sign in</a>
          </Button>
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase tracking-[0.3em] text-xs text-white/70">Name</FormLabel>
                <FormControl>
                  <Input className="rounded-full border-white/20 bg-black/40 text-white" placeholder="Your Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase tracking-[0.3em] text-xs text-white/70">Email</FormLabel>
                <FormControl>
                  <Input className="rounded-full border-white/20 bg-black/40 text-white" placeholder="your.email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase tracking-[0.3em] text-xs text-white/70">Subject</FormLabel>
                <FormControl>
                  <Input className="rounded-full border-white/20 bg-black/40 text-white" placeholder="Regarding..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase tracking-[0.3em] text-xs text-white/70">Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Your message..."
                    className="min-h-[150px] rounded-3xl border-white/20 bg-black/40 text-white"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {submitError && <p className="text-sm text-red-200">{submitError}</p>}
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || status !== "authenticated"}
            className="w-full rounded-full bg-gradient-to-r from-primary via-amber-400 to-primary text-sm font-semibold uppercase tracking-[0.35em] text-primary-foreground shadow-lg shadow-black/40 transition hover:scale-[1.01]"
          >
            {form.formState.isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
