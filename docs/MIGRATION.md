# Migrazione a Pi

1. Conservare backup di `.ai-project/`, `.agents/` e `.claude/` del progetto esistente.
2. Installare il package con `pi install -l /path/AI-ProjectManager` e verificare/trustare il progetto in Pi.
3. Eseguire `node /path/AI-ProjectManager/scripts/ai-project.mjs init --project /path/progetto`.
4. Spostare solo memoria, roadmap e overlay utili in `.pi/ai-project/local/project/`; non copiare dati specifici nel package.
5. Usare `/skill:<nome>`: Pi espone direttamente le skill; non servono wrapper Claude/Codex.

| Precedente | Pi |
| --- | --- |
| `.ai-project/runtime/` | `.pi/ai-project/runtime/` |
| `.ai-project/local/` | `.pi/ai-project/local/` |
| `.agents/skills/` | `.pi/skills/` |

Non eliminare `.agents/` o `.claude/` dal repository precedente senza una conferma separata: potrebbero servire ad altri harness.
