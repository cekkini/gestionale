import { randomUUID } from "node:crypto";

export interface Customer {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface NewCustomer {
  name: string;
  email: string;
}

/**
 * Contratto dell'archivio clienti. L'implementazione in memoria verrà sostituita
 * da quella PostgreSQL senza toccare le rotte.
 * Si aspetta email già normalizzata (minuscolo, senza spazi ai bordi).
 */
export interface CustomerStore {
  /** Crea il cliente, oppure restituisce null se l'email è già presente. */
  create(data: NewCustomer): Customer | null;
  /** Cerca per id senza distinguere maiuscole e minuscole. */
  findById(id: string): Customer | undefined;
}

export function createInMemoryCustomerStore(): CustomerStore {
  const byId = new Map<string, Customer>();
  const emails = new Set<string>();

  return {
    create(data) {
      const email = data.email;
      if (emails.has(email)) return null;

      const customer: Customer = {
        id: randomUUID().toLowerCase(),
        name: data.name,
        email,
        createdAt: new Date().toISOString(),
      };
      byId.set(customer.id, customer);
      emails.add(email);
      return customer;
    },
    findById(id) {
      return byId.get(id.toLowerCase());
    },
  };
}
