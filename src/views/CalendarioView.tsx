import React, { useState } from 'react';
import { EventoCalendario, AudienciaType } from '../types/supabase';
import { Badge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Calendar, Plus, Search, Edit2, Trash2, MapPin, Clock, X } from 'lucide-react';

interface CalendarioViewProps {
  items: EventoCalendario[];
  onSave: (data: Partial<EventoCalendario>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading: boolean;
}

export const CalendarioView: React.FC<CalendarioViewProps> = ({ items, onSave, onDelete, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EventoCalendario | null>(null);

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [local, setLocal] = useState('Templo Principal IBNA');
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().slice(0, 16));
  const [dataFim, setDataFim] = useState('');
  const [categoria, setCategoria] = useState('Culto');
  const [audiencias, setAudiencias] = useState<AudienciaType[]>(['todos']);
  const [ativo, setAtivo] = useState(true);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitulo('');
    setDescricao('');
    setLocal('Templo Principal IBNA');
    setDataInicio(new Date().toISOString().slice(0, 16));
    setDataFim('');
    setCategoria('Culto');
    setAudiencias(['todos']);
    setAtivo(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: EventoCalendario) => {
    setEditingItem(item);
    setTitulo(item.titulo);
    setDescricao(item.descricao || '');
    setLocal(item.local || '');
    setDataInicio(item.data_inicio ? new Date(item.data_inicio).toISOString().slice(0, 16) : '');
    setDataFim(item.data_fim ? new Date(item.data_fim).toISOString().slice(0, 16) : '');
    setCategoria(item.categoria || 'Culto');
    setAudiencias(item.audiencias || ['todos']);
    setAtivo(item.ativo);
    setIsModalOpen(true);
  };

  const handleToggleAudiencia = (aud: AudienciaType) => {
    if (audiencias.includes(aud)) {
      if (audiencias.length > 1) setAudiencias(audiencias.filter((a) => a !== aud));
    } else {
      setAudiencias([...audiencias, aud]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      id: editingItem?.id,
      titulo,
      descricao: descricao || null,
      local: local || null,
      data_inicio: new Date(dataInicio).toISOString(),
      data_fim: dataFim ? new Date(dataFim).toISOString() : null,
      categoria,
      audiencias,
      ativo,
    });
    setIsModalOpen(false);
  };

  const filtered = items.filter(
    (i) =>
      i.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.local || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Calendário e Agenda Geral IBNA</h2>
          <p className="text-xs text-slate-500">
            Gerencie horários de cultos, reuniões de liderança, conferências e vigílias da igreja.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-colors"
        >
          <Plus className="h-4 w-4 text-amber-400" />
          <span>Novo Evento na Agenda</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar eventos por nome ou local..."
          className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs focus:border-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-2xl bg-white p-8 text-center text-xs text-slate-500 border border-slate-200">
            <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Nenhum evento agendado.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-amber-600 tracking-wider">
                      {item.categoria || 'Evento'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{item.titulo}</h3>
                  </div>
                  <Badge variant={item.ativo ? 'emerald' : 'slate'}>{item.ativo ? 'Ativo' : 'Inativo'}</Badge>
                </div>

                {item.descricao && <p className="text-xs text-slate-600 line-clamp-2">{item.descricao}</p>}

                <div className="space-y-1 text-[11px] text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                    <span className="font-semibold">{new Date(item.data_inicio).toLocaleString('pt-BR')}</span>
                  </div>
                  {item.local && (
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{item.local}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <Badge variant="blue">Audiência: {item.audiencias.join(', ')}</Badge>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(item.id)}
                    className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-6 py-4 text-white shrink-0">
              <h3 className="font-bold text-base">{editingItem ? 'Editar Evento' : 'Novo Evento no Calendário'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título do Evento *</label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Local</label>
                  <input
                    type="text"
                    value={local}
                    onChange={(e) => setLocal(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    <option value="Culto">Culto</option>
                    <option value="Oração">Oração</option>
                    <option value="Conferência">Conferência</option>
                    <option value="EBD">EBD</option>
                    <option value="Jovens">Jovens</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Início *</label>
                  <input
                    type="datetime-local"
                    required
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Término (Opcional)</label>
                  <input
                    type="datetime-local"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audiência:</label>
                <div className="flex gap-2">
                  {(['todos', 'membros', 'lideranca'] as AudienciaType[]).map((aud) => (
                    <button
                      key={aud}
                      type="button"
                      onClick={() => handleToggleAudiencia(aud)}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold border ${
                        audiencias.includes(aud)
                          ? 'bg-amber-500 text-slate-950 border-amber-600'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {aud}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 pt-1">
                <input
                  type="checkbox"
                  checked={ativo}
                  onChange={(e) => setAtivo(e.target.checked)}
                  className="rounded-sm border-slate-300 text-amber-600"
                />
                <span>Evento Ativo no Calendário</span>
              </label>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-5 py-2 text-xs font-semibold text-white"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(confirmDeleteId)}
        title="Excluir Evento"
        message="Tem certeza que deseja excluir este evento do calendário?"
        onConfirm={async () => {
          if (confirmDeleteId) {
            await onDelete(confirmDeleteId);
            setConfirmDeleteId(null);
          }
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};
