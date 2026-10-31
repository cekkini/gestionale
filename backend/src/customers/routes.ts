import { Router } from "express";
import type { CustomerStore } from "./store.js";
import { isUuid, validateNewCustomer } from "./validation.js";

export function createCustomersRouter(store: CustomerStore): Router {
  const router = Router();

  router.post("/", (req, res) => {
    const result = validateNewCustomer(req.body);
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }

    const customer = store.create(result.value);
    if (!customer) {
      res.status(409).json({ error: "Esiste già un cliente con questa email" });
      return;
    }
    res.status(201).json(customer);
  });

  router.get("/:id", (req, res) => {
    const id = req.params.id;
    if (!isUuid(id)) {
      res.status(400).json({ error: "Identificativo cliente non valido" });
      return;
    }

    const customer = store.findById(id);
    if (!customer) {
      res.status(404).json({ error: "Cliente non trovato" });
      return;
    }
    res.json(customer);
  });

  return router;
}
