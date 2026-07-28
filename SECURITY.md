# Política de segurança

## Versões suportadas

Somente a versão mais recente da branch `main` recebe correções de segurança.

## Como relatar uma vulnerabilidade

Não abra uma issue pública e não publique provas contendo tokens ou dados reais.

Use o recurso privado do GitHub:

1. Abra a aba **Security** do repositório.
2. Entre em **Advisories**.
3. Clique em **Report a vulnerability**.

Link direto: <https://github.com/hcb2019/instachat/security/advisories/new>

Inclua:

- descrição e impacto;
- passos mínimos para reproduzir;
- versão ou commit afetado;
- sugestão de correção, se houver;
- dados fictícios ou devidamente ocultados.

O mantenedor tentará confirmar o recebimento em até 7 dias. Não há programa de recompensa financeira.

## Escopo sensível

- autenticação e autorização do proprietário;
- RLS e funções privilegiadas do Supabase;
- OAuth, tokens e webhooks da Meta;
- redirecionamento de links rastreáveis;
- endpoints internos protegidos por `WORKER_SECRET`;
- exposição de dados pessoais, mensagens ou comentários.

## Responsabilidade de quem instala

Cada instalação possui suas próprias credenciais e dados. O operador é responsável por HTTPS, backups, atualizações, SMTP, políticas de privacidade, termos da Meta e proteção dos segredos. Nunca reutilize as chaves de outra instalação.
