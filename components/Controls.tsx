'use client';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { usePref } from 'usepref';
import { Switch } from '@/components/ui/switch';
import { DialogTrigger, Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { PREFERENCE } from '@/providers/preferences-provider';
import { Button } from './ui/button';
import { SettingsIcon } from 'lucide-react';

type ControlItem = {
  label: string;
  key: PREFERENCE;
  description?: string;
};

const controls: Array<ControlItem> = [
  {
    label: 'Live Data',
    key: PREFERENCE.DISABLE_LIVE_DATA,
  },
  {
    label: 'Auto Rotate',
    key: PREFERENCE.DISABLE_AUTO_ROTATE,
  },
  {
    label: 'Real Time ',
    description: 'Show the current real-time day/night cycle',
    key: PREFERENCE.DISABLE_REAL_TIME,
  },
  {
    label: 'Detailed Milky Way Background',
    key: PREFERENCE.HIDE_MILKY_WAY,
  },
] as const;

function ControlSwitchItem({ item }: { item: ControlItem }) {
  const { setItem, getItem } = usePref();
  const [isDisabled, setIsDisabled] = useState(!!getItem<boolean>(item.key));

  const updateSettingsItem = useCallback(
    (key: string, value: boolean) => {
      setItem(key, !value);
      setIsDisabled(!value);
    },
    [setItem],
  );

  return (
    <div className="flex flex-row justify-between align-middle items-center">
      <div className="flex flex-col">
        <span className="inline-flex w-full flex-row items-center justify-between align-middle text-base font-medium leading-none">
          {item.label}
        </span>
        <p className="font-normal text-xs">{item.description}</p>
      </div>
      <Switch
        checked={!isDisabled}
        onCheckedChange={(checked) => updateSettingsItem(item.key, checked)}
      />
    </div>
  );
}

export function Controls() {
  return (
    <Dialog>
      <DialogTrigger asChild className="flex flex-row fixed top-2 end-2">
        <Button size="icon" variant="ghost" className="rounded-full">
          <SettingsIcon className="h-8 w-8" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Settings </DialogTitle>
        {controls.map((item) => (
          <ControlSwitchItem key={item.key} item={item} />
        ))}
      </DialogContent>
    </Dialog>
  );
}
