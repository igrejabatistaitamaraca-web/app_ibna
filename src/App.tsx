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
    try {
      const client = getSupabaseClient();
      // Try RPC first
      const { error: rpcErr } = await client.rpc('aprovar_membro', {
        p_profile_id: id,
        p_numero_membro: numeroMembro,
        p_membro_desde: membroDesde,
      });

      if (rpcErr) {
        // Fallback to direct update if RPC is missing in user's DB
        await client
          .from('profiles')
          .update({
            membro_aprovado: true,
            status_cadastro: 'aprovado',
            numero_membro: numeroMembro,
            membro_desde: membroDesde,
          })
          .eq('id', id);
      }
    } catch (err) {
      console.warn('Aprovar membro update:', err);
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
            }
          : p
      )
    );
  };

  const handleReprovarMembro = async (id: string) => {
    try {
      const client = getSupabaseClient();
      const { error: rpcErr } = await client.rpc('reprovar_membro', { p_profile_id: id });

      if (rpcErr) {
        await client
          .from('profiles')
          .update({
            membro_aprovado: false,
            status_cadastro: 'reprovado',
          })
          .eq('id', id);
      }
    } catch (err) {
      console.warn('Reprovar membro update:', err);
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
    try {
      const client = getSupabaseClient();
      const { error: rpcErr } = await client.rpc('atualizar_membro_admin', {
        p_profile_id: id,
        p_ativo: ativo,
        p_eh_lider: ehLider,
        p_cargo_lideranca: cargoLideranca,
        p_numero_membro: numeroMembro,
        p_membro_desde: membroDesde,
      });

      if (rpcErr) {
        await client
          .from('profiles')
          .update({
            ativo,
            eh_lider: ehLider,
            cargo_lideranca: cargoLideranca,
            numero_membro: numeroMembro,
            membro_desde: membroDesde,
          })
          .eq('id', id);
      }
    } catch (err) {
      console.warn('Atualizar membro update:', err);
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
            }
          : p
      )
    );
  };

  // --- NOTIFICAÇÕES ACTIONS ---
  const handleSaveNotificacao = async (data: Partial<Notificacao>) => {
    const isNew = !data.id;
    const newId = data.id || 'notif_' + Date.now();
    const itemToSave: Notificacao = {
      id: newId,
      titulo: data.titulo || 'Novo Aviso',
      mensagem: data.mensagem || '',
      categoria: data.categoria || 'Geral',
      destino: data.destino || null,
      audiencias: data.audiencias || ['todos'],
      data_agendamento: data.data_agendamento || new Date().toISOString(),
      data_expiracao: data.data_expiracao || null,
      notificar: data.notificar ?? true,
      ativo: data.ativo ?? true,
      criado_em: data.criado_em || new Date().toISOString(),
    };

    try {
      const client = getSupabaseClient();
      if (isNew) {
        await client.from('notificacoes').insert([itemToSave]);
      } else {
        await client.from('notificacoes').update(itemToSave).eq('id', newId);
      }
    } catch (err) {
      console.warn('DB Save Notificacao:', err);
    }

    setNotificacoes((prev) =>
      isNew ? [itemToSave, ...prev] : prev.map((n) => (n.id === newId ? itemToSave : n))
    );

    // If enqueued for push, create item in pushQueue
    if (itemToSave.notificar && itemToSave.ativo) {
      const pushItem: PushDispatchItem = {
        id: 'pq_' + Date.now(),
        notificacao_id: newId,
        topico: itemToSave.audiencias.includes('todos') ? 'ibna_todos' : 'ibna_membros',
        audiencia: itemToSave.audiencias.join(','),
        status: 'pendente',
        tentativas: 0,
        ultimo_erro: null,
        processado_em: null,
        criado_em: new Date().toISOString(),
        notificacoes: {
          titulo: itemToSave.titulo,
          mensagem: itemToSave.mensagem,
        },
      };

      try {
        const client = getSupabaseClient();
        await client.from('push_dispatch_queue').insert([{
          id: pushItem.id,
          notificacao_id: pushItem.notificacao_id,
          topico: pushItem.topico,
          audiencia: pushItem.audiencia,
          status: pushItem.status,
          tentativas: pushItem.tentativas,
        }]);
      } catch (err) {
        console.warn('DB Push Queue insert:', err);
      }

      setPushQueue((prev) => [pushItem, ...prev]);
    }
  };

  const handleDeleteNotificacao = async (id: string) => {
    try {
      const client = getSupabaseClient();
      await client.from('notificacoes').delete().eq('id', id);
    } catch (err) {
      console.warn('DB delete notificacao:', err);
    }
    setNotificacoes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleToggleAtivoNotificacao = async (id: string, currentAtivo: boolean) => {
    const updatedAtivo = !currentAtivo;
    try {
      const client = getSupabaseClient();
      await client.from('notificacoes').update({ ativo: updatedAtivo }).eq('id', id);
    } catch (err) {
      console.warn('DB update notificacao ativo:', err);
    }
    setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, ativo: updatedAtivo } : n)));
  };

  // --- GENERIC CRUD HANDLERS FOR OTHER CONTENT ---
  const createSaveHandler = <T extends { id: string }>(
    tableName: string,
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    return async (data: Partial<T>) => {
      const isNew = !data.id;
      const newId = data.id || 'item_' + Date.now();
      const itemToSave = { ...data, id: newId } as unknown as T;

      try {
        const client = getSupabaseClient();
        if (isNew) {
          await client.from(tableName).insert([itemToSave]);
        } else {
          await client.from(tableName).update(itemToSave).eq('id', newId);
        }
      } catch (err) {
        console.warn(`DB ${tableName} save:`, err);
      }

      setter((prev) =>
        isNew ? [itemToSave, ...prev] : prev.map((item) => (item.id === newId ? itemToSave : item))
      );
    };
  };

  const createDeleteHandler = <T extends { id: string }>(
    tableName: string,
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    return async (id: string) => {
      try {
        const client = getSupabaseClient();
        await client.from(tableName).delete().eq('id', id);
      } catch (err) {
        console.warn(`DB ${tableName} delete:`, err);
      }
      setter((prev) => prev.filter((item) => item.id !== id));
    };
  };

  const handleSaveLouvor = createSaveHandler<DicaLouvor>('dicas_louvor', setLouvorItems);
  const handleDeleteLouvor = createDeleteHandler<DicaLouvor>('dicas_louvor', setLouvorItems);

  const handleSaveEstudo = createSaveHandler<EstudoBiblico>('estudos_biblicos', setEstudosItems);
  const handleDeleteEstudo = createDeleteHandler<EstudoBiblico>('estudos_biblicos', setEstudosItems);

  const handleSaveMensagem = createSaveHandler<MensagemBiblica>('mensagens_biblicas', setMensagensItems);
  const handleDeleteMensagem = createDeleteHandler<MensagemBiblica>('mensagens_biblicas', setMensagensItems);

  const handleSaveMomento = createSaveHandler<Momento>('momentos', setMomentos);
  const handleDeleteMomento = createDeleteHandler<Momento>('momentos', setMomentos);

  const handleAddFotoMomento = async (momentoId: string, fotoUrl: string, legenda?: string) => {
    const newFoto: MomentoFoto = {
      id: 'foto_' + Date.now(),
      momento_id: momentoId,
      foto_url: fotoUrl,
      legenda: legenda || null,
      ordem: momentoFotos.length + 1,
      criado_em: new Date().toISOString(),
    };

    try {
      const client = getSupabaseClient();
      await client.from('momento_fotos').insert([newFoto]);
    } catch (err) {
      console.warn('DB foto insert:', err);
    }

    setMomentoFotos((prev) => [...prev, newFoto]);
  };

  const handleDeleteFotoMomento = async (id: string) => {
    try {
      const client = getSupabaseClient();
      await client.from('momento_fotos').delete().eq('id', id);
    } catch (err) {
      console.warn('DB foto delete:', err);
    }
    setMomentoFotos((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSaveCalendario = createSaveHandler<EventoCalendario>('calendario', setCalendarioItems);
  const handleDeleteCalendario = createDeleteHandler<EventoCalendario>('calendario', setCalendarioItems);

  const handleSaveSobre = createSaveHandler<SobreIgreja>('sobre', setSobreItems);
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
