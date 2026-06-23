# Spendora

Spendora is a privacy-first, offline-first spending tracker built with Expo, React Native, TypeScript, and Expo Router.

The app runs on the web for local testing and can also be built for iPhone with Expo.

## Features

- Home dashboard with today, week, and month spending totals
- Quick add spending form on the Home screen
- Transaction add, edit, delete, and filtering
- Monthly reports with category pie chart
- PDF/print report export
- Budget setup for daily, weekday, weekend, weekly, and monthly budgets
- Category management
- Light and dark mode support
- Local-only storage

## Requirements

- Node.js
- npm or pnpm
- Expo CLI through `npx expo`
- Xcode if you want to run the iPhone simulator or build for iOS

## Install

```bash
cd /Users/lindsaysong/Desktop/Projects/spendora
pnpm install
```

If you prefer npm:

```bash
npm install
```

## Run On Web

```bash
npm run web -- --port 8090 --host localhost
```

Then open:

```text
http://localhost:8090
```

If port `8090` is busy, use another port:

```bash
npm run web -- --port 8091 --host localhost
```

## Run On iPhone

For the iOS simulator:

```bash
npx expo run:ios
```

For a connected iPhone:

```bash
npx expo run:ios --device
```

You need Xcode installed for iOS builds.

## Build Web Export

```bash
npm run build:web
```

The exported static web files are generated in:

```text
dist/
```

## Typecheck

```bash
npm run typecheck
```

## Storage

- Web preview stores data locally in the browser.
- iPhone/native builds store data in SQLite through `expo-sqlite`.
- No login, cloud sync, analytics, or external spending API is used.
