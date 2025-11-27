/**
 * =============================================================================
 * BUDGET DATA HOOK
 * Manages all budget data state and operations
 * =============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { AppData, Period, Portion, Expense, PortionSummary, PeriodSummary } from '@/types';
import {
  loadDataFromLocalStorage,
  saveDataToLocalStorage,
  clearAllData,
  exportDataAsJson,
  importDataFromJson,
  calculatePeriodSummary,
  getPortionSummaries
} from '@/services/dataService';
import { generateId } from '@/utils/formatters';

export function useBudgetData() {
  const [data, setData] = useState<AppData | null>(null);
  const [wasDataCleared, setWasDataCleared] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: loadedData, wasCleared } = loadDataFromLocalStorage();
    setData(loadedData);
    setWasDataCleared(wasCleared);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (data) saveDataToLocalStorage(data);
  }, [data]);

  const activePeriod = data?.periods.find(p => p.id === data.activePeriodId) || null;
  const activePortions = data?.portions.filter(p => p.periodId === data.activePeriodId) || [];
  const activeExpenses = data?.expenses.filter(e => e.periodId === data.activePeriodId) || [];

  const periodSummary: PeriodSummary | null = activePeriod && data
    ? calculatePeriodSummary(activePeriod, data.portions, data.expenses)
    : null;

  const portionSummaries: PortionSummary[] = data && data.activePeriodId
    ? getPortionSummaries(data.activePeriodId, data.portions, data.expenses)
    : [];

  // Period operations
  const setActivePeriod = useCallback((periodId: string) => {
    setData(prev => prev ? { ...prev, activePeriodId: periodId } : null);
  }, []);

  const addPeriod = useCallback((period: Omit<Period, 'id'>) => {
    const newPeriod: Period = { ...period, id: generateId() };
    setData(prev => {
      if (!prev) return null;
      return { ...prev, periods: [...prev.periods, newPeriod], activePeriodId: newPeriod.id };
    });
    return newPeriod;
  }, []);

  const updatePeriod = useCallback((periodId: string, updates: Partial<Period>) => {
    setData(prev => {
      if (!prev) return null;
      return { ...prev, periods: prev.periods.map(p => p.id === periodId ? { ...p, ...updates } : p) };
    });
  }, []);

  const deletePeriod = useCallback((periodId: string) => {
    setData(prev => {
      if (!prev) return null;
      const newPeriods = prev.periods.filter(p => p.id !== periodId);
      return {
        ...prev,
        periods: newPeriods,
        portions: prev.portions.filter(p => p.periodId !== periodId),
        expenses: prev.expenses.filter(e => e.periodId !== periodId),
        activePeriodId: newPeriods.length > 0 ? newPeriods[0].id : undefined
      };
    });
  }, []);

  // Portion operations
  const addPortion = useCallback((portion: Omit<Portion, 'id'>) => {
    const newPortion: Portion = { ...portion, id: generateId() };
    setData(prev => prev ? { ...prev, portions: [...prev.portions, newPortion] } : null);
    return newPortion;
  }, []);

  const updatePortion = useCallback((portionId: string, updates: Partial<Portion>) => {
    setData(prev => {
      if (!prev) return null;
      return { ...prev, portions: prev.portions.map(p => p.id === portionId ? { ...p, ...updates } : p) };
    });
  }, []);

  const deletePortion = useCallback((portionId: string) => {
    setData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        portions: prev.portions.filter(p => p.id !== portionId),
        expenses: prev.expenses.filter(e => e.portionId !== portionId)
      };
    });
  }, []);

  // Expense operations
  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = { ...expense, id: generateId() };
    setData(prev => prev ? { ...prev, expenses: [...prev.expenses, newExpense] } : null);
    return newExpense;
  }, []);

  const updateExpense = useCallback((expenseId: string, updates: Partial<Expense>) => {
    setData(prev => {
      if (!prev) return null;
      return { ...prev, expenses: prev.expenses.map(e => e.id === expenseId ? { ...e, ...updates } : e) };
    });
  }, []);

  const deleteExpense = useCallback((expenseId: string) => {
    setData(prev => prev ? { ...prev, expenses: prev.expenses.filter(e => e.id !== expenseId) } : null);
  }, []);

  const getFilteredExpenses = useCallback((filters?: { startDate?: string; endDate?: string; portionId?: string }) => {
    if (!data || !data.activePeriodId) return [];
    let filtered = data.expenses.filter(e => e.periodId === data.activePeriodId);
    if (filters?.startDate) filtered = filtered.filter(e => e.date >= filters.startDate!);
    if (filters?.endDate) filtered = filtered.filter(e => e.date <= filters.endDate!);
    if (filters?.portionId) filtered = filtered.filter(e => e.portionId === filters.portionId);
    return filtered.sort((a, b) => b.date.localeCompare(a.date));
  }, [data]);

  // Data management
  const exportData = useCallback(() => data ? exportDataAsJson(data) : '', [data]);

  const importData = useCallback((jsonString: string) => {
    const importedData = importDataFromJson(jsonString);
    setData(importedData);
    saveDataToLocalStorage(importedData);
  }, []);

  const resetData = useCallback(() => {
    clearAllData();
    const { data: freshData } = loadDataFromLocalStorage();
    setData(freshData);
  }, []);

  const clearData = useCallback(() => {
    clearAllData();
    const now = new Date().toISOString();
    const emptyData: AppData = {
      version: 'v1', createdAt: now, lastUsedAt: now,
      periods: [], portions: [], expenses: [], activePeriodId: undefined
    };
    setData(emptyData);
    saveDataToLocalStorage(emptyData);
  }, []);

  const dismissClearedNotice = useCallback(() => setWasDataCleared(false), []);

  return {
    data, loading, wasDataCleared, dismissClearedNotice,
    activePeriod, activePortions, activeExpenses, periodSummary, portionSummaries,
    setActivePeriod, addPeriod, updatePeriod, deletePeriod,
    addPortion, updatePortion, deletePortion,
    addExpense, updateExpense, deleteExpense, getFilteredExpenses,
    exportData, importData, resetData, clearData
  };
}
