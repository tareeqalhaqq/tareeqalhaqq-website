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
import { useToast } from "@/hooks/use-toast";

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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
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
          <Button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-primary via-amber-400 to-primary text-sm font-semibold uppercase tracking-[0.35em] text-primary-foreground shadow-lg shadow-black/40 transition hover:scale-[1.01]"
          >
            Send Message
          </Button>
        </form>
      </Form>
    </div>
  );
}
