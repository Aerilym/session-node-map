import maxmind from 'maxmind';

let cityLookup: {
  // biome-ignore lint/suspicious/noExplicitAny: TODO: type return
  get: (ip: string) => any;
  close: () => void;
} | null = null;
let initPromise: Promise<void> | null = null;

export async function initLookup() {
  if (cityLookup || initPromise) {
    return;
  }

  // Use require for geolite2-redist to match its CommonJS export style
  const geolite2 = require('geolite2-redist');
  initPromise = (async () => {
    try {
      // geolite2.open returns a lookup object (Promise or object)
      // According to docs, open(databaseName, readerFactory) returns a Promise or object.
      cityLookup = await geolite2.open('GeoLite2-City', (dbPath: string, _update: boolean) => {
        // readerFactory: return a Promise or Reader
        // maxmind.open returns a Promise resolving to Reader
        return maxmind.open(dbPath);
      });
      console.log('GeoLite2-City lookup initialized');
      // Note: do not call lookup.close() here; keep it open for reuse.
      // geolite2-redist auto-updates DB in background, and lookup may handle updates internally.
    } catch (err) {
      console.error('Failed to initialize GeoLite2 lookup:', err);
      // Reset cityLookup/initPromise so future attempts can retry
      cityLookup = null;
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}

export interface SingleGeoResult {
  ip: string;
  lat: number | null;
  lng: number | null;
  city: string | null;
  country: string | null;
  error: string | null;
}

export function lookupIp(ip: string): SingleGeoResult {
  if (!cityLookup) {
    return {
      ip,
      lat: null,
      lng: null,
      city: null,
      country: null,
      error: 'DB not initialized',
    };
  }
  try {
    const geo = cityLookup.get(ip);
    if (!geo || !geo.location) {
      return {
        ip,
        lat: null,
        lng: null,
        city: null,
        country: null,
        error: 'Not found',
      };
    }
    const { latitude, longitude } = geo.location;
    const cityName = geo.city?.names?.en ?? null;
    const countryName = geo.country?.names?.en ?? null;
    return {
      ip,
      lat: typeof latitude === 'number' ? latitude : null,
      lng: typeof longitude === 'number' ? longitude : null,
      city: typeof cityName === 'string' ? cityName : null,
      country: typeof countryName === 'string' ? countryName : null,
      error: null,
    };
  } catch (err) {
    return {
      ip,
      lat: null,
      lng: null,
      city: null,
      country: null,
      error:
        err &&
        typeof err === 'object' &&
        'message' in err &&
        err.message &&
        typeof err.message === 'string'
          ? err.message
          : 'Lookup error',
    };
  }
}
