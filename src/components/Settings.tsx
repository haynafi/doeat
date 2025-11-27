import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { formatDate } from '@/utils/formatters';
import { AppData } from '@/types';
import { Download, Upload, Trash2, AlertTriangle, Info } from 'lucide-react';

interface SettingsProps {
  data: AppData | null;
  wasDataCleared: boolean;
  onDismissClearedNotice: () => void;
  onExport: () => string;
  onImport: (json: string) => void;
  onClear: () => void;
}

export function Settings({ data, wasDataCleared, onDismissClearedNotice, onExport, onImport, onClear }: SettingsProps) {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

  const handleExport = () => {
    const jsonData = onExport();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      onImport(importText);
      setImportDialogOpen(false);
      setImportText('');
      setImportError('');
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  const handleClear = () => {
    onClear();
    setClearDialogOpen(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Data Cleared Notice */}
      {wasDataCleared && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Old data cleared</AlertTitle>
          <AlertDescription>
            Old data (over 1 year) has been cleared.
            <Button variant="link" className="p-0 h-auto ml-2" onClick={onDismissClearedNotice}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Storage Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" /> Data Storage
          </CardTitle>
          <CardDescription>
            Your data is stored only in this browser (local storage) and kept for a maximum of 1 year.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {data && (
            <>
              <p><strong>Created:</strong> {formatDate(data.createdAt)}</p>
              <p><strong>Last used:</strong> {formatDate(data.lastUsedAt)}</p>
              <p><strong>Periods:</strong> {data.periods.length}</p>
              <p><strong>Categories:</strong> {data.portions.length}</p>
              <p><strong>Expenses:</strong> {data.expenses.length}</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Export */}
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>Download all your data as a JSON file for backup.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export JSON
          </Button>
        </CardContent>
      </Card>

      {/* Import */}
      <Card>
        <CardHeader>
          <CardTitle>Import Data</CardTitle>
          <CardDescription>Restore data from a previously exported JSON file. This will replace all current data.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" /> Import JSON
          </Button>
        </CardContent>
      </Card>

      {/* Clear */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Clear All Data</CardTitle>
          <CardDescription>Permanently delete all periods, categories, and expenses. This cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setClearDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" /> Clear All Data
          </Button>
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
            <DialogDescription>Paste your exported JSON data below. This will replace all current data.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {importError && <p className="text-sm text-red-600">{importError}</p>}
            <Textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='Paste JSON here...'
              className="min-h-[200px] font-mono text-xs"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleImport}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Confirmation Dialog */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear All Data?</DialogTitle>
            <DialogDescription>
              This will permanently delete all your periods, budget categories, and expenses. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleClear}>Yes, Clear All</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
