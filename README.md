# InstaChat

Automação oficial para Instagram e inteligência de audiência: comentário exato em um Reel → resposta pública → resposta privada com link rastreável, além de temas, oportunidades e ideias de conteúdo extraídos dos comentários.

## Stack

- Next.js 16, React 19, TypeScript e Tailwind CSS 4
- Supabase Postgres, Auth, RLS, Queues (`pgmq`) e Cron
- Instagram API with Instagram Login
- OpenAI Responses API com Structured Outputs (opcional; mock por padrão)
- Vitest, Playwright e Sentry opcional

## Rodar agora, sem credenciais

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

O arquivo de exemplo define `DEMO_MODE=true`. Abra `http://localhost:3000`: o painel usa fixtures em memória e nunca chama a Meta. Sem configuração explícita, a aplicação adota o padrão seguro `DEMO_MODE=false`.

O menu **Radar** inclui comentários, temas, oportunidades, evidências e um Estúdio de ideias completamente simulado. Criar uma automação pelo Radar produz somente um rascunho; publicação, envio e ativação continuam manuais.

O menu **Guia de conexão** conduz da conversão para conta profissional ao teste ponta a ponta, mostra as URLs exatas deste deploy e separa os caminhos Standard Access (uso próprio/template) e Advanced Access (SaaS). O progresso é salvo somente no navegador, sem credenciais.

## Rodar com Supabase local

Docker precisa estar ativo.

```bash
pnpm db:start
pnpm db:reset
pnpm db:types
```

Copie a URL, chave publicável e chave secreta mostradas pela CLI para `.env.local`, crie o `OWNER_EMAIL` no Studio local e altere `DEMO_MODE=false`. O schema é totalmente reproduzido pelas migrations.

## Verificações

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

## Segurança operacional

- Nunca coloque `SUPABASE_SECRET_KEY`, `META_APP_SECRET`, `TOKEN_ENCRYPTION_KEY` ou `WORKER_SECRET` em variáveis `NEXT_PUBLIC_*`.
- `OPENAI_API_KEY` também é exclusivamente server-side. Usernames e IDs externos são substituídos por aliases temporários antes de qualquer chamada à OpenAI.
- Gere `TOKEN_ENCRYPTION_KEY` com `openssl rand -base64 32` e `WORKER_SECRET` com pelo menos 32 bytes aleatórios.
- O token Meta é cifrado com AES-256-GCM antes de chegar ao banco.
- O webhook verifica `X-Hub-Signature-256` no corpo bruto antes do JSON parse.
- Links guardam apenas SHA-256 do token opaco; IPs não são armazenados.

Veja [publicação](docs/deployment.md), [configuração da Meta](docs/meta-setup.md), [runbook](docs/runbook.md), [decisões arquiteturais](docs/architecture/README.md) e [threat model](instachat-threat-model.md).

## Radar em produção

Configure `OPENAI_API_KEY`, `OPENAI_AUDIENCE_MODEL`, `AI_MAX_COMMENTS_PER_RUN` e `AI_MAX_DAILY_RUNS`. Programe o Supabase Cron para fazer `POST /api/internal/jobs/analyze` diariamente com `Authorization: Bearer $WORKER_SECRET`; o job sincroniza comentários/Insights, enfileira conjuntos novos e consome até duas análises. O webhook somente persiste e enfileira: nunca chama IA durante a entrega da Meta.
