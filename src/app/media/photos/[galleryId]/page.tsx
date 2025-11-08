"use client";

import { useState } from "react";
import Image from "next/image";
import { photoGalleries } from "@/lib/data";
import type { ImagePlaceholder } from "@/lib/placeholder-images";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { notFound } from "next/navigation";

export default function GalleryPage({ params }: { params: { galleryId: string } }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImagePlaceholder | null>(null);

  const gallery = photoGalleries.find((g) => g.id === params.galleryId);

  if (!gallery) {
    notFound();
  }

  const openLightbox = (image: ImagePlaceholder) => {
    setSelectedImage(image);
    setLightboxOpen(true);
  };

  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold tracking-tight text-center font-headline lg:text-5xl mb-4">
        {gallery.name}
      </h1>
      <p className="text-center text-muted-foreground text-lg mb-12">{gallery.description}</p>
      
      {gallery.images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.images.map((image, index) => (
            <div
                key={index}
                className="group relative cursor-pointer overflow-hidden rounded-lg shadow-md"
                onClick={() => openLightbox(image)}
            >
                <Image
                src={image.imageUrl}
                alt={image.description}
                data-ai-hint={image.imageHint}
                width={800}
                height={600}
                className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
            <p>No images in this gallery yet. Please check back later.</p>
        </div>
      )}


      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-2">
          {selectedImage && (
            <Image
              src={selectedImage.imageUrl}
              alt={selectedImage.description}
              data-ai-hint={selectedImage.imageHint}
              width={1600}
              height={1200}
              className="w-full h-auto object-contain max-h-[85vh]"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
