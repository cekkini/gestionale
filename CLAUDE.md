# Gestionale clienti e ordini

Piccolo gestionale web usato anche come palestra per lavorare con agenti Claude e CI/CD su GitHub.
Il Product Owner è l'utente umano: approva requisiti, revisioni e merge.

## Stack
- Backend: Node.js 20 + TypeScript (strict) + Express, test con Vitest e Supertest
- Frontend: React + TypeScript (non ancora presente, previsto dallo sprint 3)
- Database: PostgreSQL (non ancora presente, previsto dallo sprint 2). Fino ad allora i dati stanno in memoria.
- CI/CD: GitHub Actions

## Struttura
- `backend/src`: codice applicativo (`app.ts` costruisce l'app, `server.ts` la avvia)
- `backend/test`: test automatici
- `.claude/agents`: subagent (analyst, developer, reviewer)
- `.github/workflows`: pipeline CI e workflow degli agenti
- `docs`: piani di sprint e decisioni

## Comandi (da eseguire in `backend/`)
- `npm ci` installa le dipendenze
- `npm run typecheck` controlla i tipi
- `npm test` esegue i test
- `npm run build` compila in `dist/`
- `npm run dev` avvia il server in sviluppo

## Convenzioni
- TypeScript strict, niente `any` senza motivo scritto in un commento
- Ogni endpoint ha almeno un test del caso corretto e uno del caso di errore
- Un branch per issue: `feat/issue-<numero>`
- Commit in stile Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`)
- Messaggi utente e documentazione in italiano, identificatori nel codice in inglese
- Confronti su testo (email, ricerche, identificativi) senza distinzione tra maiuscole e minuscole, tranne le password

## Regole per gli agenti
- Non modificare `.github/`, `.claude/` o `CLAUDE.md` salvo richiesta esplicita nell'issue
- Non aggiungere dipendenze senza motivarlo nella descrizione della PR
- Non leggere né scrivere file `.env` e non inserire segreti nel codice
- Non ampliare lo scope oltre i criteri di accettazione dell'issue
- Se un requisito è ambiguo, fermarsi e chiedere invece di assumere

## Definition of Done
1. Ogni criterio di accettazione ha almeno un test che lo verifica
2. `typecheck`, `test` e `build` passano in locale e in CI
3. La PR è collegata all'issue e descrive cosa è cambiato
4. Il reviewer ha prodotto un verdetto e il PO ha approvato
