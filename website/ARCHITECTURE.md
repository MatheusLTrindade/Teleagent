# Arquitetura do website (Profile A)

```
src/
  app/
    (marketing)/          # landing — colocation em _components/
    download/             # page thin + modules/releases
    docs/                 # sidebar colocada; conteúdo em modules/docs
    layout.tsx
    globals.css
  modules/
    site-chrome/          # header/footer/pointer — public.client|server
    docs/                 # nav + DocBody — public.server
    releases/             # GitHub releases — public.server
```

Consumidores externos importam só `public.server.ts` / `public.client.ts`.
Sem deep import de `modules/*/components|lib` fora do módulo.
