# Finora — Smart Personal Finance & Budget Dashboard

Finora is a modern personal finance tracking application built with Next.js 16 (App Router), React 19, TypeScript, and clean Vanilla CSS variables.

## Features

- **Real-Time Financial Dashboard**: Track monthly budgets, live spent amounts, remaining allocations, and automated savings targets in Indian Rupee (`₹`).
- **Dynamic Accent Themes**: Switch between curated themes (Finora Orange, Royal Violet, Emerald Green, Ocean Cyan, Rose Pink) with instant CSS variable propagation and local storage persistence.
- **Spending Trends & Breakdowns**: Visual category distribution gauges, 7-day spending curves with limit lines, and detailed breakdown analytics.
- **Transaction Management**: Filter by category and status, live search, sort by date/amount, and add new transactions via interactive modal dialogs.
- **Authentication Pages**: Clean 50/50 split authentication screens (`/login`, `/register`, `/forgot-password`) with one-click demo login.
- **Complete Suite of Sub-Pages**: Includes Budget Planner (`/budget`), Expenses (`/expenses`), Recurring Subscriptions (`/recurring`), Savings Goals (`/goals`), Financial Reports (`/reports`), Profile (`/profile`), Settings (`/settings`), and Help Center (`/help`).

## Tech Stack

- **Framework**: Next.js 16 (Turbopack, App Router)
- **Library**: React 19, TypeScript
- **Styling**: Vanilla CSS with custom properties (`src/app/globals.css`)
- **Icons**: Lucide React

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```bash
npm run build
npm run start
```
