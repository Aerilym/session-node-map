import { InfoDialog as InfoDialogRaw } from '@aerilym/info-dialog';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';

export function InfoDialog() {
  return (
    <InfoDialogRaw
      components={{
        Button,
        Dialog,
        DialogContent,
        DialogHeader,
        DialogTitle,
        DialogTrigger,
        DialogDescription,
        DialogFooter,
      }}
      options={{
        title: 'Session Network Node Map',
        description:
          'A 3D globe visualization of the Session Node Network which powers the private messaging app Session',
        sourceUrl: 'https://github.com/aerilym/session-node-map',
      }}
    />
  );
}
