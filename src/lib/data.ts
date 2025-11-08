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
  { name: 'About Us', href: '/about' },
  { 
    name: 'Media', 
    subLinks: [
      { name: 'Photos', href: '/media/photos' },
      { name: 'Videos', href: '/media/videos' },
    ]
  },
  { name: 'Events', href: '/events' },
  { name: 'Contact Us', href: '/contact' },
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
    title: 'Weekly Dhikr Gathering',
    date: '2024-08-10T19:00:00Z',
    location: 'Main Prayer Hall',
    description: 'Join us for our weekly session of dhikr and spiritual remembrance, a time for reflection and community connection.',
    image: getImage('event1'),
  },
  {
    id: 2,
    title: 'Lecture by Shaykh Muhammad',
    date: '2024-08-17T20:00:00Z',
    location: 'Online via Zoom',
    description: 'An inspiring lecture on the life of the Prophet Muhammad (PBUH) and its relevance in our modern lives.',
    image: getImage('event2'),
  },
  {
    id: 3,
    title: 'Family Day & BBQ',
    date: '2024-08-25T13:00:00Z',
    location: 'Community Park',
    description: 'A fun day for the whole family with games, food, and good company. All are welcome!',
    image: getImage('event3'),
  },
];

export const videoPlaceholders = [
  { id: 'O32b3i-aRdA', title: 'Spiritual Guidance Series: Part 1', description: 'An introduction to the path of spiritual purification.', thumbnail: getImage('video1') },
  { id: '3tmd-ClafbY', title: 'The Beauty of Recitation', description: 'A soul-stirring Quran recitation by a world-renowned Qari.', thumbnail: getImage('video2') },
  { id: 'OQdAZ26-9iI', title: 'Community Q&A Session', description: 'Answers to common spiritual questions from the community, with Shaykh Abdullah.', thumbnail: getImage('video3') },
];

export const photoGalleries = [
  { id: 'mawlid-celebration-2024', name: 'Mawlid Celebration 2024', description: 'Photos from our annual Mawlid event, celebrating the birth of the Prophet (PBUH).', coverImage: getImage('gallery1cover'), images: [getImage('gallery1_1'), getImage('gallery1_2'), getImage('gallery1_3'), getImage('gallery1_4')] },
  { id: 'spiritual-retreat-2023', name: 'Spiritual Retreat 2023', description: 'A journey of reflection and peace in the serene countryside.', coverImage: getImage('gallery2cover'), images: [getImage('gallery2_1'), getImage('gallery2_2')] },
  { id: 'community-iftar-2024', name: 'Community Iftar 2024', description: 'Sharing blessings and breaking bread together during the holy month of Ramadan.', coverImage: getImage('gallery3cover'), images: [getImage('event1'), getImage('event2'), getImage('event3')] },
];

// For search functionality
export const allContent = [
    ...upcomingEvents.map(e => ({ type: 'Event', title: e.title, description: e.description, href: `/events`})),
    ...videoPlaceholders.map(v => ({ type: 'Video', title: v.title, description: v.description, href: `/media/videos`})),
    ...photoGalleries.map(g => ({ type: 'Gallery', title: g.name, description: g.description, href: `/media/photos/${g.id}`}))
];
