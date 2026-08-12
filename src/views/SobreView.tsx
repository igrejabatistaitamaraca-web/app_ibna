import React, { useState } from 'react';
import { SobreIgreja } from '../types/supabase';
import { Badge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { StorageUploader } from '../components/ui/StorageUploader';
import { Church, Plus, Edit2, Trash2, X } from 'lucide-react';

interface SobreViewProps {
  items: SobreIgreja[];
  onSave: (data: Partial<SobreIgreja>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading: boolean;
}

export const SobreView: React.FC<SobreViewProps> = ({ items, onSave, onDelete, loading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SobreIgreja | null>(null);

  const [secao, setSecao] = useState('historia');
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [ordem, setOrdem] = useState(1);
  const [ativo, setAtivo] = useState(true);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingItem(null);
    setSecao('historia');
    setTitulo('');
    setConteudo('');
    setImagemUrl('');
    setOrdem(items.length + 1);
    setAtivo(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: SobreIgreja) => {
    setEditingItem(item);
    setSecao(item.secao);
    setTitulo(item.titulo);
    setConteudo(item.conteudo);
    setImagemUrl(item.imagem_url || '');
    setOrdem(item.ordem || 1);
    setAtivo(item.ativo);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      id: editingItem?.id,
      secao,
      titulo,
      conteudo,
      imagem_url: imagemUrl || null,
      ordem,
      ativo,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Sobre a Igreja Batista Nova Aliança</h2>
          <p className="text-xs text-slate-500">
            Edite a história, visão, declaração de fé e informações institucionais apresentadas no app.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-colors"
        >
          <Plus className="h-4 w-4 text-amber-400" />
          <span>Nova Seção Institucional</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl bg-white p-6 shadow-xs border border-slate-200 space-y-4">
            {item.imagem_url && (
              <img src={item.imagem_url} alt={item.titulo} className="h-40 w-full object-cover rounded-xl" />
            )}

            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                  Seção: {item.secao}
                </span>
                <h3 className="font-bold text-slate-900 text-base">{item.titulo}</h3>
              </div>
              <Badge variant={item.ativo ? 'emerald' : 'slate'}>{item.ativo ? 'Ativo' : 'Inativo'}</Badge>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{item.conteudo}</p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Ordem de exibição: #{item.ordem}</span>

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
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-6 py-4 text-white shrink-0">
              <h3 className="font-bold text-base">{editingItem ? 'Editar Seção' : 'Nova Seção Institucional'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Seção / Identificador *</label>
                  <input
                    type="text"
                    required
                    value={secao}
                    onChange={(e) => setSecao(e.target.value)}
                    placeholder="Ex: historia, visao, lideranca"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ordem de Exibição</label>
                  <input
                    type="number"
                    value={ordem}
                    onChange={(e) => setOrdem(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título da Seção *</label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Conteúdo Textual *</label>
                <textarea
                  rows={5}
                  required
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <StorageUploader
                label="Imagem Ilustrativa"
                bucketName="ibna-media"
                folderPath="sobre"
                value={imagemUrl}
                onChange={setImagemUrl}
                accept="image/*"
              />

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 pt-1">
                <input
                  type="checkbox"
                  checked={ativo}
                  onChange={(e) => setAtivo(e.target.checked)}
                  className="rounded-sm border-slate-300 text-amber-600"
                />
                <span>Seção Ativa</span>
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
        title="Excluir Seção Institucional"
        message="Tem certeza que deseja excluir esta seção do Sobre a Igreja?"
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
