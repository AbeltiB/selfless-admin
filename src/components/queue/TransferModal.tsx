'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { useServices, useTransferTicket } from '@/hooks/useServices';
import { ArrowRight } from 'lucide-react';

interface TransferModalProps {
  ticketId: string | null;
  branchId?: string;
  onClose: () => void;
}

export function TransferModal({ ticketId, branchId, onClose }: TransferModalProps) {
  const [toServiceId, setToServiceId] = useState('');
  const [notes, setNotes] = useState('');

  const { data: services = [] } = useServices(branchId);
  const transferMutation = useTransferTicket();

  const handleSubmit = async () => {
    if (!ticketId || !toServiceId) return;
    await transferMutation.mutateAsync({ ticketId, toServiceId, notes: notes || undefined });
    onClose();
    setToServiceId('');
    setNotes('');
  };

  const handleClose = () => {
    setToServiceId('');
    setNotes('');
    onClose();
  };

  return (
    <Modal open={!!ticketId} onClose={handleClose} title="Transfer Ticket" size="sm">
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-ct-50 rounded-lg border border-ct-200">
          <ArrowRight className="w-4 h-4 text-ct-400 shrink-0" />
          <p className="text-sm text-ct-600">
            The ticket will be moved to the selected service and re-enter the waiting queue with priority.
          </p>
        </div>

        <Select
          label="Transfer to Service"
          value={toServiceId}
          onChange={(e) => setToServiceId(e.target.value)}
          placeholder="Select service..."
          options={services.map((s) => ({ value: s.id, label: s.name }))}
        />

        <Input
          label="Notes (optional)"
          placeholder="Reason for transfer..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!toServiceId || transferMutation.isPending}
          >
            {transferMutation.isPending ? 'Transferring...' : 'Transfer'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
