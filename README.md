<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

<p align="center">
  <strong>Eskalate News Platform</strong> — A modern and scalable news publishing API built with NestJS and Prisma ORM.
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" />
  <img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" />
  <img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" />
</p>

## Overview

**Eskalate News Platform** is a full-featured backend API for a news and content publishing system.  
It covers **article management, editorial workflows, categories, tags, comments, reactions, bookmarks, media uploads, user follows, and newsletter subscriptions**, built with **NestJS**, **Prisma**, and **PostgreSQL**.

The system follows a modular architecture that ensures scalability, maintainability, and clean separation of concerns.

---

## Key Features

### User Management & Authentication

- Secure JWT-based authentication with refresh token support
- Role-based access (`reader`, `author`, `editor`, `admin`)
- Email verification and account activation
- User profiles with bio and avatar

### Article Management

- Full article lifecycle: `draft` → `pending_review` → `published` / `rejected` / `archived`
- Articles linked to **categories** and **tags**
- Cover image, reading time estimate, view counter, and featured flag
- Hierarchical categories (parent/child relationships)
- Many-to-many tag association via `ArticleTag`

### Comments

- Threaded (nested) comment system
- Comment approval workflow (`isApproved` flag)
- Cascading deletes tied to article and user

### Reactions & Engagement

- Polymorphic `Like` model targeting either **articles** or **comments**
- `Bookmark` system for saving articles per user
- User **follow/unfollow** relationships (follower ↔ following)

### Media

- Media uploads linked to uploaders and optionally to articles
- Supports `image`, `video`, and `document` types
- Tracks filename and file size in bytes

### Newsletter

- Newsletter subscriptions (linked or anonymous)
- Supports both registered users and guest email subscriptions

---

## Tech Stack

| Layer                | Technology                   |
| -------------------- | ---------------------------- |
| **Framework**        | [NestJS](https://nestjs.com) |
| **ORM**              | [Prisma](https://prisma.io)  |
| **Database**         | PostgreSQL                   |
| **Auth**             | JWT (access + refresh tokens)|
| **File Storage**     | Cloudinary                   |
| **Containerization** | Docker                       |
| **Language**         | TypeScript                   |

---

## Database Models Overview

| Domain              | Models                                        |
| ------------------- | --------------------------------------------- |
| **User System**     | `User`, `Follow`                              |
| **Content**         | `Article`, `Category`, `Tag`, `ArticleTag`    |
| **Engagement**      | `Comment`, `Like`, `Bookmark`                 |
| **Media**           | `Media`                                       |
| **Newsletter**      | `NewsletterSubscription`                      |

### Enums

| Enum              | Values                                                        |
| ----------------- | ------------------------------------------------------------- |
| `UserRole`        | `reader`, `author`, `editor`, `admin`                         |
| `ArticleStatus`   | `draft`, `pending_review`, `published`, `archived`, `rejected`|
| `MediaType`       | `image`, `video`, `document`                                  |
| `ReactionTarget`  | `article`, `comment`                                          |

---

## Project Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/eskalate_news"
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=1d
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRATION=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

PORT=3000
NODE_ENV=development
```

### 3. Setup Prisma

```bash
# Generate Prisma client
pnpm run generate

# Run migrations
pnpm run migrate

# Seed database with sample data
pnpm run db:seed

# Open Prisma Studio (optional)
pnpm run studio
```

#### Available Scripts

| Command                | Description                                 |
| ---------------------- | ------------------------------------------- |
| `pnpm run build`       | Build project (includes NestJS compilation) |
| `pnpm run format`      | Format code using Prettier                  |
| `pnpm run start`       | Start the application                       |
| `pnpm run start:dev`   | Start in development mode (with watch)      |
| `pnpm run start:debug` | Start with debugging mode                   |
| `pnpm run start:prod`  | Start production build                      |
| `pnpm run lint`        | Run ESLint and auto-fix issues              |
| `pnpm run test`        | Run all tests                               |
| `pnpm run test:watch`  | Run tests in watch mode                     |
| `pnpm run test:cov`    | Generate test coverage report               |
| `pnpm run test:debug`  | Debug Jest tests                            |
| `pnpm run test:e2e`    | Run end-to-end tests                        |
| `pnpm run migrate`     | Apply database migrations (dev)             |
| `pnpm run deploy`      | Apply database migrations (production)      |
| `pnpm run studio`      | Open Prisma Studio                          |
| `pnpm run generate`    | Generate Prisma client                      |
| `pnpm run reset`       | Reset and reapply database migrations       |
| `pnpm run seed`        | Seed database with sample data              |
| `pnpm run db:seed`     | Seed database using Prisma CLI              |

---

## Running the Application

### Development Mode

```bash
pnpm run start:dev
```

### Production Mode

```bash
pnpm run build
pnpm run start:prod
```

---

## Testing

```bash
# Run unit tests
pnpm run test

# Run e2e tests
pnpm run test:e2e

# Generate test coverage
pnpm run test:cov
```

---

## API Documentation

After running the app, access Swagger UI at:

```
http://localhost:3000/api
```

---

## Support

📧 muhozajohn4@gmail.com

Developed by John Muhoza

## License

This project is MIT licensed.
