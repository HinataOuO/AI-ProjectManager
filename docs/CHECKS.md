# Check

```bash
npm run validate
npm test
```

Il validatore controlla manifest Pi, frontmatter e nomi delle skill, path Pi e separazione runtime/local. Lo smoke test esegue `init`, modifica lo stato locale, poi `update` e verifica che lo stato resti invariato.
