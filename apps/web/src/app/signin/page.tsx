import { SignIn } from '@clerk/nextjs';

export const dynamic = 'force-dynamic';

export default function Page() {
  console.log(
    'Clerk key:',
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  );

  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <div>Clerk key missing</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
