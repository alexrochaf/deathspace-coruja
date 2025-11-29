// Mock do Supabase para desenvolvimento local

// Tipo User para o mock
export type User = {
  id: string;
  email?: string;
  name?: string;
  photo_url?: string;
  role?: 'member' | 'admin';
};

// Simulação de usuário logado
const mockUser: User = {
  id: 'mock-user-123',
  email: 'demo@corujasgames.com',
  name: 'Usuário Demo',
  photo_url: 'https://via.placeholder.com/150',
  role: 'member'
};

// Mock das funções do Supabase
export const mockSupabase = {
  auth: {
    getUser: async () => ({ data: { user: mockUser }, error: null }),
    signInWithOAuth: async () => ({ data: { user: mockUser }, error: null }),
    signInWithPassword: async () => ({ data: { user: mockUser }, error: null }),
    signUp: async () => ({ data: { user: mockUser }, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: (callback: (event: string, session: { user: User } | null) => void) => {
      // Simular usuário logado após um delay
      setTimeout(() => {
        callback('SIGNED_IN', { user: mockUser });
      }, 100);
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    }
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: { code: 'PGRST116' } })
      }),
      order: () => ({ data: [], error: null })
    }),
    insert: () => ({
      select: () => ({
        single: async () => ({ data: {}, error: null })
      })
    }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: async () => ({ data: {}, error: null })
        })
      })
    }),
    delete: () => ({
      eq: () => ({ error: null })
    })
  }),
  channel: () => ({
    on: () => ({
      on: () => ({
        on: () => ({
          on: () => ({
            subscribe: () => {}
          })
        })
      })
    })
  })
};

// Funções helper mockadas
export const getCurrentUser = async (): Promise<User | null> => {
  return mockUser;
};

export const signInWithGoogle = async () => {
  return { data: { user: mockUser }, error: null };
};

export const signInWithEmail = async () => {
  return { data: { user: mockUser }, error: null };
};

export const signUpWithEmail = async () => {
  return { data: { user: mockUser }, error: null };
};

export const signOut = async () => {
  return { error: null };
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  // Simular usuário logado
  setTimeout(() => {
    callback(mockUser);
  }, 100);
  
  return {
    data: {
      subscription: {
        unsubscribe: () => {}
      }
    }
  };
};

export { mockUser as User };
export const supabase = mockSupabase;