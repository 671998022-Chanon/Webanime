# Nexus Anime — API Specification

> **Version:** v1.0.0
> **Status:** Authoritative Contract
> **Date:** 2026-06-23
> **Author:** Tech Lead
> **Milestone:** M2 (Sprints 2–8)

---

## Table of Contents

1. [Conventions & Foundations](#1-conventions--foundations)
2. [Authentication](#2-authentication)
3. [Users](#3-users)
4. [Anime / Catalog](#4-anime--catalog)
5. [Episodes](#5-episodes)
6. [Search](#6-search)
7. [Watchlists](#7-watchlists)
8. [Favorites](#8-favorites)
9. [Reviews](#9-reviews)
10. [Comments](#10-comments)
11. [Admin](#11-admin)
12. [Webhooks](#12-webhooks)
13. [Appendices](#13-appendices)

---

## 1. Conventions & Foundations

### 1.1 Base URL

| Environment | Base URL |
|-------------|----------|
| Production | `https://nexus-anime.com` |
| Staging | `https://staging.nexus-anime.com` |
| Development | `http://localhost:3000` |

All versioned endpoints are prefixed with `/api/v1/`. The current API version is `v1`.

### 1.2 Request/Response Envelope

Every response — success or error — wraps its payload in a standard envelope.

**Success Envelope:**

```json
{
  "data": {},
  "meta": {
    "requestId": "req_abc123def456",
    "version": "v1"
  }
}
```

**Error Envelope:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  },
  "meta": {
    "requestId": "req_abc123def456",
    "version": "v1"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data` | `T \| null` | Response payload (null on error) |
| `error` | `object \| null` | Error details (null on success) |
| `error.code` | `string` | Machine-readable error code |
| `error.message` | `string` | Human-readable error message |
| `error.details` | `array` | Field-level validation errors (may be empty) |
| `error.details[].field` | `string \| null` | Field path (null for general errors) |
| `error.details[].message` | `string` | Field-level error description |
| `meta.requestId` | `string` | Unique request identifier for tracing |
| `meta.version` | `string` | API version that produced the response |

### 1.3 Error Codes Reference

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `VALIDATION_ERROR` | 400 | Input failed Zod validation |
| `UNAUTHORIZED` | 401 | Missing or invalid session |
| `FORBIDDEN` | 403 | Valid session, insufficient permission |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Duplicate resource |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server failure |

### 1.4 Pagination

The API supports both **cursor-based** and **offset-based** pagination. Cursor is the default and preferred method.

**Cursor-Based Pagination Request:**

```
GET /api/v1/titles?cursor=eyJpZCI6InV1aWQtMTIzIn0&limit=20
```

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `cursor` | `string` | No | — | Opaque cursor from previous response |
| `limit` | `integer` | No | 20 | Page size (1–100) |

**Cursor-Based Pagination Response:**

```json
{
  "data": [...],
  "meta": {
    "requestId": "req_abc123",
    "version": "v1"
  },
  "pagination": {
    "nextCursor": "eyJpZCI6InV1aWQtNDU2In0",
    "hasNextPage": true,
    "limit": 20
  }
}
```

**Offset-Based Pagination Request:**

```
GET /api/v1/titles?page=2&limit=20
```

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | `integer` | No | 1 | Page number (1-indexed) |
| `limit` | `integer` | No | 20 | Page size (1–100) |

**Offset-Based Pagination Response:**

```json
{
  "data": [...],
  "meta": {
    "requestId": "req_abc123",
    "version": "v1"
  },
  "pagination": {
    "currentPage": 2,
    "totalPages": 10,
    "totalItems": 200,
    "limit": 20,
    "hasNextPage": true
  }
}
```

### 1.5 Rate Limiting

All `/api/v1/*` endpoints are rate-limited to **100 requests per 15-minute window per IP**.

Rate limit headers are included in every response:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests per window |
| `X-RateLimit-Remaining` | Requestss remaining in current window |
| `X-RateLimit-Reset` | Unix timestamp when the window resets |

When the limit is exceeded:

```json
// HTTP 429
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please retry after 899 seconds.",
    "details": []
  },
  "meta": { "requestId": "req_abc123", "version": "v1" }
}
```

### 1.6 Authentication

Authentication is session-based via **HTTP-only cookies** containing a JWT issued by Auth.js v5.

| Cookie | Attributes | Description |
|--------|-----------|-------------|
| `__Host-nexus-session` | `HttpOnly; Secure; SameSite=Lax; Path=/` | Session JWT |

The session cookie is automatically sent by the browser. API clients must include `credentials: "same-origin"` (or `credentials: "include"` for cross-origin requests with CORS).

### 1.7 Route Protection Matrix

| Route Pattern | Guard | Failure Response |
|---------------|-------|-----------------|
| `/api/v1/*` | Rate limit (100 req/15min per IP) | 429 |
| `/api/v1/webhooks/*` | Stripe signature verification | 400 |
| `/api/v1/nexus/*` | `requireAuth()` — valid session required | 401 |
| `/api/v1/nexus/watch/*` | `requireSubscriber()` — active subscription required | 403 |
| `/api/v1/admin/*` | `requireRole('admin')` + API key | 403 |

### 1.8 Common Request Headers

| Header | Required | Description |
|---------|----------|-------------|
| `Content-Type` | Yes (for POST/PUT/PATCH) | `application/json` |
| `Accept` | No | `application/json` (default) |
| `X-API-Key` | Admin only | Admin API key for `/api/v1/admin/*` |
| `X-Request-Id` | No | Client-generated request ID for tracing |

### 1.9 HTTP Methods

| Method | Usage |
|--------|-------|
| `GET` | Read operations (list, detail, search) |
| `POST` | Create operations, webhook receivers |
| `PUT` | Full resource replacement |
| `PATCH` | Partial resource update |
| `DELETE` | Soft-delete or hard-delete |

### 1.10 Version Negotiation

The API version is determined by the URL prefix. Future versions will be available at `/api/v2/`, etc.

Optional header-based negotiation:

```
Accept: application/vnd.nexus.v2+json
```

If no version header is present, the server responds with the current active version (`v1`).

---

## 2. Authentication

All auth endpoints are handled by **Auth.js v5** via the central handler at `/api/auth/[...nextauth]`. Mutations that require authentication are also available as **Server Actions** for form-based interactions.

### 2.1 Login

Authenticate with email and password.

**Endpoint:** `POST /api/auth/callback/credentials`

**Server Action:** `actions/auth.ts` → `login()`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "redirect": false
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | `string` | Yes | Valid email format (Zod: `z.string().email()`) |
| `password` | `string` | Yes | Min 8 characters (Zod: `z.string().min(8)`) |
| `redirect` | `boolean` | No | Default: `false` — return JSON instead of redirect |

**Zod Schema:**

```typescript
const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  redirect: z.boolean().default(false),
});
```

**Success Response (200):**

```json
{
  "data": {
    "user": {
      "id": "uuid-123",
      "email": "user@example.com",
      "name": "AnimeFan",
      "image": null,
      "role": "user"
    },
    "sessionExpires": "2026-09-20T00:00:00.000Z"
  },
  "meta": { "requestId": "req_auth_001", "version": "v1" }
}
```

**Error Responses:**

```json
// 401 — Invalid credentials
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid email or password",
    "details": []
  },
  "meta": { "requestId": "req_auth_002", "version": "v1" }
}
```

### 2.2 Register

Create a new account.

**Endpoint:** `POST /api/auth/register` (Server Action)

**Server Action:** `actions/auth.ts` → `register()`

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "name": "NewUser"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | `string` | Yes | Valid email, not already registered |
| `password` | `string` | Yes | Min 8 chars, at least 1 uppercase, 1 number |
| `name` | `string` | Yes | 1–50 characters |

**Zod Schema:**

```typescript
const RegisterSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
});
```

**Success Response (201):**

```json
{
  "data": {
    "user": {
      "id": "uuid-456",
      "email": "newuser@example.com",
      "name": "NewUser",
      "image": null,
      "role": "user"
    },
    "message": "Account created. Please verify your email."
  },
  "meta": { "requestId": "req_auth_003", "version": "v1" }
}
```

**Error Responses:**

```json
// 409 — Email already registered
{
  "error": {
    "code": "CONFLICT",
    "message": "An account with this email already exists",
    "details": [{ "field": "email", "message": "Email is already in use" }]
  },
  "meta": { "requestId": "req_auth_004", "version": "v1" }
}
```

### 2.3 Logout

Destroy the current session.

**Endpoint:** `POST /api/auth/signout` (Server Action)

**Server Action:** `actions/auth.ts` → `logout()`

**Request:** No body required. Session cookie is automatically included.

**Success Response (200):**

```json
{
  "data": {
    "message": "Successfully logged out"
  },
  "meta": { "requestId": "req_auth_005", "version": "v1" }
}
```

### 2.4 Get Session

Retrieve the current authenticated session.

**Endpoint:** `GET /api/auth/session`

**Server Action:** `getSession()` from `@nexus/auth`

**Request:** No body required.

**Success Response (200) — Authenticated:**

```json
{
  "data": {
    "user": {
      "id": "uuid-123",
      "email": "user@example.com",
      "name": "AnimeFan",
      "image": "https://...",
      "role": "user"
    },
    "expires": "2026-09-20T00:00:00.000Z"
  },
  "meta": { "requestId": "req_auth_006", "version": "v1" }
}
```

**Success Response (200) — Unauthenticated:**

```json
{
  "data": null,
  "meta": { "requestId": "req_auth_007", "version": "v1" }
}
```

### 2.5 Google OAuth

Initiate or complete Google OAuth authentication flow.

**Step 1 — Initiate:**

**Endpoint:** `GET /api/auth/signin/google`

Redirects to Google's OAuth consent screen. On success, redirects to `/api/auth/callback/google`.

**Step 2 — Callback:**

**Endpoint:** `GET /api/auth/callback/google`

Handles the OAuth callback. Creates or links the user account. Sets the session cookie.

**Query Parameters (set by Google):**

| Parameter | Description |
|-----------|-------------|
| `code` | Authorization code |
| `state` | CSRF protection token |

**Success:** Redirects to `/nexus` (or the `callbackUrl` parameter).

**Error:** Redirects to `/login?error=...`

| Error Query | Meaning |
|-------------|---------|
| `OAuthAccountNotLinked` | Email exists with different provider |
| `OAuthCallbackError` | OAuth flow failed |
| `AccessDenied` | User denied consent |

### 2.6 Password Reset

**Step 1 — Request Reset Token:**

**Endpoint:** `POST /api/auth/forgot-password` (Server Action)

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Zod Schema:**

```typescript
const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});
```

**Success Response (200):**

```json
{
  "data": {
    "message": "If an account with that email exists, a reset link has been sent."
  },
  "meta": { "requestId": "req_auth_008", "version": "v1" }
}
```

> **Note:** Always returns 200 to prevent email enumeration.

**Step 2 — Reset Password with Token:**

**Endpoint:** `POST /api/auth/reset-password` (Server Action)

**Request Body:**

```json
{
  "token": "reset-token-from-email",
  "password": "newSecurePassword123"
}
```

**Zod Schema:**

```typescript
const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});
```

**Success Response (200):**

```json
{
  "data": {
    "message": "Password has been reset. Please log in with your new password."
  },
  "meta": { "requestId": "req_auth_009", "version": "v1" }
}
```

### 2.7 Email Verification

**Endpoint:** `POST /api/auth/verify-email` (Server Action)

**Request Body:**

```json
{
  "token": "verification-token-from-email"
}
```

**Zod Schema:**

```typescript
const VerifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});
```

**Success Response (200):**

```json
{
  "data": {
    "message": "Email verified successfully."
  },
  "meta": { "requestId": "req_auth_010", "version": "v1" }
}
```

**Error Response (400):**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid or expired verification token",
    "details": []
  },
  "meta": { "requestId": "req_auth_011", "version": "v1" }
}
```

---

## 3. Users

All user endpoints require authentication (`requireAuth()`).

### 3.1 Get User Profile

Retrieve the authenticated user's profile.

**Endpoint:** `GET /api/v1/nexus/users/me`

**Request:** No parameters.

**Success Response (200):**

```json
{
  "data": {
    "id": "uuid-123",
    "email": "user@example.com",
    "name": "AnimeFan",
    "image": "https://...",
    "role": "user",
    "emailVerified": "2026-06-01T00:00:00.000Z",
    "profile": {
      "id": "uuid-profile-1",
      "bio": "Love isekai and mecha anime!",
      "avatarUrl": "https://...",
      "website": "https://myblog.com",
      "location": "Tokyo, Japan",
      "dateOfBirth": "1995-03-15",
      "socialLinks": {
        "twitter": "@animefan",
        "discord": "animefan#1234"
      }
    },
    "preferences": {
      "id": "uuid-pref-1",
      "playbackQuality": "auto",
      "subtitleLanguage": "en",
      "autoplay": true,
      "skipIntro": false,
      "theme": "dark",
      "language": "en"
    },
    "subscription": {
      "id": "uuid-sub-1",
      "status": "active",
      "currentPeriodStart": "2026-06-01T00:00:00.000Z",
      "currentPeriodEnd": "2026-07-01T00:00:00.000Z",
      "cancelAtPeriodEnd": false
    },
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-06-20T00:00:00.000Z"
  },
  "meta": { "requestId": "req_user_001", "version": "v1" }
}
```

**TypeScript Types:**

```typescript
interface UserProfileResponse {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: "user" | "admin" | "superadmin";
  emailVerified: string | null;
  profile: {
    id: string;
    bio: string | null;
    avatarUrl: string | null;
    website: string | null;
    location: string | null;
    dateOfBirth: string | null;
    socialLinks: Record<string, string> | null;
  };
  preferences: {
    id: string;
    playbackQuality: string;
    subtitleLanguage: string | null;
    autoplay: boolean;
    skipIntro: boolean;
    theme: string;
    language: string;
  };
  subscription: {
    id: string;
    status: string;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  createdAt: string;
  updatedAt: string;
}
```

### 3.2 Update User Profile

Update the authenticated user's profile information.

**Endpoint:** `PATCH /api/v1/nexus/users/me`

**Request Body:**

```json
{
  "name": "AnimeFanUpdated",
  "bio": "Updated bio — now into slice-of-life too!",
  "website": "https://newblog.com",
  "location": "Osaka, Japan",
  "dateOfBirth": "1995-03-15",
  "socialLinks": {
    "twitter": "@animefan_v2"
  }
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | `string` | No | 1–50 characters |
| `bio` | `string` | No | Max 500 characters |
| `website` | `string` | No | Valid URL format |
| `location` | `string` | No | Max 255 characters |
| `dateOfBirth` | `string` | No | ISO 8601 date |
| `socialLinks` | `object` | No | Key-value pairs, max 10 keys |

**Zod Schema:**

```typescript
const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional(),
  location: z.string().max(255).optional(),
  dateOfBirth: z.string().date().optional(),
  socialLinks: z.record(z.string()).max(10).optional(),
});
```

**Success Response (200):**

```json
{
  "data": {
    "id": "uuid-123",
    "name": "AnimeFanUpdated",
    "profile": {
      "bio": "Updated bio — now into slice-of-life too!",
      "website": "https://newblog.com",
      "location": "Osaka, Japan"
    }
  },
  "meta": { "requestId": "req_user_002", "version": "v1" }
}
```

### 3.3 Update Preferences

Update the authenticated user's application preferences.

**Endpoint:** `PATCH /api/v1/nexus/users/me/preferences`

**Request Body:**

```json
{
  "playbackQuality": "1080p",
  "subtitleLanguage": "ja",
  "autoplay": true,
  "skipIntro": true,
  "theme": "light"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `playbackQuality` | `string` | No | `"auto"`, `"360p"`, `"480p"`, `"720p"`, `"1080p"` |
| `subtitleLanguage` | `string` | No | ISO 639-1 language code |
| `autoplay` | `boolean` | No | — |
| `skipIntro` | `boolean` | No | — |
| `theme` | `string` | No | `"dark"`, `"light"`, `"system"` |
| `language` | `string` | No | ISO 639-1 language code |

**Zod Schema:**

```typescript
const UpdatePreferencesSchema = z.object({
  playbackQuality: z.enum(["auto", "360p", "480p", "720p", "1080p"]).optional(),
  subtitleLanguage: z.string().length(2).optional(),
  autoplay: z.boolean().optional(),
  skipIntro: z.boolean().optional(),
  theme: z.enum(["dark", "light", "system"]).optional(),
  language: z.string().length(2).optional(),
});
```

**Success Response (200):**

```json
{
  "data": {
    "id": "uuid-pref-1",
    "playbackQuality": "1080p",
    "subtitleLanguage": "ja",
    "autoplay": true,
    "skipIntro": true,
    "theme": "light",
    "language": "en"
  },
  "meta": { "requestId": "req_user_003", "version": "v1" }
}
```

### 3.4 Get Subscription

Retrieve the authenticated user's subscription details.

**Endpoint:** `GET /api/v1/nexus/users/me/subscription`

**Success Response (200) — Active:**

```json
{
  "data": {
    "id": "uuid-sub-1",
    "stripeCustomerId": "cus_xxx",
    "stripeSubscriptionId": "sub_xxx",
    "status": "active",
    "currentPeriodStart": "2026-06-01T00:00:00.000Z",
    "currentPeriodEnd": "2026-07-01T00:00:00.000Z",
    "cancelAtPeriodEnd": false,
    "plan": {
      "name": "Nexus Prime",
      "price": 7.99,
      "currency": "usd",
      "interval": "month"
    }
  },
  "meta": { "requestId": "req_user_004", "version": "v1" }
}
```

**Success Response (200) — No Subscription:**

```json
{
  "data": null,
  "meta": { "requestId": "req_user_005", "version": "v1" }
}
```

### 3.5 Delete Account

Permanently delete the authenticated user's account and all associated data.

**Endpoint:** `DELETE /api/v1/nexus/users/me`

**Request Body:**

```json
{
  "password": "securePassword123",
  "confirmation": "DELETE MY ACCOUNT"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `password` | `string` | Yes | Must match current password |
| `confirmation` | `string` | Yes | Must be exactly `"DELETE MY ACCOUNT"` |

**Zod Schema:**

```typescript
const DeleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required"),
  confirmation: z.literal("DELETE MY ACCOUNT"),
});
```

**Success Response (200):**

```json
{
  "data": {
    "message": "Account deleted successfully."
  },
  "meta": { "requestId": "req_user_006", "version": "v1" }
}
```

**Error Response (401):**

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Password is incorrect",
    "details": []
  },
  "meta": { "requestId": "req_user_007", "version": "v1" }
}
```

---

## 4. Anime / Catalog

Public endpoints for browsing the anime catalog. No authentication required.

### 4.1 List Titles

Retrieve a paginated, filterable list of anime titles.

**Endpoint:** `GET /api/v1/titles`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `cursor` | `string` | No | — | Cursor for cursor-based pagination |
| `page` | `integer` | No | 1 | Page number for offset pagination |
| `limit` | `integer` | No | 20 | Page size (1–100) |
| `genre` | `string` | No | — | Filter by genre slug (e.g., `action`) |
| `status` | `string` | No | — | Filter by status: `airing`, `finished`, `upcoming` |
| `type` | `string` | No | — | Filter by type: `TV`, `OVA`, `ONA`, `Movie`, `Special` |
| `season` | `string` | No | — | Filter by season: `spring-2026`, `winter-2025`, etc. |
| `year` | `integer` | No | — | Filter by year |
| `sort` | `string` | No | `popularity` | Sort field: `popularity`, `score`, `newest`, `title` |
| `order` | `string` | No | `desc` | Sort order: `asc`, `desc` |

**Zod Schema:**

```typescript
const ListTitlesSchema = z.object({
  cursor: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
  genre: z.string().optional(),
  status: z.enum(["airing", "finished", "upcoming"]).optional(),
  type: z.enum(["TV", "OVA", "ONA", "Movie", "Special"]).optional(),
  season: z.string().optional(),
  year: z.coerce.number().int().min(1917).max(2099).optional(),
  sort: z.enum(["popularity", "score", "newest", "title"]).default("popularity").optional(),
  order: z.enum(["asc", "desc"]).default("desc").optional(),
});
```

**Example Request:**

```
GET /api/v1/titles?genre=action&status=airing&sort=score&order=desc&limit=10
```

**Success Response (200):**

```json
{
  "data": [
    {
      "id": "uuid-anime-1",
      "slug": "attack-on-titan",
      "title": "Attack on Titan",
      "titleJp": "進撃の巨人",
      "coverImageUrl": "https://cdn.nexus-anime.com/covers/aot.jpg",
      "type": "TV",
      "status": "finished",
      "totalEpisodes": 87,
      "score": 9.1,
      "genres": [
        { "id": "uuid-genre-1", "slug": "action", "name": "Action" },
        { "id": "uuid-genre-2", "slug": "drama", "name": "Drama" }
      ],
      "studio": {
        "id": "uuid-studio-1",
        "slug": "wit-studio",
        "name": "WIT Studio"
      }
    }
  ],
  "meta": { "requestId": "req_titles_001", "version": "v1" },
  "pagination": {
    "nextCursor": "eyJzY29yZSI6OC41fQ",
    "hasNextPage": true,
    "limit": 10
  }
}
```

**TypeScript Types:**

```typescript
interface TitleSummary {
  id: string;
  slug: string;
  title: string;
  titleJp: string | null;
  coverImageUrl: string | null;
  type: "TV" | "OVA" | "ONA" | "Movie" | "Special" | null;
  status: "airing" | "finished" | "upcoming" | null;
  totalEpisodes: number | null;
  score: number | null;
  genres: GenreSummary[];
  studio: StudioSummary | null;
}

interface GenreSummary {
  id: string;
  slug: string;
  name: string;
}

interface StudioSummary {
  id: string;
  slug: string;
  name: string;
}
```

### 4.2 Get Title Detail

Retrieve full details for a single anime title by slug.

**Endpoint:** `GET /api/v1/titles/[slug]`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | `string` | Yes | URL-friendly title identifier |

**Example Request:**

```
GET /api/v1/titles/attack-on-titan
```

**Success Response (200):**

```json
{
  "data": {
    "id": "uuid-anime-1",
    "slug": "attack-on-titan",
    "title": "Attack on Titan",
    "titleJp": "進撃の巨人",
    "synopsis": "In a world where humanity lives within enormous walled cities...",
    "coverImageUrl": "https://cdn.nexus-anime.com/covers/aot.jpg",
    "bannerImageUrl": "https://cdn.nexus-anime.com/banners/aot.jpg",
    "type": "TV",
    "status": "finished",
    "totalEpisodes": 87,
    "durationMinutes": 24,
    "startDate": "2013-04-07",
    "endDate": "2023-11-04",
    "score": 9.1,
    "popularityRank": 1,
    "genres": [
      { "id": "uuid-genre-1", "slug": "action", "name": "Action" },
      { "id": "uuid-genre-2", "slug": "drama", "name": "Drama" },
      { "id": "uuid-genre-3", "slug": "fantasy", "name": "Fantasy" }
    ],
    "studio": {
      "id": "uuid-studio-1",
      "slug": "wit-studio",
      "name": "WIT Studio",
      "logoUrl": "https://cdn.nexus-anime.com/logos/wit.png"
    },
    "seasons": [
      {
        "id": "uuid-season-1",
        "seasonNumber": 1,
        "title": "Season 1",
        "episodeCount": 25
      },
      {
        "id": "uuid-season-2",
        "seasonNumber": 2,
        "title": "Season 2",
        "episodeCount": 12
      }
    ],
    "userInteraction": {
      "inWatchlist": true,
      "watchlistStatus": "watching",
      "isFavorited": true,
      "myRating": 9
    },
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-06-20T00:00:00.000Z"
  },
  "meta": { "requestId": "req_titles_002", "version": "v1" }
}
```

> **Note:** `userInteraction` is `null` for unauthenticated requests. When authenticated, it reflects the current user's relationship with the title.

**TypeScript Types:**

```typescript
interface TitleDetail extends TitleSummary {
  synopsis: string | null;
  bannerImageUrl: string | null;
  durationMinutes: number | null;
  startDate: string | null;
  endDate: string | null;
  popularityRank: number | null;
  seasons: SeasonSummary[];
  userInteraction: UserInteraction | null;
  createdAt: string;
  updatedAt: string;
}

interface SeasonSummary {
  id: string;
  seasonNumber: number;
  title: string | null;
  episodeCount: number;
}

interface UserInteraction {
  inWatchlist: boolean;
  watchlistStatus: "plan_to_watch" | "watching" | "completed" | "dropped" | "on_hold" | null;
  isFavorited: boolean;
  myRating: number | null;
}
```

**Error Response (404):**

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Title 'nonexistent-slug' not found",
    "details": []
  },
  "meta": { "requestId": "req_titles_003", "version": "v1" }
}
```

### 4.3 List Genres

Retrieve all available genres.

**Endpoint:** `GET /api/v1/genres`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `sort` | `string` | No | `name` | Sort field: `name`, `popularity` |
| `order` | `string` | No | `asc` | Sort order: `asc`, `desc` |

**Success Response (200):**

```json
{
  "data": [
    {
      "id": "uuid-genre-1",
      "slug": "action",
      "name": "Action",
      "description": "Fast-paced, high-energy sequences...",
      "iconUrl": "https://cdn.nexus-anime.com/icons/action.svg",
      "animeCount": 342
    },
    {
      "id": "uuid-genre-2",
      "slug": "adventure",
      "name": "Adventure",
      "description": "Journeys and exploration...",
      "iconUrl": null,
      "animeCount": 218
    }
  ],
  "meta": { "requestId": "req_genres_001", "version": "v1" }
}
```

**TypeScript Types:**

```typescript
interface GenreDetail {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  animeCount: number;
}
```

### 4.4 List Studios

Retrieve all studios.

**Endpoint:** `GET /api/v1/studios`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `sort` | `string` | No | `name` | Sort field: `name` |
| `order` | `string` | No | `asc` | Sort order: `asc`, `desc` |

**Success Response (200):**

```json
{
  "data": [
    {
      "id": "uuid-studio-1",
      "slug": "wit-studio",
      "name": "WIT Studio",
      "description": "Founded in 2012 by former Gainax staff...",
      "logoUrl": "https://cdn.nexus-anime.com/logos/wit.png",
      "website": "https://witstudio.co.jp",
      "foundedDate": "2012-06-01",
      "animeCount": 28
    }
  ],
  "meta": { "requestId": "req_studios_001", "version": "v1" }
}
```

**TypeScript Types:**

```typescript
interface StudioDetail {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  foundedDate: string | null;
  animeCount: number;
}
```

### 4.5 List Shelves

Retrieve all active content shelves.

**Endpoint:** `GET /api/v1/shelves`

**Success Response (200):**

```json
{
  "data": [
    {
      "id": "uuid-shelf-1",
      "key": "trending",
      "name": "Trending Now",
      "description": "Most popular titles this week",
      "iconUrl": null,
      "sortOrder": 1,
      "isActive": true
    },
    {
      "id": "uuid-shelf-2",
      "key": "new_releases",
      "name": "New Releases",
      "description": "Freshly added titles",
      "iconUrl": null,
      "sortOrder": 2,
      "isActive": true
    }
  ],
  "meta": { "requestId": "req_shelves_001", "version": "v1" }
}
```

**TypeScript Types:**

```typescript
interface ShelfSummary {
  id: string;
  key: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}
```

### 4.6 Get Shelf Detail

Retrieve a single shelf with its anime items.

**Endpoint:** `GET /api/v1/shelves/[key]`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | `string` | Yes | Shelf programmatic key (e.g., `trending`) |

**Success Response (200):**

```json
{
  "data": {
    "id": "uuid-shelf-1",
    "key": "trending",
    "name": "Trending Now",
    "description": "Most popular titles this week",
    "items": [
      {
        "id": "uuid-item-1",
        "position": 0,
        "anime": {
          "id": "uuid-anime-1",
          "slug": "attack-on-titan",
          "title": "Attack on Titan",
          "coverImageUrl": "https://cdn.nexus-anime.com/covers/aot.jpg",
          "score": 9.1
        }
      },
      {
        "id": "uuid-item-2",
        "position": 1,
        "anime": {
          "id": "uuid-anime-2",
          "slug": "jujutsu-kaisen",
          "title": "Jujutsu Kaisen",
          "coverImageUrl": "https://cdn.nexus-anime.com/covers/jjk.jpg",
          "score": 8.7
        }
      }
    ]
  },
  "meta": { "requestId": "req_shelves_002", "version": "v1" }
}
```

**TypeScript Types:**

```typescript
interface ShelfDetail extends ShelfSummary {
  items: ShelfItemDetail[];
}

interface ShelfItemDetail {
  id: string;
  position: number;
  anime: TitleSummary;
}
```

---

## 5. Episodes

Episode endpoints. Stream URL access requires an active subscription.

### 5.1 List Episodes by Anime

Retrieve all episodes for a given anime, organized by season.

**Endpoint:** `GET /api/v1/titles/[slug]/episodes`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | `string` | Yes | Anime slug |

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `season` | `integer` | No | — | Filter by season number |

**Example Request:**

```
GET /api/v1/titles/attack-on-titan/episodes?season=1
```

**Success Response (200):**

```json
{
  "data": [
    {
      "id": "uuid-ep-1",
      "seasonId": "uuid-season-1",
      "seasonNumber": 1,
      "episodeNumber": 1,
      "title": "To You, in 2000 Years: The Fall of Shiganshina, Part 1",
      "synopsis": "The year 845...",
      "durationSeconds": 1440,
      "airDate": "2013-04-07",
      "isFiller": false,
      "thumbnailUrl": "https://cdn.nexus-anime.com/thumbs/aot-s1e1.jpg"
    },
    {
      "id": "uuid-ep-2",
      "seasonId": "uuid-season-1",
      "seasonNumber": 1,
      "episodeNumber": 2,
      "title": "That Day: The Fall of Shiganshina, Part 2",
      "synopsis": "After the fall of Wall Maria...",
      "durationSeconds": 1440,
      "airDate": "2013-04-14",
      "isFiller": false,
      "thumbnailUrl": "https://cdn.nexus-anime.com/thumbs/aot-s1e2.jpg"
    }
  ],
  "meta": { "requestId": "req_ep_001", "version": "v1" }
}
```

**TypeScript Types:**

```typescript
interface EpisodeSummary {
  id: string;
  seasonId: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string | null;
  synopsis: string | null;
  durationSeconds: number | null;
  airDate: string | null;
  isFiller: boolean;
  thumbnailUrl: string | null;
}
```

### 5.2 Get Episode Detail

Retrieve full details for a single episode.

**Endpoint:** `GET /api/v1/titles/[slug]/episodes/[episodeNumber]`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | `string` | Yes | Anime slug |
| `episodeNumber` | `integer` | Yes | Episode number |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `season` | `integer` | No | Season number (required for multi-season titles) |

**Success Response (200):**

```json
{
  "data": {
    "id": "uuid-ep-1",
    "animeId": "uuid-anime-1",
    "animeSlug": "attack-on-titan",
    "animeTitle": "Attack on Titan",
    "seasonId": "uuid-season-1",
    "seasonNumber": 1,
    "seasonTitle": "Season 1",
    "episodeNumber": 1,
    "title": "To You, in 2000 Years: The Fall of Shiganshina, Part 1",
    "synopsis": "The year 845...",
    "durationSeconds": 1440,
    "airDate": "2013-04-07",
    "isFiller": false,
    "thumbnailUrl": "https://cdn.nexus-anime.com/thumbs/aot-s1e1.jpg",
    "watchProgress": {
      "positionSeconds": 720,
      "completionPct": 50.0,
      "watchedAt": "2026-06-15T10:30:00.000Z"
    }
  },
  "meta": { "requestId": "req_ep_002", "version": "v1" }
}
```

> **Note:** `watchProgress` is `null` for unauthenticated users.

**TypeScript Types:**

```typescript
interface EpisodeDetail extends EpisodeSummary {
  animeId: string;
  animeSlug: string;
  animeTitle: string;
  seasonTitle: string | null;
  watchProgress: WatchProgress | null;
}

interface WatchProgress {
  positionSeconds: number;
  completionPct: number;
  watchedAt: string;
}
```

### 5.3 Get Stream URL

Retrieve a signed HLS stream URL for an episode. **Requires active subscription.**

**Endpoint:** `GET /api/v1/nexus/watch/[slug]/episodes/[episodeNumber]/stream`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | `string` | Yes | Anime slug |
| `episodeNumber` | `integer` | Yes | Episode number |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `season` | `integer` | No | Season number |
| `quality` | `string` | No | Preferred quality: `auto`, `360p`, `480p`, `720p`, `1080p` |

**Guard:** `requireSubscriber()` — returns 403 if no active subscription.

**Success Response (200):**

```json
{
  "data": {
    "streamUrl": "https://cloudflare-stream.com/manifest/.../master.m3u8?token=...",
    "subtitleUrl": "https://cloudflare-stream.com/subtitles/.../subs.vtt",
    "expiresAt": "2026-06-23T12:00:00.000Z",
    "quality": "1080p",
    "resolution": "1920x1080",
    "codec": "h264"
  },
  "meta": { "requestId": "req_stream_001", "version": "v1" }
}
```

**Error Response (403):**

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "An active Nexus Prime subscription is required to stream content",
    "details": []
  },
  "meta": { "requestId": "req_stream_002", "version": "v1" }
}
```

**TypeScript Types:**

```typescript
interface StreamResponse {
  streamUrl: string;
  subtitleUrl: string | null;
  expiresAt: string;
  quality: string;
  resolution: string | null;
  codec: string | null;
}
```

### 5.4 Update Watch Progress

Update the playback position for an episode. Creates or updates a watch history entry.

**Endpoint:** `POST /api/v1/nexus/watch/[slug]/episodes/[episodeNumber]/progress`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | `string` | Yes | Anime slug |
| `episodeNumber` | `integer` | Yes | Episode number |

**Request Body:**

```json
{
  "positionSeconds": 720,
  "durationSeconds": 1440
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `positionSeconds` | `integer` | Yes | >= 0 |
| `durationSeconds` | `integer` | Yes | >= 0 |

**Zod Schema:**

```typescript
const UpdateProgressSchema = z.object({
  positionSeconds: z.number().int().min(0),
  durationSeconds: z.number().int().min(0),
});
```

**Success Response (200):**

```json
{
  "data": {
    "positionSeconds": 720,
    "completionPct": 50.0,
    "watchedAt": "2026-06-23T10:30:00.000Z"
  },
  "meta": { "requestId": "req_progress_001", "version": "v1" }
}
```

---

## 6. Search

Full-text search powered by PostgreSQL `tsvector` with GIN index.

### 6.1 Search Titles

Full-text search across title, Japanese title, and synopsis.

**Endpoint:** `GET /api/v1/search`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | `string` | Yes | — | Search query (min 2 chars) |
| `genre` | `string` | No | — | Filter by genre slug |
| `status` | `string` | No | — | Filter by status |
| `type` | `string` | No | — | Filter by type |
| `year` | `integer` | No | — | Filter by year |
| `sort` | `string` | No | `relevance` | Sort: `relevance`, `score`, `newest` |
| `cursor` | `string` | No | — | Pagination cursor |
| `limit` | `integer` | No | 20 | Page size (1–100) |

**Zod Schema:**

```typescript
const SearchSchema = z.object({
  q: z.string().min(2, "Search query must be at least 2 characters").max(200),
  genre: z.string().optional(),
  status: z.enum(["airing", "finished", "upcoming"]).optional(),
  type: z.enum(["TV", "OVA", "ONA", "Movie", "Special"]).optional(),
  year: z.coerce.number().int().optional(),
  sort: z.enum(["relevance", "score", "newest"]).default("relevance").optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
});
```

**Example Request:**

```
GET /api/v1/search?q=attack+titan&genre=action&sort=relevance
```

**Success Response (200):**

```json
{
  "data": [
    {
      "id": "uuid-anime-1",
      "slug": "attack-on-titan",
      "title": "Attack on Titan",
      "titleJp": "進撃の巨人",
      "coverImageUrl": "https://cdn.nexus-anime.com/covers/aot.jpg",
      "type": "TV",
      "status": "finished",
      "score": 9.1,
      "synopsis": "In a world where humanity lives...",
      "rank": 1,
      "highlight": {
        "title": ["<em>Attack</em> on <em>Titan</em>"],
        "synopsis": ["In a world where humanity lives within enormous walled cities..."]
      }
    }
  ],
  "meta": { "requestId": "req_search_001", "version": "v1" },
  "pagination": {
    "nextCursor": "eyJyYW5rIjowLjV9",
    "hasNextPage": true,
    "limit": 20
  }
}
```

**TypeScript Types:**

```typescript
interface SearchResult extends TitleSummary {
  synopsis: string | null;
  rank: number;
  highlight: {
    title: string[];
    synopsis: string[];
  };
}
```

### 6.2 Autocomplete Suggestions

Fast prefix-based suggestions for search-as-you-type.

**Endpoint:** `GET /api/v1/search/autocomplete`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | `string` | Yes | — | Partial query (min 1 char) |
| `limit` | `integer` | No | 8 | Max results (1–20) |

**Example Request:**

```
GET /api/v1/search/autocomplete?q=att&limit=5
```

**Success Response (200):**

```json
{
  "data": [
    {
      "slug": "attack-on-titan",
      "title": "Attack on Titan",
      "coverImageUrl": "https://cdn.nexus-anime.com/covers/aot.jpg",
      "type": "TV"
    },
    {
      "slug": "attack-on-titan-the-final-season",
      "title": "Attack on Titan: The Final Season",
      "coverImageUrl": "https://cdn.nexus-anime.com/covers/aot-final.jpg",
      "type": "TV"
    }
  ],
  "meta": { "requestId": "req_search_002", "version": "v1" }
}
```

**TypeScript Types:**

```typescript
interface AutocompleteResult {
  slug: string;
  title: string;
  coverImageUrl: string | null;
  type: string | null;
}
```

---

## 7. Watchlists

All watchlist endpoints require authentication (`requireAuth()`).

### 7.1 List Watchlist

Retrieve the authenticated user's watchlist.

**Endpoint:** `GET /api/v1/nexus/watchlists`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `status` | `string` | No | — | Filter by status |
| `sort` | `string` | No | `updated` | Sort: `updated`, `added`, `title`, `priority` |
| `order` | `string` | No | `desc` | Sort order: `asc`, `desc` |
| `cursor` | `string` | No | — | Pagination cursor |
| `limit` | `integer` | No | 20 | Page size (1–100) |

**Zod Schema:**

```typescript
const ListWatchlistSchema = z.object({
  status: z.enum(["plan_to_watch", "watching", "completed", "dropped", "on_hold"]).optional(),
  sort: z.enum(["updated", "added", "title", "priority"]).default("updated").optional(),
  order: z.enum(["asc", "desc"]).default("desc").optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
});
```

**Success Response (200):**

```json
{
  "data": [
    {
      "id": "uuid-wl-1",
      "status": "watching",
      "episodesWatched": 15,
      "priority": 1,
      "notes": "Peak fiction",
      "anime": {
        "id": "uuid-anime-1",
        "slug": "attack-on-titan",
        "title": "Attack on Titan",
        "coverImageUrl": "https://cdn.nexus-anime.com/covers/aot.jpg",
        "totalEpisodes": 87,
        "score": 9.1
      },
      "createdAt": "2026-01-15T00:00:00.000Z",
      "updatedAt": "2026-06-20T00:00:00.000Z"
    }
  ],
  "meta": { "requestId": "req_wl_001", "version": "v1" },
  "pagination": {
    "nextCursor": "eyJ1cGRhdGVkQXQiOiIyMDI2LTA2LTIwIn0",
    "hasNextPage": false,
    "limit": 20
  }
}
```

**TypeScript Types:**

```typescript
interface WatchlistItem {
  id: string;
  status: "plan_to_watch" | "watching" | "completed" | "dropped" | "on_hold";
  episodesWatched: number;
  priority: number;
  notes: string | null;
  anime: TitleSummary & { totalEpisodes: number | null };
  createdAt: string;
  updatedAt: string;
}
```

### 7.2 Add to Watchlist

Add an anime to the authenticated user's watchlist.

**Endpoint:** `POST /api/v1/nexus/watchlists`

**Request Body:**

```json
{
  "animeId": "uuid-anime-2",
  "status": "plan_to_watch",
  "priority": 0,
  "notes": "Heard great things about this one"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `animeId` | `string` (UUID) | Yes | Valid UUID |
| `status` | `string` | No | Default: `plan_to_watch` |
| `priority` | `integer` | No | Default: `0` |
| `notes` | `string` | No | Max 1000 characters |

**Zod Schema:**

```typescript
const AddToWatchlistSchema = z.object({
  animeId: z.string().uuid("Invalid anime ID"),
  status: z.enum(["plan_to_watch", "watching", "completed", "dropped", "on_hold"]).default("plan_to_watch"),
  priority: z.number().int().min(0).max(1).default(0),
  notes: z.string().max(1000).optional(),
});
```

**Success Response (201):**

```json
{
  "data": {
    "id": "uuid-wl-2",
    "status": "plan_to_watch",
    "episodesWatched": 0,
    "priority": 0,
    "notes": "Heard great things about this one",
    "anime": {
      "id": "uuid-anime-2",
      "slug": "jujutsu-kaisen",
      "title": "Jujutsu Kaisen",
      "coverImageUrl": "https://cdn.nexus-anime.com/covers/jjk.jpg"
    }
  },
  "meta": { "requestId": "req_wl_002", "version": "v1" }
}
```

**Error Response (409):**

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "This anime is already in your watchlist",
    "details": []
  },
  "meta": { "requestId": "req_wl_003", "version": "v1" }
}
```

### 7.3 Update Watchlist Status

Update the status or progress of a watchlist entry.

**Endpoint:** `PATCH /api/v1/nexus/watchlists/[animeId]`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `animeId` | `string` (UUID) | Yes | Anime ID |

**Request Body:**

```json
{
  "status": "watching",
  "episodesWatched": 5,
  "priority": 1,
  "notes": "Getting good!"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `status` | `string` | No | One of the watchlist statuses |
| `episodesWatched` | `integer` | No | >= 0 |
| `priority` | `integer` | No | 0 or 1 |
| `notes` | `string` | No | Max 1000 characters |

**Zod Schema:**

```typescript
const UpdateWatchlistSchema = z.object({
  status: z.enum(["plan_to_watch", "watching", "completed", "dropped", "on_hold"]).optional(),
  episodesWatched: z.number().int().min(0).optional(),
  priority: z.number().int().min(0).max(1).optional(),
  notes: z.string().max(1000).optional(),
});
```

**Success Response (200):**

```json
{
  "data": {
    "id": "uuid-wl-1",
    "status": "watching",
    "episodesWatched": 5,
    "priority": 1,
    "notes": "Getting good!"
  },
  "meta": { "requestId": "req_wl_004", "version": "v1" }
}
```

### 7.4 Remove from Watchlist

Remove an anime from the authenticated user's watchlist.

**Endpoint:** `DELETE /api/v1/nexus/watchlists/[animeId]`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `animeId` | `string` (UUID) | Yes | Anime ID |

**Success Response (200):**

```json
{
  "data": {
    "message": "Removed from watchlist"
  },
  "meta": { "requestId": "req_wl_005", "version": "v1" }
}
```

---

## 8. Favorites

All favorite endpoints require authentication (`requireAuth()`).

### 8.1 List Favorites

Retrieve the authenticated user's favorite anime.

**Endpoint:** `GET /api/v1/nexus/favorites`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `sort` | `string` | No | `added` | Sort: `added`, `title`, `score` |
| `order` | `string` | No | `desc` | Sort order: `asc`, `desc` |
| `cursor` | `string` | No | — | Pagination cursor |
| `limit` | `integer` | No | 20 | Page size (1–100) |

**Success Response (200):**

```json
{
  "data": [
    {
      "id": "uuid-fav-1",
      "anime": {
        "id": "uuid-anime-1",
        "slug": "attack-on-titan",
        "title": "Attack on Titan",
        "coverImageUrl": "https://cdn.nexus-anime.com/covers/aot.jpg",
        "score": 9.1
      },
      "createdAt": "2026-01-15T00:00:00.000Z"
    }
  ],
  "meta": { "requestId": "req_fav_001", "version": "v1" },
  "pagination": {
    "nextCursor": null,
    "hasNextPage": false,
    "limit": 20
  }
}
```

**TypeScript Types:**

```typescript
interface FavoriteItem {
  id: string;
  anime: TitleSummary;
  createdAt: string;
}
```

### 8.2 Add Favorite

Add an anime to the authenticated user's favorites.

**Endpoint:** `POST /api/v1/nexus/favorites`

**Request Body:**

```json
{
  "animeId": "uuid-anime-2"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `animeId` | `string` (UUID) | Yes | Valid UUID |

**Zod Schema:**

```typescript
const AddFavoriteSchema = z.object({
  animeId: z.string().uuid("Invalid anime ID"),
});
```

**Success Response (201):**

```json
{
  "data": {
    "id": "uuid-fav-2",
    "anime": {
      "id": "uuid-anime-2",
      "slug": "jujutsu-kaisen",
      "title": "Jujutsu Kaisen"
    }
  },
  "meta": { "requestId": "req_fav_002", "version": "v1" }
}
```

**Error Response (409):**

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "This anime is already in your favorites",
    "details": []
  },
  "meta": { "requestId": "req_fav_003", "version": "v1" }
}
```

### 8.3 Remove Favorite

Remove an anime from the authenticated user's favorites.

**Endpoint:** `DELETE /api/v1/nexus/favorites/[animeId]`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `animeId` | `string` (UUID) | Yes | Anime ID |

**Success Response (200):**

```json
{
  "data": {
    "message": "Removed from favorites"
  },
  "meta": { "requestId": "req_fav_004", "version": "v1" }
}
```

---

## 9. Reviews

Reviews can be read by anyone. Creating, updating, and deleting requires authentication.

### 9.1 List Reviews

Retrieve reviews for a specific anime or globally.

**Endpoint:** `GET /api/v1/reviews`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `animeId` | `string` (UUID) | No | — | Filter by anime |
| `userId` | `string` (UUID) | No | — | Filter by user |
| `sort` | `string` | No | `newest` | Sort: `newest`, `helpful` |
| `cursor` | `string` | No | — | Pagination cursor |
| `limit` | `integer` | No | 20 | Page size (1–100) |

**Success Response (200):**

```json
{
  "data": [
    {
      "id": "uuid-review-1",
      "title": "A Masterpiece of Storytelling",
      "body": "Attack on Titan redefined what anime can achieve...",
      "isSpoiler": false,
      "helpfulCount": 142,
      "status": "published",
      "user": {
        "id": "uuid-user-1",
        "name": "AnimeFan",
        "image": "https://..."
      },
      "anime": {
        "id": "uuid-anime-1",
        "slug": "attack-on-titan",
        "title": "Attack on Titan"
      },
      "createdAt": "2026-03-15T00:00:00.000Z",
      "updatedAt": "2026-03-15T00:00:00.000Z"
    }
  ],
  "meta": { "requestId": "req_review_001", "version": "v1" },
  "pagination": {
    "nextCursor": "eyJjcmVhdGVkQXQiOiIyMDI2LTAzLTE1In0",
    "hasNextPage": true,
    "limit": 20
  }
}
```

**TypeScript Types:**

```typescript
interface ReviewSummary {
  id: string;
  title: string | null;
  body: string;
  isSpoiler: boolean;
  helpfulCount: number;
  status: "published" | "draft" | "hidden";
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  anime: {
    id: string;
    slug: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

### 9.2 Create Review

Create a new review for an anime. Requires authentication.

**Endpoint:** `POST /api/v1/nexus/reviews`

**Request Body:**

```json
{
  "animeId": "uuid-anime-1",
  "title": "A Masterpiece of Storytelling",
  "body": "Attack on Titan redefined what anime can achieve. The plot twists are unpredictable...",
  "isSpoiler": false
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `animeId` | `string` (UUID) | Yes | Valid UUID, anime must exist |
| `title` | `string` | No | Max 500 characters |
| `body` | `string` | Yes | Min 50 characters, max 10000 |
| `isSpoiler` | `boolean` | No | Default: `false` |

**Zod Schema:**

```typescript
const CreateReviewSchema = z.object({
  animeId: z.string().uuid("Invalid anime ID"),
  title: z.string().max(500).optional(),
  body: z
    .string()
    .min(50, "Review must be at least 50 characters")
    .max(10000, "Review must be at most 10000 characters"),
  isSpoiler: z.boolean().default(false),
});
```

**Success Response (201):**

```json
{
  "data": {
    "id": "uuid-review-1",
    "title": "A Masterpiece of Storytelling",
    "body": "Attack on Titan redefined what anime can achieve...",
    "isSpoiler": false,
    "helpfulCount": 0,
    "status": "published",
    "user": {
      "id": "uuid-user-1",
      "name": "AnimeFan"
    },
    "anime": {
      "id": "uuid-anime-1",
      "slug": "attack-on-titan",
      "title": "Attack on Titan"
    },
    "createdAt": "2026-06-23T10:00:00.000Z",
    "updatedAt": "2026-06-23T10:00:00.000Z"
  },
  "meta": { "requestId": "req_review_002", "version": "v1" }
}
```

**Error Response (409):**

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "You have already reviewed this anime",
    "details": []
  },
  "meta": { "requestId": "req_review_003", "version": "v1" }
}
```

### 9.3 Update Review

Update an existing review. Only the author may update.

**Endpoint:** `PATCH /api/v1/nexus/reviews/[reviewId]`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `reviewId` | `string` (UUID) | Yes | Review ID |

**Request Body:**

```json
{
  "title": "Updated: Still a Masterpiece",
  "body": "After rewatching, my opinion has only strengthened...",
  "isSpoiler": true
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | `string` | No | Max 500 characters |
| `body` | `string` | No | Min 50, max 10000 characters |
| `isSpoiler` | `boolean` | No | — |

**Zod Schema:**

```typescript
const UpdateReviewSchema = z.object({
  title: z.string().max(500).optional(),
  body: z.string().min(50).max(10000).optional(),
  isSpoiler: z.boolean().optional(),
});
```

**Success Response (200):**

```json
{
  "data": {
    "id": "uuid-review-1",
    "title": "Updated: Still a Masterpiece",
    "body": "After rewatching, my opinion has only strengthened...",
    "isSpoiler": true,
    "updatedAt": "2026-06-23T11:00:00.000Z"
  },
  "meta": { "requestId": "req_review_004", "version": "v1" }
}
```

### 9.4 Delete Review

Delete a review. Only the author (or admin) may delete.

**Endpoint:** `DELETE /api/v1/nexus/reviews/[reviewId]`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `reviewId` | `string` (UUID) | Yes | Review ID |

**Success Response (200):**

```json
{
  "data": {
    "message": "Review deleted"
  },
  "meta": { "requestId": "req_review_005", "version": "v1" }
}
```

### 9.5 Rate Review Helpful

Toggle a "helpful" vote on a review.

**Endpoint:** `POST /api/v1/nexus/reviews/[reviewId]/helpful`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `reviewId` | `string` (UUID) | Yes | Review ID |

**Request Body:**

```json
{
  "helpful": true
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `helpful` | `boolean` | Yes | `true` to add vote, `false` to remove |

**Zod Schema:**

```typescript
const RateHelpfulSchema = z.object({
  helpful: z.boolean(),
});
```

**Success Response (200):**

```json
{
  "data": {
    "helpfulCount": 143,
    "userVoted": true
  },
  "meta": { "requestId": "req_review_006", "version": "v1" }
}
```

---

## 10. Comments

Comments are threaded responses to reviews. All comment mutations require authentication.

### 10.1 List Comments

Retrieve comments for a specific review.

**Endpoint:** `GET /api/v1/reviews/[reviewId]/comments`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `reviewId` | `string` (UUID) | Yes | Review ID |

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `sort` | `string` | No | `newest` | Sort: `newest`, `oldest`, `likes` |
| `cursor` | `string` | No | — | Pagination cursor |
| `limit` | `integer` | No | 20 | Page size (1–100) |

**Success Response (200):**

```json
{
  "data": [
    {
      "id": "uuid-comment-1",
      "body": "Totally agree! The animation quality is unmatched.",
      "likesCount": 15,
      "user": {
        "id": "uuid-user-2",
        "name": "ReviewReader",
        "image": "https://..."
      },
      "parentCommentId": null,
      "replies": [
        {
          "id": "uuid-comment-2",
          "body": "Especially the ODM gear scenes!",
          "likesCount": 5,
          "user": {
            "id": "uuid-user-3",
            "name": "ActionFan",
            "image": null
          },
          "parentCommentId": "uuid-comment-1",
          "replies": []
        }
      ],
      "createdAt": "2026-03-16T00:00:00.000Z",
      "updatedAt": "2026-03-16T00:00:00.000Z"
    }
  ],
  "meta": { "requestId": "req_comment_001", "version": "v1" },
  "pagination": {
    "nextCursor": null,
    "hasNextPage": false,
    "limit": 20
  }
}
```

**TypeScript Types:**

```typescript
interface CommentDetail {
  id: string;
  body: string;
  likesCount: number;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  parentCommentId: string | null;
  replies: CommentDetail[];
  createdAt: string;
  updatedAt: string;
}
```

### 10.2 Create Comment

Create a new comment on a review. Supports nested replies.

**Endpoint:** `POST /api/v1/nexus/reviews/[reviewId]/comments`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `reviewId` | `string` (UUID) | Yes | Review ID |

**Request Body:**

```json
{
  "body": "Totally agree! The animation quality is unmatched.",
  "parentCommentId": null
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `body` | `string` | Yes | Min 1, max 2000 characters |
| `parentCommentId` | `string` (UUID) | No | Must be a comment on the same review |

**Zod Schema:**

```typescript
const CreateCommentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty").max(2000, "Comment too long"),
  parentCommentId: z.string().uuid().optional(),
});
```

**Success Response (201):**

```json
{
  "data": {
    "id": "uuid-comment-1",
    "body": "Totally agree! The animation quality is unmatched.",
    "likesCount": 0,
    "user": {
      "id": "uuid-user-1",
      "name": "AnimeFan"
    },
    "parentCommentId": null,
    "createdAt": "2026-06-23T12:00:00.000Z",
    "updatedAt": "2026-06-23T12:00:00.000Z"
  },
  "meta": { "requestId": "req_comment_002", "version": "v1" }
}
```

### 10.3 Update Comment

Update a comment. Only the author may update.

**Endpoint:** `PATCH /api/v1/nexus/comments/[commentId]`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `commentId` | `string` (UUID) | Yes | Comment ID |

**Request Body:**

```json
{
  "body": "Updated: Totally agree! The animation is even better on rewatch."
}
```

**Zod Schema:**

```typescript
const UpdateCommentSchema = z.object({
  body: z.string().min(1).max(2000),
});
```

**Success Response (200):**

```json
{
  "data": {
    "id": "uuid-comment-1",
    "body": "Updated: Totally agree! The animation is even better on rewatch.",
    "updatedAt": "2026-06-23T12:30:00.000Z"
  },
  "meta": { "requestId": "req_comment_003", "version": "v1" }
}
```

### 10.4 Delete Comment

Delete a comment. Only the author (or admin) may delete.

**Endpoint:** `DELETE /api/v1/nexus/comments/[commentId]`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `commentId` | `string` (UUID) | Yes | Comment ID |

**Success Response (200):**

```json
{
  "data": {
    "message": "Comment deleted"
  },
  "meta": { "requestId": "req_comment_004", "version": "v1" }
}
```

### 10.5 Like Comment

Toggle a like on a comment.

**Endpoint:** `POST /api/v1/nexus/comments/[commentId]/like`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `commentId` | `string` (UUID) | Yes | Comment ID |

**Request Body:**

```json
{
  "liked": true
}
```

**Zod Schema:**

```typescript
const LikeCommentSchema = z.object({
  liked: z.boolean(),
});
```

**Success Response (200):**

```json
{
  "data": {
    "likesCount": 16,
    "userLiked": true
  },
  "meta": { "requestId": "req_comment_005", "version": "v1" }
}
```

---

## 11. Admin

All admin endpoints require `requireRole('admin')` + `X-API-Key` header. These endpoints power the CMS and content management system.

### 11.1 Dashboard Stats

Retrieve platform-wide statistics.

**Endpoint:** `GET /api/v1/admin/dashboard`

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `X-API-Key` | Yes | Admin API key |

**Success Response (200):**

```json
{
  "data": {
    "users": {
      "total": 1250,
      "active": 980,
      "newThisWeek": 45,
      "growthRate": 3.7
    },
    "subscriptions": {
      "active": 820,
      "trialing": 35,
      "canceled": 120,
      "churnRate": 2.1,
      "mrr": 6551.80
    },
    "content": {
      "totalTitles": 75,
      "totalEpisodes": 420,
      "totalSeasons": 95
    },
    "engagement": {
      "totalWatchlistItems": 3450,
      "totalReviews": 230,
      "totalComments": 890,
      "avgWatchTimeMinutes": 42
    },
    "popularTitles": [
      {
        "slug": "attack-on-titan",
        "title": "Attack on Titan",
        "watchlistCount": 890
      }
    ]
  },
  "meta": { "requestId": "req_admin_001", "version": "v1" }
}
```

**TypeScript Types:**

```typescript
interface DashboardStats {
  users: {
    total: number;
    active: number;
    newThisWeek: number;
    growthRate: number;
  };
  subscriptions: {
    active: number;
    trialing: number;
    canceled: number;
    churnRate: number;
    mrr: number;
  };
  content: {
    totalTitles: number;
    totalEpisodes: number;
    totalSeasons: number;
  };
  engagement: {
    totalWatchlistItems: number;
    totalReviews: number;
    totalComments: number;
    avgWatchTimeMinutes: number;
  };
  popularTitles: {
    slug: string;
    title: string;
    watchlistCount: number;
  }[];
}
```

### 11.2 Admin — Titles CRUD

#### 11.2.1 Create Title

**Endpoint:** `POST /api/v1/admin/titles`

**Request Body:**

```json
{
  "title": "Chainsaw Man",
  "titleJp": "チェンソーマン",
  "slug": "chainsaw-man",
  "synopsis": "Denji is a teenage boy living with a Chainsaw Devil named Pochita...",
  "coverImageUrl": "https://cdn.nexus-anime.com/covers/csm.jpg",
  "bannerImageUrl": "https://cdn.nexus-anime.com/banners/csm.jpg",
  "type": "TV",
  "status": "airing",
  "totalEpisodes": 12,
  "durationMinutes": 24,
  "startDate": "2022-10-12",
  "studioId": "uuid-studio-mappa",
  "genreIds": ["uuid-genre-action", "uuid-genre-horror"]
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | `string` | Yes | 1–500 characters |
| `slug` | `string` | Yes | Unique, URL-safe |
| `titleJp` | `string` | No | Max 500 characters |
| `synopsis` | `string` | No | Max 5000 characters |
| `coverImageUrl` | `string` | No | Valid URL |
| `bannerImageUrl` | `string` | No | Valid URL |
| `type` | `string` | No | One of `TV`, `OVA`, `ONA`, `Movie`, `Special` |
| `status` | `string` | No | One of `airing`, `finished`, `upcoming` |
| `totalEpisodes` | `integer` | No | >= 0 |
| `durationMinutes` | `integer` | No | > 0 |
| `startDate` | `string` | No | ISO 8601 date |
| `endDate` | `string` | No | ISO 8601 date |
| `studioId` | `string` (UUID) | No | Valid studio ID |
| `genreIds` | `string[]` | No | Array of genre UUIDs |

**Zod Schema:**

```typescript
const CreateTitleSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, "Slug must be URL-safe"),
  titleJp: z.string().max(500).optional(),
  synopsis: z.string().max(5000).optional(),
  coverImageUrl: z.string().url().optional(),
  bannerImageUrl: z.string().url().optional(),
  type: z.enum(["TV", "OVA", "ONA", "Movie", "Special"]).optional(),
  status: z.enum(["airing", "finished", "upcoming"]).optional(),
  totalEpisodes: z.number().int().min(0).optional(),
  durationMinutes: z.number().int().min(1).optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  studioId: z.string().uuid().optional(),
  genreIds: z.array(z.string().uuid()).optional(),
});
```

**Success Response (201):**

```json
{
  "data": {
    "id": "uuid-anime-new",
    "slug": "chainsaw-man",
    "title": "Chainsaw Man",
    "type": "TV",
    "status": "airing",
    "genres": [
      { "id": "uuid-genre-action", "slug": "action", "name": "Action" },
      { "id": "uuid-genre-horror", "slug": "horror", "name": "Horror" }
    ],
    "studio": {
      "id": "uuid-studio-mappa",
      "slug": "mappa",
      "name": "MAPPA"
    },
    "createdAt": "2026-06-23T14:00:00.000Z"
  },
  "meta": { "requestId": "req_admin_002", "version": "v1" }
}
```

#### 11.2.2 Update Title

**Endpoint:** `PATCH /api/v1/admin/titles/[animeId]`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `animeId` | `string` (UUID) | Yes | Anime ID |

**Request Body:** Same fields as Create Title, all optional.

**Zod Schema:**

```typescript
const UpdateTitleSchema = CreateTitleSchema.partial();
```

**Success Response (200):**

```json
{
  "data": {
    "id": "uuid-anime-new",
    "slug": "chainsaw-man",
    "title": "Chainsaw Man",
    "status": "finished",
    "updatedAt": "2026-06-23T14:30:00.000Z"
  },
  "meta": { "requestId": "req_admin_003", "version": "v1" }
}
```

#### 11.2.3 Delete Title

**Endpoint:** `DELETE /api/v1/admin/titles/[animeId]`

Performs a soft delete (sets `deleted_at`).

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `animeId` | `string` (UUID) | Yes | Anime ID |

**Success Response (200):**

```json
{
  "data": {
    "message": "Title deleted (soft)"
  },
  "meta": { "requestId": "req_admin_004", "version": "v1" }
}
```

### 11.3 Admin — Seasons CRUD

#### 11.3.1 Create Season

**Endpoint:** `POST /api/v1/admin/titles/[animeId]/seasons`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `animeId` | `string` (UUID) | Yes | Anime ID |

**Request Body:**

```json
{
  "seasonNumber": 1,
  "title": "Season 1",
  "synopsis": "The beginning of Denji's journey...",
  "startDate": "2022-10-12",
  "endDate": "2022-12-28"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `seasonNumber` | `integer` | Yes | >= 1, unique per anime |
| `title` | `string` | No | Max 500 characters |
| `synopsis` | `string` | No | Max 5000 characters |
| `startDate` | `string` | No | ISO 8601 date |
| `endDate` | `string` | No | ISO 8601 date |

**Zod Schema:**

```typescript
const CreateSeasonSchema = z.object({
  seasonNumber: z.number().int().min(1),
  title: z.string().max(500).optional(),
  synopsis: z.string().max(5000).optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
});
```

**Success Response (201):**

```json
{
  "data": {
    "id": "uuid-season-new",
    "animeId": "uuid-anime-new",
    "seasonNumber": 1,
    "title": "Season 1",
    "createdAt": "2026-06-23T14:05:00.000Z"
  },
  "meta": { "requestId": "req_admin_005", "version": "v1" }
}
```

#### 11.3.2 Update Season

**Endpoint:** `PATCH /api/v1/admin/seasons/[seasonId]`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `seasonId` | `string` (UUID) | Yes | Season ID |

**Request Body:** Same fields as Create Season, all optional.

**Zod Schema:**

```typescript
const UpdateSeasonSchema = CreateSeasonSchema.partial();
```

**Success Response (200):**

```json
{
  "data": {
    "id": "uuid-season-new",
    "title": "Season 1 (Updated)",
    "updatedAt": "2026-06-23T14:10:00.000Z"
  },
  "meta": { "requestId": "req_admin_006", "version": "v1" }
}
```

#### 11.3.3 Delete Season

**Endpoint:** `DELETE /api/v1/admin/seasons/[seasonId]`

Performs a soft delete.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `seasonId` | `string` (UUID) | Yes | Season ID |

**Success Response (200):**

```json
{
  "data": {
    "message": "Season deleted (soft)"
  },
  "meta": { "requestId": "req_admin_007", "version": "v1" }
}
```

### 11.4 Admin — Episodes CRUD

#### 11.4.1 Create Episode

**Endpoint:** `POST /api/v1/admin/seasons/[seasonId]/episodes`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `seasonId` | `string` (UUID) | Yes | Season ID |

**Request Body:**

```json
{
  "episodeNumber": 1,
  "title": "Dog & Chainsaw",
  "synopsis": "Denji lives a poor life with his devil pet Pochita...",
  "durationSeconds": 1440,
  "airDate": "2022-10-12",
  "isFiller": false,
  "thumbnailUrl": "https://cdn.nexus-anime.com/thumbs/csm-s1e1.jpg"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `episodeNumber` | `integer` | Yes | >= 0, unique per season |
| `title` | `string` | No | Max 500 characters |
| `synopsis` | `string` | No | Max 5000 characters |
| `durationSeconds` | `integer` | No | > 0 |
| `airDate` | `string` | No | ISO 8601 date |
| `isFiller` | `boolean` | No | Default: `false` |
| `thumbnailUrl` | `string` | No | Valid URL |

**Zod Schema:**

```typescript
const CreateEpisodeSchema = z.object({
  episodeNumber: z.number().int().min(0),
  title: z.string().max(500).optional(),
  synopsis: z.string().max(5000).optional(),
  durationSeconds: z.number().int().min(1).optional(),
  airDate: z.string().date().optional(),
  isFiller: z.boolean().default(false),
  thumbnailUrl: z.string().url().optional(),
});
```

**Success Response (201):**

```json
{
  "data": {
    "id": "uuid-ep-new",
    "seasonId": "uuid-season-new",
    "episodeNumber": 1,
    "title": "Dog & Chainsaw",
    "createdAt": "2026-06-23T14:15:00.000Z"
  },
  "meta": { "requestId": "req_admin_008", "version": "v1" }
}
```

#### 11.4.2 Update Episode

**Endpoint:** `PATCH /api/v1/admin/episodes/[episodeId]`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `episodeId` | `string` (UUID) | Yes | Episode ID |

**Request Body:** Same fields as Create Episode, all optional.

**Zod Schema:**

```typescript
const UpdateEpisodeSchema = CreateEpisodeSchema.partial();
```

**Success Response (200):**

```json
{
  "data": {
    "id": "uuid-ep-new",
    "title": "Dog & Chainsaw (Revised)",
    "updatedAt": "2026-06-23T14:20:00.000Z"
  },
  "meta": { "requestId": "req_admin_009", "version": "v1" }
}
```

#### 11.4.3 Delete Episode

**Endpoint:** `DELETE /api/v1/admin/episodes/[episodeId]`

Performs a soft delete.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `episodeId` | `string` (UUID) | Yes | Episode ID |

**Success Response (200):**

```json
{
  "data": {
    "message": "Episode deleted (soft)"
  },
  "meta": { "requestId": "req_admin_010", "version": "v1" }
}
```

### 11.5 Admin — Genres CRUD

#### 11.5.1 Create Genre

**Endpoint:** `POST /api/v1/admin/genres`

**Request Body:**

```json
{
  "slug": "isekai",
  "name": "Isekai",
  "description": "Stories about characters transported to parallel worlds",
  "iconUrl": "https://cdn.nexus-anime.com/icons/isekai.svg"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `slug` | `string` | Yes | Unique, URL-safe |
| `name` | `string` | Yes | 1–255 characters |
| `description` | `string` | No | Max 2000 characters |
| `iconUrl` | `string` | No | Valid URL |

**Zod Schema:**

```typescript
const CreateGenreSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  iconUrl: z.string().url().optional(),
});
```

**Success Response (201):**

```json
{
  "data": {
    "id": "uuid-genre-new",
    "slug": "isekai",
    "name": "Isekai",
    "createdAt": "2026-06-23T14:25:00.000Z"
  },
  "meta": { "requestId": "req_admin_011", "version": "v1" }
}
```

#### 11.5.2 Update Genre

**Endpoint:** `PATCH /api/v1/admin/genres/[genreId]`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `genreId` | `string` (UUID) | Yes | Genre ID |

**Request Body:** Same fields as Create Genre, all optional.

**Zod Schema:**

```typescript
const UpdateGenreSchema = CreateGenreSchema.partial();
```

**Success Response (200):**

```json
{
  "data": {
    "id": "uuid-genre-new",
    "name": "Isekai (Updated)",
    "updatedAt": "2026-06-23T14:30:00.000Z"
  },
  "meta": { "requestId": "req_admin_012", "version": "v1" }
}
```

#### 11.5.3 Delete Genre

**Endpoint:** `DELETE /api/v1/admin/genres/[genreId]`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `genreId` | `string` (UUID) | Yes | Genre ID |

**Success Response (200):**

```json
{
  "data": {
    "message": "Genre deleted"
  },
  "meta": { "requestId": "req_admin_013", "version": "v1" }
}
```

### 11.6 Admin — Studios CRUD

#### 11.6.1 Create Studio

**Endpoint:** `POST /api/v1/admin/studios`

**Request Body:**

```json
{
  "slug": "cloverworks",
  "name": "CloverWorks",
  "description": "A-1 Pictures spin-off studio...",
  "logoUrl": "https://cdn.nexus-anime.com/logos/cloverworks.png",
  "website": "https://cloverworks.co.jp",
  "foundedDate": "2018-10-01"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `slug` | `string` | Yes | Unique, URL-safe |
| `name` | `string` | Yes | 1–255 characters |
| `description` | `string` | No | Max 2000 characters |
| `logoUrl` | `string` | No | Valid URL |
| `website` | `string` | No | Valid URL |
| `foundedDate` | `string` | No | ISO 8601 date |

**Zod Schema:**

```typescript
const CreateStudioSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  logoUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  foundedDate: z.string().date().optional(),
});
```

**Success Response (201):**

```json
{
  "data": {
    "id": "uuid-studio-new",
    "slug": "cloverworks",
    "name": "CloverWorks",
    "createdAt": "2026-06-23T14:35:00.000Z"
  },
  "meta": { "requestId": "req_admin_014", "version": "v1" }
}
```

#### 11.6.2 Update Studio

**Endpoint:** `PATCH /api/v1/admin/studios/[studioId]`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `studioId` | `string` (UUID) | Yes | Studio ID |

**Request Body:** Same fields as Create Studio, all optional.

**Zod Schema:**

```typescript
const UpdateStudioSchema = CreateStudioSchema.partial();
```

**Success Response (200):**

```json
{
  "data": {
    "id": "uuid-studio-new",
    "name": "CloverWorks (Updated)",
    "updatedAt": "2026-06-23T14:40:00.000Z"
  },
  "meta": { "requestId": "req_admin_015", "version": "v1" }
}
```

#### 11.6.3 Delete Studio

**Endpoint:** `DELETE /api/v1/admin/studios/[studioId]`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `studioId` | `string` (UUID) | Yes | Studio ID |

**Success Response (200):**

```json
{
  "data": {
    "message": "Studio deleted"
  },
  "meta": { "requestId": "req_admin_016", "version": "v1" }
}
```

### 11.7 Admin — Shelves CRUD

#### 11.7.1 Create Shelf

**Endpoint:** `POST /api/v1/admin/shelves`

**Request Body:**

```json
{
  "key": "summer_2026",
  "name": "Summer 2026 Picks",
  "description": "The best anime of the summer season",
  "iconUrl": null,
  "sortOrder": 5,
  "isActive": true
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `key` | `string` | Yes | Unique, URL-safe |
| `name` | `string` | Yes | 1–255 characters |
| `description` | `string` | No | Max 2000 characters |
| `iconUrl` | `string` | No | Valid URL |
| `sortOrder` | `integer` | No | Default: 0 |
| `isActive` | `boolean` | No | Default: `true` |

**Zod Schema:**

```typescript
const CreateShelfSchema = z.object({
  key: z.string().min(1).max(100).regex(/^[a-z0-9_]+$/),
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  iconUrl: z.string().url().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});
```

**Success Response (201):**

```json
{
  "data": {
    "id": "uuid-shelf-new",
    "key": "summer_2026",
    "name": "Summer 2026 Picks",
    "createdAt": "2026-06-23T14:45:00.000Z"
  },
  "meta": { "requestId": "req_admin_017", "version": "v1" }
}
```

#### 11.7.2 Update Shelf

**Endpoint:** `PATCH /api/v1/admin/shelves/[shelfId]`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `shelfId` | `string` (UUID) | Yes | Shelf ID |

**Request Body:** Same fields as Create Shelf, all optional.

**Zod Schema:**

```typescript
const UpdateShelfSchema = CreateShelfSchema.partial();
```

**Success Response (200):**

```json
{
  "data": {
    "id": "uuid-shelf-new",
    "name": "Summer 2026 Picks (Updated)",
    "updatedAt": "2026-06-23T14:50:00.000Z"
  },
  "meta": { "requestId": "req_admin_018", "version": "v1" }
}
```

#### 11.7.3 Delete Shelf

**Endpoint:** `DELETE /api/v1/admin/shelves/[shelfId]`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `shelfId` | `string` (UUID) | Yes | Shelf ID |

**Success Response (200):**

```json
{
  "data": {
    "message": "Shelf deleted"
  },
  "meta": { "requestId": "req_admin_019", "version": "v1" }
}
```

#### 11.7.4 Add Item to Shelf

**Endpoint:** `POST /api/v1/admin/shelves/[shelfId]/items`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `shelfId` | `string` (UUID) | Yes | Shelf ID |

**Request Body:**

```json
{
  "animeId": "uuid-anime-1",
  "position": 0
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `animeId` | `string` (UUID) | Yes | Valid anime ID |
| `position` | `integer` | No | Default: 0 |

**Zod Schema:**

```typescript
const AddShelfItemSchema = z.object({
  animeId: z.string().uuid(),
  position: z.number().int().min(0).default(0),
});
```

**Success Response (201):**

```json
{
  "data": {
    "id": "uuid-shelf-item-new",
    "shelfId": "uuid-shelf-new",
    "animeId": "uuid-anime-1",
    "position": 0
  },
  "meta": { "requestId": "req_admin_020", "version": "v1" }
}
```

#### 11.7.5 Remove Item from Shelf

**Endpoint:** `DELETE /api/v1/admin/shelves/[shelfId]/items/[itemId]`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `shelfId` | `string` (UUID) | Yes | Shelf ID |
| `itemId` | `string` (UUID) | Yes | Shelf item ID |

**Success Response (200):**

```json
{
  "data": {
    "message": "Item removed from shelf"
  },
  "meta": { "requestId": "req_admin_021", "version": "v1" }
}
```

### 11.8 Admin — User Management

#### 11.8.1 List Users

**Endpoint:** `GET /api/v1/admin/users`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `role` | `string` | No | — | Filter by role: `user`, `admin`, `superadmin` |
| `search` | `string` | No | — | Search by name or email |
| `status` | `string` | No | — | Filter: `active`, `suspended` |
| `sort` | `string` | No | `newest` | Sort: `newest`, `oldest`, `name` |
| `cursor` | `string` | No | — | Pagination cursor |
| `limit` | `integer` | No | 20 | Page size (1–100) |

**Success Response (200):**

```json
{
  "data": [
    {
      "id": "uuid-user-1",
      "email": "user@example.com",
      "name": "AnimeFan",
      "role": "user",
      "emailVerified": true,
      "subscription": {
        "status": "active",
        "currentPeriodEnd": "2026-07-01T00:00:00.000Z"
      },
      "watchlistCount": 15,
      "reviewCount": 3,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "lastLoginAt": "2026-06-22T00:00:00.000Z"
    }
  ],
  "meta": { "requestId": "req_admin_022", "version": "v1" },
  "pagination": {
    "nextCursor": "eyJjcmVhdGVkQXQiOiIyMDI2LTAxLTAxIn0",
    "hasNextPage": true,
    "limit": 20
  }
}
```

**TypeScript Types:**

```typescript
interface AdminUserSummary {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin" | "superadmin";
  emailVerified: boolean;
  subscription: {
    status: string;
    currentPeriodEnd: string | null;
  } | null;
  watchlistCount: number;
  reviewCount: number;
  createdAt: string;
  lastLoginAt: string | null;
}
```

#### 11.8.2 Update User Role

**Endpoint:** `PATCH /api/v1/admin/users/[userId]/role`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | `string` (UUID) | Yes | User ID |

**Request Body:**

```json
{
  "role": "admin"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `role` | `string` | Yes | `user`, `admin`, `superadmin` |

**Zod Schema:**

```typescript
const UpdateUserRoleSchema = z.object({
  role: z.enum(["user", "admin", "superadmin"]),
});
```

**Success Response (200):**

```json
{
  "data": {
    "id": "uuid-user-1",
    "role": "admin",
    "updatedAt": "2026-06-23T15:00:00.000Z"
  },
  "meta": { "requestId": "req_admin_023", "version": "v1" }
}
```

#### 11.8.3 Suspend User

**Endpoint:** `POST /api/v1/admin/users/[userId]/suspend`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | `string` (UUID) | Yes | User ID |

**Request Body:**

```json
{
  "reason": "Violation of community guidelines"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `reason` | `string` | Yes | 1–500 characters |

**Zod Schema:**

```typescript
const SuspendUserSchema = z.object({
  reason: z.string().min(1).max(500),
});
```

**Success Response (200):**

```json
{
  "data": {
    "id": "uuid-user-1",
    "suspended": true,
    "suspensionReason": "Violation of community guidelines",
    "suspendedAt": "2026-06-23T15:05:00.000Z"
  },
  "meta": { "requestId": "req_admin_024", "version": "v1" }
}
```

#### 11.8.4 Unsuspend User

**Endpoint:** `POST /api/v1/admin/users/[userId]/unsuspend`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | `string` (UUID) | Yes | User ID |

**Success Response (200):**

```json
{
  "data": {
    "id": "uuid-user-1",
    "suspended": false,
    "unsuspendedAt": "2026-06-23T15:10:00.000Z"
  },
  "meta": { "requestId": "req_admin_025", "version": "v1" }
}
```

---

## 12. Webhooks

### 12.1 Stripe Webhook

Receives events from Stripe for subscription lifecycle management.

**Endpoint:** `POST /api/v1/webhooks/stripe`

**Guard:** Stripe signature verification via `STRIPE_WEBHOOK_SECRET`.

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Stripe-Signature` | Yes | HMAC-SHA256 signature |
| `Content-Type` | Yes | `application/json` |

**Supported Events:**

| Event | Description | Action |
|-------|-------------|--------|
| `customer.subscription.created` | New subscription created | Create/update local subscription record |
| `customer.subscription.updated` | Subscription updated (renewal, plan change) | Sync subscription status and dates |
| `customer.subscription.deleted` | Subscription canceled/expired | Mark subscription as `canceled` |
| `customer.subscription.trial_will_end` | Trial ending in 3 days | Send trial ending notification |
| `invoice.payment_succeeded` | Payment received | Update `current_period_end` |
| `invoice.payment_failed` | Payment failed | Mark subscription as `past_due`, send dunning email |
| `customer.created` | New Stripe customer created | Link to local user record |
| `customer.updated` | Customer details updated | Sync payment method info |

**Success Response (200):**

```json
{
  "received": true
}
```

**Error Response (400):**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid webhook signature",
    "details": []
  }
}
```

**Webhook Event Payload Example:**

```json
{
  "id": "evt_xxx",
  "object": "event",
  "type": "customer.subscription.updated",
  "data": {
    "object": {
      "id": "sub_xxx",
      "customer": "cus_xxx",
      "status": "active",
      "current_period_start": 1719014400,
      "current_period_end": 1722643200,
      "cancel_at_period_end": false
    }
  }
}
```

---

## 13. Appendices

### Appendix A: Complete Error Codes Reference

| Code | HTTP Status | Meaning | Example |
|------|-------------|---------|---------|
| `VALIDATION_ERROR` | 400 | Input failed Zod validation | Invalid email format, missing required field |
| `UNAUTHORIZED` | 401 | Missing or invalid session | No session cookie, expired JWT |
| `FORBIDDEN` | 403 | Valid session, insufficient permission | Non-admin accessing admin endpoint, non-subscriber accessing stream |
| `NOT_FOUND` | 404 | Resource does not exist | Invalid slug, deleted resource |
| `CONFLICT` | 409 | Duplicate resource | Email already registered, anime already in watchlist |
| `RATE_LIMITED` | 429 | Too many requests | Exceeded 100 req/15min limit |
| `INTERNAL_ERROR` | 500 | Unexpected server failure | Database connection lost, unhandled exception |

### Appendix B: Pagination Parameters Summary

**Cursor-Based (Recommended):**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `cursor` | `string` | — | Opaque cursor from `pagination.nextCursor` |
| `limit` | `integer` | 20 | Page size (1–100) |

**Offset-Based:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | `integer` | 1 | Page number (1-indexed) |
| `limit` | `integer` | 20 | Page size (1–100) |

### Appendix C: Rate Limiting Headers

Every API response includes these headers:

| Header | Type | Description |
|--------|------|-------------|
| `X-RateLimit-Limit` | `integer` | Maximum requests per window (100) |
| `X-RateLimit-Remaining` | `integer` | Requests remaining in current window |
| `X-RateLimit-Reset` | `integer` | Unix timestamp when the window resets |

### Appendix D: Authentication Cookie

| Cookie | Attributes | Description |
|--------|-----------|-------------|
| `__Host-nexus-session` | `HttpOnly; Secure; SameSite=Lax; Path=/` | Session JWT (Auth.js v5) |

### Appendix E: API Version Lifecycle

| Phase | Behavior | Headers |
|-------|----------|---------|
| **Active** | Default version, fully supported | `API-Version: v1` |
| **Deprecated** | Still functional, sunset announced | `API-Version: v1`, `Deprecation: true`, `Sunset: <ISO date>` |
| **Retired** | Returns `410 Gone` with migration guide link | N/A |

### Appendix F: Module Dependency Map

```
catalog ←── auth ←── billing
   ↑           ↑
library ←── catalog
admin ←── auth + catalog
```

| Module | Domain | Key Endpoints |
|--------|--------|---------------|
| `catalog` | Title browsing, search, shelves | `GET /api/v1/titles`, `GET /api/v1/search` |
| `auth` | Authentication, session, OAuth | `POST /api/auth/callback/credentials`, `GET /api/auth/session` |
| `billing` | Subscriptions, Stripe | `POST /api/v1/webhooks/stripe` |
| `library` | Watchlist, watch progress, preferences | `GET /api/v1/nexus/watchlists`, `PATCH /api/v1/nexus/users/me/preferences` |
| `admin` | CMS, content ingestion | `POST /api/v1/admin/titles`, `GET /api/v1/admin/dashboard` |

### Appendix G: Database ENUM Summary

| Enum | Values | Used By |
|------|--------|---------|
| `user_role` | `user`, `admin`, `superadmin` | `users.role` |
| `anime_type` | `TV`, `OVA`, `ONA`, `Movie`, `Special` | `anime.type` |
| `anime_status` | `airing`, `finished`, `upcoming` | `anime.status` |
| `watchlist_status` | `plan_to_watch`, `watching`, `completed`, `dropped`, `on_hold` | `watchlists.status` |
| `review_status` | `published`, `draft`, `hidden` | `reviews.status` |
| `subscription_status` | `active`, `past_due`, `canceled`, `unpaid`, `trialing` | `subscriptions.status` |
| `notification_type` | `system`, `episode`, `social`, `promo` | `notifications.type` |

### Appendix H: Zod Validation Quick Reference

| Pattern | Zod Expression |
|---------|---------------|
| Required string | `z.string().min(1)` |
| Optional string | `z.string().optional()` |
| Email | `z.string().email()` |
| UUID | `z.string().uuid()` |
| URL | `z.string().url()` |
| Integer | `z.number().int()` |
| Positive integer | `z.number().int().min(0)` |
| Boolean | `z.boolean()` |
| Enum | `z.enum(["a", "b", "c"])` |
| Max length | `z.string().max(255)` |
| Coerced integer | `z.coerce.number().int()` |
| Literal | `z.literal("value")` |
| Array of UUIDs | `z.array(z.string().uuid())` |

### Appendix I: HTTP Status Code Usage

| Status | Usage |
|--------|-------|
| 200 | Successful GET, PUT, PATCH, DELETE |
| 201 | Successful POST (resource created) |
| 204 | Successful request with no content (not used — 200 with body preferred) |
| 400 | Validation error |
| 401 | Authentication required |
| 403 | Permission denied |
| 404 | Resource not found |
| 409 | Conflict (duplicate resource) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

*This document is the authoritative API contract for Nexus Anime. All route handlers, services, and client integrations must conform to the specifications defined herein. For the canonical database schema, see [database-design.md](./database-design.md). For the backend architecture, see [backend-architecture.md](./architecture/backend-architecture.md).*