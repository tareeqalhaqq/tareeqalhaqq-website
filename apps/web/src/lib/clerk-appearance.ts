export const clerkAuthAppearance = {
  variables: {
    colorPrimary: 'hsl(189 86% 46%)',
    colorBackground: 'hsl(222 47% 11%)',
    colorText: 'hsl(206 46% 96%)',
    colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
    fontFamily: 'var(--font-sans)',
    borderRadius: '0.9rem',
  },
  elements: {
    rootBox: 'w-full',
    cardBox: 'w-full',
    card: 'w-full rounded-3xl border border-white/10 bg-slate-950 p-8 shadow-2xl shadow-black/50',
    headerTitle: 'text-2xl font-headline text-white',
    headerSubtitle: 'text-sm text-white/70',
    socialButtonsBlockButton:
      'rounded-full border border-white/10 bg-white/5 text-white shadow-lg shadow-black/20 transition hover:bg-white/10',
    socialButtonsBlockButtonText: 'text-sm font-semibold text-white',
    dividerLine: 'bg-white/10',
    dividerText: 'text-xs uppercase tracking-[0.2em] text-white/50',
    formFieldLabel: 'text-sm font-medium text-white/80',
    formFieldInput:
      'rounded-xl border border-white/15 bg-white/5 text-white placeholder:text-white/40 shadow-inner shadow-black/40 focus:border-primary focus:ring-2 focus:ring-primary/40',
    formFieldInputShowPasswordButton: 'text-white/60 hover:text-white',
    formFieldInputIcon: 'text-white/60',
    formButtonPrimary:
      'rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90',
    footerActionLink: 'text-primary hover:text-primary/80',
    identityPreviewText: 'text-white/80',
    identityPreviewEditButton: 'text-primary hover:text-primary/80',
    alertText: 'text-red-200',
    alertIcon: 'text-red-200',
    userButtonPopoverCard: 'rounded-2xl border border-white/10 bg-slate-950 text-white shadow-2xl shadow-black/40',
    userButtonPopoverMain: 'bg-transparent text-white',
    userButtonPopoverFooter: 'border-t border-white/10',
    userButtonPopoverActionButton:
      'text-white/80 hover:bg-white/10 hover:text-white',
    userButtonPopoverActionButtonText: 'text-white/80',
    userButtonPopoverActionButtonIcon: 'text-white/60',
    userButtonPopoverActionButtonLabel: 'text-white/50',
  },
} as const;
