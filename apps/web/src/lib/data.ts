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

// For search functionality
export type AcademyCourse = {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  description: string;
  format: string;
};

export const academyCourses: AcademyCourse[] = [
  {
    id: 'intro-hadith',
    title: 'Hadith Foundations',
    level: 'Beginner',
    duration: '4 weeks',
    description:
      'Learn the core terminology, major collections, and practical study habits for approaching narrations with confidence.',
    format: 'Live sessions + reference library',
  },
  {
    id: 'fiqh-pathways',
    title: 'Practical Fiqh Pathways',
    level: 'Intermediate',
    duration: '6 weeks',
    description:
      'A structured walkthrough of worship rulings with guided case studies, juristic maxims, and curated reading plans.',
    format: 'Guided cohorts + weekly labs',
  },
  {
    id: 'textual-precision',
    title: 'Textual Precision Lab',
    level: 'Advanced',
    duration: '8 weeks',
    description:
      'Develop research-grade note-taking workflows that connect scans, translations, and classical commentaries inside the app.',
    format: 'Project-based mentorship',
  },
];

export const allContent = [
  ...upcomingEvents.map((event) => ({
    type: 'Event',
    title: event.title,
    description: event.description,
    href: '/events',
  })),
  { type: 'About', title: 'About Tareeq Al Haqq', description: 'Learn about our mission, vision, and values.', href: '/about' },
  { type: 'Academy', title: 'Academy Overview', description: 'Discover courses and structured learning tracks.', href: '/academy' },
  { type: 'Contact', title: 'Connect with Us', description: 'Reach out for guidance, support, or collaboration.', href: '/contact' },
  ...academyCourses.map((course) => ({
    type: 'Course',
    title: course.title,
    description: course.description,
    href: '/signin',
  })),
];
