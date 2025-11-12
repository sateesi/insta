# Codebase Overview and Implementation Guide

## Table of Contents
1. [Use Case and Problem Statement](#use-case-and-problem-statement)
2. [Architecture Overview](#architecture-overview)
3. [Component Breakdown](#component-breakdown)
4. [Component Interactions](#component-interactions)
5. [Implementation Flow](#implementation-flow)
6. [Data Flow Diagrams](#data-flow-diagrams)
7. [Technology Choices](#technology-choices)

---

## Use Case and Problem Statement

### What We're Building
This project is a **minimal Instagram-like social media proof of concept (POC)** that demonstrates a modern, scalable architecture for handling:
- User authentication and authorization
- Image uploads and processing
- Social interactions (follows, likes, comments)
- Real-time feed generation
- Asynchronous background job processing

### Problems We're Solving

1. **Asynchronous Image Processing**: Image resizing is CPU-intensive and should not block API responses. Users shouldn't wait for thumbnails to be generated before their post is created.

2. **Scalable Storage**: Large media files need to be stored separately from the database to maintain performance and enable CDN integration.

3. **Background Job Processing**: Heavy computational tasks (image processing) need to be handled by dedicated workers that can scale independently.

4. **Real-time Social Features**: The system needs to efficiently handle follows, likes, comments, and feed generation with proper relationships and aggregations.

5. **Microservices Architecture**: Demonstrating how different services (API, workers, storage) can work together while remaining decoupled.

---

## Architecture Overview

The application follows a **microservices architecture** with clear separation of concerns:

```
┌─────────────┐
│   Frontend  │  React SPA (Vite + TypeScript + Tailwind)
└──────┬──────┘
       │ HTTP/REST
       ▼
┌─────────────┐
│   Backend   │  Express API (TypeORM + JWT)
└───┬─────┬───┘
    │     │
    │     ├──► PostgreSQL (User data, Posts, Relationships)
    │     │
    │     ├──► Redis (Job Queue for BullMQ)
    │     │
    │     └──► MinIO (Object Storage for Images)
    │
    │
    ▼
┌─────────────┐
│   Worker    │  Background Job Processor (BullMQ + Sharp)
└───┬─────┬───┘
    │     │
    │     ├──► Redis (Consumes Jobs)
    │     │
    │     ├──► MinIO (Reads/Uploads Images)
    │     │
    │     └──► PostgreSQL (Updates Post Records)
```

---

## Component Breakdown

### 1. PostgreSQL Database

**Why it's needed:**
- **Primary data store** for all structured data (users, posts, relationships, interactions)
- Provides ACID guarantees for transactional operations
- Supports complex queries with JOINs for feed generation
- Enables referential integrity for relationships (follows, likes, comments)

**What it stores:**
- `users`: User accounts (email, username, hashed passwords)
- `posts`: Post metadata (caption, media keys, timestamps, author)
- `follows`: Follow relationships between users
- `likes`: Like relationships between users and posts
- `comments`: Comment text, author, post relationships

**Key characteristics:**
- Persistent volume ensures data survives container restarts
- TypeORM handles schema synchronization in development
- UUID primary keys for distributed system compatibility

---

### 2. Redis

**Why it's needed:**
- **Message broker** for BullMQ job queue system
- Enables **asynchronous job processing** without blocking API responses
- Provides **job persistence** and **retry mechanisms**
- Acts as a **cache layer** (potential future use for feed caching)

**What it does:**
- Stores job queues for image processing tasks
- Manages job state (pending, processing, completed, failed)
- Enables horizontal scaling of workers (multiple workers can consume from the same queue)
- Provides job priority and scheduling capabilities

**How it's used:**
- Backend enqueues image processing jobs to Redis
- Worker subscribes to Redis queue and processes jobs
- Jobs are removed after completion to prevent queue bloat

---

### 3. MinIO (S3-Compatible Object Storage)

**Why it's needed:**
- **Separates media storage from database** - databases aren't designed for large binary files
- **Scalable storage** - can handle terabytes of images without impacting database performance
- **S3-compatible API** - easy migration to AWS S3, Google Cloud Storage, or other providers
- **Public URL generation** - enables direct browser access to images without proxying through backend
- **CDN-ready** - can be fronted by a CDN for global distribution

**What it stores:**
- Original uploaded images (`uploads/{userId}/{timestamp}-{random}.{ext}`)
- Thumbnails (`thumbnails/{postId}-thumb.jpg`) - 200x200px
- Medium-sized images (`medium/{postId}-medium.jpg`) - max 800x800px

**Key characteristics:**
- Bucket is set to public-read for direct browser access
- Organized by path prefixes for easy management
- Persistent volume ensures images survive container restarts

---

### 4. Backend API Service

**Why it's needed:**
- **Central API layer** that handles all business logic
- **Authentication and authorization** - JWT-based security
- **Request validation** - ensures data integrity
- **Orchestrates interactions** between database, storage, and job queue

**Key responsibilities:**
1. **Authentication Service** (`authService.ts`):
   - User registration with password hashing (bcryptjs)
   - Login with JWT token generation
   - Token validation middleware

2. **Post Service** (`postService.ts`):
   - Validates uploaded images
   - Uploads original image to MinIO
   - Creates Post record in PostgreSQL
   - Enqueues image processing job to Redis
   - Generates feed with pagination

3. **Storage Service** (`storageService.ts`):
   - Manages MinIO bucket creation and policies
   - Handles file uploads/downloads via S3 SDK
   - Generates public URLs for images

4. **Social Services**:
   - `followService.ts`: Manages follow/unfollow relationships
   - `likeService.ts`: Handles like/unlike operations
   - `commentService.ts`: Manages comment creation and retrieval

5. **Job Queue Integration** (`imageQueue.ts`):
   - Creates BullMQ queue connection to Redis
   - Enqueues image processing jobs with post metadata

**Technology stack:**
- Express.js: HTTP server framework
- TypeORM: Database ORM with PostgreSQL driver
- JWT: Authentication tokens
- BullMQ: Job queue client
- AWS SDK: MinIO/S3 integration
- Express Validator: Request validation

---

### 5. Worker Service

**Why it's needed:**
- **Offloads CPU-intensive tasks** from the API server
- **Scales independently** - can run multiple worker instances
- **Non-blocking** - API responds immediately while worker processes images
- **Resilient** - failed jobs can be retried automatically

**What it does:**
1. **Subscribes to Redis queue** (`imageProcessing` queue)
2. **Downloads original image** from MinIO using the media key
3. **Processes images** using Sharp library:
   - Generates 200x200 thumbnail
   - Generates 800x800 medium image (maintains aspect ratio)
4. **Uploads processed images** back to MinIO
5. **Updates PostgreSQL** Post record with thumbnail and medium keys

**Key characteristics:**
- Runs continuously, waiting for new jobs
- Uses Sharp (native image processing) for performance
- Updates database only after successful processing
- Logs progress for monitoring

**Technology stack:**
- BullMQ: Job queue worker
- Sharp: High-performance image processing
- TypeORM: Database updates
- AWS SDK: MinIO integration

---

### 6. Frontend Service

**Why it's needed:**
- **User interface** for interacting with the application
- **Client-side routing** for navigation
- **State management** for authentication and user data
- **Real-time UI updates** based on API responses

**Key features:**
1. **Authentication**:
   - Login/Signup forms
   - JWT token storage in localStorage
   - Automatic token attachment to API requests

2. **Feed Page**:
   - Displays posts from followed users
   - Shows like counts, comment counts
   - Handles like/unlike interactions
   - Pagination support

3. **Post Creation**:
   - File upload with preview
   - Caption input
   - Multipart form submission

4. **Profile Page**:
   - User posts display
   - Follow/unfollow button
   - User statistics

**Technology stack:**
- React: UI framework
- Vite: Build tool and dev server
- TypeScript: Type safety
- Tailwind CSS: Utility-first styling
- Axios: HTTP client
- React Router: Client-side routing

---

## Component Interactions

### Interaction Flow: Creating a Post

```
1. User uploads image via Frontend
   └─► POST /api/posts (multipart/form-data)
       │
2. Backend receives request
   ├─► Auth middleware validates JWT token
   ├─► Post controller validates file and caption
   │
3. Post Service processes request
   ├─► Validates image file (MIME type, size)
   ├─► Uploads original image to MinIO
   │   └─► Storage Service: PutObjectCommand to MinIO
   │
   ├─► Creates Post record in PostgreSQL
   │   └─► TypeORM: INSERT into posts table
   │
   └─► Enqueues image processing job
       └─► Image Queue: Adds job to Redis queue
           └─► Job data: { postId, mediaKey }
   │
4. Backend responds immediately
   └─► Returns Post object (with null thumbnail/medium keys)
       │
5. Worker picks up job from Redis
   ├─► Downloads original image from MinIO
   │   └─► Storage Service: GetObjectCommand
   │
   ├─► Processes images with Sharp
   │   ├─► Generates 200x200 thumbnail
   │   └─► Generates 800x800 medium image
   │
   ├─► Uploads processed images to MinIO
   │   ├─► Upload thumbnail: thumbnails/{postId}-thumb.jpg
   │   └─► Upload medium: medium/{postId}-medium.jpg
   │
   └─► Updates Post record in PostgreSQL
       └─► TypeORM: UPDATE posts SET thumbnailKey, mediumKey
```

### Interaction Flow: Viewing Feed

```
1. User opens Feed Page
   └─► Frontend: GET /api/posts/feed?page=1&limit=10
       │
2. Backend processes request
   ├─► Auth middleware validates JWT token
   ├─► Post Service: getFeed()
   │   ├─► Queries Follow table for followed users
   │   ├─► Queries Posts table with JOINs
   │   │   ├─► JOIN users (author info)
   │   │   ├─► LEFT JOIN likes (like counts)
   │   │   ├─► LEFT JOIN comments (comment counts)
   │   │   └─► LEFT JOIN likes (user's like status)
   │   │
   │   ├─► Generates public URLs for images
   │   │   └─► Storage Service: getPublicUrl(mediaKey)
   │   │
   │   └─► Returns paginated feed items
   │
3. Frontend renders feed
   └─► Displays posts with images, captions, interactions
```

### Interaction Flow: Authentication

```
1. User submits login form
   └─► POST /api/auth/login
       │
2. Backend processes request
   ├─► Auth Service: login()
   │   ├─► Queries User by email
   │   ├─► Compares password hash (bcryptjs)
   │   ├─► Generates JWT tokens
   │   │   ├─► Access token (short-lived)
   │   │   └─► Refresh token (long-lived)
   │   └─► Returns tokens + user info
   │
3. Frontend stores tokens
   └─► localStorage.setItem('insta-auth', JSON.stringify({...}))
       │
4. Subsequent requests
   └─► Frontend: Attaches Authorization header
       └─► Backend: Auth middleware validates token
```

---

## Implementation Flow

### Phase 1: Infrastructure Setup

1. **Docker Compose Initialization**:
   - PostgreSQL container starts, creates database
   - Redis container starts, ready for connections
   - MinIO container starts, creates data directory

2. **Backend Initialization**:
   - TypeORM connects to PostgreSQL
   - Schema synchronization creates tables (if `synchronize: true`)
   - Storage Service ensures MinIO bucket exists and is public
   - Seed script runs, creating demo users and posts

3. **Worker Initialization**:
   - Connects to Redis queue
   - Subscribes to `imageProcessing` queue
   - Waits for jobs

4. **Frontend Initialization**:
   - Vite dev server starts
   - React app loads
   - Checks localStorage for existing auth

### Phase 2: User Registration/Login

1. **Registration**:
   ```
   User → Frontend Form → POST /api/auth/signup
   → Backend validates → Hash password → Create User → Return JWT
   → Frontend stores token → Redirect to Feed
   ```

2. **Login**:
   ```
   User → Frontend Form → POST /api/auth/login
   → Backend validates credentials → Generate JWT → Return tokens
   → Frontend stores token → Redirect to Feed
   ```

### Phase 3: Post Creation

1. **Upload Flow**:
   ```
   User selects image → Frontend preview → Submit form
   → POST /api/posts (multipart)
   → Backend: Validate file → Upload to MinIO → Create Post record
   → Enqueue job to Redis → Return Post (thumbnail/medium = null)
   → Frontend shows post with original image
   ```

2. **Background Processing**:
   ```
   Worker: Poll Redis → Receive job → Download from MinIO
   → Process with Sharp → Upload thumbnails → Update Post record
   → Job complete → Remove from queue
   ```

3. **Feed Update**:
   ```
   User refreshes feed → GET /api/posts/feed
   → Backend: Query posts → Include thumbnail/medium URLs
   → Frontend: Display optimized images
   ```

### Phase 4: Social Interactions

1. **Follow/Unfollow**:
   ```
   User clicks Follow → POST /api/follow/{userId}
   → Backend: Create/Delete Follow record
   → Frontend: Update UI state
   ```

2. **Like/Unlike**:
   ```
   User clicks Like → POST /api/posts/{postId}/like
   → Backend: Create/Delete Like record
   → Frontend: Update like count and button state
   ```

3. **Comment**:
   ```
   User submits comment → POST /api/posts/{postId}/comments
   → Backend: Create Comment record
   → Frontend: Refresh comments list
   ```

---

## Data Flow Diagrams

### Complete Request Lifecycle: Post Creation

```
┌──────────┐
│  User    │
└────┬─────┘
     │ 1. Upload image + caption
     ▼
┌──────────┐
│ Frontend │  ──► 2. POST /api/posts (multipart)
└────┬─────┘      Headers: Authorization: Bearer <token>
     │
     ▼
┌──────────┐
│ Backend  │
│          │  ──► 3. Auth Middleware: Validate JWT
│          │
│          │  ──► 4. Post Controller: Validate request
│          │
│          │  ──► 5. Post Service:
│          │      ├─► Validate file (MIME type)
│          │      ├─► Generate mediaKey: uploads/{userId}/{timestamp}.jpg
│          │      │
│          │      ├─► 6. Storage Service → MinIO
│          │      │   └─► PutObjectCommand: Upload original image
│          │      │
│          │      ├─► 7. TypeORM → PostgreSQL
│          │      │   └─► INSERT INTO posts (caption, mediaKey, authorId)
│          │      │
│          │      └─► 8. Image Queue → Redis
│          │          └─► BULLMQ: Add job { postId, mediaKey }
│          │
└────┬─────┘
     │ 9. Return Post object (thumbnailKey: null, mediumKey: null)
     ▼
┌──────────┐
│ Frontend │  ──► 10. Display post with original image
└──────────┘

     │
     │ (Asynchronous - happens in background)
     ▼
┌──────────┐
│  Worker  │
│          │  ──► 11. Poll Redis queue
│          │      └─► Receive job { postId, mediaKey }
│          │
│          │  ──► 12. Storage Service → MinIO
│          │      └─► GetObjectCommand: Download original image
│          │
│          │  ──► 13. Sharp Processing:
│          │      ├─► Resize to 200x200 (thumbnail)
│          │      └─► Resize to 800x800 (medium)
│          │
│          │  ──► 14. Storage Service → MinIO
│          │      ├─► Upload thumbnail: thumbnails/{postId}-thumb.jpg
│          │      └─► Upload medium: medium/{postId}-medium.jpg
│          │
│          │  ──► 15. TypeORM → PostgreSQL
│          │      └─► UPDATE posts SET thumbnailKey, mediumKey WHERE id = postId
│          │
└──────────┘
```

### Feed Generation Flow

```
┌──────────┐
│  User    │  ──► Opens Feed Page
└────┬─────┘
     │
     ▼
┌──────────┐
│ Frontend │  ──► GET /api/posts/feed?page=1&limit=10
└────┬─────┘      Headers: Authorization: Bearer <token>
     │
     ▼
┌──────────┐
│ Backend  │
│          │  ──► Auth Middleware: Validate JWT
│          │
│          │  ──► Post Service: getFeed(userId, page, limit)
│          │      │
│          │      ├─► 1. Query Follows → Get followed user IDs
│          │      │   └─► SELECT followerId FROM follows WHERE followingId = userId
│          │      │
│          │      ├─► 2. Query Posts with JOINs
│          │      │   └─► SELECT posts.*, users.username, users.email,
│          │      │       COUNT(DISTINCT likes.id) as likeCount,
│          │      │       COUNT(DISTINCT comments.id) as commentCount,
│          │      │       EXISTS(SELECT 1 FROM likes WHERE ...) as isLiked
│          │      │       FROM posts
│          │      │       JOIN users ON posts.authorId = users.id
│          │      │       LEFT JOIN likes ON posts.id = likes.postId
│          │      │       LEFT JOIN comments ON posts.id = comments.postId
│          │      │       WHERE posts.authorId IN (followedUserIds)
│          │      │       GROUP BY posts.id
│          │      │       ORDER BY posts.createdAt DESC
│          │      │       LIMIT 10 OFFSET 0
│          │      │
│          │      └─► 3. Generate public URLs
│          │          ├─► For each post: getPublicUrl(mediaKey)
│          │          ├─► If thumbnailKey exists: getPublicUrl(thumbnailKey)
│          │          └─► If mediumKey exists: getPublicUrl(mediumKey)
│          │
└────┬─────┘
     │ 4. Return FeedItem[] with pagination metadata
     ▼
┌──────────┐
│ Frontend │  ──► Render posts with images, captions, interactions
└──────────┘
```

---

## Technology Choices

### Why TypeScript?
- **Type safety** reduces runtime errors
- **Better IDE support** with autocomplete and refactoring
- **Self-documenting code** through type definitions
- **Easier maintenance** in large codebases

### Why TypeORM?
- **Type-safe database queries** with TypeScript
- **Entity decorators** for clean model definitions
- **Migration support** for production deployments
- **Multiple database support** (PostgreSQL, MySQL, SQLite)

### Why BullMQ?
- **Redis-backed** job queue with persistence
- **Job retry mechanisms** for resilience
- **Priority queues** for important tasks
- **Horizontal scaling** - multiple workers can process jobs

### Why Sharp?
- **Native performance** - uses libvips (C library)
- **Memory efficient** - streams processing for large images
- **Format support** - JPEG, PNG, WebP, etc.
- **High-quality resizing** with various algorithms

### Why MinIO?
- **S3-compatible** - easy migration to AWS S3
- **Self-hosted** - no vendor lock-in
- **Lightweight** - minimal resource usage
- **Production-ready** - used by many organizations

### Why Docker Compose?
- **Consistent environment** across development/production
- **Service orchestration** - manages dependencies
- **Volume persistence** - data survives restarts
- **Easy scaling** - can add more worker instances

---

## Summary

This codebase demonstrates a **production-ready architecture** for a social media application with:

1. **Separation of concerns**: API, workers, and storage are decoupled
2. **Asynchronous processing**: Heavy tasks don't block user requests
3. **Scalability**: Each component can scale independently
4. **Resilience**: Failed jobs can be retried, data is persisted
5. **Developer experience**: TypeScript, hot reload, comprehensive tooling

The architecture can be extended with:
- **CDN integration** for global image delivery
- **Caching layers** (Redis) for frequently accessed data
- **Message queues** for real-time notifications
- **Microservices** split (auth service, post service, etc.)
- **Kubernetes** for container orchestration at scale

