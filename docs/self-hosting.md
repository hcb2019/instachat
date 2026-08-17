# Instalação local e em VPS

Este guia oferece três caminhos. Comece pelo modo demonstração; conecte credenciais reais somente depois que o painel estiver funcionando.

## Escolha seu caminho

| Objetivo | Aplicação | Banco e Auth | Indicado para |
|---|---|---|---|
| Conhecer o projeto | Node.js ou Docker local | Dados simulados | Primeiro teste |
| Uso pessoal com menor manutenção | Vercel ou VPS | Supabase hospedado | Recomendado |
| Infraestrutura totalmente própria | VPS | Supabase self-hosted | Operadores experientes |

O InstaChat é owner-only: cada instalação atende um proprietário e uma conta profissional do Instagram.

## Requisitos

- Git;
- Node.js 24 LTS;
- pnpm 11.9;
- Docker, quando usar Supabase local ou a imagem da aplicação;
- uma conta Instagram Business ou Creator para a integração real.

Confira as versões:

```bash
node --version
pnpm --version
docker --version
git --version
```

## 1. Teste local sem credenciais

```bash
git clone https://github.com/hcb2019/instachat.git
cd instachat
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm config:check
pnpm dev
```

Abra <http://localhost:3000>. O `.env.example` começa com `DEMO_MODE=true`, portanto nenhuma mensagem ou chamada externa será feita.

### Teste local com Docker

```bash
cp .env.example .env.local
docker compose --env-file .env.local up --build
```

Abra <http://localhost:3000>. Para encerrar:

```bash
docker compose down
```

## 2. Instalação local com Supabase real

Inicie a pilha local:

```bash
pnpm db:start
pnpm db:reset
```

A CLI exibirá:

- API URL;
- chave publicável;
- chave secreta;
- endereço do Supabase Studio;
- endereço do servidor local de e-mail.

Preencha `.env.local`:

```dotenv
DEMO_MODE=false
NEXT_PUBLIC_DEMO_MODE=false
APP_ORIGIN=http://localhost:3000
OWNER_EMAIL=seu-email@example.com

NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=valor_exibido_pela_cli
SUPABASE_SECRET_KEY=valor_exibido_pela_cli
OPENAI_API_KEY=sk-...
OPENAI_AUDIENCE_MODEL=gpt-5.6-terra
```

A chave da OpenAI libera a redação completa por IA no Estúdio. Sem ela, o aplicativo usa geração local isolada por briefing e identifica esse modo na tela.

Crie os demais segredos com valores diferentes:

```bash
openssl rand -base64 32
openssl rand -hex 32
openssl rand -hex 32
```

Use o primeiro resultado em `TOKEN_ENCRYPTION_KEY`, o segundo em `WORKER_SECRET` e o terceiro em `META_WEBHOOK_VERIFY_TOKEN`.

Depois:

```bash
pnpm config:check
pnpm dev
```

Crie ou convide o `OWNER_EMAIL` em **Supabase Studio → Authentication → Users**. Os e-mails locais aparecem no servidor de e-mail informado pela CLI.

Para conectar o Instagram, siga [Configuração da Meta](meta-setup.md) ou abra `/connection-guide` dentro do aplicativo.

## 3. VPS com Docker e Supabase hospedado

Esta é a opção recomendada para quem quer usar uma VPS sem administrar o banco.

### Capacidade sugerida

- 1 a 2 vCPU;
- 2 GB de RAM;
- 10 GB de disco;
- Ubuntu LTS atualizado;
- domínio apontado para a VPS;
- portas públicas 80 e 443.

Não exponha diretamente PostgreSQL, Supabase Studio ou a porta 3000 à internet.

### Preparação

```bash
git clone https://github.com/hcb2019/instachat.git
cd instachat
cp .env.example .env.local
chmod 600 .env.local
```

Configure `.env.local` com `DEMO_MODE=false`, seu domínio HTTPS, Supabase, Meta e segredos. Valide antes de subir:

```bash
docker run --rm --env-file .env.local \
  -v "$PWD:/app" -w /app node:24-bookworm-slim \
  node --env-file=.env.local scripts/check-env.mjs
```

Construa e inicie:

```bash
docker compose --env-file .env.local up -d --build
docker compose ps
docker compose logs --tail=100 instachat
```

### HTTPS com Caddy

Instale Caddy no host e use um domínio próprio:

```caddyfile
instachat.seudominio.com {
  reverse_proxy 127.0.0.1:3000
  encode zstd gzip
}
```

No firewall, permita 80/443 e restrinja a porta 3000 ao próprio servidor. Atualize:

- `APP_ORIGIN=https://instachat.seudominio.com`;
- URL do site e redirect no Supabase;
- redirect OAuth e webhook na Meta.

Recrie a aplicação quando mudar `NEXT_PUBLIC_*`:

```bash
docker compose --env-file .env.local up -d --build
```

### Workers agendados

Configure um agendador confiável para enviar `POST` com:

```text
Authorization: Bearer SEU_WORKER_SECRET
```

Endpoints:

- `/api/internal/jobs/process`: fila, confirmações de DM e renovação preventiva do token;
- `/api/internal/jobs/analyze`: sincronização e análise do Radar.
- `/api/internal/jobs/maintenance`: somente manutenção diária do token; aceita
  `WORKER_SECRET` ou um `CRON_SECRET` separado.

Não coloque o segredo diretamente em um repositório, painel público ou comando compartilhado.

## 4. Supabase totalmente self-hosted

É possível, mas não é uma configuração “instalar e esquecer”. Use a [documentação oficial de self-hosting do Supabase](https://supabase.com/docs/guides/self-hosting/docker).

Você será responsável por:

- HTTPS e rede privada entre serviços;
- SMTP real para magic links;
- backups automáticos e testes de restauração;
- atualização das imagens;
- segredos JWT e chaves do Supabase;
- monitoramento, logs e espaço em disco;
- não publicar Studio, PostgreSQL ou serviços internos.

Depois de iniciar o Supabase oficial, aplique as migrations deste projeto usando uma conexão administrativa segura. Não reutilize chaves da demonstração.

## Atualizações

Antes de atualizar:

1. faça backup do banco;
2. leia as mudanças e migrations;
3. teste em outro ambiente;
4. execute:

   ```bash
   git pull --ff-only
   pnpm install --frozen-lockfile
   pnpm check
   ```

5. em Docker:

   ```bash
   docker compose --env-file .env.local up -d --build
   ```

## Checklist de produção

- [ ] `DEMO_MODE=false`.
- [ ] `pnpm config:check` aprovado.
- [ ] HTTPS ativo.
- [ ] `.env.local` fora do Git e com permissão `600`.
- [ ] Banco e painel administrativo não expostos.
- [ ] RLS e migrations aplicadas.
- [ ] `OWNER_EMAIL` correto.
- [ ] Segredos fortes, únicos e guardados em cofre.
- [ ] Redirects do Supabase e Meta usam o domínio definitivo.
- [ ] Webhook assinado e worker protegido.
- [ ] Backups e restauração testados.
- [ ] Atualizações de segurança acompanhadas.
- [ ] Política de privacidade adequada ao operador.

Consulte também o [runbook](runbook.md) e a [política de segurança](../SECURITY.md).
