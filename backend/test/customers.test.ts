import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import {
  createInMemoryCustomerStore,
  type Customer,
  type CustomerStore,
} from "../src/customers/store.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Archivio che registra i clienti creati davvero, per verificare "nessun cliente creato". */
function makeSpyStore() {
  const inner = createInMemoryCustomerStore();
  const created: Customer[] = [];
  const store: CustomerStore = {
    create(data) {
      const customer = inner.create(data);
      if (customer) created.push(customer);
      return customer;
    },
    findById: (id) => inner.findById(id),
  };
  return { store, created };
}

function setup() {
  const { store, created } = makeSpyStore();
  const app = createApp({ customerStore: store });
  return { app, created };
}

const valid = { name: "Mario Rossi", email: "mario@esempio.it" };

describe("POST /customers e GET /customers/:id", () => {
  it("AC-1 crea un cliente valido e risponde 201", async () => {
    const { app } = setup();
    const res = await request(app).post("/customers").send(valid);
    expect(res.status).toBe(201);
    expect(res.body.id).toMatch(UUID_RE);
    expect(res.body.name).toBe("Mario Rossi");
    expect(res.body.email).toBe("mario@esempio.it");
    expect(new Date(res.body.createdAt).toISOString()).toBe(res.body.createdAt);
  });

  it("AC-2 legge un cliente appena creato", async () => {
    const { app } = setup();
    const created = await request(app).post("/customers").send(valid);
    const res = await request(app).get(`/customers/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(created.body);
  });

  it.each([
    ["name assente", { email: "a@esempio.it" }],
    ["name nullo", { name: null, email: "a@esempio.it" }],
    ["name vuoto", { name: "", email: "a@esempio.it" }],
    ["name di soli spazi", { name: "   ", email: "a@esempio.it" }],
  ])("AC-3 rifiuta con 400 il caso: %s", async (_label, body) => {
    const { app, created } = setup();
    const res = await request(app).post("/customers").send(body);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name/);
    expect(created).toHaveLength(0);
  });

  it.each([
    ["email assente", { name: "Mario" }],
    ["email nulla", { name: "Mario", email: null }],
    ["email vuota", { name: "Mario", email: "" }],
  ])("AC-4 rifiuta con 400 il caso: %s", async (_label, body) => {
    const { app, created } = setup();
    const res = await request(app).post("/customers").send(body);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/);
    expect(created).toHaveLength(0);
  });

  it.each(["mario@", "mario.esempio.it", "a b@c.it"])(
    "AC-5 rifiuta con 400 l'email non valida %s",
    async (email) => {
      const { app, created } = setup();
      const res = await request(app).post("/customers").send({ name: "Mario", email });
      expect(res.status).toBe(400);
      expect(res.body.error).toBeTypeOf("string");
      expect(created).toHaveLength(0);
    },
  );

  it("AC-6 normalizza spazi ed email, conservando le maiuscole del nome", async () => {
    const { app } = setup();
    const res = await request(app)
      .post("/customers")
      .send({ name: "  Mario Rossi  ", email: "  Mario@Esempio.IT " });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Mario Rossi");
    expect(res.body.email).toBe("mario@esempio.it");
  });

  it.each([
    ["name non stringa", { name: 123, email: "a@esempio.it" }],
    ["email non stringa", { name: "Mario", email: 123 }],
    ["corpo array", []],
  ])("AC-7 risponde 400 (mai 500) per: %s", async (_label, body) => {
    const { app, created } = setup();
    const res = await request(app).post("/customers").send(body as object);
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTypeOf("string");
    expect(created).toHaveLength(0);
  });

  it.each([
    ["JSON malformato", "{non valido"],
    ["testo JSON non oggetto", '"testo"'],
  ])("AC-7 risponde 400 (mai 500) per: %s", async (_label, raw) => {
    const { app, created } = setup();
    const res = await request(app)
      .post("/customers")
      .set("Content-Type", "application/json")
      .send(raw);
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTypeOf("string");
    expect(created).toHaveLength(0);
  });

  it("AC-8 risponde 404 per un id UUID non presente", async () => {
    const { app } = setup();
    const res = await request(app).get("/customers/123e4567-e89b-42d3-a456-426614174000");
    expect(res.status).toBe(404);
    expect(res.body.error).toBeTypeOf("string");
  });

  it("AC-9 risponde 400 per un id che non è un UUID", async () => {
    const { app } = setup();
    const res = await request(app).get("/customers/abc");
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTypeOf("string");
  });

  it("AC-10 due istanze dell'applicazione non condividono i dati", async () => {
    const first = createApp();
    const second = createApp();
    const created = await request(first).post("/customers").send(valid);
    expect(created.status).toBe(201);

    const lookup = await request(second).get(`/customers/${created.body.id}`);
    expect(lookup.status).toBe(404);

    const again = await request(second).post("/customers").send(valid);
    expect(again.status).toBe(201);
  });

  it.each(["Mario@Esempio.it", " mario@esempio.it ", "mario@esempio.it"])(
    "AC-11 rifiuta con 409 l'email duplicata %j",
    async (email) => {
      const { app, created } = setup();
      await request(app).post("/customers").send(valid);
      const res = await request(app).post("/customers").send({ name: "Altro", email });
      expect(res.status).toBe(409);
      expect(res.body.error).toBeTypeOf("string");
      expect(created).toHaveLength(1);
    },
  );

  it("AC-12 trova il cliente anche con l'id scritto in maiuscolo", async () => {
    const { app } = setup();
    const created = await request(app).post("/customers").send(valid);
    const res = await request(app).get(`/customers/${String(created.body.id).toUpperCase()}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(created.body);
  });

  it("AC-13 rifiuta un name oltre 100 caratteri e accetta esattamente 100", async () => {
    const { app, created } = setup();
    const tooLong = await request(app)
      .post("/customers")
      .send({ name: "a".repeat(101), email: "a@esempio.it" });
    expect(tooLong.status).toBe(400);
    expect(created).toHaveLength(0);

    const exact = await request(app)
      .post("/customers")
      .send({ name: "a".repeat(100), email: "a@esempio.it" });
    expect(exact.status).toBe(201);
  });

  it("AC-13 rifiuta un'email oltre 254 caratteri e accetta esattamente 254", async () => {
    const { app, created } = setup();
    const domain = "@esempio.it";
    const tooLong = await request(app)
      .post("/customers")
      .send({ name: "Mario", email: "a".repeat(255 - domain.length) + domain });
    expect(tooLong.status).toBe(400);
    expect(created).toHaveLength(0);

    const exact = await request(app)
      .post("/customers")
      .send({ name: "Mario", email: "a".repeat(254 - domain.length) + domain });
    expect(exact.status).toBe(201);
  });

  it("AC-13 conta la lunghezza dopo aver tolto gli spazi ai bordi", async () => {
    const { app } = setup();
    const res = await request(app)
      .post("/customers")
      .send({ name: ` ${"a".repeat(100)} `, email: "a@esempio.it" });
    expect(res.status).toBe(201);
  });
});
