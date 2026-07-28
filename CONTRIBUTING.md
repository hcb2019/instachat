# Como contribuir

Obrigado por querer melhorar o InstaChat. Você pode sugerir ideias, relatar erros, melhorar a documentação ou enviar código.

## Antes de começar

- Não publique tokens, chaves, e-mails privados, payloads reais da Meta ou dados de usuários.
- Para vulnerabilidades, não abra uma issue pública. Siga o [processo de segurança](SECURITY.md).
- Mudanças que automatizem publicação, envio ou ativação sem aprovação humana precisam ser discutidas antes.
- Integrações com Instagram devem usar a API oficial da Meta e respeitar seus termos.

## Fluxo recomendado

1. Procure uma issue existente.
2. Se a mudança for grande, abra uma discussão ou issue descrevendo a proposta.
3. Faça um **fork** do repositório.
4. Crie uma branch a partir de `main`:

   ```bash
   git checkout -b feat/minha-melhoria
   ```

5. Instale e valide:

   ```bash
   pnpm install --frozen-lockfile
   pnpm check
   pnpm exec playwright install chromium
   pnpm test:e2e
   ```

6. Faça commits pequenos e claros.
7. Envie a branch para seu fork e abra um Pull Request.

## Regras para Pull Requests

- Explique o problema e a solução.
- Inclua testes para comportamentos novos ou corrigidos.
- Atualize a documentação e `.env.example` quando necessário.
- Não altere migrations já publicadas; crie uma nova migration.
- Não inclua dependências sem justificar custo, licença e risco.
- Confirme que nenhum segredo entrou no diff.
- Mudanças de interface devem incluir imagem ou vídeo curto.

O mantenedor revisará o Pull Request. Nada entra em `main` automaticamente: o código só será incorporado depois de revisão e aprovação.

## Padrões do projeto

- TypeScript estrito e validação de entrada com Zod.
- Acesso a dados sempre limitado por `owner_id` e RLS.
- Segredos exclusivamente server-side; nunca use `NEXT_PUBLIC_` para dados confidenciais.
- Logs sem tokens, payloads integrais ou conteúdo privado.
- Interface em português do Brasil e acessível por teclado.
- Datas persistidas em UTC e exibidas em `America/Sao_Paulo`.

## Licença das contribuições

Ao enviar uma contribuição, você concorda que ela seja distribuída sob a [Licença MIT](LICENSE) do projeto.
