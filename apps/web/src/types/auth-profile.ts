export type Profile = {
  id: string;
  clerk_id: string | null;
  email: string | null;
  user_email?: string | null;
  email_address?: string | null;
  app_role?: string | null;
  user_role?: string | null;
  role?: string | null;
  full_name?: string | null;
  display_name?: string | null;
  name?: string | null;
  avatar_url?: string | null;
  created_at: string;
};

export type AcademyMembership = {
  academy_role?: string | null;
  role?: string | null;
  active: boolean | null;
};
