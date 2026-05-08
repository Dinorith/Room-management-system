import { useState, useEffect } from "react";
import { Building2, Users, DollarSign, AlertCircle, AlertTriangle, RefreshCw, Clock, TrendingUp, TrendingDown, Percent, Zap, FileText, ChevronRight } from "lucide-react";
import { StatCard } from "../components/StatCard";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "../lib/api";

export function Dashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [expiringContracts, setExpiringContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingInvoices, setGeneratingInvoices] = useState(false);

  // Renewal modal state
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewingContract, setRenewingContract] = useState<any>(null);
  const [renewForm, setRenewForm] = useState({ rentIncrease: 0, durationMonths: 12 });
  const [renewLoading, setRenewLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [overviewRes, alertsRes, paymentsRes, summaryRes, expiringRes] = await Promise.all([
        api.getDashboardOverview(),
        api.getDashboardAlerts(),
        api.getPayments({ status: "pending", limit: "5" }),
        api.getFinancialSummary(),
        api.getExpiringContracts(),
      ]);
      setOverview(overviewRes.data);
      setAlerts(alertsRes.data || []);
      setPendingPayments(paymentsRes.data || []);
      setExpiringContracts(expiringRes.data || []);

      const summary = summaryRes.data?.monthlySummary || [];
      const chartData = summary.map((s: any) => ({
        month: s.month.split(' ')[0],
        income: s.totalIncome,
        paid: s.paid,
        unpaid: s.unpaid,
      }));
      setMonthlyData(chartData);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRenewClick = (contract: any) => {
    setRenewingContract(contract);
    setRenewForm({ rentIncrease: 0, durationMonths: 12 });
    setShowRenewModal(true);
  };

  const handleRenewSubmit = async () => {
    if (!renewingContract) return;
    setRenewLoading(true);
    try {
      await api.renewContract(renewingContract.id, {
        rentIncrease: renewForm.rentIncrease,
        durationMonths: renewForm.durationMonths,
      });
      setShowRenewModal(false);
      setRenewingContract(null);
      const expiringRes = await api.getExpiringContracts();
      setExpiringContracts(expiringRes.data || []);
    } catch (err: any) {
      alert(err.message || "Failed to renew contract");
    } finally {
      setRenewLoading(false);
    }
  };

  const handleGenerateInvoices = async () => {
    setGeneratingInvoices(true);
    try {
      const res = await api.generateInvoices();
      alert(res.data?.output || "Invoices generated successfully");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to generate invoices");
    } finally {
      setGeneratingInvoices(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalRooms = (overview?.occupiedRooms || 0) + (overview?.vacantRooms || 0);
  const newRentPreview = renewingContract
    ? (parseFloat(renewingContract.rentAmount) * (1 + renewForm.rentIncrease / 100)).toFixed(2)
    : "0";

  const revTrend = overview?.trends?.revenue ?? 0;
  const expTrend = overview?.trends?.expenses ?? 0;

  return (
    <div className="space-y-6">
      {/* Page Title + Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your rental properties</p>
        </div>
        <Button
          variant="primary"
          icon={FileText}
          onClick={handleGenerateInvoices}
          disabled={generatingInvoices}
        >
          {generatingInvoices ? "Generating..." : "Generate Invoices"}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Occupancy Rate"
          value={`${overview?.occupancyRate || 0}%`}
          icon={Building2}
          trend={`${overview?.occupiedRooms || 0} / ${totalRooms} rooms`}
          trendUp={true}
          color="blue"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${(overview?.totalRevenue || 0).toLocaleString()}`}
          icon={DollarSign}
          trend={`${revTrend >= 0 ? '↑' : '↓'} ${Math.abs(revTrend)}% vs last month`}
          trendUp={revTrend >= 0}
          color="green"
        />
        <StatCard
          title="Collection Rate"
          value={`${overview?.collectionRate || 0}%`}
          icon={Percent}
          trend={`Net profit: $${(overview?.netProfit || 0).toLocaleString()}`}
          trendUp={(overview?.netProfit || 0) >= 0}
          color="green"
        />
        <StatCard
          title="Overdue Payments"
          value={String(overview?.overduePayments || 0)}
          icon={AlertCircle}
          trend={`${overview?.pendingPayments || 0} pending · ${overview?.maintenanceRequests || 0} maintenance`}
          trendUp={false}
          color={(overview?.overduePayments || 0) > 0 ? "red" : "orange"}
        />
      </div>

      {/* Alerts Panel */}
      {alerts.length > 0 && (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Zap className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">System Alerts</h2>
              <p className="text-sm text-muted-foreground">{alerts.length} item{alerts.length > 1 ? 's' : ''} require attention</p>
            </div>
          </div>
          <div className="divide-y divide-border max-h-80 overflow-y-auto">
            {alerts.map((alert: any, i: number) => (
              <div key={i} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  alert.severity === 'danger' ? 'bg-red-500' :
                  alert.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{alert.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
                </div>
                <Badge variant={
                  alert.severity === 'danger' ? 'danger' :
                  alert.severity === 'warning' ? 'warning' : 'info'
                }>
                  {alert.type === 'payment-overdue' ? `${alert.daysOverdue}d overdue` :
                   alert.type === 'contract-expiring' ? `${alert.daysRemaining}d left` :
                   alert.severity}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expiring Contracts Alert */}
      {expiringContracts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-amber-100/60 border-b border-amber-200 flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-amber-900">Contracts Expiring Soon</h2>
              <p className="text-sm text-amber-700">{expiringContracts.length} contract{expiringContracts.length > 1 ? 's' : ''} expiring within 30 days</p>
            </div>
          </div>
          <div className="divide-y divide-amber-200">
            {expiringContracts.map((contract: any) => (
              <div key={contract.id} className="p-4 flex items-center justify-between hover:bg-amber-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-lg border border-amber-200">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{contract.tenant}</p>
                    <p className="text-sm text-muted-foreground">Room {contract.room} · ${contract.rentAmount}/mo</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-amber-700">
                      {contract.daysRemaining} day{contract.daysRemaining !== 1 ? 's' : ''} left
                    </p>
                    <p className="text-xs text-muted-foreground">Expires {contract.endDate}</p>
                  </div>
                  <Button
                    variant="primary"
                    icon={RefreshCw}
                    onClick={() => handleRenewClick(contract)}
                  >
                    Renew
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart — Income + Paid/Unpaid */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Monthly Income</h2>
            <p className="text-sm text-muted-foreground">Last 6 months revenue (paid vs unpaid)</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-600 inline-block" /> Paid</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400 inline-block" /> Unpaid</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Bar dataKey="paid" stackId="a" fill="#2563eb" radius={[0, 0, 0, 0]} name="Paid" />
            <Bar dataKey="unpaid" stackId="a" fill="#f87171" radius={[8, 8, 0, 0]} name="Unpaid" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pending/Overdue Payments Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Payments Requiring Action</h2>
          <p className="text-sm text-muted-foreground">Pending and overdue payments</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tenant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Rent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Utility</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Late Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pendingPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                    No pending payments 🎉
                  </td>
                </tr>
              ) : (
                pendingPayments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{payment.tenant}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">Room {payment.room}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">${payment.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {payment.utilityAmount > 0 ? `$${payment.utilityAmount}` : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {payment.lateFee > 0 ? <span className="text-red-600">${payment.lateFee}</span> : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-foreground">${payment.total}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{payment.dueDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={payment.status === 'overdue' ? 'danger' : 'warning'}>
                        {payment.status === 'overdue' ? 'Overdue' : 'Pending'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Renew Contract Modal */}
      {showRenewModal && renewingContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-foreground mb-1">Renew Contract</h3>
            <p className="text-sm text-muted-foreground mb-5">
              {renewingContract.tenant} · Room {renewingContract.room}
            </p>

            <div className="bg-muted/50 rounded-lg p-4 mb-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Current Rent</span>
                  <p className="font-semibold text-foreground">${renewingContract.rentAmount}/mo</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Expires</span>
                  <p className="font-semibold text-foreground">{renewingContract.endDate}</p>
                </div>
                <div className="col-span-2 pt-2 border-t border-border">
                  <span className="text-muted-foreground">New Rent (preview)</span>
                  <p className="font-semibold text-green-600 text-lg">${newRentPreview}/mo</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Rent Increase (%)</label>
                <input
                  type="number" min="0" max="100" step="0.5"
                  value={renewForm.rentIncrease}
                  onChange={(e) => setRenewForm({ ...renewForm, rentIncrease: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">New Duration (months)</label>
                <select
                  value={renewForm.durationMonths}
                  onChange={(e) => setRenewForm({ ...renewForm, durationMonths: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={6}>6 months</option>
                  <option value={12}>12 months (1 year)</option>
                  <option value={18}>18 months</option>
                  <option value={24}>24 months (2 years)</option>
                  <option value={36}>36 months (3 years)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowRenewModal(false); setRenewingContract(null); }}>Cancel</Button>
              <Button variant="primary" icon={RefreshCw} onClick={handleRenewSubmit} disabled={renewLoading}>
                {renewLoading ? "Renewing..." : "Renew Contract"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
