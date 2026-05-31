# CineMente — Frontend

> Part of the CineMente Final Degree Project · Universitat de Girona · June 2026  
> Author: **Guillem Salguero Montes**

React frontend for CineMente, a natural language movie recommendation system. The interface lets users search for movies by describing what they feel like watching, manage their personal lists, and interact with other users.

---

## Table of Contents

- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Key implementation details](#key-implementation-details)
- [Related repositories](#related-repositories)

---

## Tech stack

| | |
|--|--|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Animations | Framer Motion |
| State management | React Context + custom hooks |
| HTTP | Fetch API (centralised in `src/lib/backend.ts`) |

---

## Getting started

### Prerequisites

- Node.js 18+
- The user backend (Spring Boot) running at `http://localhost:8080`
- The AI engine (FastAPI) running at `http://localhost:8001`

### Install and run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

### Environment variables

Create a `.env` file at the root:

```env
VITE_API_URL=http://localhost:8080
VITE_AI_URL=http://localhost:8001
```

---

## Project structure

```
src/
├── components/         # UI components (cards, modals, navigation...)
├── hooks/              # Custom hooks (useMovieSearch, useAuth...)
├── contexts/           # React Contexts (AuthContext, I18nContext)
├── lib/
│   ├── backend.ts      # Centralised API adapter (auth, movies, recommendations)
│   └── utils.ts
├── pages/              # Route-level components
└── i18n/               # Translation files (ES, CA, DE, FR)
```

---

## Key implementation details

**Centralised API layer** — All communication with both backends goes through `src/lib/backend.ts`, which normalises responses to internal types (e.g. converts movie slugs like `m/ex_machina_2015` to readable titles).

**Progressive pagination** — A single request fetches 12 results, but only 4 are shown initially. The rest are revealed with "Load more" without any additional request, improving perceived performance.

**LRU cache + inflight deduplication** — Movie detail data is cached in memory and persisted to `sessionStorage`. Concurrent requests for the same resource are deduplicated into a single HTTP call.

**Authentication** — Stateless JWT-based auth managed via `AuthContext`. Tokens are stored in `localStorage` and refreshed transparently on the first authenticated request.

**Internationalisation** — Custom i18n implementation supporting 4 languages (Catalan, Spanish, German, French) with no external dependencies. Language is auto-detected from `navigator.languages` with fallback to Spanish.

---

## Related repositories

| Service | Repository |
|---------|-----------|
| AI engine (FastAPI) | [Recomenador](https://github.com/GuillemSalguero/Recomenador) |
| Evaluation suite | [Testing-Recomenador](https://github.com/GuillemSalguero/Testing-Recomenador) |
| User backend (Spring Boot) | [https://github.com/GuillemSalguero/cinementeWs]  |

---

*Academic project — Universitat de Girona, June 2026.*
