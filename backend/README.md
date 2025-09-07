# GB - Backend (NestJS + Prisma + Postgres)

![Node](https://img.shields.io/badge/Node-20.x-339933?logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma)
![Postgres](https://img.shields.io/badge/Postgres-15-4169E1?logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Jest](https://img.shields.io/badge/Tests-Jest-C21325?logo=jest&logoColor=white)

API REST para gerenciar **SKUs** com **CRUD**, **paginação/filtro** e **regras de status** de negócio.  
Construída em **NestJS** + **Prisma** + **Postgres**, com documentação via **Swagger**.

---

## 🚀 Como Rodar

### Com Docker (Recomendado)

A forma mais simples de executar o projeto é através do `docker-compose.yml` na raiz do repositório, que orquestra o backend, o frontend e o banco de dados.

> Pré-requisitos: **Docker** + **Docker Compose** instalados.

```bash
# Sobe todos os serviços (backend, frontend, db)
docker compose up --build
```

- **API (Nest):** [http://localhost:3000](http://localhost:3000)
- **Swagger:** [http://localhost:3000/docs](http://localhost:3000/docs)
- **Healthcheck:** [http://localhost:3000/health](http://localhost:3000/health)

O `entrypoint.sh` do container do backend automatiza as migrations e o seed do banco de dados na inicialização.

### Localmente (Para Desenvolvimento)

Para rodar o backend de forma isolada no seu ambiente local:

1.  **Pré-requisitos:**
    - Node.js v20.x
    - NPM ou Yarn
    - Uma instância do PostgreSQL rodando

2.  **Setup:**

    ```bash
    # 1. Instale as dependências
    npm install

    # 2. Crie um arquivo .env na raiz de /backend e configure a DATABASE_URL
    # Ex: DATABASE_URL="postgresql://gb:gb@localhost:5432/gbsku?schema=public"

    # 3. Gere o cliente Prisma
    npx prisma generate

    # 4. Rode as migrations para criar as tabelas no banco
    npx prisma migrate dev

    # 5. (Opcional) Popule o banco com dados iniciais
    npm run seed
    ```

3.  **Executar:**

    ```bash
    # Inicia o servidor em modo de desenvolvimento com watch
    npm run start:dev
    ```

---

## ⚙️ Scripts Principais

| Script           | Descrição                                                              |
| :--------------- | :--------------------------------------------------------------------- |
| `start:dev`      | Inicia a aplicação em modo de desenvolvimento com hot-reload.          |
| `build`          | Compila o projeto TypeScript para JavaScript.                          |
| `start:prod`     | Inicia a aplicação em modo de produção (requer `npm run build` antes). |
| `test`           | Roda os testes unitários.                                              |
| `test:e2e`       | Roda os testes end-to-end.                                             |
| `lint`           | Analisa o código em busca de problemas e os corrige.                   |
| `format`         | Formata o código com o Prettier.                                       |
| `prisma:migrate` | Executa as migrations do Prisma para atualizar o schema do banco.      |
| `seed`           | Popula o banco de dados com os dados do arquivo `prisma/seed.js`.      |

---

## 🧠 Domínio: SKU e Regras de Negócio

**Modelo de Dados**

- `id` (UUID)
- `descricao` (string)
- `descricaoComercial` (string)
- `sku` (string único)
- `status` (enum: `PRE_CADASTRO`, `CADASTRO_COMPLETO`, `ATIVO`, `DESATIVADO`, `CANCELADO`)
- `createdAt`, `updatedAt`

**Transições de Status Permitidas**

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

**Regras de Edição por Status**

- **`PRE_CADASTRO`**: Pode editar `descricao`, `descricaoComercial` e `sku`.
- **`CADASTRO_COMPLETO`**: Pode editar apenas `descricaoComercial`. Se o fizer, o SKU **retorna automaticamente para `PRE_CADASTRO`**.
- **`ATIVO` / `DESATIVADO`**: Nenhuma edição de campo é permitida, apenas transições de status.
- **`CANCELADO`**: É um estado terminal; nenhuma edição ou transição é permitida.

---

## 🔌 Endpoints da API

A documentação completa e interativa está disponível via **Swagger** em [`/docs`](http://localhost:3000/docs).

- `POST /skus` → Cria um novo SKU.
- `GET /skus` → Lista SKUs com paginação e filtros (`page`, `limit`, `status`).
- `GET /skus/:id` → Busca um SKU pelo seu ID.
- `PATCH /skus/:id` → Atualiza um SKU, respeitando as regras de edição por status.
- `POST /skus/:id/transition` → Transiciona o status de um SKU.
- `DELETE /skus/:id` → Remove um SKU.
- `GET /health` → Endpoint para health check.

---

## 🧪 Testes

O projeto possui uma suíte de testes robusta para garantir a qualidade e o comportamento esperado das regras de negócio.

- **Testes Unitários**: Focados em validar a lógica de negócio no `SkuService`, como as regras de transição de status e as permissões de edição.
- **Testes End-to-End (E2E)**: Simulam requisições HTTP reais aos controllers, cobrindo todo o fluxo da aplicação, desde a validação de entrada até a resposta final.

**Como rodar os testes:**

```bash
# Rodar testes unitários
npm run test

# Rodar testes unitários com cobertura
npm run test:cov

# Rodar testes end-to-end
npm run test:e2e

# Rodar testes end-to-end com cobertura
npm run test:e2e:cov
```

---

## ✨ Qualidade de Código e Boas Práticas

- **Documentação de API com Swagger**: Todos os endpoints, DTOs e respostas são documentados, facilitando o consumo da API.
- **Validação de Dados**: Uso do `ValidationPipe` global para garantir que todos os dados de entrada (`body`, `query`, `params`) sejam validados e tipados corretamente.
- **Tratamento de Erros**: Um `PrismaExceptionFilter` customizado é usado para tratar erros comuns do banco de dados (como registros duplicados) e retornar respostas HTTP adequadas.
- **Testes Abrangentes**: Alta cobertura de testes unitários e E2E para garantir a estabilidade do código.
- **Código Limpo e Organizado**: A estrutura do projeto segue os padrões do NestJS, com uma clara separação de responsabilidades entre módulos, controllers e serviços.
