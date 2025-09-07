# GB - Frontend (React + Vite + Material-UI)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Material-UI](https://img.shields.io/badge/Material--UI-7-007FFF?logo=mui&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack%20Query-5-FF4154?logo=react-query&logoColor=white)

Interface web para gerenciar **SKUs**, permitindo **CRUD (criação, leitura, atualização, remoção)**, **busca** e **transição de status** de forma intuitiva. Construída com **React**, **Vite**, **TypeScript** e **Material-UI**, e utiliza **TanStack Query (React Query)** para um gerenciamento eficiente do estado do servidor.

---

## 🚀 Como Rodar

### Com Docker (Recomendado)

A forma mais simples de executar o projeto é através do `docker-compose.yml` na raiz do repositório, que orquestra o backend, o frontend e o banco de dados.

> **Pré-requisitos:** [Docker](https://www.docker.com/products/docker-desktop/) e **Docker Compose** instalados.

```bash
# Na raiz do projeto, sobe todos os serviços (backend, frontend, db)
docker compose up --build
```

- **Acesse a aplicação em:** [http://localhost:5173](http://localhost:5173)

### Localmente (Para Desenvolvimento)

Para rodar o frontend de forma isolada no seu ambiente local, garantindo uma experiência de desenvolvimento mais rápida com Hot-Reload.

**Pré-requisitos:**

1.  **Node.js v20.x** instalado.
2.  **O backend precisa estar rodando**, pois o frontend depende da API. Você pode iniciar o backend e o banco de dados com o comando: `docker compose up -d backend` na raiz do projeto.

**Passos:**

1.  **Instale as dependências:**

    ```bash
    npm install
    ```

2.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env.local` na raiz da pasta `frontend/` com o seguinte conteúdo:

    ```env
    VITE_API_BASE=http://localhost:3000
    ```

3.  **Execute a aplicação:**
    ```bash
    npm run dev
    ```

---

## 🧪 Testes

O projeto utiliza **Vitest** para testes de componentes e hooks, garantindo a qualidade e o comportamento esperado da interface.

**Como rodar os testes:**

```bash
# Roda todos os testes uma vez
npm test

# Roda os testes e gera o relatório de cobertura
npm run test:cov

# Roda os testes em modo "watch" para desenvolvimento
npm run test:ui
```

---

## ⚙️ Scripts Principais

| Script     | Descrição                                                      |
| :--------- | :------------------------------------------------------------- |
| `dev`      | Inicia o servidor de desenvolvimento do Vite.                  |
| `build`    | Compila a aplicação para produção.                             |
| `preview`  | Inicia um servidor local para visualizar a build de produção.  |
| `test`     | Roda os testes com Vitest e finaliza.                          |
| `test:cov` | Roda os testes e gera o relatório de cobertura.                |
| `test:ui`  | Roda os testes em modo _watch_, ideal para desenvolvimento.    |
| `lint`     | Analisa o código em busca de problemas com o ESLint e corrige. |

---

## 🧱 Arquitetura e Estrutura de Pastas

A estrutura foi pensada para separar responsabilidades, facilitando a manutenção e escalabilidade.

```
src/
├── api/
│   └── client.ts      # Cliente Axios configurado para a API
├── components/
│   ├── SkuForm/       # Formulário de criação/edição de SKU com validação (Zod)
│   ├── SkuTable/      # Tabela de SKUs com busca, paginação e ações
│   ├── StatusBadge/   # Componente visual para o status do SKU
│   └── TransitionMenu/  # Menu de opções para transição de status
├── hooks/
│   ├── useDebounce.ts # Hook para debounce de input (ex: busca)
│   └── useSkus.ts     # Hook com TanStack Query para gerenciar estado dos SKUs
├── state/
│   └── transition.ts  # Lógica de negócio (regras de transição) do lado do cliente
├── test/
│   └── setup.ts       # Configuração inicial para testes com Vitest e JSDOM
├── types.ts           # Definições de tipos (Sku, SkuStatus, etc.)
├── theme.ts           # Tema customizado do Material-UI
└── App.tsx            # Componente principal que renderiza a interface
```

---

## ✨ Boas Práticas e Decisões de Arquitetura

- **Gerenciamento de Estado de Servidor com TanStack Query**: Em vez de `useState` ou Redux para dados da API, o projeto utiliza TanStack Query (`@tanstack/react-query`) para lidar com fetching, caching, invalidação de cache e estado de mutações (loading/error/success). Isso simplifica o código, evita re-fetches desnecessários e melhora a experiência do usuário.
- **Componentização**: A interface é dividida em componentes reutilizáveis e com responsabilidades bem definidas, facilitando a manutenção e a escalabilidade.
- **Hooks Customizados**: A lógica de acesso a dados e mutações dos SKUs está encapsulada no hook `useSkus`, tornando os componentes mais limpos e focados na apresentação.
- **Tipagem Forte**: O uso de TypeScript em todo o projeto, incluindo a definição de tipos claros em `types.ts`, garante a segurança de tipos entre o cliente da API e os componentes.
- **Validação de Formulário Robusta**: Utiliza `react-hook-form` e `zod` para uma validação de formulários declarativa, segura e com excelente experiência para o desenvolvedor.
- **UI Consistente com Material-UI**: A biblioteca de componentes Material-UI é utilizada para construir uma interface coesa e agradável, com um tema customizado definido em `theme.ts`.
- **Build Tool Moderna**: O Vite é usado para proporcionar um ambiente de desenvolvimento extremamente rápido com Hot Module Replacement (HMR) e uma build otimizada para produção.
