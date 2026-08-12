import React, { useState } from 'react';
import { Notificacao, PushDispatchItem, AudienciaType } from '../types/supabase';
import { Badge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import {
  Bell,
  Plus,
  Search,
  Send,
  Edit2,
  Trash2,
  Clock,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  X,
  Layers,
} from 'lucide-react';

interface NotificacoesViewProps {
  notificacoes: Notificacao[];
  pushQueue: PushDispatchItem[];
  onSaveNotificacao: (data: Partial<Notificacao>) => Promise<void>;
  onDeleteNotificacao: (id: string) => Promise<void>;
  onToggleAtivo: (id: string, currentAtivo: boolean) => Promise<void>;
  loading: boolean;
}

export const NotificacoesView: React.FC<NotificacoesViewProps> = ({
  notificacoes,
  pushQueue,
  onSaveNotificacao,
  onDeleteNotificacao,
  onToggleAtivo,
  loading,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'avisos' | 'push_queue'>('avisos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Notificacao | null>(null);

  // Form State
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [categoria, setCategoria] = useState('Geral');
  const [destino, setDestino] = useState('');
  const [audiencias, setAudiencias] = useState<AudienciaType[]>(['todos']);
  const [dataAgendamento, setDataAgendamento] = useState(new Date().toISOString().slice(0, 16));
  const [dataExpiracao, setDataExpiracao] = useState('');
  const [notificar, setNotificar] = useState(true);
  const [ativo, setAtivo] = useState(true);

  // Confirm delete modal
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitulo('');
    setMensagem('');
    setCategoria('Geral');
    setDestino('');
    setAudiencias(['todos']);
    setDataAgendamento(new Date().toISOString().slice(0, 16));
    setDataExpiracao('');
    setNotificar(true);
    setAtivo(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Notificacao) => {
    setEditingItem(item);
    setTitulo(item.titulo);
    setMensagem(item.mensagem);
    setCategoria(item.categoria || 'Geral');
    setDestino(item.destino || '');
    setAudiencias(item.audiencias || ['todos']);
    setDataAgendamento(
      item.data_agendamento ? new Date(item.data_agendamento).toISOString().slice(0, 16) : ''
    );
    setDataExpiracao(
      item.data_expiracao ? new Date(item.data_expiracao).toISOString().slice(0, 16) : ''
    );
    setNotificar(item.notificar);
    setAtivo(item.ativo);
    setIsModalOpen(true);
  };

  const handleToggleAudiencia = (aud: AudienciaType) => {
    if (audiencias.includes(aud)) {
      if (audiencias.length > 1) {
        setAudiencias(audiencias.filter((a) => a !== aud));
      }
    } else {
      setAudiencias([...audiencias, aud]);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveNotificacao({
      id: editingItem?.id,
      titulo,
      mensagem,
      categoria,
      destino: destino || null,
      audiencias,
      data_agendamento: new Date(dataAgendamento).toISOString(),
      data_expiracao: dataExpiracao ? new Date(dataExpiracao).toISOString() : null,
      notificar,
      ativo,
    });
    setIsModalOpen(false);
  };

  const filteredNotificacoes = notificacoes.filter(
    (n) =>
      n.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.mensagem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Avisos e Notificações Push</h2>
          <p className="text-xs text-slate-500">
            Publique avisos no mural do app IBNA e acompanhe o enfileiramento das mensagens push.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-colors"
        >
          <Plus className="h-4 w-4 text-amber-400" />
          <span>Novo Aviso / Notificação</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('avisos')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeSubTab === 'avisos'
              ? 'border-amber-500 text-amber-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>Avisos Publicados ({notificacoes.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('push_queue')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeSubTab === 'push_queue'
              ? 'border-rose-500 text-rose-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send className="h-4 w-4" />
          <span>Fila de Envio Push ({pushQueue.length})</span>
        </button>
      </div>

      {activeSubTab === 'avisos' ? (
        <>
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar avisos por título, conteúdo ou categoria..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* List of Avisos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotificacoes.length === 0 ? (
              <div className="col-span-full rounded-2xl bg-white p-8 text-center text-xs text-slate-500 border border-slate-200">
                <Bell className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">Nenhum aviso encontrado.</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Clique em "Novo Aviso / Notificação" para criar uma publicação para a igreja.
                </p>
              </div>
            ) : (
              filteredNotificacoes.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-900 text-sm leading-snug">{item.titulo}</span>
                      <Badge variant={item.ativo ? 'emerald' : 'slate'}>
                        {item.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {item.mensagem}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                      <Badge variant="blue">Categoria: {item.categoria}</Badge>
                      <Badge variant="purple">Audiência: {item.audiencias.join(', ')}</Badge>
                      {item.notificar && <Badge variant="amber">Enfileirado Push</Badge>}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{new Date(item.data_agendamento).toLocaleString('pt-BR')}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleAtivo(item.id, item.ativo)}
                        className="text-xs text-slate-600 hover:text-slate-900 underline font-medium"
                      >
                        {item.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        title="Editar"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        /* Push Queue Subtab */
        <div className="rounded-2xl bg-white p-6 shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 font-bold">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Histórico da Fila Push FCM</h3>
              <p className="text-xs text-slate-500">
                A agenda do Supabase executa a Edge Function <code className="bg-slate-100 px-1 font-mono">super-handler</code> em background de forma segura.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="p-3">Tópico FCM</th>
                  <th className="p-3">Título Notificação</th>
                  <th className="p-3">Status Envio</th>
                  <th className="p-3">Tentativas</th>
                  <th className="p-3">Último Erro Retornado</th>
                  <th className="p-3">Criado em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pushQueue.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500">
                      Nenhuma notificação na fila de envio no momento.
                    </td>
                  </tr>
                ) : (
                  pushQueue.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-800">{p.topico}</td>
                      <td className="p-3 font-semibold text-slate-900">
                        {p.notificacoes?.titulo || 'Notificação vinculada'}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            p.status === 'enviado'
                              ? 'emerald'
                              : p.status === 'erro'
                              ? 'rose'
                              : p.status === 'processando'
                              ? 'blue'
                              : 'amber'
                          }
                        >
                          {p.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3 font-bold text-slate-700">{p.tentativas}</td>
                      <td className="p-3 text-rose-600 text-[11px] max-w-xs truncate">
                        {p.ultimo_erro || <span className="text-slate-400">Nenhum erro registrado</span>}
                      </td>
                      <td className="p-3 text-slate-500 text-[11px]">
                        {new Date(p.criado_em).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-6 py-4 text-white shrink-0">
              <h3 className="font-bold text-base">
                {editingItem ? 'Editar Aviso / Notificação' : 'Criar Novo Aviso'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título do Aviso *</label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Culto de Ceia neste Domingo"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mensagem do Aviso / Notificação *</label>
                <textarea
                  required
                  rows={4}
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Escreva a mensagem completa..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500"
                  >
                    <option value="Geral">Geral</option>
                    <option value="Culto">Culto</option>
                    <option value="Evento">Evento</option>
                    <option value="Liderança">Liderança</option>
                    <option value="Jovens">Jovens</option>
                    <option value="Infantil">Infantil</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Destino / Link do App</label>
                  <input
                    type="text"
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                    placeholder="Ex: /cultos ou /estudos"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Audiência Selectable Pills */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Audiência Alvo (Combinável):
                </label>
                <div className="flex gap-2">
                  {(['todos', 'membros', 'lideranca'] as AudienciaType[]).map((aud) => {
                    const isSelected = audiencias.includes(aud);
                    return (
                      <button
                        key={aud}
                        type="button"
                        onClick={() => handleToggleAudiencia(aud)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-2xs'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {aud === 'todos' ? 'Público Geral (Todos)' : aud === 'membros' ? 'Membros Aprovados' : 'Liderança IBNA'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data / Hora de Agendamento</label>
                  <input
                    type="datetime-local"
                    value={dataAgendamento}
                    onChange={(e) => setDataAgendamento(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data de Expiração (Opcional)</label>
                  <input
                    type="datetime-local"
                    value={dataExpiracao}
                    onChange={(e) => setDataExpiracao(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={notificar}
                    onChange={(e) => setNotificar(e.target.checked)}
                    className="rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>Enfileirar Notificação Push FCM</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={ativo}
                    onChange={(e) => setAtivo(e.target.checked)}
                    className="rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>Aviso Ativo no App</span>
                </label>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs"
                >
                  Salvar e Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(confirmDeleteId)}
        title="Excluir Aviso"
        message="Tem certeza que deseja remover permanentemente este aviso?"
        onConfirm={async () => {
          if (confirmDeleteId) {
            await onDeleteNotificacao(confirmDeleteId);
            setConfirmDeleteId(null);
          }
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};
