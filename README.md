# Kauan Fonseca · Portfolio

Static, bilingual (PT-BR / EN-US) portfolio built with Astro 6, published at
https://fatec-sjc-dsm-portfolio.github.io/ra1461392411013/. The full specification lives in
[`docs/SPEC.md`](docs/SPEC.md); project conventions for AI coding agents are
in [`CLAUDE.md`](CLAUDE.md).

**[Português abaixo](#kauan-fonseca--portfólio-pt-br)**

## What this is

A single-page portfolio in two languages, with no runtime JavaScript beyond
a tiny language selector, no external requests, no analytics and no
cookies. Content (projects, experience, profile) lives in YAML files
validated by Zod schemas; UI strings live in typed dictionaries.

## How to run

```bash
nvm use        # Node 24, see .nvmrc
npm ci
npm run dev    # http://localhost:4321
```

Other useful commands:

| Command | What it does |
| --- | --- |
| `npm run build` | Builds the static site into `dist/` |
| `npm run preview` | Serves `dist/` at http://127.0.0.1:4321 |
| `npm run check` | Type-checks, validates content schemas and i18n parity |
| `npm run test:unit` | Runs Vitest unit tests |
| `npm run check:static` | Scans `dist/` for external resources, CSP, broken links and budgets |
| `npm run test:e2e` | Runs Playwright end-to-end tests (network, i18n, structure, a11y) |
| `npm run test:lh` | Runs Lighthouse CI |
| `npm run verify` | Runs the full gate used in CI |
| `npm run check:delivery` | Checks whether the site is ready to ship |

## How to add an API project

1. Create `src/content/projects/api/<id>.yaml` following the schema in
   `docs/SPEC.md` (section A.7).
2. Add the project image to `src/assets/projects/<id>.<ext>`.
3. Don't edit any other file.
4. Run `npm run verify`.

## Licenses

- Code: MIT (see [`LICENSE`](LICENSE)).
- Written content, the photo and the résumé: all rights reserved.
- Fonts (Newsreader, Public Sans, JetBrains Mono): OFL, see
  `public/licenses/`.
- Icons: Lucide (ISC) and Simple Icons (CC0), see `public/licenses/`.

---

## Kauan Fonseca · Portfólio (PT-BR)

Portfólio estático e bilíngue (PT-BR / EN-US) feito em Astro 6, publicado em
https://fatec-sjc-dsm-portfolio.github.io/ra1461392411013/. O spec completo está em
[`docs/SPEC.md`](docs/SPEC.md); as convenções do projeto para agentes de IA
estão em [`CLAUDE.md`](CLAUDE.md).

## O que é

Um portfólio de página única em dois idiomas, sem JavaScript em tempo de
execução além de um seletor de idioma minúsculo, sem requisições externas,
sem analytics e sem cookies. O conteúdo (projetos, experiência, perfil) fica
em arquivos YAML validados por schemas Zod; os textos de interface ficam em
dicionários tipados.

## Como rodar

```bash
nvm use        # Node 24, ver .nvmrc
npm ci
npm run dev    # http://localhost:4321
```

Outros comandos úteis:

| Comando | O que faz |
| --- | --- |
| `npm run build` | Gera o site estático em `dist/` |
| `npm run preview` | Serve `dist/` em http://127.0.0.1:4321 |
| `npm run check` | Confere tipos, schemas de conteúdo e paridade de i18n |
| `npm run test:unit` | Roda os testes unitários (Vitest) |
| `npm run check:static` | Varre `dist/` por recursos externos, CSP, links quebrados e orçamentos |
| `npm run test:e2e` | Roda os testes end-to-end (Playwright): rede, idioma, estrutura, a11y |
| `npm run test:lh` | Roda o Lighthouse CI |
| `npm run verify` | Roda o gate completo usado no CI |
| `npm run check:delivery` | Confere se o site está pronto para entregar |

## Como adicionar um projeto de API

1. Crie `src/content/projects/api/<id>.yaml` seguindo o schema do
   `docs/SPEC.md` (seção A.7).
2. Coloque a imagem do projeto em `src/assets/projects/<id>.<ext>`.
3. Não edite nenhum outro arquivo.
4. Rode `npm run verify`.

## Licenças

- Código: MIT (ver [`LICENSE`](LICENSE)).
- Textos, foto e currículo: todos os direitos reservados.
- Fontes (Newsreader, Public Sans, JetBrains Mono): OFL, ver
  `public/licenses/`.
- Ícones: Lucide (ISC) e Simple Icons (CC0), ver `public/licenses/`.
# ra1461392411013
