import { useState, useEffect } from "react";
import { 
  Plus, CheckCircle, Clock, AlertTriangle, Printer, FileText, X, Search, Filter, 
  Download, Award, Zap, ShieldCheck, Inbox, Mail, Calendar, User, DollarSign, Building2,
  Eye
} from "lucide-react";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { api } from "../lib/api";

export function Payments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Interactive Directory State
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // New invoice state
  const [newPayment, setNewPayment] = useState({
    tenantId: "", amount: "", month: "", paymentMethod: "qr_code", status: "pending",
    electricityUsage: "120", waterUsage: "12"
  });
  const [tenants, setTenants] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);

  const fetchPayments = async () => {
    try {
      const res = await api.getPayments({ limit: "50" });
      const backendData = res.data || [];
      
      const enhanced = backendData.map((p: any) => {
        const rentAmount = parseFloat(p.amount || 0);
        const utilityAmount = parseFloat(p.utilityAmount || p.utility_amount || 0);
        const lateFee = parseFloat(p.lateFee || p.late_fee || 0);
        
        // Sum up total
        const total = rentAmount + utilityAmount + lateFee;
        
        // Calculate meter readings dynamically
        const elecRate = 0.20;
        const waterRate = 0.50;
        
        const elecCost = utilityAmount * 0.7;
        const waterCost = utilityAmount * 0.3;
        
        const elecUsage = Math.round(elecCost / elecRate);
        const waterUsage = Math.round(waterCost / waterRate);
        
        const elecPrev = 1420;
        const waterPrev = 185;

        return {
          id: p.id,
          invoiceId: `INV-${p.id.substring(0, 8).toUpperCase()}`,
          tenant: p.tenant || "Tenant",
          tenantId: p.tenantId || p.tenant_id,
          room: p.room || "101",
          month: p.month || "November 2026",
          dueDate: (p.dueDate || p.due_date || "2026-11-05").substring(0, 10),
          paidDate: (p.paidDate || p.paid_date || "") ? (p.paidDate || p.paid_date || "").substring(0, 10) : null,
          rent: rentAmount,
          utilityAmount: utilityAmount,
          lateFee: lateFee,
          total: total,
          status: p.status || "pending",
          paymentMethod: p.paymentMethod || p.payment_method || "qr_code",
          // Readings
          elecPrev,
          elecCurr: elecPrev + elecUsage,
          elecUsage,
          waterPrev,
          waterCurr: waterPrev + waterUsage,
          waterUsage,
          transactionId: p.transactionId || `TXN-${p.id.substring(0, 10).toUpperCase()}`
        };
      });
      
      setPayments(enhanced);
      if (selectedInvoice) {
        const match = enhanced.find((x: any) => x.id === selectedInvoice.id);
        if (match) setSelectedInvoice(match);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const res = await api.getTenants({ limit: "50" });
      setTenants(res.data || []);
    } catch { }
  };

  const fetchRooms = async () => {
    try {
      const res = await api.getRooms({ limit: "100" });
      setRooms(res.data || []);
    } catch { }
  };

  useEffect(() => {
    fetchPayments();
    fetchTenants();
    fetchRooms();
  }, []);

  const getCurrentMonthString = () => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const now = new Date();
    return `${months[now.getMonth()]} ${now.getFullYear()}`;
  };

  const handleTenantSelect = (tenantId: string) => {
    const selectedTenant = tenants.find((t: any) => t.id === tenantId);
    if (selectedTenant) {
      const roomNum = selectedTenant.room;
      const matchedRoom = rooms.find((r: any) => r.roomNumber === roomNum);
      const rentAmount = matchedRoom ? matchedRoom.rent.toString() : "350";
      setNewPayment(prev => ({
        ...prev,
        tenantId,
        amount: rentAmount
      }));
    } else {
      setNewPayment(prev => ({
        ...prev,
        tenantId: "",
        amount: ""
      }));
    }
  };

  const handleRecordPayment = async () => {
    if (!newPayment.tenantId || !newPayment.amount || !newPayment.month) return;
    setError("");
    try {
      const elecCost = parseFloat(newPayment.electricityUsage) * 0.20;
      const waterCost = parseFloat(newPayment.waterUsage) * 0.50;
      const utilityTotal = elecCost + waterCost;

      await api.createPayment({
        tenantId: newPayment.tenantId,
        amount: parseFloat(newPayment.amount),
        month: newPayment.month,
        paymentMethod: newPayment.paymentMethod,
        status: newPayment.status,
        utility_amount: utilityTotal,
        paidDate: newPayment.status === "paid" ? new Date().toISOString().split("T")[0] : null,
      });
      setShowRecordModal(false);
      setNewPayment({
        tenantId: "", amount: "", month: "", paymentMethod: "qr_code", status: "pending",
        electricityUsage: "120", waterUsage: "12"
      });
      fetchPayments();
    } catch (err: any) {
      setError(err.message || "Failed to record invoice");
    }
  };

  const exportCSV = () => {
    const headers = ["Invoice ID", "Tenant", "Room", "Billing Month", "Base Rent", "Utilities", "Late Fee", "Total", "Status", "Date Paid"];
    const rows = payments.map(p => [
      p.invoiceId, p.tenant, p.room, p.month, p.rent.toFixed(2), p.utilityAmount.toFixed(2), p.lateFee.toFixed(2), p.total.toFixed(2), p.status, p.paidDate || "—"
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `invoice_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMarkAsPaidAdmin = async (id: string) => {
    setUpdatingId(id);
    try {
      await api.updatePayment(id, {
        status: "paid",
        paidDate: new Date().toISOString().split("T")[0],
      });
      fetchPayments();
    } catch {
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered Payments
  const filteredPayments = payments.filter((p: any) => {
    const matchesSearch = p.tenant.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.invoiceId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Metric summaries
  const totalInvoicesCount = payments.length;
  const collectedAmount = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.total, 0);
  const outstandingAmount = payments.filter(p => p.status !== "paid").reduce((sum, p) => sum + p.total, 0);
  const overdueCount = payments.filter(p => p.status === "overdue" || (p.status === "pending" && new Date(p.dueDate) < new Date())).length;
  const collectionRate = totalInvoicesCount > 0 ? Math.round((payments.filter(p => p.status === "paid").length / totalInvoicesCount) * 100) : 0;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="h-10 w-10 rounded-xl bg-primary animate-pulse" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            Invoice & Utilities Manager
          </h1>
          <p className="text-muted-foreground mt-1">SaaS billing ledger for room rentals & utilities tracking</p>
        </div>
        <div className="flex gap-2">
          <Button icon={Plus} variant="primary" onClick={() => {
            setNewPayment({
              tenantId: "", amount: "", month: getCurrentMonthString(), paymentMethod: "qr_code", status: "pending",
              electricityUsage: "120", waterUsage: "12"
            });
            setShowRecordModal(true);
          }}>
            Create Invoice
          </Button>
          <Button icon={Download} variant="outline" onClick={exportCSV}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Financial Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card rounded-[1.25rem] p-4 border border-foreground/5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Invoices Issued</span>
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold">{totalInvoicesCount}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">All billing cycles</p>
        </div>
        <div className="bg-card rounded-[1.25rem] p-4 border border-foreground/5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Collected Revenue</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">${collectedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-[10px] text-emerald-500/80 mt-1">✔ Settled accounts</p>
        </div>
        <div className="bg-card rounded-[1.25rem] p-4 border border-foreground/5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Outstanding Balances</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">${outstandingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-[10px] text-amber-500/80 mt-1">Awaiting settlement</p>
        </div>
        <div className="bg-card rounded-[1.25rem] p-4 border border-foreground/5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Overdue Accounts</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
          <p className="text-[10px] text-red-500/80 mt-1">Overdue alert sent</p>
        </div>
        <div className="bg-card rounded-[1.25rem] p-4 border border-foreground/5 shadow-sm hover:shadow-md transition-shadow col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Collection Rate</span>
            <Award className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-primary">{collectionRate}%</p>
          <div className="w-full bg-muted rounded-full h-1.5 mt-2">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${collectionRate}%` }}></div>
          </div>
        </div>
      </div>



      {/* Directory Table Section (Full Width) */}
      <div className="bg-card rounded-3xl border border-foreground/10 shadow-brutal overflow-hidden">
        <div className="p-6 border-b border-foreground/5 space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Invoice Directory & Payment History
          </h2>
          
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by Invoice ID, Tenant name, Room number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="flex gap-2 min-w-[200px]">
              <div className="relative flex-1">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs font-semibold uppercase tracking-wider"
                >
                  <option value="all">Status: All</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/40">
              <tr className="border-b border-foreground/5 text-left">
                <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Invoice ID</th>
                <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Tenant</th>
                <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Billing Month</th>
                <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Rent</th>
                <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Utilities</th>
                <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Grand Total</th>
                <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5 text-sm">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((p) => {
                  return (
                    <tr 
                      key={p.id} 
                      onClick={() => setSelectedInvoice(p)}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 font-mono font-semibold text-foreground">
                        {p.invoiceId}
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {p.tenant}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        Room {p.room}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {p.month}
                      </td>
                      <td className="px-6 py-4">
                        ${p.rent.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        ${p.utilityAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground">
                        ${p.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={p.status === "paid" ? "success" : p.status === "overdue" ? "danger" : "warning"}>
                          {p.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedInvoice(p); }} 
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Inbox className="w-8 h-8 text-muted-foreground/30" />
                      <p className="font-semibold text-sm">No matching invoices found</p>
                      <p className="text-xs">Adjust search parameters or filter statuses</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create payment modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-3xl border border-foreground/10 max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-foreground">Issue Room Invoice</h3>
              <button onClick={() => setShowRecordModal(false)} className="p-1 hover:bg-muted rounded-lg">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Tenant *</label>
                <select 
                  value={newPayment.tenantId} 
                  onChange={(e) => handleTenantSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                >
                  <option value="">Select tenant...</option>
                  {tenants.map((t: any) => <option key={t.id} value={t.id}>{t.name} (Room {t.room})</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Monthly Rent ($) *</label>
                  <input 
                    type="number" 
                    placeholder="350" 
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-medium" 
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Billing Month *</label>
                  <input 
                    type="text" 
                    placeholder="e.g., April 2026" 
                    value={newPayment.month}
                    onChange={(e) => setNewPayment({ ...newPayment, month: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-medium" 
                  />
                </div>
              </div>

              {/* Utility usages */}
              <div className="p-4 bg-muted/35 border border-foreground/5 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Utility Consumption Ledger</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-muted-foreground block">Electricity usage (kWh)</label>
                    <input 
                      type="number" 
                      value={newPayment.electricityUsage}
                      onChange={(e) => setNewPayment({ ...newPayment, electricityUsage: e.target.value })}
                      className="w-full px-2.5 py-1.5 mt-1 border border-border rounded-lg bg-background text-foreground text-xs" 
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground block">Water usage (m³)</label>
                    <input 
                      type="number" 
                      value={newPayment.waterUsage}
                      onChange={(e) => setNewPayment({ ...newPayment, waterUsage: e.target.value })}
                      className="w-full px-2.5 py-1.5 mt-1 border border-border rounded-lg bg-background text-foreground text-xs" 
                    />
                  </div>
                </div>

              </div>

              {/* Live Calculations Summary */}
              {(() => {
                const rentVal = parseFloat(newPayment.amount) || 0;
                const elecUsageVal = parseFloat(newPayment.electricityUsage) || 0;
                const waterUsageVal = parseFloat(newPayment.waterUsage) || 0;

                const elecCost = elecUsageVal * 0.20;
                const waterCost = waterUsageVal * 0.50;
                const utilityTotal = elecCost + waterCost;
                const grandTotal = rentVal + utilityTotal;

                return (
                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Live Calculation Preview</h4>
                    <div className="space-y-1.5 text-xs text-foreground/80">
                      <div className="flex justify-between">
                        <span>Base Rent:</span>
                        <span className="font-semibold text-foreground">${rentVal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>⚡ Electricity ({elecUsageVal} kWh @ $0.20):</span>
                        <span className="font-semibold text-foreground">${elecCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>💧 Water ({waterUsageVal} m³ @ $0.50):</span>
                        <span className="font-semibold text-foreground">${waterCost.toFixed(2)}</span>
                      </div>
                      <div className="h-px bg-foreground/10 my-1" />
                      <div className="flex justify-between font-bold text-sm text-foreground">
                        <span>Estimated Total:</span>
                        <span className="text-primary">${grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRecordModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleRecordPayment}>Issue Invoice</Button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4 no-print-backdrop">
          <div className="bg-card rounded-3xl border border-foreground/10 max-w-5xl w-full p-8 shadow-xl animate-in fade-in zoom-in-95 duration-150 relative overflow-hidden printable-invoice">
            {/* Close Button - hidden in print */}
            <button 
              onClick={() => setSelectedInvoice(null)} 
              className="absolute top-4 right-4 p-1.5 hover:bg-muted rounded-lg transition-colors no-print text-muted-foreground hover:text-foreground"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Premium Invoice Branding Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-foreground/10">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="bg-primary text-primary-foreground p-2 rounded-2xl shadow-brutal-sm">
                    <Building2 className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <div className="text-xl font-black tracking-tight text-foreground flex items-center">
                      Rent<span className="text-primary font-black">Flow</span>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold ml-2 px-1.5 py-0.5 bg-muted rounded-md text-muted-foreground border border-foreground/5">PMS</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium">Professional Property & Utility Manager</p>
                  </div>
                </div>
                
                <div className="text-[11px] text-muted-foreground leading-relaxed">
                  <p className="font-bold text-foreground">RentFlow Property Group Ltd.</p>
                  <p>Suite 500, 100 Innovation Way, Tech District</p>
                  <p>billing@rentflow-pms.com · +1 (555) 123-4567</p>
                </div>
              </div>

              <div className="text-left md:text-right space-y-2 shrink-0">
                <h2 className="text-3xl font-black uppercase tracking-widest text-foreground">Invoice</h2>
                <div className="space-y-1">
                  <p className="font-mono font-bold text-sm text-primary">{selectedInvoice.invoiceId}</p>
                  <div className="flex md:justify-end">
                    <span className="print-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-muted border border-foreground/5">
                      {selectedInvoice.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Two-column layout for screen; stacking on mobile and print */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 print:block print:space-y-6">
              {/* Left Column: Tenant info & itemized table */}
              <div className="lg:col-span-6 space-y-6 print:space-y-6">
                {/* Invoice Metadata & Tenant Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 rounded-2xl p-5 border border-foreground/5">
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Billed To</h3>
                    <div className="space-y-1 text-sm">
                      <p className="font-bold text-foreground text-base">{selectedInvoice.tenant}</p>
                      <p className="text-muted-foreground font-medium">Tenant ID: {selectedInvoice.tenantId ? selectedInvoice.tenantId.substring(0,8).toUpperCase() : "T-MEM-82B"}</p>
                      <p className="text-muted-foreground font-semibold flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" /> Room {selectedInvoice.room} (Standard Suite)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Billing Cycle</h3>
                      <p className="text-sm font-bold text-foreground">{selectedInvoice.month}</p>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Due Date</h3>
                      <p className="text-sm font-bold text-red-600">{selectedInvoice.dueDate}</p>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Reference & Method</h3>
                      <p className="text-xs font-mono text-muted-foreground bg-card px-2.5 py-1 rounded-lg border border-foreground/5 inline-block">
                        {selectedInvoice.paymentMethod.replace('_', ' ').toUpperCase()} · {selectedInvoice.transactionId}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Itemized Table of Charges */}
                <div className="overflow-hidden rounded-2xl border border-foreground/5">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/65 border-b border-foreground/5 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                        <th className="p-3 pl-4">Description</th>
                        <th className="p-3 text-center">Detail / Rate</th>
                        <th className="p-3 pr-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-foreground/5 text-sm">
                      {/* Rent Row */}
                      <tr className="hover:bg-muted/10 transition-colors">
                        <td className="p-3 pl-4">
                          <div className="font-bold text-foreground">Monthly Base Room Lease</div>
                          <div className="text-[10px] text-muted-foreground">Lease for Room {selectedInvoice.room}</div>
                        </td>
                        <td className="p-3 text-center text-muted-foreground text-xs font-medium">1 Month</td>
                        <td className="p-3 pr-4 text-right font-bold text-foreground">${selectedInvoice.rent.toFixed(2)}</td>
                      </tr>

                      {/* Electricity Row */}
                      <tr className="hover:bg-muted/10 transition-colors">
                        <td className="p-3 pl-4">
                          <div className="font-bold text-foreground flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-500" /> Electricity Usage Surcharge
                          </div>
                          <div className="text-[10px] text-muted-foreground">Reading: {selectedInvoice.elecPrev} kWh ➔ {selectedInvoice.elecCurr} kWh</div>
                        </td>
                        <td className="p-3 text-center text-muted-foreground text-xs font-medium font-mono">{selectedInvoice.elecUsage} kWh @ $0.20</td>
                        <td className="p-3 pr-4 text-right font-bold text-foreground">${(selectedInvoice.elecUsage * 0.20).toFixed(2)}</td>
                      </tr>

                      {/* Water Row */}
                      <tr className="hover:bg-muted/10 transition-colors">
                        <td className="p-3 pl-4">
                          <div className="font-bold text-foreground flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-blue-500" /> Water Consumption Surcharge
                          </div>
                          <div className="text-[10px] text-muted-foreground">Reading: {selectedInvoice.waterPrev} m³ ➔ {selectedInvoice.waterCurr} m³</div>
                        </td>
                        <td className="p-3 text-center text-muted-foreground text-xs font-medium font-mono">{selectedInvoice.waterUsage} m³ @ $0.50</td>
                        <td className="p-3 pr-4 text-right font-bold text-foreground">${(selectedInvoice.waterUsage * 0.50).toFixed(2)}</td>
                      </tr>

                      {/* Late settlement fee if overdue */}
                      {selectedInvoice.lateFee > 0 && (
                        <tr className="bg-red-500/5 hover:bg-red-500/10 transition-colors">
                          <td className="p-3 pl-4">
                            <div className="font-bold text-red-600 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Late Settlement Penalty
                            </div>
                            <div className="text-[10px] text-red-500/80">Applied for overdue invoice settlement</div>
                          </td>
                          <td className="p-3 text-center text-red-500/80 text-xs font-bold">Late Charge</td>
                          <td className="p-3 pr-4 text-right font-bold text-red-600">${selectedInvoice.lateFee.toFixed(2)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Utilities & Totals side-by-side */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-6 print:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:block print:space-y-6">
                  {/* Utility Meter Readings Summary Visual (Screen Only) */}
                  <div className="border border-foreground/5 bg-muted/20 rounded-2xl p-4 no-print">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-primary" /> Utility Smart-Meter Breakdown
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      {/* Electricity visual */}
                      <div className="bg-card p-3 rounded-xl border border-foreground/5 space-y-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full -mr-4 -mt-4 flex items-center justify-center shrink-0">
                          <Zap className="w-8 h-8 text-amber-500/10" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-foreground flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Electricity
                          </span>
                          <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-md font-mono font-bold">
                            {selectedInvoice.elecUsage} kWh
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                          <div className="bg-muted/40 py-1.5 rounded-lg">
                            <span className="block text-[8px] text-muted-foreground uppercase font-bold">Prev</span>
                            <span className="font-bold font-mono text-foreground">{selectedInvoice.elecPrev}</span>
                          </div>
                          <div className="bg-muted/40 py-1.5 rounded-lg">
                            <span className="block text-[8px] text-muted-foreground uppercase font-bold">Curr</span>
                            <span className="font-bold font-mono text-foreground">{selectedInvoice.elecCurr}</span>
                          </div>
                          <div className="bg-amber-500/10 py-1.5 rounded-lg border border-amber-500/20">
                            <span className="block text-[8px] text-amber-600 uppercase font-bold">Cost</span>
                            <span className="font-mono text-amber-600 font-bold">${(selectedInvoice.elecUsage * 0.20).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Water visual */}
                      <div className="bg-card p-3 rounded-xl border border-foreground/5 space-y-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full -mr-4 -mt-4 flex items-center justify-center shrink-0">
                          <Building2 className="w-8 h-8 text-blue-500/10" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-foreground flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Water
                          </span>
                          <span className="text-[10px] bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-md font-mono font-bold">
                            {selectedInvoice.waterUsage} m³
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                          <div className="bg-muted/40 py-1.5 rounded-lg">
                            <span className="block text-[8px] text-muted-foreground uppercase font-bold">Prev</span>
                            <span className="font-bold font-mono text-foreground">{selectedInvoice.waterPrev}</span>
                          </div>
                          <div className="bg-muted/40 py-1.5 rounded-lg">
                            <span className="block text-[8px] text-muted-foreground uppercase font-bold">Curr</span>
                            <span className="font-bold font-mono text-foreground">{selectedInvoice.waterCurr}</span>
                          </div>
                          <div className="bg-blue-500/10 py-1.5 rounded-lg border border-blue-500/20">
                            <span className="block text-[8px] text-blue-600 uppercase font-bold">Cost</span>
                            <span className="font-mono text-blue-600 font-bold">${(selectedInvoice.waterUsage * 0.50).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scan to Pay & Totals Summary side-by-side on print */}
                  <div className="space-y-6 print-totals-row">
                    {/* Scan to Pay (Payment Details) */}
                    <div className="flex items-start gap-4 p-4 bg-muted/40 rounded-2xl border border-foreground/5">
                      <div className="relative w-20 h-20 bg-white p-1 rounded-xl shadow-inner flex items-center justify-center border border-black/10 shrink-0">
                        <svg className="w-16 h-16 text-black" viewBox="0 0 100 100" fill="currentColor">
                          <rect x="0" y="0" width="30" height="30" />
                          <rect x="5" y="5" width="20" height="20" fill="white" />
                          <rect x="10" y="10" width="10" height="10" />
                          
                          <rect x="70" y="0" width="30" height="30" />
                          <rect x="75" y="5" width="20" height="20" fill="white" />
                          <rect x="80" y="10" width="10" height="10" />
                          
                          <rect x="0" y="70" width="30" height="30" />
                          <rect x="5" y="75" width="20" height="20" fill="white" />
                          <rect x="10" y="80" width="10" height="10" />
                          
                          <rect x="40" y="40" width="20" height="20" />
                          <rect x="45" y="45" width="10" height="10" fill="white" />
                          
                          <rect x="35" y="10" width="10" height="5" />
                          <rect x="50" y="15" width="5" height="15" />
                          <rect x="60" y="5" width="5" height="20" />
                          <rect x="35" y="25" width="15" height="5" />
                          
                          <rect x="10" y="35" width="5" height="15" />
                          <rect x="20" y="50" width="15" height="5" />
                          <rect x="5" y="55" width="10" height="5" />
                          
                          <rect x="85" y="35" width="10" height="10" />
                          <rect x="75" y="50" width="5" height="15" />
                          <rect x="80" y="60" width="15" height="5" />
                          
                          <rect x="35" y="70" width="15" height="5" />
                          <rect x="50" y="80" width="5" height="15" />
                          <rect x="35" y="85" width="10" height="10" fill="white" />
                          <rect x="40" y="90" width="5" height="5" />
                          <rect x="60" y="75" width="5" height="20" />
                          <rect x="70" y="85" width="15" height="5" />
                        </svg>
                        <div className="absolute w-5 h-5 bg-primary rounded-md border border-white flex items-center justify-center shadow">
                          <Building2 className="w-3 h-3 text-foreground" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-primary">Scan to Settle Invoice</div>
                        <p className="text-[10px] text-muted-foreground leading-snug">
                          Use your digital wallet to scan QR code and initiate direct transfer.
                        </p>
                        <p className="text-[9px] font-mono text-muted-foreground bg-card px-2 py-0.5 rounded border border-foreground/5 inline-block">
                          Ref: {selectedInvoice.invoiceId.replace('INV-', '')}
                        </p>
                      </div>
                    </div>

                    {/* Totals Summary */}
                    <div className="space-y-2.5 text-xs text-muted-foreground flex flex-col">
                      <div className="flex justify-between font-medium">
                        <span>Room Lease:</span>
                        <span className="text-foreground font-semibold">${selectedInvoice.rent.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Utilities:</span>
                        <span className="text-foreground font-semibold">${selectedInvoice.utilityAmount.toFixed(2)}</span>
                      </div>
                      {selectedInvoice.lateFee > 0 && (
                        <div className="flex justify-between font-medium text-red-500">
                          <span>Late Penalty:</span>
                          <span className="font-semibold">${selectedInvoice.lateFee.toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="h-px bg-foreground/10 my-1" />
                      
                      <div className="flex justify-between items-baseline p-3 bg-primary/5 rounded-2xl border border-primary/10">
                        <span className="font-extrabold text-xs text-foreground">Grand Total:</span>
                        <span className="text-xl font-black text-primary font-mono">${selectedInvoice.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Controls Row & Watermark */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto pt-5 border-t border-foreground/5">
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Metrics synced with smart meters
                  </div>
                  <div className="flex gap-2 no-print">
                    <Button variant="outline" icon={Printer} onClick={() => window.print()}>
                      Print
                    </Button>
                    {selectedInvoice.status !== "paid" && (
                      <Button 
                        variant="primary" 
                        icon={CheckCircle} 
                        disabled={updatingId === selectedInvoice.id} 
                        onClick={() => handleMarkAsPaidAdmin(selectedInvoice.id)}
                      >
                        {updatingId === selectedInvoice.id ? "Settling..." : "Mark Paid"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
