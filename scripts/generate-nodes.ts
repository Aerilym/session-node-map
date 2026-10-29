import { rename, writeFile } from 'node:fs/promises';
import { downloadDbs, GeoIpDbName } from 'geolite2-redist';
import { getNodes } from '@/lib/nodes';

const target = process.argv[2] ?? 'public/nodes.json';

async function main() {
  // The library's own update check runs in the background and would be cut off by the exit below.
  // Its typings mark `path` as required, but it defaults to the directory open() reads from.
  await downloadDbs({ dbList: [GeoIpDbName.City] } as Parameters<typeof downloadDbs>[0]);
  const nodes = await getNodes();
  // The site may be serving the target while this runs, so it must never see a partial file.
  const tmp = `${target}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(nodes));
  await rename(tmp, target);
  console.log(`Wrote ${nodes.length} locations to ${target}`);
}

// geolite2-redist keeps an auto-update timer alive, so the process has to exit explicitly.
main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
