# Sprint 1: fondamenta e primo ciclo agentico

**Durata stimata:** 1-2 settimane, 5-6 sessioni da 1-2 ore
**Obiettivo:** far girare un ciclo completo issue → specifica → codice → CI → review → merge, con te come Product Owner che verifica ogni passaggio.

**Assunzione di dominio:** gestionale di clienti e ordini. Se vuoi un altro dominio, cambia solo `CLAUDE.md` e l'issue #1.

## 1. Prerequisiti
- Node.js 20+, Git, GitHub CLI (`gh auth login`), Claude Code (`claude --version`)
- Account GitHub con un repository nuovo e vuoto
- Chiave API Anthropic dalla Console, con **limite di spesa mensile basso** (es. 10-20 USD)

## 2. Setup repository (sessione 1)
1. Estrai lo starter kit, entra nella cartella, poi:
   `git init -b main && git add . && git commit -m "chore: starter kit"`
2. Sostituisci `@TUO-USERNAME` in `.github/CODEOWNERS` con il tuo utente e fai commit.
3. `gh repo create gestionale --private --source . --push`
4. Installa l'app Claude sul repository: https://github.com/apps/claude
5. Aggiungi il secret: `gh secret set ANTHROPIC_API_KEY`
6. Crea le label: `gh label create analyze --color 5319e7` (e `feature` se manca)
7. Protezione di `main` (Settings → Branches → Add rule):
   - richiedi una Pull Request prima del merge
   - richiedi il check di stato **backend**
   - richiedi la review dei code owner
   - applica la regola anche agli amministratori
8. Verifica la CI: crea un branch con una modifica banale, apri una PR e controlla che il check `backend` diventi verde.

**Fatto quando:** non riesci a fare push diretto su `main` e la CI gira su ogni PR.

## 3. Primo ciclo agentico (sessioni 2-5)

**Issue #1 (da creare con il template "Nuova funzionalità"):**
> Anagrafica clienti: creare e leggere clienti.
> Endpoint `POST /customers` e `GET /customers/:id`. Un cliente ha nome obbligatorio ed email obbligatoria e valida. I dati stanno in memoria (il database arriva nello sprint 2).

**Passi:**
1. **Analyst:** applica la label `analyze` all'issue. Dopo 1-2 minuti compare il commento con la specifica.
2. **Tu (verifica requisiti):** usa la checklist qui sotto. Rispondi nell'issue con correzioni o con "Specifica approvata".
3. **Developer, in locale:** da `claude`, nella cartella del repo:
   `Usa il subagent developer per implementare la specifica approvata nell'issue #1 su un branch feat/issue-1, poi apri la PR.`
4. **CI:** controlla l'esito su GitHub. Se fallisce, rimanda l'errore al Developer in locale.
5. **Reviewer, in locale:**
   `Usa il subagent reviewer sulla PR #<n> rispetto alla specifica dell'issue #1.`
6. **Tu (verifica risultato):** leggi il diff e il verdetto, poi approva e fai il merge.

Il Developer resta in locale in questo sprint di proposito: così vedi cosa fa prima di automatizzarlo (sprint 2).

### Checklist di verifica della specifica
- [ ] Ogni criterio è verificabile con un test automatico
- [ ] Ci sono casi di errore (email non valida, nome mancante, id inesistente)
- [ ] "Fuori scope" è sensato e non lascia buchi
- [ ] Le domande aperte hanno una tua risposta
- [ ] Nessun requisito inventato che non avevi chiesto

### Checklist di verifica del risultato
- [ ] La tabella di tracciabilità collega ogni criterio a un test reale
- [ ] I test falliscono se rompi di proposito il codice (prova a mutarne uno)
- [ ] Nessuna dipendenza o file non richiesto
- [ ] Il verdetto del Reviewer è coerente con quello che vedi nel diff

## 4. Registro dello sprint (compilalo mentre lavori)
| Metrica | Valore |
|---|---|
| Iterazioni specifica (Analyst → tua correzione) | |
| Iterazioni Developer prima di CI verde | |
| Problemi trovati dal Reviewer | |
| Problemi trovati da te e non dal Reviewer | |
| Costo API (Console) | |
| Tempo totale | |

## 5. Retrospettiva
- Quali ambiguità l'Analyst ha segnalato da solo e quali ha ignorato?
- Il Developer ha mai dichiarato "fatto" con test non verdi?
- Il Reviewer ha trovato cose che ti sarebbero sfuggite?
- Quale prompt di agente modificheresti e perché? Versiona ogni modifica con un commit.

## 6. Definition of Done dello sprint
- [ ] `main` protetto e CI obbligatoria
- [ ] Workflow Analyst funzionante
- [ ] Issue #1 chiusa tramite PR mergiata dopo review umana
- [ ] Registro e retrospettiva compilati

## 7. Sprint 2 (anticipazione)
Workflow Developer su label `spec-approved`, ciclo di correzione con massimo 3 tentativi, workflow Reviewer su PR, PostgreSQL con migrazioni, deploy in ambiente di test.

## Se qualcosa non funziona
- **L'Analyst non risponde:** controlla la scheda Actions, che il secret esista, che l'app Claude sia installata e che la label sia esattamente `analyze`.
- **Il subagent non viene invocato:** i parametri dell'azione cambiano tra versioni. Controlla https://github.com/anthropics/claude-code-action (docs/usage.md) e, come soluzione provvisoria, incolla il contenuto di `.claude/agents/analyst.md` nel `prompt`.
- **Errore sui permessi:** il workflow richiede `id-token: write`; controlla che le impostazioni del repo non limitino i permessi di Actions.
