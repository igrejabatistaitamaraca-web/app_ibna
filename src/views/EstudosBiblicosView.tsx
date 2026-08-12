import React, { useState } from 'react';
import { EstudoBiblico, AudienciaType } from '../types/supabase';
import { Badge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { StorageUploader } from '../components/ui/StorageUploader';
import { BookOpen, Plus, Search, Edit2, Trash2, FileText, ExternalLink, X } from 'lucide-react';

interface EstudosBiblicosViewProps {
  items: EstudoBiblico[];
  onSave: (data: Partial<EstudoBiblico>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading: boolean;
}

export const EstudosBiblicosView: React.FC<EstudosBiblicosViewProps> = ({
  items,
  onSave,
  onDelete,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EstudoBiblico | null>(null);

  const [titulo, setTitulo] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [audiencias, setAudiencias] = useState<AudienciaType[]>(['todos']);
  const [ativo, setAtivo] = useState(true);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitulo('');
    setSubtitulo('');
    setAutor('Pr. Carlos Santos');
    setCategoria('Doutrina');
    setConteudo('');
    setPdfUrl('');
    setImagemUrl('');
    setAudiencias(['todos']);
    setAtivo(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: EstudoBiblico) => {
    setEditingItem(item);
    setTitulo(item.titulo);
    setSubtitulo(item.subtitulo || '');
    setAutor(item.autor || '');
    setCategoria(item.categoria || '');
    setConteudo(item.conteudo || '');
    setPdfUrl(item.pdf_url || '');
    setImagemUrl(item.imagem_url || '');
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
      subtitulo: subtitulo || null,
      autor: autor || null,
      categoria: categoria || null,
      conteudo: conteudo || null,
      pdf_url: pdfUrl || null,
      imagem_url: imagemUrl || null,
      audiencias,
      ativo,
    });
    setIsModalOpen(false);
  };

  const filtered = items.filter(
    (i) =>
      i.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.autor || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Estudos Bíblicos e EBD</h2>
          <p className="text-xs text-slate-500">
            Publique esboços, apostilas em PDF e lições da Escola Bíblica Dominical para os membros.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-colors"
        >
          <Plus className="h-4 w-4 text-amber-400" />
          <span>Novo Estudo Bíblico</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar estudos por título, autor ou tema..."
          className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs focus:border-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-2xl bg-white p-8 text-center text-xs text-slate-500 border border-slate-200">
            <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Nenhum estudo bíblico encontrado.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                {item.imagem_url && (
                  <img
                    src={item.imagem_url}
                    alt={item.titulo}
                    className="h-32 w-full object-cover rounded-xl border border-slate-100"
                  />
                )}

                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{item.titulo}</h3>
                    {item.subtitulo && <p className="text-xs text-slate-500">{item.subtitulo}</p>}
                    <p className="text-[11px] font-semibold text-amber-700 mt-0.5">
                      Autor: {item.autor || 'IBNA'}
                    </p>
                  </div>
                  <Badge variant={item.ativo ? 'emerald' : 'slate'}>{item.ativo ? 'Ativo' : 'Inativo'}</Badge>
                </div>

                {item.conteudo && <p className="text-xs text-slate-600 line-clamp-3">{item.conteudo}</p>}

                <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                  {item.categoria && <Badge variant="purple">{item.categoria}</Badge>}
                  <Badge variant="blue">Audiência: {item.audiencias.join(', ')}</Badge>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {item.pdf_url ? (
                  <a
                    href={item.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-amber-600 hover:underline text-[11px] font-bold"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Baixar PDF</span>
                  </a>
                ) : (
                  <span className="text-slate-400 text-[11px]">Sem PDF anexo</span>
                )}

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
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-6 py-4 text-white shrink-0">
              <h3 className="font-bold text-base">{editingItem ? 'Editar Estudo' : 'Novo Estudo Bíblico'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título do Estudo *</label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subtítulo / Série</label>
                <input
                  type="text"
                  value={subtitulo}
                  onChange={(e) => setSubtitulo(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Autor / Preletor</label>
                  <input
                    type="text"
                    value={autor}
                    onChange={(e) => setAutor(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoria / Tema</label>
                  <input
                    type="text"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    placeholder="Ex: Teologia, EBD, Família"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Conteúdo do Estudo</label>
                <textarea
                  rows={4}
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  placeholder="Escreva a introdução ou lição completa..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <StorageUploader
                label="Imagem de Capa (Supabase Storage)"
                bucketName="ibna-estudos"
                folderPath="capas"
                value={imagemUrl}
                onChange={setImagemUrl}
                accept="image/*"
              />

              <StorageUploader
                label="Arquivo PDF de Estudo (Apostila)"
                bucketName="ibna-estudos"
                folderPath="pdfs"
                value={pdfUrl}
                onChange={setPdfUrl}
                accept="application/pdf"
              />

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audiência Permissória:</label>
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
                <span>Estudo Ativo</span>
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
        title="Excluir Estudo Bíblico"
        message="Deseja excluir permanentemente este estudo?"
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
