import Image from "next/image";
import Link from "next/link";
import { photoGalleries } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function PhotoGalleriesPage() {
  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold tracking-tight text-center font-headline lg:text-5xl mb-12">
        Photo Galleries
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {photoGalleries.map((gallery) => (
          <Card key={gallery.id} className="overflow-hidden group transition-shadow hover:shadow-xl">
            <Link href={`/media/photos/${gallery.id}`}>
              <div className="overflow-hidden">
                <Image
                  src={gallery.coverImage.imageUrl}
                  alt={gallery.coverImage.description}
                  data-ai-hint={gallery.coverImage.imageHint}
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                />
              </div>
              <CardHeader>
                <CardTitle>{gallery.name}</CardTitle>
                <CardDescription>{gallery.description}</CardDescription>
              </CardHeader>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
