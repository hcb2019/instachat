# Configuração atual da Meta

O guia interativo em `/connection-guide` é a fonte principal para configurar o Instagram. Ele acompanha o fluxo atual de criação do aplicativo e a tela "Configuração da API com login do Instagram".

## Quem faz esta configuração

O administrador que instalou o InstaChat configura a Meta e a Vercel uma vez. Um usuário comum não cria outro aplicativo na Meta. Depois que a instalação estiver pronta, ele apenas entra no InstaChat e clica em "Conectar Instagram".

## Caminho usado pelo InstaChat

- Caso de uso: `Gerenciar mensagens e conteúdo no Instagram`
- Login: `Instagram API with Instagram Login`
- Host: `graph.instagram.com`
- Página do Facebook: não é necessária
- Conta: Instagram Business ou Creator

Não use "Auxiliar de integração de API" nem "Configuração com Facebook Login".

## Permissões solicitadas no OAuth

- `instagram_business_basic`
- `instagram_business_manage_comments`
- `instagram_business_manage_messages`
- `instagram_business_manage_insights`

O InstaChat solicita `instagram_business_manage_messages` por compatibilidade com aplicativos Meta que exigem essa permissão no endpoint usado para a private reply.

## Webhook

- Callback: `https://SEU_DOMINIO/api/meta/webhook`
- Campo necessário: `comments`
- Campos desnecessários: `live_comments`, `messages`, `message_*`, `messaging_*` e `standby`
- Certificado de cliente: desligado

O administrador cria `META_WEBHOOK_VERIFY_TOKEN`, salva o mesmo valor na Vercel e no campo "Verificar token" da Meta. Depois do OAuth, o InstaChat chama `/{ig_user_id}/subscribed_apps?subscribed_fields=comments` automaticamente.

## URLs do login

- OAuth: `https://SEU_DOMINIO/api/meta/oauth/callback`
- Desautorização: `https://SEU_DOMINIO/api/meta/deauthorize`
- Exclusão de dados: `https://SEU_DOMINIO/api/meta/data-deletion`
- Política de privacidade: `https://SEU_DOMINIO/privacy`

## Teste

1. Adicione a conta como Testador do Instagram e aceite o convite.
2. Salve as variáveis na Vercel e faça um novo deploy.
3. Configure o webhook e as URLs do login.
4. Conecte a conta pelo InstaChat.
5. Crie uma automação de teste.
6. Comente em um Reel usando uma segunda conta.
7. Confira a resposta pública, a private reply e o Histórico.

Para liberar contas que não são testadoras, siga o bloco 5 da Meta, conclua a análise do aplicativo e solicite o nível de acesso exigido para as permissões usadas.
