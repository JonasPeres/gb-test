# GB - Backend (NestJS + Prisma + Postgres)

![Node](https://img.shields.io/badge/Node-20.x-339933?logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![Postgres](https://img.shields.io/badge/Postgres-15-4169E1?logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Jest](https://img.shields.io/badge/Tests-Jest-C21325?logo=jest&logoColor=white)

API REST para gerenciar **SKUs** com **CRUD**, **paginação/filtro** e **regras de status** de negócio.  
Construída em **NestJS** + **Prisma** + **Postgres**, com documentação via **Swagger**.

---

## 🧠 Domínio: SKU

**Modelo**

* `id` (UUID)
* `descricao` (string)
* `descricaoComercial` (string)
* `sku` (string único)
* `status` (enum: `PRE_CADASTRO`, `CADASTRO_COMPLETO`, `ATIVO`, `DESATIVADO`, `CANCELADO`)
* `createdAt`, `updatedAt`

**Transições de status**

| De → Para                          | Permitido? |
| ---------------------------------- | ---------- |
| PRE\_CADASTRO → CADASTRO\_COMPLETO | ✅          |
| PRE\_CADASTRO → CANCELADO          | ✅          |
| CADASTRO\_COMPLETO → PRE\_CADASTRO | ✅          |
| CADASTRO\_COMPLETO → ATIVO         | ✅          |
| CADASTRO\_COMPLETO → CANCELADO     | ✅          |
| ATIVO → DESATIVADO                 | ✅          |
| DESATIVADO → ATIVO                 | ✅          |
| DESATIVADO → PRE\_CADASTRO         | ✅          |
| CANCELADO → qualquer               | ❌          |

**Regras de edição**

* `PRE_CADASTRO`: pode editar todos os campos.
* `CADASTRO_COMPLETO`: apenas `descricaoComercial`; se editado, volta para `PRE_CADASTRO`.
* `ATIVO` / `DESATIVADO`: não permitem edição, apenas transição.
* `CANCELADO`: terminal (sem edição/transição).

---

## 🔌 Endpoints principais

* `POST /skus` → cria SKU
* `GET /skus` → lista SKUs (filtros: `page`, `limit`, `status`, `q`)
* `GET /skus/:id` → busca SKU por ID
* `PATCH /skus/:id` → edita SKU (com regras por status)
* `POST /skus/:id/transition` → altera status (valida transições)
* `DELETE /skus/:id` → remove SKU
* `GET /health` → health check

> Documentação detalhada em **Swagger** (`/docs`).

---

## 🧪 Testes

* **Unitários**: regras de negócio (edição, transições válidas/ inválidas).
* **E2E**: CRUD, transições e validações HTTP.

Rodar testes:

```bash
npm run test       # unitários
npm run test:cov   # unitários cobertura
npm run test:e2e   # end-to-end
npm run test:e2e:cov # end-to-end cobertura
```

---

## 🔒 Qualidade

* **Swagger** organizado por tags e exemplos nos DTOs.
* **ValidationPipe** global com whitelist/transform.
* **PrismaExceptionFilter** para erros 409/422.
* **Logs de transição** no `SkuService`.
* **Cobertura alta de testes** (unit + e2e).
