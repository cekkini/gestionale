# 001 - Anagrafica clienti: creare e leggere clienti

**Stato:** PRONTA PER APPROVAZIONE (decisioni del Product Owner recepite)
**Autore:** Analyst

## Obiettivo
Permettere di registrare un cliente (nome ed email) e di recuperarlo tramite il suo identificativo. È la base dell'anagrafica su cui, in seguito, si collegheranno gli ordini. I dati restano in memoria: il database arriva nello sprint 2.

## User story
Come operatore del gestionale voglio registrare un cliente con nome ed email e consultarlo tramite il suo id, per avere un'anagrafica affidabile su cui collegare gli ordini.

## Decisioni del Product Owner
1. Email duplicate non consentite: risposta `409`, confronto senza distinzione tra maiuscole e minuscole.
2. L'email viene salvata in minuscolo. Regola generale del progetto: i confronti sul testo non distinguono maiuscole e minuscole, tranne per le password.
3. Lunghezze massime: `name` 100 caratteri, `email` 254.
4. Id che non è un UUID: risposta `400`.
5. Formato degli errori: `{ "error": "<messaggio in italiano>" }`.

## Criteri di accettazione
Convenzioni: l'id è un UUID generato dal server. Per tutti gli errori il corpo è `{ "error": "<messaggio in italiano>" }`.

**AC-1 Creazione valida**
Dato un corpo JSON `{ "name": "Mario Rossi", "email": "mario@esempio.it" }`, quando invio `POST /customers`, allora ottengo `201` e un corpo con `id` (UUID), `name`, `email` e `createdAt` (data ISO 8601), con `name` ed `email` uguali a quelli inviati.

**AC-2 Lettura**
Dato un cliente appena creato, quando invio `GET /customers/:id` con il suo id, allora ottengo `200` e gli stessi dati restituiti alla creazione.

**AC-3 Nome obbligatorio**
Dato un corpo senza `name`, oppure con `name` nullo, vuoto o composto solo da spazi, quando invio `POST /customers`, allora ottengo `400` con un messaggio che indica il campo `name`, e nessun cliente viene creato.

**AC-4 Email obbligatoria**
Dato un corpo senza `email`, oppure con `email` nulla o vuota, quando invio `POST /customers`, allora ottengo `400` con un messaggio che indica il campo `email`, e nessun cliente viene creato.

**AC-5 Email valida**
Dato un corpo con `email` in formato non valido (per esempio `mario@`, `mario.esempio.it`, `a b@c.it`), quando invio `POST /customers`, allora ottengo `400` e nessun cliente viene creato.

**AC-6 Normalizzazione**
Dato un corpo con `name` ed `email` che hanno spazi iniziali o finali, e un'email con lettere maiuscole (per esempio `  Mario@Esempio.IT `), quando invio `POST /customers`, allora il cliente viene salvato con spazi ai bordi rimossi in entrambi i campi, l'email in minuscolo (`mario@esempio.it`) e il nome con le maiuscole e minuscole inserite dall'utente.

**AC-7 Tipi errati e corpo non valido**
Dato un corpo con `name` o `email` che non sono stringhe (per esempio `123`), oppure un corpo che non è un oggetto JSON (array, testo, JSON malformato), quando invio `POST /customers`, allora ottengo `400` e mai `500`.

**AC-8 Cliente inesistente**
Dato un id in formato UUID corretto ma non presente, quando invio `GET /customers/:id`, allora ottengo `404`.

**AC-9 Id non valido**
Dato un id che non è un UUID (per esempio `abc`), quando invio `GET /customers/:id`, allora ottengo `400`.

**AC-10 Indipendenza dei dati**
Dati due avvii distinti dell'applicazione (due chiamate a `createApp()`), quando creo un cliente nel primo, allora il secondo non lo contiene. Serve a rendere i test indipendenti tra loro.

**AC-11 Email duplicata**
Dato un cliente già registrato con email `mario@esempio.it`, quando invio `POST /customers` con la stessa email, anche con maiuscole diverse (`Mario@Esempio.it`) o con spazi ai bordi, allora ottengo `409` e non viene creato un secondo cliente.

**AC-12 Id insensibile alle maiuscole**
Dato un cliente esistente, quando invio `GET /customers/:id` con il suo id scritto in maiuscolo, allora ottengo `200` e lo stesso cliente.

**AC-13 Lunghezze massime**
Dato un `name` di oltre 100 caratteri oppure un'`email` di oltre 254 caratteri (contati dopo la rimozione degli spazi ai bordi), quando invio `POST /customers`, allora ottengo `400` e nessun cliente viene creato. Con esattamente 100 e 254 caratteri la creazione riesce.

Per ogni errore di `POST /customers` (AC-3, AC-4, AC-5, AC-7, AC-11, AC-13) va verificato anche che nessun cliente sia stato creato per errore.

## Fuori scope
- Modifica, cancellazione, elenco, ricerca e paginazione dei clienti
- Persistenza su database (sprint 2)
- Autenticazione, autorizzazione e password. La regola sulle maiuscole per le password si applicherà quando esisteranno
- Interfaccia grafica
- Campi aggiuntivi (telefono, indirizzo, partita IVA)
- Collegamento con gli ordini

## Impatto tecnico
- `backend/src/app.ts`: registrazione delle nuove rotte
- Nuovo modulo clienti in `backend/src` con rotte, validazione e archivio in memoria. L'archivio va isolato dietro un'interfaccia, per sostituirlo con PostgreSQL senza toccare le rotte
- Un archivio per ogni istanza di `createApp()` (vedi AC-10)
- Gestione esplicita del JSON malformato, altrimenti Express risponde con un errore non coerente con AC-7
- Confronto dell'email e dell'id su forma normalizzata (minuscolo), in un punto solo
- Nuovi test in `backend/test`
- Nessuna nuova dipendenza prevista: validazione scritta a mano

## Domande aperte
Nessuna.

## Dimensione
Adatta a una sola Pull Request.
