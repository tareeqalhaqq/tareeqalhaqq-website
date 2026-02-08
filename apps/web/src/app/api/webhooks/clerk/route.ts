import { verifyWebhook, type WebhookEvent } from '@clerk/nextjs/webhooks';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { resolveRoleFromMetadata } from '@/lib/roles';

type ClerkEmailAddress = {
  id: string;
  email_address: string;
};

type ClerkUser = {
  id: string;
  email_addresses: ClerkEmailAddress[];
  primary_email_address_id: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  public_metadata?: Record<string, unknown> | null;
  unsafe_metadata?: Record<string, unknown> | null;
};

function getPrimaryEmail(user: ClerkUser) {
  if (!user.email_addresses?.length) {
    return null;
  }

  const primaryEmail =
    user.email_addresses.find((email) => email.id === user.primary_email_address_id) ??
    user.email_addresses[0];

  return primaryEmail?.email_address ?? null;
}

export async function POST(request: Request) {
  let event: WebhookEvent;

  try {
    event = await verifyWebhook(request, {
      signingSecret: process.env.CLERK_WEBHOOK_SECRET,
    });
  } catch (error) {
    console.error('Clerk webhook signature verification failed.', error);
    return new Response('Invalid signature.', { status: 400 });
  }

  if (event.type === 'user.created' || event.type === 'user.updated') {
    const user = event.data as ClerkUser;
    const supabase = createSupabaseServiceClient();
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || null;
    const clerkRole = resolveRoleFromMetadata(user.public_metadata, user.unsafe_metadata);

    const { error } = await supabase.from('profiles').upsert(
      {
        clerk_id: user.id,
        email: getPrimaryEmail(user),
        full_name: fullName,
        avatar_url: user.image_url ?? null,
        ...(clerkRole ? { app_role: clerkRole } : {}),
      },
      { onConflict: 'clerk_id' },
    );

    if (error) {
      console.error('Failed to sync Clerk user to Supabase.', error);
      return new Response('Failed to sync user.', { status: 500 });
    }
  }

  return new Response('ok', { status: 200 });
}
