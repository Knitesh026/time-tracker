# Break Tracker

> A web app that tracks work hours and breaks and calculates net login time.

![Next.js](https://img.shields.io/badge/Next.js-App%20Router-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white)

## Overview

Break Tracker helps staff monitor their working day. A central display shows total staff time, total break time and net login hours. Users start and stop the timer and toggle break types to record how time is spent.

## Features

- Start/stop work timer
- Break toggles: bio, lunch, session, feedback and downtime
- Live totals for staff time, break time and net login hours
- Responsive single-page interface

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js (App Router), React, TypeScript |
| Styling | Tailwind CSS, shadcn/ui (Radix UI) |

## Getting started

### Prerequisites

- Node.js 18 or later
- npm (or pnpm/bun)

### Install and run

```bash
git clone https://github.com/Knitesh026/time-tracker.git
cd time-tracker
npm install
npm run dev
```

The app runs at `http://localhost:3000` by default.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Lint the code |

## Project structure

```
app/            Next.js App Router (layout, page, globals)
components/     UI components (shadcn/ui)
hooks/          Custom hooks
lib/            Utilities
public/         Static assets
```

## Deployment

Build with `npm run build` and deploy the output to any static or Node host such as Netlify or Vercel.

## License

All rights reserved.
