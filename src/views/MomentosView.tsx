import React, { useState } from 'react';
import { Momento, MomentoFoto, AudienciaType } from '../types/supabase';
import { Badge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { StorageUploader } from '../components/ui/StorageUploader';
import { Image as ImageIcon, Plus, Search, Edit2, Trash2, Calendar, Upload, X } from 'lucide-react';

interface MomentosViewProps {
  momentos: Momento[];
  fotos: MomentoFoto[];
  onSaveMomento: (data: Partial<Momento>) => Promise<void>;
  onDeleteMomento: (id: string) => Promise<void>;
  onAddFoto: (momentoId: string, fotoUrl: string, legenda?: string) => Promise<void>;
  onDeleteFoto: (id: string) => Promise<void>;
  loading: boolean;
}

export const MomentosView: React.FC<MomentosViewProps> = ({
  momentos,
  fotos,
  onSaveMomento,
  onDeleteMomento,
  onAddFoto,
  onDeleteFoto,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Momento | null>(null);

  // Gallery state
  const [selectedMomentoForGallery, setSelectedMomentoForGallery] = useState<Momento | null>(null);
  const [newFotoUrl, setNewFotoUrl] = useState('');
  const [newFotoLegenda, setNewFotoLegenda] = useState('');

  // Form State
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [capaUrl, setCapaUrl] = useState('');
  const [dataEvento, setDataEvento] = useState(new Date().toISOString().split('T')[0]);
  const [audiencias, setAudiencias] = useState<AudienciaType[]>(['todos']);
  const [ativo, setAtivo] = useState(true);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitulo('');
    setDescricao('');
    setCapaUrl('');
    setDataEvento(new Date().toISOString().split('T')[0]);
    setAudiencias(['todos']);
    setAtivo(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Momento) => {
    setEditingItem(item);
    setTitulo(item.titulo);
    setDescricao(item.descricao || '');
    setCapaUrl(item.capa_url || '');
    setDataEvento(item.data_evento || new Date().toISOString().split('T')[0]);
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
    await onSaveMomento({
      id: editingItem?.id,
      titulo,
      descricao: descricao || null,
      capa_url: capaUrl || null,
      data_evento: dataEvento || null,
      audiencias,
      ativo,
    });
    setIsModalOpen(false);
  };

  const handleAddFotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMomentoForGallery || !newFotoUrl) return;
    await onAddFoto(selectedMomentoForGallery.id, newFotoUrl, newFotoLegenda);
    setNewFotoUrl('');
    setNewFotoLegenda('');
  };

  const filtered = momentos.filter((m) =>
    m.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Momentos & Álbum de Fotos</h2>
          <p className="text-xs text-slate-500">
            Crie álbuns de eventos, batismos, acampamentos e cultos especiais com galeria de fotos.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-colors"
        >
          <Plus className="h-4 w-4 text-amber-400" />
          <span>Novo Álbum / Momento</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar momentos e eventos..."
          className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs focus:border-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-2xl bg-white p-8 text-center text-xs text-slate-500 border border-slate-200">
            <ImageIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Nenhum momento registrado.</p>
          </div>
        ) : (
          filtered.map((item) => {
            const momentoFotos = fotos.filter((f) => f.momento_id === item.id);
            return (
              <div
                key={item.id}
                className="rounded-2xl bg-white shadow-xs border border-slate-200 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 bg-slate-100">
                    {item.capa_url ? (
                      <img src={item.capa_url} alt={item.titulo} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <ImageIcon className="h-10 w-10" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge variant={item.ativo ? 'emerald' : 'slate'}>{item.ativo ? 'Ativo' : 'Inativo'}</Badge>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-slate-900 text-sm">{item.titulo}</h3>
                    {item.descricao && <p className="text-xs text-slate-600 line-clamp-2">{item.descricao}</p>}

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {item.data_evento ? new Date(item.data_evento).toLocaleDateString('pt-BR') : 'Sem data'}
                      </span>
                      <span className="font-semibold text-amber-700">{momentoFotos.length} Fotos Anexadas</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setSelectedMomentoForGallery(item)}
                    className="font-bold text-amber-600 hover:underline flex items-center gap-1 text-xs"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>Gerenciar Galeria</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="p-1.5 rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Gallery Modal */}
      {selectedMomentoForGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-6 py-4 text-white shrink-0">
              <div>
                <h3 className="font-bold text-base">Galeria do Momento: {selectedMomentoForGallery.titulo}</h3>
                <p className="text-xs text-amber-400">
                  Respeita a audiência do momento pai: {selectedMomentoForGallery.audiencias.join(', ')}
                </p>
              </div>
              <button
                onClick={() => setSelectedMomentoForGallery(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Add Foto Form */}
              <form onSubmit={handleAddFotoSubmit} className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs">Anexar Nova Foto ao Álbum</h4>
                <StorageUploader
                  label="Upload da Foto para o Supabase Storage (`ibna-momentos`)"
                  bucketName="ibna-momentos"
                  folderPath={`momento_${selectedMomentoForGallery.id}`}
                  value={newFotoUrl}
                  onChange={setNewFotoUrl}
                  accept="image/*"
                />

                <div>
                  <input
                    type="text"
                    value={newFotoLegenda}
                    onChange={(e) => setNewFotoLegenda(e.target.value)}
                    placeholder="Legenda da foto (opcional)"
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!newFotoUrl}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 py-2 font-bold text-white disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" /> Adicionar Foto à Galeria
                </button>
              </form>

              {/* Photos List */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {fotos.filter((f) => f.momento_id === selectedMomentoForGallery.id).length === 0 ? (
                  <div className="col-span-full text-center py-6 text-slate-400">
                    Nenhuma foto anexada a este álbum ainda.
                  </div>
                ) : (
                  fotos
                    .filter((f) => f.momento_id === selectedMomentoForGallery.id)
                    .map((foto) => (
                      <div key={foto.id} className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        <img src={foto.foto_url} alt={foto.legenda || 'Foto'} className="h-32 w-full object-cover" />
                        <button
                          onClick={() => onDeleteFoto(foto.id)}
                          className="absolute top-2 right-2 rounded-lg bg-rose-600 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          title="Excluir Foto"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        {foto.legenda && (
                          <div className="p-1.5 bg-slate-900/90 text-[10px] text-white truncate">
                            {foto.legenda}
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Momento Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-6 py-4 text-white shrink-0">
              <h3 className="font-bold text-base">{editingItem ? 'Editar Momento' : 'Novo Momento'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título do Evento / Álbum *</label>
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

              <StorageUploader
                label="Imagem de Capa do Álbum"
                bucketName="ibna-momentos"
                folderPath="capas"
                value={capaUrl}
                onChange={setCapaUrl}
                accept="image/*"
              />

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Data do Evento</label>
                <input
                  type="date"
                  value={dataEvento}
                  onChange={(e) => setDataEvento(e.target.value)}
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
                <span>Álbum Ativo</span>
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
        title="Excluir Álbum Momento"
        message="Tem certeza que deseja excluir este álbum e todas as suas fotos associadas?"
        onConfirm={async () => {
          if (confirmDeleteId) {
            await onDeleteMomento(confirmDeleteId);
            setConfirmDeleteId(null);
          }
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};
