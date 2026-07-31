# Contributing

Obrigado por contribuir com o Teleagent.

## Antes de começar

1. Abra uma [issue](https://github.com/MatheusLTrindade/Teleagent/issues) descrevendo bug ou feature (salvo typo óbvio).
2. Fork + branch a partir de `main`: `feat/…`, `fix/…` ou `docs/…`.
3. Stack: **Node ≥ 20**, TypeScript (CLI/bridge), Electron (hub Windows).

## Setup local

```bash
npm install
npm run typecheck
npm run build
npm run serve
```

Desktop:

```bash
npm run desktop:install
npm run desktop:dev
```

## Padrões

- Responda e documente em **pt-BR** (código e commits seguem o estilo do repo).
- Não introduza runtime/DB paralelo sem discussão.
- Não committe secrets (`.env`, tokens, `~/.teleagent/config.json`).
- Prefira mudanças pequenas e revisáveis.
- Atualize `CHANGELOG.md` em alterações visíveis ao usuário (Keep a Changelog).

## Checklist do PR

- [ ] `npm run typecheck` e `npm run build` ok
- [ ] Descrição com **Summary** + **Test plan**
- [ ] Issue vinculada (`Fixes #n`) quando houver
- [ ] Sem IDs/tokens pessoais em exemplos

## Releases

Tags `vX.Y.Z` disparam o workflow de release do desktop. Não force-push em tags publicadas.
