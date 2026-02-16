export const navLinks = [
  { name: "About", href: "#about" },
  { name: "Vision", href: "#vision" },
];

export const socialLinks = [
  { name: "Facebook", href: "#", icon: "Facebook" },
  { name: "Twitter", href: "#", icon: "Twitter" },
  { name: "Youtube", href: "#", icon: "Youtube" },
  {
    name: "Instagram",
    href: "https://www.instagram.com/tareeqalhaqq__/",
    icon: "Instagram",
  },
];

// For search functionality
export type AcademyCourse = {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  description: string;
  format: string;
};

export const academyCourses: AcademyCourse[] = [
  {
    id: "intro-hadith",
    title: "Hadith Foundations",
    level: "Beginner",
    duration: "4 weeks",
    description:
      "Learn the core terminology, major collections, and practical study habits for approaching narrations with confidence.",
    format: "Live sessions + reference library",
  },
  {
    id: "fiqh-pathways",
    title: "Practical Fiqh Pathways",
    level: "Intermediate",
    duration: "6 weeks",
    description:
      "A structured walkthrough of worship rulings with guided case studies, juristic maxims, and curated reading plans.",
    format: "Guided cohorts + weekly labs",
  },
  {
    id: "textual-precision",
    title: "Textual Precision Lab",
    level: "Advanced",
    duration: "8 weeks",
    description:
      "Develop research-grade note-taking workflows that connect scans, translations, and classical commentaries inside the app.",
    format: "Project-based mentorship",
  },
];

export const baseContent = [
  {
    type: "About",
    title: "About Tareeq Al Haqq",
    description: "Learn about our mission, vision, and values.",
    href: "/about",
  },
  {
    type: "Academy",
    title: "Academy Overview",
    description: "Discover courses and structured learning tracks.",
    href: "/academy",
  },
  {
    type: "Nur",
    title: "Nur - Quran Tracker",
    description: "Track your Quran memorization, revision, and daily recitation goals.",
    href: "/nur",
  },
  {
    type: "App Development",
    title: "App Development",
    description: "Purpose-driven mobile and web apps for the Muslim community.",
    href: "/#about",
  },
  {
    type: "App Development",
    title: "Mutoon AI",
    description:
      "AI-powered tool to navigate, search, and cross-reference classical Islamic texts.",
    href: "/#about",
  },
  {
    type: "Store",
    title: "Store",
    description: "Shop curated resources and support the mission.",
    href: "https://store.tareeqalhaqq.org",
  },
  ...academyCourses.map((course) => ({
    type: "Course",
    title: course.title,
    description: course.description,
    href: "/login",
  })),
];
