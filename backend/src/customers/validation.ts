export const NAME_MAX_LENGTH = 100;
export const EMAIL_MAX_LENGTH = 254;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ValidationResult =
  | { ok: true; value: { name: string; email: string } }
  | { ok: false; error: string };

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

type FieldResult = { ok: true; value: string } | { ok: false; error: string };

function readText(raw: unknown, field: string, maxLength: number): FieldResult {
  if (raw === undefined || raw === null) {
    return { ok: false, error: `Il campo ${field} è obbligatorio` };
  }
  if (typeof raw !== "string") {
    return { ok: false, error: `Il campo ${field} deve essere una stringa` };
  }
  const value = raw.trim();
  if (value === "") {
    return { ok: false, error: `Il campo ${field} è obbligatorio` };
  }
  if (value.length > maxLength) {
    return { ok: false, error: `Il campo ${field} supera ${maxLength} caratteri` };
  }
  return { ok: true, value };
}

export function validateNewCustomer(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "Il corpo della richiesta deve essere un oggetto JSON" };
  }
  const input = body as Record<string, unknown>;

  const name = readText(input.name, "name", NAME_MAX_LENGTH);
  if (!name.ok) return name;

  const email = readText(input.email, "email", EMAIL_MAX_LENGTH);
  if (!email.ok) return email;
  if (!EMAIL_PATTERN.test(email.value)) {
    return { ok: false, error: "Il campo email non è un indirizzo valido" };
  }

  return { ok: true, value: { name: name.value, email: email.value.toLowerCase() } };
}
