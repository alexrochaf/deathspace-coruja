import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import * as mockModule from './supabase-mock';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isDevelopment = import.meta.env.DEV;

// Usar mock apenas se não houver credenciais válidas do Supabase
const shouldUseMock = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('demo') || supabaseUrl.includes('localhost');

// Debug log para verificar qual configuração está sendo usada
console.log('🔧 Supabase Config Debug:', {
  isDevelopment,
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl?.substring(0, 30) + '...',
  shouldUseMock
});

// Tipos para autenticação
export type User = mockModule.User;

// Configuração condicional
let supabaseClient: ReturnType<typeof createClient<Database>> | typeof mockModule.supabase;
let authHelpers: {
  getCurrentUser: () => Promise<User | null>;
  signInWithGoogle: () => Promise<{ data: unknown; error: unknown }>;
  signInWithEmail: (email: string, password: string) => Promise<{ data: unknown; error: unknown }>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<{ data: unknown; error: unknown }>;
  signOut: () => Promise<{ error: unknown }>;
  onAuthStateChange: (callback: (user: User | null) => void) => { data: { subscription: unknown } };
};

if (shouldUseMock) {
  // Usar mock para desenvolvimento
  supabaseClient = mockModule.supabase;
  authHelpers = {
    getCurrentUser: mockModule.getCurrentUser,
    signInWithGoogle: mockModule.signInWithGoogle,
    signInWithEmail: mockModule.signInWithEmail,
    signUpWithEmail: mockModule.signUpWithEmail,
    signOut: mockModule.signOut,
    onAuthStateChange: mockModule.onAuthStateChange
  };
} else {
  // Usar Supabase real
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables for production');
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  });

  authHelpers = {
    // Helper para obter usuário atual
    getCurrentUser: async (): Promise<User | null> => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return null;
      
      // Buscar dados adicionais do usuário na tabela users
      const { data: userData, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (userData) {
        return userData;
      }
      
      // Se o usuário não existe na tabela, criar automaticamente
      if (error?.code === 'PGRST116') {
        const newUser = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
          photo_url: user.user_metadata?.avatar_url,
          role: 'member' as const
        };
        
        const { data: createdUser } = await supabaseClient
          .from('users')
          .insert(newUser)
          .select()
          .single();
          
        return createdUser || newUser;
      }
      
      // Fallback para dados do auth
      return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
        photo_url: user.user_metadata?.avatar_url,
        role: 'member' as const
      };
    },

    // Helper para login com Google
    signInWithGoogle: async () => {
      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/platform`
        }
      });
      return { data, error };
    },

    // Helper para login com email/senha
    signInWithEmail: async (email: string, password: string) => {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });
      return { data, error };
    },

    // Helper para registro
    signUpWithEmail: async (email: string, password: string, name?: string) => {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0]
          }
        }
      });
      return { data, error };
    },

    // Helper para logout
    signOut: async () => {
      const { error } = await supabaseClient.auth.signOut();
      return { error };
    },

    // Helper para escutar mudanças de autenticação
    onAuthStateChange: (callback: (user: User | null) => void) => {
      return supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const user = await authHelpers.getCurrentUser();
          callback(user);
        } else {
          callback(null);
        }
      });
    }
  };
}

// Exportar as funções
export const supabase = supabaseClient;
export const getCurrentUser = authHelpers.getCurrentUser;
export const signInWithGoogle = authHelpers.signInWithGoogle;
export const signInWithEmail = authHelpers.signInWithEmail;
export const signUpWithEmail = authHelpers.signUpWithEmail;
export const signOut = authHelpers.signOut;
export const onAuthStateChange = authHelpers.onAuthStateChange;