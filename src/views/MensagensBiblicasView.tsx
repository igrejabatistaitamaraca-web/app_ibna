import React, { useState } from 'react';
import { MensagemBiblica, AudienciaType } from '../types/supabase';
import { Badge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { ContentNotificationButton } from '../components/ui/ContentNotificationButton';
import { Radio, Plus, Search, Edit2, Trash2, Video, Volume2, Calendar, X } from 'lucide-react';

interface MensagensBiblicasViewProps {
  items: MensagemBiblica[];
  onSave: (data: Partial<MensagemBiblica>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEnqueueNotification: (contentType: 'louvor' | 'estudo' | 'mensagem' | 'momento', contentId: string) => Promise<void>;
  loading: boolean;
}

export const MensagensBiblicasView: React.FC<MensagensBiblicasViewProps> = ({
  items,
  onSave,
  onDelete,
  onEnqueueNotification,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MensagemBiblica | null>(null);

  const [titulo, setTitulo] = useState('');
  const [pregador, setPregador] = useState('');
  const [textoChave, setTextoChave] = useState('');
  const [resumo, setResumo] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [dataPregada, setDataPregada] = useState(new Date().toISOString().split('T')[0]);
  const [audiencias, setAudiencias] = useState<AudienciaType[]>(['todos']);
  const [ativo, setAtivo] = useState(true);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitulo('');
    setPregador('Pr. Carlos Eduardo Santos');
    setTextoChave('João 3:16');
    setResumo('');
    setVideoUrl('');
    setAudioUrl('');
    setDataPregada(new Date().toISOString().split('T')[0]);
    setAudiencias(['todos']);
    setAtivo(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: MensagemBiblica) => {
    setEditingItem(item);
    setTitulo(item.titulo);
    setPregador(item.pregador || '');
    setTextoChave(item.texto_chave || '');
    setResumo(item.resumo || '');
    setVideoUrl(item.video_url || '');
    setAudioUrl(item.audio_url || '');
    setDataPregada(item.data_pregada || new Date().toISOString().split('T')[0]);
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
      pregador: pregador || null,
      texto_chave: textoChave || null,
      resumo: resumo || null,
      video_url: videoUrl || null,
      audio_url: audioUrl || null,
      data_pregada: dataPregada || null,
      audiencias,
      ativo,
    });
    setIsModalOpen(false);
  };

  const filtered = items.filter(
    (i) =>
      i.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.pregador || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.texto_chave || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Mensagens Bíblicas & Pregações</h2>
          <p className="text-xs text-slate-500">
            Gerencie o acervo de sermões, áudios e transmissões em vídeo dos cultos IBNA.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-colors"
        >
          <Plus className="h-4 w-4 text-amber-400" />
          <span>Nova Pregação / Sermão</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar sermões por título, pregador ou texto bíblico..."
          className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs focus:border-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-2xl bg-white p-8 text-center text-xs text-slate-500 border border-slate-200">
            <Radio className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Nenhuma mensagem bíblica encontrada.</p>
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
                    <h3 className="font-bold text-slate-900 text-sm">{item.titulo}</h3>
                    <p className="text-xs font-semibold text-amber-700">{item.pregador || 'Pregador IBNA'}</p>
                  </div>
                  <Badge variant={item.ativo ? 'emerald' : 'slate'}>{item.ativo ? 'Ativo' : 'Inativo'}</Badge>
                </div>

                {item.texto_chave && (
                  <Badge variant="purple" className="font-serif">
                    Texto Bíblico: {item.texto_chave}
                  </Badge>
                )}

                {item.resumo && <p className="text-xs text-slate-600 leading-relaxed">{item.resumo}</p>}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-[11px]">
                  {item.video_url && (
                    <a href={item.video_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-red-600 font-bold hover:underline">
                      <Video className="h-3.5 w-3.5" /> Vídeo
                    </a>
                  )}
                  {item.audio_url && (
                    <a href={item.audio_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 font-bold hover:underline">
                      <Volume2 className="h-3.5 w-3.5" /> Áudio
                    </a>
                  )}
                  {item.data_pregada && (
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {new Date(item.data_pregada).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <ContentNotificationButton contentType="mensagem" contentId={item.id} contentTitle={item.titulo} onEnqueue={onEnqueueNotification} />
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
              <h3 className="font-bold text-base">{editingItem ? 'Editar Mensagem' : 'Nova Pregação'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título do Sermão *</label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pregador / Pastor</label>
                  <input
                    type="text"
                    value={pregador}
                    onChange={(e) => setPregador(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Texto Bíblico Chave</label>
                  <input
                    type="text"
                    value={textoChave}
                    onChange={(e) => setTextoChave(e.target.value)}
                    placeholder="Ex: Romanos 8:28"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Link Vídeo (YouTube)</label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data da Pregação</label>
                  <input
                    type="date"
                    value={dataPregada}
                    onChange={(e) => setDataPregada(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resumo da Mensagem</label>
                <textarea
                  rows={3}
                  value={resumo}
                  onChange={(e) => setResumo(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
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
                <span>Mensagem Ativa</span>
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
        title="Excluir Mensagem Bíblica"
        message="Tem certeza que deseja excluir esta pregação?"
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
