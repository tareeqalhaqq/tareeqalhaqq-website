import { redirect } from 'next/navigation';
import { getServerProfile } from '@/lib/auth-server';
import NurTrackerClient from './NurTrackerClient';

export default async function NurPage() {
  const { userId } = await getServerProfile();

  if (!userId) {
    redirect('/login');
  }

  return <NurTrackerClient />;
}
