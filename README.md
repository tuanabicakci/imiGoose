# imiGoose

A mobile companion app for navigating Canadian immigration — built with Expo
and React Native. Originally prototyped as a native Swift app and ported to
Expo Router.

## Features

- **CRS calculator** — score your Express Entry profile (age, education,
  language, work experience) against the Comprehensive Ranking System.
- **Pathways** — step-by-step guidance through immigration streams (Federal
  Skilled Worker, PNP, Canadian Experience Class, Startup Visa, and more),
  with progress tracked per user.
- **Document tracker** — keep tabs on the paperwork each pathway needs.
- **Community forum** — post questions and discuss with other applicants.
- **Assistant chat** — quick answers to common Express Entry questions (CRS,
  PNP, language tests, the draw pool).
- **News feed** — pulls official IRCC updates and Canadian immigration news.
- **Accounts** — email/password auth with profile and stream selection.

## Tech stack

- [Expo](https://expo.dev) / [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routing)
- React Native + TypeScript
- [Supabase](https://supabase.com) (Postgres, auth, row-level security)
- AsyncStorage as an offline fallback for community content

## Getting started

```bash
npm install
cp .env.example .env   # then fill in your Supabase project (see below)
npx expo start
```

From the Expo CLI output you can launch the app in a development build, an
Android emulator, an iOS simulator, or [Expo Go](https://expo.dev/go).

### Backend setup

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env` and fill in your project's URL and
   publishable (anon) key from **Settings → API**.
3. Restart the dev server (`npx expo start`) so the new env vars load.

The forum falls back to on-device storage if Supabase is unreachable, so the
app stays usable offline.

## Project structure

```
app/          screens, using Expo Router's file-based routing
components/   shared UI (headers, buttons, form fields, pickers)
context/      auth, chat, and forum React contexts
lib/          Supabase client and domain libraries (pathways, tasks)
services/     data layer — CRS calculation, pathways, forum, news, profile
types/        shared TypeScript types
```

## License

MIT — see [LICENSE](LICENSE).
