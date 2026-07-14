# Deploy na Coolify

## Serviços

Crie dois recursos na Coolify:

1. PostgreSQL
2. Aplicação Next.js apontando para este repositório

## Variáveis da aplicação

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
AUTH_SECRET="gere-um-segredo-grande"
AUTH_URL="https://seu-dominio.com"
NEXT_PUBLIC_SITE_URL="https://seu-dominio.com"
ADMIN_PASSWORD="senha-do-painel"
MELHOR_ENVIO_TOKEN="token-do-melhor-envio"
MELHOR_ENVIO_BASE_URL="https://www.melhorenvio.com.br"
MELHOR_ENVIO_ORIGIN_POSTAL_CODE="11700007"
MELHOR_ENVIO_CORREIOS_SERVICES="1,2"
MELHOR_ENVIO_USER_AGENT="ZION AROMAS (zionaromasp@gmail.com)"
```

## Build

```bash
npm install
npm run build
```

## Banco

Depois que o PostgreSQL estiver criado e `DATABASE_URL` configurada:

```bash
npm run prisma:deploy
npm run seed
```

## Admin

O painel fica em `/admin`, não aparece em menus públicos e exige apenas a senha definida em `ADMIN_PASSWORD`.
