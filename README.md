# Meeting Room Booking

Simple UI for booking a meeting room during the work day (09:00–18:00).

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- Ant Design
- Redux Toolkit / RTK Query
- React Hook Form + Zod

## How to run

```bash
pnpm install
pnpm dev
```

```bash
pnpm build
pnpm preview
```

## What’s included

- Pick a date and see bookings for that day (timeline + list)
- Create, edit, and delete bookings
- Form validation on the client (Zod)
- Same rules checked again in a mock API layer
- Handles loading / empty / error states
- If the server returns a conflict (409), the form keeps the user’s input and the list refreshes

## Business rules

- Start and end must be inside 09:00–18:00
- Start must be before end
- Duration between 30 minutes and 2 hours
- Bookings can’t overlap (touching is fine, e.g. 10:00–11:00 and 11:00–12:00)
- No booking in the past
- When editing, the current booking doesn’t conflict with itself

## Project structure

```text
src/
├── api/                 # RTK Query + store
│   └── bookings-api-ts/
├── mocks/bookings/      # in-memory mock API
├── components/          # shared UI wrappers
└── pages/booking/       # page + form + timeline
```

The UI talks to RTK Query. Right now `src/api/baseQuery.ts` uses an in-memory mock. To use a real API later, swap it for `fetchBaseQuery({ baseUrl: '/api' })`.

Endpoints:

- `GET /api/bookings?date=YYYY-MM-DD`
- `POST /api/bookings`
- `PATCH /api/bookings/:id`
- `DELETE /api/bookings/:id`

## Not done yet

- Deployed demo link
- Tests
- Recurring bookings

## Time spent

About 5 hours
