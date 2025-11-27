/**
 * =============================================================================
 * DATA TYPES FOR PERSONAL BUDGET APP
 * =============================================================================
 */

/** Period represents a budget period (typically a month) */
export interface Period {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  incomeAmount: number;
}

/** Portion represents a budget category within a period */
export interface Portion {
  id: string;
  periodId: string;
  name: string;
  budgetAmount: number;
  notes?: string;
}

/** Expense represents a single spending record */
export interface Expense {
  id: string;
  periodId: string;
  portionId: string;
  date: string;
  description: string;
  amount: number;
}

/** AppData is the root data structure stored in localStorage */
export interface AppData {
  version: string;
  createdAt: string;
  lastUsedAt: string;
  periods: Period[];
  portions: Portion[];
  expenses: Expense[];
  activePeriodId?: string;
}

/** PortionSummary provides calculated values for a portion */
export interface PortionSummary {
  portion: Portion;
  budget: number;
  used: number;
  remaining: number;
  percentUsed: number;
  isOverBudget: boolean;
}

/** PeriodSummary provides overall calculated values for a period */
export interface PeriodSummary {
  totalIncome: number;
  totalBudgeted: number;
  totalExpenses: number;
  remainingBudget: number;
  remainingIncome: number;
  unallocatedIncome: number;
  overallPercentUsed: number;
  isOverBudget: boolean;
}
