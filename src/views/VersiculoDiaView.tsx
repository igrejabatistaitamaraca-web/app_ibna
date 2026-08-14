import React, { useEffect, useMemo, useState } from 'react';
import { BookMarked, CheckCircle2, Loader2, Send } from 'lucide-react';
import { BibliaVersiculo } from '../types/supabase';
import { getSupabaseClient } from '../lib/supabase';

interface VersiculoDiaViewProps {
  onCreateVersiculoNotification: (
    passagem: BibliaVersiculo[],
    explicacao: string,
    agendadoPara?: string,
    expiraEm?: string
  ) => Promise<void>;
  loading: boolean;
}

const BIBLE_BOOKS = [
  'Gênesis','Êxodo','Levítico','Números','Deuteronômio','Josué','Juízes','Rute',
  '1 Samuel','2 Samuel','1 Reis','2 Reis','1 Crônicas','2 Crônicas','Esdras','Neemias',
  'Ester','Jó','Salmos','Provérbios','Eclesiastes','Cânticos','Isaías','Jeremias',
  'Lamentações','Ezequiel','Daniel','Oséias','Joel','Amós','Obadias','Jonas','Miquéias',
  'Naum','Habacuque','Sofonias','Ageu','Zacarias','Malaquias','Mateus','Marcos','Lucas',
  'João','Atos','Romanos','1 Coríntios','2 Coríntios','Gálatas','Efésios','Filipenses',
  'Colossenses','1 Tessalonicenses','2 Tessalonicenses','1 Timóteo','2 Timóteo','Tito',
  'Filemom','Hebreus','Tiago','1 Pedro','2 Pedro','1 João','2 João','3 João','Judas','Apocalipse'
];

function toLocalInput(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export const VersiculoDiaView: React.FC<VersiculoDiaViewProps> = ({
  onCreateVersiculoNotification,
  loading,
}) => {
  const [book, setBook] = useState('João');
  const [chapter, setChapter] = useState(3);
  const [chapterCount, setChapterCount] = useState(0);
  const [chapterVerses, setChapterVerses] = useState<BibliaVersiculo[]>([]);
  const [startVerseId, setStartVerseId] = useState('');
  const [endVerseId, setEndVerseId] = useState('');
  const [explanation, setExplanation] = useState('');
  const [scheduledAt, setScheduledAt] = useState(toLocalInput(new Date()));
  const [expiresAt, setExpiresAt] = useState('');
  const [querying, setQuerying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedVerses = useMemo(() => {
    const startIndex = chapterVerses.findIndex((item) => String(item.id) === startVerseId);
    const endIndex = chapterVerses.findIndex((item) => String(item.id) === endVerseId);
    if (startIndex < 0 || endIndex < startIndex) return [];
    return chapterVerses.slice(startIndex, endIndex + 1);
  }, [chapterVerses, startVerseId, endVerseId]);

  useEffect(() => {
    let active = true;
    setQuerying(true);
    setError(null);
    getSupabaseClient()
      .from('biblia_versiculos')
      .select('capitulo')
      .eq('livro', book)
      .order('capitulo', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data, error: queryError }) => {
        if (!active) return;
        if (queryError) throw queryError;
        const total = Number(data?.capitulo || 0);
        setChapterCount(total);
        setChapter((current) => Math.min(Math.max(current, 1), Math.max(total, 1)));
      })
      .catch(() => active && setError(`Não foi possível consultar os capítulos de ${book}.`))
      .finally(() => active && setQuerying(false));
    return () => { active = false; };
  }, [book]);

  useEffect(() => {
    if (!book || !chapter) return;
    let active = true;
    setQuerying(true);
    setError(null);
    getSupabaseClient()
      .from('biblia_versiculos')
      .select('id, livro, abreviacao, capitulo, versiculo, texto, testamento, ordem_livro, ativo')
      .eq('livro', book)
      .eq('capitulo', chapter)
      .order('versiculo', { ascending: true })
      .then(({ data, error: queryError }) => {
        if (!active) return;
        if (queryError) throw queryError;
        const items = (data || []) as BibliaVersiculo[];
        setChapterVerses(items);
        const firstId = items[0] ? String(items[0].id) : '';
        setStartVerseId(firstId);
        setEndVerseId(firstId);
      })
      .catch(() => {
        if (!active) return;
        setChapterVerses([]);
        setStartVerseId('');
        setEndVerseId('');
        setError('Não foi possível carregar os versículos deste capítulo.');
      })
      .finally(() => active && setQuerying(false));
    return () => { active = false; };
  }, [book, chapter]);

  const publish = async () => {
    if (!selectedVerses.length) {
      setError('Escolha um versículo antes de enviar.');
      return;
    }
    const scheduleIso = scheduledAt ? new Date(scheduledAt).toISOString() : new Date().toISOString();
    const expirationIso = expiresAt ? new Date(expiresAt).toISOString() : undefined;
    if (expirationIso && new Date(expirationIso) <= new Date(scheduleIso)) {
      setError('A expiração precisa ser posterior ao horário de publicação.');
      return;
    }
    setSubmitting(true);
    setSuccess(false);
    setError(null);
    try {
      await onCreateVersiculoNotification(selectedVerses, explanation, scheduleIso, expirationIso);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'Não foi possível enviar a Palavra do Dia.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-24">
      <header>
        <h2 className="text-xl font-bold text-slate-900">Palavra do Dia</h2>
        <p className="text-sm text-slate-500">Escolha a passagem, escreva uma reflexão e programe o envio ao aplicativo.</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-2 text-sm font-bold text-slate-900">
          <BookMarked className="h-5 w-5 text-amber-600" /> Escolher passagem bíblica
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1 text-xs font-semibold text-slate-600">Livro
            <select value={book} onChange={(event) => { setBook(event.target.value); setChapter(1); }} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900">
              {BIBLE_BOOKS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-xs font-semibold text-slate-600">Capítulo
            <select value={chapter} onChange={(event) => setChapter(Number(event.target.value))} disabled={!chapterCount} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 disabled:opacity-50">
              {Array.from({ length: chapterCount }, (_, index) => index + 1).map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-xs font-semibold text-slate-600">Versículo inicial
            <select value={startVerseId} onChange={(event) => { const id = event.target.value; setStartVerseId(id); const start = chapterVerses.findIndex((item) => String(item.id) === id); const end = chapterVerses.findIndex((item) => String(item.id) === endVerseId); if (end < start) setEndVerseId(id); }} disabled={!chapterVerses.length} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 disabled:opacity-50">
              {chapterVerses.map((item) => <option key={String(item.id)} value={String(item.id)}>{item.versiculo}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-xs font-semibold text-slate-600">Versículo final
            <select value={endVerseId} onChange={(event) => setEndVerseId(event.target.value)} disabled={!chapterVerses.length} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 disabled:opacity-50">
              {chapterVerses.filter((item) => {
                const start = chapterVerses.findIndex((verse) => String(verse.id) === startVerseId);
                return chapterVerses.indexOf(item) >= Math.max(start, 0);
              }).map((item) => <option key={String(item.id)} value={String(item.id)}>{item.versiculo}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-5 min-h-32 rounded-2xl bg-[#001848] p-5 text-white">
          {querying ? <span className="flex items-center gap-2 text-sm text-slate-300"><Loader2 className="h-4 w-4 animate-spin" /> Consultando Bíblia…</span> : selectedVerses.length ? <>
            <div className="space-y-2 font-serif text-base italic leading-relaxed text-amber-50">{selectedVerses.map((verse) => <p key={String(verse.id)}><strong className="mr-1 text-amber-400">{verse.versiculo}</strong>{verse.texto}</p>)}</div>
            <p className="mt-3 text-right text-sm font-bold text-amber-400">{selectedVerses[0].livro} {selectedVerses[0].capitulo}:{selectedVerses[0].versiculo}{selectedVerses.length > 1 ? `–${selectedVerses[selectedVerses.length - 1].versiculo}` : ''}</p>
          </> : <p className="text-sm text-slate-300">Nenhum versículo encontrado.</p>}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <label className="block space-y-1 text-xs font-semibold text-slate-600">Explicação / reflexão
          <textarea value={explanation} onChange={(event) => setExplanation(event.target.value)} rows={6} maxLength={4000} placeholder="Escreva uma aplicação breve e pastoral para acompanhar o versículo…" className="w-full resize-y rounded-xl border border-slate-300 px-3 py-3 text-sm font-normal text-slate-900" />
          <span className="block text-right text-[11px] font-normal text-slate-400">{explanation.length}/4000</span>
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-xs font-semibold text-slate-600">Publicar em
            <input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm text-slate-900" />
          </label>
          <label className="space-y-1 text-xs font-semibold text-slate-600">Expirar em (opcional)
            <input type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm text-slate-900" />
          </label>
        </div>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
        {success && <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Palavra do Dia enviada com sucesso.</p>}
        <button type="button" onClick={publish} disabled={!selectedVerses.length || submitting || loading} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {submitting ? 'Enviando…' : 'Enviar Palavra do Dia'}
        </button>
      </section>
    </div>
  );
};
