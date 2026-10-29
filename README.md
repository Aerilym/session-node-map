# Session Node Map

A 3D globe visualization of the [Session Node Network](https://token.getsession.org/staking) which powers the private
messaging app [Session](https://getsession.org).

This is hosted at https://nodemap.aerilym.com/

## Data

The site is a static export. `scripts/generate-nodes.ts` fetches the node list from the
[Session Staking Portal API](https://stake.getsession.org), resolves each node's location and writes the per-city counts to
`nodes.json`; clients only ever load that file from the host and re-fetch it every 10 minutes. Node IPs never reach the
client.

`pnpm build` writes `public/nodes.json` before building. To keep a deployed site current, re-run the script against the
served copy, for example from cron every 10 minutes:

```sh
pnpm generate-nodes out/nodes.json
```

Geolocation data is sourced from [MaxMind GeoLite2](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data).

## Attributions

The geolocation mapping data used in this project is provided
by [MaxMind GeoLite2](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data).

Earth and Star images used in this project are provided
by [Solar System Scope](https://www.solarsystemscope.com/textures/).
