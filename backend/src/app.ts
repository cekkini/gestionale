import express, { type NextFunction, type Request, type Response } from "express";
import { createCustomersRouter } from "./customers/routes.js";
import { createInMemoryCustomerStore, type CustomerStore } from "./customers/store.js";

export interface AppOptions {
  customerStore?: CustomerStore;
}

export function createApp(options: AppOptions = {}) {
  const app = express();
  app.use(express.json());

  const customerStore = options.customerStore ?? createInMemoryCustomerStore();

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  app.use("/customers", createCustomersRouter(customerStore));

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const type = (err as { type?: string } | null)?.type;
    if (type === "entity.parse.failed") {
      res.status(400).json({ error: "JSON non valido" });
      return;
    }
    if (type === "entity.too.large") {
      res.status(413).json({ error: "Corpo della richiesta troppo grande" });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Errore interno del server" });
  });

  return app;
}
