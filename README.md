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

Docker, FAQ, and detailed Maps API setup live in the **[upstream GeoHub README](https://github.com/benlikescode/geohub/blob/main/README.md)**.

## Stack

Next.js, NextAuth, MongoDB, styled-components, Google Maps — same as GeoHub.
