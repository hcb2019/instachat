# Publicação do InstaChat

Este documento descreve a arquitetura recomendada para colocar o InstaChat online sem manter um servidor próprio.

## Arquitetura hospedada

- **GitHub:** código-fonte, histórico de versões e CI.
- **Vercel:** aplicação Next.js, rotas OAuth, webhook da Meta, redirecionador e workers HTTP.
- **Supabase:** PostgreSQL, autenticação, RLS, filas e Cron.
- **Cloudflare:** DNS de `hernandoia.com`.
- **OpenAI:** análises do Radar, quando `OPENAI_API_KEY` estiver configurada.

Um VPS não é necessário para o MVP. Ele só faria sentido futuramente se o volume ou o custo justificarem trocar os serviços gerenciados.

## Ambientes

### Demonstração

Pode ser publicada sem Supabase, Meta ou OpenAI:

```dotenv
DEMO_MODE=true
NEXT_PUBLIC_DEMO_MODE=true
APP_ORIGIN=https://instachat.hernandoia.com
OWNER_EMAIL=seu-email@example.com
```

O painel usa dados simulados e não realiza chamadas externas.

### Produção real

Defina `DEMO_MODE=false` e configure todas as variáveis necessárias de `.env.example` no Vercel. Segredos nunca devem ser incluídos no Git ou em variáveis com prefixo `NEXT_PUBLIC_`.

Ordem recomendada:

1. Criar o projeto remoto no Supabase e aplicar as migrations.
2. Configurar autenticação, URL do site e redirects no Supabase.
3. Gerar `TOKEN_ENCRYPTION_KEY` e `WORKER_SECRET` com valores aleatórios independentes.
4. Configurar as variáveis no Vercel separadamente para Preview e Production.
5. Publicar primeiro um Preview e executar o smoke test.
6. Promover o mesmo build para Production.
7. Adicionar `instachat.hernandoia.com` ao projeto Vercel.
8. Criar no Cloudflare o CNAME fornecido pelo Vercel, inicialmente com proxy desativado (DNS only).
9. Atualizar `APP_ORIGIN`, redirects do Supabase e URLs da Meta para o domínio definitivo.
10. Configurar Cron, webhook e realizar um teste real controlado.

## Custos e limites

Em julho de 2026, o Vercel Hobby é gratuito, porém restrito pelos termos a uso pessoal e não comercial. Ele serve para demonstração e piloto pessoal. Para vender o serviço ou operar para clientes, use Vercel Pro.

O Supabase Free é adequado ao desenvolvimento e piloto, mas projetos gratuitos podem pausar por inatividade. Para disponibilidade de produção e backups, use Supabase Pro.

Consulte sempre os valores e termos atuais antes do lançamento comercial:

- [Preços do Vercel](https://vercel.com/pricing)
- [Limites do Vercel Hobby](https://vercel.com/docs/plans/hobby)
- [Preços do Supabase](https://supabase.com/pricing)

## Domínio

O subdomínio recomendado é `instachat.hernandoia.com`, preservando `app.hernandoia.com` para um possível portal central no futuro. O valor exato do CNAME deve ser copiado da inspeção do domínio no próprio projeto Vercel; não use um valor genérico sem confirmar.

O Vercel emitirá e renovará o certificado TLS automaticamente depois que o DNS for validado.

## Checklist de publicação

```bash
pnpm install --frozen-lockfile
pnpm audit --audit-level=high
pnpm check
pnpm exec playwright install chromium
pnpm test:e2e
```

Depois do deploy, validar:

- `/`, `/dashboard`, `/radar` e `/connection-guide`;
- headers de segurança e ausência de cache em páginas autenticadas;
- logs sem tokens, segredos ou payloads integrais;
- `/api/meta/webhook` com challenge e assinatura válidos;
- worker e análise protegidos pelo `WORKER_SECRET`;
- redirecionamento `/r/{token}` sem armazenamento de IP;
- URLs de privacidade e exclusão de dados cadastradas na Meta.
