# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere a [SemVer](https://semver.org/lang/pt-BR/).

## [Unreleased]

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
