# GB - Desafio Fullstack (NodeJS/Nest + React/Vite)

[![Docker](https://img.shields.io/badge/Run-1%20comando-2496ED?logo=docker&logoColor=white)](./docker-compose.yml)
![Node](https://img.shields.io/badge/Node-20.x-339933?logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-10.x-E0234E?logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![Postgres](https://img.shields.io/badge/Postgres-15-4169E1?logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)

Aplicação fullstack para gerenciar **SKUs** com **CRUD**, **busca/paginação** e **fluxo de status** com regras de negócio.
O projeto foi desenhado para que **qualquer pessoa rode com um único comando** via Docker.

---

## 🚀 Como rodar (1 comando)

> Pré-requisitos: **Docker** + **Docker Compose** instalados.

```bash
docker compose up --build
```

- **Web (React/Vite):** [http://localhost:5173](http://localhost:5173)
- **API (Nest):** [http://localhost:3000](http://localhost:3000)
- **Swagger:** [http://localhost:3000/docs](http://localhost:3000/docs)
- **Healthcheck:** [http://localhost:3000/health](http://localhost:3000/health)
- **Postgres:** localhost:5432 (user: `gb` / pass: `gb` / db: `gbsku`)

### Por que é 1 comando?

O container do backend usa um **entrypoint** que:

1. Detecta se há **migrations** e roda `prisma migrate deploy` (senão, `prisma db push`).
2. Executa o **seed** (idempotente).
3. Sobe o servidor Nest.

Assim o avaliador não precisa rodar nada manualmente.

---

## 🧠 Domínio: SKU e Regras de Status

**Campos do SKU**

- `id` (UUID)
- `descricao` (string)
- `descricaoComercial` (string)
- `sku` (string único)
- `status` (enum): `PRE_CADASTRO`, `CADASTRO_COMPLETO`, `ATIVO`, `DESATIVADO`, `CANCELADO`
- `createdAt`, `updatedAt`

**Transições permitidas**

| De → Para                        | Permitido? | Observações     |
| -------------------------------- | ---------- | --------------- |
| PRE_CADASTRO → CADASTRO_COMPLETO | ✅         |                 |
| PRE_CADASTRO → CANCELADO         | ✅         |                 |
| CADASTRO_COMPLETO → PRE_CADASTRO | ✅         |                 |
| CADASTRO_COMPLETO → ATIVO        | ✅         |                 |
| CADASTRO_COMPLETO → CANCELADO    | ✅         |                 |
| ATIVO → DESATIVADO               | ✅         |                 |
| DESATIVADO → ATIVO               | ✅         |                 |
| DESATIVADO → PRE_CADASTRO        | ✅         |                 |
| CANCELADO → _qualquer_           | ❌         | estado terminal |

**Regras de edição**

- É permitido **editar campos** somente em `PRE_CADASTRO` e `CADASTRO_COMPLETO`.
- **Se editar `descricaoComercial` em `CADASTRO_COMPLETO`**, o SKU **volta para `PRE_CADASTRO`** automaticamente.
- Em `ATIVO` e `DESATIVADO`, edição é bloqueada (apenas transições válidas).
- `CANCELADO` é terminal (sem edição/transições).

---

## 🧱 Arquitetura & Stack

```
root
├─ backend  (NestJS + Prisma + Postgres)
│  ├─ src/sku/...        # controller, service, dtos, regras de status
│  ├─ prisma/schema.prisma
│  ├─ prisma/seed.js
│  ├─ prisma/migrations/ # (commitado)
│  ├─ entrypoint.sh      # migrate deploy / db push + seed + start
│  ├─ Dockerfile         # Node 20 (Debian), prisma generate no build
│  └─ README.md
├─ frontend (React + Vite + TS)
│  ├─ src/
│  │  ├─ pages/          # SkuList, SkuDetail
│  │  ├─ components/     # SkuForm, StatusBadge
│  │  └─ api/client.ts   # axios/fetch para API
│  ├─ vite.config.ts
│  └─ Dockerfile
└─ docker-compose.yml    # Postgres 15, API 3000, Web 5173
```

**Decisões**

- **NestJS** pela organização modular, DI e testes.
- **Prisma ORM** pela DX e segurança de tipos.
- **Postgres 15** com volume nomeado (`db_data`) para persistência.
- **React + Vite** pela rapidez de dev e ergonomia.
- **Docker** (Node 20 **bullseye** no backend) para evitar problemas de engine do Prisma.

---

## 🔌 Endpoints REST (principais)

**POST /skus** – cria SKU
Body:

```json
{
  "descricao": "Shampoo X",
  "descricaoComercial": "Shampoo 300ml",
  "sku": "SKU-001"
}
```

**GET /skus** – lista com paginação e busca
Query: `page`, `limit`, `q` (busca por `descricao`, `descricaoComercial` ou `sku` – case-insensitive)

**GET /skus/\:id** – detalha SKU

**PATCH /skus/\:id** – edita campos (respeitando regras por status)

**POST /skus/\:id/transition** – transiciona status
Body:

```json
{ "target": "CADASTRO_COMPLETO" }
```

**DELETE /skus/\:id** – remove SKU

> A documentação navegável está no **Swagger**: [http://localhost:3000/docs](http://localhost:3000/docs)

---

## 🧪 Testes

### Backend (unit + e2e)

- Unitários validam regras de **transição** e **edição bloqueada**.
- E2E cobre **CRUD**, **transições** e **validações** via HTTP.

**Rodar testes (host):**

```bash
cd backend
npm ci
npx prisma generate
npm test
```

**Rodar testes (dentro do container):**

```bash
docker compose exec backend npm test
```

---

## 🌱 Seed

O seed cria alguns SKUs iniciais. Ele roda automaticamente no startup (entrypoint), e pode ser executado manualmente:

```bash
# dentro do container
docker compose exec backend node prisma/seed.js
```

---

## 🧭 Exemplos rápidos (cURL)

Criar:

```bash
curl -s http://localhost:3000/skus \
  -H "Content-Type: application/json" \
  -d '{"descricao":"Shampoo X","descricaoComercial":"Shampoo 300ml","sku":"SKU-001"}' | jq .
```

Listar com busca/paginação:

```bash
curl -s "http://localhost:3000/skus?page=1&limit=10&q=shampoo" | jq .
```

Transicionar:

```bash
ID="<cole_o_id>"
curl -s -X POST http://localhost:3000/skus/$ID/transition \
  -H "Content-Type: application/json" \
  -d '{"target":"CADASTRO_COMPLETO"}' | jq .
```

Editar (e disparar regra de voltar para PRE_CADASTRO):

```bash
curl -s -X PATCH http://localhost:3000/skus/$ID \
  -H "Content-Type: application/json" \
  -d '{"descricaoComercial":"Nova embalagem 300ml"}' | jq .
```

---

## 🛠️ Desenvolvimento local (sem Docker) – opcional

**Backend**

```bash
cd backend
cp .env.example .env   # se existir
# Ajuste DATABASE_URL para seu Postgres local (ex.: postgresql://gb:gb@localhost:5432/gbsku?schema=public)
npm ci
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

**Frontend**

```bash
cd frontend
npm ci
npm run dev
# VITE_API_URL em .env.* deve apontar para http://localhost:3000
```

---

## 🧩 Troubleshooting (erros comuns)

- **FATAL: database files are incompatible with server**
  Você trocou a major do Postgres. Solução dev: `docker compose down -v && docker compose up --build` (reset do volume).

- **Prisma Query Engine / platforms**
  Use `binaryTargets = ["native"]` no `generator client` do `schema.prisma`.

- **“@prisma/client did not initialize yet”**
  Garanta que o **Dockerfile** copia `node_modules` do **builder** (onde roda `prisma generate`) para a imagem final.

- **BuildKit snapshot / parent snapshot not found**
  Limpe o cache:
  `docker buildx prune -af && docker system prune -af` e faça rebuild `--no-cache`.

- **Migrations x db push (drift)**
  Em dev, rode:
  `npx prisma migrate reset --force --skip-generate && npx prisma migrate dev --name init`
  e **commite** `prisma/migrations`.

---

## 🔒 Qualidade / Observabilidade

- **Swagger** categorizado (`@ApiTags`) e exemplos nos DTOs.
- **/health** para readiness/liveness.
- **Logs** de transição no `SkuService` (`from -> to`).
- **Validação global** (`ValidationPipe` com `whitelist`/`transform`).

---

**Feito com carinho para rodar em 1 comando e demonstrar cuidado com DX, regras de negócio e qualidade.**
