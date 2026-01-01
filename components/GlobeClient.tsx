'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { SettingsIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type GlobeTypeImport from 'react-globe.gl';
import type { GlobeMethods, GlobeProps } from 'react-globe.gl';
import * as solar from 'solar-calculator';
import type { ShaderMaterial } from 'three';
import { usePref } from 'usepref';
import { getNodesAction } from '@/app/actions';
import { Controls } from '@/components/Controls';
import { Button } from '@/components/ui/button';
import { QUERY_KEY } from '@/lib/constants';
import { getGlobeDayNightShader } from '@/lib/shaders';
import { PREFERENCE } from '@/providers/preferences-provider';

// Dynamically import Globe to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false }) as typeof GlobeTypeImport;

interface Point {
  lat: number;
  lng: number;
  size: number;
  color: string;
  city: string | null;
  country: string | null;
  n: number;
  altitude: number;
}

type Dimensions = {
  height: number;
  width: number;
};

export default function GlobeClient() {
  const globeRef = useRef<GlobeProps & GlobeMethods>(null);

  const [loadingText, setLoadingText] = useState<string>('Initializing...');
  const [hoverText, setHoverText] = useState<string>('');
  const [dt, setDt] = useState(Date.now());
  const [globeMaterial, setGlobeMaterial] = useState<ShaderMaterial>();

  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });

  const { getItem } = usePref();
  const disableLiveData = !!getItem<boolean>(PREFERENCE.DISABLE_LIVE_DATA);
  const disableAutoRotate = !!getItem<boolean>(PREFERENCE.DISABLE_AUTO_ROTATE);
  const disableRealTime = !!getItem<boolean>(PREFERENCE.DISABLE_REAL_TIME);
  const hideMilkyWay = !!getItem<boolean>(PREFERENCE.HIDE_MILKY_WAY);

  const { data, error, isPending, isError } = useSuspenseQuery({
    queryKey: [QUERY_KEY.NODE_LIST],
    queryFn: getNodesAction,
    refetchInterval: disableLiveData ? false : 600_000,
  });

  useEffect(() => {
    if (isError && error.message) {
      setLoadingText(error.message);
    } else if (isPending) {
      setLoadingText('Fetching Session Node List');
    }
  }, [isError, isPending, error]);

  useEffect(() => {
    const updateSize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const points = useMemo(() => {
    const [err, nodes] = data;

    if (err) {
      setLoadingText(`Failed to fetch nodes ${err.message}`);
      return;
    }

    if (!Array.isArray(nodes) || nodes.length === 0) {
      setLoadingText('No Session Nodes found.');
      return;
    }

    const growthPerPointAlt = 0.001;
    const pts: Point[] = nodes
      .filter((r) => r.lat != null && r.lng != null)
      .map((r) => ({
        lat: r.lat as number,
        lng: r.lng as number,
        size: 0.25,
        altitude: 0.02 + r.n * growthPerPointAlt,
        n: r.n,
        color: '#00f782',
        city: r.city,
        country: r.country,
      }));

    if (pts.length === 0) {
      setLoadingText('No valid Session Node locations found.');
      return;
    }

    let t = 0;
    for (let i = 0; i < pts.length; i++) {
      t += pts[i].n;
    }

    setLoadingText(`${t} Session Nodes in \n${pts.length} Cities`);
    return pts;
  }, [data]);

  const sunPosAt = useCallback((dt: number) => {
    const day = new Date(+dt).setUTCHours(0, 0, 0, 0);
    const t = solar.century(dt);
    const longitude = ((day - dt) / 864e5) * 360 - 180;
    return [longitude - solar.equationOfTime(t) / 4, solar.declination(t)];
  }, []);

  useEffect(() => {
    (function iterateTime() {
      setDt(Date.now());
      requestAnimationFrame(iterateTime);
    })();
  }, []);

  useEffect(() => {
    getGlobeDayNightShader('/8k_earth_daymap.jpg', '/8k_earth_nightmap.jpg', !disableRealTime)
      .then((shader) => setGlobeMaterial(shader))
      .catch((e) => {
        setLoadingText(e?.message || 'Failed to load globe shaders');
      });
  }, [disableRealTime]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: We need to trigger once it mounts
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = !disableAutoRotate;
      globeRef.current.controls().autoRotateSpeed = 0.1;
    }
  }, [globeRef.current, disableAutoRotate]);

  const onZoom = useCallback(
    ({ lng, lat }: { lng: number; lat: number }) =>
      globeMaterial?.uniforms.globeRotation.value.set(lng, lat),
    [globeMaterial],
  );

  useEffect(() => {
    // Update Sun position
    globeMaterial?.uniforms.sunPosition.value.set(...sunPosAt(dt));
  }, [dt, globeMaterial, sunPosAt]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <Globe
        //@ts-expect-error -- TODO: make a pr to this repo to fix their types
        ref={globeRef}
        globeMaterial={globeMaterial}
        backgroundImageUrl={hideMilkyWay ? '8k_stars.jpg' : '8k_stars_milky_way.jpg'}
        bumpImageUrl="/8081_earthbump4k.jpg"
        onZoom={onZoom}
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        //@ts-expect-error -- TODO: make a pr to this repo to fix their types
        pointAltitude={(p: Point) => p.altitude}
        //@ts-expect-error -- TODO: make a pr to this repo to fix their types
        pointColor={(p: Point) => p.color}
        //@ts-expect-error -- TODO: make a pr to this repo to fix their types
        pointRadius={(p: Point) => p.size}
        pointsTransitionDuration={250}
        showAtmosphere={true}
        //@ts-expect-error -- TODO: make a pr to this repo to fix their types
        onPointHover={(p: Point | null) => {
          if (p) {
            setHoverText(`${p.n} Nodes | ${p.city || 'Unknown'}, ${p.country || ''}`);
          } else {
            setHoverText('');
          }
        }}
        //@ts-expect-error -- TODO: make a pr to this repo to fix their types
        onPointClick={(p: Point | null) => {
          if (p) {
            globeRef.current?.pointOfView({ lat: p.lat, lng: p.lng }, 500);
          }
        }}
        width={dimensions.width}
        height={dimensions.height}
      />
      {loadingText ? (
        <div className="fixed top-2 start-1/2 bg-sidebar border-sidebar-border rounded-2xl px-3 py-2 w-max -translate-x-1/2">
          {loadingText}
        </div>
      ) : null}
      <Controls />
      {hoverText ? (
        <div className="bg-sidebar border-sidebar-border rounded-2xl px-3 py-2 w-max fixed bottom-4 start-1/2 -translate-x-1/2">
          {hoverText}
        </div>
      ) : null}
    </div>
  );
}
