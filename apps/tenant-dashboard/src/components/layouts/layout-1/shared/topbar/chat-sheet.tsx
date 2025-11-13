import { ReactNode } from 'react';

interface ChatSheetProps {
  trigger: ReactNode;
}

export function ChatSheet({ trigger }: ChatSheetProps) {
  return <>{trigger}</>;
}
