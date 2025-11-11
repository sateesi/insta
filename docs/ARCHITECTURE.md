# Architecture Overview

## High-Level Components

- **Frontend (`frontend/`)** – Vite + React + TypeScript SPA styled with Tailwind. Handles client-side routing, authentication, feed rendering, post creation, and profile interactions. Uses Axios for API calls with JWT header handling managed via `AuthContext`.
- **Backend (`backend/`)** – Express + TypeORM service exposing REST endpoints for auth, posts, follows, likes, and comments. Integrates with PostgreSQL for persistence, MinIO for media storage, Redis/BullMQ for background jobs, and JWT/bcrypt for authentication.
- **Worker (`worker/`)** – Node.js + BullMQ worker that processes image resizing jobs using Sharp. Pulls from Redis, reads/writes to MinIO, and updates Postgres records.
- **Infrastructure** – Docker Compose orchestrates Postgres, Redis, MinIO, backend, worker, and frontend services with persistent volumes and shared networking.

## Backend Structure

- `src/config/` – Environment loader (`env.ts`) and TypeORM datasource (`data-source.ts`).
- `src/entities/` – Domain models (`User`, `Post`, `Follow`, `Like`, `Comment`) extending a base entity with UUID IDs and timestamps.
- `src/services/` – Business logic modules for auth, posts (including MinIO uploads and queue dispatch), follows, likes, comments, user lookups, and S3 helpers.
- `src/controllers/` & `src/routes/` – HTTP controllers and Express routers, using `express-validator` for validation and a centralized error middleware.
- `src/queues/` – BullMQ queue configuration for image processing jobs.
- `src/seed/` – Seed script creating demo users, follow relationships, and placeholder posts.
- `src/tests/` – Jest/Supertest suite example for the auth endpoints.

## Worker Flow

1. Subscriber (`Worker`) listens on the `imageProcessing` queue.
2. For each job, downloads the original media from MinIO.
3. Uses Sharp to produce a 200x200 thumbnail and an 800px-bounded medium image.
4. Uploads resized images to MinIO and updates the associated `Post` record with new keys.

## Frontend Flow

- **Auth**: `AuthContext` persists JWT + user info to `localStorage` and attaches the token to Axios requests.
- **Routing**: React Router guards authenticated routes (feed/profile) via a `PrivateRoute` wrapper.
- **Feed**: `FeedPage` fetches `/api/posts/feed`, renders posts with like counts, and handles like/unlike mutations.
- **Post Creation**: Multipart upload to `/api/posts`, triggering backend storage and worker processing.
- **Profile**: Displays user posts, follow/unfollow actions, and aggregated metrics pulled from backend services.

## Data Flow Summary

1. User uploads an image via frontend.
2. Backend validates file, stores original in MinIO, creates `Post` row, and enqueues job.
3. Worker resizes image, writes thumbnails, updates `Post` record.
4. Frontend polls feed/profile endpoints showing original or resized media once available.


