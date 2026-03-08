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

This is a VitePress static site. All content lives under `docs/`:

- `docs/.vitepress/config.ts` — VitePress config (nav, sidebar, meta tags, footer)
- `docs/index.md` — Home page (uses VitePress `layout: home` with hero and features)
- `docs/contact.md` — Contact form with inline Vue `<script setup>` that POSTs to a Google Form
- `docs/news/index.md` — News listing page with inline Vue script for article data
- `docs/news/posts/` — Individual news articles as Markdown

Pages (`about.md`, `services.md`, `company.md`, `privacy-policy.md`) are plain Markdown with YAML frontmatter for SEO meta tags.

## Content Conventions

- News articles go in `docs/news/posts/` as `.md` files with frontmatter (`title`, `description`, `head` meta)
- After adding a news post, manually update the `recentNews` array in `docs/news/index.md`
- Pages use VitePress theme variables (e.g., `var(--vp-c-brand)`, `var(--vp-c-divider)`) for styling

## Deployment

GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and deploys on push to `main`. Uses Node 20 + Yarn. Since a custom domain is configured, no `base` path prefix is needed in config.
