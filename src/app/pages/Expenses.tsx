import { useState, useEffect } from "react";
import { Plus, TrendingDown, TrendingUp, DollarSign, Trash2, Link2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "../lib/api";

export function Expenses() {
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [newExpense, setNewExpense] = useState({ category: "repairs", description: "", amount: "", date: "" });

  const fetchExpenses = async () => {
    try {
      const [expRes, summaryRes] = await Promise.all([
        api.getExpenses({ limit: "50" }),
        api.getFinancialSummary()
      ]);
      const data = expRes.data || [];
      const summary = summaryRes.data?.monthlySummary || [];
      setExpenses(data);
      buildChartData(data, summary);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const buildChartData = (expenseList: any[], monthlySummary: any[]) => {
    const chartData = monthlySummary.map((s: any) => {
      const monthDate = new Date(s.month);
      const monthExpenses = expenseList
        .filter((e: any) => {
          const ed = new Date(e.date);
          return ed.getMonth() === monthDate.getMonth() && ed.getFullYear() === monthDate.getFullYear();
        })
        .reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0);
      
      return {
        month: s.month.split(' ')[0],
        income: s.totalIncome,
        expenses: Math.round(monthExpenses),
        profit: Math.round(s.totalIncome - monthExpenses),
      };
    });
    setMonthlyData(chartData);
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleAddExpense = async () => {
    if (!newExpense.description || !newExpense.amount || !newExpense.date) {
      setError("Please fill in all required fields");
      return;
    }
    setError("");
    try {
      const response = await api.createExpense({
        category: newExpense.category,
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        date: newExpense.date,
      });
      console.log("✓ Expense created:", response);
      setShowAddModal(false);
      setNewExpense({ category: "repairs", description: "", amount: "", date: "" });
      fetchExpenses();
    } catch (err: any) {
      console.error("✗ Expense creation failed:", err);
      let errorMsg = "Failed to add expense";
      if (err.errors && typeof err.errors === 'object') {
        const msgs = Object.values(err.errors).flat().join(", ");
        errorMsg = msgs || err.message || errorMsg;
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this expense?")) return;
    try { await api.deleteExpense(id); fetchExpenses(); } catch { }
  };

  const totalExpenses = expenses.reduce((sum: number, exp: any) => sum + parseFloat(exp.amount || 0), 0);
  const categories = ["all", ...Array.from(new Set(expenses.map((e: any) => e.category)))];
  const filteredExpenses = filterCategory === "all" ? expenses : expenses.filter((e: any) => e.category === filterCategory);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="h-10 w-10 rounded-xl bg-primary animate-pulse" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Expense Tracking</h1>
          <p className="text-muted-foreground mt-1">Monitor expenses and calculate net profit</p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors">
          <Plus className="w-5 h-5" /> Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-3xl p-6 border border-foreground/10 shadow-brutal">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-muted-foreground">Total Expenses</h3>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">${totalExpenses.toLocaleString()}</div>
        </div>
        <div className="bg-card rounded-3xl p-6 border border-foreground/10 shadow-brutal">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-muted-foreground">Expense Count</h3>
            <DollarSign className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">{expenses.length}</div>
        </div>
        <div className="bg-card rounded-3xl p-6 border border-foreground/10 shadow-brutal">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-muted-foreground">Categories</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">{categories.length - 1}</div>
        </div>
      </div>

      <div className="bg-card rounded-3xl p-6 border border-foreground/10 shadow-brutal">
        <h2 className="text-xl font-semibold text-foreground mb-6">Income vs Expenses vs Profit</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expenses" fill="#ef4444" radius={[8, 8, 0, 0]} />
            <Bar dataKey="profit" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-3xl border border-foreground/10 shadow-brutal">
        <div className="p-6 border-b border-foreground/10">
          <h2 className="text-xl font-semibold text-foreground">Recent Expenses</h2>
          <div className="flex gap-2 mt-4">
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${filterCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {filteredExpenses.map((expense: any) => (
                <tr key={expense.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{(expense.date || "").substring(0, 10)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground capitalize">{expense.category}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{expense.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">${expense.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {expense.maintenanceRequestId ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-foreground rounded-full text-xs font-medium">
                        <Link2 className="w-3 h-3" />{expense.maintenanceTitle || 'Maintenance'}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">Manual</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button onClick={() => handleDelete(expense.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-3xl border border-foreground/10 max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-foreground mb-4">Add Expense</h3>
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Category</label>
                <select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="repairs">Repairs</option><option value="cleaning">Cleaning</option><option value="utilities">Utilities</option>
                  <option value="insurance">Insurance</option><option value="taxes">Taxes</option><option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Description *</label>
                <input type="text" placeholder="What was this expense for?" value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Amount ($) *</label>
                <input type="number" placeholder="150" value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Date *</label>
                <input type="date" value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-border rounded-lg hover:bg-muted">Cancel</button>
              <button onClick={handleAddExpense} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium">Add Expense</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
