# itsturkey

Street View geography guessing game (GeoGuessr-style), deployed at **[itsturkey.vercel.app](https://itsturkey.vercel.app)**.

This repo is a fork of **[GeoHub](https://github.com/benlikescode/geohub)**. Game logic and UI build on that codebase; API keys, MongoDB, SendGrid, and hosting are configured for **this deployment only**.

**Repos:** [olivertransf/itsturkey](https://github.com/olivertransf/itsturkey) (this fork) · [benlikescode/geohub](https://github.com/benlikescode/geohub) (upstream)

## Changes vs upstream GeoHub

Upstream is the baseline Street View guessing stack (solo games, maps, challenges, accounts). **This fork adds and rebrands** the following; treat this list as documentation of divergence, not a guarantee upstream lacks similar ideas in other branches.

### Duels (mode + API + persistence)

- **Backend**: MongoDB `duelSessions` documents with per-player HP and totals, configurable **HP vs points** modes, reactive round timers, damage multipliers, optional round ramp, round ledger (scores, distances, damage, HP after each round), provisional pins, locked guesses, recap dismissal, forfeit, and join/start/guess/pin/recap HTTP handlers under **`/api/duels`**.
- **Invites**: **`shortCode`** field with short alphanumeric codes (default length **4**, collision-retried on create); **`/api/duels/[id]/…`** resolves **`id`** as either a **24-char hex ObjectId** or a **short code** (`backend/utils/resolveDuelInvite.ts`, `duelShortCode.ts`).
- **Round locations**: Duel rounds sample from the **equitable-world** location union used elsewhere in this fork (`DUEL_ROUND_LOCATION_POOL_ID` in `backend/utils/duelConstants.ts`).
- **Client routes**: **`/duel`** (create/settings), **`/duel/join`**, **`/duel/[id]`** with strict segment validation and router-ready handling so bad links show Not Found instead of hanging.
- **Play UX**: Dedicated duel HUD (`DuelPlaySurface`, `DuelHpMeter`), **reaction timer** overlay while a round deadline is active, **centered lock-in** feedback after a successful guess, floating dock for locks/pin hints, **full-screen round recap** with HP transitions and damage emphasis (`DuelRoundOverview`), lobby/finish panels (`DuelRoomPanels`).
- **Payload**: Duel API/client payloads expose **`startingHpHost`** / **`startingHpGuest`** (and related duel settings) so the UI stays consistent with server rules.

### MultiGuessr (multiplayer branding)

- Homepage **`MultiGuessrCard`** and Multi lobby/results copy branded as **MultiGuessr**; multiplayer session bootstrap can derive map sources from **`NEXT_PUBLIC_HOME_MAP_CARDS`** when starting ad hoc sessions (`backend/routes/multi/createMultiSession.ts`).

### Equitable streaks & map tooling

- **`/equitable-streaks`** experience and sidebar entry for equitable country streak play.
- **Scripts**: import equitable world dataset (`yarn maps:import-equitable`), split into weighted maps (`yarn maps:split-equitable`, optional **`EQUITABLE_*`** tuning env vars), **`yarn maps:export-bundle`** / **`yarn maps:import-bundle`** for sharing map sets between environments, **`yarn seed:dev`** for dev fixtures, **`scripts/import-custom-map-from-json.mjs`** for single-map JSON imports.
- **`EQUITABLE_COUNTRY_STREAK_MAP_IDS`** (optional) overrides which map IDs feed equitable streak sourcing (`backend/utils/getEquitableCountryStreakSourceMapIds.ts`).

### Site-wide password gate

- **`middleware.ts`**: If **`SITE_PASSWORD`** is set, all routes redirect to **`/site-password`** until the unlock cookie matches **`pages/api/site-password.ts`** verification.

### Visual layer (“gamified” hub)

- Shared **`GamifiedCenterStage`** / **`GamifiedFormCard`** shells (`styles/GamifiedHubShell.Styled.tsx`) on duel flows; broader homepage/multi/layout styling and gradients (**`globals.css`**, hub/page styled modules) aligned with the same vibe.

### Deployment & branding defaults

- Default public site name **`itsturkey`** when **`NEXT_PUBLIC_SITE_NAME`** is unset (`utils/constants/site.ts`).
- Meta/canonical URLs respect **`NEXT_PUBLIC_SITE_URL`** with **`VERCEL_URL`** fallback (`components/Meta/Meta.tsx`).
- Operational secrets documented here: **`INTERNAL_API_SECRET`** (internal score routes), **`CRON_SECRET`** (cron APIs), optional **`NEXT_PUBLIC_DONATE_URL`**.

---

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
