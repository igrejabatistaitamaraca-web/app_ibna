import React, { useState } from 'react';
import { BellRing, CheckCircle2, Loader2 } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

type ContentType = 'louvor' | 'estudo' | 'mensagem' | 'momento';

interface ContentNotificationButtonProps {
  contentType: ContentType;
  contentId: string;
  contentTitle: string;
  onEnqueue: (contentType: ContentType, contentId: string) => Promise<void>;
}

export const ContentNotificationButton: React.FC<ContentNotificationButtonProps> = ({
  contentType,
  contentId,
  contentTitle,
  onEnqueue,
}) => {
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    setSending(true);
    setError(null);
    try {
      await onEnqueue(contentType, contentId);
      setSent(true);
      setConfirming(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enfileirar a notificação.');
      setConfirming(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => { setError(null); setConfirming(true); }}
        disabled={sending}
        title={sent ? 'Reenviar notificação' : 'Enviar notificação'}
        className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-800 transition hover:bg-amber-100 disabled:opacity-60"
      >
        {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : sent ? <CheckCircle2 className="h-3.5 w-3.5" /> : <BellRing className="h-3.5 w-3.5" />}
        <span>{sent ? 'Reenviar' : 'Notificar'}</span>
      </button>

      {error && <span className="max-w-40 text-[10px] font-medium text-rose-600">{error}</span>}

      <ConfirmModal
        isOpen={confirming}
        title={sent ? 'Reenviar notificação' : 'Enviar notificação'}
        message={`Enviar uma notificação sobre “${contentTitle}” para a audiência selecionada?`}
        confirmLabel={sending ? 'Enviando...' : 'Enviar'}
        isDangerous={false}
        onConfirm={send}
        onCancel={() => !sending && setConfirming(false)}
      />
    </div>
  );
};
