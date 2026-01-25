import { NextResponse } from 'next/server';
import { getServerProfile } from '@/lib/auth-server';

export async function GET() {
  const { userId, profile, membership, role, isAdmin } = await getServerProfile();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    profile,
    membership,
    role,
    isAdmin,
  });
}
