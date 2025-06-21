import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import GlobeClient from '@/components/GlobeClient';
import { QUERY_KEY } from '@/lib/constants';
import { getNodes } from '@/lib/nodes';
import { createQueryClient } from '@/lib/query';

export default function GlobeSSR() {
  const queryClient = createQueryClient();

  queryClient.prefetchQuery({
    queryKey: [QUERY_KEY.NODE_LIST],
    queryFn: getNodes,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GlobeClient />
    </HydrationBoundary>
  );
}
