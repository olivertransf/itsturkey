# itsturkey

Street View geography guessing (GeoGuessr-style). Fork of **[GeoHub](https://github.com/benlikescode/geohub)** with equitable regional maps, MultiGuessr, duels, and hub UX changes. **Code layout, request flow, and fork details:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

**Repos:** [olivertransf/itsturkey](https://github.com/olivertransf/itsturkey) · [benlikescode/geohub](https://github.com/benlikescode/geohub) (upstream)

---

## Repo root

Commands and `package.json` live **here** (this folder). If your IDE opens a parent directory (e.g. `GeoGuessr/`), run:

```bash
cd geohub && yarn install && yarn dev
```

**Vercel → Root Directory:** empty if this app is the Git root; set `geohub` only if the remote keeps the app in that subfolder.

---

## Requirements

- Node **18–22**
- **Yarn**
- **MongoDB**
- `NEXT_PUBLIC_GOOGLE_API_KEY` (Street View); optional Mapbox for geocoder

## Setup

```bash
yarn install
# add .env — see below
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

Minimal `.env`:

```env
MONGO_URI=
DB_NAME=
NEXT_PUBLIC_GOOGLE_API_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
CRYPTR_SECRET=
NEXT_PUBLIC_MAPBOX_API_KEY=
```

### Environment

| Variable | Purpose |
| -------- | ------- |
| `MONGO_URI` | Mongo connection string |
| `DB_NAME` | Database name |
| `NEXT_PUBLIC_GOOGLE_API_KEY` | Maps / Street View (client) |
| `NEXTAUTH_SECRET` | NextAuth signing |
| `NEXTAUTH_URL` | App URL (local or prod) |
| `CRYPTR_SECRET` | Encrypts sensitive user fields |

| Variable | Purpose |
| -------- | ------- |
| `NEXT_PUBLIC_MAPBOX_API_KEY` | Geocoder / map search |
| `NEXT_PUBLIC_SITE_NAME` | Display name (default `itsturkey`) |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for meta (`components/Meta/Meta.tsx`; Vercel also has `VERCEL_URL`) |
| `NEXT_PUBLIC_HOME_MAP_CARDS` | JSON homepage map row + streak sourcing fallback |
| `SITE_PASSWORD` | Enables site-wide password gate (`middleware.ts`) |
| `SENDGRID_API_KEY` | Transactional email |
| `NEXT_PUBLIC_DONATE_URL` | Quota modal link |
| `INTERNAL_API_SECRET` | `pages/api/scores/update.ts` |
| `CRON_SECRET` | `pages/api/cron/*` |
| `EQUITABLE_COUNTRY_STREAK_MAP_IDS` | Override streak source maps |

On Vercel: Project → Environment Variables. Set `NEXT_PUBLIC_SITE_URL` to your primary domain when DNS is stable.

## Scripts

| Command | Description |
| ------- | ----------- |
| `yarn dev` | Dev server |
| `yarn build` / `yarn start` | Production |
| `yarn lint` | ESLint |
| `yarn test` | Jest |
| `yarn seed:dev` | Dev seed data |
| `yarn maps:import-equitable` | Import equitable world data |
| `yarn maps:split-equitable` | Split into weighted maps |
| `yarn maps:export-bundle` | Export maps from Mongo |
| `yarn maps:import-bundle` | Import bundle into Mongo |

Single-map JSON: `scripts/import-custom-map-from-json.mjs`.

## Maps between environments

1. `yarn maps:export-bundle --from-home-env` (or `--map-ids "id1,id2"`) → often `seed-data/private/` (gitignored).
2. Copy bundle out of band.
3. `yarn maps:import-bundle --file ./seed-data/private/maps-bundle.json` on the target DB.
4. Align `NEXT_PUBLIC_HOME_MAP_CARDS` with imported map IDs.

## Deploy (Vercel)

1. Connect repo; Root Directory as above.
2. Framework: Next.js (defaults OK).
3. Set env vars; Mongo must allow Vercel/serverless egress (see your host’s docs).
4. Redeploy after env changes.

Optional: `vercel link` then `vercel --prod`.

---

## License

Respect **[GeoHub](https://github.com/benlikescode/geohub)** license and attribution.
