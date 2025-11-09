import { notFound } from "next/navigation";
import { photoGalleries } from "@/lib/data";
import { GalleryClient } from "./gallery-client";

type GalleryPageParams = Promise<{ galleryId: string }>;

export default async function GalleryPage({ params }: { params: GalleryPageParams }) {
  const { galleryId } = await params;
  const gallery = photoGalleries.find((g) => g.id === galleryId);

  if (!gallery) {
    notFound();
  }

  return <GalleryClient gallery={gallery} />;
}
