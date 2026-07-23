# Deploy na Coolify

## Recursos

Crie dois recursos na Coolify:

1. PostgreSQL
2. Aplicacao Docker apontando para este repositorio

## Configuracao da aplicacao

- Build Pack: `Dockerfile`
- Porta interna: `3000`
- Healthcheck path: `/`
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

## Variaveis do Melhor Envio

```env
MELHOR_ENVIO_TOKEN="token-do-melhor-envio"
MELHOR_ENVIO_BASE_URL="https://www.melhorenvio.com.br"
MELHOR_ENVIO_USER_AGENT="ZION AROMAS (zionaromasp@gmail.com)"
```

CEP de origem, PAC/SEDEX, retirada na loja, dimensões padrão e frete grátis são configurados no painel `/admin/configuracoes`.

## Banco de dados

Depois que o PostgreSQL estiver criado e `DATABASE_URL` estiver configurada, execute na Coolify:

```bash
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

Use o seed apenas na primeira instalacao, ou quando quiser recriar os dados iniciais.

## Uploads

Para preservar imagens enviadas pelo painel depois de redeploys, crie um volume persistente:

```txt
/app/public/uploads
```

## Admin

O painel fica em `/admin`, nao aparece nos menus publicos e exige a senha definida em `ADMIN_PASSWORD`.
