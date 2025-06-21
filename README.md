# Session Node Map

A 3D globe visualization of the [Session Node Network](https://token.getsession.org/staking) which powers the private
messaging app [Session](https://getsession.org).

This is hosted at https://nodemap.aerilym.com/

## Data

All external data fetching and processing happens on the server, clients will only need to communicate with the host
server.

The map sources its node data from the [Session Staking Portal API](https://stake.getsession.org) which updates its data
every 2-minutes, in line with when a new block is produced.

Geolocation data is sourced from [MaxMind GeoLite2](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data) and is
resolved on the server for each request of the node list.

## Attributions

The geolocation mapping data used in this project is provided
by [MaxMind GeoLite2](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data).

Earth and Star images used in this project are provided
by [Solar System Scope](https://www.solarsystemscope.com/textures/).
