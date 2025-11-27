import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/utils/formatters';
import { Portion, PeriodSummary } from '@/types';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';

interface PortionsProps {
  portions: Portion[];
  periodSummary: PeriodSummary | null;
  activePeriodId: string | undefined;
  onAdd: (portion: Omit<Portion, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Portion>) => void;
  onDelete: (id: string) => void;
}

export function Portions({ portions, periodSummary, activePeriodId, onAdd, onUpdate, onDelete }: PortionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPortion, setEditingPortion] = useState<Portion | null>(null);
  const [formData, setFormData] = useState({ name: '', budgetAmount: '', notes: '' });
  const [error, setError] = useState('');

  const openAddDialog = () => {
    setEditingPortion(null);
    setFormData({ name: '', budgetAmount: '', notes: '' });
    setError('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (portion: Portion) => {
    setEditingPortion(portion);
    setFormData({
      name: portion.name,
      budgetAmount: portion.budgetAmount.toString(),
      notes: portion.notes || ''
    });
    setError('');
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    const amount = parseInt(formData.budgetAmount.replace(/\./g, ''), 10);
    if (!amount || amount <= 0) {
      setError('Budget amount must be greater than 0');
      return;
    }
    if (!activePeriodId) {
      setError('No active period selected');
      return;
    }

    if (editingPortion) {
      onUpdate(editingPortion.id, {
        name: formData.name.trim(),
        budgetAmount: amount,
        notes: formData.notes.trim() || undefined
      });
    } else {
      onAdd({
        periodId: activePeriodId,
        name: formData.name.trim(),
        budgetAmount: amount,
        notes: formData.notes.trim() || undefined
      });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this budget category? All related expenses will also be deleted.')) {
      onDelete(id);
    }
  };

  if (!activePeriodId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No active period selected. Create a period first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      {periodSummary && (
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Budgeted</p>
            <p className="text-2xl font-bold">{formatCurrency(periodSummary.totalBudgeted)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Income</p>
            <p className="text-2xl font-bold">{formatCurrency(periodSummary.totalIncome)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Unallocated</p>
            <p className={`text-2xl font-bold ${periodSummary.unallocatedIncome < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(periodSummary.unallocatedIncome)}
            </p>
          </div>
        </div>
      )}

      {periodSummary && periodSummary.unallocatedIncome < 0 && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your budget exceeds your income by {formatCurrency(Math.abs(periodSummary.unallocatedIncome))}
          </AlertDescription>
        </Alert>
      )}

      {/* Add Button */}
      <Button onClick={openAddDialog}>
        <Plus className="h-4 w-4 mr-2" /> Add Budget Category
      </Button>

      {/* Portions List */}
      {portions.length === 0 ? (
        <p className="text-muted-foreground">No budget categories yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {portions.map((portion) => (
            <Card key={portion.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex justify-between items-start">
                  <span>{portion.name}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(portion)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDelete(portion.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(portion.budgetAmount)}</p>
                {portion.notes && <p className="text-sm text-muted-foreground mt-2">{portion.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPortion ? 'Edit Budget Category' : 'Add Budget Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Food, Transport"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget Amount (Rp) *</Label>
              <Input
                id="budget"
                value={formData.budgetAmount}
                onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value.replace(/[^\d]/g, '') })}
                placeholder="e.g., 3000000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingPortion ? 'Save' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
