import React, { useState } from 'react';
import { getStoredSupabaseConfig, saveSupabaseConfig, clearCustomSupabaseConfig, DEFAULT_SUPABASE_URL } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Database, Key, ShieldAlert, CheckCircle2, RefreshCw, X, Play } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose }) => {
  const { url: currentUrl, anonKey: currentAnonKey } = getStoredSupabaseConfig();
  const { enableDemoAdmin, demoMode } = useAuth();

  const [url, setUrl] = useState(currentUrl || DEFAULT_SUPABASE_URL);
  const [anonKey, setAnonKey] = useState(currentAnonKey || '');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(url, anonKey);
  };

  const handleClear = () => {
    clearCustomSupabaseConfig();
  };

  const handleStartDemo = () => {
    enableDemoAdmin();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <Database className="h-5 w-5 text-amber-400" />
            <h3 className="font-bold text-base">Configuração do Supabase • IBNA</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          {/* Project Reference Info */}
          <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 text-amber-900 space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <span>Projeto Ref: vnydavylxtbzcapgvyap</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              O painel web administrativo do IBNA conecta-se com o Supabase Auth e RLS sem expor a chave de serviço (Service Role).
            </p>
          </div>

          {/* URL Input */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Supabase Project URL (VITE_SUPABASE_URL)
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono text-xs"
            />
          </div>

          {/* Anon Key Input */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Supabase Publishable / Anon Key (VITE_SUPABASE_ANON_KEY)
            </label>
            <textarea
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              rows={3}
              placeholder="Cole aqui sua anon key do Supabase"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4 text-amber-400" />
              Salvar Conexão Supabase
            </button>

            <button
              type="button"
              onClick={handleStartDemo}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors"
            >
              <Play className="h-4 w-4 text-amber-600" />
              Testar em Modo Demo Admin
            </button>
          </div>

          <div className="flex justify-between items-center pt-2 text-[11px] text-slate-500">
            <span>Status: {demoMode ? 'Modo Demo Ativo' : currentAnonKey ? 'Chave salva localmente' : 'Chave não informada'}</span>
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-500 hover:text-rose-600 underline flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" /> Restaurar Padrões
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
