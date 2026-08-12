import React from 'react';
import {
  Profile,
  Notificacao,
  PushDispatchItem,
  NavigationTab,
  DashboardMetrics,
} from '../types/supabase';
import { Badge } from '../components/ui/Badge';
import { formatDateFortaleza } from '../lib/dataUtils';
import {
  Users,
  Bell,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Clock,
  RefreshCw,
  Send,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';

interface DashboardViewProps {
  metrics: DashboardMetrics;
  pendingProfiles: Profile[];
  recentNotificacoes: Notificacao[];
  pushQueueItems: PushDispatchItem[];
  onNavigate: (tab: NavigationTab) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  pendingProfiles,
  recentNotificacoes,
  pushQueueItems,
  onNavigate,
  onRefresh,
  loading,
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-[#002366] via-[#001848] to-[#002366] p-4 sm:p-6 text-white shadow-xl border border-blue-900/60">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37]/20 px-3 py-1 text-xs font-bold text-[#D4AF37] border border-[#D4AF37]/40">
            <UserCheck className="h-3.5 w-3.5" />
            Painel Executivo IBNA
          </span>
          <h2 className="mt-2 text-lg sm:text-2xl font-black text-white">
            Painel Administrativo IBNA
          </h2>
          <p className="mt-1 text-xs text-blue-100/80 max-w-xl leading-relaxed">
            Gestão pastoral em tempo real: cadastros de membros, avisos para o app, conteúdos bíblicos e enfileiramento push.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-1 sm:pt-0">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#001848] hover:bg-[#002366] px-4 py-2.5 text-xs font-bold text-white border border-[#D4AF37]/40 shadow-sm transition-all cursor-pointer min-h-[44px] w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 text-[#D4AF37] ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar Dados</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Cadastros Pendentes */}
        <div
          onClick={() => onNavigate('membros')}
          className="group cursor-pointer rounded-2xl bg-white p-4 sm:p-5 shadow-xs border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Cadastros</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {metrics.cadastrosPendentes}
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-amber-700">pendentes</span>
          </div>
        </div>

        {/* Membros Aprovados */}
        <div
          onClick={() => onNavigate('membros')}
          className="group cursor-pointer rounded-2xl bg-white p-4 sm:p-5 shadow-xs border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Membros</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {metrics.membrosAprovados}
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700">aprovados</span>
          </div>
        </div>

        {/* Avisos Ativos */}
        <div
          onClick={() => onNavigate('notificacoes')}
          className="group cursor-pointer rounded-2xl bg-white p-4 sm:p-5 shadow-xs border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Avisos</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Bell className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {metrics.avisosAtivos}
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-blue-700">no mural</span>
          </div>
        </div>

        {/* Notificações na Fila Push / Erros */}
        <div
          onClick={() => onNavigate('notificacoes')}
          className="group cursor-pointer rounded-2xl bg-white p-4 sm:p-5 shadow-xs border border-slate-200 hover:border-rose-400 hover:shadow-md transition-all active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Fila Push</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <Send className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {metrics.pushPendentesOuErro}
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-rose-700">pend/erro</span>
          </div>
        </div>

        {/* Conteúdos Ativos */}
        <div
          onClick={() => onNavigate('louvor')}
          className="col-span-2 lg:col-span-1 group cursor-pointer rounded-2xl bg-white p-4 sm:p-5 shadow-xs border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Conteúdos</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {metrics.conteudosAtivos}
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-purple-700">no app</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Approvals & Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Cadastros Pendentes */}
        <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm">Últimos Cadastros Pendentes</h3>
            </div>
            <button
              onClick={() => onNavigate('membros')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 min-h-[36px] px-2"
            >
              <span>Ver Todos</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {pendingProfiles.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-6 text-center text-xs text-slate-500 border border-slate-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">Nenhum cadastro pendente no momento!</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Todas as solicitações de membros foram processadas.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingProfiles.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  onClick={() => onNavigate('membros')}
                  className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">
                      {p.nome || p.nome_completo || 'Sem Nome'}
                    </p>
                    <p className="text-[11px] text-slate-500">{p.email} • {p.telefone || 'Sem fone'}</p>
                  </div>
                  <Badge variant="amber">Pendente</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimos Avisos e Notificações */}
        <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Últimos Avisos Publicados</h3>
            </div>
            <button
              onClick={() => onNavigate('notificacoes')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 min-h-[36px] px-2"
            >
              <span>Gerenciar</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {recentNotificacoes.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-6 text-center text-xs text-slate-500 border border-slate-100">
              <Bell className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">Nenhum aviso ativo publicado</p>
              <p className="text-[11px] text-slate-500">Crie o primeiro aviso para informar a igreja.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentNotificacoes.slice(0, 4).map((n) => (
                <div key={n.id} className="rounded-xl bg-slate-50 p-3 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{n.titulo}</span>
                    <Badge variant={n.ativo ? 'emerald' : 'slate'}>{n.ativo ? 'Ativo' : 'Inativo'}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1">{n.mensagem}</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDateFortaleza(n.data_agendamento || n.agendado_para, false)}
                    </span>
                    <span>• {n.categoria}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Push Queue Panel */}
      <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-xs border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-rose-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Fila Push FCM (`push_dispatch_queue`)
              </h3>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Notificações enviadas em segundo plano pela agenda do Supabase.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('notificacoes')}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 min-h-[36px] px-2"
          >
            <span>Ver Fila</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="p-3">Tópico</th>
                <th className="p-3">Notificação</th>
                <th className="p-3">Status</th>
                <th className="p-3">Tentativas</th>
                <th className="p-3">Criado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pushQueueItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500 text-xs">
                    Nenhum item na fila de envio de mensagens push.
                  </td>
                </tr>
              ) : (
                pushQueueItems.slice(0, 5).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono text-[11px] font-bold text-slate-800">
                      {item.topico || 'ibna_todos'}
                    </td>
                    <td className="p-3 text-slate-900 font-medium">
                      {item.notificacoes?.titulo || 'Aviso vinculado'}
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={
                          item.status === 'enviado'
                            ? 'emerald'
                            : item.status === 'erro'
                            ? 'rose'
                            : item.status === 'processando'
                            ? 'blue'
                            : 'amber'
                        }
                      >
                        {item.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3 text-slate-700 font-bold">{item.tentativas}</td>
                    <td className="p-3 text-slate-500 text-[11px]">
                      {formatDateFortaleza(item.criado_em || item.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
