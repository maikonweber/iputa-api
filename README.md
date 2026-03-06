# Marketplace Profiles API (MVP)

API REST em NestJS para marketplace de perfis, com autenticação JWT, cadastro de perfil, upload de fotos, busca por cidade e planos.

## Stack

- NestJS
- Drizzle ORM
- PostgreSQL
- JWT
- Multer
- Swagger
- Docker

## Setup rápido

1. Copie `.env.example` para `.env`.
2. Suba infraestrutura:

```bash
docker compose up -d postgres redis
```

3. Instale dependências:

```bash
pnpm install
```

4. Rode a aplicação:

```bash
pnpm start:dev
```

## Scripts úteis

- `pnpm build` - build do projeto
- `pnpm test` - testes unitários
- `pnpm db:generate` - gera migration com Drizzle
- `pnpm db:migrate` - aplica migrations
- `pnpm seed` - popula `cities` e `plans`

## Swagger

Com a API rodando, acesse:

- `http://localhost:3000/docs`

## Endpoints MVP

- Auth: `POST /auth/register`, `POST /auth/login`
- Users: `GET /users/me`, `PATCH /users/me`
- Profiles: `POST /profiles`, `GET /profiles`, `GET /profiles/:id`, `PATCH /profiles/:id`, `DELETE /profiles/:id`
- Photos: `POST /profiles/:id/photos`, `DELETE /photos/:id`
- Cities: `GET /cities`, `GET /cities/:slug`
- Search: `GET /search?city=&gender=&price_min=&price_max=`
- Plans: `GET /plans`
- Subscriptions: `POST /subscriptions`, `GET /subscriptions/me`
