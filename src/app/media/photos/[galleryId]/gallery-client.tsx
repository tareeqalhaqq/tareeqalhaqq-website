"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { ImagePlaceholder } from "@/lib/placeholder-images";
import type { PhotoGallery } from "@/lib/data";

type GalleryClientProps = {
  gallery: PhotoGallery;
};

export function GalleryClient({ gallery }: GalleryClientProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImagePlaceholder | null>(null);

  const openLightbox = (image: ImagePlaceholder) => {
    setSelectedImage(image);
    setLightboxOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-center text-4xl font-headline font-extrabold tracking-tight lg:text-5xl">
        {gallery.name}
      </h1>
      <p className="mb-12 text-center text-lg text-muted-foreground">{gallery.description}</p>

      {gallery.images.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {gallery.images.map((image, index) => (
            <button
              key={`${image.id}-${index}`}
              type="button"
              className="group relative cursor-pointer overflow-hidden rounded-lg shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => openLightbox(image)}
            >
              <Image
                src={image.imageUrl}
                alt={image.description}
                data-ai-hint={image.imageHint}
                width={800}
                height={600}
                className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
              />
              <span className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-muted-foreground">
          <p>No images in this gallery yet. Please check back later.</p>
        </div>
      )}

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl p-2">
          {selectedImage && (
            <Image
              src={selectedImage.imageUrl}
              alt={selectedImage.description}
              data-ai-hint={selectedImage.imageHint}
              width={1600}
              height={1200}
              className="h-auto max-h-[85vh] w-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
