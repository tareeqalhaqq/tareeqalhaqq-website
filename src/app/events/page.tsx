import Image from "next/image";
import { upcomingEvents } from "@/lib/data";
import { Calendar, MapPin } from "lucide-react";

export default function EventsPage() {
  return (
    <section className="page-section">
      <div className="page-section__inner space-y-12">
        <div className="space-y-4 text-center">
          <p className="eyebrow">Gatherings</p>
          <h1 className="text-4xl uppercase tracking-[0.2em] text-white md:text-5xl">Upcoming Events</h1>
          <p className="mx-auto max-w-3xl text-base text-white/70">
            Join us for evenings of remembrance, community, and scholarship carefully curated to reflect the ambience of our most cherished gatherings.
          </p>
        </div>

        <div className="space-y-10">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="glass-panel overflow-hidden p-0">
              <div className="grid gap-0 md:grid-cols-[1.1fr_1.2fr]">
                <div className="relative h-full min-h-[240px]">
                  <Image
                    src={event.image.imageUrl}
                    alt={event.image.description}
                    data-ai-hint={event.image.imageHint}
                    width={600}
                    height={400}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <p className="absolute bottom-4 left-4 text-xs uppercase tracking-[0.4em] text-white/60">Tareeq Al Haqq Gathering</p>
                </div>
                <div className="flex flex-col justify-between space-y-6 p-8">
                  <div className="space-y-4">
                    <h2 className="text-2xl font-headline uppercase tracking-[0.2em] text-white">{event.title}</h2>
                    <div className="flex flex-col gap-3 text-sm text-white/70 md:flex-row md:items-center">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        {new Date(event.date).toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })}
                      </span>
                      <span className="hidden h-1 w-1 rounded-full bg-primary/60 md:inline-block" />
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        {event.location}
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
