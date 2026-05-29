import { useState, useEffect } from "react";
import { 
  Plus, CheckCircle, Clock, AlertTriangle, Printer, FileText, X, Search, Filter, 
  Download, Award, Zap, ShieldCheck, Inbox, Mail, Calendar, User, DollarSign, Building2,
  Eye, Link2, QrCode, CreditCard, Receipt
} from "lucide-react";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { api } from "../lib/api";

const getStayDays = (invoice: any) => {
  if (!invoice || !invoice.billingPeriodStart || !invoice.billingPeriodEnd) return 1;
  const start = new Date(invoice.billingPeriodStart.substring(0, 10));
  const end = new Date(invoice.billingPeriodEnd.substring(0, 10));
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
};

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

  // Clipboard copy state for payments
  const [copiedInvoiceId, setCopiedInvoiceId] = useState<string | null>(null);

  const handleCopyPaymentLink = (id: string) => {
    const payLink = `${window.location.protocol}//${window.location.host}/pay/${id}`;
    navigator.clipboard.writeText(payLink);
    setCopiedInvoiceId(id);
    setTimeout(() => {
      setCopiedInvoiceId(null);
    }, 2000);
  };
  
  // New invoice state
  const [newPayment, setNewPayment] = useState({
    tenantId: "", amount: "", month: "", paymentMethod: "qr_code", status: "pending", billingCycle: "monthly"
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
          invoiceId: p.invoiceNumber || p.invoice_number || `INV-${p.id.substring(0, 8).toUpperCase()}`,
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
          roomType: p.roomType || "Standard Suite",
          billingCycle: p.billingCycle || 'monthly',
          property: p.property || {
            name: "RentFlow Property Group Ltd.",
            address: "Suite 500, 100 Innovation Way, Tech District",
            email: "billing@rentflow-pms.com",
            phone: "+1 (555) 123-4567"
          },
          // Readings
          elecPrev,
          elecCurr: elecPrev + elecUsage,
          elecUsage,
          waterPrev,
          waterCurr: waterPrev + waterUsage,
          waterUsage,
          transactionId: p.transactionId || `TXN-${p.id.substring(0, 10).toUpperCase()}`,
          invoiceNumber: p.invoiceNumber || p.invoice_number || `INV-${p.id.substring(0, 8).toUpperCase()}`,
          invoiceType: p.invoiceType || p.invoice_type,
          billingPeriodStart: p.billingPeriodStart || p.billing_period_start,
          billingPeriodEnd: p.billingPeriodEnd || p.billing_period_end,
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

    // Poll payments in the background every 4 seconds to instantly detect tenant settles in real-time
    const interval = setInterval(() => {
      fetchPayments();
    }, 4000);

    return () => clearInterval(interval);
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
      let rentAmount = matchedRoom ? matchedRoom.rent : 350;
      const billingCycle = matchedRoom?.roomType?.billingCycle || 'monthly';
      
      if (billingCycle === 'daily' && selectedTenant.moveInDate && selectedTenant.moveOutDate) {
        const start = new Date(selectedTenant.moveInDate);
        const end = new Date(selectedTenant.moveOutDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        rentAmount = rentAmount * days;
      }
      
      setNewPayment(prev => ({
        ...prev,
        tenantId,
        amount: rentAmount.toString(),
        billingCycle: billingCycle,
      }));
    } else {
      setNewPayment(prev => ({
        ...prev,
        tenantId: "",
        amount: "",
        billingCycle: 'monthly',
      }));
    }
  };

  const handleRecordPayment = async () => {
    if (!newPayment.tenantId || !newPayment.amount || !newPayment.month) return;
    setError("");
    try {
      await api.createPayment({
        tenantId: newPayment.tenantId,
        amount: parseFloat(newPayment.amount),
        month: newPayment.month,
        paymentMethod: newPayment.paymentMethod,
        status: newPayment.status,
        utility_amount: 0,
        paidDate: newPayment.status === "paid" ? new Date().toISOString().split("T")[0] : null,
      });
      setShowRecordModal(false);
      setNewPayment({
        tenantId: "", amount: "", month: "", paymentMethod: "qr_code", status: "pending", billingCycle: "monthly"
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
            Invoice Manager
          </h1>
          <p className="text-muted-foreground mt-1">SaaS billing ledger for room rental payments</p>
        </div>
        <div className="flex gap-2">
          <Button icon={Plus} variant="primary" onClick={() => {
            setNewPayment({
              tenantId: "", amount: "", month: getCurrentMonthString(), paymentMethod: "qr_code", status: "pending", billingCycle: "monthly"
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
                        {p.invoiceNumber || p.invoiceId}
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
                      <td className="px-6 py-4 font-bold text-foreground">
                        ${p.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={p.status === "paid" ? "success" : p.status === "overdue" ? "danger" : p.status === "cancelled" || p.status === "duplicate" ? "default" : "warning"}>
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
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
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
                <label className="text-sm text-muted-foreground mb-1 block">{(newPayment as any).billingCycle === 'daily' ? 'Daily Rent ($) *' : 'Monthly Rent ($) *'}</label>
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

              {/* Live Calculations Summary */}
              {(() => {
                const rentVal = parseFloat(newPayment.amount) || 0;
                const selTenant = tenants.find((t: any) => t.id === newPayment.tenantId);
                const matchedRoom = rooms.find((r: any) => r.roomNumber === selTenant?.room);
                const dailyRate = parseFloat(matchedRoom ? matchedRoom.rent : 0);
                
                let days = 1;
                if (newPayment.billingCycle === 'daily' && selTenant?.moveInDate && selTenant?.moveOutDate) {
                  const start = new Date(selTenant.moveInDate);
                  const end = new Date(selTenant.moveOutDate);
                  const diffTime = Math.abs(end.getTime() - start.getTime());
                  days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
                }

                return (
                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Live Calculation Preview</h4>
                    <div className="space-y-1.5 text-xs text-foreground/80">
                      {newPayment.billingCycle === 'daily' && selTenant && (
                        <>
                          <div className="flex justify-between">
                            <span>Daily Rate:</span>
                            <span className="font-semibold text-foreground">${dailyRate.toFixed(2)}/day</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Stay Duration:</span>
                            <span className="font-semibold text-foreground">{days} {days === 1 ? 'day' : 'days'} ({selTenant.moveInDate} to {selTenant.moveOutDate})</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between">
                        <span>Base Rent:</span>
                        <span className="font-semibold text-foreground">${rentVal.toFixed(2)}</span>
                      </div>
                      <div className="h-px bg-foreground/10 my-1" />
                      <div className="flex justify-between font-bold text-sm text-foreground">
                        <span>Estimated Total:</span>
                        <span className="text-primary">${rentVal.toFixed(2)}</span>
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-start justify-center z-50 p-4 md:p-6 no-print-backdrop overflow-y-auto">
          <div className="bg-card rounded-3xl border border-foreground/15 max-w-5xl w-full p-4 sm:p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150 relative overflow-hidden printable-invoice border-t-8 border-t-primary my-auto">
            {/* Close Button - hidden in print */}
            <button 
              onClick={() => setSelectedInvoice(null)} 
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 hover:bg-muted rounded-xl transition-colors no-print text-muted-foreground hover:text-foreground z-10 border border-foreground/5 hover:border-foreground/10"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Premium Invoice Branding Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-foreground/10 pr-10 md:pr-0">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary text-primary-foreground p-3 rounded-2xl shadow-brutal-sm border-2 border-foreground shrink-0">
                    <Building2 className="w-7 h-7 text-foreground" />
                  </div>
                  <div>
                    <div className="text-2xl font-black tracking-tight text-foreground flex items-center">
                      Rent<span className="text-primary font-black">Flow</span>
                      <span className="text-[10px] uppercase tracking-wider font-extrabold ml-2.5 px-2 py-0.5 bg-muted rounded-md text-muted-foreground border border-foreground/5">PMS</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-semibold">Professional Property Management Suite</p>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground/80 leading-relaxed pl-1">
                  <p className="font-bold text-foreground">{selectedInvoice.property?.name || "RentFlow Property Group Ltd."}</p>
                  <p>{selectedInvoice.property?.address || "Suite 500, 100 Innovation Way, Tech District"}</p>
                  <p>{selectedInvoice.property?.email || "billing@rentflow-pms.com"} · {selectedInvoice.property?.phone || "+1 (555) 123-4567"}</p>
                </div>
              </div>

              <div className="text-left md:text-right space-y-2 shrink-0 md:pt-2">
                <h2 className="text-3xl font-black uppercase tracking-widest text-foreground">Invoice</h2>
                <div className="space-y-2">
                  <p className="font-mono font-bold text-xs text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl inline-block">
                    {selectedInvoice.invoiceNumber || selectedInvoice.invoiceId}
                  </p>
                  <div className="flex md:justify-end">
                    <span className={`print-badge inline-flex items-center px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase border-2 shadow-sm ${
                      selectedInvoice.status === "paid" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : selectedInvoice.status === "overdue" 
                          ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse" 
                          : selectedInvoice.status === "cancelled"
                            ? "bg-slate-100 text-slate-700 border-slate-300"
                            : selectedInvoice.status === "duplicate"
                              ? "bg-slate-100 text-slate-700 border-slate-300"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {selectedInvoice.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Two-column layout for screen; stacking on mobile and print */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 print:block print:space-y-6">
              {/* Left Column: Tenant info & itemized table */}
              <div className="lg:col-span-7 space-y-6 print:space-y-6">
                
                {/* Dual Metadata Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Box 1: Billed To */}
                  <div className="bg-muted/20 rounded-2xl p-5 border border-foreground/10 space-y-4 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-primary" /> Billed To
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="font-black text-foreground text-xl leading-tight">{selectedInvoice.tenant}</p>
                        <p className="text-xs text-muted-foreground/80 font-medium mt-1">Tenant ID: {selectedInvoice.tenantId ? selectedInvoice.tenantId.substring(0,8).toUpperCase() : "T-MEM-82B"}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                          <Building2 className="w-3.5 h-3.5" /> Room {selectedInvoice.room}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold bg-card text-muted-foreground border border-foreground/5">
                          {selectedInvoice.roomType || "Standard Suite"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Box 2: Billing & Methods */}
                  <div className="bg-muted/20 rounded-2xl p-5 border border-foreground/10 space-y-4 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary" /> Billing Context
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Billing Cycle</p>
                        <p className="text-sm font-bold text-foreground mt-1">{selectedInvoice.month}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Due Date</p>
                        <p className={`text-sm font-black mt-1 ${
                          selectedInvoice.status === "paid" 
                            ? "text-emerald-600" 
                            : selectedInvoice.status === "overdue"
                              ? "text-red-600 font-extrabold"
                              : "text-amber-600"
                        }`}>{selectedInvoice.dueDate}</p>
                      </div>
                      {selectedInvoice.billingPeriodStart && selectedInvoice.billingPeriodEnd && (
                        <div className="col-span-2 pt-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Lease Period</p>
                          <p className="text-xs font-bold text-foreground mt-1">
                            {selectedInvoice.billingPeriodStart.substring(0, 10)} – {selectedInvoice.billingPeriodEnd.substring(0, 10)}
                          </p>
                        </div>
                      )}
                      <div className="col-span-2 pt-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Invoice Type & Ref</p>
                        <p className="text-xs font-mono text-muted-foreground bg-card px-3 py-1.5 rounded-xl border border-foreground/5 inline-block mt-1">
                          {selectedInvoice.invoiceType === 'daily_rental' ? 'DAILY CHECKOUT' : selectedInvoice.invoiceType === 'monthly_rent' ? 'MONTHLY RENT' : (selectedInvoice.invoiceType || 'RENTAL').toUpperCase()} · {selectedInvoice.paymentMethod?.replace('_', ' ')?.toUpperCase() || 'QR'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Itemized Table of Charges */}
                <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-card shadow-md">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/80 border-b border-foreground/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <th className="p-3 sm:p-4 pl-4 sm:pl-6">Description</th>
                        <th className="p-3 sm:p-4 text-center">Billing Duration</th>
                        <th className="p-3 sm:p-4 pr-4 sm:pr-6 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-foreground/5 text-sm">
                      {/* Rent Lease Row */}
                      {(() => {
                        const isDaily = selectedInvoice.billingCycle === 'daily';
                        const days = isDaily ? getStayDays(selectedInvoice) : 1;
                        const dailyRate = isDaily ? (selectedInvoice.rent / days) : selectedInvoice.rent;
                        
                        return (
                          <tr className="hover:bg-muted/10 transition-colors">
                            <td className="p-3 sm:p-4 pl-4 sm:pl-6">
                              <div className="font-bold text-foreground flex items-center gap-2">
                                <Receipt className="w-4.5 h-4.5 text-primary shrink-0" /> {isDaily ? 'Daily Room Stay' : 'Monthly Base Room Lease'}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {isDaily 
                                  ? `Standard daily rate for Room ${selectedInvoice.room} ($${dailyRate.toFixed(2)}/day)`
                                  : `Standard lease fee for Room ${selectedInvoice.room}`
                                }
                              </div>
                            </td>
                            <td className="p-3 sm:p-4 text-center text-muted-foreground text-xs font-semibold">
                              {isDaily ? `${days} ${days === 1 ? 'Day' : 'Days'}` : '1 Month'}
                            </td>
                            <td className="p-3 sm:p-4 pr-4 sm:pr-6 text-right font-black text-foreground text-base">${selectedInvoice.rent.toFixed(2)}</td>
                          </tr>
                        );
                      })()}

                      {/* Electricity Row */}
                      {selectedInvoice.utilityAmount > 0 && (
                        <tr className="hover:bg-muted/10 transition-colors">
                          <td className="p-3 sm:p-4 pl-4 sm:pl-6">
                            <div className="font-bold text-foreground flex items-center gap-2">
                              <Zap className="w-4.5 h-4.5 text-amber-500 shrink-0" /> Electricity Usage
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {selectedInvoice.elecPrev} → {selectedInvoice.elecCurr} kWh ({selectedInvoice.elecUsage} kWh × $0.20)
                            </div>
                          </td>
                          <td className="p-3 sm:p-4 text-center text-muted-foreground text-xs font-semibold">{selectedInvoice.elecUsage} kWh</td>
                          <td className="p-3 sm:p-4 pr-4 sm:pr-6 text-right font-bold text-foreground">${(selectedInvoice.utilityAmount * 0.7).toFixed(2)}</td>
                        </tr>
                      )}

                      {/* Water Row */}
                      {selectedInvoice.utilityAmount > 0 && (
                        <tr className="hover:bg-muted/10 transition-colors">
                          <td className="p-3 sm:p-4 pl-4 sm:pl-6">
                            <div className="font-bold text-foreground flex items-center gap-2">
                              <DollarSign className="w-4.5 h-4.5 text-blue-500 shrink-0" /> Water Usage
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {selectedInvoice.waterPrev} → {selectedInvoice.waterCurr} m³ ({selectedInvoice.waterUsage} m³ × $0.50)
                            </div>
                          </td>
                          <td className="p-3 sm:p-4 text-center text-muted-foreground text-xs font-semibold">{selectedInvoice.waterUsage} m³</td>
                          <td className="p-3 sm:p-4 pr-4 sm:pr-6 text-right font-bold text-foreground">${(selectedInvoice.utilityAmount * 0.3).toFixed(2)}</td>
                        </tr>
                      )}

                      {/* Late penalty row */}
                      {selectedInvoice.lateFee > 0 && (
                        <tr className="bg-rose-500/5 hover:bg-rose-500/10 transition-colors border-l-4 border-l-rose-500">
                          <td className="p-3 sm:p-4 pl-4 sm:pl-6">
                            <div className="font-bold text-rose-600 flex items-center gap-1.5">
                              <AlertTriangle className="w-4.5 h-4.5 text-rose-500 shrink-0" /> Late Settlement Penalty
                            </div>
                            <div className="text-xs text-rose-500/80 mt-1">Applied for late invoice settlement</div>
                          </td>
                          <td className="p-3 sm:p-4 text-center text-rose-500/80 text-xs font-bold">Late Charge</td>
                          <td className="p-3 sm:p-4 pr-4 sm:pr-6 text-right font-black text-rose-600 text-base">${selectedInvoice.lateFee.toFixed(2)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Totals Summary & Status Cards */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6 print:space-y-6">
                <div className="space-y-6">
                  {selectedInvoice.status === "paid" ? (
                    /* Official Payment Receipt Card */
                    <div className="flex items-start gap-4 p-5 bg-emerald-500/5 rounded-2xl border-2 border-emerald-500/20 w-full relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border-2 border-emerald-500/20 shrink-0 text-emerald-600">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Official Payment Receipt</div>
                        <p className="text-xs text-emerald-800 font-bold leading-relaxed">
                          This invoice is fully settled. Paid in full on {selectedInvoice.paidDate || new Date().toISOString().split("T")[0]}.
                        </p>
                        <div className="pt-2">
                          <p className="text-[9px] font-mono text-emerald-800 bg-emerald-500/15 px-2.5 py-1 rounded border border-emerald-500/10 inline-block font-bold">
                            Auth ID: {selectedInvoice.transactionId}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Awaiting QR Settlement Portal */
                    <div className="flex items-start gap-4 p-5 bg-amber-500/5 rounded-2xl border-2 border-amber-500/20 w-full relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
                      <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border-2 border-amber-500/20 shrink-0 text-amber-600">
                        <QrCode className="w-6 h-6 animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-widest text-amber-600">Secure Settlement Portal</div>
                        <p className="text-xs text-amber-800 font-bold leading-relaxed">
                          Tenant secure billing is ready. Scan the QR code from the payment page or click the copy link below to send directly to the tenant.
                        </p>
                        <div className="pt-2">
                          <p className="text-[9px] font-black text-amber-800 bg-amber-500/15 px-2.5 py-1 rounded border border-amber-500/10 inline-flex items-center gap-1 font-bold">
                            <CreditCard className="w-3 h-3" /> Direct QR Settlement Enabled
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Totals Receipt Card */}
                  <div className="bg-muted/30 rounded-2xl p-5 border border-foreground/10 space-y-4 shadow-sm">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Invoice Summary</h4>
                    <div className="space-y-3 text-xs text-muted-foreground flex flex-col">
                      <div className="flex justify-between font-semibold">
                        <span>
                          {selectedInvoice.billingCycle === 'daily' 
                            ? `Daily Room Stay (${getStayDays(selectedInvoice)} ${getStayDays(selectedInvoice) === 1 ? 'day' : 'days'}):` 
                            : 'Monthly Base Lease:'}
                        </span>
                        <span className="text-foreground">${selectedInvoice.rent.toFixed(2)}</span>
                      </div>
                      {selectedInvoice.utilityAmount > 0 && (
                        <>
                          <div className="flex justify-between font-semibold">
                            <span>Electricity:</span>
                            <span className="text-foreground">${(selectedInvoice.utilityAmount * 0.7).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span>Water:</span>
                            <span className="text-foreground">${(selectedInvoice.utilityAmount * 0.3).toFixed(2)}</span>
                          </div>
                        </>
                      )}
                      
                      {selectedInvoice.lateFee > 0 && (
                        <div className="flex justify-between font-semibold text-rose-500">
                          <span>Late Settlement Fee:</span>
                          <span>+${selectedInvoice.lateFee.toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="border-t border-dashed border-foreground/15 my-1" />
                      
                      <div className="flex justify-between items-baseline p-4 bg-primary/10 rounded-xl border border-primary/20">
                        <span className="font-black text-xs text-foreground uppercase tracking-widest">Grand Total:</span>
                        <span className="text-3xl font-black text-primary font-mono select-all">${selectedInvoice.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Controls Row & Watermark */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-foreground/10 mt-8 no-print w-full">
              <div className="text-xs text-muted-foreground flex items-center gap-2 font-semibold bg-muted/40 px-3.5 py-2 rounded-2xl border border-foreground/5 shadow-sm">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                <span>RentFlow Certified Billing Ledger</span>
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  icon={copiedInvoiceId === selectedInvoice.id ? CheckCircle : Link2} 
                  onClick={() => handleCopyPaymentLink(selectedInvoice.id)}
                  className={copiedInvoiceId === selectedInvoice.id ? "text-emerald-600 border-emerald-500 bg-emerald-50 font-bold" : "font-semibold"}
                >
                  {copiedInvoiceId === selectedInvoice.id ? "Link Copied!" : "Copy Payment Link"}
                </Button>
                <Button 
                  variant="outline" 
                  icon={Eye} 
                  onClick={() => window.open(`${window.location.protocol}//${window.location.host}/pay/${selectedInvoice.id}`, '_blank')}
                  className="font-semibold"
                >
                  Open Portal
                </Button>
                <Button 
                  variant="outline" 
                  icon={Printer} 
                  onClick={() => window.print()} 
                  className="font-semibold"
                >
                  Print
                </Button>
                {selectedInvoice.status !== "paid" && (
                  <>
                    <Button 
                      variant="outline" 
                      icon={AlertTriangle} 
                      disabled={updatingId === selectedInvoice.id} 
                      onClick={async () => {
                        if (confirm("Are you sure you want to void and remove this invoice?")) {
                          setUpdatingId(selectedInvoice.id);
                          try {
                            await api.deletePayment(selectedInvoice.id);
                            setSelectedInvoice(null);
                            fetchPayments();
                          } catch (err: any) {
                            alert(err.message || "Failed to void invoice");
                          } finally {
                            setUpdatingId(null);
                          }
                        }
                      }}
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 font-bold"
                    >
                      Void Invoice
                    </Button>
                    <Button 
                      variant="primary" 
                      icon={CheckCircle} 
                      disabled={updatingId === selectedInvoice.id} 
                      onClick={() => handleMarkAsPaidAdmin(selectedInvoice.id)}
                      className="font-bold shadow-brutal-sm border-2 border-foreground hover:translate-y-0 active:translate-y-0"
                    >
                      {updatingId === selectedInvoice.id ? "Settling..." : "Mark Paid"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
