import React, { useState } from 'react';
import { uploadFileToBucket } from '../../lib/supabase';
import { Upload, Image as ImageIcon, FileText, Link as LinkIcon, Loader2, Check } from 'lucide-react';

interface StorageUploaderProps {
  label: string;
  bucketName?: string;
  folderPath?: string;
  value: string | null;
  onChange: (url: string) => void;
  accept?: string;
  placeholderUrl?: string;
}

export const StorageUploader: React.FC<StorageUploaderProps> = ({
  label,
  bucketName = 'ibna-media',
  folderPath = 'uploads',
  value,
  onChange,
  accept = 'image/*',
  placeholderUrl = 'https://...',
}) => {
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg(null);

    const result = await uploadFileToBucket(bucketName, folderPath, file);
    setUploading(false);

    if (result.url) {
      onChange(result.url);
    } else if (result.error) {
      setErrorMsg(result.error);
    }
  };

  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex items-center justify-between">
        <label className="font-semibold text-slate-700">{label}</label>
        <div className="flex items-center gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`font-medium ${mode === 'upload' ? 'text-amber-600 underline font-bold' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Upload Arquivo
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`font-medium ${mode === 'url' ? 'text-amber-600 underline font-bold' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Cole URL Externa
          </button>
        </div>
      </div>

      {mode === 'upload' ? (
        <div className="relative">
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
            {uploading ? (
              <div className="flex items-center gap-2 text-slate-600">
                <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
                <span className="font-medium">Enviando para Supabase Storage...</span>
              </div>
            ) : value ? (
              <div className="flex items-center gap-3 px-4">
                {value.startsWith('data:image') || value.match(/\.(jpg|jpeg|png|webp|gif)/i) ? (
                  <img src={value} alt="Preview" className="h-14 w-14 object-cover rounded-lg border border-slate-200" />
                ) : (
                  <FileText className="h-8 w-8 text-amber-600" />
                )}
                <div className="text-left overflow-hidden">
                  <div className="flex items-center gap-1 text-emerald-700 font-bold text-xs">
                    <Check className="h-4 w-4" /> Arquivo Anexado
                  </div>
                  <p className="text-[10px] text-slate-500 truncate max-w-xs">{value}</p>
                  <p className="text-[10px] text-amber-600 underline hover:text-amber-700 mt-0.5">Clique para substituir</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center pt-2 pb-3">
                <Upload className="h-6 w-6 text-slate-400 mb-1" />
                <p className="text-xs font-semibold text-slate-700">Clique para selecionar imagem/documento</p>
                <p className="text-[10px] text-slate-500">Ou arraste e solte o arquivo aqui</p>
              </div>
            )}
            <input type="file" accept={accept} onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      ) : (
        <div className="relative flex items-center">
          <LinkIcon className="absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="url"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholderUrl}
            className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>
      )}

      {errorMsg && <p className="text-[11px] text-rose-600 font-medium">{errorMsg}</p>}

      {value && mode === 'url' && (
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px]">
          <ImageIcon className="h-4 w-4 text-amber-600 shrink-0" />
          <span className="text-slate-600 truncate font-mono">{value}</span>
        </div>
      )}
    </div>
  );
};
