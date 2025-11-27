import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { formatCurrency, getShortMonthYear } from '@/utils/formatters';
import { Period } from '@/types';
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react';

interface PeriodManagerProps {
  periods: Period[];
  activePeriodId: string | undefined;
  onSetActive: (id: string) => void;
  onAdd: (period: Omit<Period, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Period>) => void;
  onDelete: (id: string) => void;
}

export function PeriodManager({ periods, activePeriodId, onSetActive, onAdd, onUpdate, onDelete }: PeriodManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
  const [formData, setFormData] = useState({ name: '', startDate: '', endDate: '', incomeAmount: '' });
  const [error, setError] = useState('');

  const activePeriod = periods.find(p => p.id === activePeriodId);

  const openAddDialog = () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setEditingPeriod(null);
    setFormData({
      name: getShortMonthYear(now),
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      incomeAmount: ''
    });
    setError('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (period: Period) => {
    setEditingPeriod(period);
    setFormData({
      name: period.name,
      startDate: period.startDate,
      endDate: period.endDate,
      incomeAmount: period.incomeAmount.toString()
    });
    setError('');
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      setError('Start and end dates are required');
      return;
    }
    const income = parseInt(formData.incomeAmount.replace(/\./g, ''), 10);
    if (!income || income <= 0) {
      setError('Income must be greater than 0');
      return;
    }

    if (editingPeriod) {
      onUpdate(editingPeriod.id, {
        name: formData.name.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        incomeAmount: income
      });
    } else {
      onAdd({
        name: formData.name.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        incomeAmount: income
      });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this period? All related categories and expenses will also be deleted.')) {
      onDelete(id);
    }
  };

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {/* Period Selector */}
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        {periods.length > 0 ? (
          <Select value={activePeriodId || ''} onValueChange={onSetActive}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {periods.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} ({formatCurrency(p.incomeAmount)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="text-muted-foreground">No periods</span>
        )}
      </div>

      {/* Actions */}
      <Button size="sm" variant="outline" onClick={openAddDialog}>
        <Plus className="h-4 w-4 mr-1" /> New Period
      </Button>
      
      {activePeriod && (
        <>
          <Button size="sm" variant="ghost" onClick={() => openEditDialog(activePeriod)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(activePeriod.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPeriod ? 'Edit Period' : 'New Period'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="periodName">Period Name *</Label>
              <Input
                id="periodName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Nov 2025"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="income">Monthly Income (Rp) *</Label>
              <Input
                id="income"
                value={formData.incomeAmount}
                onChange={(e) => setFormData({ ...formData, incomeAmount: e.target.value.replace(/[^\d]/g, '') })}
                placeholder="e.g., 10000000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingPeriod ? 'Save' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
