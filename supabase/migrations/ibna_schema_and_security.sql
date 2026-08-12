-- =====================================================================
-- MIGRATION & SECURITY SCRIPT - PAINEL ADMINISTRATIVO IBNA
-- Projeto Supabase Ref: vnydavylxtbzcapgvyap
-- Igreja Batista Nova Aliança
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. EXTENSÕES & SEGURANÇA BÁSICA
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------
-- 2. TABELA DE PERFIS (public.profiles)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome_completo TEXT,
  telefone TEXT,
  data_nascimento DATE,
  numero_membro TEXT,
  membro_desde DATE,
  cargo_lideranca TEXT,
  eh_lider BOOLEAN DEFAULT false,
  membro_aprovado BOOLEAN DEFAULT false,
  status_cadastro TEXT DEFAULT 'pendente' CHECK (status_cadastro IN ('pendente', 'aprovado', 'reprovado')),
  is_admin BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para atualizar profiles ao criar novo usuário no auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome_completo, status_cadastro, membro_aprovado, is_admin, ativo)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    'pendente',
    false,
    false,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------
-- 3. FUNÇÃO DE VERIFICAÇÃO DE ADMINISTRADOR (PUBLIC.IS_ADMIN)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND is_admin = true
      AND ativo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ---------------------------------------------------------------------
-- 4. TABELAS DE CONTEÚDO E NOTIFICAÇÕES
-- ---------------------------------------------------------------------

-- Notificações / Avisos
CREATE TABLE IF NOT EXISTS public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  categoria TEXT DEFAULT 'geral',
  destino TEXT,
  audiencias TEXT[] DEFAULT ARRAY['todos']::TEXT[],
  data_agendamento TIMESTAMPTZ DEFAULT NOW(),
  data_expiracao TIMESTAMPTZ,
  notificar BOOLEAN DEFAULT true,
  ativo BOOLEAN DEFAULT true,
  criado_por UUID REFERENCES public.profiles(id),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Fila de Envio Push (push_dispatch_queue)
CREATE TABLE IF NOT EXISTS public.push_dispatch_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notificacao_id UUID REFERENCES public.notificacoes(id) ON DELETE CASCADE,
  topico TEXT DEFAULT 'ibna_todos',
  audiencia TEXT DEFAULT 'todos',
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'processando', 'enviado', 'erro', 'cancelado')),
  tentativas INTEGER DEFAULT 0,
  ultimo_erro TEXT,
  processado_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para enfileirar notificação na push_dispatch_queue quando notificacao for salva com notificar = true
CREATE OR REPLACE FUNCTION public.trg_enqueue_push_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.notificar = true AND NEW.ativo = true) THEN
    INSERT INTO public.push_dispatch_queue (notificacao_id, topico, audiencia, status)
    VALUES (
      NEW.id,
      CASE WHEN 'todos' = ANY(NEW.audiencias) THEN 'ibna_todos' ELSE 'ibna_membros' END,
      ARRAY_TO_STRING(NEW.audiencias, ','),
      'pendente'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_notificacao_created ON public.notificacoes;
CREATE TRIGGER on_notificacao_created
  AFTER INSERT OR UPDATE OF notificar, ativo ON public.notificacoes
  FOR EACH ROW EXECUTE FUNCTION public.trg_enqueue_push_notification();

-- Dicas de Louvor
CREATE TABLE IF NOT EXISTS public.dicas_louvor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  artista_autor TEXT,
  tom TEXT,
  descricao TEXT,
  link_audio_video TEXT,
  cifra_letra TEXT,
  audiencias TEXT[] DEFAULT ARRAY['todos']::TEXT[],
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Estudos Bíblicos
CREATE TABLE IF NOT EXISTS public.estudos_biblicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  subtitulo TEXT,
  autor TEXT,
  categoria TEXT,
  conteudo TEXT,
  pdf_url TEXT,
  imagem_url TEXT,
  audiencias TEXT[] DEFAULT ARRAY['todos']::TEXT[],
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Mensagens Bíblicas
CREATE TABLE IF NOT EXISTS public.mensagens_biblicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  pregador TEXT,
  texto_chave TEXT,
  resumo TEXT,
  video_url TEXT,
  audio_url TEXT,
  data_pregada DATE,
  audiencias TEXT[] DEFAULT ARRAY['todos']::TEXT[],
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Momentos (Álbuns/Eventos de fotos)
CREATE TABLE IF NOT EXISTS public.momentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  capa_url TEXT,
  data_evento DATE,
  audiencias TEXT[] DEFAULT ARRAY['todos']::TEXT[],
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Fotos dos Momentos
CREATE TABLE IF NOT EXISTS public.momento_fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  momento_id UUID NOT NULL REFERENCES public.momentos(id) ON DELETE CASCADE,
  foto_url TEXT NOT NULL,
  legenda TEXT,
  ordem INTEGER DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Calendário de Eventos
CREATE TABLE IF NOT EXISTS public.calendario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  local TEXT,
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ,
  categoria TEXT DEFAULT 'Geral',
  audiencias TEXT[] DEFAULT ARRAY['todos']::TEXT[],
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Sobre a Igreja
CREATE TABLE IF NOT EXISTS public.sobre (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  secao TEXT NOT NULL,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  imagem_url TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Versículos da Bíblia
CREATE TABLE IF NOT EXISTS public.biblia_versiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  livro TEXT NOT NULL,
  livro_abrev TEXT,
  capitulo INTEGER NOT NULL,
  versiculo INTEGER NOT NULL,
  texto TEXT NOT NULL,
  testamento TEXT CHECK (testamento IN ('VT', 'NT'))
);

-- ---------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------------------

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_dispatch_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dicas_louvor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estudos_biblicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens_biblicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.momentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.momento_fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sobre ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblia_versiculos ENABLE ROW LEVEL SECURITY;

-- 5.1 PROFILES POLICIES
-- O próprio usuário lê seu próprio perfil
DROP POLICY IF EXISTS "Usuário lê próprio perfil" ON public.profiles;
CREATE POLICY "Usuário lê próprio perfil" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

-- Administrador gerencia todos os perfis
DROP POLICY IF EXISTS "Admin gerencia todos os perfis" ON public.profiles;
CREATE POLICY "Admin gerencia todos os perfis" ON public.profiles
  FOR ALL USING (public.is_admin());

-- 5.2 PUSH DISPATCH QUEUE
-- Apenas Administradores podem ler/gerenciar a fila de envio de push
DROP POLICY IF EXISTS "Admin gerencia push queue" ON public.push_dispatch_queue;
CREATE POLICY "Admin gerencia push queue" ON public.push_dispatch_queue
  FOR ALL USING (public.is_admin());

-- 5.3 CONTEÚDOS: NOTIFICAÇÕES, LOUVOR, ESTUDOS, MENSAGENS, MOMENTOS, CALENDÁRIO, SOBRE
-- Regra pública: Leitura permitida para ativo=true e 'todos' = ANY(audiencias)
-- Regra admin: Total acesso para public.is_admin()

-- Function auxiliar para leitura publica/membros
CREATE OR REPLACE FUNCTION public.pode_ler_conteudo(p_ativo BOOLEAN, p_audiencias TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  IF public.is_admin() THEN
    RETURN true;
  END IF;
  
  IF p_ativo IS NOT TRUE THEN
    RETURN false;
  END IF;

  -- Leitura pública para app sem login
  IF 'todos' = ANY(p_audiencias) THEN
    RETURN true;
  END IF;

  -- Leitura para membros logados e aprovados
  IF auth.uid() IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND membro_aprovado = true AND ativo = true
    ) THEN
      IF 'membros' = ANY(p_audiencias) THEN
        RETURN true;
      END IF;
      IF 'lideranca' = ANY(p_audiencias) AND EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND eh_lider = true
      ) THEN
        RETURN true;
      END IF;
    END IF;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Políticas para Notificações
DROP POLICY IF EXISTS "Leitura notificacoes" ON public.notificacoes;
CREATE POLICY "Leitura notificacoes" ON public.notificacoes FOR SELECT USING (public.pode_ler_conteudo(ativo, audiencias));
DROP POLICY IF EXISTS "Admin gerencia notificacoes" ON public.notificacoes;
CREATE POLICY "Admin gerencia notificacoes" ON public.notificacoes FOR ALL USING (public.is_admin());

-- Políticas para Dicas de Louvor
DROP POLICY IF EXISTS "Leitura dicas_louvor" ON public.dicas_louvor;
CREATE POLICY "Leitura dicas_louvor" ON public.dicas_louvor FOR SELECT USING (public.pode_ler_conteudo(ativo, audiencias));
DROP POLICY IF EXISTS "Admin gerencia dicas_louvor" ON public.dicas_louvor;
CREATE POLICY "Admin gerencia dicas_louvor" ON public.dicas_louvor FOR ALL USING (public.is_admin());

-- Políticas para Estudos Bíblicos
DROP POLICY IF EXISTS "Leitura estudos_biblicos" ON public.estudos_biblicos;
CREATE POLICY "Leitura estudos_biblicos" ON public.estudos_biblicos FOR SELECT USING (public.pode_ler_conteudo(ativo, audiencias));
DROP POLICY IF EXISTS "Admin gerencia estudos_biblicos" ON public.estudos_biblicos;
CREATE POLICY "Admin gerencia estudos_biblicos" ON public.estudos_biblicos FOR ALL USING (public.is_admin());

-- Políticas para Mensagens Bíblicas
DROP POLICY IF EXISTS "Leitura mensagens_biblicas" ON public.mensagens_biblicas;
CREATE POLICY "Leitura mensagens_biblicas" ON public.mensagens_biblicas FOR SELECT USING (public.pode_ler_conteudo(ativo, audiencias));
DROP POLICY IF EXISTS "Admin gerencia mensagens_biblicas" ON public.mensagens_biblicas;
CREATE POLICY "Admin gerencia mensagens_biblicas" ON public.mensagens_biblicas FOR ALL USING (public.is_admin());

-- Políticas para Momentos
DROP POLICY IF EXISTS "Leitura momentos" ON public.momentos;
CREATE POLICY "Leitura momentos" ON public.momentos FOR SELECT USING (public.pode_ler_conteudo(ativo, audiencias));
DROP POLICY IF EXISTS "Admin gerencia momentos" ON public.momentos;
CREATE POLICY "Admin gerencia momentos" ON public.momentos FOR ALL USING (public.is_admin());

-- Políticas para Fotos de Momentos (herda audiência e status do momento pai)
DROP POLICY IF EXISTS "Leitura momento_fotos" ON public.momento_fotos;
CREATE POLICY "Leitura momento_fotos" ON public.momento_fotos FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.momentos m
    WHERE m.id = momento_fotos.momento_id
      AND public.pode_ler_conteudo(m.ativo, m.audiencias)
  )
);
DROP POLICY IF EXISTS "Admin gerencia momento_fotos" ON public.momento_fotos;
CREATE POLICY "Admin gerencia momento_fotos" ON public.momento_fotos FOR ALL USING (public.is_admin());

-- Políticas para Calendário
DROP POLICY IF EXISTS "Leitura calendario" ON public.calendario;
CREATE POLICY "Leitura calendario" ON public.calendario FOR SELECT USING (public.pode_ler_conteudo(ativo, audiencias));
DROP POLICY IF EXISTS "Admin gerencia calendario" ON public.calendario;
CREATE POLICY "Admin gerencia calendario" ON public.calendario FOR ALL USING (public.is_admin());

-- Políticas para Sobre
DROP POLICY IF EXISTS "Leitura sobre" ON public.sobre;
CREATE POLICY "Leitura sobre" ON public.sobre FOR SELECT USING (ativo = true OR public.is_admin());
DROP POLICY IF EXISTS "Admin gerencia sobre" ON public.sobre;
CREATE POLICY "Admin gerencia sobre" ON public.sobre FOR ALL USING (public.is_admin());

-- Políticas para Bíblia Versículos
DROP POLICY IF EXISTS "Leitura publica versiculos" ON public.biblia_versiculos;
CREATE POLICY "Leitura publica versiculos" ON public.biblia_versiculos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin gerencia versiculos" ON public.biblia_versiculos;
CREATE POLICY "Admin gerencia versiculos" ON public.biblia_versiculos FOR ALL USING (public.is_admin());

-- ---------------------------------------------------------------------
-- 6. RPCS ADMINISTRATIVAS SEGURAS (MEMBROS & APROVAÇÕES)
-- ---------------------------------------------------------------------

-- Aprovar Membro
CREATE OR REPLACE FUNCTION public.aprovar_membro(
  p_profile_id UUID,
  p_numero_membro TEXT DEFAULT NULL,
  p_membro_desde DATE DEFAULT NULL
)
RETURNS JSONB AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso negado: Somente administradores do IBNA podem aprovar membros.';
  END IF;

  UPDATE public.profiles
  SET
    membro_aprovado = true,
    status_cadastro = 'aprovado',
    numero_membro = COALESCE(p_numero_membro, numero_membro),
    membro_desde = COALESCE(p_membro_desde, membro_desde, CURRENT_DATE),
    atualizado_em = NOW()
  WHERE id = p_profile_id;

  RETURN jsonb_build_object('success', true, 'message', 'Membro aprovado com sucesso.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Reprovar Membro
CREATE OR REPLACE FUNCTION public.reprovar_membro(p_profile_id UUID)
RETURNS JSONB AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso negado: Somente administradores do IBNA podem reprovar membros.';
  END IF;

  UPDATE public.profiles
  SET
    membro_aprovado = false,
    status_cadastro = 'reprovado',
    atualizado_em = NOW()
  WHERE id = p_profile_id;

  RETURN jsonb_build_object('success', true, 'message', 'Cadastro reprovado.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Atualizar Perfil de Membro pelo Admin
CREATE OR REPLACE FUNCTION public.atualizar_membro_admin(
  p_profile_id UUID,
  p_ativo BOOLEAN,
  p_eh_lider BOOLEAN,
  p_cargo_lideranca TEXT,
  p_numero_membro TEXT,
  p_membro_desde DATE
)
RETURNS JSONB AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso negado: Ação restrita a administradores do IBNA.';
  END IF;

  UPDATE public.profiles
  SET
    ativo = p_ativo,
    eh_lider = p_eh_lider,
    cargo_lideranca = p_cargo_lideranca,
    numero_membro = p_numero_membro,
    membro_desde = p_membro_desde,
    atualizado_em = NOW()
  WHERE id = p_profile_id;

  RETURN jsonb_build_object('success', true, 'message', 'Perfil atualizado com sucesso.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ---------------------------------------------------------------------
-- 7. ÍNDICES DE DESEMPENHO
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status_cadastro, membro_aprovado, ativo);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_notificacoes_ativo ON public.notificacoes(ativo, data_agendamento);
CREATE INDEX IF NOT EXISTS idx_push_queue_status ON public.push_dispatch_queue(status, criado_em);
CREATE INDEX IF NOT EXISTS idx_dicas_louvor_ativo ON public.dicas_louvor(ativo, ordem);
CREATE INDEX IF NOT EXISTS idx_estudos_ativo ON public.estudos_biblicos(ativo, criado_em);
CREATE INDEX IF NOT EXISTS idx_mensagens_ativo ON public.mensagens_biblicas(ativo, data_pregada);
CREATE INDEX IF NOT EXISTS idx_momentos_ativo ON public.momentos(ativo, data_evento);
CREATE INDEX IF NOT EXISTS idx_calendario_ativo ON public.calendario(ativo, data_inicio);
CREATE INDEX IF NOT EXISTS idx_biblia_busca ON public.biblia_versiculos(livro, capitulo, versiculo);

-- ---------------------------------------------------------------------
-- 8. INSTRUÇÕES PARA PRIMEIRO ADMINISTRADOR
-- ---------------------------------------------------------------------
/*
Para promover o primeiro usuário a administrador do IBNA:
1. Cadastre o usuário via tela de login/registro ou Supabase Auth Dashboard.
2. Execute o SQL abaixo no SQL Editor do Supabase substituindo o e-mail:

   UPDATE public.profiles
   SET is_admin = true, membro_aprovado = true, status_cadastro = 'aprovado', ativo = true
   WHERE email = 'seu-email-admin@ibna.org';
*/
