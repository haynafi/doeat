import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { formatCurrency, formatDate, getCurrentDate } from '@/utils/formatters';
import { Expense, Portion } from '@/types';
import { Plus, Pencil, Trash2, Filter } from 'lucide-react';

interface ExpensesProps {
  expenses: Expense[];
  portions: Portion[];
  activePeriodId: string | undefined;
  onAdd: (expense: Omit<Expense, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Expense>) => void;
  onDelete: (id: string) => void;
  getFilteredExpenses: (filters?: { startDate?: string; endDate?: string; portionId?: string }) => Expense[];
}

export function Expenses({ portions, activePeriodId, onAdd, onUpdate, onDelete, getFilteredExpenses }: ExpensesProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({ portionId: '', date: getCurrentDate(), description: '', amount: '' });
  const [error, setError] = useState('');
  
  // Filters
  const [filterPortionId, setFilterPortionId] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const filteredExpenses = getFilteredExpenses({
    portionId: filterPortionId || undefined,
    startDate: filterStartDate || undefined,
    endDate: filterEndDate || undefined
  });

  const getPortionName = (portionId: string) => {
    return portions.find(p => p.id === portionId)?.name || 'Unknown';
  };

  const openAddDialog = () => {
    setEditingExpense(null);
    setFormData({ portionId: portions[0]?.id || '', date: getCurrentDate(), description: '', amount: '' });
    setError('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      portionId: expense.portionId,
      date: expense.date,
      description: expense.description,
      amount: expense.amount.toString()
    });
    setError('');
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.portionId) {
      setError('Please select a category');
      return;
    }
    if (!formData.date) {
      setError('Date is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    const amount = parseInt(formData.amount.replace(/\./g, ''), 10);
    if (!amount || amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    if (!activePeriodId) {
      setError('No active period selected');
      return;
    }

    if (editingExpense) {
      onUpdate(editingExpense.id, {
        portionId: formData.portionId,
        date: formData.date,
        description: formData.description.trim(),
        amount
      });
    } else {
      onAdd({
        periodId: activePeriodId,
        portionId: formData.portionId,
        date: formData.date,
        description: formData.description.trim(),
        amount
      });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this expense?')) {
      onDelete(id);
    }
  };

  const clearFilters = () => {
    setFilterPortionId('');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  if (!activePeriodId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No active period selected. Create a period first.</p>
      </div>
    );
  }

  if (portions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No budget categories yet. Add some in the Budgets tab first.</p>
      </div>
    );
  }

  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Add Button */}
      <Button onClick={openAddDialog}>
        <Plus className="h-4 w-4 mr-2" /> Add Expense
      </Button>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={filterPortionId} onValueChange={setFilterPortionId}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {portions.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters}>Clear</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">{filteredExpenses.length} expense(s)</p>
        <p className="font-semibold">Total: {formatCurrency(totalFiltered)}</p>
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No expenses found.</p>
      ) : (
        <div className="space-y-2">
          {filteredExpenses.map((expense) => (
            <Card key={expense.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{expense.description}</span>
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded">{getPortionName(expense.portionId)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(expense.date)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-lg">{formatCurrency(expense.amount)}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(expense)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDelete(expense.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={formData.portionId} onValueChange={(v) => setFormData({ ...formData, portionId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {portions.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Lunch nasi goreng"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (Rp) *</Label>
              <Input
                id="amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value.replace(/[^\d]/g, '') })}
                placeholder="e.g., 50000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingExpense ? 'Save' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
