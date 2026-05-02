# itsturkey

Street View geography guessing game (GeoGuessr-style), deployed at **[itsturkey.vercel.app](https://itsturkey.vercel.app)**.

This repo is a fork of **[GeoHub](https://github.com/benlikescode/geohub)**. Game logic and UI build on that codebase; API keys, MongoDB, SendGrid, and hosting are configured for **this deployment only**.

**Repos:** [olivertransf/itsturkey](https://github.com/olivertransf/itsturkey) (this fork) · [benlikescode/geohub](https://github.com/benlikescode/geohub) (upstream)

## What’s in this fork

- **Duels** — Head-to-head rounds with HP-style scoring, reaction timers, lock-in feedback, round recap; invite links support **short codes** (about four characters) as well as legacy session IDs.
- **Multiplayer sessions** — Lobby and shared games alongside classic solo modes.
- **Home hub** — Gamified shells for duel create/join and broader navigation.
- **Equitable streaks** — Country streak flows tuned with equitable map sourcing (see scripts below).
- **Site password** — Optional middleware gate via `SITE_PASSWORD`.
- **Deployment defaults** — Env-driven site name, homepage map cards, Vercel-friendly URLs.

For Docker, FAQ, and detailed Google Maps Platform setup, see the **[upstream GeoHub README](https://github.com/benlikescode/geohub/blob/main/README.md)**.

## Requirements

- **Node.js** 18–22 (`package.json` `engines`)
- **Yarn** (recommended; lockfile present)
- **MongoDB** database
- Google Maps JavaScript API key (Street View), optional Mapbox for geocoder UI

## Local setup

```bash
yarn install
# Create `.env` in this directory — minimal starter below
yarn dev
```

App: [http://localhost:3000](http://localhost:3000)

Minimal `.env` starter (fill values; optional keys are in the table):

```env
MONGO_URI=
DB_NAME=
NEXT_PUBLIC_GOOGLE_API_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
CRYPTR_SECRET=
NEXT_PUBLIC_MAPBOX_API_KEY=
```

### Environment variables

**Core (needed for auth + DB + maps)**

| Variable | Purpose |
|----------|---------|
| `MONGO_URI` | MongoDB connection string |
| `DB_NAME` | Database name |
| `NEXT_PUBLIC_GOOGLE_API_KEY` | Maps / Street View (client) |
| `NEXTAUTH_SECRET` | NextAuth signing |
| `NEXTAUTH_URL` | e.g. `http://localhost:3000` locally |
| `CRYPTR_SECRET` | Encrypts sensitive user settings |

**Optional**

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_MAPBOX_API_KEY` | Map search / geocoder components |
| `NEXT_PUBLIC_SITE_NAME` | Display name (default `itsturkey`) |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for meta tags |
| `NEXT_PUBLIC_HOME_MAP_CARDS` | JSON config for homepage map cards |
| `SITE_PASSWORD` | If set, gates the whole site until cookie unlock |
| `SENDGRID_API_KEY` | Password reset / transactional email |
| `NEXT_PUBLIC_DONATE_URL` | Support link in quota modal |
| `INTERNAL_API_SECRET` | Protects internal score update routes |
| `CRON_SECRET` | Authorizes cron API routes |
| `EQUITABLE_COUNTRY_STREAK_MAP_IDS` | Override equitable streak map IDs |

Production on Vercel: set the same vars in the project dashboard; `VERCEL_URL` is provided automatically.

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Next.js dev server |
| `yarn build` / `yarn start` | Production build and serve |
| `yarn lint` | ESLint |
| `yarn test` | Jest |
| `yarn seed:dev` | Seed minimal dev data (see script) |
| `yarn maps:import-equitable` | Import equitable world map data |
| `yarn maps:split-equitable` | Split equitable data into weighted maps |
| `yarn maps:export-bundle` | Export maps bundle from Mongo (for sharing) |
| `yarn maps:import-bundle` | Import maps bundle into Mongo |

Single-map JSON imports: `scripts/import-custom-map-from-json.mjs`.

## Sharing maps between clones

Mongo data is not in git.

1. **Export** (writes under `seed-data/private/` by default; gitignored):

   ```bash
   yarn maps:export-bundle --from-home-env
   # or: yarn maps:export-bundle --map-ids "<hex>,<hex>"
   ```

2. Share the bundle file out of band, or commit a **small** capped sample if you document it.

3. **Import** on another machine with matching `MONGO_URI` / `DB_NAME`:

   ```bash
   yarn maps:import-bundle --file ./seed-data/private/maps-bundle.json
   ```

4. Copy **`NEXT_PUBLIC_HOME_MAP_CARDS`** so homepage cards match imported map IDs.

## Deploy

Production builds target **Vercel** (`vercel --prod` from this directory when linked). Ensure all required env vars are set on the project.

## License / attribution

Respect the license and attribution of **[GeoHub](https://github.com/benlikescode/geohub)**. This fork may carry additional changes; upstream remains the baseline for core game behavior.
