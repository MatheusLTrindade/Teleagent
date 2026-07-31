# Security Policy

## Supported versions

| Version | Supported |
| --- | --- |
| `0.2.x` | ✅ |
| `< 0.2` | ❌ |

## Reporting a vulnerability

**Não abra issue pública** com exploits, tokens ou dados sensíveis.

Envie um relato privado por um destes canais:

1. [GitHub Security Advisories](https://github.com/MatheusLTrindade/Teleagent/security/advisories/new) (preferencial)
2. Contato do maintainer via perfil GitHub: [MatheusLTrindade](https://github.com/MatheusLTrindade)

Inclua, quando possível:

- versão do Teleagent / app Windows
- passos para reproduzir
- impacto esperado
- PoC mínima (sem secrets reais)

Resposta esperada em até **7 dias**. Corrigiremos com prioridade vulnerabilidades que exponham token do bot, bypass de allowlist ou RCE local.

## Modelo de ameaça (resumo)

- O bridge escuta só em **localhost** por padrão — não exponha a porta na rede.
- O token do BotFather e o `chat_id` ficam em `~/.teleagent/config.json` (permissões do usuário).
- Use `--allowed-user` / allowlist para restringir quem controla o bot.
- Nunca committe `.env`, tokens ou `config.json` no repositório.
- Auto-update baixa artefatos dos **GitHub Releases** oficiais deste repo.

## Secrets neste projeto

- CI usa `GITHUB_TOKEN` padrão do Actions (releases).
- Não há tokens de bot versionados.
- Exemplos de docs usam placeholders (`<BOT_TOKEN>`, `<SEU_TELEGRAM_USER_ID>`).
