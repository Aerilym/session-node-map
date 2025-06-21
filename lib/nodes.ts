import { initLookup, lookupIp, type SingleGeoResult } from '@/lib/geolocate';
import { safeTry } from '@/lib/try';

export type FormattedResult = Omit<SingleGeoResult, 'ip' | 'error'> & {
  n: number;
  nActive: number;
};

const makeGroupId = (res: SingleGeoResult) => `${res.city}${res.country}`;

export async function getNodesUnsafe() {
  await initLookup(); // ensure DB is loaded
  const externalRes = await fetch('https://stake.getsession.org/api/ssb/nodes');
  if (!externalRes.ok) {
    const text = await externalRes.text();
    console.error('Error fetching nodes:', externalRes.status, text);
    throw new Error(`Failed to fetch nodes (status ${externalRes.status})`);
  }
  const data = await externalRes.json();
  if (!data.nodes || !Array.isArray(data.nodes)) {
    console.error('Unexpected format from nodes API:', data);
    throw new Error('Invalid response format from nodes API');
  }

  const network = data.network;

  // any node with an uptime in the past 48 hours is online
  const oldestUptime = network.block_timestamp - 48 * 60 * 60;

  const rawNodes = data.nodes as Array<{
    public_ip: string;
    active: boolean;
    last_uptime_proof: number;
  }>;
  const nodes = rawNodes.filter(({ last_uptime_proof }) => last_uptime_proof >= oldestUptime);
  const results: SingleGeoResult[] = nodes.map(({ public_ip }) => lookupIp(public_ip));

  const formattedResults = new Map<string, FormattedResult>();
  for (let i = 0; i < results.length; i++) {
    const res = results[i];
    const node = nodes[i];

    if (!res.lng || !res.lat || !res.country) {
      const nullRes = formattedResults.get('null');
      if (nullRes) {
        formattedResults.set('null', {
          ...nullRes,
          n: nullRes.n + 1,
          nActive: nullRes.nActive + (node.active ? 1 : 0),
        });
      } else {
        formattedResults.set('null', {
          lng: 0,
          lat: 0,
          country: 'Unknown',
          city: 'Unknown',
          n: 1,
          nActive: node.active ? 1 : 0,
        });
      }
      continue;
    }

    const groupId = makeGroupId(res);

    const bin = formattedResults.get(groupId);
    if (bin) {
      formattedResults.set(groupId, {
        ...bin,
        n: bin.n + 1,
        nActive: bin.nActive + (node.active ? 1 : 0),
      });
    } else {
      formattedResults.set(groupId, {
        n: 1,
        nActive: node.active ? 1 : 0,
        lat: res.lat,
        lng: res.lng,
        city: res.city,
        country: res.country,
      });
    }
  }

  return [...formattedResults.values()];
}
export async function getNodes() {
  return safeTry(getNodesUnsafe());
}
