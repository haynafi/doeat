/**
 * =============================================================================
 * PERSONAL BUDGET APP - Main Application Component
 * =============================================================================
 * 
 * A pure front-end personal budgeting app with localStorage persistence.
 * No backend, no authentication, no external database.
 * 
 * Features:
 * - Income & Period Setup
 * - Budget Portions/Categories
 * - Expense Tracking
 * - Budget vs Actual View
 * - Data Export/Import
 * - 1-year data retention
 * 
 * Currency: IDR (Rp)
 * Storage: localStorage with key "budget_app_v1"
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBudgetData } from '@/hooks/useBudgetData';
import { Dashboard } from '@/components/Dashboard';
import { Portions } from '@/components/Portions';
import { Expenses } from '@/components/Expenses';
import { Settings } from '@/components/Settings';
import { PeriodManager } from '@/components/PeriodManager';
import { LayoutDashboard, PieChart, Receipt, Settings as SettingsIcon, Loader2 } from 'lucide-react';

export default function App() {
  const {
    data,
    loading,
    wasDataCleared,
    dismissClearedNotice,
    activePeriod,
    activePortions,
    activeExpenses,
    periodSummary,
    portionSummaries,
    setActivePeriod,
    addPeriod,
    updatePeriod,
    deletePeriod,
    addPortion,
    updatePortion,
    deletePortion,
    addExpense,
    updateExpense,
    deleteExpense,
    getFilteredExpenses,
    exportData,
    importData,
    clearData
  } = useBudgetData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Personal Budget</h1>
            <PeriodManager
              periods={data?.periods || []}
              activePeriodId={data?.activePeriodId}
              onSetActive={setActivePeriod}
              onAdd={addPeriod}
              onUpdate={updatePeriod}
              onDelete={deletePeriod}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="budgets" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Budgets</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard
              periodSummary={periodSummary}
              portionSummaries={portionSummaries}
              periodName={activePeriod?.name || ''}
            />
          </TabsContent>

          <TabsContent value="budgets">
            <Portions
              portions={activePortions}
              periodSummary={periodSummary}
              activePeriodId={data?.activePeriodId}
              onAdd={addPortion}
              onUpdate={updatePortion}
              onDelete={deletePortion}
            />
          </TabsContent>

          <TabsContent value="expenses">
            <Expenses
              expenses={activeExpenses}
              portions={activePortions}
              activePeriodId={data?.activePeriodId}
              onAdd={addExpense}
              onUpdate={updateExpense}
              onDelete={deleteExpense}
              getFilteredExpenses={getFilteredExpenses}
            />
          </TabsContent>

          <TabsContent value="settings">
            <Settings
              data={data}
              wasDataCleared={wasDataCleared}
              onDismissClearedNotice={dismissClearedNotice}
              onExport={exportData}
              onImport={importData}
              onClear={clearData}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          Personal Budget App • Data stored locally in your browser
        </div>
      </footer>
    </div>
  );
}
