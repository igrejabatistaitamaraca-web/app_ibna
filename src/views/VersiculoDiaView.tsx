import React, { useState } from 'react';
import { BibliaVersiculo } from '../types/supabase';
import { Badge } from '../components/ui/Badge';
import { BookMarked, Search, Send, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';

interface VersiculoDiaViewProps {
  versiculos: BibliaVersiculo[];
  onCreateVersiculoNotification: (versiculo: BibliaVersiculo) => Promise<void>;
  loading: boolean;
}

export const VersiculoDiaView: React.FC<VersiculoDiaViewProps> = ({
  versiculos,
  onCreateVersiculoNotification,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<string>('todos');
  const [notifiedId, setNotifiedId] = useState<string | null>(null);

  // Calculated Versículo do Dia (Deterministic calculation based on day of year)
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  const totalVerses = versiculos.length > 0 ? versiculos.length : 1;
  const todayIndex = dayOfYear % totalVerses;
  const tomorrowIndex = (dayOfYear + 1) % totalVerses;

  const todayVersiculo = versiculos[todayIndex] || {
    id: 'bv1',
    livro: 'João',
    livro_abrev: 'Jo',
    capitulo: 3,
    versiculo: 16,
    texto: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
    testamento: 'NT',
  };

  const tomorrowVersiculo = versiculos[tomorrowIndex] || todayVersiculo;

  // Extract unique books
  const uniqueBooks = Array.from(new Set(versiculos.map((v) => v.livro)));

  const filteredVerses = versiculos.filter((v) => {
    const matchesSearch =
      v.texto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.livro.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${v.capitulo}:${v.versiculo}`.includes(searchTerm);

    const matchesBook = selectedBook === 'todos' ? true : v.livro === selectedBook;

    return matchesSearch && matchesBook;
  });

  const handlePublishVerseNotification = async (v: BibliaVersiculo) => {
    await onCreateVersiculoNotification(v);
    setNotifiedId(v.id);
    setTimeout(() => setNotifiedId(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Versículo do Dia & Busca Bíblica</h2>
        <p className="text-xs text-slate-500">
          Acompanhe o cálculo do versículo diário e publique notificações bíblicas manuais quando necessário.
        </p>
      </div>

      {/* Control Panel: Today & Tomorrow calculated Verses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Calculated Verse */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
              <Sparkles className="h-3.5 w-3.5" />
              Versículo Calculado para HOJE ({today.toLocaleDateString('pt-BR')})
            </span>
            <Badge variant="purple">{todayVersiculo.testamento}</Badge>
          </div>

          <blockquote className="font-serif italic text-base leading-relaxed text-amber-100">
            "{todayVersiculo.texto}"
          </blockquote>

          <div className="flex items-center justify-between border-t border-slate-700/80 pt-3">
            <span className="font-bold text-amber-400 text-sm">
              {todayVersiculo.livro} {todayVersiculo.capitulo}:{todayVersiculo.versiculo}
            </span>

            <button
              onClick={() => handlePublishVerseNotification(todayVersiculo)}
              disabled={notifiedId === todayVersiculo.id}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-md transition-all cursor-pointer"
            >
              {notifiedId === todayVersiculo.id ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-slate-950" />
                  <span>Notificação Criada!</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Publicar Notificação Pública</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tomorrow's Verse */}
        <div className="rounded-2xl bg-white p-6 shadow-xs border border-slate-200 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                Próximo Versículo (AMANHÃ)
              </span>
              <Badge variant="slate">{tomorrowVersiculo.testamento}</Badge>
            </div>

            <blockquote className="font-serif italic text-sm text-slate-700 leading-relaxed">
              "{tomorrowVersiculo.texto}"
            </blockquote>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="font-bold text-slate-900 text-sm">
              {tomorrowVersiculo.livro} {tomorrowVersiculo.capitulo}:{tomorrowVersiculo.versiculo}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Auto-agendado no App</span>
          </div>
        </div>
      </div>

      {/* Bible Verses Search & Explorer */}
      <div className="rounded-2xl bg-white p-6 shadow-xs border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-amber-600" />
            <span>Consultar Passagens Bíblicas Registradas (`public.biblia_versiculos`)</span>
          </h3>
        </div>

        {/* Search Inputs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por texto bíblico ou número..."
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs focus:border-amber-500"
            />
          </div>

          <select
            value={selectedBook}
            onChange={(e) => setSelectedBook(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-amber-500"
          >
            <option value="todos">Todos os Livros</option>
            {uniqueBooks.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Verses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVerses.length === 0 ? (
            <div className="col-span-full p-8 text-center text-slate-500 text-xs">
              Nenhum versículo encontrado na busca.
            </div>
          ) : (
            filteredVerses.map((v) => (
              <div
                key={v.id}
                className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2 hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-800 text-xs">
                    {v.livro} {v.capitulo}:{v.versiculo}
                  </span>
                  <Badge variant="purple">{v.testamento}</Badge>
                </div>

                <p className="font-serif text-xs text-slate-800 italic leading-relaxed">"{v.texto}"</p>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handlePublishVerseNotification(v)}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-800 underline flex items-center gap-1"
                  >
                    <Send className="h-3 w-3" /> Gerar Aviso com este Versículo
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
