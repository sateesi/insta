# Testing the Instagram POC

## Automated Testing (Backend)

1. Ensure the Docker stack is running (Postgres/Redis are required).
2. Execute Jest tests inside the backend container:
   ```bash
   docker compose exec backend npm test
   ```
3. The initial suite (`src/tests/auth.test.ts`) validates signup flow via Supertest. Add additional tests alongside it as needed.

## Manual End-to-End Testing

### 1. Authentication
- Use the frontend login/signup forms or curl/Postman examples (see README/`infra/postman`).
- Confirm new users receive a JWT and the SPA persists it (check browser `localStorage`).

### 2. Feed Display
- Visit http://localhost:3000 and verify the seeded posts appear with placeholder images and captions.
- Ensure like/comment counts render correctly.

### 3. Post Creation & Worker Pipeline
1. From the SPA, use the “Create Post” form to upload a local image and caption.
2. Observe status message (“Post created! Processing image…”).
3. Tail worker logs to confirm job completion:
   ```bash
   docker compose logs -f worker
   ```
4. Refresh the feed; the new post should display with processed thumbnail/medium sizes shortly after.

### 4. Social Interactions
- **Follow/Unfollow:** Visit another user’s profile, toggle follow state, and confirm button/metrics update.
- **Like/Unlike:** Toggle likes on posts; counts should adjust immediately.
- **Comments:** Optionally hit `POST /api/comments/:postId` and `GET /api/comments/:postId` via curl/Postman to verify comment creation/listing.

## Troubleshooting Tips

- Rerun seeding if data seems missing: `docker compose exec backend npm run seed`.
- Reset the environment by stopping containers and clearing volumes: `docker compose down -v`.
- Check MinIO console for uploaded media if images fail to render.
- Verify `.env` matches exposed ports/hosts if services are unreachable.


