'use client';

import type { ReactNode } from 'react';
import { PreferenceStorage, PreferencesProvider } from 'usepref';

export enum PREFERENCE {
  DISABLE_AUTO_ROTATE = 'disable_auto_rotate',
  DISABLE_REAL_TIME = 'disable_real_time',
  HIDE_MILKY_WAY = 'hide_milky_way',
  DISABLE_LIVE_DATA = 'disable_live_data',
}

const pref = new PreferenceStorage({ key: 'globe' });

export function PrefProvider({ children }: { children: ReactNode }) {
  return <PreferencesProvider preferenceStorage={pref}>{children}</PreferencesProvider>;
}
