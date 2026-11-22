# Vibe2Fix Store

An e-commerce store for precision hardware: React frontend, Express + Prisma backend, PostgreSQL database.

Your task: find the security problems in this code and fix them, without breaking the store.

## Run it locally

You need [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine with Compose).

```bash
docker compose up --build
```

The first build takes a few minutes. When you see `Vibe2Fix backend listening`, open **http://localhost:8000**.
(The log says port 5000: that is inside the container. On your machine it is 8000.)

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Customer | `customer@vibe2fix.com` | `Demo@Vibe2024` |

These exist only in your local copy. You can also register new accounts.

### After changing code

Stop with **Ctrl+C**, then rebuild and start again:

```bash
docker compose up --build
```

### Start over with fresh data

```bash
docker compose down -v
docker compose up --build
```

## Project layout

| Folder | What it is |
|---|---|
| `server/src/routes/` | API routes |
| `server/src/controllers/` | Request handling |
| `server/src/services/` | Business logic and database queries |
| `server/src/middleware/` | Auth, input handling, uploads, error handling |
| `server/prisma/` | Database schema and demo data |
| `client/src/` | React frontend |

## Submitting

Follow the submission instructions from the organisers. Make sure the store still works after your changes: browsing, cart, checkout, orders, reviews and the admin panel.
