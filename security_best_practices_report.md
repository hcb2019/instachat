# Relatório de segurança — InstaChat MVP

Última revisão: 28/07/2026.

## Resultado

Nenhuma vulnerabilidade conhecida de dependência permanece após a revisão. O workspace fixa versões corrigidas de PostCSS, `fast-uri` e `sharp`; `pnpm audit --audit-level moderate` encerra sem achados.

Não foram encontrados segredos versionados, APIs de execução dinâmica (`eval`, `new Function`), processos filhos ou uso de `dangerouslySetInnerHTML` no código da aplicação. Os nomes de variáveis sensíveis aparecem somente em validação/configuração server-side e na documentação operacional.

A preparação para abertura pública também verificou o histórico Git em busca de chaves OpenAI, tokens GitHub, chaves privadas e JWTs Supabase de alta confiança, sem achados. Arquivos `.env*`, certificados e chaves privadas permanecem ignorados, exceto `.env.example`, que contém somente placeholders.

## Controles verificados

- Sessão Supabase validada no servidor e allowlist do único proprietário.
- RLS por `owner_id`, grants mínimos e funções privilegiadas restritas ao `service_role` na migration.
- CSP com nonce único por requisição, `strict-dynamic`, bloqueio de framing/objetos e HSTS em produção.
- OAuth com `state` de uso único em cookie `HttpOnly`, `SameSite=Lax` e callback server-side.
- Webhook limitado a 256 KB e autenticado por HMAC SHA-256 sobre o corpo bruto antes do parse.
- Token Meta cifrado com AES-256-GCM; tokens de rastreamento aleatórios de 128 bits persistidos somente como SHA-256.
- Filas e constraints de banco para idempotência; timeout posterior a envio termina como ambíguo e não é reenviado automaticamente.
- Segredos nunca usam prefixo `NEXT_PUBLIC_`; modo demo tem padrão de produção desativado.
- Redirecionador aceita somente destino HTTPS capturado no snapshot, não registra IP e não contabiliza `HEAD`.
- Sentry é opcional e aplica redaction; payloads integrais e tokens não são enviados.
- O Radar substitui usernames/IDs por aliases efêmeros, usa `store: false`, Structured Outputs e validação Zod; comentários não podem disparar ferramentas ou ações externas.
- Fingerprint, limite diário e teto de comentários controlam repetição e custo. Toda sugestão gera somente rascunho e exige aprovação humana.
- Callbacks públicos de desautorização/exclusão aceitam somente `signed_request` com HMAC-SHA256 válido e removem dados derivados da conexão de forma idempotente.
- A imagem Docker executa como usuário sem privilégios, sem capabilities Linux, com `no-new-privileges` e filesystem somente leitura.
- O repositório público inclui CodeQL, Dependabot, revisão de dependências, CODEOWNERS, relato privado de vulnerabilidade e CI obrigatório para contribuições.

## Riscos residuais e operação

- A chave AES permanece uma variável de ambiente única. Antes de multi-tenancy, adotar KMS e rotação versionada.
- Uma sessão comprometida do proprietário ainda permite alterar regras. Ativar MFA/passkey no Supabase antes de expansão.
- Timeouts da Meta exigem reconciliação manual de runs ambíguos; nunca repetir cegamente.
- Scanners de links podem gerar o primeiro GET. Monitorar user-agents e acrescentar classificação de bots se isso afetar métricas.
- Texto de comentário pode conter PII declarada pelo próprio autor ou tentativa de prompt injection. O piloto deve acompanhar feedback negativo e considerar redação semântica antes de abrir a terceiros.
- O schema/RLS não pôde ser executado localmente nesta máquina porque o daemon Docker estava desligado; a CI e o primeiro ambiente conectado devem executar migration do zero, testes de isolamento e `supabase db lint`.

O modelo de ameaças completo e os caminhos prioritários estão em `instachat-threat-model.md`.
