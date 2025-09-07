# GB - Frontend (React + Vite + Material-UI)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)
![Material-UI](https://img.shields.io/badge/Material--UI-5.x-007FFF?logo=mui&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack%20Query-5.x-FF4154?logo=react-query&logoColor=white)

Interface web para gerenciar **SKUs**, permitindo **CRUD (criação, leitura, atualização, remoção)**, **busca** e **transição de status** de forma intuitiva.  
Construída com **React**, **Vite**, **TypeScript** e **Material-UI**, e utiliza **TanStack Query (React Query)** para um gerenciamento eficiente do estado do servidor.

---

## 🚀 Como Rodar

### Com Docker (Recomendado)

A forma mais simples de executar o projeto é através do `docker-compose.yml` na raiz do repositório, que orquestra o backend, o frontend e o banco de dados.

> Pré-requisitos: **Docker** + **Docker Compose** instalados.

```bash
# Sobe todos os serviços (backend, frontend, db)
docker compose up --build
```

- **Web (React/Vite):** [http://localhost:5173](http://localhost:5173)

### Localmente (Para Desenvolvimento)

Para rodar o frontend de forma isolada no seu ambiente local:

1.  **Pré-requisitos:**

    - Node.js v20.x
    - NPM ou Yarn

2.  **Setup:**

    ```bash
    # 1. Instale as dependências
    npm install

    # 2. Crie um arquivo .env.local na raiz de /frontend
    # 3. Configure a variável de ambiente para apontar para a API
    VITE_API_BASE=http://localhost:3000
    ```

3.  **Executar:**

    ```bash
    # Inicia o servidor de desenvolvimento com hot-reload
    npm run dev
    ```

---

## ⚙️ Scripts Principais

| Script    | Descrição                                                     |
| :-------- | :------------------------------------------------------------ |
| `dev`     | Inicia o servidor de desenvolvimento do Vite.                 |
| `build`   | Compila a aplicação para produção.                            |
| `preview` | Inicia um servidor local para visualizar a build de produção. |
| `test`    | Roda os testes unitários e de componentes com Vitest.         |
| `lint`    | Analisa o código em busca de problemas com o ESLint.          |

---

## 🧱 Arquitetura e Estrutura de Pastas

```
src/
├── api/
│   └── client.ts      # Cliente Axios para todas as chamadas à API
├── components/
│   ├── SkuForm.tsx      # Formulário de criação/edição de SKU
│   ├── SkuTable.tsx     # Tabela de exibição de SKUs
│   ├── StatusBadge.tsx  # Componente visual para o status do SKU
│   └── TransitionMenu.tsx # Menu para alterar o status
├── hooks/
│   └── useSkus.ts       # Hook customizado com TanStack Query para gerenciar dados de SKUs
├── state/
│   └── transition.ts    # Lógica de negócio (regras de transição) do lado do cliente
├── test/
│   └── setup.ts         # Configuração inicial para testes (ex: jsdom)
├── types.ts             # Definições de tipos (Sku, SkuStatus, etc.)
└── App.tsx              # Componente principal que monta a UI
```

---

## ✨ Boas Práticas e Decisões de Arquitetura

- **Gerenciamento de Estado de Servidor com TanStack Query**: Em vez de `useState` ou Redux para dados da API, o projeto utiliza TanStack Query (`@tanstack/react-query`) para lidar com fetching, caching, invalidação de cache e estado de mutações (loading/error/success). Isso simplifica o código, evita re-fetches desnecessários e melhora a experiência do usuário.
- **Componentização**: A interface é dividida em componentes reutilizáveis e com responsabilidades bem definidas, facilitando a manutenção e a escalabilidade.
- **Hooks Customizados**: A lógica de acesso a dados e mutações dos SKUs está encapsulada no hook `useSkus`, tornando os componentes mais limpos e focados na apresentação.
- **Tipagem Forte**: O uso de TypeScript em todo o projeto, incluindo a definição de tipos claros em `types.ts`, garante a segurança de tipos entre o cliente da API e os componentes.
- **Validação de Formulário**: Utiliza `react-hook-form` e `zod` para uma validação de formulários robusta e declarativa.
- **Build Tool Moderna**: O Vite é usado para proporcionar um ambiente de desenvolvimento extremamente rápido com Hot Module Replacement (HMR) e uma build otimizada para produção.
