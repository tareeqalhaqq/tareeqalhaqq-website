'use client';

import { createContext, useContext } from 'react';

type ClerkConfigContextValue = {
  isClerkConfigured: boolean;
};

const ClerkConfigContext = createContext<ClerkConfigContextValue>({
  isClerkConfigured: false,
});

export function ClerkConfigProvider({
  children,
  isClerkConfigured,
}: {
  children: React.ReactNode;
  isClerkConfigured: boolean;
}) {
  return (
    <ClerkConfigContext.Provider value={{ isClerkConfigured }}>
      {children}
    </ClerkConfigContext.Provider>
  );
}

export function useClerkConfig() {
  return useContext(ClerkConfigContext);
}
