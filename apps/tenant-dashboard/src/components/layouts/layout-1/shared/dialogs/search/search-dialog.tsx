import { ReactNode } from 'react';

interface SearchDialogProps {
  trigger: ReactNode;
}

export function SearchDialog({ trigger }: SearchDialogProps) {
  return <>{trigger}</>;
}
