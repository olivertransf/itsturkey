# itsturkey

Street View geography guessing game (GeoGuessr-style). Fork of **[GeoHub](https://github.com/benlikescode/geohub)** with extra modes, equitable regional maps, and hub UX tuned for this deployment.

**Repos:** [olivertransf/itsturkey](https://github.com/olivertransf/itsturkey) (this fork) · [benlikescode/geohub](https://github.com/benlikescode/geohub) (upstream)

Production URL is yours to configure: set `NEXT_PUBLIC_SITE_URL` (and DNS). On Vercel, `VERCEL_URL` is used as a fallback for canonical/meta URLs (`components/Meta/Meta.tsx`).

---

## Repository layout & Vercel

This Git repository **is** the Next.js app: `package.json`, `pages/`, and `components/` live at the **repo root**.

When connecting **Vercel** → Project Settings → **Root Directory**, leave it **empty** (repository root). Do **not** set `geohub/` unless your remote actually contains a nested `geohub` folder (this project does not).

---

## Changes vs upstream GeoHub

Upstream remains the baseline for core guessing, maps, challenges, and accounts. Below is what **this fork adds or changes**.

### Homepage & hub UX

- **Gamemodes row**: Country streak (equitable lobby), MultiGuessr, Duels — compact row cards with shared **`HomeSectionRowCard`** styling (`accentColor`, title, optional description, actions).
- **Maps**: Homepage map tiles driven by **`NEXT_PUBLIC_HOME_MAP_CARDS`** (JSON array of `{ _id, name, description?, previewImg }`), rendered as **`HomeWorldCard`** row entries with per-map accent (`utils/helpers/homeMapAccent.ts`).
- **By country**: **`HomeEquitableCountryGrid`** — spotlight subset + link to **`/maps#equitable-by-country`** for the full equitable-country list.
- **By continent**: **`HomeEquitableContinentGrid`** — continent row cards + link to **`/maps#equitable-by-continent`**.
- **Browse maps** (`pages/maps/index.tsx`): Official maps pagination, equitable country grid, equitable continent grid, community maps — styling aligned with the home hub (`styles/MapsPage.Styled.tsx`, `styles/HomePage.Styled.tsx`).
- **Gamified shells**: Duel create/join flows use **`GamifiedCenterStage`** / **`GamifiedFormCard`** (`styles/GamifiedHubShell.Styled.tsx`). Site-wide gradients and tokens live in **`globals.css`** and related styled modules.

### Equitable country & continent maps (“virtual” standard maps)

Standard games can target regions **without** a separate Mongo map per country:

- **Country IDs**: `eqcountry-{iso2}` (e.g. `eqcountry-us`). Parsing/build helpers in **`utils/helpers/equitableCountryMapId.ts`**; backend mirror in **`backend/utils/equitableCountryMap.ts`**.
- **Continent IDs**: `eqcontinent-{slug}` with slug in **`utils/constants/iso2ContinentSlug.ts`** (`eu`, `na`, …). Helpers in **`utils/helpers/equitableContinentMapId.ts`**.
- **Pins**: Rounds sample from the same equitable-world-style pools used elsewhere; **`backend/utils/getLocations.ts`** resolves virtual IDs.
- **Guess-map framing**: Bounding boxes from **`utils/constants/countryBBox.json`** and **`utils/constants/continentBBox.json`** via **`backend/utils/equitableVirtualMapGuessBounds.ts`** so the guess map fits the region.
- **Map metadata**: **`backend/queries/getMapFromGame.ts`** synthesizes name/description/preview/bounds for virtual IDs so lobby and results stay coherent.
- **Public APIs**: **`GET /api/maps/equitable-by-country`** and **`GET /api/maps/equitable-by-continent`** — lists for homepage and browse (`backend/routes/maps/getEquitableCountryMapsList.ts`, `getEquitableContinentMapsList.ts`).
- **UI**: **`EquitableCountryRowCard`** / **`EquitableContinentRowCard`** — same row-card pattern as home, with flags for countries and continent accents (`utils/helpers/equitableCountryAccent.ts`, `equitableContinentAccent.ts`).

### MultiGuessr

- Homepage **MultiGuessr** opens **`GameSettingsModal`** instead of posting immediately (**`components/MultiGuessrCard/MultiGuessrCard.tsx`**).
- **`useGameStartFlow`** supports **`initialPlayMode: 'multi'`** and **`allowHomeMapPicker`** — rounds per panel, panel count, seconds per guess, movement toggles, optional “default settings” checkbox (**`components/GameStartForm/useGameStartFlow.ts`**).
- **Map list**: **`utils/loadMapPickerOptions.ts`** loads official maps (all browse pages), equitable country + continent rows, seeds from **`utils/constants/officialMaps.json`**, and optionally prepends **All Maps** (`mapId: 'all'`) for random-official-per-panel sessions (**`backend/routes/multi/createMultiSession.ts`**).
- **Picker UI**: **`MapPickerGrid`** — compact **home-style row cards** (left accent, thumbnail or flag, title + description, selected check) shared with duel map selection (**`components/MapPickerGrid/`**).

### Duels

- Full duel stack (Mongo **`duelSessions`**, HP vs points, timers, damage multipliers, ramp, short invite codes, **`/duel`**, **`/duel/join`**, **`/duel/[id]`**, HUD, recap, etc.) — see **`backend/utils/duelConstants.ts`**, **`backend/utils/resolveDuelInvite.ts`**, **`components/duel/`**.
- Round locations pull from the equitable-world union (**`DUEL_ROUND_LOCATION_POOL_ID`**).
- **Create duel** (`pages/duel/index.tsx`): Map choice uses **`MapPickerGrid`** + **`loadMapPickerOptions`** (no **All Maps** row — duels need a concrete map). **`mapName`** is sent on create for display/score-factor resolution.
- **Rematch readiness**: **`POST /api/duels/[id]/rematch-ready`** (**`backend/routes/duels/postDuelRematchReady.ts`**) coordinates follow-up duel flows from the client (**`components/duel/DuelRoomPanels.tsx`** / related types).

### Map picker exclusions & labeling

- **Famous Landmarks** is **not** offered in pickers (removed from **`officialMaps.json`** and filtered via **`MAP_PICKER_EXCLUDED_IDS`** in **`utils/constants/mapPicker.ts`**).
- The default world official map is labeled **Default World** in pickers while keeping the real Mongo id (**`OFFICIAL_WORLD_ID`** in **`utils/constants/random.ts`**).

### Equitable streaks

- **`/equitable-streaks`** — equitable country streak play; sourcing overrides via **`EQUITABLE_COUNTRY_STREAK_MAP_IDS`** or **`NEXT_PUBLIC_HOME_MAP_CARDS`** (**`backend/utils/getEquitableCountryStreakSourceMapIds.ts`**).

### Site-wide password gate

- If **`SITE_PASSWORD`** is set, **`middleware.ts`** redirects to **`/site-password`** until the cookie from **`pages/api/site-password.ts`** validates.

### Branding & ops defaults

- Site title defaults to **`itsturkey`** when **`NEXT_PUBLIC_SITE_NAME`** is unset (**`utils/constants/site.ts`**).
- **`INTERNAL_API_SECRET`** — internal score routes (**`pages/api/scores/update.ts`**).
- **`CRON_SECRET`** — cron APIs under **`pages/api/cron/`**.
- Optional **`NEXT_PUBLIC_DONATE_URL`** — quota modal link (**`components/modals/DailyQuotaModal/`**).

---

Docker, FAQ, and detailed Google Maps Platform setup: **[upstream GeoHub README](https://github.com/benlikescode/geohub/blob/main/README.md)**.

---

## Requirements

- **Node.js** 18–22 (`package.json` `engines`)
- **Yarn** (recommended; lockfile present)
- **MongoDB**
- Google Maps JavaScript API key (Street View); optional Mapbox for geocoder UI

## Local setup

```bash
yarn install
# Create `.env` in this directory — see tables below
yarn dev
```

App: [http://localhost:3000](http://localhost:3000)

Minimal `.env` starter:

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

**Core (auth + DB + maps)**

| Variable | Purpose |
| -------- | ------- |
| `MONGO_URI` | MongoDB connection string |
| `DB_NAME` | Database name |
| `NEXT_PUBLIC_GOOGLE_API_KEY` | Maps / Street View (client) |
| `NEXTAUTH_SECRET` | NextAuth signing |
| `NEXTAUTH_URL` | e.g. `http://localhost:3000` locally; production URL on Vercel |
| `CRYPTR_SECRET` | Encrypts sensitive user settings |

**Optional**

| Variable | Purpose |
| -------- | ------- |
| `NEXT_PUBLIC_MAPBOX_API_KEY` | Map search / geocoder components |
| `NEXT_PUBLIC_SITE_NAME` | Display name (default `itsturkey`) |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for meta tags |
| `NEXT_PUBLIC_HOME_MAP_CARDS` | JSON array for homepage **Maps** row + fallback hints for equitable streak sourcing |
| `SITE_PASSWORD` | If set, gates the whole site until unlock cookie |
| `SENDGRID_API_KEY` | Password reset / transactional email |
| `NEXT_PUBLIC_DONATE_URL` | Support link in quota modal |
| `INTERNAL_API_SECRET` | Protects internal score update routes |
| `CRON_SECRET` | Authorizes cron API routes |
| `EQUITABLE_COUNTRY_STREAK_MAP_IDS` | Override equitable streak source map IDs |

On **Vercel**, add the same keys in Project → Settings → Environment Variables. `VERCEL_URL` is injected automatically; prefer setting `NEXT_PUBLIC_SITE_URL` to your primary domain once DNS is stable.

## Scripts

| Command | Description |
| ------- | ----------- |
| `yarn dev` | Next.js dev server |
| `yarn build` / `yarn start` | Production build and serve |
| `yarn lint` | ESLint |
| `yarn test` | Jest |
| `yarn seed:dev` | Seed minimal dev data |
| `yarn maps:import-equitable` | Import equitable world map data |
| `yarn maps:split-equitable` | Split equitable data into weighted maps (optional `EQUITABLE_*` env tuning) |
| `yarn maps:export-bundle` | Export maps bundle from Mongo |
| `yarn maps:import-bundle` | Import maps bundle into Mongo |

Single-map JSON imports: `scripts/import-custom-map-from-json.mjs`.

## Sharing maps between environments

Mongo data is not in git.

1. Export (default output under `seed-data/private/`, gitignored):

   ```bash
   yarn maps:export-bundle --from-home-env
   # or: yarn maps:export-bundle --map-ids "<hex>,<hex>"
   ```

2. Share the bundle out of band (or commit a small documented sample).
3. Import on another deployment with matching `MONGO_URI` / `DB_NAME`:

   ```bash
   yarn maps:import-bundle --file ./seed-data/private/maps-bundle.json
   ```

4. Copy `NEXT_PUBLIC_HOME_MAP_CARDS` so homepage map rows match imported IDs.

## Deploy (Vercel checklist)

1. Import Git repo; **Root Directory**: blank (repo root).
2. Framework: **Next.js**; build/install defaults are fine.
3. Set **all required env vars** (Mongo must allow connections from Vercel/serverless egress IPs — e.g. Atlas `0.0.0.0/0` or Vercel-specific allowlisting per Mongo provider docs).
4. Redeploy after changing env.

CLI from this directory (optional): `vercel link` then `vercel --prod`.

---

## License / attribution

Respect the license and attribution of **[GeoHub](https://github.com/benlikescode/geohub)**. This fork may diverge further; upstream remains the baseline for core game behavior.
