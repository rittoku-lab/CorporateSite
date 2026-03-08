# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Corporate website for 合同会社リットク (Rittoku LLC) built with VitePress. The site is in Japanese and deployed to GitHub Pages via GitHub Actions on push to `main`. Custom domain: https://rittoku.llc/

## Commands

- **Dev server:** `yarn docs:dev` (serves at localhost:5173)
- **Build:** `yarn docs:build` (outputs to `docs/.vitepress/dist`)
- **Preview build:** `yarn docs:preview`
- **Install deps:** `yarn install`
- **Do not use npm** — this project uses Yarn exclusively (has `yarn.lock`)

## Architecture

VitePress static site. All content lives under `docs/`:

- `docs/.vitepress/config.ts` — VitePress config (nav, sidebar, meta tags, footer)
- `docs/index.md` — Home page (uses VitePress `layout: home` with hero and features)
- `docs/contact.md` — Contact form with inline Vue `<script setup>` that POSTs to a Google Form
- `docs/news/index.md` — News listing with inline Vue script for the `recentNews` array
- `docs/news/posts/` — Individual news articles as Markdown
- `docs/services.md` — Service listing page (grid layout with cards linking to detail pages)
- `docs/services/` — Individual service detail pages (e.g., `booking.md`)
- `docs/public/images/services/` — Service page images (screenshots, diagrams)

Static pages (`about.md`, `company.md`, `terms.md`, `privacy-policy.md`) are plain Markdown with YAML frontmatter for SEO meta tags.

## Content Conventions

- **News articles**: Add to `docs/news/posts/` as `.md` with frontmatter (`title`, `description`, `head` meta). Then update the `recentNews` array in `docs/news/index.md`.
- **New services**: Add a detail page in `docs/services/<name>.md`, add a card in `docs/services.md`, and add sidebar entry in `config.ts` under `sidebar["/services/"]`.
- **Legal pages** (`terms.md`, `privacy-policy.md`): Apply to all services. Footer links are configured in `config.ts`. Contact form and service pages cross-reference these.
- All pages use VitePress theme variables for styling (e.g., `var(--vp-c-brand)`, `var(--vp-c-divider)`).
- Frontmatter should include `title`, `description`, and `head` meta (keywords, og:title, og:description) for SEO.

## Deployment

GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and deploys on push to `main`. Uses Node 20 + Yarn. Since a custom domain is configured, no `base` path prefix is needed in config.
