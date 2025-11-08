import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { videoPlaceholders, upcomingEvents, photoGalleries } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight, PlayCircle } from "lucide-react";

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');
  const welcomeImage = PlaceHolderImages.find(p => p.id === 'welcome');

  return (
    <div className="flex flex-col">
      <section className="relative h-[60vh] w-full">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white p-4">
            <h1 className="text-4xl md:text-6xl font-bold font-headline">Welcome to Rahmaniyyah</h1>
            <p className="mt-4 text-lg md:text-xl">A center for spiritual learning and community</p>
            <Button asChild className="mt-8" size="lg">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold">Welcome to Our Community</h2>
            <p>
              Al-Tariqa Al-Rahmaniyyah is a spiritual path rooted in the teachings of the Quran and Sunnah, focused on the purification of the heart and the development of a deep connection with God.
            </p>
            <p>
              We are a community dedicated to learning, worship, and service, following the guidance of our esteemed scholars.
            </p>
            <Button asChild variant="link" className="px-0 text-lg">
              <Link href="/about">Read more about our history <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
          {welcomeImage && (
             <div className="rounded-lg overflow-hidden shadow-lg">
                <Image
                    src={welcomeImage.imageUrl}
                    alt={welcomeImage.description}
                    data-ai-hint={welcomeImage.imageHint}
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover"
                />
             </div>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Latest Videos</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {videoPlaceholders.slice(0, 3).map((video) => (
              <Card key={video.id} className="overflow-hidden group">
                <Link href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">
                  <div className="relative">
                    <Image
                      src={video.thumbnail.imageUrl}
                      alt={video.thumbnail.description}
                      data-ai-hint={video.thumbnail.imageHint}
                      width={640}
                      height={360}
                      className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                       <PlayCircle className="h-16 w-16 text-white/80 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{video.title}</CardTitle>
                  </CardHeader>
                </Link>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild>
              <Link href="/media/videos">View All Videos</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card">
         <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Photo Galleries</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {photoGalleries.slice(0, 3).map((gallery) => (
              <Card key={gallery.id} className="overflow-hidden group">
                <Link href={`/media/photos/${gallery.id}`}>
                  <Image
                    src={gallery.coverImage.imageUrl}
                    alt={gallery.coverImage.description}
                    data-ai-hint={gallery.coverImage.imageHint}
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <CardHeader>
                    <CardTitle className="text-lg">{gallery.name}</CardTitle>
                  </CardHeader>
                </Link>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild>
              <Link href="/media/photos">View All Galleries</Link>
            </Button>
          </div>
        </div>
      </section>
      
      <section className="py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Upcoming Events</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="flex flex-col md:flex-row overflow-hidden">
                <Image
                  src={event.image.imageUrl}
                  alt={event.image.description}
                  data-ai-hint={event.image.imageHint}
                  width={600}
                  height={400}
                  className="w-full md:w-1/3 h-auto object-cover"
                />
                <div className="flex flex-col p-6">
                  <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                  <p className="text-muted-foreground mb-1">{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="text-muted-foreground mb-4">{event.location}</p>
                  <p className="flex-grow">{event.description}</p>
                  <Button asChild className="mt-4 self-start">
                    <Link href="/events">Event Details</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
           <div className="text-center mt-8">
            <Button asChild>
              <Link href="/events">View All Events</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
