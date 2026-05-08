import { Plus, CheckCircle, Clock, AlertTriangle, Printer, FileText, X } from "lucide-react";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { useState, useEffect } from "react";
import { api } from "../lib/api";

export function Payments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [newPayment, setNewPayment] = useState({
    tenantId: "", amount: "", month: "", paymentMethod: "cash", status: "pending"
  });
  const [tenants, setTenants] = useState<any[]>([]);

  const fetchPayments = async () => {
    try {
      const res = await api.getPayments({ limit: "50" });
      setPayments(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchTenants = async () => {
    try {
      const res = await api.getTenants({ limit: "50" });
      setTenants(res.data || []);
    } catch { }
  };

  useEffect(() => { fetchPayments(); fetchTenants(); }, []);

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
        paidDate: newPayment.status === "paid" ? new Date().toISOString().split("T")[0] : null,
      });
      setShowRecordModal(false);
      setNewPayment({ tenantId: "", amount: "", month: "", paymentMethod: "cash", status: "pending" });
      fetchPayments();
    } catch (err: any) { setError(err.message || "Failed to record payment"); }
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    setUpdatingId(paymentId);
    try {
      await api.updatePayment(paymentId, {
        status: "paid",
        paidDate: new Date().toISOString().split("T")[0],
      });
      fetchPayments();
    } catch (err: any) {
      alert(err.message || "Failed to update payment");
    } finally { setUpdatingId(null); }
  };

  const handleMarkAsPending = async (paymentId: string) => {
    setUpdatingId(paymentId);
    try {
      await api.updatePayment(paymentId, {
        status: "pending",
        paidDate: null,
      });
      fetchPayments();
    } catch (err: any) {
      alert(err.message || "Failed to update payment");
    } finally { setUpdatingId(null); }
  };

  const handleViewReceipt = async (paymentId: string) => {
    setReceiptLoading(true);
    try {
      const res = await api.getPaymentReceipt(paymentId);
      setReceiptData(res.data);
      setShowReceiptModal(true);
    } catch (err: any) {
      alert(err.message || "Failed to load receipt");
    } finally { setReceiptLoading(false); }
  };

  const handlePrintReceipt = () => {
    const printContent = document.getElementById('receipt-content');
    if (!printContent) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>Receipt</title><style>
      body { font-family: Arial, sans-serif; max-width: 400px; margin: 40px auto; padding: 20px; }
      h2 { text-align: center; margin-bottom: 5px; } .subtitle { text-align: center; color: #666; font-size: 12px; margin-bottom: 20px; }
      .divider { border-top: 1px dashed #ccc; margin: 15px 0; }
      .row { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; }
      .row.total { font-weight: bold; font-size: 16px; border-top: 2px solid #333; padding-top: 10px; margin-top: 10px; }
      .receipt-no { text-align: center; font-size: 12px; color: #999; margin-top: 20px; }
    </style></head><body>${printContent.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  };

  const paidPayments = payments.filter((p: any) => p.status === "paid");
  const pendingPayments = payments.filter((p: any) => p.status !== "paid");
  const totalPaid = paidPayments.reduce((sum: number, p: any) => sum + parseFloat(p.total || p.amount || 0), 0);
  const totalPending = pendingPayments.reduce((sum: number, p: any) => sum + parseFloat(p.total || p.amount || 0), 0);
  const overduePayments = payments.filter((p: any) => p.status === "overdue");

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Payment Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage all payments</p>
        </div>
        <Button icon={Plus} variant="primary" onClick={() => setShowRecordModal(true)}>Record Payment</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">Total Payments</p>
          <p className="text-2xl font-semibold text-foreground">{payments.length}</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">Collected</p>
          <p className="text-2xl font-semibold text-green-600">${totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">Pending</p>
          <p className="text-2xl font-semibold text-orange-600">${totalPending.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">Overdue</p>
          <p className="text-2xl font-semibold text-red-600">{overduePayments.length}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tenant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Rent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Utility</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Late Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((payment: any) => (
                <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {payment.tenant}
                    {payment.autoGenerated && (
                      <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-600 rounded">
                        <FileText className="w-3 h-3" />AUTO
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">Room {payment.room}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{payment.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">${payment.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {parseFloat(payment.utilityAmount || 0) > 0 ? `$${payment.utilityAmount}` : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {parseFloat(payment.lateFee || 0) > 0 ? <span className="text-red-600 font-medium">${payment.lateFee}</span> : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-foreground">${payment.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={payment.status === "paid" ? "success" : payment.status === "overdue" ? "danger" : "warning"}>
                      {payment.status === "paid" ? "Paid" : payment.status === "overdue" ? "Overdue" : "Pending"}
                    </Badge>
                    {payment.paidDate && (
                      <span className="block text-xs text-muted-foreground mt-1">{payment.paidDate}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {updatingId === payment.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      ) : payment.status === "paid" ? (
                        <>
                          <button onClick={() => handleViewReceipt(payment.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                            <Printer className="w-3.5 h-3.5" />Receipt
                          </button>
                          <button onClick={() => handleMarkAsPending(payment.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
                            <Clock className="w-3.5 h-3.5" />Undo
                          </button>
                        </>
                      ) : (
                        <button onClick={() => handleMarkAsPaid(payment.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" />Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showRecordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-foreground mb-4">Record Payment</h3>
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Tenant *</label>
                <select value={newPayment.tenantId} onChange={(e) => setNewPayment({ ...newPayment, tenantId: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Select tenant...</option>
                  {tenants.map((t: any) => <option key={t.id} value={t.id}>{t.name} (Room {t.room})</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Amount ($) *</label>
                <input type="number" placeholder="350" value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Month *</label>
                <input type="text" placeholder="e.g., April 2026" value={newPayment.month}
                  onChange={(e) => setNewPayment({ ...newPayment, month: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Payment Method</label>
                <select value={newPayment.paymentMethod} onChange={(e) => setNewPayment({ ...newPayment, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Payment Status</label>
                <select value={newPayment.status} onChange={(e) => setNewPayment({ ...newPayment, status: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="pending">Pending (Unpaid)</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRecordModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleRecordPayment}>Record</Button>
            </div>
          </div>
        </div>
      )}
      {/* Receipt Modal */}
      {showReceiptModal && receiptData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-foreground">Payment Receipt</h3>
              <button onClick={() => setShowReceiptModal(false)} className="p-1 hover:bg-muted rounded-lg">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div id="receipt-content">
              <h2>{receiptData.property?.name || 'Property'}</h2>
              <div className="subtitle">{receiptData.property?.address}</div>
              <div className="subtitle">{receiptData.property?.phone} · {receiptData.property?.email}</div>
              <div className="divider"></div>
              <div className="row"><span>Receipt No:</span><span><strong>{receiptData.receiptNumber}</strong></span></div>
              <div className="row"><span>Date:</span><span>{receiptData.date}</span></div>
              <div className="row"><span>Month:</span><span>{receiptData.month}</span></div>
              <div className="divider"></div>
              <div className="row"><span>Tenant:</span><span>{receiptData.tenant?.name}</span></div>
              <div className="row"><span>Room:</span><span>{receiptData.room} ({receiptData.roomType})</span></div>
              <div className="row"><span>Payment Method:</span><span style={{textTransform: 'capitalize'}}>{(receiptData.paymentMethod || '').replace('_', ' ')}</span></div>
              <div className="divider"></div>
              <div className="row"><span>Rent:</span><span>${receiptData.breakdown?.rent?.toFixed(2)}</span></div>
              {receiptData.breakdown?.utility > 0 && (
                <div className="row"><span>Utility Charges:</span><span>${receiptData.breakdown.utility.toFixed(2)}</span></div>
              )}
              {receiptData.breakdown?.lateFee > 0 && (
                <div className="row"><span>Late Fee:</span><span>${receiptData.breakdown.lateFee.toFixed(2)}</span></div>
              )}
              <div className="row total"><span>Total Paid:</span><span>${receiptData.breakdown?.total?.toFixed(2)}</span></div>
              <div className="receipt-no">Thank you for your payment</div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReceiptModal(false)}>Close</Button>
              <Button variant="primary" icon={Printer} onClick={handlePrintReceipt}>Print Receipt</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
