const createAuthClient = () => {
  const subscribers = new Set();

  const notify = (event, session = null) => {
    subscribers.forEach((callback) => {
      try {
        callback(event, session);
      } catch {
        // ignore subscriber errors
      }
    });
  };

  const auth = {
    async getUser() {
      return { data: { user: null }, error: null };
    },
    async getSession() {
      return { data: { session: null }, error: null };
    },
    async signUp() {
      notify('SIGNED_IN', null);
      return { data: { user: null }, error: null };
    },
    async signInWithPassword() {
      notify('SIGNED_IN', null);
      return { data: { session: null }, error: null };
    },
    async signOut() {
      notify('SIGNED_OUT', null);
      return { error: null };
    },
    async resetPasswordForEmail() {
      return { data: { user: null }, error: null };
    },
    onAuthStateChange(callback) {
      subscribers.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => subscribers.delete(callback),
          },
        },
        error: null,
      };
    },
  };

  return { auth };
};

const createBrowserClient = () => createAuthClient();

const createServerClient = () => createAuthClient();

module.exports = { createBrowserClient, createServerClient };
