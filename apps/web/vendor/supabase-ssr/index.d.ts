export type AuthSession = null;
export type AuthUser = null;

export interface AuthSubscription {
  data: { subscription: { unsubscribe: () => void } };
  error: null;
}

export interface AuthResponse<T> {
  data: T;
  error: null;
}

export interface AuthClient {
  auth: {
    getUser: () => Promise<AuthResponse<{ user: AuthUser }>>;
    getSession: () => Promise<AuthResponse<{ session: AuthSession }>>;
    signUp: (params?: unknown) => Promise<AuthResponse<{ user: AuthUser }>>;
    signInWithPassword: (params?: unknown) => Promise<AuthResponse<{ session: AuthSession }>>;
    signOut: () => Promise<{ error: null }>;
    resetPasswordForEmail: (email: string) => Promise<AuthResponse<{ user: AuthUser }>>;
    onAuthStateChange: (
      callback: (event: string, session: AuthSession) => void,
    ) => AuthSubscription;
  };
}

export const createBrowserClient: (
  supabaseUrl?: string,
  supabaseKey?: string,
  options?: unknown,
) => AuthClient;

export const createServerClient: (
  supabaseUrl?: string,
  supabaseKey?: string,
  options?: unknown,
) => AuthClient;
