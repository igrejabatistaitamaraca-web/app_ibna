import React, { useState } from 'react';
import { Profile, StatusCadastro } from '../types/supabase';
import { Badge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { formatDateFortaleza } from '../lib/dataUtils';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Award,
  Eye,
  UserCheck,
  X,
  Phone,
  Mail,
  Calendar,
  Shield,
  Filter,
} from 'lucide-react';

interface MembrosViewProps {
  profiles: Profile[];
  onAprovarMembro: (id: string, numeroMembro?: string, membroDesde?: string) => Promise<void>;
  onReprovarMembro: (id: string) => Promise<void>;
  onAtualizarMembro: (
    id: string,
    ativo: boolean,
    ehLider: boolean,
    cargoLideranca: string,
    numeroMembro: string,
    membroDesde: string
  ) => Promise<void>;
  loading: boolean;
}

export const MembrosView: React.FC<MembrosViewProps> = ({
  profiles,
  onAprovarMembro,
  onReprovarMembro,
  onAtualizarMembro,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | StatusCadastro>('todos');
  const [ativoFilter, setAtivoFilter] = useState<'todos' | 'ativo' | 'inativo'>('todos');

  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  // Edit fields
  const [editNumeroMembro, setEditNumeroMembro] = useState('');
  const [editMembroDesde, setEditMembroDesde] = useState('');
  const [editCargoLideranca, setEditCargoLideranca] = useState('');
  const [editEhLider, setEditEhLider] = useState(false);
  const [editAtivo, setEditAtivo] = useState(true);

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
  });

  const getProfileName = (p: Profile) => p.nome || p.nome_completo || 'Membro sem Nome';

  const filteredProfiles = profiles.filter((p) => {
    const name = getProfileName(p).toLowerCase();
    const email = (p.email || '').toLowerCase();
    const num = (p.numero_membro || '').toLowerCase();
    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      num.includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'todos' ? true : p.status_cadastro === statusFilter;
    const matchesAtivo =
      ativoFilter === 'todos' ? true : ativoFilter === 'ativo' ? p.ativo : !p.ativo;

    return matchesSearch && matchesStatus && matchesAtivo;
  });

  const openDetail = (p: Profile) => {
    setSelectedProfile(p);
    setEditNumeroMembro(p.numero_membro || '');
    setEditMembroDesde(p.membro_desde || p.data_membro_desde || '');
    setEditCargoLideranca(p.cargo_lideranca || '');
    setEditEhLider(p.eh_lider || false);
    setEditAtivo(p.ativo);
  };

  const handleAprovar = async (p: Profile) => {
    const name = getProfileName(p);
    setConfirmModal({
      isOpen: true,
      title: 'Aprovar Cadastro de Membro',
      message: `Tem certeza que deseja aprovar o cadastro de ${name}? O membro terá permissões liberadas no app.`,
      action: async () => {
        await onAprovarMembro(
          p.id,
          editNumeroMembro || 'IBNA-' + Math.floor(1000 + Math.random() * 9000),
          editMembroDesde || new Date().toISOString().split('T')[0]
        );
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setSelectedProfile(null);
      },
    });
  };

  const handleReprovar = async (p: Profile) => {
    const name = getProfileName(p);
    setConfirmModal({
      isOpen: true,
      title: 'Reprovar Cadastro',
      message: `Deseja reprovar o cadastro de ${name}?`,
      action: async () => {
        await onReprovarMembro(p.id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setSelectedProfile(null);
      },
    });
  };

  const handleSaveEdits = async () => {
    if (!selectedProfile) return;
    await onAtualizarMembro(
      selectedProfile.id,
      editAtivo,
      editEhLider,
      editCargoLideranca,
      editNumeroMembro,
      editMembroDesde
    );
    setSelectedProfile(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Gestão de Membros IBNA</h2>
          <p className="text-xs text-slate-500">
            Aprove cadastros do app Android, gerencie cargos de liderança e consulte o livro de membros.
          </p>
        </div>
      </div>

      {/* Quick Filter Tabs for Mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setStatusFilter('todos')}
          className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap min-h-[40px] flex items-center transition-all ${
            statusFilter === 'todos'
              ? 'bg-[#002366] text-[#D4AF37] shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Todos ({profiles.length})
        </button>

        <button
          onClick={() => setStatusFilter('pendente')}
          className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap min-h-[40px] flex items-center transition-all ${
            statusFilter === 'pendente'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Pendentes ({profiles.filter((p) => p.status_cadastro === 'pendente').length})
        </button>

        <button
          onClick={() => setStatusFilter('aprovado')}
          className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap min-h-[40px] flex items-center transition-all ${
            statusFilter === 'aprovado'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Aprovados ({profiles.filter((p) => p.status_cadastro === 'aprovado').length})
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-2xl bg-white p-3.5 shadow-xs border border-slate-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, e-mail ou nº de membro..."
            className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 min-h-[44px]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={ativoFilter}
            onChange={(e) => setAtivoFilter(e.target.value as any)}
            className="w-full sm:w-auto rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-800 focus:border-amber-500 min-h-[44px]"
          >
            <option value="todos">Todos os Perfis</option>
            <option value="ativo">Somente Ativos</option>
            <option value="inativo">Somente Inativos</option>
          </select>
        </div>
      </div>

      {/* MOBILE-FIRST CARD LIST (Visible on screens < md) */}
      <div className="block md:hidden space-y-3">
        {filteredProfiles.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center text-xs text-slate-500 border border-slate-200 space-y-2">
            <Users className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">Nenhum membro encontrado.</p>
            <p className="text-[11px] text-slate-500">Ajuste os filtros ou verifique o banco Supabase.</p>
          </div>
        ) : (
          filteredProfiles.map((p) => {
            const name = getProfileName(p);
            return (
              <div
                key={p.id}
                className="rounded-2xl bg-white p-4 shadow-xs border border-slate-200 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#002366] text-[#D4AF37] font-black text-sm shadow-xs">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">{name}</h4>
                      <p className="text-[11px] text-slate-500 break-all">{p.email}</p>
                    </div>
                  </div>

                  <Badge
                    variant={
                      p.status_cadastro === 'aprovado'
                        ? 'emerald'
                        : p.status_cadastro === 'pendente'
                        ? 'amber'
                        : 'rose'
                    }
                  >
                    {p.status_cadastro.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 pt-1">
                  {p.numero_membro && (
                    <span className="font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-semibold">
                      {p.numero_membro}
                    </span>
                  )}
                  {p.eh_lider && (
                    <Badge variant="purple">
                      <Award className="h-3 w-3 mr-1" />
                      {p.cargo_lideranca || 'Líder'}
                    </Badge>
                  )}
                  {p.is_admin && <Badge variant="amber">Admin Supabase</Badge>}
                  <Badge variant={p.ativo ? 'emerald' : 'slate'}>{p.ativo ? 'Ativo' : 'Inativo'}</Badge>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400">
                    Cadastrado: {formatDateFortaleza(p.criado_em || p.created_at, false)}
                  </span>

                  <button
                    onClick={() => openDetail(p)}
                    className="flex-1 max-w-[140px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#002366] px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#001848] min-h-[40px] cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 text-[#D4AF37]" />
                    <span>Gerenciar</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP TABLE (Hidden on small screens) */}
      <div className="hidden md:block rounded-2xl bg-white shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="p-4">Membro / E-mail</th>
                <th className="p-4">Nº Membro</th>
                <th className="p-4">Liderança</th>
                <th className="p-4">Cadastro</th>
                <th className="p-4">Situação</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">
                      Nenhum membro encontrado na consulta do Supabase.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((p) => {
                  const name = getProfileName(p);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{name}</div>
                        <div className="text-[11px] text-slate-500">{p.email}</div>
                        {p.telefone && <div className="text-[10px] text-slate-400">{p.telefone}</div>}
                      </td>
                      <td className="p-4 font-mono text-slate-700">
                        {p.numero_membro ? (
                          <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                            {p.numero_membro}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Não atribuído</span>
                        )}
                      </td>
                      <td className="p-4">
                        {p.eh_lider ? (
                          <Badge variant="purple">
                            <Award className="h-3 w-3 mr-1" />
                            {p.cargo_lideranca || 'Líder'}
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Membro Geral</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            p.status_cadastro === 'aprovado'
                              ? 'emerald'
                              : p.status_cadastro === 'pendente'
                              ? 'amber'
                              : 'rose'
                          }
                        >
                          {p.status_cadastro.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={p.ativo ? 'emerald' : 'slate'}>{p.ativo ? 'Ativo' : 'Inativo'}</Badge>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => openDetail(p)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 text-amber-600" />
                          <span>Gerenciar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Detail Modal / Fullscreen Mobile Sheet */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-[#002366] px-4 sm:px-6 py-4 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF37] text-[#002366] font-extrabold text-base shadow-xs">
                  {getProfileName(selectedProfile).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">{getProfileName(selectedProfile)}</h3>
                  <p className="text-xs text-blue-200">{selectedProfile.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProfile(null)}
                className="rounded-lg p-2 text-blue-200 hover:bg-blue-900 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Approval Action Banner if Pending */}
              {selectedProfile.status_cadastro === 'pendente' && (
                <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 text-amber-900 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
                    <UserCheck className="h-5 w-5 text-amber-600" />
                    <span>Aguardando Aprovação Pastoral</span>
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    Este usuário solicitou cadastro no app Android do IBNA. Ao aprovar, ele receberá a credencial de membro e acesso liberado.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      onClick={() => handleAprovar(selectedProfile)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-bold text-white shadow-xs min-h-[44px]"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Aprovar Membro
                    </button>
                    <button
                      onClick={() => handleReprovar(selectedProfile)}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700 hover:bg-rose-100 min-h-[44px]"
                    >
                      <XCircle className="h-4 w-4" /> Reprovar
                    </button>
                  </div>
                </div>
              )}

              {/* Editable Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Número de Membro</label>
                  <input
                    type="text"
                    value={editNumeroMembro}
                    onChange={(e) => setEditNumeroMembro(e.target.value)}
                    placeholder="Ex: IBNA-0145"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs focus:border-amber-500 font-mono min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Membro Desde (Data)</label>
                  <input
                    type="date"
                    value={editMembroDesde}
                    onChange={(e) => setEditMembroDesde(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs focus:border-amber-500 min-h-[44px]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Cargo / Função de Liderança</label>
                  <input
                    type="text"
                    value={editCargoLideranca}
                    onChange={(e) => setEditCargoLideranca(e.target.value)}
                    placeholder="Ex: Diácono, Líder de Louvor, Professor EBD"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs focus:border-amber-500 min-h-[44px]"
                  />
                </div>

                <div className="space-y-3 sm:col-span-2 pt-1">
                  <label className="flex items-center gap-3 cursor-pointer font-semibold text-slate-700 p-2 rounded-lg hover:bg-slate-50 border border-slate-200">
                    <input
                      type="checkbox"
                      checked={editEhLider}
                      onChange={(e) => setEditEhLider(e.target.checked)}
                      className="h-4 w-4 rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span>Atribuir Função de Liderança IBNA</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer font-semibold text-slate-700 p-2 rounded-lg hover:bg-slate-50 border border-slate-200">
                    <input
                      type="checkbox"
                      checked={editAtivo}
                      onChange={(e) => setEditAtivo(e.target.checked)}
                      className="h-4 w-4 rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span>Perfil Ativo no Sistema</span>
                  </label>
                </div>
              </div>

              {/* Readonly Details */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>Telefone:</span>
                  <span className="font-semibold text-slate-800">{selectedProfile.telefone || 'Não informado'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Data de Nascimento:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedProfile.data_nascimento || 'Não informada'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cadastro Criado em:</span>
                  <span className="font-semibold text-slate-800">
                    {formatDateFortaleza(selectedProfile.criado_em || selectedProfile.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-end gap-2 shrink-0">
              <button
                onClick={() => setSelectedProfile(null)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 min-h-[44px]"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdits}
                className="rounded-xl bg-[#002366] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#001848] shadow-xs min-h-[44px]"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.action}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
