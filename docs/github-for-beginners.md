# GitHub para o mantenedor

Este guia explica o que acontece depois que o InstaChat se torna público.

## O que “público” significa

Qualquer pessoa poderá:

- visualizar e baixar o código;
- criar uma cópia própria com **Fork**;
- abrir uma **Issue**;
- sugerir uma alteração por **Pull Request**;
- usar, modificar e redistribuir o projeto conforme a Licença MIT.

Tornar público não revela automaticamente as variáveis do Vercel, chaves do Supabase ou `.env.local`. Esses dados ficam fora do Git. Porém, qualquer segredo que já tenha sido commitado no histórico continuaria exposto; por isso o repositório deve ser verificado antes da abertura.

## O código pode ser alterado por qualquer pessoa?

Não. Uma pessoa sem permissão não consegue escrever diretamente na sua branch `main`.

O fluxo normal é:

```text
Repositório público → Fork da pessoa → Branch dela → Pull Request → Sua revisão → Merge ou recusa
```

O Pull Request é apenas uma proposta. Enquanto você não aprovar e fizer o merge, seu código principal não muda.

## Conceitos principais

### Issue

É uma conversa organizada sobre erro, dúvida ou ideia. Não altera código.

Você pode:

- responder;
- pedir mais informações;
- adicionar etiquetas;
- fechar sem implementar;
- relacionar a um Pull Request.

### Fork

É uma cópia do repositório na conta de outra pessoa. Mudanças no fork não alteram o seu projeto.

### Branch

É uma linha separada de desenvolvimento. A branch protegida do projeto é `main`.

### Commit

É um registro de alterações com autor, data e mensagem. Ele não entra automaticamente em `main`.

### Pull Request

É um pedido para comparar uma branch com `main`. Nele você vê exatamente:

- arquivos modificados;
- linhas adicionadas e removidas;
- testes automáticos;
- comentários da revisão;
- autor e histórico.

Você pode aprovar, pedir mudanças ou fechar. Use **Squash and merge** para manter um histórico mais simples.

### Actions

São os testes automáticos do GitHub. Este projeto executa lint, auditoria de dependências, TypeScript, testes, build, Playwright e CodeQL.

Uma marca vermelha significa que algo precisa ser corrigido. Evite merge enquanto os testes obrigatórios não estiverem verdes.

### Dependabot

Abre Pull Requests para atualizar dependências. A atualização também precisa passar pelos testes e ser revisada; não ative merge automático sem entender a mudança.

## Processo recomendado para revisar contribuições

1. Leia a descrição e confirme se a mudança faz sentido.
2. Veja a aba **Files changed**.
3. Rejeite qualquer segredo, código ofuscado ou dependência sem justificativa.
4. Confira se migrations novas não apagam dados.
5. Espere os testes ficarem verdes.
6. Teste localmente mudanças importantes.
7. Clique em **Approve** ou **Request changes**.
8. Faça o merge somente quando estiver seguro.

Mesmo depois do merge, a alteração pode ser revertida pelo histórico do Git.

## Quem pode publicar no seu repositório

- Visitantes: leem, abrem issues e Pull Requests.
- Colaboradores com permissão **Write**: podem enviar branches; conceda apenas a pessoas de confiança.
- Mantenedores/Admins: alteram configurações e permissões.
- Você: continua sendo o responsável final pelas decisões.

Revise acessos em **Settings → Collaborators and teams**. Nunca conceda acesso administrativo para “ajudar rapidamente”.

## Configurações recomendadas

- branch `main` protegida;
- pelo menos uma aprovação para Pull Requests de colaboradores;
- teste `verify` obrigatório;
- conversas resolvidas antes do merge;
- force push e exclusão da branch bloqueados;
- alertas do Dependabot e secret scanning ativos;
- relato privado de vulnerabilidades ativo.

## Se algo ruim entrar

1. Não apague o histórico impulsivamente.
2. Se houver segredo, revogue e gere outro imediatamente.
3. Reverta o Pull Request ou commit.
4. Publique uma correção.
5. Se houver vulnerabilidade, use um Security Advisory.

Remover o texto de uma chave do GitHub não torna a chave segura; a rotação é obrigatória.
