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
    <Button
      size="lg"
      onClick={onCall}
      loading={loading}
      disabled={disabled}
      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-bold rounded-xl shadow-lg shadow-blue-200 transition-all hover:shadow-blue-300 hover:-translate-y-0.5"
    >
      <PhoneCall className="w-5 h-5" />
      Call Next
    </Button>
  );
}
