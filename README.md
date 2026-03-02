# Sagrada Counter

Sagrada Counter is a mobile-first web app that helps score a Sagrada board.

## Features

- 4x5 board entry with window pattern restrictions
- Die placement, rule validation, and score breakdown
- Public/private objective selection and favor token counter
- Photo capture/upload flow to prefill board data with local image processing
- Internationalization with English and Spanish translations

## Language

- Default language is Spanish (`es`)
- Language preference is persisted in `localStorage`
- A `LanguageSwitcher` component is implemented and ready to be shown in the header when enabled

## Setup

```bash
npm install
npm run dev
```

No API key is required for photo processing.

## Scripts

```bash
npm run lint
npm run build
```
