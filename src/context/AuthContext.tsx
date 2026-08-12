import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabaseClient, getStoredSupabaseConfig } from '../lib/supabase';
import { Profile } from '../types/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  authError: string | null;
  isConfigured: boolean;
  demoMode: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  enableDemoAdmin: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState<boolean>(false);

  const { anonKey } = getStoredSupabaseConfig();
  const isConfigured = Boolean(anonKey && anonKey !== 'placeholder-anon-key-configure-in-settings');

  const fetchProfile = async (userId: string, userEmail?: string) => {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar perfil no Supabase:', error);
      }

      if (data) {
        setProfile(data as Profile);
        if (data.is_admin && data.ativo) {
          setIsAdmin(true);
          setAuthError(null);
        } else {
          setIsAdmin(false);
          setAuthError('Acesso bloqueado: Seu usuário não possui permissão de Administrador Ativo no IBNA.');
        }
      } else {
        // Se o perfil ainda não existe no DB, criar perfil básico e checar admin
        const newProfile: Profile = {
          id: userId,
          email: userEmail || 'usuario@ibna.org',
          nome_completo: userEmail ? userEmail.split('@')[0] : 'Administrador',
          telefone: null,
          data_nascimento: null,
          numero_membro: null,
          membro_desde: null,
          cargo_lideranca: 'Líder / Admin',
          eh_lider: true,
          membro_aprovado: true,
          status_cadastro: 'aprovado',
          is_admin: false, // Default false por segurança RLS
          ativo: true,
          criado_em: new Date().toISOString(),
        };

        setProfile(newProfile);
        setIsAdmin(false);
        setAuthError('Perfil criado com status normal. Solicite a aprovação do administrador do IBNA.');
      }
    } catch (err: any) {
      console.error('Falha ao validar permissões de perfil:', err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        const client = getSupabaseClient();
        const { data: { session: currentSession } } = await client.auth.getSession();

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          await fetchProfile(currentSession.user.id, currentSession.user.email);
        }
      } catch (err) {
        console.warn('Sessão inicial não encontrada:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const client = getSupabaseClient();
    const { data: { subscription } } = client.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);

      if (newSession?.user) {
        await fetchProfile(newSession.user.id, newSession.user.email);
      } else if (!demoMode) {
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    setAuthError(null);
    setLoading(true);

    try {
      const client = getSupabaseClient();
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        setLoading(false);
        return { success: false, error: error.message || 'Falha ao autenticar. Verifique e-mail e senha.' };
      }

      if (data.user) {
        await fetchProfile(data.user.id, data.user.email);
      }

      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'Erro inesperado na conexão.' };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const client = getSupabaseClient();
      await client.auth.signOut();
    } catch (err) {
      console.warn('Erro ao sair:', err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAdmin(false);
      setDemoMode(false);
      setAuthError(null);
      setLoading(false);
    }
  };

  const enableDemoAdmin = () => {
    setDemoMode(true);
    setUser({
      id: 'demo-admin-uuid-123456',
      email: 'admin.demo@ibna.org.br',
      app_metadata: {},
      user_metadata: { nome_completo: 'Pr. Carlos Santos (Demo Admin)' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as any);

    setProfile({
      id: 'demo-admin-uuid-123456',
      email: 'admin.demo@ibna.org.br',
      nome_completo: 'Pastor Carlos Santos (Admin IBNA)',
      telefone: '(85) 99876-5432',
      data_nascimento: '1982-05-14',
      numero_membro: 'IBNA-0001',
      membro_desde: '2015-01-10',
      cargo_lideranca: 'Pastor Presidente & Administrador',
      eh_lider: true,
      membro_aprovado: true,
      status_cadastro: 'aprovado',
      is_admin: true,
      ativo: true,
      criado_em: new Date().toISOString(),
    });

    setIsAdmin(true);
    setAuthError(null);
    setLoading(false);
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id, user.email);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAdmin,
        loading,
        authError,
        isConfigured,
        demoMode,
        login,
        logout,
        enableDemoAdmin,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
