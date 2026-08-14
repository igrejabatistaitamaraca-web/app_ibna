import {
  Profile,
  Notificacao,
  PushDispatchItem,
  DicaLouvor,
  EstudoBiblico,
  MensagemBiblica,
  Momento,
  MomentoFoto,
  EventoCalendario,
  SobreIgreja,
  BibliaVersiculo,
} from '../types/supabase';

/**
 * Normalizes raw Supabase records to guarantee consistent object shapes
 * regardless of minor schema column variations (e.g. nome vs nome_completo).
 */

export function normalizeProfile(raw: any): Profile {
  return {
    id: raw.id,
    email: raw.email || '',
    nome: raw.nome || raw.nome_completo || null,
    nome_completo: raw.nome_completo || raw.nome || null,
    telefone: raw.telefone || null,
    foto_url: raw.foto_url || null,
    data_nascimento: raw.data_nascimento || null,
    numero_membro: raw.numero_membro || null,
    membro_desde: raw.membro_desde || raw.data_membro_desde || null,
    data_membro_desde: raw.data_membro_desde || raw.membro_desde || null,
    cargo_lideranca: raw.cargo_lideranca || null,
    ministerio: raw.ministerio || null,
    tipo_vinculo: raw.tipo_vinculo || null,
    eh_lider: Boolean(raw.eh_lider),
    membro_aprovado: Boolean(raw.membro_aprovado),
    status_cadastro: raw.status_cadastro || (raw.membro_aprovado ? 'aprovado' : 'pendente'),
    is_admin: Boolean(raw.is_admin),
    ativo: raw.ativo !== undefined ? Boolean(raw.ativo) : true,
    criado_em: raw.criado_em || raw.created_at || new Date().toISOString(),
    created_at: raw.created_at || raw.criado_em || new Date().toISOString(),
    updated_at: raw.updated_at || raw.atualizado_em || null,
  };
}

export function normalizeNotificacao(raw: any): Notificacao {
  return {
    id: raw.id,
    titulo: raw.titulo || 'Sem Título',
    mensagem: raw.mensagem || '',
    categoria: raw.categoria || 'Geral',
    destino: raw.destino || null,
    versiculo_id: raw.versiculo_id ?? null,
    referencia_biblica: raw.referencia_biblica || null,
    explicacao: raw.explicacao || null,
    audiencias: Array.isArray(raw.audiencias) ? raw.audiencias : ['todos'],
    data_agendamento: raw.data_agendamento || raw.agendado_para || new Date().toISOString(),
    agendado_para: raw.agendado_para || raw.data_agendamento || new Date().toISOString(),
    data_expiracao: raw.data_expiracao || raw.expira_em || null,
    expira_em: raw.expira_em || raw.data_expiracao || null,
    notificar: raw.notificar !== undefined ? Boolean(raw.notificar) : true,
    ativo: raw.ativo !== undefined ? Boolean(raw.ativo) : true,
    criado_por: raw.criado_por || null,
    criado_em: raw.criado_em || raw.created_at || new Date().toISOString(),
    created_at: raw.created_at || raw.criado_em || new Date().toISOString(),
    updated_at: raw.updated_at || raw.atualizado_em || null,
  };
}

export function normalizePushItem(raw: any): PushDispatchItem {
  return {
    id: raw.id,
    notificacao_id: raw.notificacao_id || undefined,
    topico: raw.topico || 'ibna_todos',
    audiencia: raw.audiencia || 'todos',
    executar_em: raw.executar_em || raw.created_at || raw.criado_em || new Date().toISOString(),
    status: raw.status || 'pendente',
    tentativas: raw.tentativas || 0,
    ultimo_erro: raw.ultimo_erro || null,
    processado_em: raw.processado_em || null,
    criado_em: raw.criado_em || raw.created_at || new Date().toISOString(),
    created_at: raw.created_at || raw.criado_em || new Date().toISOString(),
    updated_at: raw.updated_at || raw.atualizado_em || null,
    notificacoes: raw.notificacoes
      ? {
          titulo: raw.notificacoes.titulo || '',
          mensagem: raw.notificacoes.mensagem || '',
        }
      : undefined,
  };
}

export function normalizeDicaLouvor(raw: any): DicaLouvor {
  return {
    id: raw.id,
    titulo: raw.titulo || '',
    artista_autor: raw.artista_autor || null,
    tom: raw.tom || null,
    descricao: raw.descricao || null,
    link_audio_video: raw.link_audio_video || null,
    cifra_letra: raw.cifra_letra || null,
    audiencias: Array.isArray(raw.audiencias) ? raw.audiencias : ['todos'],
    ativo: raw.ativo !== undefined ? Boolean(raw.ativo) : true,
    ordem: raw.ordem || 1,
    criado_em: raw.criado_em || raw.created_at || new Date().toISOString(),
    created_at: raw.created_at || raw.criado_em || new Date().toISOString(),
  };
}

export function normalizeEstudo(raw: any): EstudoBiblico {
  return {
    id: raw.id,
    titulo: raw.titulo || '',
    subtitulo: raw.subtitulo || null,
    autor: raw.autor || null,
    categoria: raw.categoria || null,
    conteudo: raw.conteudo || null,
    pdf_url: raw.pdf_url || null,
    imagem_url: raw.imagem_url || null,
    audiencias: Array.isArray(raw.audiencias) ? raw.audiencias : ['todos'],
    ativo: raw.ativo !== undefined ? Boolean(raw.ativo) : true,
    criado_em: raw.criado_em || raw.created_at || new Date().toISOString(),
    created_at: raw.created_at || raw.criado_em || new Date().toISOString(),
  };
}

export function normalizeMensagem(raw: any): MensagemBiblica {
  return {
    id: raw.id,
    titulo: raw.titulo || '',
    pregador: raw.pregador || null,
    texto_chave: raw.texto_chave || null,
    resumo: raw.resumo || null,
    video_url: raw.video_url || null,
    audio_url: raw.audio_url || null,
    data_pregada: raw.data_pregada || null,
    audiencias: Array.isArray(raw.audiencias) ? raw.audiencias : ['todos'],
    ativo: raw.ativo !== undefined ? Boolean(raw.ativo) : true,
    criado_em: raw.criado_em || raw.created_at || new Date().toISOString(),
    created_at: raw.created_at || raw.criado_em || new Date().toISOString(),
  };
}

export function normalizeMomento(raw: any): Momento {
  return {
    id: raw.id,
    titulo: raw.titulo || '',
    descricao: raw.descricao || null,
    capa_url: raw.capa_url || null,
    data_evento: raw.data_evento || null,
    audiencias: Array.isArray(raw.audiencias) ? raw.audiencias : ['todos'],
    ativo: raw.ativo !== undefined ? Boolean(raw.ativo) : true,
    criado_em: raw.criado_em || raw.created_at || new Date().toISOString(),
    created_at: raw.created_at || raw.criado_em || new Date().toISOString(),
    fotos_count: raw.fotos_count || 0,
  };
}

export function normalizeMomentoFoto(raw: any): MomentoFoto {
  return {
    id: raw.id,
    momento_id: raw.momento_id,
    foto_url: raw.foto_url,
    legenda: raw.legenda || null,
    ordem: raw.ordem || 1,
    criado_em: raw.criado_em || raw.created_at || new Date().toISOString(),
    created_at: raw.created_at || raw.criado_em || new Date().toISOString(),
  };
}

export function normalizeCalendario(raw: any): EventoCalendario {
  return {
    id: raw.id,
    titulo: raw.titulo || '',
    descricao: raw.descricao || null,
    local: raw.local || null,
    data_inicio: raw.data_inicio || new Date().toISOString(),
    data_fim: raw.data_fim || null,
    categoria: raw.categoria || null,
    audiencias: Array.isArray(raw.audiencias) ? raw.audiencias : ['todos'],
    ativo: raw.ativo !== undefined ? Boolean(raw.ativo) : true,
    criado_em: raw.criado_em || raw.created_at || new Date().toISOString(),
    created_at: raw.created_at || raw.criado_em || new Date().toISOString(),
  };
}

export function normalizeSobre(raw: any): SobreIgreja {
  return {
    id: raw.id,
    secao: raw.secao || 'geral',
    titulo: raw.titulo || '',
    conteudo: raw.conteudo || '',
    imagem_url: raw.imagem_url || null,
    ordem: raw.ordem || 1,
    ativo: raw.ativo !== undefined ? Boolean(raw.ativo) : true,
    criado_em: raw.criado_em || raw.created_at || new Date().toISOString(),
    created_at: raw.created_at || raw.criado_em || new Date().toISOString(),
  };
}

export function normalizeVersiculo(raw: any): BibliaVersiculo {
  return {
    id: raw.id,
    livro: raw.livro || '',
    abreviacao: raw.abreviacao || raw.livro_abrev || null,
    livro_abrev: raw.livro_abrev || raw.abreviacao || null,
    capitulo: raw.capitulo || 1,
    versiculo: raw.versiculo || 1,
    texto: raw.texto || '',
    testamento: raw.testamento || 'NT',
    ordem_livro: raw.ordem_livro || undefined,
    ativo: raw.ativo !== undefined ? Boolean(raw.ativo) : true,
    created_at: raw.created_at || undefined,
  };
}

/**
 * Format date nicely in America/Fortaleza timezone
 */
export function formatDateFortaleza(
  dateString?: string | null,
  includeTime: boolean = true
): string {
  if (!dateString) return 'Data não informada';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'America/Fortaleza',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    };

    return new Intl.DateTimeFormat('pt-BR', options).format(d);
  } catch (err) {
    return dateString;
  }
}
