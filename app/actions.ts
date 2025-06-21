'use server';

import { getNodes } from '@/lib/nodes';

export async function getNodesAction() {
  return getNodes();
}
