import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStoredSupabaseConfig, saveSupabaseConfig, clearCustomSupabaseConfig, DEFAULT_SUPABASE_URL } from '../lib/supabase';
import { Badge } from '../components/ui/Badge';
import { Database, ShieldCheck, Key, FileCode, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';

export const ConfiguracoesView: React.FC = () => {
  const { profile, isConfigured, demoMode } = useAuth();
  const { url: currentUrl, anonKey: currentAnonKey } = getStoredSupabaseConfig();

  const [url, setUrl] = useState(currentUrl || DEFAULT_SUPABASE_URL);
  const [anonKey, setAnonKey] = useState(currentAnonKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(url, anonKey);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Configurações & Conexão Supabase</h2>
        <p className="text-xs text-slate-500">
          Gerencie a chave de API e parâmetros do projeto IBNA no Supabase (`vnydavylxtbzcapgvyap`).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credentials Form */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Database className="h-5 w-5 text-amber-600" />
            <span>Credenciais do Cliente Supabase</span>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">URL do Projeto (VITE_SUPABASE_URL)</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Chave Pública Anon / Publishable (VITE_SUPABASE_ANON_KEY)
              </label>
              <textarea
                rows={3}
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="Cole aqui a chave anon do projeto Supabase"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 focus:border-amber-500"
              />
            </div>

            {savedSuccess && (
              <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Configurações salvas com sucesso! Recarregando conexão...</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-slate-900 py-2.5 font-bold text-white hover:bg-slate-800 shadow-xs"
              >
                Salvar Credenciais
              </button>
              <button
                type="button"
                onClick={clearCustomSupabaseConfig}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Restaurar .env
              </button>
            </div>
          </form>
        </div>

        {/* Security Summary Panel */}
        <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-lg space-y-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
            <ShieldCheck className="h-5 w-5" />
            <span>Garantias de Segurança IBNA</span>
          </div>

          <ul className="space-y-3 text-slate-300 leading-relaxed list-disc pl-4">
            <li>
              <strong>Sem Exposição de Secrets:</strong> O frontend nunca utiliza a <code className="text-amber-300">SUPABASE_SERVICE_ROLE_KEY</code> nem tokens FCM do Firebase.
            </li>
            <li>
              <strong>Validação RLS no Supabase:</strong> Acesso restrito a usuários onde <code className="text-amber-300">is_admin = true</code> e <code className="text-amber-300">ativo = true</code>.
            </li>
            <li>
              <strong>Fila Segura de Envio:</strong> Notificações push são enviadas via gatilhos de banco para a <code className="text-amber-300">push_dispatch_queue</code>.
            </li>
            <li>
              <strong>Fuso Horário:</strong> Registros formatados no fuso <code className="text-amber-300">America/Fortaleza</code>.
            </li>
          </ul>

          <div className="pt-2 border-t border-slate-800">
            <span className="text-[11px] text-slate-400">Usuário Logado:</span>
            <p className="font-bold text-white text-xs">{profile?.email || 'Demo Admin'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
