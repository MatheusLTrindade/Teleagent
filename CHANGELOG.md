# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere a [SemVer](https://semver.org/lang/pt-BR/).

## [Unreleased]

## [1.1.0] — 2026-07-31

### Added

- Hub multilíngue (pt / en / es) com seletor de idioma
- Website i18n (`/pt`, `/en`, `/es`) + docs traduzidas
- Apoio ao desenvolvedor via GitHub Sponsors (`/apoiar`, `FUNDING.yml`)
- README em inglês e espanhol

### Fixed

- Favicon/ícones do Teleagent no website (substitui o padrão do Next.js)
- Menu mobile do site (CSS `.btn` vs `md:hidden`)

### Changed

- Arquitetura do website alinhada ao App Router modular (Profile A)

## [1.0.0] — 2026-07-31

### Added

- Primeira release pública estável

### Fixed

- Installer Electron volta a empacotar o bridge (`prepare-bridge` no `publish` + verificação no CI)

### Changed

- Documentação e higiene OSS para publicação do repositório
- Releases Electron publicadas como não-draft (`releaseType: release`)

## [0.2.0] — 2026-07-31

### Added

- Auto-update do hub Electron via GitHub Releases (tags `vX.Y.Z`)
- Exibição da versão atual no hub e no tray
- Workflow CI `release-desktop` para publicar Setup NSIS + portable

## [0.1.0] — 2026-07-31

### Added

- CLI `teleagent` (setup, serve, alert, ask, cancel, status)
- Bridge local Grammy + API HTTP em localhost
- App Windows (bandeja + hub) com autostart
- Skill Cursor em `skills/teleagent/`

[Unreleased]: https://github.com/MatheusLTrindade/Teleagent/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/MatheusLTrindade/Teleagent/releases/tag/v1.0.0
[0.2.0]: https://github.com/MatheusLTrindade/Teleagent/releases/tag/v0.2.0
[0.1.0]: https://github.com/MatheusLTrindade/Teleagent/commits/main
