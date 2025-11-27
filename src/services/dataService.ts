/**
 * =============================================================================
 * DATA SERVICE LAYER
 * Handles all data persistence using localStorage.
 * Designed for easy future backend integration.
 * =============================================================================
 */

import { AppData, Period, Portion, Expense, PortionSummary, PeriodSummary } from '@/types';
import { generateId, getShortMonthYear } from '@/utils/formatters';

const STORAGE_KEY = 'budget_app_v1';
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

function createEmptyAppData(): AppData {
  const now = new Date().toISOString();
  return {
    version: 'v1',
    createdAt: now,
    lastUsedAt: now,
    periods: [],
    portions: [],
    expenses: [],
    activePeriodId: undefined
  };
}

/** Generate sample seed data for first-time users */
function generateSeedData(): AppData {
  const now = new Date();
  const periodId = generateId();
  
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const period: Period = {
    id: periodId,
    name: getShortMonthYear(now),
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    incomeAmount: 10000000
  };

  const portions: Portion[] = [
    { id: generateId(), periodId, name: 'Food', budgetAmount: 3000000, notes: 'Daily meals and groceries' },
    { id: generateId(), periodId, name: 'Transport', budgetAmount: 1000000, notes: 'Ojek, fuel, parking' },
    { id: generateId(), periodId, name: 'Bills', budgetAmount: 2000000, notes: 'Electricity, water, internet' },
    { id: generateId(), periodId, name: 'Entertainment', budgetAmount: 500000, notes: 'Movies, games, hobbies' },
    { id: generateId(), periodId, name: 'Savings', budgetAmount: 3500000, notes: 'Emergency fund and investments' }
  ];

  const today = now.toISOString().split('T')[0];
  const expenses: Expense[] = [
    { id: generateId(), periodId, portionId: portions[0].id, date: today, description: 'Lunch nasi goreng', amount: 50000 },
    { id: generateId(), periodId, portionId: portions[0].id, date: today, description: 'Snack and coffee', amount: 30000 },
    { id: generateId(), periodId, portionId: portions[1].id, date: today, description: 'Ojek to office', amount: 25000 }
  ];

  return {
    version: 'v1',
    createdAt: now.toISOString(),
    lastUsedAt: now.toISOString(),
    periods: [period],
    portions,
    expenses,
    activePeriodId: periodId
  };
}

function isDataExpired(data: AppData): boolean {
  const createdAt = new Date(data.createdAt).getTime();
  return (Date.now() - createdAt) > ONE_YEAR_MS;
}

/** Load data from localStorage with 1-year retention check */
export function loadDataFromLocalStorage(): { data: AppData; wasCleared: boolean } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (!stored) {
      const seedData = generateSeedData();
      saveDataToLocalStorage(seedData);
      return { data: seedData, wasCleared: false };
    }

    const data: AppData = JSON.parse(stored);
    
    if (isDataExpired(data)) {
      const freshData = createEmptyAppData();
      saveDataToLocalStorage(freshData);
      return { data: freshData, wasCleared: true };
    }

    data.lastUsedAt = new Date().toISOString();
    saveDataToLocalStorage(data);
    
    return { data, wasCleared: false };
  } catch {
    const freshData = generateSeedData();
    saveDataToLocalStorage(freshData);
    return { data: freshData, wasCleared: false };
  }
}

export function saveDataToLocalStorage(data: AppData): void {
  try {
    data.lastUsedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    throw new Error('Failed to save data. Storage might be full.');
  }
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportDataAsJson(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

export function importDataFromJson(jsonString: string): AppData {
  try {
    const data = JSON.parse(jsonString);
    if (!data.version || !data.periods || !data.portions || !data.expenses) {
      throw new Error('Invalid data structure');
    }
    data.lastUsedAt = new Date().toISOString();
    return data as AppData;
  } catch {
    throw new Error('Invalid JSON format. Please check your data.');
  }
}

/** Calculate summary for a single portion */
export function calculatePortionSummary(portion: Portion, expenses: Expense[]): PortionSummary {
  const portionExpenses = expenses.filter(e => e.portionId === portion.id);
  const used = portionExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = portion.budgetAmount - used;
  const percentUsed = portion.budgetAmount > 0 ? (used / portion.budgetAmount) * 100 : 0;

  return {
    portion,
    budget: portion.budgetAmount,
    used,
    remaining,
    percentUsed,
    isOverBudget: used > portion.budgetAmount
  };
}

/** Calculate overall summary for a period */
export function calculatePeriodSummary(
  period: Period,
  portions: Portion[],
  expenses: Expense[]
): PeriodSummary {
  const periodPortions = portions.filter(p => p.periodId === period.id);
  const periodExpenses = expenses.filter(e => e.periodId === period.id);

  const totalIncome = period.incomeAmount;
  const totalBudgeted = periodPortions.reduce((sum, p) => sum + p.budgetAmount, 0);
  const totalExpenses = periodExpenses.reduce((sum, e) => sum + e.amount, 0);

  return {
    totalIncome,
    totalBudgeted,
    totalExpenses,
    remainingBudget: totalBudgeted - totalExpenses,
    remainingIncome: totalIncome - totalExpenses,
    unallocatedIncome: totalIncome - totalBudgeted,
    overallPercentUsed: totalBudgeted > 0 ? (totalExpenses / totalBudgeted) * 100 : 0,
    isOverBudget: totalExpenses > totalBudgeted
  };
}

export function getPortionSummaries(
  periodId: string,
  portions: Portion[],
  expenses: Expense[]
): PortionSummary[] {
  const periodPortions = portions.filter(p => p.periodId === periodId);
  const periodExpenses = expenses.filter(e => e.periodId === periodId);
  return periodPortions.map(portion => calculatePortionSummary(portion, periodExpenses));
}
