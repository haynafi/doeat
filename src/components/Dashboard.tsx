import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import { PeriodSummary, PortionSummary } from '@/types';
import { Wallet, PiggyBank, Receipt, TrendingDown, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  periodSummary: PeriodSummary | null;
  portionSummaries: PortionSummary[];
  periodName: string;
}

export function Dashboard({ periodSummary, portionSummaries, periodName }: DashboardProps) {
  if (!periodSummary) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No active period selected. Create a period to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Warnings */}
      {periodSummary.unallocatedIncome < 0 && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Budget exceeds income by {formatCurrency(Math.abs(periodSummary.unallocatedIncome))}
          </AlertDescription>
        </Alert>
      )}

      {/* Period Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(periodSummary.totalIncome)}</div>
            <p className="text-xs text-muted-foreground">{periodName}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budgeted</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(periodSummary.totalBudgeted)}</div>
            {periodSummary.unallocatedIncome > 0 && (
              <p className="text-xs text-green-600">+{formatCurrency(periodSummary.unallocatedIncome)} unallocated</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(periodSummary.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">{formatPercent(periodSummary.overallPercentUsed)} of budget</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${periodSummary.remainingBudget < 0 ? 'text-red-600' : ''}`}>
              {formatCurrency(periodSummary.remainingBudget)}
            </div>
            <p className="text-xs text-muted-foreground">from budget</p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Overall Budget Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress 
            value={Math.min(periodSummary.overallPercentUsed, 100)} 
            className="h-3"
            indicatorClassName={periodSummary.isOverBudget ? 'bg-red-500' : ''}
          />
          <p className="text-sm text-muted-foreground mt-2">
            {formatCurrency(periodSummary.totalExpenses)} of {formatCurrency(periodSummary.totalBudgeted)} used
          </p>
        </CardContent>
      </Card>

      {/* Portion Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Budget by Category</h2>
        {portionSummaries.length === 0 ? (
          <p className="text-muted-foreground">No budget categories yet. Add some in the Budgets tab.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {portionSummaries.map((summary) => (
              <Card key={summary.portion.id} className={summary.isOverBudget ? 'border-red-300' : ''}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex justify-between items-center">
                    <span>{summary.portion.name}</span>
                    {summary.isOverBudget && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Over Budget</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Progress 
                    value={Math.min(summary.percentUsed, 100)} 
                    className="h-2"
                    indicatorClassName={summary.isOverBudget ? 'bg-red-500' : ''}
                  />
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Budget</p>
                      <p className="font-medium">{formatCurrency(summary.budget)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Used</p>
                      <p className="font-medium">{formatCurrency(summary.used)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Left</p>
                      <p className={`font-medium ${summary.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(summary.remaining)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {formatPercent(summary.percentUsed)} used
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
