# GB - Desafio Fullstack (SKU Manager)

[![Status](https://img.shields.io/badge/Status-Finalizado-success)](./)
[![Docker](https://img.shields.io/badge/Run%20with-Docker-2496ED?logo=docker&logoColor=white)](./docker-compose.yml)

Aplicação fullstack para gerenciar **SKUs** com **CRUD**, **busca/paginação** e um **fluxo de status** com regras de negócio bem definidas. O projeto foi desenhado para que **qualquer pessoa consiga rodá-lo com um único comando**, sem necessidade de configurar ambientes locais.

---

## Sumário

- [🚀 Como Rodar (1 Comando)](#-como-rodar-1-comando)
- [🛠️ Stack de Tecnologias](#️-stack-de-tecnologias)
- [✨ Features Principais](#-features-principais)
- [🧱 Arquitetura do Projeto](#-arquitetura-do-projeto)
- [🧠 Domínio e Regras de Negócio](#-domínio-sku-e-regras-de-negócio)
- [🧪 Testes](#-testes)
- [⚙️ Desenvolvimento Local (Opcional)](#️-desenvolvimento-local-opcional)
- [🏆 Filosofia do Projeto](#-filosofia-do-projeto)

---

## 🚀 Como Rodar (1 Comando)

> **Pré-requisitos:** [Docker](https://www.docker.com/products/docker-desktop/) e **Docker Compose** instalados.

Na raiz do projeto, execute:

```bash
docker compose up --build
```

Isso irá construir as imagens, iniciar os contêineres, aplicar as migrações do banco de dados, popular com dados iniciais (`seed`) e deixar a aplicação pronta para uso.

- **Frontend (React/Vite):** [http://localhost:5173](http://localhost:5173)
- **Backend (NestJS):** [http://localhost:3000](http://localhost:3000)
- **API Docs (Swagger):** [http://localhost:3000/docs](http://localhost:3000/docs)

O container do backend utiliza um `entrypoint.sh` que automatiza todo o processo de setup do banco de dados, eliminando qualquer passo manual.

---

## 🛠️ Stack de Tecnologias

| Área      | Tecnologia                                                                                                                                                          | Versão |
| :-------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :----- |
| Backend   | ![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)            | `11.x` |
| Frontend  | ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black) ![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)     | `19.x` |
| Banco     | ![Postgres](https://img.shields.io/badge/Postgres-15-4169E1?logo=postgresql&logoColor=white)                                                                        | `15.x` |
| UI        | ![Material-UI](https://img.shields.io/badge/Material--UI-7-007FFF?logo=mui&logoColor=white)                                                                         | `7.x`  |
| Linguagem | ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)                                                                     | `5.x`  |
| Testes    | ![Jest](https://img.shields.io/badge/BE-Jest-C21325?logo=jest&logoColor=white) ![Vitest](https://img.shields.io/badge/FE-Vitest-6E9F18?logo=vitest&logoColor=white) | -      |

---

## ✨ Features Principais

- **CRUD Completo de SKUs**: Crie, visualize, edite e remova SKUs.
- **Busca e Paginação**: A tabela de SKUs permite busca textual e paginação dos resultados.
- **Máquina de Estado**: Um fluxo de status (`PRE_CADASTRO`, `ATIVO`, etc.) com regras de transição e edição estritas.
- **Validação de Dados**: Validação robusta tanto no backend (DTOs) quanto no frontend (Zod).
- **Setup Automatizado**: Banco de dados é migrado e populado automaticamente na inicialização.
- **Documentação de API**: Endpoints documentados com Swagger para fácil consulta.

---

## 🧱 Arquitetura do Projeto

O projeto é um monorepo com duas aplicações principais: `backend` e `frontend`.

```
gb-test/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Schema do banco de dados (ORM)
│   │   ├── migrations/        # Migrações geradas pelo Prisma
│   │   └── seed.js            # Script para popular o banco
│   ├── src/
│   │   ├── sku/               # Módulo de SKU (controller, service, DTOs)
│   │   ├── main.ts            # Ponto de entrada da aplicação NestJS
│   │   └── app.module.ts      # Módulo raiz
│   ├── test/
│   │   ├── sku.e2e-spec.ts    # Testes end-to-end para o módulo SKU
│   │   └── mocks/             # Mocks para testes
│   ├── Dockerfile
│   └── entrypoint.sh          # Script de inicialização (migrate + seed)
│
├── frontend/
│   ├── src/
│   │   ├── api/               # Cliente Axios para a API
│   │   ├── components/        # Componentes React reutilizáveis
│   │   ├── hooks/             # Hooks customizados (ex: useSkus com TanStack Query)
│   │   ├── state/             # Lógica de estado do cliente (regras de transição)
│   │   ├── types.ts           # Tipos e interfaces TypeScript
│   │   ├── App.tsx            # Componente principal da aplicação
│   │   └── main.tsx           # Ponto de entrada da aplicação React
│   └── Dockerfile
│
└── docker-compose.yml         # Orquestra todos os serviços (db, backend, frontend)
```

---

## 🧠 Domínio: SKU e Regras de Negócio

**Campos do SKU**

- `id` (UUID), `descricao`, `descricaoComercial`, `sku` (único), `status`, `createdAt`, `updatedAt`

**Status Possíveis**

- `PRE_CADASTRO`
- `CADASTRO_COMPLETO`
- `ATIVO`
- `DESATIVADO`
- `CANCELADO`

**Principais Regras de Negócio**

1.  **Transições de Status**: Nem todos os status podem ser alterados para qualquer outro. Por exemplo, `CANCELADO` é um estado terminal. A lógica está implementada no `backend/src/sku/sku.service.ts` e replicada no frontend para melhor UX.
2.  **Permissões de Edição**: Campos só podem ser editados nos status `PRE_CADASTRO` e `CADASTRO_COMPLETO`.
3.  **Regra de Regressão**: Se a `descricaoComercial` for alterada no estado `CADASTRO_COMPLETO`, o SKU retorna automaticamente para `PRE_CADASTRO`.

---

## 🧪 Testes

O projeto inclui testes unitários e end-to-end para garantir a qualidade e a corretude das regras de negócio.

Para mais detalhes sobre como rodar os testes em um ambiente de desenvolvimento local, consulte os `READMEs` de cada projeto.

---

## ⚙️ Desenvolvimento Local (Opcional)

Se preferir rodar fora do Docker, siga as instruções detalhadas nos READMEs de cada subprojeto. Eles contêm o passo a passo para configurar o ambiente, instalar dependências e rodar cada aplicação de forma independente.

- [`backend/README.md`](./backend/README.md)
- [`frontend/README.md`](./frontend/README.md)

---

## 🏆 Filosofia do Projeto

- **Developer Experience (DX) em primeiro lugar**: O objetivo é que qualquer pessoa desenvolvedora consiga clonar o repositório e rodar a aplicação com o mínimo de fricção possível, graças ao Docker e ao setup automatizado.
- **Robustez e Boas Práticas**: O código segue boas práticas de mercado, como validação de dados, tratamento de erros, testes automatizados e uma arquitetura bem definida.
- **Simplicidade e Foco**: A solução é focada em resolver o problema proposto de forma clara e eficiente, sem complexidade desnecessária.
