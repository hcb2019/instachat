# Configuração da Meta — etapa dependente do proprietário

O aplicativo inclui uma versão interativa e atualizada deste roteiro em `/connection-guide`, com checklist, URLs copiáveis, ilustrações e diagnóstico de erros. As labels do App Dashboard podem mudar; confirme sempre nos links oficiais indicados no próprio guia.

1. Crie um app do tipo Business no Meta for Developers.
2. Adicione **Instagram API with Instagram Login**.
3. Use uma conta Instagram profissional Business ou Creator administrada por você.
4. Configure o callback OAuth: `https://SEU_DOMINIO/api/meta/oauth/callback`.
5. Solicite somente `instagram_business_basic`, `instagram_business_manage_comments` e `instagram_business_manage_insights`.
6. Configure o callback de webhook: `https://SEU_DOMINIO/api/meta/webhook` e o mesmo `META_WEBHOOK_VERIFY_TOKEN` do ambiente.
7. Assine o campo `comments`. O callback OAuth também chama `/{ig_user_id}/subscribed_apps`.
8. Adicione sua conta como tester/conta administrada pelo app para usar Standard Access.
9. Preencha `META_APP_ID`, `META_APP_SECRET` e a versão estável escolhida em `META_GRAPH_API_VERSION`.
10. Conecte pelo painel e execute “Atualizar dados” no Radar. Uma conexão anterior precisa ser reautorizada para conceder o novo escopo de Insights.

## URLs públicas exigidas

- OAuth: `/api/meta/oauth/callback`
- Webhook: `/api/meta/webhook`
- Desautorização: `/api/meta/deauthorize`
- Exclusão de dados: `/api/meta/data-deletion`
- Política de privacidade: `/privacy`

Prefixe cada caminho com o mesmo `APP_ORIGIN` HTTPS de produção. As rotas de desautorização e exclusão validam o `signed_request` com HMAC-SHA256 antes de remover os dados derivados da conexão.

## Teste controlado

- Crie uma automação para um Reel de teste e palavra exclusiva.
- Comente por uma segunda conta.
- Confirme no histórico: webhook, resposta pública, `message_id` privado e clique.
- Repita com o mesmo usuário: deve aparecer como duplicado, sem nova DM.
- Abra o Radar, importe os comentários dos 20 Reels mais recentes e confirme que toda oportunidade possui comentários originais como evidência.
- Crie um rascunho a partir de uma ideia e confirme que ele permanece inativo até revisão manual.

Antes de abrir para contas de terceiros serão necessários Advanced Access, App Review, política de privacidade e eventual verificação comercial. Para a conta própria adicionada ao app, Standard Access atende o MVP.
