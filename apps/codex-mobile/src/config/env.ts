import Constants from 'expo-constants';

type EnvConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

const extra = Constants.expoConfig?.extra ?? {};

export const env: EnvConfig = {
  supabaseUrl: (extra.supabaseUrl as string) ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: (extra.supabaseAnonKey as string) ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''
};
