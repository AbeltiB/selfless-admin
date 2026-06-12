'use client';
import { Button } from '@/components/ui/Button';
import { PhoneCall } from 'lucide-react';

interface CallNextButtonProps {
  onCall: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function CallNextButton({ onCall, loading, disabled }: CallNextButtonProps) {
  return (
    <Button size="lg" onClick={onCall} loading={loading} disabled={disabled} className="px-8">
      <PhoneCall className="w-4 h-4" />
      Call Next
    </Button>
  );
}
