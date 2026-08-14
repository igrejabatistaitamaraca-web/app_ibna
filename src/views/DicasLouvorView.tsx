import React, { useState } from 'react';
import { DicaLouvor, AudienciaType } from '../types/supabase';
import { Badge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { ContentNotificationButton } from '../components/ui/ContentNotificationButton';
import { Music, Plus, Search, Edit2, Trash2, ExternalLink, FileText, Check, X } from 'lucide-react';

interface DicasLouvorViewProps {
  items: DicaLouvor[];
  onSave: (data: Partial<DicaLouvor>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEnqueueNotification: (contentType: 'louvor' | 'estudo' | 'mensagem' | 'momento', contentId: string) => Promise<void>;
  loading: boolean;
}

export const DicasLouvorView: React.FC<DicasLouvorViewProps> = ({ items, onSave, onDelete, onEnqueueNotification, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DicaLouvor | null>(null);

  const [titulo, setTitulo] = useState('');
  const [artistaAutor, setArtistaAutor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [linkAudioVideo, setLinkAudioVideo] = useState('');
  const [audiencias, setAudiencias] = useState<AudienciaType[]>(['todos']);
  const [ativo, setAtivo] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitulo('');
    setArtistaAutor('');
    setDescricao('');
    setLinkAudioVideo('');
    setAudiencias(['todos']);
    setAtivo(true);
    setSaveError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: DicaLouvor) => {
    setEditingItem(item);
    setTitulo(item.titulo);
    setArtistaAutor(item.artista_autor || '');
    setDescricao(item.descricao || '');
    setLinkAudioVideo(item.link_audio_video || '');
    setAudiencias(item.audiencias || ['todos']);
    setAtivo(item.ativo);
    setSaveError(null);
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
    setSaveError(null);
    try {
      await onSave({
        id: editingItem?.id,
        titulo,
        artista_autor: artistaAutor || null,
        descricao: descricao || null,
        link_audio_video: linkAudioVideo || null,
        audiencias,
        ativo,
      });
      setIsModalOpen(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Não foi possível salvar a dica de louvor.');
    }
  };

  const filtered = items.filter(
    (i) =>
      i.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.artista_autor || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Dicas de Louvor</h2>
          <p className="text-xs text-slate-500">
            Cadastre músicas, tons, cifras e referências em áudio para as equipes de louvor da igreja.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-colors"
        >
          <Plus className="h-4 w-4 text-amber-400" />
          <span>Nova Dica de Louvor</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar dicas de louvor por título ou artista..."
          className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs focus:border-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-2xl bg-white p-8 text-center text-xs text-slate-500 border border-slate-200">
            <Music className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Nenhuma dica de louvor encontrada.</p>
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
                    <p className="text-xs font-medium text-amber-700">{item.artista_autor || 'Artista não informado'}</p>
                  </div>
                  <Badge variant={item.ativo ? 'emerald' : 'slate'}>{item.ativo ? 'Ativo' : 'Inativo'}</Badge>
                </div>

                {item.descricao && <p className="text-xs text-slate-600">{item.descricao}</p>}

              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {item.link_audio_video ? (
                  <a
                    href={item.link_audio_video}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-amber-600 hover:underline text-[11px] font-semibold"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Ouvir / Vídeo</span>
                  </a>
                ) : (
                  <span className="text-slate-400 text-[11px]">Sem link externo</span>
                )}

                <div className="flex items-center gap-2">
                  <ContentNotificationButton contentType="louvor" contentId={item.id} contentTitle={item.titulo} onEnqueue={onEnqueueNotification} />
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
              <h3 className="font-bold text-base">{editingItem ? 'Editar Louvor' : 'Nova Dica de Louvor'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título da Música *</label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Artista / Autor</label>
                <input
                  type="text"
                  value={artistaAutor}
                  onChange={(e) => setArtistaAutor(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Link Áudio / Vídeo (YouTube, Spotify)</label>
                <input
                  type="url"
                  value={linkAudioVideo}
                  onChange={(e) => setLinkAudioVideo(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observações / Orientação Prática</label>
                <textarea
                  rows={2}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              {/* Audiência Selectable */}
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
                <span>Conteúdo Ativo</span>
              </label>

              {saveError && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700">{saveError}</p>}

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
        title="Excluir Dica de Louvor"
        message="Tem certeza que deseja remover esta dica de louvor?"
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
