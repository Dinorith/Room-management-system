import { useState, useEffect } from "react";
import { FileText, Download, Database, DollarSign, TrendingUp, BarChart3, PieChart } from "lucide-react";
import { api } from "../lib/api";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export function Reports() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getFinancialSummary();
        setData(res.data);
      } catch (err) {
        console.error("Failed to load reports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const exportCSV = () => {
    if (!data?.monthlySummary) return;
    const headers = "Month,Total Income,Paid,Unpaid,Collection Rate\n";
    const rows = data.monthlySummary
      .map((m: any) => `${m.month},$${m.totalIncome},$${m.paid},$${m.unpaid},${m.collectionRate}%`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-10 w-10 rounded-xl bg-primary animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Failed to load report data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Reports</h1>
        <p className="text-muted-foreground mt-1">View and download financial reports</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-card rounded-3xl p-6 border border-foreground/10 shadow-brutal hover:shadow-md transition-shadow">
          <p className="text-sm text-muted-foreground mb-1">Year to Date</p>
          <p className="text-3xl font-bold text-foreground">${data.ytdRevenue?.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-2 font-medium">Net: ${data.netProfit?.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-3xl p-6 border border-foreground/10 shadow-brutal hover:shadow-md transition-shadow">
          <p className="text-sm text-muted-foreground mb-1">This Month</p>
          <p className="text-3xl font-bold text-foreground">${data.thisMonthIncome?.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-3xl p-6 border border-foreground/10 shadow-brutal hover:shadow-md transition-shadow">
          <p className="text-sm text-muted-foreground mb-1">Collection Rate</p>
          <p className="text-3xl font-bold text-foreground">{data.collectionRate}%</p>
        </div>
        <div className="bg-card rounded-3xl p-6 border border-foreground/10 shadow-brutal hover:shadow-md transition-shadow">
          <p className="text-sm text-muted-foreground mb-1">Occupancy Rate</p>
          <p className="text-3xl font-bold text-foreground">{data.occupancyRate}%</p>
        </div>
      </div>

      {/* Download Reports */}
      <div className="bg-secondary text-secondary-foreground rounded-3xl p-6 shadow-brutal">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Download className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-semibold">Download Reports</h2>
              <p className="text-secondary-foreground/60 text-sm">Export your financial data</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-2xl font-medium hover:bg-primary/90 transition-colors shadow-brutal-sm"
            >
              <FileText className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>



      {/* Complete Data Backup */}
      <div className="bg-card rounded-3xl p-6 border border-foreground/10 shadow-brutal">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Complete Data Backup</h3>
              <p className="text-sm text-muted-foreground">
                Download a complete backup of all your data including tenants, payments, expenses, and settings.
                <br />
                <span className="text-xs">Keep regular backups for data security and disaster recovery.</span>
              </p>
            </div>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Database className="w-4 h-4" />
            Backup All Data
          </button>
        </div>
      </div>

      {/* Monthly Income Summary */}
      <div className="bg-card rounded-3xl border border-foreground/10 shadow-brutal">
        <div className="p-6 border-b border-foreground/10">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Monthly Income Summary</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Last 6 months financial overview</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Income</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unpaid</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Collection %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {data.monthlySummary?.map((month: any, idx: number) => (
                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{month.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">${month.totalIncome?.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-foreground">${month.paid?.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-500">${month.unpaid?.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden max-w-[120px]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${month.collectionRate}%`,
                            backgroundColor: month.collectionRate >= 90 ? '#10b981' : month.collectionRate >= 70 ? '#3b82f6' : '#f59e0b',
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground">{month.collectionRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Cards: Payment Methods + Room Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="bg-card rounded-3xl border border-foreground/10 shadow-brutal">
          <div className="p-6 border-b border-foreground/10">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-foreground">Payment Methods</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {data.paymentMethods?.length > 0 ? (
              data.paymentMethods.map((method: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-sm font-medium text-foreground">
                      {method.method === "qr_code" ? "QR Code" : 
                       method.method === "cash" ? "Cash" : 
                       method.method === "bank_transfer" ? "Bank Transfer" : 
                       method.method === "credit_card" ? "Credit Card" : 
                       method.method?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${method.percentage}%`, backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-foreground w-10 text-right">{method.percentage}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No payment data available</p>
            )}
          </div>
        </div>

        {/* Room Type Distribution */}
        <div className="bg-card rounded-3xl border border-foreground/10 shadow-brutal">
          <div className="p-6 border-b border-foreground/10">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-foreground">Room Type Distribution</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {data.roomTypes?.length > 0 ? (
              data.roomTypes.map((type: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-sm font-medium text-foreground">{type.type}</span>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">{type.count} rooms</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No room data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Financial Overview Card */}
      <div className="bg-card rounded-3xl border border-foreground/10 shadow-brutal">
        <div className="p-6 border-b border-foreground/10">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Year-to-Date Financial Overview</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-sm text-green-700 mb-1 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-green-700">${data.ytdRevenue?.toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
              <p className="text-sm text-red-700 mb-1 font-medium">Total Expenses</p>
              <p className="text-2xl font-bold text-red-700">${data.ytdExpenses?.toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-xl border border-foreground/10">
              <p className="text-sm text-foreground mb-1 font-medium">Net Profit</p>
              <p className={`text-2xl font-bold ${data.netProfit >= 0 ? 'text-foreground' : 'text-red-700'}`}>
                ${data.netProfit?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
