import { auth, currentUser } from '@clerk/nextjs/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { resolveRoleFromMetadata } from '@/lib/roles';

export async function syncUserToSupabase() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      console.log('No user, skipping sync');
      return;
    }

    const email = user.emailAddresses[0]?.emailAddress;
    const fullName = user.fullName ?? null;
    const avatarUrl = user.imageUrl ?? null;

    const supabase = createSupabaseServiceClient();
    const clerkRole = resolveRoleFromMetadata(user.publicMetadata, user.unsafeMetadata);

    const { error } = await supabase.from('profiles').upsert(
      {
        clerk_id: userId,
        email,
        full_name: fullName,
        avatar_url: avatarUrl,
        ...(clerkRole ? { app_role: clerkRole } : {}),
      },
      { onConflict: 'clerk_id' },
    );

    if (error) {
      // Log but don't throw to prevent blocking the UI
      console.error('SUPABASE SYNC FAILED:', error);
    } else {
      console.log('Supabase sync successful for', userId);
    }
  } catch (err) {
    console.error('Unexpected error during user sync:', err);
  }
}
