# Deploy na Coolify

## Recursos

Crie dois recursos na Coolify:

1. PostgreSQL
2. Aplicacao Docker apontando para este repositorio

## Configuracao da aplicacao

- Build Pack: `Dockerfile`
- Porta interna: `3000`
- Healthcheck path: `/api/health`
- Start command: deixe vazio, o Dockerfile ja usa `node server.js`

## Variaveis obrigatorias

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
AUTH_SECRET="gere-um-segredo-grande-e-unico"
AUTH_URL="https://seu-dominio.com"
NEXT_PUBLIC_SITE_URL="https://seu-dominio.com"
ADMIN_PASSWORD="senha-forte-do-painel"
PAYMENT_WEBHOOK_SECRET="segredo-forte-para-webhooks-de-pagamento"
PIX_KEY="chave-pix-da-loja"
PIX_MERCHANT_NAME="ZION AROMAS"
PIX_MERCHANT_CITY="PRAIA GRANDE"
```

Webhook publica para configurar no gateway:

```txt
https://seu-dominio.com/api/webhooks/payment
```

Configure o gateway para enviar o segredo no header `Authorization: Bearer ...` ou `x-zion-webhook-secret`.
O payload pode identificar o pedido por código (`orderCode`/`MerchantOrderId`) ou pela referência da transação (`PaymentId`/`transaction_id`) salva no pedido.

## Variaveis do Melhor Envio

```env
MELHOR_ENVIO_TOKEN="token-do-melhor-envio"
MELHOR_ENVIO_BASE_URL="https://www.melhorenvio.com.br"
MELHOR_ENVIO_USER_AGENT="ZION AROMAS (zionaromasp@gmail.com)"
```

CEP de origem, PAC/SEDEX, retirada na loja, dimensões padrão e frete grátis são configurados no painel `/admin/configuracoes`.

## Conferência pós-publicação

- Acesse `/admin/relatorios` para ver versão, commit e checklist operacional.
- Acesse `/api/health` para conferir saúde do app, banco e configurações principais sem expor segredos.
- Rode `npm run smoke:production -- https://seu-dominio.com` para conferir páginas públicas, headers, sitemap, robots, healthcheck e webhook.

## Banco de dados

Depois que o PostgreSQL estiver criado e `DATABASE_URL` estiver configurada, execute na Coolify:

```bash
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

Use o seed apenas na primeira instalacao, ou quando quiser recriar os dados iniciais.

## Uploads e imagens

As imagens enviadas pelo painel são convertidas automaticamente para `.webp`, salvas no PostgreSQL e servidas por `/api/media/...`.
Por isso, não é necessário criar volume para uploads. O ponto crítico é manter o mesmo PostgreSQL conectado ao app.

Antes de publicar, cadastre um produto pelo painel, envie uma imagem e confirme que ela abre no catálogo e na página do produto.

## Checklist rápido de produção

- Em `/admin/configuracoes`, selecione Cielo ou Getnet e habilite apenas os métodos realmente contratados.
- Configure `PAYMENT_WEBHOOK_SECRET` na Coolify e no gateway.
- Cadastre a webhook pública `https://seu-dominio.com/api/webhooks/payment`.
- Em `/admin/configuracoes`, confira CEP de origem, PAC/SEDEX, retirada e frete grátis.
- Em `/admin/relatorios`, confira se banco, pagamento, frete e contatos estão sinalizados corretamente.
- Depois do deploy, faça uma compra teste real e confira pedido, pagamento e estoque no admin.

## Admin

O painel fica em `/admin`, nao aparece nos menus publicos e exige a senha definida em `ADMIN_PASSWORD`.
