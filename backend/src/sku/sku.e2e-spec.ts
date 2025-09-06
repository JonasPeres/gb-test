// import request from "supertest";
// import { INestApplication } from "@nestjs/common";
// ...
// it("deve voltar para PRE_CADASTRO ao editar descricaoComercial em CADASTRO_COMPLETO", async () => {
//   const { body: created } = await request(app.getHttpServer())
//     .post("/skus").send({ descricao:"A", descricaoComercial:"B", sku:"X-1" });
//   await request(app.getHttpServer())
//     .post(`/skus/${created.id}/transition`).send({ target:"CADASTRO_COMPLETO" }).expect(201);
//   const { body: updated } = await request(app.getHttpServer())
//     .patch(`/skus/${created.id}`).send({ descricaoComercial:"Nova" }).expect(200);
//   expect(updated.status).toBe("PRE_CADASTRO");
// });
