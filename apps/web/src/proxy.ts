import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/events',
  '/academy',
  '/signin',
  '/signup',
  '/login',
  '/404',
  '/not-found',
  '/error',
  '/global-error',
]);

export default clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) {
    return;
  }

  auth().protect();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
