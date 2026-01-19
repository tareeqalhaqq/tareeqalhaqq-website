export const clerkAuthAppearance = {
  variables: {
    colorPrimary: 'hsl(198 100% 55%)',
    colorBackground: 'hsl(222 52% 8%)',
    colorText: 'hsl(210 40% 98%)',
    colorTextSecondary: 'rgba(226, 232, 240, 0.78)',
    fontFamily: 'var(--font-sans)',
    borderRadius: '0.9rem',
  },
  elements: {
    rootBox: 'w-full',
    cardBox: 'w-full',
    card: 'w-full rounded-3xl border border-primary/25 bg-slate-900/90 px-8 py-7 shadow-2xl shadow-primary/20',
    logoBox: 'mb-5 flex justify-center',
    logoImage: 'h-14 w-auto',
    headerTitle: 'text-2xl font-headline text-white',
    headerSubtitle: 'text-sm text-slate-200/80',
    socialButtonsBlockButton:
      'rounded-full border border-primary/20 bg-white/5 text-white shadow-lg shadow-black/30 transition hover:border-primary/40 hover:bg-white/10',
    socialButtonsBlockButtonText: 'text-sm font-semibold text-white',
    dividerLine: 'bg-primary/30',
    dividerText: 'text-xs uppercase tracking-[0.2em] text-slate-200/70',
    formFieldLabel: 'text-sm font-medium text-slate-100/90',
    formFieldInput:
      'rounded-xl border border-primary/20 bg-white/5 text-white placeholder:text-slate-300/60 shadow-inner shadow-black/40 focus:border-primary focus:ring-2 focus:ring-primary/50',
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
