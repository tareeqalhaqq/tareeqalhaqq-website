import Image from "next/image";
import { upcomingEvents } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";

export default function EventsPage() {
  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold tracking-tight text-center font-headline lg:text-5xl mb-12">
        Upcoming Events
      </h1>

      <div className="space-y-8 max-w-4xl mx-auto">
        {upcomingEvents.map((event) => (
          <Card key={event.id} className="overflow-hidden shadow-lg transition-shadow hover:shadow-xl">
            <div className="grid md:grid-cols-3">
              <div className="md:col-span-1">
                <Image
                  src={event.image.imageUrl}
                  alt={event.image.description}
                  data-ai-hint={event.image.imageHint}
                  width={600}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-muted-foreground mb-2">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>{new Date(event.date).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground mb-4">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{event.location}</span>
                  </div>
                  <CardDescription className="text-base text-foreground">{event.description}</CardDescription>
                </CardContent>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
