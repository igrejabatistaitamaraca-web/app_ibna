/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getSupabaseClient } from './lib/supabase';
import {
  Profile,
  Notificacao,
  PushDispatchItem,
  DicaLouvor,
  EstudoBiblico,
  MensagemBiblica,
  Momento,
  MomentoFoto,
  EventoCalendario,
  SobreIgreja,
  BibliaVersiculo,
  NavigationTab,
  DashboardMetrics,
} from './types/supabase';
import {
  normalizeProfile,
  normalizeNotificacao,
  normalizePushItem,
  normalizeDicaLouvor,
  normalizeEstudo,
  normalizeMensagem,
  normalizeMomento,
  normalizeMomentoFoto,
  normalizeCalendario,
  normalizeSobre,
  normalizeVersiculo,
} from './lib/dataUtils';

// Layout Components
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { ConfigModal } from './components/layout/ConfigModal';

// Views
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { MembrosView } from './views/MembrosView';
import { NotificacoesView } from './views/NotificacoesView';
import { DicasLouvorView } from './views/DicasLouvorView';
import { EstudosBiblicosView } from './views/EstudosBiblicosView';
import { MensagensBiblicasView } from './views/MensagensBiblicasView';
import { MomentosView } from './views/MomentosView';
import { CalendarioView } from './views/CalendarioView';
import { SobreView } from './views/SobreView';
import { VersiculoDiaView } from './views/VersiculoDiaView';
import { ConfiguracoesView } from './views/ConfiguracoesView';

import { Loader2 } from 'lucide-react';

const MainDashboardApp: React.FC = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  // Entities State - NO MOCKS
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [pushQueue, setPushQueue] = useState<PushDispatchItem[]>([]);
  const [louvorItems, setLouvorItems] = useState<DicaLouvor[]>([]);
  const [estudosItems, setEstudosItems] = useState<EstudoBiblico[]>([]);
  const [mensagensItems, setMensagensItems] = useState<MensagemBiblica[]>([]);
  const [momentos, setMomentos] = useState<Momento[]>([]);
  const [momentoFotos, setMomentoFotos] = useState<MomentoFoto[]>([]);
  const [calendarioItems, setCalendarioItems] = useState<EventoCalendario[]>([]);
  const [sobreItems, setSobreItems] = useState<SobreIgreja[]>([]);
  const [versiculos, setVersiculos] = useState<BibliaVersiculo[]>([]);

  // Fetch real data from Supabase DB
  const loadAllData = async () => {
    setDataLoading(true);

    try {
      const client = getSupabaseClient();

      const [
        resProfiles,
        resNotificacoes,
        resPushQueue,
        resLouvor,
        resEstudos,
        resMensagens,
        resMomentos,
        resMomentoFotos,
        resCalendario,
        resSobre,
        resVersiculos,
      ] = await Promise.all([
        client.from('profiles').select('*'),
        client.from('notificacoes').select('*'),
        client.from('push_dispatch_queue').select('*, notificacoes(titulo, mensagem)'),
        client.from('dicas_louvor').select('*'),
        client.from('estudos_biblicos').select('*'),
        client.from('mensagens_biblicas').select('*'),
        client.from('momentos').select('*'),
        client.from('momento_fotos').select('*'),
        client.from('calendario').select('*'),
        client.from('sobre').select('*'),
        client.from('biblia_versiculos').select('*').limit(150),
      ]);

      if (resProfiles.data) setProfiles(resProfiles.data.map(normalizeProfile));
      if (resNotificacoes.data) setNotificacoes(resNotificacoes.data.map(normalizeNotificacao));
      if (resPushQueue.data) setPushQueue(resPushQueue.data.map(normalizePushItem));
      if (resLouvor.data) setLouvorItems(resLouvor.data.map(normalizeDicaLouvor));
      if (resEstudos.data) setEstudosItems(resEstudos.data.map(normalizeEstudo));
      if (resMensagens.data) setMensagensItems(resMensagens.data.map(normalizeMensagem));
      if (resMomentos.data) setMomentos(resMomentos.data.map(normalizeMomento));
      if (resMomentoFotos.data) setMomentoFotos(resMomentoFotos.data.map(normalizeMomentoFoto));
      if (resCalendario.data) setCalendarioItems(resCalendario.data.map(normalizeCalendario));
      if (resSobre.data) setSobreItems(resSobre.data.map(normalizeSobre));
      if (resVersiculos.data) setVersiculos(resVersiculos.data.map(normalizeVersiculo));
    } catch (err) {
      console.warn('Erro ao carregar dados do Supabase:', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  // Derived Metrics
  const metrics: DashboardMetrics = {
    cadastrosPendentes: profiles.filter((p) => p.status_cadastro === 'pendente').length,
    membrosAprovados: profiles.filter((p) => p.membro_aprovado).length,
    avisosAtivos: notificacoes.filter((n) => n.ativo).length,
    pushPendentesOuErro: pushQueue.filter((pq) => pq.status === 'pendente' || pq.status === 'erro').length,
    conteudosAtivos:
      louvorItems.filter((i) => i.ativo).length +
      estudosItems.filter((i) => i.ativo).length +
      mensagensItems.filter((i) => i.ativo).length +
      momentos.filter((i) => i.ativo).length,
  };

  // --- MEMBER ACTIONS ---
  const handleAprovarMembro = async (id: string, numeroMembro?: string, membroDesde?: string) => {
    // Format for Postgres 'date' type compatibility
    const formattedDate =
      membroDesde && /^\d{4}$/.test(membroDesde.trim())
        ? `${membroDesde.trim()}-01-01`
        : membroDesde || null;

    try {
      const client = getSupabaseClient();
      
      // Payload containing strictly valid columns from public.profiles table
      const updatePayload: Record<string, any> = {
        membro_aprovado: true,
        status_cadastro: 'aprovado',
        updated_at: new Date().toISOString(),
      };
      if (numeroMembro) updatePayload.numero_membro = numeroMembro;
      if (formattedDate) updatePayload.data_membro_desde = formattedDate;

      // 1. Direct update to profiles
      const { error: directErr } = await client
        .from('profiles')
        .update(updatePayload)
        .eq('id', id);

      if (directErr) {
        console.warn('Direct update to profiles:', directErr);
      }

      // 2. Also execute RPC if present
      try {
        await client.rpc('aprovar_membro', {
          p_profile_id: id,
          p_numero_membro: numeroMembro,
          p_membro_desde: formattedDate,
        });
      } catch (rpcErr) {
        console.info('RPC aprovar_membro note:', rpcErr);
      }
    } catch (err) {
      console.warn('Error approving member:', err);
    }

    setProfiles((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              membro_aprovado: true,
              status_cadastro: 'aprovado',
              numero_membro: numeroMembro || p.numero_membro,
              membro_desde: membroDesde || p.membro_desde,
              data_membro_desde: formattedDate,
            }
          : p
      )
    );
  };

  const handleReprovarMembro = async (id: string) => {
    try {
      const client = getSupabaseClient();
      const { error: directErr } = await client
        .from('profiles')
        .update({
          membro_aprovado: false,
          status_cadastro: 'reprovado',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (directErr) {
        console.warn('Direct reprovar update:', directErr);
      }

      try {
        await client.rpc('reprovar_membro', { p_profile_id: id });
      } catch (e) {}
    } catch (err) {
      console.warn('Error reproving member:', err);
    }

    setProfiles((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              membro_aprovado: false,
              status_cadastro: 'reprovado',
            }
          : p
      )
    );
  };

  const handleAtualizarMembro = async (
    id: string,
    ativo: boolean,
    ehLider: boolean,
    cargoLideranca: string,
    numeroMembro: string,
    membroDesde: string
  ) => {
    const formattedDate =
      membroDesde && /^\d{4}$/.test(membroDesde.trim())
        ? `${membroDesde.trim()}-01-01`
        : membroDesde || null;

    try {
      const client = getSupabaseClient();
      const updatePayload: Record<string, any> = {
        ativo,
        eh_lider: ehLider,
        cargo_lideranca: cargoLideranca || null,
        updated_at: new Date().toISOString(),
      };
      if (numeroMembro) updatePayload.numero_membro = numeroMembro;
      if (formattedDate) updatePayload.data_membro_desde = formattedDate;

      const { error: directErr } = await client
        .from('profiles')
        .update(updatePayload)
        .eq('id', id);

      if (directErr) {
        console.warn('Direct update error:', directErr);
      }

      try {
        await client.rpc('atualizar_membro_admin', {
          p_profile_id: id,
          p_ativo: ativo,
          p_eh_lider: ehLider,
          p_cargo_lideranca: cargoLideranca,
          p_numero_membro: numeroMembro,
          p_membro_desde: formattedDate,
        });
      } catch (e) {}
    } catch (err) {
      console.warn('Error updating member:', err);
    }

    setProfiles((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ativo,
              eh_lider: ehLider,
              cargo_lideranca: cargoLideranca,
              numero_membro: numeroMembro,
              membro_desde: membroDesde,
              data_membro_desde: formattedDate,
            }
          : p
      )
    );
  };

  // --- NOTIFICAÇÕES ACTIONS ---
  const handleSaveNotificacao = async (data: Partial<Notificacao>) => {
    const client = getSupabaseClient();
    const isNew = !data.id;

    try {
      const {
        data: { session },
        error: sessionError,
      } = await client.auth.getSession();

      if (sessionError) throw sessionError;
      if (!session?.user) {
        throw new Error('Sessão administrativa não encontrada. Faça login novamente.');
      }

      const payload = {
        titulo: data.titulo?.trim() || 'Novo Aviso',
        mensagem: data.mensagem?.trim() || '',
        categoria: data.categoria || 'Geral',
        destino: data.destino || null,
        audiencias: data.audiencias?.length ? data.audiencias : ['todos'],
        data_agendamento: data.data_agendamento || new Date().toISOString(),
        data_expiracao: data.data_expiracao || null,
        notificar: data.notificar ?? true,
        ativo: data.ativo ?? true,
      };

      console.log('[IBNA ADM] Salvando notificação:', {
        userId: session.user.id,
        isNew,
        payload,
      });

      if (isNew) {
        const { data: saved, error } = await client
          .from('notificacoes')
          .insert(payload)
          .select()
          .single();

        if (error) throw new Error(`Não foi possível salvar o aviso: ${error.message}`);
        if (!saved) throw new Error('O Supabase não retornou a notificação criada.');

        const normalized = normalizeNotificacao(saved);
        setNotificacoes((prev) => [normalized, ...prev]);

        // A fila de push deve ser criada pelo trigger do banco.
        await loadAllData();
        return;
      }

      if (!data.id) throw new Error('ID da notificação não encontrado.');

      const { data: saved, error } = await client
        .from('notificacoes')
        .update(payload)
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw new Error(`Não foi possível atualizar o aviso: ${error.message}`);
      if (!saved) throw new Error('O Supabase não retornou a notificação atualizada.');

      const normalized = normalizeNotificacao(saved);
      setNotificacoes((prev) =>
        prev.map((n) => (n.id === normalized.id ? normalized : n))
      );

      await loadAllData();
      return;
    } catch (err) {
      console.error('[IBNA ADM] Erro ao salvar notificação:', err);

      const message =
        err instanceof Error
          ? err.message
          : 'Erro desconhecido ao salvar a notificação.';

      // Mostra no celular o erro real do Supabase.
      window.alert(message);

      // Mantém a Promise rejeitada para o modal não fechar como "sucesso".
      throw new Error(message);
    }
  };

  const handleDeleteNotificacao = async (id: string) => {
    const client = getSupabaseClient();

    const { error } = await client.from('notificacoes').delete().eq('id', id);
    if (error) {
      console.error('[IBNA ADM] Erro ao excluir notificação:', error);
      throw new Error(`Não foi possível excluir o aviso: ${error.message}`);
    }

    setNotificacoes((prev) => prev.filter((n) => n.id !== id));
    await loadAllData();
  };

  const handleToggleAtivoNotificacao = async (id: string, currentAtivo: boolean) => {
    const client = getSupabaseClient();
    const updatedAtivo = !currentAtivo;

    const { data: saved, error } = await client
      .from('notificacoes')
      .update({ ativo: updatedAtivo })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[IBNA ADM] Erro ao alterar status da notificação:', error);
      throw new Error(`Não foi possível alterar o aviso: ${error.message}`);
    }

    if (!saved) throw new Error('O Supabase não retornou o aviso atualizado.');

    const normalized = normalizeNotificacao(saved);
    setNotificacoes((prev) =>
      prev.map((n) => (n.id === normalized.id ? normalized : n))
    );
  };

  // --- GENERIC CRUD HANDLERS FOR OTHER CONTENT ---
  // O ID de novos registros NÃO é criado no frontend.
  // O PostgreSQL gera o UUID automaticamente.
  const createSaveHandler = <T extends { id: string }>(
    tableName: string,
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    normalizer?: (row: any) => T
  ) => {
    return async (data: Partial<T>) => {
      const client = getSupabaseClient();
      const isNew = !data.id;

      const {
        data: { session },
        error: sessionError,
      } = await client.auth.getSession();

      if (sessionError) throw sessionError;
      if (!session?.user) {
        throw new Error('Sessão administrativa não encontrada. Faça login novamente.');
      }

      const { id, ...payload } = data as Partial<T> & { id?: string };

      if (isNew) {
        const { data: saved, error } = await client
          .from(tableName)
          .insert(payload)
          .select()
          .single();

        if (error) {
          console.error(`[IBNA ADM] Erro INSERT ${tableName}:`, error);
          throw new Error(`Erro ao salvar em ${tableName}: ${error.message}`);
        }
        if (!saved) throw new Error(`O Supabase não retornou o registro criado em ${tableName}.`);

        const item = normalizer ? normalizer(saved) : (saved as T);
        setter((prev) => [item, ...prev]);
        return;
      }

      if (!id) throw new Error(`ID não encontrado para atualizar ${tableName}.`);

      const { data: saved, error } = await client
        .from(tableName)
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`[IBNA ADM] Erro UPDATE ${tableName}:`, error);
        throw new Error(`Erro ao atualizar ${tableName}: ${error.message}`);
      }
      if (!saved) throw new Error(`O Supabase não retornou o registro atualizado em ${tableName}.`);

      const item = normalizer ? normalizer(saved) : (saved as T);
      setter((prev) => prev.map((current) => (current.id === id ? item : current)));
      return;
    };
  };

  const createDeleteHandler = <T extends { id: string }>(
    tableName: string,
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    return async (id: string) => {
      const client = getSupabaseClient();

      const { error } = await client.from(tableName).delete().eq('id', id);
      if (error) {
        console.error(`[IBNA ADM] Erro DELETE ${tableName}:`, error);
        throw new Error(`Erro ao excluir de ${tableName}: ${error.message}`);
      }

      setter((prev) => prev.filter((item) => item.id !== id));
    };
  };

  const handleSaveLouvor = createSaveHandler<DicaLouvor>(
    'dicas_louvor',
    setLouvorItems,
    normalizeDicaLouvor
  );
  const handleDeleteLouvor = createDeleteHandler<DicaLouvor>('dicas_louvor', setLouvorItems);

  const handleSaveEstudo = createSaveHandler<EstudoBiblico>(
    'estudos_biblicos',
    setEstudosItems,
    normalizeEstudo
  );
  const handleDeleteEstudo = createDeleteHandler<EstudoBiblico>('estudos_biblicos', setEstudosItems);

  const handleSaveMensagem = createSaveHandler<MensagemBiblica>(
    'mensagens_biblicas',
    setMensagensItems,
    normalizeMensagem
  );
  const handleDeleteMensagem = createDeleteHandler<MensagemBiblica>('mensagens_biblicas', setMensagensItems);

  const handleSaveMomento = createSaveHandler<Momento>(
    'momentos',
    setMomentos,
    normalizeMomento
  );
  const handleDeleteMomento = createDeleteHandler<Momento>('momentos', setMomentos);

  const handleAddFotoMomento = async (momentoId: string, fotoUrl: string, legenda?: string) => {
    const client = getSupabaseClient();

    const {
      data: { session },
      error: sessionError,
    } = await client.auth.getSession();

    if (sessionError) throw sessionError;
    if (!session?.user) {
      throw new Error('Sessão administrativa não encontrada. Faça login novamente.');
    }

    const payload = {
      momento_id: momentoId,
      foto_url: fotoUrl,
      legenda: legenda || null,
      ordem: momentoFotos.filter((foto) => foto.momento_id === momentoId).length + 1,
      ativo: true,
    };

    const { data: saved, error } = await client
      .from('momento_fotos')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('[IBNA ADM] Erro INSERT momento_fotos:', error);
      throw new Error(`Não foi possível salvar a foto: ${error.message}`);
    }
    if (!saved) throw new Error('O Supabase não retornou a foto criada.');

    const normalized = normalizeMomentoFoto(saved);
    setMomentoFotos((prev) => [...prev, normalized]);
    return;
  };

  const handleDeleteFotoMomento = async (id: string) => {
    const client = getSupabaseClient();

    const { error } = await client.from('momento_fotos').delete().eq('id', id);
    if (error) {
      console.error('[IBNA ADM] Erro DELETE momento_fotos:', error);
      throw new Error(`Não foi possível excluir a foto: ${error.message}`);
    }

    setMomentoFotos((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSaveCalendario = createSaveHandler<EventoCalendario>(
    'calendario',
    setCalendarioItems,
    normalizeCalendario
  );
  const handleDeleteCalendario = createDeleteHandler<EventoCalendario>('calendario', setCalendarioItems);

  const handleSaveSobre = createSaveHandler<SobreIgreja>(
    'sobre',
    setSobreItems,
    normalizeSobre
  );
  const handleDeleteSobre = createDeleteHandler<SobreIgreja>('sobre', setSobreItems);

  const handleCreateVersiculoNotification = async (v: BibliaVersiculo) => {
    await handleSaveNotificacao({
      titulo: `Versículo do Dia: ${v.livro} ${v.capitulo}:${v.versiculo}`,
      mensagem: `"${v.texto}"`,
      categoria: 'Geral',
      destino: '/versiculo-do-dia',
      audiencias: ['todos'],
      notificar: true,
      ativo: true,
    });
  };

  // Auth Loading Screen
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#001848] text-white">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37] mx-auto" />
          <p className="text-xs font-bold tracking-wide">Validando Sessão Supabase Auth IBNA...</p>
        </div>
      </div>
    );
  }

  // Not logged in or not admin -> Show Login View
  if (!user || !isAdmin) {
    return (
      <>
        <LoginView onOpenConfig={() => setIsConfigOpen(true)} />
        <ConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100/70 text-slate-900 font-sans">
      {/* Desktop Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingMembersCount={metrics.cadastrosPendentes}
        pushErrorsCount={metrics.pushPendentesOuErro}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <Header onOpenConfig={() => setIsConfigOpen(true)} />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {currentTab === 'dashboard' && (
            <DashboardView
              metrics={metrics}
              pendingProfiles={profiles.filter((p) => p.status_cadastro === 'pendente')}
              recentNotificacoes={notificacoes}
              pushQueueItems={pushQueue}
              onNavigate={setCurrentTab}
              onRefresh={loadAllData}
              loading={dataLoading}
            />
          )}

          {currentTab === 'membros' && (
            <MembrosView
              profiles={profiles}
              onAprovarMembro={handleAprovarMembro}
              onReprovarMembro={handleReprovarMembro}
              onAtualizarMembro={handleAtualizarMembro}
              loading={dataLoading}
            />
          )}

          {currentTab === 'notificacoes' && (
            <NotificacoesView
              notificacoes={notificacoes}
              pushQueue={pushQueue}
              onSaveNotificacao={handleSaveNotificacao}
              onDeleteNotificacao={handleDeleteNotificacao}
              onToggleAtivo={handleToggleAtivoNotificacao}
              loading={dataLoading}
            />
          )}

          {currentTab === 'louvor' && (
            <DicasLouvorView
              items={louvorItems}
              onSave={handleSaveLouvor}
              onDelete={handleDeleteLouvor}
              loading={dataLoading}
            />
          )}

          {currentTab === 'estudos' && (
            <EstudosBiblicosView
              items={estudosItems}
              onSave={handleSaveEstudo}
              onDelete={handleDeleteEstudo}
              loading={dataLoading}
            />
          )}

          {currentTab === 'mensagens' && (
            <MensagensBiblicasView
              items={mensagensItems}
              onSave={handleSaveMensagem}
              onDelete={handleDeleteMensagem}
              loading={dataLoading}
            />
          )}

          {currentTab === 'momentos' && (
            <MomentosView
              momentos={momentos}
              fotos={momentoFotos}
              onSaveMomento={handleSaveMomento}
              onDeleteMomento={handleDeleteMomento}
              onAddFoto={handleAddFotoMomento}
              onDeleteFoto={handleDeleteFotoMomento}
              loading={dataLoading}
            />
          )}

          {currentTab === 'calendario' && (
            <CalendarioView
              items={calendarioItems}
              onSave={handleSaveCalendario}
              onDelete={handleDeleteCalendario}
              loading={dataLoading}
            />
          )}

          {currentTab === 'sobre' && (
            <SobreView
              items={sobreItems}
              onSave={handleSaveSobre}
              onDelete={handleDeleteSobre}
              loading={dataLoading}
            />
          )}

          {currentTab === 'versiculo' && (
            <VersiculoDiaView
              versiculos={versiculos}
              onCreateVersiculoNotification={handleCreateVersiculoNotification}
              loading={dataLoading}
            />
          )}

          {currentTab === 'configuracoes' && <ConfiguracoesView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingMembersCount={metrics.cadastrosPendentes}
        pushErrorsCount={metrics.pushPendentesOuErro}
        onRefresh={loadAllData}
        loading={dataLoading}
      />

      <ConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainDashboardApp />
    </AuthProvider>
  );
}
