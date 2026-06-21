# Tuen Mun Pathfinder Mobile App

Expo React Native app for [tuenmunpathfinder.com](https://tuenmunpathfinder.com).

## Features

| Tab | Auth |
|-----|------|
| 首頁 — dashboard (verse, next event, notices) | Public |
| 活動 — upcoming list + calendar | Public |
| 通告 — parent notices & PDFs | Public |
| 更多 — 通知, 相簿, 聯絡, 登入 | Public |

Hidden stack routes under tabs: **通知**, **相簿** (Clerk login), **聯絡**.

Push notifications register on app launch via `/api/register-push`. Received notifications appear in the **通知** tab.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

   Set `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` to the same Clerk publishable key used by the [website repo](https://github.com/kalong2008/tuen-mun-pathfinder).

3. Start the dev server:

   ```bash
   npx expo start
   ```

## API

Data is loaded from the production website APIs:

- `GET /api/calendar` — calendar events
- `GET /api/notices` — notices
- `GET /api/photo-links` — gallery list
- `POST /api/send` — contact form
- `GET /api/bible/cached` — daily verse on home

Override the base URL with `EXPO_PUBLIC_API_BASE_URL` for local development against the Next.js site.

## Design system

Shared UI lives under `components/ui/` and theme tokens under `constants/theme.ts`:

- `Screen`, `Card`, `Button`, `TextField`, `SectionHeader`, `Badge`, `EmptyState`, `LoadingView`, `HeroBanner`, `ClubCard`
- `useAppTheme()` hook for colors, spacing, and typography
- Brand colors for 前鋒會 / 幼鋒會 preserved via `TARGET_COLORS`


Uses [EAS Build](https://docs.expo.dev/build/introduction/). See `eas.json` for build profiles.

```bash
npx eas build --profile development
```
