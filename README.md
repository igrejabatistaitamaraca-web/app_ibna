# Painel Web Administrativo IBNA (Igreja Batista Nova Aliança)

Painel de administração web responsivo, de alto desempenho e seguro para gestão de membros, avisos, publicações, áudios, vídeos, estudos bíblicos e eventos do aplicativo mobile Android IBNA.

---

## 🎯 Visão Geral do Sistema

O painel foi construído para os administradores da **Igreja Batista Nova Aliança (IBNA)** gerenciarem todo o ecossistema de dados da igreja. O projeto conversa diretamente com o **Supabase** (`vnydavylxtbzcapgvyap`) e implementa rigorosamente a arquitetura de segurança por permissão no banco de dados (**Row Level Security - RLS** e funções **RPC**).

### Principais Módulos do Painel:
1. **Membros e Cadastros:** Aprovação/reprovação de novos cadastros de membros, edição de cargos de liderança, número de rol de membro e status ativo/inativo.
2. **Notificações Push e Avisos:** Criação de comunicados por audiência (`todos`, `membros`, `lideranca`), enfileiramento automático na `push_dispatch_queue` via gatilhos SQL e monitoramento de falhas de entrega.
3. **Dicas de Louvor:** Gestão do acervo de músicas, tons, cifras, links externos (YouTube/Spotify) e orientações técnicas para os ministérios de louvor.
4. **Estudos Bíblicos e EBD:** Publicação de apostilas, lições da Escola Bíblica e esboços com upload seguro de imagens e PDFs para o Supabase Storage.
5. **Mensagens Bíblicas & Pregações:** Catálogo de sermões em vídeo/áudio, com filtro por pregador, texto chave e audiência.
6. **Momentos & Galeria de Fotos:** Criação de álbuns de eventos (batismos, acampamentos, conferências) com suporte a anexos de fotos por momento.
7. **Calendário & Agenda Geral:** Agendamento de cultos, vigílias e reuniões com local, categoria e horários.
8. **Sobre a Igreja:** Edição da história, visão, declaração de fé e liderança pastoral exibidos no app.
9. **Versículo do Dia & Busca Bíblica:** Visualização do versículo do dia calculado automaticamente pelo dia do ano e disparo manual de notificações bíblicas públicas.

---

## 🛡️ Arquitetura de Segurança Obrigatória

O painel segue **100% das diretrizes de segurança** exigidas para o ecossistema IBNA:
- **Zero Secrets no Frontend:** Nenhuma chave `SUPABASE_SERVICE_ROLE_KEY`, chave privada Firebase ou token FCM reside no navegador.
- **Autenticação via Supabase Auth:** Login seguro por e-mail e senha.
- **Validação Dupla RLS + RPC:** O acesso administrativo é liberado estritamente para usuários autenticados cujos perfis na tabela `public.profiles` possuam:
  - `is_admin = true`
  - `ativo = true`
- **Ações Críticas via RPC (SECURITY DEFINER):** Aprovações e alterações de status de membros utilizam as funções `public.aprovar_membro`, `public.reprovar_membro` e `public.atualizar_membro_admin`, garantindo que apenas administradores ativos realizem as alterações.
- **Push Notification Flow:** O painel apenas grava na tabela `public.notificacoes`. O gatilho SQL `on_notificacao_created` insere automaticamente na fila `public.push_dispatch_queue`. O envio real é executado em background pela agenda do Supabase / Edge Function, sem expor `PUSH_CRON_SECRET`.

---


> **Nota:** Caso o arquivo `.env` não seja configurado, o painel disponibiliza um botão **"Modo Demonstração / Teste Rápido"** na tela de login com dados em memória, e um modal de configuração em tempo de execução para inserir a URL e Anon Key dinamicamente.

---

## 🚀 Como Executar Localmente

```bash
# 1. Instalar as dependências do projeto
npm install

# 2. Iniciar o servidor de desenvolvimento Vite
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`.

---

## 📦 Como Fazer o Build e Deploy

Para gerar o bundle de produção estático otimizado:

```bash
npm run build
```
