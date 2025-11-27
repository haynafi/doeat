# Do Eat - Personal Budget App

A pure front-end personal budgeting web app with no backend, no login, and no external database. All data is stored locally in your browser using localStorage.

## Features

- **Income & Period Setup**: Define monthly income and create multiple budget periods
- **Budget Portions/Categories**: Create, edit, delete budget categories (Food, Transport, Bills, etc.)
- **Expense Tracking**: Record daily expenses tied to categories with filtering
- **Budget vs Actual View**: See remaining budget, percent used, and over-budget warnings
- **Data Management**: Export/Import JSON, 1-year data retention

## Currency

All amounts are in Indonesian Rupiah (IDR) with format: `Rp 3.000.000`

## Tech Stack

- React 18 + TypeScript
- Vite
- TailwindCSS
- Radix UI (shadcn/ui components)
- Lucide React (icons)
- localStorage for persistence

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Data Storage

- **Key**: `budget_app_v1`
- **Location**: Browser localStorage
- **Retention**: 1 year (auto-clears old data)
- **Scope**: Single user, single browser

## Project Structure

```
src/
├── types/           # TypeScript interfaces
├── services/        # Data service layer (localStorage)
├── hooks/           # Custom React hooks
├── utils/           # Formatting utilities
├── components/
│   ├── ui/          # Reusable UI components
│   ├── Dashboard.tsx
│   ├── Portions.tsx
│   ├── Expenses.tsx
│   ├── Settings.tsx
│   └── PeriodManager.tsx
└── App.tsx          # Main application
```

## Sample Data

On first run, the app seeds sample data:
- Period: Current month
- Income: Rp 10.000.000
- Categories: Food, Transport, Bills, Entertainment, Savings
- Sample expenses

## Future Backend Integration

The data service layer (`src/services/dataService.ts`) is designed for easy backend integration:
1. Replace localStorage calls with API calls
2. Add authentication headers
3. Handle async operations with loading states
