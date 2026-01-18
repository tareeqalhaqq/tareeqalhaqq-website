import * as SecureStore from "expo-secure-store";

export const clerkTokenCache = {
  getToken: async (key: string) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn("Failed to load Clerk token from secure storage.", error);
      return null;
    }
  },
  saveToken: async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn("Failed to save Clerk token to secure storage.", error);
    }
  }
};
