import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

function getImage(id: string): ImagePlaceholder {
  const img = PlaceHolderImages.find((p) => p.id === id);
  if (!img) {
    console.warn(`Image with id "${id}" not found. Using default.`);
    return {
      id: 'default',
      description: 'Default placeholder',
      imageUrl: 'https://picsum.photos/seed/default/600/400',
      imageHint: 'placeholder image',
    };
  }
  return img;
}

export const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Academy', href: '/academy' },
  {
    name: 'Media',
    subLinks: [
      { name: 'Photos', href: '/media/photos' },
      { name: 'Videos', href: '/media/videos' },
    ],
  },
  { name: 'Events', href: '/events' },
  { name: 'Contact', href: '/contact' },
  { name: 'Sign In', href: '/signin' },
];

export const socialLinks = [
  { name: 'Facebook', href: '#', icon: 'Facebook' },
  { name: 'Twitter', href: '#', icon: 'Twitter' },
  { name: 'Youtube', href: '#', icon: 'Youtube' },
  { name: 'Instagram', href: '#', icon: 'Instagram' },
];

export const upcomingEvents = [
  {
    id: 1,
    title: 'Foundations of Fiqh Workshop',
    date: '2024-08-10T19:00:00Z',
    location: 'Learning Studio, Knowledge City',
    description:
      'An interactive session that walks through essential rulings for everyday worship with practical case studies and references.',
    image: getImage('event1'),
  },
  {
    id: 2,
    title: 'Curating Your Digital Library',
    date: '2024-08-17T20:00:00Z',
    location: 'Online Webinar',
    description:
      'Learn how to organise research notes, track reading goals, and make the most of the Tareeq Al Haqq app tools.',
    image: getImage('event2'),
  },
  {
    id: 3,
    title: 'Evening of Classical Texts',
    date: '2024-08-25T18:30:00Z',
    location: 'Community Hub Library',
    description:
      'Discover recommended commentaries, curated book lists, and guided reading plans for seekers at every stage.',
    image: getImage('event3'),
  },
];

export const videoPlaceholders = [
  {
    id: 'O32b3i-aRdA',
    title: 'How to Build a Reading Routine',
    description: 'Tips on establishing consistent study habits using the in-app library and note-taking features.',
    thumbnail: getImage('video1'),
  },
  {
    id: '3tmd-ClafbY',
    title: 'Exploring Authentic Athkar',
    description: 'A walkthrough of verified daily supplications and how the platform sources each reference.',
    thumbnail: getImage('video2'),
  },
  {
    id: 'OQdAZ26-9iI',
    title: 'Ask a Teacher: Practical Fiqh',
    description: 'A moderated session on common fiqh scenarios answered by qualified teachers.',
    thumbnail: getImage('video3'),
  },
];

export const photoGalleries = [
  {
    id: 'library-launch-2024',
    name: 'Library Launch 2024',
    description: 'Highlights from introducing the curated digital and print collection to the community.',
    coverImage: getImage('gallery1cover'),
    images: [getImage('gallery1_1'), getImage('gallery1_2'), getImage('gallery1_3'), getImage('gallery1_4')],
  },
  {
    id: 'study-retreat-2023',
    name: 'Study Retreat 2023',
    description: 'A focused weekend dedicated to reading, research, and collaborative learning.',
    coverImage: getImage('gallery2cover'),
    images: [getImage('gallery2_1'), getImage('gallery2_2')],
  },
  {
    id: 'community-seminar-2024',
    name: 'Community Seminar 2024',
    description: 'Scenes from our annual seminar exploring prophetic guidance through authenticated sources.',
    coverImage: getImage('gallery3cover'),
    images: [getImage('event1'), getImage('event2'), getImage('event3')],
  },
];

export type PhotoGallery = (typeof photoGalleries)[number];

// For search functionality
export const allContent = [
  ...upcomingEvents.map((event) => ({
    type: 'Event',
    title: event.title,
    description: event.description,
    href: '/events',
  })),
  ...videoPlaceholders.map((video) => ({
    type: 'Video',
    title: video.title,
    description: video.description,
    href: '/media/videos',
  })),
  ...photoGalleries.map((gallery) => ({
    type: 'Gallery',
    title: gallery.name,
    description: gallery.description,
    href: `/media/photos/${gallery.id}`,
  })),
];
