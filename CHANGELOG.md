# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.0.1] - 2026-04-21

### Fixed

- **Bunyan child constructor**: `NodeLogger` now forwards Bunyan’s internal `new Logger(parent, childFields, simple)` arguments to `super()`. Loggers from `Logger.create()` / `.child()` again expose **`fields.__meta`** (e.g. `processId`). In 3.0.0 the second and third arguments were ignored, so `fields.__meta` was missing and code such as `logger.fields.__meta?.requestId` could throw during bootstrap.
- **`meta` getter**: merges Bunyan **`fields.__meta`** with the internal bag used for **`setLogMeta`** / `log-meta`, without storing `log-meta` on the same object as Bunyan default fields (avoids leaking `log-meta` onto every log line).
- Transitive dev dependency advisories (`brace-expansion`, `lodash`) addressed via `npm audit fix` (lockfile).

### Changed

- `check:circular` no longer prints the full dependency tree (`dpdm --tree=false`); use `check:circular:verbose` for the previous output.

## [3.0.0] - 2026-04-21

Semver **major**: dual package layout, Node 20+, refreshed tooling, optional Nest entry, and TypeScript fixes for consumer compatibility.

### Added

- Dual package output: CommonJS (`dist/cjs`), ESM (`dist/esm`), and declarations (`dist/types`) with `package.json` `exports` for `.` and `./nest`.
- Optional NestJS integration: `@jefferywa/node-logger/nest` (`NodeLoggerModule`, `NestLoggerService`, injection tokens).
- Comparative regression tests against JSON fixtures (`tests/comparative.spec.ts`).
- Husky hooks (pre-commit, pre-push, post-commit) and circular dependency check via `dpdm`.
- `engines.node` `>=20`.
- `npm run pack:tarball` (quality + `npm pack`) for local tarball validation.

### Changed

- TypeScript 6 toolchain; flat ESLint config (`eslint.config.mjs`).
- Request and child logger IDs use `randomUUID` from `node:crypto` instead of the `uuid` package (smaller install graph for consumers).
- Built-in module imports use the `node:` protocol where applicable (`node:fs`, `node:crypto`).
- Middleware types refactored to structural interfaces to remove circular imports between the logger core and middleware.
- Logger constants split under `lib/logger/constants/`.
- README updated (badges, Node 20, dependency footprint, Nest imports, development commands).

### Fixed

- Package description typo: “Banyan” → “Bunyan”.
- TypeScript backward compatibility: `LoggerSettings.serializers` as `unknown` (accepts DTOs typed as `object`); `NodeLogger.meta` as `NodeLoggerMeta` so nested keys such as `log-meta.requestId` type-check.
