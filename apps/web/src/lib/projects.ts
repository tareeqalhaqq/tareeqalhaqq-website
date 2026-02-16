export type ProjectRecord = {
  id: string;
  title: string;
  description: string;
  tag: string | null;
  href: string | null;
  display_order: number | null;
  is_published: boolean | null;
  created_at: string;
};

export const projectSelectFields =
  "id, title, description, tag, href, display_order, is_published, created_at";

export const fallbackProjects = [
  {
    title: "Mutoon AI",
    description:
      "An AI-assisted study companion designed to help learners navigate foundational texts with context, structure, and clarity.",
    tag: "Education",
    href: "/",
    display_order: 0,
  },
  {
    title: "Markaz Al-Haqq",
    description:
      "A knowledge hub connecting students to scholars, curated programs, and trusted resources grounded in authentic methodology.",
    tag: "Institution",
    href: "/",
    display_order: 1,
  },
  {
    title: "Nur Recitations",
    description:
      "A focused platform for beautiful and accurate Qur’an recitations, helping hearts connect to revelation with reflection.",
    tag: "Media",
    href: "/",
    display_order: 2,
  },
];
