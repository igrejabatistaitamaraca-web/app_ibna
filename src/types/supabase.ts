export type StatusCadastro = 'pendente' | 'aprovado' | 'reprovado';

export interface Profile {
  id: string;
  email: string;
  nome?: string | null;
  nome_completo?: string | null;
  telefone?: string | null;
  foto_url?: string | null;
  data_nascimento?: string | null;
  numero_membro?: string | null;
  membro_desde?: string | null;
  data_membro_desde?: string | null;
  cargo_lideranca?: string | null;
  ministerio?: string | null;
  tipo_vinculo?: string | null;
  eh_lider?: boolean;
  membro_aprovado: boolean;
  status_cadastro: StatusCadastro;
  is_admin: boolean;
  ativo: boolean;
  criado_em?: string;
  created_at?: string;
  updated_at?: string;
}

export type AudienciaType = 'todos' | 'membros' | 'lideranca';

export interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  categoria: string;
  destino?: string | null;
  versiculo_id?: string | number | null;
  referencia_biblica?: string | null;
  explicacao?: string | null;
  audiencias: AudienciaType[];
  data_agendamento?: string;
  agendado_para?: string;
  data_expiracao?: string | null;
  expira_em?: string | null;
  notificar: boolean;
  ativo: boolean;
  criado_por?: string | null;
  criado_em?: string;
  created_at?: string;
  updated_at?: string;
}

export type PushQueueStatus = 'pendente' | 'processando' | 'enviado' | 'erro' | 'cancelado';

export interface PushDispatchItem {
  id: string;
  notificacao_id?: string;
  topico?: string;
  audiencia?: string;
  executar_em?: string;
  status: PushQueueStatus;
  tentativas: number;
  ultimo_erro?: string | null;
  processado_em?: string | null;
  criado_em?: string;
  created_at?: string;
  updated_at?: string;
  notificacoes?: {
    titulo: string;
    mensagem: string;
  };
}

export interface DicaLouvor {
  id: string;
  titulo: string;
  artista_autor?: string | null;
  tom?: string | null;
  descricao?: string | null;
  link_audio_video?: string | null;
  cifra_letra?: string | null;
  audiencias: AudienciaType[];
  ativo: boolean;
  ordem?: number;
  criado_em?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EstudoBiblico {
  id: string;
  titulo: string;
  subtitulo?: string | null;
  autor?: string | null;
  categoria?: string | null;
  conteudo?: string | null;
  pdf_url?: string | null;
  imagem_url?: string | null;
  audiencias: AudienciaType[];
  ativo: boolean;
  criado_em?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MensagemBiblica {
  id: string;
  titulo: string;
  pregador?: string | null;
  texto_chave?: string | null;
  resumo?: string | null;
  video_url?: string | null;
  audio_url?: string | null;
  data_pregada?: string | null;
  audiencias: AudienciaType[];
  ativo: boolean;
  criado_em?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Momento {
  id: string;
  titulo: string;
  descricao?: string | null;
  capa_url?: string | null;
  data_evento?: string | null;
  audiencias: AudienciaType[];
  ativo: boolean;
  criado_em?: string;
  created_at?: string;
  updated_at?: string;
  fotos_count?: number;
}

export interface MomentoFoto {
  id: string;
  momento_id: string;
  foto_url: string;
  legenda?: string | null;
  ordem?: number;
  criado_em?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EventoCalendario {
  id: string;
  titulo: string;
  descricao?: string | null;
  local?: string | null;
  data_inicio: string;
  data_fim?: string | null;
  categoria?: string | null;
  audiencias: AudienciaType[];
  ativo: boolean;
  criado_em?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SobreIgreja {
  id: string;
  secao: string;
  titulo: string;
  conteudo: string;
  imagem_url?: string | null;
  ordem?: number;
  ativo: boolean;
  criado_em?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BibliaVersiculo {
  id: string | number;
  livro: string;
  abreviacao?: string | null;
  livro_abrev?: string | null;
  capitulo: number;
  versiculo: number;
  texto: string;
  testamento?: string | 'VT' | 'NT';
  ordem_livro?: number;
  ativo?: boolean;
  created_at?: string;
}

export interface DashboardMetrics {
  cadastrosPendentes: number;
  membrosAprovados: number;
  avisosAtivos: number;
  pushPendentesOuErro: number;
  conteudosAtivos: number;
}

export type NavigationTab =
  | 'dashboard'
  | 'membros'
  | 'notificacoes'
  | 'louvor'
  | 'estudos'
  | 'mensagens'
  | 'momentos'
  | 'calendario'
  | 'sobre'
  | 'versiculo'
  | 'configuracoes';
