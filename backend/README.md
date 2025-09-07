# GB - Backend (NestJS + Prisma + Postgres)

![Node](https://img.shields.io/badge/Node-20.x-339933?logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![Postgres](https://img.shields.io/badge/Postgres-15-4169E1?logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Jest](https://img.shields.io/badge/Tests-Jest-C21325?logo=jest&logoColor=white)

API REST para gerenciar **SKUs** com **CRUD**, **paginação/filtro** e **regras de status** de negócio. Construída em **NestJS** + **Prisma** + **Postgres**, com documentação via **Swagger**. O projeto é totalmente containerizado e desenhado para rodar com um único comando.

---

## 🚀 Como Rodar

### Com Docker (Recomendado)

A forma mais simples de executar o projeto é através do `docker-compose.yml` na raiz do repositório, que orquestra o backend, o frontend e o banco de dados.

> **Pré-requisitos:** [Docker](https://www.docker.com/products/docker-desktop/) e **Docker Compose** instalados.

```bash
# Na raiz do projeto, sobe todos os serviços (backend, frontend, db)
docker compose up --build
```

- **API (Nest):** [http://localhost:3000](http://localhost:3000)
- **Swagger:** [http://localhost:3000/docs](http://localhost:3000/docs)
- **Healthcheck:** [http://localhost:3000/health](http://localhost:3000/health)

O `entrypoint.sh` do container do backend automatiza as migrações e o seed do banco de dados na inicialização, garantindo que a aplicação suba pronta para uso.

### Localmente (Para Desenvolvimento)

Para rodar o backend de forma isolada, ideal para desenvolvimento e testes.

**Pré-requisitos:**

- **Node.js v20.x** instalado.
- **Docker** instalado (para rodar o banco de dados facilmente).

**Passos:**

1.  **Inicie o banco de dados:**
    Na raiz do projeto, execute o seguinte comando para iniciar apenas o container do PostgreSQL:

    ```bash
    docker compose up -d db
    ```

    Isso garantirá que o backend tenha um banco de dados para se conectar.

2.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz da pasta `backend/` com o seguinte conteúdo:

    ```env
    DATABASE_URL="postgresql://gb:gb@localhost:5432/gbsku?schema=public"
    ```

3.  **Instale as dependências:**

    ```bash
    npm install
    ```

4.  **Prepare o banco de dados:**
    Esses comandos irão gerar o cliente Prisma, aplicar as migrações e popular o banco.

    ```bash
    npx prisma generate
    npx prisma migrate dev
    npm run seed
    ```

5.  **Execute a aplicação:**
    ```bash
    npm run start:dev
    ```
    O servidor iniciará em `http://localhost:3000` com hot-reload.

---

## 🧪 Testes

O projeto possui uma suíte de testes robusta para garantir a qualidade e o comportamento esperado das regras de negócio. Para rodar os testes localmente, o banco de dados precisa estar em execução (siga o passo 1 da seção de desenvolvimento local).

- **Testes Unitários**: Focados em validar a lógica de negócio no `SkuService`.
- **Testes End-to-End (E2E)**: Simulam requisições HTTP reais aos controllers.

**Como rodar os testes:**

```bash
# Rodar todos os testes (unitários e e2e)
npm test

# Rodar apenas os testes unitários com cobertura
npm run test:cov

# Rodar apenas os testes end-to-end
npm run test:e2e
```

---

## ⚙️ Scripts Principais

| Script           | Descrição                                                              |
| :--------------- | :--------------------------------------------------------------------- |
| `start:dev`      | Inicia a aplicação em modo de desenvolvimento com hot-reload.          |
| `build`          | Compila o projeto TypeScript para JavaScript.                          |
| `start:prod`     | Inicia a aplicação em modo de produção (requer `npm run build` antes). |
| `test`           | Roda os testes unitários e de integração (`.spec.ts`).                 |
| `test:e2e`       | Roda os testes end-to-end (`.e2e-spec.ts`).                            |
| `lint`           | Analisa o código com ESLint e tenta corrigir os problemas.             |
| `format`         | Formata o código com o Prettier.                                       |
| `prisma:migrate` | Cria uma nova migration com base nas alterações do `schema.prisma`.    |
| `prisma:deploy`  | Aplica as migrations pendentes em um ambiente de produção.             |
| `seed`           | Popula o banco de dados com os dados do arquivo `prisma/seed.js`.      |

---

## 🧠 Domínio: SKU e Regras de Negócio

**Modelo de Dados**

- `id` (UUID), `descricao`, `descricaoComercial`, `sku` (único), `status`, `createdAt`, `updatedAt`

**Transições de Status Permitidas**

| De → Para                        | Permitido? | Observações     |
| :------------------------------- | :--------- | :-------------- |
| PRE_CADASTRO → CADASTRO_COMPLETO | ✅         |                 |
| PRE_CADASTRO → CANCELADO         | ✅         |                 |
| CADASTRO_COMPLETO → PRE_CADASTRO | ✅         |                 |
| CADASTRO_COMPLETO → ATIVO        | ✅         |                 |
| CADASTRO_COMPLETO → CANCELADO    | ✅         |                 |
| ATIVO → DESATIVADO               | ✅         |                 |
| DESATIVADO → ATIVO               | ✅         |                 |
| DESATIVADO → PRE_CADASTRO        | ✅         |                 |
| CANCELADO → _qualquer_           | ❌         | estado terminal |

**Regras de Edição por Status**

- **`PRE_CADASTRO`**: Pode editar `descricao`, `descricaoComercial` e `sku`.
- **`CADASTRO_COMPLETO`**: Pode editar `descricaoComercial`. Se o fizer, o SKU **retorna automaticamente para `PRE_CADASTRO`**.
- **`ATIVO` / `DESATIVADO`**: Nenhuma edição de campo é permitida, apenas transições de status.
- **`CANCELADO`**: É um estado terminal; nenhuma edição ou transição é permitida.

---

## 🔌 Endpoints da API

A documentação completa e interativa está disponível via **Swagger** em [`/docs`](http://localhost:3000/docs).

- `POST /skus` → Cria um novo SKU.
- `GET /skus` → Lista SKUs com paginação e busca (`page`, `limit`, `q`).
- `GET /skus/:id` → Busca um SKU pelo seu ID.
- `PATCH /skus/:id` → Atualiza um SKU, respeitando as regras de edição por status.
- `POST /skus/:id/transition` → Transiciona o status de um SKU.
- `DELETE /skus/:id` → Remove um SKU.
- `GET /health` → Endpoint para health check (readiness/liveness).

---

## ✨ Qualidade de Código e Boas Práticas

- **Setup Automatizado com Entrypoint**: O `entrypoint.sh` no Docker detecta se o banco precisa de migrations ou seed, automatizando o setup e melhorando a DX.
- **Documentação de API com Swagger**: Todos os endpoints, DTOs e respostas são documentados, facilitando o consumo da API.
- **Validação de Dados**: Uso do `ValidationPipe` global para garantir que todos os dados de entrada (`body`, `query`, `params`) sejam validados e tipados corretamente.
- **Tratamento de Erros**: Um `PrismaExceptionFilter` customizado é usado para tratar erros comuns do banco de dados (como registros duplicados) e retornar respostas HTTP adequadas.
- **Testes Abrangentes**: Alta cobertura de testes unitários e E2E para garantir a estabilidade do código.
- **Código Limpo e Organizado**: A estrutura do projeto segue os padrões do NestJS, com uma clara separação de responsabilidades entre módulos, controllers e serviços.
- **Health Check**: Endpoint `/health` para monitoramento de liveness e readiness em ambientes orquestrados.
