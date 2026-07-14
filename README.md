# 🎧 SoundSpace

**A social network built around the music you're actually listening to.**

[![Backend](https://img.shields.io/badge/backend-ASP.NET%20Core%2010-512BD4?logo=dotnet)](#2-soundspacebackend-api)
[![Worker](https://img.shields.io/badge/worker-.NET%20Worker%20Service-512BD4?logo=dotnet)](#3-soundspace_spotifyworker-background-service)
[![Frontend](https://img.shields.io/badge/frontend-Next.js%2016%20%2F%20React%2019-000000?logo=next.js)](#1-soundspace_frontend-web-client)
[![Database](https://img.shields.io/badge/database-PostgreSQL%20%2B%20pgvector-336791?logo=postgresql)](#core-data-store)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![License](https://img.shields.io/badge/license-Academic%20%2F%20TBD-lightgrey)](#contributing--license)

---

## Table of Contents

1. [Overview](#overview)
2. [Core Functionalities](#core-functionalities)
3. [Architecture & Sub-Projects](#architecture--sub-projects)
   - [1. SoundSpace_Frontend](#1-soundspace_frontend-web-client)
   - [2. SoundSpaceBackend](#2-soundspacebackend-api)
   - [3. SoundSpace_SpotifyWorker](#3-soundspace_spotifyworker-background-service)
4. [Detailed Feature Breakdown](#detailed-feature-breakdown)
5. [Prerequisites & Installation](#prerequisites--installation)
6. [Usage / Running the Application](#usage--running-the-application)
7. [Contributing & License](#contributing--license)

---

## Overview

**SoundSpace** is a social platform that turns listening to music into a shared, social activity instead of a solitary one. It connects directly to a user's **Spotify** account and treats live listening data — what you're playing right now, what you've been playing recently, your top artists and tracks — as first-class social content, alongside a traditional feed of posts, comments, likes, friendships, real-time chat, and location-based **music events** (concerts, listening parties, meetups).

The problem SoundSpace solves is the gap between *music streaming* (a private, algorithmic experience) and *social networking* (which rarely knows anything about what you're listening to in the moment). By continuously syncing a user's Spotify state in the background and pushing it live to their friends, SoundSpace lets people discover new music through the people they know, find events matching their taste, and match with new people based on genuinely shared listening habits — not self-reported interests.

### System Architecture at a Glance

```
                        ┌─────────────────────────┐
                        │        Spotify Web API   │
                        └───────────┬─────────────┘
                     OAuth2 /       │       Web API calls
                  playback control  │   (now playing, top tracks,
                                    │    recently played, search…)
                                    │
        ┌───────────────────────────┴───────────────────────────┐
        │                                                       │
┌───────▼────────┐   REST + JWT (cookies)   ┌────────────────────▼───────────┐
│  SoundSpace_    │◄────────────────────────►│      SoundSpaceBackend         │
│  Frontend       │   SignalR (WebSockets)   │      (ASP.NET Core Web API)    │
│  Next.js 16 /   │◄────────────────────────►│  Controllers → Services →      │
│  React 19       │  hubs/chat, hubs/presence│  EF Core → PostgreSQL          │
└─────────────────┘  hubs/spotify            └───────────────┬────────────────┘
                                                              │ shared
                                                    EF Core / │ DbContext
                                                    entities  │ + services
                                              internal webhook│ (same class
                                             (music-status-   │  library)
                                              changed)         │
                                              ▲                │
                                              │                │
                                     ┌────────┴────────────────▼────────┐
                                     │   SoundSpace_SpotifyWorker        │
                                     │   (.NET Worker Service)           │
                                     │   Polls Spotify per-user on       │
                                     │   independent schedules and       │
                                     │   writes directly to the shared   │
                                     │   PostgreSQL database             │
                                     └────────────────────────────────────┘
```

The three sub-projects don't form a pure microservice mesh — the **Backend API** and the **Spotify Worker** intentionally *share* the same Entity Framework Core `DbContext`, entity models, and Spotify service layer (the worker takes a direct project reference to the backend project rather than duplicating code). They coordinate primarily **through the shared PostgreSQL database** (eventually consistent) and through **one** direct, secret-authenticated internal HTTP call used purely to get sub-30-second "a friend just started listening to X" push notifications flowing over SignalR.

---

## Core Functionalities

| Area | What it does |
|---|---|
| **Spotify-native identity** | Login is Spotify OAuth2 only — no separate password account. A user's profile *is* their Spotify identity: avatar, display name, top artists/tracks, recent streams, and live "Now Playing" state. |
| **Social feed** | Users post text/media updates that can embed a Spotify track, album, or artist (with cover art and an optional 30-second preview clip), like and comment on posts, and view a global or per-event feed. |
| **Real-time presence & "Listen Along"** | Friends see each other's online status and current track live via SignalR; a "Listen Along" feature remote-controls the caller's Spotify playback to sync with a friend's current position. |
| **Friendship graph** | Send/accept/reject friend requests, view a friend activity feed enriched with live presence + music status, and browse a friend's list from any profile. |
| **Real-time messaging** | 1:1 and group chat with edit/delete, read receipts, typing/online indicators, and reporting/moderation tooling — powered by a dedicated SignalR chat hub. |
| **Events** | Users can create, discover (popular / recommended / by friends), and attend real-world or virtual music events, each with its own gated group chat, event-scoped post feed, and photo gallery. |
| **Music-based discovery** | A swipe-style discovery feed surfaces other users based on shared artists/genres and a **pgvector**-backed "audio vibe" similarity search, rather than static profile fields. |
| **Notifications** | In-app notifications for friend requests, event activity, and other social triggers, delivered via REST polling and SignalR push. |
| **Background Spotify sync** | A dedicated worker service keeps each connected user's top artists/tracks, recently-played history, and live now-playing state fresh without the frontend ever polling Spotify directly. |

---

## Architecture & Sub-Projects

SoundSpace is a **polyglot, three-process system** that runs together as one product. Each sub-project has a distinct runtime and responsibility:

| # | Sub-Project | Path | Role | Tech Stack |
|---|---|---|---|---|
| 1 | **SoundSpace_Frontend** | `SoundSpace_Frontend/sound_space` | Web client — every screen the user interacts with | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Zustand, TanStack Query, SignalR client, Leaflet |
| 2 | **SoundSpaceBackend** | `SoundSpace_Backend/SoundSpaceBackend` | REST API + real-time hub — business logic, auth, and the single source of truth for data | ASP.NET Core 10 Web API, Entity Framework Core, PostgreSQL + pgvector, SignalR, AutoMapper, JWT Bearer auth |
| 3 | **SoundSpace_SpotifyWorker** | `SoundSpace_Backend/SoundSpace_SpotifyWorker` | Background process — keeps Spotify data fresh for every connected user | .NET Worker Service (`BackgroundService`), reuses the Backend's EF Core context & services |

### 1. SoundSpace_Frontend (Web Client)

**Role:** The single web client for the whole platform — a Next.js App Router application rendering every page (feed, profile, messages, events, discovery) and holding all client-side real-time state.

**Tech stack:**

| Concern | Library |
|---|---|
| Framework | Next.js `16.1.6`, React `19.2.3`, TypeScript `^5` |
| Server-state / caching | `@tanstack/react-query` `^5` |
| Client / real-time state | `zustand` `^5` |
| Real-time transport | `@microsoft/signalr` `^10` |
| Styling | Tailwind CSS `^4` (PostCSS-native) + co-located per-component CSS files, `clsx` + `tailwind-merge` |
| Maps / geosearch | `leaflet`, `react-leaflet`, `leaflet-geosearch` |
| Icons | `lucide-react` |

**How it communicates with the other sub-projects:**
- **REST over HTTPS** to `SoundSpaceBackend` for all CRUD operations (posts, events, friendships, profiles, Spotify data), via a central `apiFetch` wrapper (`src/lib/apiClient.ts`) that attaches the JWT from an HttpOnly cookie and silently refreshes it once on a `401` before retrying.
- **Three separate SignalR (WebSocket) connections** directly to `SoundSpaceBackend`, each authenticated with the same JWT passed as an `access_token` query parameter (browsers can't set `Authorization` headers on WebSocket upgrades):
  - `hubs/chat` — messaging, event group chat, read receipts
  - `hubs/presence` — online/offline status, friend requests, live music-status pushes
  - `hubs/spotify` — live "Now Playing" progress updates
- It **never talks to `SoundSpace_SpotifyWorker` directly** — the worker's effects only become visible to the frontend indirectly, either through the database (via the Backend API) or through the SignalR events the Backend re-broadcasts on the worker's behalf.
- Spotify OAuth itself is fully delegated to the backend (BFF pattern): the frontend simply redirects the browser to the backend's `/auth` endpoint and later receives tokens back via a Next.js Route Handler at `/api/auth/callback`.

### 2. SoundSpaceBackend (API)

**Role:** The single source of truth. A layered ASP.NET Core 10 Web API exposing REST endpoints and three SignalR hubs, owning the PostgreSQL schema via Entity Framework Core.

**Tech stack:**

| Concern | Library / Version |
|---|---|
| Runtime | ASP.NET Core, `net10.0` |
| ORM | Entity Framework Core `10.0.3` + `Npgsql.EntityFrameworkCore.PostgreSQL` `10.0.0` |
| Vector similarity search | `Pgvector.EntityFrameworkCore` `0.2.0` (for music-taste-based discovery) |
| Auth | ASP.NET Core Identity + `Microsoft.AspNetCore.Authentication.JwtBearer` `10.0.3` |
| Object mapping | `AutoMapper` `16.1.1` |
| Real-time | `Microsoft.AspNetCore.SignalR` (built-in) |
| API docs | `Swashbuckle.AspNetCore` (Swagger UI, dev only) |
| Config | `DotNetEnv` (loads a local `.env` into configuration) |

**Layering:** `Controllers` (thin, HTTP + claims handling) → `Services` (interface + implementation per domain, business rules) → `ApplicationContext` (EF Core) → **PostgreSQL**.

**How it communicates with the other sub-projects:**
- Serves **REST + SignalR** to the frontend as described above; JWT issuance happens once, right after the Spotify OAuth callback completes.
- Exposes one **internal-only, shared-secret-protected** endpoint — `POST /api/internal/music-status-changed` (`Controllers/Internal/MusicStatusController.cs`) — that `SoundSpace_SpotifyWorker` calls whenever a user's listening state changes. The Backend validates the `X-Internal-Secret` header, looks up which of that user's friends are currently online (via an in-memory `PresenceTracker`), and re-broadcasts the update to them over the `PresenceHub`.
- Beyond that one webhook, it never calls the worker — all other coordination is **implicit, through shared PostgreSQL tables** that both processes read/write via the same EF Core entity classes.

### 3. SoundSpace_SpotifyWorker (Background Service)

**Role:** A headless **.NET Worker Service** (no web server, no Kestrel) that continuously polls the Spotify Web API on behalf of every connected user and keeps their listening data fresh in the shared database, so the Backend API never has to call Spotify synchronously on a user's behalf for read-heavy stats.

**Tech stack:** `net10.0` Worker Service (`Microsoft.NET.Sdk.Worker`), `Microsoft.Extensions.Hosting`, `AutoMapper`, `DotNetEnv` — and a **direct project reference to `SoundSpaceBackend`**, meaning it reuses the exact same `ApplicationContext`, entity classes, and Spotify service layer (`ISpotifyTokenService`, `ISpotifyPlayerService`, `IPreviewUrlService`) rather than duplicating any of it.

**Four independent hosted loops (`Worker/`):**

| Worker | Interval | Responsibility |
|---|---|---|
| `PollingWorker` | 15 min | Refreshes each user's top artists, top tracks, and recent streams from Spotify |
| `CurrentlyPlayingWorker` | 30 sec | Polls "now playing" (falls back to "recently played" when nothing is active); on any state change, writes to the DB **and** calls the Backend's internal webhook so friends get an instant push |
| `LikedSongsSyncWorker` | 1 hr (scaffolded) | Placeholder for a planned "sync liked songs" feature — currently just sleeps, not yet implemented |
| `AudioProfileWorker` | one-shot at startup | Backfills a `pgvector` "audio vibe" embedding for any user missing one (currently a deterministic mock vector, not real Spotify audio-features data — a known placeholder for the discovery-matching feature) |

**How it communicates with the other sub-projects:**
- **Shares the database** with `SoundSpaceBackend` — same connection string, same `ApplicationContext`, same entities (`Users`, `TopArtists`, `TopTracks`, `RecentStreams`, `UserCurrentlyPlaying`, `UserLastPlayed`, `UserAudioProfiles`). This is the primary coordination mechanism: eventually consistent, bounded by each loop's interval.
- Makes **one outbound HTTP call** to the Backend (`POST {MainApi:BaseUrl}/api/internal/music-status-changed`, authenticated with a shared secret) only when a user's now-playing state actually changes — this is the sole direct network coupling between the two backend processes.
- **Does not run EF Core migrations itself** — it assumes `SoundSpaceBackend` has already applied the schema (the Backend auto-migrates on startup), so in a fresh environment the API should be started at least once before/alongside the worker.

### Core Data Store

Both backend processes share one **PostgreSQL** database (via `ApplicationContext`, an `IdentityDbContext<User, IdentityRole<Guid>, Guid>`), extended with the **pgvector** extension for similarity search. Key tables include `Users`, `Posts`, `Comments`, `Likes`, `Friendships`, `Conversations`/`Messages`, `Events`/`EventAttendees`/`EventPhotos`, `Notifications`, `TopArtists`/`TopTracks`/`RecentStreams`, `UserCurrentlyPlaying`/`UserLastPlayed`, and `UserAudioProfiles` (the `vector(5)` embeddings used for taste-based discovery). Soft-delete query filters protect `Posts` and `Comments`; unique/composite indexes enforce one-like-per-user-per-post and one-friendship-per-pair invariants.

---

## Detailed Feature Breakdown

### Spotify OAuth & Identity
Login is initiated by the frontend redirecting the browser to the Backend's `GET /auth`, which redirects again to Spotify's authorization page. Spotify calls back to `GET /auth/callback` on the Backend, which exchanges the auth code for Spotify access/refresh tokens, fetches the user's Spotify profile, upserts a local `User` row (an ASP.NET Identity user extended with `SpotifyId`/tokens/profile fields), and issues the app's **own** JWT access token plus a rotating opaque refresh token (`AppRefreshToken`), both delivered to the frontend as HttpOnly cookies. Subsequent requests — both REST and SignalR — authenticate with that JWT; SignalR specifically extracts it from the `access_token` query string on the handshake since browsers cannot attach custom headers to WebSocket upgrades. Token refresh is handled transparently by the frontend's `apiFetch`, which retries once after a silent refresh on any `401`.

### Social Feed (Posts, Comments, Likes)
Users create posts that can stand alone or attach a Spotify track/album/artist (cover art, subtitle, URI) plus an optional trimmed preview clip. Posts can also be scoped to an `Event`, producing a dedicated per-event feed. Comments support one level of threaded replies and are soft-deleted (excluded from queries via an EF Core global query filter) rather than hard-deleted, preserving thread integrity. Likes are toggle-based with a unique `(PostId, UserId)` constraint preventing duplicates; a single shared `AudioPlayerContext` on the frontend ensures only one preview clip plays at a time across the whole app.

### Friendships & Presence
Friend requests are directional (`Friendship` with `SenderId`/`ReceiverId`/`FriendshipStatus`), with a unique constraint on the pair to prevent duplicate requests. Presence itself is tracked in-memory on the Backend via a thread-safe `PresenceTracker` singleton mapping user IDs to active SignalR connection IDs (supporting multiple simultaneous connections per user, e.g. multiple browser tabs). The "friend activity" endpoint merges relational friendship data with this live presence state and each friend's current/last-played track, giving the frontend's friend sidebar a single call that returns "who's online and what are they listening to right now."

### Real-Time Messaging
Chat is powered by a dedicated `ChatHub` (SignalR). On connect, a user is placed into a SignalR group per conversation they belong to plus a personal group; the server tracks a separate presence set (`ChatPresenceTracker`) just for chat purposes. Supported operations — `SendMessage`, `EditMessage`, `DeleteMessage` (soft delete), `MarkMessagesAsRead` — broadcast to the relevant group in real time, and the frontend's `ChatHubContext` mirrors all of it into a Zustand `messageStore` (including optimistic-message reconciliation for messages sent before the server confirms them). Messages can be reported by any participant for moderation, and an admin-only endpoint (`[Authorize(Roles = "Admin")]`) can retrieve full conversation history including soft-deleted messages via `IgnoreQueryFilters()`.

### Events (Creation, Attendance, Group Chat, Photos)
Events represent real-world or virtual music gatherings (concerts, listening parties) with title, artist/genre info, location (with geo-coordinates surfaced on a Leaflet map), date/time, and a ticket link. Users can create events, toggle their own attendance, and browse events through several curated views (popular, recommended, hosted by friends, created by me, attending). Each event optionally owns a 1:1 **group `Conversation`** (created lazily on first access) so attendees get a dedicated group chat reachable through the same `ChatHub` infrastructure via `JoinEventGroup`/`LeaveEventGroup`. Events also have their own **scoped post feed** and a **photo gallery** (`EventPhotosController`), with uploads validated server-side (5 MB limit, `jpg/jpeg/png/webp` only) and served as static files from `wwwroot/uploads`. Non-attendees see a gated preview (`EventGate` component) rather than full event content.

### Music-Based Discovery
The discovery feed is a swipe-style interface (`/discovery`) that surfaces other users to connect with, based on musical compatibility rather than self-reported bios. Compatibility is computed two ways: (1) direct overlap in top artists/genres ("common songs"/shared-artist display), and (2) a **pgvector**-backed nearest-neighbor search over a 5-dimensional `UserAudioProfile` embedding per user, enabling a `GetVibeMatchesAsync`-style "find similar taste" query directly in PostgreSQL. *(Note: the embedding generation is currently a deterministic placeholder vector rather than a real Spotify audio-features-derived embedding — flagged as a known area for future improvement.)*

### Now Playing & "Listen Along"
`SoundSpace_SpotifyWorker`'s `CurrentlyPlayingWorker` polls each connected user's Spotify playback every 30 seconds, falling back to "recently played" when nothing is active, and persists both a live `UserCurrentlyPlaying` row and a durable `UserLastPlayed` snapshot. Any change triggers a push to the Backend's internal webhook, which fans the update out to the user's online friends over `PresenceHub`. On top of this, the "Listen Along" feature (`POST /api/music/listen-along`) lets a user remote-control **their own** Spotify playback to jump to a friend's current track at the friend's estimated playback position (accounting for elapsed time since the last poll), handling Spotify's "no active device"/"premium required" error cases gracefully.

### Notifications
In-app notifications cover friend-request events and other social triggers (e.g., someone joining an event you created). They're stored per-user with a composite index optimized for "unread, newest first" queries, fetched via REST (`GET /api/notifications`) with a mark-as-read endpoint, and complemented by live SignalR pushes over the presence hub so the notification bell updates without a page refresh.

---

## Prerequisites & Installation

### Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| [.NET SDK](https://dotnet.microsoft.com/download) | 10.0+ | Builds both `SoundSpaceBackend` and `SoundSpace_SpotifyWorker` |
| [Node.js](https://nodejs.org/) | 20.x LTS+ | Runs the Next.js frontend |
| [PostgreSQL](https://www.postgresql.org/) | 15+ | With the [`pgvector`](https://github.com/pgvector/pgvector) extension installed and enabled |
| A [Spotify Developer](https://developer.spotify.com/dashboard) app | — | Provides `Client ID` / `Client Secret` and a registered Redirect URI for OAuth |
| `git` | any recent | To clone the repository |

### 1. Clone the repository

```bash
git clone <repository-url> Bachelor_Thesis
cd Bachelor_Thesis
```

### 2. Set up PostgreSQL + pgvector

```sql
CREATE DATABASE soundspace;
\c soundspace
CREATE EXTENSION IF NOT EXISTS vector;
```

### 3. Set up `SoundSpaceBackend`

Restore and apply the schema (migrations run automatically on startup, but you can apply them explicitly):

```bash
cd SoundSpace_Backend/SoundSpaceBackend
dotnet restore
dotnet ef database update
```

### 4. Set up `SoundSpace_SpotifyWorker`

```bash
cd SoundSpace_Backend/SoundSpace_SpotifyWorker
dotnet restore
```

### 5. Set up `SoundSpace_Frontend`

```bash
cd SoundSpace_Frontend/sound_space
npm install
```

---

## Usage / Running the Application

All three processes must be running simultaneously for the full feature set (background Spotify sync + live "friend is listening" pushes) to work. In development, running just the Backend + Frontend is enough to use the app; the Worker is needed for automatic Spotify data refresh.

### Run individually (3 terminals)

**Terminal 1 — Backend API**
```bash
cd SoundSpace_Backend/SoundSpaceBackend
dotnet run
# → https://localhost:7050 (Swagger UI at /swagger in Development)
```

**Terminal 2 — Spotify Worker**
```bash
cd SoundSpace_Backend/SoundSpace_SpotifyWorker
dotnet run
# → headless process, no HTTP endpoint; logs polling activity to the console
```

**Terminal 3 — Frontend**
```bash
cd SoundSpace_Frontend/sound_space
npm run dev
# → http://localhost:3000
```

Then open **http://localhost:3000** and log in with Spotify.

### Available frontend scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the Next.js dev server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

### Available backend commands

| Command | Purpose |
|---|---|
| `dotnet run` | Start the API (or the Worker, run from its own folder) |
| `dotnet ef migrations add <Name>` | Add a new EF Core migration (run from `SoundSpaceBackend/`) |
| `dotnet ef database update` | Apply pending migrations |
| `dotnet build` | Compile without running |

---

## Contributing & License

### Contributing

This repository originated as a Bachelor's Thesis project. Contributions, issues, and suggestions are welcome:

1. Fork the repository and create a feature branch: `git checkout -b feature/my-feature`
2. Commit your changes with clear, descriptive messages
3. Ensure the frontend passes `npm run lint` and the backend builds cleanly with `dotnet build`
4. Open a Pull Request describing the change and its motivation

Please avoid committing `.env` files or any real Spotify credentials/secrets.

