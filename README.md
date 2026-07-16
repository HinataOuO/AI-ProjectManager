# AI Project Manager

Pi package con skill portabili, runtime aggiornabile e stato locale separato.

## Installare il package Pi

```bash
pi install -l /home/Hina/Projects/AI-ProjectManager
```

Pi richiede fiducia nel progetto prima di caricare skill locali/package. Le skill sono disponibili come `/skill:<nome>`.

## Inizializzare un progetto

```bash
node /home/Hina/Projects/AI-ProjectManager/scripts/ai-project.mjs init --project /path/al/progetto
```

Crea:

- `.pi/ai-project/runtime/` — core, skill e script aggiornabili;
- `.pi/ai-project/local/` — roadmap, memoria, overlay persistenti;
- `.pi/skills/` — copia delle skill auto-scoperta da Pi;
- `AGENTS.md` dal template, senza sovrascrivere un file diverso salvo `--force`.

## Lifecycle

```bash
node .pi/ai-project/runtime/scripts/ai-project.mjs status
node .pi/ai-project/runtime/scripts/ai-project.mjs update
```

`update` blocca se il runtime installato ha drift; usare `--force` solo per scartare tali modifiche. Non modifica `.pi/ai-project/local/`.

## Verifica

```bash
npm run validate
npm test
```

Migrazione e check: [`docs/MIGRATION.md`](docs/MIGRATION.md), [`docs/CHECKS.md`](docs/CHECKS.md).
