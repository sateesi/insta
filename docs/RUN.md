# Running the Instagram POC

## Prerequisites

- Docker Desktop (or compatible Docker Engine with Compose v2)
- Optional: Node.js 18+ if you plan to run scripts outside the containers

## Step-by-Step Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url> insta
   cd insta
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Adjust values as needed (defaults work for local Docker).

3. **Start the full stack**
   ```bash
   docker compose up --build
   ```
   This command builds images, installs dependencies, and launches all services. The backend runs the seed script before the dev server starts.

4. **Access the services**
   - Frontend SPA: http://localhost:3000
   - Backend API: http://localhost:4000 (health check at `/health`)
   - MinIO console: http://localhost:9001 (login with `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` from `.env`)
   - MinIO bucket endpoint (public): http://localhost:9000

5. **Inspect logs** (optional)
   ```bash
   docker compose logs -f backend
   docker compose logs -f worker
   docker compose logs -f frontend
   ```

6. **Stop the stack**
   ```bash
   docker compose down
   ```
   Add `-v` to remove persistent volumes if you want a clean slate.

## Useful Commands

- Re-run database seed: `docker compose exec backend npm run seed`
- Execute backend tests: `docker compose exec backend npm test`
- Open a shell in a container: `docker compose exec backend sh`


