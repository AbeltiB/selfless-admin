'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { StepType } from 'selfless-sdk';
import type { Workflow, WorkflowStep, WorkflowTransition } from 'selfless-sdk';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { GitBranch, Plus, Edit2, Trash2, ArrowRight, CheckCircle, Circle, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const STEP_TYPE_LABELS: Record<StepType, string> = {
  [StepType.SERVICE]: 'Service',
  [StepType.PAYMENT]: 'Payment',
  [StepType.DOCUMENT_REVIEW]: 'Document Review',
  [StepType.APPROVAL]: 'Approval',
  [StepType.VERIFICATION]: 'Verification',
  [StepType.CUSTOM]: 'Custom',
};

const STEP_TYPE_COLORS: Record<StepType, string> = {
  [StepType.SERVICE]: 'bg-blue-100 text-blue-700',
  [StepType.PAYMENT]: 'bg-green-100 text-green-700',
  [StepType.DOCUMENT_REVIEW]: 'bg-orange-100 text-orange-700',
  [StepType.APPROVAL]: 'bg-amber-100 text-amber-700',
  [StepType.VERIFICATION]: 'bg-purple-100 text-purple-700',
  [StepType.CUSTOM]: 'bg-slate-100 text-slate-700',
};

export default function WorkflowsPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Workflow | null>(null);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showStepModal, setShowStepModal] = useState(false);
  const [showTransModal, setShowTransModal] = useState(false);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [editingTrans, setEditingTrans] = useState<WorkflowTransition | null>(null);

  const [wfForm, setWfForm] = useState({ name: '', description: '' });
  const [stepForm, setStepForm] = useState({ name: '', stepType: StepType.SERVICE, order: '1', slaMinutes: '', isInitial: false, isFinal: false });
  const [transForm, setTransForm] = useState({ sourceStepId: '', destinationStepId: '', label: '', order: '0' });

  // Workflows list
  const { data: workflows = [], isLoading } = useQuery<Workflow[]>({
    queryKey: ['workflows'],
    queryFn: async () => {
      const res = await api.get('/workflows');
      return res.data.data ?? res.data;
    },
  });

  // Selected workflow with steps + transitions
  const { data: detail } = useQuery<Workflow>({
    queryKey: ['workflow', selected?.id],
    queryFn: async () => {
      const res = await api.get(`/workflows/${selected!.id}`);
      return res.data.data ?? res.data;
    },
    enabled: !!selected?.id,
  });

  const steps = (detail?.steps ?? []).sort((a, b) => a.order - b.order);
  const transitions = detail?.transitions ?? [];

  // Workflow CRUD
  const createWf = useMutation({
    mutationFn: (d: typeof wfForm) => api.post('/workflows', d),
    onSuccess: (res) => { qc.invalidateQueries({ queryKey: ['workflows'] }); toast.success('Workflow created'); setShowWorkflowModal(false); setSelected(res.data.data); },
    onError: () => toast.error('Failed to create workflow'),
  });
  const updateWf = useMutation({
    mutationFn: ({ id, ...d }: typeof wfForm & { id: string }) => api.patch(`/workflows/${id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workflows'] }); qc.invalidateQueries({ queryKey: ['workflow', selected?.id] }); toast.success('Workflow updated'); setShowWorkflowModal(false); },
    onError: () => toast.error('Failed to update workflow'),
  });

  // Step CRUD
  const createStep = useMutation({
    mutationFn: (d: any) => api.post(`/workflows/${selected!.id}/steps`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workflow', selected?.id] }); toast.success('Step added'); setShowStepModal(false); },
    onError: () => toast.error('Failed to add step'),
  });
  const updateStep = useMutation({
    mutationFn: ({ id, ...d }: any) => api.patch(`/workflows/${selected!.id}/steps/${id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workflow', selected?.id] }); toast.success('Step updated'); setShowStepModal(false); },
    onError: () => toast.error('Failed to update step'),
  });
  const deleteStep = useMutation({
    mutationFn: (id: string) => api.delete(`/workflows/${selected!.id}/steps/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workflow', selected?.id] }); toast.success('Step removed'); },
    onError: () => toast.error('Failed to remove step'),
  });

  // Transition CRUD
  const createTrans = useMutation({
    mutationFn: (d: any) => api.post(`/workflows/${selected!.id}/transitions`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workflow', selected?.id] }); toast.success('Transition added'); setShowTransModal(false); },
    onError: () => toast.error('Failed to add transition'),
  });
  const updateTrans = useMutation({
    mutationFn: ({ id, ...d }: any) => api.patch(`/workflows/${selected!.id}/transitions/${id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workflow', selected?.id] }); toast.success('Transition updated'); setShowTransModal(false); },
    onError: () => toast.error('Failed to update transition'),
  });
  const deleteTrans = useMutation({
    mutationFn: (id: string) => api.delete(`/workflows/${selected!.id}/transitions/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workflow', selected?.id] }); toast.success('Transition removed'); },
    onError: () => toast.error('Failed to remove transition'),
  });

  const openCreateWf = () => { setWfForm({ name: '', description: '' }); setShowWorkflowModal(true); };
  const openEditWf = (wf: Workflow) => { setWfForm({ name: wf.name, description: wf.description ?? '' }); setShowWorkflowModal(true); };

  const openCreateStep = () => {
    setEditingStep(null);
    setStepForm({ name: '', stepType: StepType.SERVICE, order: String(steps.length + 1), slaMinutes: '', isInitial: steps.length === 0, isFinal: false });
    setShowStepModal(true);
  };
  const openEditStep = (step: WorkflowStep) => {
    setEditingStep(step);
    setStepForm({ name: step.name, stepType: step.stepType, order: String(step.order), slaMinutes: step.slaMinutes ? String(step.slaMinutes) : '', isInitial: step.isInitial, isFinal: step.isFinal });
    setShowStepModal(true);
  };

  const openCreateTrans = () => {
    setEditingTrans(null);
    setTransForm({ sourceStepId: steps[0]?.id ?? '', destinationStepId: steps[1]?.id ?? '', label: '', order: '0' });
    setShowTransModal(true);
  };
  const openEditTrans = (t: WorkflowTransition) => {
    setEditingTrans(t);
    setTransForm({ sourceStepId: t.sourceStepId, destinationStepId: t.destinationStepId, label: t.label ?? '', order: String(t.order) });
    setShowTransModal(true);
  };

  const handleStepSubmit = () => {
    const payload = { ...stepForm, order: parseInt(stepForm.order), slaMinutes: stepForm.slaMinutes ? parseInt(stepForm.slaMinutes) : undefined };
    editingStep ? updateStep.mutate({ id: editingStep.id, ...payload }) : createStep.mutate(payload);
  };
  const handleTransSubmit = () => {
    const payload = { ...transForm, order: parseInt(transForm.order) };
    editingTrans ? updateTrans.mutate({ id: editingTrans.id, ...payload }) : createTrans.mutate(payload);
  };

  const stepName = (id: string) => steps.find((s) => s.id === id)?.name ?? id;

  return (
    <div className="flex gap-6 h-full">
      {/* Left panel: workflow list */}
      <div className="w-72 shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Workflows</h2>
          <Button size="sm" onClick={openCreateWf}><Plus className="w-3.5 h-3.5" /> New</Button>
        </div>

        {isLoading ? <PageSpinner /> : workflows.length === 0 ? (
          <EmptyState icon={GitBranch} title="No workflows" description="Create a workflow to define service flows" />
        ) : (
          workflows.map((wf) => (
            <div key={wf.id}
              onClick={() => setSelected(wf)}
              className={`p-3 rounded-xl border-2 cursor-pointer transition-all hover:shadow-sm ${selected?.id === wf.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-slate-800 truncate">{wf.name}</p>
                <Badge variant={wf.isActive ? 'success' : 'muted'} className="ml-2 shrink-0">{wf.isActive ? 'On' : 'Off'}</Badge>
              </div>
              {wf.description && <p className="text-xs text-slate-500 truncate">{wf.description}</p>}
              <div className="flex items-center gap-2 mt-1.5">
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-400">{(wf.steps ?? []).length} steps</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Right panel: step + transition builder */}
      <div className="flex-1 min-w-0">
        {!selected ? (
          <div className="flex items-center justify-center h-64 rounded-xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 text-sm">Select a workflow to edit its steps and transitions</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Workflow header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{selected.name}</h3>
                {selected.description && <p className="text-sm text-slate-500">{selected.description}</p>}
              </div>
              <Button size="sm" variant="secondary" onClick={() => openEditWf(selected)}><Edit2 className="w-3.5 h-3.5" /> Edit</Button>
            </div>

            {/* Steps */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-slate-700">Steps</h4>
                <Button size="sm" onClick={openCreateStep}><Plus className="w-3.5 h-3.5" /> Add Step</Button>
              </div>
              {steps.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No steps yet — add one to define the flow</p>
              ) : (
                <div className="space-y-2">
                  {steps.map((step, i) => (
                    <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                        {step.order}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-800">{step.name}</p>
                          {step.isInitial && <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">Start</span>}
                          {step.isFinal && <span className="text-xs bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded">End</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${STEP_TYPE_COLORS[step.stepType]}`}>{STEP_TYPE_LABELS[step.stepType]}</span>
                          {step.slaMinutes && <span className="text-xs text-slate-400">SLA: {step.slaMinutes}m</span>}
                        </div>
                      </div>
                      {i < steps.length - 1 && <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />}
                      <div className="flex items-center gap-1 ml-auto shrink-0">
                        <Button size="sm" variant="ghost" onClick={() => openEditStep(step)}><Edit2 className="w-3.5 h-3.5" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteStep.mutate(step.id)}><Trash2 className="w-3.5 h-3.5 text-red-400" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Transitions */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-slate-700">Transitions</h4>
                <Button size="sm" onClick={openCreateTrans} disabled={steps.length < 2}><Plus className="w-3.5 h-3.5" /> Add Transition</Button>
              </div>
              {transitions.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">
                  {steps.length < 2 ? 'Add at least 2 steps first' : 'No transitions — add one to define routing'}
                </p>
              ) : (
                <div className="space-y-2">
                  {transitions.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm font-medium text-slate-700 truncate">{stepName(t.sourceStepId)}</span>
                        <ArrowRight className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="text-sm font-medium text-slate-700 truncate">{stepName(t.destinationStepId)}</span>
                        {t.label && <span className="text-xs text-slate-400 truncate">({t.label})</span>}
                        {t.condition && (
                          <span className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded shrink-0">
                            if {t.condition.field} {t.condition.operator} {String(t.condition.value)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button size="sm" variant="ghost" onClick={() => openEditTrans(t)}><Edit2 className="w-3.5 h-3.5" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteTrans.mutate(t.id)}><Trash2 className="w-3.5 h-3.5 text-red-400" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Workflow modal */}
      <Modal open={showWorkflowModal} onClose={() => setShowWorkflowModal(false)} title={selected ? 'Edit Workflow' : 'New Workflow'}>
        <div className="space-y-4">
          <Input label="Name" value={wfForm.name} onChange={(e) => setWfForm((f) => ({ ...f, name: e.target.value }))} placeholder="Customer Service Flow" required />
          <Input label="Description" value={wfForm.description} onChange={(e) => setWfForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional" />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowWorkflowModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={createWf.isPending || updateWf.isPending} onClick={() => selected ? updateWf.mutate({ id: selected.id, ...wfForm }) : createWf.mutate(wfForm)} disabled={!wfForm.name}>
              {selected ? 'Save' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Step modal */}
      <Modal open={showStepModal} onClose={() => setShowStepModal(false)} title={editingStep ? 'Edit Step' : 'Add Step'}>
        <div className="space-y-4">
          <Input label="Step Name" value={stepForm.name} onChange={(e) => setStepForm((f) => ({ ...f, name: e.target.value }))} placeholder="Registration" required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" value={stepForm.stepType} onChange={(e) => setStepForm((f) => ({ ...f, stepType: e.target.value as StepType }))}
              options={Object.values(StepType).map((t) => ({ value: t, label: STEP_TYPE_LABELS[t] }))} />
            <Input label="Order" type="number" min={1} value={stepForm.order} onChange={(e) => setStepForm((f) => ({ ...f, order: e.target.value }))} required />
          </div>
          <Input label="SLA (minutes, optional)" type="number" min={1} value={stepForm.slaMinutes} onChange={(e) => setStepForm((f) => ({ ...f, slaMinutes: e.target.value }))} placeholder="e.g. 15" />
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={stepForm.isInitial} onChange={(e) => setStepForm((f) => ({ ...f, isInitial: e.target.checked }))} className="rounded" />
              Initial step (entry point)
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={stepForm.isFinal} onChange={(e) => setStepForm((f) => ({ ...f, isFinal: e.target.checked }))} className="rounded" />
              Final step (exit point)
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowStepModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={createStep.isPending || updateStep.isPending} onClick={handleStepSubmit} disabled={!stepForm.name}>
              {editingStep ? 'Save' : 'Add Step'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Transition modal */}
      <Modal open={showTransModal} onClose={() => setShowTransModal(false)} title={editingTrans ? 'Edit Transition' : 'Add Transition'}>
        <div className="space-y-4">
          <Select label="From Step" value={transForm.sourceStepId} onChange={(e) => setTransForm((f) => ({ ...f, sourceStepId: e.target.value }))}
            options={steps.map((s) => ({ value: s.id, label: `${s.order}. ${s.name}` }))} />
          <Select label="To Step" value={transForm.destinationStepId} onChange={(e) => setTransForm((f) => ({ ...f, destinationStepId: e.target.value }))}
            options={steps.map((s) => ({ value: s.id, label: `${s.order}. ${s.name}` }))} />
          <Input label="Label (optional)" value={transForm.label} onChange={(e) => setTransForm((f) => ({ ...f, label: e.target.value }))} placeholder="e.g. Approved, Rejected" />
          <Input label="Order" type="number" min={0} value={transForm.order} onChange={(e) => setTransForm((f) => ({ ...f, order: e.target.value }))} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowTransModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={createTrans.isPending || updateTrans.isPending} onClick={handleTransSubmit} disabled={!transForm.sourceStepId || !transForm.destinationStepId}>
              {editingTrans ? 'Save' : 'Add Transition'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
