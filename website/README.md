# Teleagent website

Site de divulgação, download e documentação.

## Dev

```bash
cd website
npm install
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Vercel (deploy automático via GitHub)

1. Importe o repositório em [vercel.com/new](https://vercel.com/new)
2. **Root Directory:** `website`
3. Framework preset: Next.js (detectado)
4. Conecte o GitHub — cada push em `main` faz deploy de produção; PRs geram Preview

Opcional: domínio custom em Project Settings → Domains.

`NEXT_PUBLIC_*` não é obrigatório para o MVP (releases via GitHub API pública).
