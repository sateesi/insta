## Instagram POC

This repository contains a minimal Instagram-like proof of concept built with a TypeScript stack and containerized with Docker Compose. It includes:

- React (Vite) + Tailwind SPA frontend
- Express + TypeORM backend API with JWT authentication
- BullMQ worker for asynchronous image processing using Sharp
- PostgreSQL, Redis, and MinIO services

### Architecture Overview

- `frontend`: Vite React app that handles authentication, feed display, profile, and post creation. Communicates with the backend via REST.
- `backend`: Express API providing auth, posts, follows, likes, and comments. Uses TypeORM for PostgreSQL models, MinIO for storage, and queues jobs to Redis.
- `worker`: BullMQ-powered worker consuming image processing jobs, resizing uploads with Sharp, and updating post records.
- `postgres`, `redis`, `minio`: Provided via Docker Compose. MinIO console is exposed for inspecting uploaded media.

### Prerequisites

- Docker Desktop (or compatible Docker + Docker Compose v2)
- Node.js 18+ (optional, for running scripts outside containers)

### Getting Started

1. `cp .env.example .env` and adjust values if needed (defaults should work for local development).
2. `docker compose up --build`
3. Visit the services:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - MinIO console: http://localhost:9001 (login with `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`)

### Seeding Data

After containers start, the backend automatically runs the seed script (via `npm run seed` inside the backend service) which:

- Inserts three demo users and establishes follow relationships
- Uploads placeholder images to MinIO
- Creates sample posts referencing the uploaded images

You can re-run the seed manually:

```
docker compose exec backend npm run seed
```

### API Examples

Use the provided curl snippets or import the Postman collection in `infra/postman/insta.postman_collection.json` to interact with the API.

```
# Register
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","username":"demo","password":"Password123!"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"Password123!"}'

# Create Post (multipart)
curl -X POST http://localhost:4000/api/posts \
  -H "Authorization: Bearer <token>" \
  -F "caption=Hello world" \
  -F "image=@/path/to/image.jpg"
```

### Development Notes

- The backend uses `express-validator` for request validation and `jsonwebtoken` for auth.
- TypeORM is configured in development mode with `synchronize: true` for simplicity. For production, use migrations under `backend/src/migrations/`.
- MinIO buckets are created at startup and set to public-read. Adjust `MINIO_PUBLIC_URL` in `.env` if you change ports/hostnames, and extend `backend/src/services/storageService.ts` for presigned URLs, CDN integration, or signed download URLs.
- Worker logs are available via `docker compose logs -f worker`.

### Testing

- Run backend unit tests: `docker compose exec backend npm test`

### Extending the POC

- Implement refresh token rotation and blacklist.
- Add presigned upload URLs to offload files directly to MinIO/S3.
- Introduce CDN caching for media endpoints and fanout-on-write for the feed.

### Repository Structure

```
.
├── .env.example
├── README.md
├── docker-compose.yml
├── infra/
│   ├── db-init.sql
│   └── postman/
│       └── insta.postman_collection.json
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.ts
│   ├── ormconfig.ts
│   └── src/
│       ├── app.ts
│       ├── index.ts
│       ├── config/
│       │   ├── data-source.ts
│       │   └── env.ts
│       ├── entities/
│       │   ├── BaseEntity.ts
│       │   ├── Comment.ts
│       │   ├── Follow.ts
│       │   ├── Like.ts
│       │   ├── Post.ts
│       │   └── User.ts
│       ├── middleware/
│       │   └── auth.ts
│       ├── routes/
│       │   ├── authRoutes.ts
│       │   ├── commentRoutes.ts
│       │   ├── followRoutes.ts
│       │   ├── likeRoutes.ts
│       │   ├── postRoutes.ts
│       │   └── userRoutes.ts
│       ├── controllers/
│       │   ├── authController.ts
│       │   ├── commentController.ts
│       │   ├── followController.ts
│       │   ├── likeController.ts
│       │   ├── postController.ts
│       │   └── userController.ts
│       ├── services/
│       │   ├── authService.ts
│       │   ├── commentService.ts
│       │   ├── followService.ts
│       │   ├── likeService.ts
│       │   ├── postService.ts
│       │   ├── storageService.ts
│       │   └── userService.ts
│       ├── queues/
│       │   └── imageQueue.ts
│       ├── utils/
│       │   ├── errorHandler.ts
│       │   ├── logger.ts
│       │   └── password.ts
│       ├── seed/
│       │   └── seed.ts
│       └── tests/
│           └── auth.test.ts
├── worker/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── config/
│       │   ├── data-source.ts
│       │   └── env.ts
│       ├── jobs/
│       │   └── imageProcessor.ts
│       ├── entities/
│       │   └── Post.ts
│       └── services/
│           └── storage.ts
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── api/
│       │   └── client.ts
│       ├── context/
│       │   └── AuthContext.tsx
│       ├── components/
│       │   ├── Feed.tsx
│       │   ├── Layout.tsx
│       │   ├── LoginForm.tsx
│       │   ├── SignupForm.tsx
│       │   ├── PostCreator.tsx
│       │   └── ProfileView.tsx
│       └── pages/
│           ├── FeedPage.tsx
│           ├── LoginPage.tsx
│           ├── ProfilePage.tsx
│           └── SignupPage.tsx
└── docs/
    ├── ARCHITECTURE.md
    ├── RUN.md
    └── TESTING.md
```

### Verification Checklist

- [ ] Register a user
- [ ] Login and obtain JWT
- [ ] Create a post with an image
- [ ] Wait for worker to process thumbnails (check worker logs)
- [ ] Refresh feed to view new post with processed thumbnails


