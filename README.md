# itsturkey

Street View geography guessing. **This site uses open-source code from [GeoHub](https://github.com/benlikescode/geohub)** (fork/customizations here). Maps credentials, APIs, and hosting for this deployment are **yours**, not GeoHub’s.

This fork adds MultiGuessr, homepage gamemodes, equitable streaks, site password gate, and deployment-focused env tweaks.

**Source code:** [benlikescode/geohub](https://github.com/benlikescode/geohub) · **This repo:** [olivertransf/itsturkey](https://github.com/olivertransf/itsturkey)

## Run locally

1. Clone the repo and install dependencies (`yarn`).
2. Copy env vars from GeoHub’s README or start with:

```env
NEXT_PUBLIC_GOOGLE_API_KEY=
MONGO_URI=
DB_NAME=
NEXTAUTH_SECRET=
CRYPTR_SECRET=
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_MAPBOX_API_KEY=
```

3. Optional: `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_HOME_MAP_CARDS`, `SITE_PASSWORD` (middleware gate). See repo scripts under `scripts/` for map import helpers.
4. `yarn dev` → [http://localhost:3000](http://localhost:3000)

### Sharing maps with people who clone the repo

Mongo data is not in git. To let someone run your maps locally or in their own Mongo:

1. **Export** from your database (writes `seed-data/private/maps-bundle.json` by default; that folder is gitignored so large dumps stay local):

   ```bash
   yarn maps:export-bundle --from-home-env
   # or: yarn maps:export-bundle --map-ids "<hex>,<hex>"
   # optional sample for a small commit: --max-locations-per-map 500 --out seed-data/sample/maps-bundle.json
   ```

2. **Share the bundle** out of band, or commit a **small** sample under something like `seed-data/sample/` if you cap pins.

3. **Import** on the other machine (same `MONGO_URI` / `DB_NAME` in `.env`):

   ```bash
   yarn maps:import-bundle --file ./seed-data/private/maps-bundle.json
   # Custom maps: map owner must exist — pass your local users._id if IDs differ:
   # yarn maps:import-bundle --file ./path/to/bundle.json --creator-user-id "<hex>"
   ```

4. Copy your **`NEXT_PUBLIC_HOME_MAP_CARDS`** JSON into their `.env` so homepage cards match the exported map IDs (IDs are preserved by default).

Single-map JSON imports without a bundle still use `scripts/import-custom-map-from-json.mjs`.

Docker, FAQ, and detailed Maps API setup live in the **[upstream GeoHub README](https://github.com/benlikescode/geohub/blob/main/README.md)**.

## Stack

Next.js, NextAuth, MongoDB, styled-components, Google Maps — same as GeoHub.
