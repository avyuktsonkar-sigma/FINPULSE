import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Wallet, TrendingUp, TrendingDown, IndianRupee, PlusCircle, 
  Trash2, Download, Search, PieChart, AlertCircle, Sparkles, Filter 
} from 'lucide-react';

const CATEGORIES = {
  expense: ['Food & Dining', 'Rent & Bills', 'Shopping', 'Travel', 'Entertainment', 'Healthcare', 'Other Expense'],
  income: ['Salary', 'Freelancing', 'Investments', 'Bonus', 'Gift', 'Other Income']
};

const INITIAL_TRANSACTIONS = [
  { id: '1', title: 'Tech Stipend / Salary', amount: 45000, type: 'income', category: 'Salary', date: '2025-02-01' },
  { id: '2', title: 'Apartment Rent & Wifi', amount: 12000, type: 'expense', category: 'Rent & Bills', date: '2025-02-02' },
  { id: '3', title: 'Groceries & Provisions', amount: 4500, type: 'expense', category: 'Food & Dining', date: '2025-02-05' },
  { id: '4', title: 'Client Project Advance', amount: 15000, type: 'income', category: 'Freelancing', date: '2025-02-10' },
  { id: '5', title: 'Movie & Weekend Dinner', amount: 2200, type: 'expense', category: 'Entertainment', date: '2025-02-12' },
];

export default function App() {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('finpulse_data');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    return Number(localStorage.getItem('finpulse_budget')) || 25000;
  });

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    localStorage.setItem('finpulse_data', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finpulse_budget', monthlyBudget.toString());
  }, [monthlyBudget]);

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) return;

    const newTx = {
      id: Date.now().toString(),
      title: title.trim(),
      amount: parseFloat(amount),
      type,
      category,
      date: date || new Date().toISOString().slice(0, 10)
    };

    setTransactions([newTx, ...transactions]);
    if (type === 'income') {
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
    }
    setTitle('');
    setAmount('');
  };

  const handleDelete = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Calculations
  const totalIncome = useMemo(() => 
    transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0),
    [transactions]
  );

  const totalExpense = useMemo(() => 
    transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0),
    [transactions]
  );

  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;
  const budgetProgress = monthlyBudget > 0 ? Math.min(100, Math.round((totalExpense / monthlyBudget) * 100)) : 0;

  // Breakdown by Category
  const categoryStats = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped = {};
    expenses.forEach(t => {
      grouped[t.category] = (grouped[t.category] || 0) + t.amount;
    });
    return Object.entries(grouped)
      .map(([cat, amt]) => ({
        category: cat,
        amount: amt,
        percentage: totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, totalExpense]);

  // Export to CSV Functionality (Excel-Ready)
  const exportToCSV = () => {
    const headers = 'ID,Title,Amount,Type,Category,Date\n';
    const rows = transactions.map(t => 
      `"${t.id}","${t.title.replace(/"/g, '""')}",${t.amount},"${t.type}","${t.category}","${t.date}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FinPulse_Transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Filtered List
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          t.category.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' ? true : t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              FinPulse <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-medium">Pro</span>
            </h1>
            <p className="text-sm text-slate-400">Smart Financial Management & Budget Planner</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 transition"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Export to CSV
          </button>
        </div>
      </header>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Net Balance */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Net Balance</span>
          <div className="text-2xl md:text-3xl font-bold text-white mt-1 flex items-center">
            <IndianRupee className="w-5 h-5 inline mr-0.5" />
            {netBalance.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Savings Rate: <span className="text-indigo-400 font-semibold">{savingsRate}%</span>
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Inflow</span>
            <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg"><TrendingUp className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-emerald-400 mt-1 flex items-center">
            <IndianRupee className="w-5 h-5 inline mr-0.5" />
            {totalIncome.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">All recorded income sources</span>
        </div>

        {/* Total Expense */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Outflow</span>
            <span className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg"><TrendingDown className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-rose-400 mt-1 flex items-center">
            <IndianRupee className="w-5 h-5 inline mr-0.5" />
            {totalExpense.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">Cumulative expenses</span>
        </div>

        {/* Monthly Budget Tracker */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Monthly Budget</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              budgetProgress >= 100 ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
            }`}>
              {budgetProgress}% Used
            </span>
          </div>
          <div className="text-lg font-bold text-slate-200 mt-1 flex items-center justify-between">
            <span>₹{totalExpense.toLocaleString('en-IN')} / ₹{monthlyBudget.toLocaleString('en-IN')}</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 mt-3 overflow-hidden border border-slate-800">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                budgetProgress >= 100 ? 'bg-rose-500' : budgetProgress > 75 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${budgetProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Add Form & Category Analytics */}
        <div className="space-y-6">
          {/* Add Transaction Card */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-400" /> New Transaction
            </h2>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setType('expense'); setCategory(CATEGORIES.expense[0]); }}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                    type === 'expense' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => { setType('income'); setCategory(CATEGORIES.income[0]); }}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                    type === 'income' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Income
                </button>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Description / Merchant</label>
                <input
                  type="text"
                  placeholder="e.g. Swiggy, Gym Fee, Client Payment"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {CATEGORIES[type].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-indigo-600/20"
              >
                Add Record
              </button>
            </form>
          </div>

          {/* Category Breakdown (Visual Distribution) */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-400" /> Spending Distribution
            </h2>

            {categoryStats.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No expenses recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {categoryStats.slice(0, 5).map((stat) => (
                  <div key={stat.category}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">{stat.category}</span>
                      <span className="text-slate-400">₹{stat.amount.toLocaleString('en-IN')} ({stat.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-1.5 rounded-full" 
                        style={{ width: `${stat.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Ledger Table */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            {/* Table Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Transaction Ledger
                <span className="text-xs font-normal text-slate-400">({filteredTransactions.length} records)</span>
              </h2>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 pl-8 pr-3 py-1.5 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-xl text-xs">
                  <button
                    onClick={() => setTypeFilter('all')}
                    className={`px-2 py-0.5 rounded-lg transition ${typeFilter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setTypeFilter('income')}
                    className={`px-2 py-0.5 rounded-lg transition ${typeFilter === 'income' ? 'bg-emerald-950/60 text-emerald-400 font-bold' : 'text-slate-400'}`}
                  >
                    In
                  </button>
                  <button
                    onClick={() => setTypeFilter('expense')}
                    className={`px-2 py-0.5 rounded-lg transition ${typeFilter === 'expense' ? 'bg-rose-950/60 text-rose-400 font-bold' : 'text-slate-400'}`}
                  >
                    Out
                  </button>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-sm">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No transactions found matching your criteria.
                </div>
              ) : (
                filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3.5 bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 rounded-xl transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {tx.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white tracking-tight leading-tight">{tx.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md">
                            {tx.category}
                          </span>
                          <span className="text-[10px] text-slate-500">{tx.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`text-sm font-bold font-mono ${
                        tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="text-slate-600 hover:text-rose-400 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/60 flex justify-between items-center text-xs text-slate-500">
            <span>Data stored client-side via Browser Web Storage</span>
            <button 
              onClick={() => {
                if(window.confirm('Reset all transaction data?')) {
                  setTransactions([]);
                }
              }}
              className="hover:text-rose-400 transition"
            >
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
