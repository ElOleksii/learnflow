# Learnflow API

Personal learning system - an AI-powered study planner. Learnflow lets users organize what they want to learn into **subjects**, then uses Google Gemini to generate a structured **roadmap of topics** (with estimated effort and prerequisites) for each subject. Topic progress is tracked and, when a topic is marked done, a spaced-repetition **review** is scheduled.

Built with [NestJS](https://nestjs.com/), [Prisma](https://www.prisma.io/) (PostgreSQL), and the [Google Gen AI SDK](https://ai.google.dev/).

## Features

- **JWT authentication** - register/login with bcrypt-hashed passwords and bearer-token auth.
- **Subjects** - full CRUD over the things a user is learning.
- **AI roadmap generation** - generate an ordered list of topics for a subject via Gemini (`gemini-2.5-flash`), including descriptions, estimated hours, and topic prerequisites.
- **Topic progress tracking** - update topic status (`NOT_STARTED`, `IN_PROGRESS`, `DONE`, `NEEDS_REVIEW`).
- **Spaced repetition** - marking a topic `DONE` creates a `Review` record with an ease factor / interval / repetition count and a next-review date.
- **Swagger docs** - interactive API documentation out of the box.

## Tech Stack

| Concern    | Choice                                  |
| ---------- | --------------------------------------- |
| Framework  | NestJS 11                               |
| Language   | TypeScript                              |
| Database   | PostgreSQL via Prisma 7 (`pg` adapter)  |
| Auth       | `@nestjs/jwt` + bcrypt                  |
| AI         | `@google/genai` (Gemini)                |
| Validation | `class-validator` / `class-transformer` |
| API docs   | `@nestjs/swagger`                       |
| Scheduling | `@nestjs/schedule`                      |

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- A PostgreSQL database
- A Google Gemini API key

### Installation

```bash
npm install
```

### Environment variables

Create a `.env` file in the project root:

```env
# Server
PORT=3000
FRONTEND_URL=http://localhost:5173 # For CORS

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/learnflow

# Auth
JWT_SECRET=your-jwt-secret
BCRYPT_SALT_ROUNDS=10

# AI
GEMINI_KEY=your-gemini-api-key
```

### Database setup

Apply migrations and generate the Prisma client:

```bash
npx prisma migrate deploy   # or: npx prisma migrate dev
npx prisma generate
```

The generated client is output to `generated/prisma`.

### Running the app

```bash
npm run start:dev    # watch mode
npm run start        # standard
npm run start:prod   # from compiled dist/
```

The API is served under the global prefix **`/api/v1`** (e.g. `http://localhost:3000/api/v1`).
Interactive Swagger docs are available at **`http://localhost:3000/api/docs`**.

## API Overview

All routes are prefixed with `/api/v1`. Everything except `auth/*` requires an `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint         | Description                        |
| ------ | ---------------- | ---------------------------------- |
| POST   | `/auth/register` | Create an account, returns a token |
| POST   | `/auth/login`    | Log in, returns an access token    |

### Users

| Method | Endpoint             | Description              |
| ------ | -------------------- | ------------------------ |
| GET    | `/users/me`          | Get current user profile |
| PATCH  | `/users/me`          | Update name / email      |
| PATCH  | `/users/me/password` | Update password          |
| DELETE | `/users/me`          | Delete current account   |

### Subjects

| Method | Endpoint                | Description                                                 |
| ------ | ----------------------- | ----------------------------------------------------------- |
| GET    | `/subjects`             | List the current user's subjects                            |
| GET    | `/subjects/:id`         | Get a single subject                                        |
| POST   | `/subjects`             | Create a subject                                            |
| PATCH  | `/subjects/:id`         | Update a subject                                            |
| DELETE | `/subjects/:id`         | Delete a subject                                            |
| GET    | `/subjects/:id/topics`  | List topics for a subject                                   |
| GET    | `/subjects/:id/roadmap` | Generate an AI roadmap of topics (replaces existing topics) |

### Topics

| Method | Endpoint             | Description             |
| ------ | -------------------- | ----------------------- |
| PATCH  | `/topics/:id/status` | Update a topic's status |

## Data Model

- **User** - owns subjects, schedule items, and reviews; tracks `streakDays` / `lastStudyDate`.
- **Subject** - a learning goal (`ACTIVE` / `PAUSED` / `COMPLETED`), belongs to a user, has many topics.
- **Topic** - a unit of study within a subject with `estimatedHours`, an `order`, a status, and self-referential **prerequisites**.
- **Review** - 1:1 with a topic; holds spaced-repetition state (`easeFactor`, `interval`, `repetitions`, `nextReviewDate`).
- **ScheduleItem** - links a topic to a user with a scheduled date and status (`WAIT` / `COMPLETED`).

See [`prisma/schema.prisma`](prisma/schema.prisma) for the full schema.

## Scripts

| Script               | Description             |
| -------------------- | ----------------------- |
| `npm run start:dev`  | Start in watch mode     |
| `npm run start`      | Start the server        |
| `npm run start:prod` | Run the compiled build  |
| `npm run build`      | Compile to `dist/`      |
| `npm run lint`       | Lint and auto-fix       |
| `npm run format`     | Format with Prettier    |
| `npm run test`       | Run unit tests          |
| `npm run test:e2e`   | Run end-to-end tests    |
| `npm run test:cov`   | Run tests with coverage |

## Project Structure

```
src/
├── auth/        # Registration, login, JWT guard
├── users/       # Profile management
├── subjects/    # Subject CRUD
├── topics/      # Topic status + roadmap orchestration
├── ai/          # Gemini integration & prompt
├── prisma/      # Prisma service/module
├── common/      # Shared types & decorators
└── main.ts      # Bootstrap (CORS, validation, Swagger)
prisma/          # Schema & migrations
```
