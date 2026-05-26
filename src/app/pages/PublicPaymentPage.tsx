import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { 
  ArrowLeft, Check, Clock, AlertTriangle, Building2, Copy, Receipt, Zap, Shield, 
  CheckCircle2, Download, Printer, CheckCircle, Eye, Droplet
} from "lucide-react";
import { api } from "../lib/api";

export function PublicPaymentPage() {
  const { paymentId } = useParams();
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutCompleted, setCheckoutCompleted] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  useEffect(() => {
    let active = true;
    let pollInterval: any = null;

    const fetchInvoice = async (isInitial = false) => {
      try {
        if (isInitial) setLoading(true);
        const res = await api.get(`/tenant-portal/payments/${paymentId}`);
        if (!active) return;

        setPayment(res.data);
        if (res.data.status === "paid") {
          setCheckoutCompleted(true);
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
        } else if (isInitial) {
          // Auto-settle the payment if URL contains ?scan=true
          const queryParams = new URLSearchParams(window.location.search);
          if (queryParams.get("scan") === "true") {
            try {
              setIsSettling(true);
              const payRes = await api.post(`/tenant-portal/payments/${paymentId}/pay`, { paymentMethod: "qr_code" });
              if (active) {
                setPayment((prev: any) => ({ 
                  ...prev, 
                  status: "paid", 
                  paidDate: payRes.data?.paid_date || payRes.data?.paidDate || new Date().toISOString().split('T')[0] 
                }));
                setCheckoutCompleted(true);
              }
            } catch (err: any) {
              console.error("Auto-settle via QR failed:", err);
            } finally {
              if (active) setIsSettling(false);
            }
          } else {
            // Start polling if not paid and not scanning
            pollInterval = setInterval(() => {
              fetchInvoice(false);
            }, 3000);
          }
        }
      } catch (err: any) {
        if (active && isInitial) {
          setError(err.message || "Unable to load invoice");
        }
      } finally {
        if (active && isInitial) {
          setLoading(false);
        }
      }
    };

    if (paymentId) {
      fetchInvoice(true);
    }
    return () => {
      active = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [paymentId]);

  const handleSettlePayment = async () => {
    try {
      setIsSettling(true);
      const res = await api.post(`/tenant-portal/payments/${paymentId}/pay`, { paymentMethod: "qr_code" });
      setPayment((prev: any) => ({ 
        ...prev, 
        status: "paid", 
        paidDate: res.data?.paid_date || res.data?.paidDate || new Date().toISOString().split('T')[0] 
      }));
      setCheckoutCompleted(true);
    } catch (err: any) {
      alert(err.message || "Failed to settle payment");
    } finally {
      setIsSettling(false);
    }
  };

  const handleCopyReference = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50 text-slate-800">
        <div className="w-16 h-16 rounded-2xl bg-amber-400 animate-pulse flex items-center justify-center shadow-lg shadow-amber-400/20">
          <Receipt className="w-8 h-8 text-slate-900 animate-bounce" />
        </div>
        <p className="mt-5 text-sm font-semibold text-slate-550 tracking-wider uppercase">Retrieving Secure Invoice...</p>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50 text-slate-800 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
          <AlertTriangle className="w-10 h-10 text-red-500 animate-bounce" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Invoice Expired or Not Found</h2>
        <p className="mt-2.5 text-sm text-slate-500 max-w-sm">
          This invoice link might have been deleted, or the direct ID is invalid. Please check with your landlord.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-full bg-slate-900 text-white hover:bg-slate-850 px-8 py-3.5 text-sm font-bold transition-all shadow-md"
        >
          Go Back
        </Link>
      </div>
    );
  }

  const utilityAmount = payment.utilityAmount || 0;
  const elecUsage = Math.round((utilityAmount * 0.7) / 0.20);
  const waterUsage = Math.round((utilityAmount * 0.3) / 0.50);
  const refCode = `RF-${payment.roomNumber}-${payment.month.substring(0,3).toUpperCase()}-${Math.round(payment.total)}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
      {/* Background soft color spots */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md md:max-w-4xl bg-white border border-slate-200/80 rounded-[2rem] md:rounded-[2.5rem] shadow-xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <header className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white text-slate-800 p-2.5 rounded-2xl border border-slate-200/80 shadow-sm">
              <Building2 className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm md:text-base font-black leading-none tracking-tight text-slate-900">RentFlow Direct</p>
              <p className="text-[10px] md:text-xs text-slate-500 mt-1 font-semibold">Secure Tenant Invoice Checkout</p>
            </div>
          </div>
          <span className={`text-[10px] font-extrabold uppercase rounded-full px-3 py-1.5 tracking-wider border ${
            checkoutCompleted 
              ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
              : "bg-amber-50 text-amber-600 border-amber-200 animate-pulse"
          }`}>
            {payment.status.toUpperCase()}
          </span>
        </header>

        {/* Content */}
        <div className="p-6 md:p-8">
          {!checkoutCompleted ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
              {/* Left Column: Billing summary & invoice meta */}
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-amber-500" /> Invoice Details
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Please review your lease details below</p>
                </div>

                {/* Summary Card */}
                <div className="rounded-3xl bg-white border border-slate-200/80 p-5 space-y-4 shadow-sm">
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Billed To</p>
                      <p className="text-base font-bold mt-1 text-slate-900 truncate">{payment.tenantName}</p>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-slate-400" /> Room {payment.roomNumber} · {payment.roomType}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Billing Period</p>
                      <p className="text-xs font-extrabold mt-1 text-slate-800 bg-slate-100 py-0.5 px-2 rounded-md inline-block">{payment.month}</p>
                      <p className="text-[10px] text-red-500 font-bold mt-1.5 flex items-center gap-1 justify-end"><Clock className="w-3 h-3" /> Due {payment.dueDate}</p>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 my-2" />

                  {/* Line Items */}
                  <div className="space-y-3">
                    {/* Base Rent Row */}
                    <div className="flex items-center justify-between text-xs font-semibold p-2.5 rounded-2xl bg-slate-50/60 border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-7.5 h-7.5 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-sm shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-slate-800 font-bold block">Monthly Base Lease</span>
                          <span className="text-[10px] text-slate-400">Full room occupancy rental</span>
                        </div>
                      </div>
                      <span className="font-black text-slate-900">${payment.amount.toFixed(2)}</span>
                    </div>
                    
                    {utilityAmount > 0 && (
                      <>
                        {/* Electricity Row */}
                        <div className="flex items-center justify-between text-xs font-semibold p-2.5 rounded-2xl bg-slate-50/60 border border-slate-100 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-7.5 h-7.5 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-sm shrink-0">
                              <Zap className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-slate-800 font-bold block truncate">Electricity Utility</span>
                              <span className="text-[10px] text-slate-400 block truncate">{elecUsage} kWh @ $0.20/kWh</span>
                            </div>
                          </div>
                          <span className="font-black text-slate-900 shrink-0">${(elecUsage * 0.20).toFixed(2)}</span>
                        </div>

                        {/* Water Row */}
                        <div className="flex items-center justify-between text-xs font-semibold p-2.5 rounded-2xl bg-slate-50/60 border border-slate-100 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-7.5 h-7.5 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm shrink-0">
                              <Droplet className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-slate-800 font-bold block truncate">Water Utility</span>
                              <span className="text-[10px] text-slate-400 block truncate">{waterUsage} m³ @ $0.50/m³</span>
                            </div>
                          </div>
                          <span className="font-black text-slate-900 shrink-0">${(waterUsage * 0.50).toFixed(2)}</span>
                        </div>
                      </>
                    )}

                    {payment.lateFee > 0 && (
                      <div className="flex items-center justify-between text-xs font-bold p-2.5 rounded-2xl bg-red-50 border border-red-100 text-red-700">
                        <div className="flex items-center gap-3">
                          <div className="w-7.5 h-7.5 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shadow-sm shrink-0">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold block">Late Payment Penalty</span>
                            <span className="text-[10px] text-red-400">Overdue settlement surcharge</span>
                          </div>
                        </div>
                        <span className="font-black">${payment.lateFee.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-slate-100 my-2 border-dashed" />

                  {/* Total */}
                  <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Total Amount Due</span>
                    <span className="text-2xl md:text-3xl font-black tracking-tight text-amber-600 font-mono">${payment.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Reference ID Copy Card */}
                <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Transaction Reference</p>
                    <p className="text-sm font-mono font-bold mt-0.5 text-slate-900">{refCode}</p>
                  </div>
                  <button
                    onClick={() => handleCopyReference(refCode)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      copiedRef 
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200" 
                        : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-sm active:scale-95 cursor-pointer"
                    }`}
                    title="Copy Reference"
                  >
                    {copiedRef ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Right Column: QR Pay and Actions */}
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-amber-550" /> QR Payment Checkout
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Scan the CAMBODIA KHQR standard code below</p>
                </div>

                {/* ABA KHQR Frame */}
                <div className="bg-[#0b2d49] text-white rounded-[2rem] p-5 shadow-lg border border-white/5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#1c3e5c]">
                    <span className="text-sm font-black tracking-widest text-[#E6B012]">KHQR</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] text-gray-400 font-extrabold tracking-wider">CAMBODIA</span>
                      <div className="w-5 h-3.5 rounded-sm overflow-hidden flex flex-col shrink-0">
                        <div className="h-1 bg-blue-700" />
                        <div className="h-1 bg-red-600 flex items-center justify-center">
                          <span className="w-1 h-1 rounded-full bg-white" />
                        </div>
                        <div className="h-1 bg-blue-700" />
                      </div>
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">RentFlow Direct Transfer</p>
                    <p className="text-3xl font-black text-white font-mono">${payment.total.toFixed(2)}</p>
                    <p className="text-[9px] font-mono text-gray-400">Ref: {refCode}</p>
                  </div>

                  {/* QR Target SVG */}
                  <div className="bg-white rounded-[1.75rem] p-4 flex items-center justify-center relative shadow-inner">
                    <div className="w-36 h-36 md:w-40 md:h-40 relative">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${window.location.protocol}//${window.location.host}/pay/${paymentId}?scan=true`)}`}
                        alt="KHQR Settle Code" 
                        className="w-full h-full object-contain rounded-2xl"
                      />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-lg shadow border border-gray-100 flex items-center justify-center">
                        <div className="w-6.5 h-6.5 bg-[#0b2d49] rounded-md flex items-center justify-center text-[8px] font-black text-white">
                          ABA
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-center text-[9px] text-gray-400 tracking-wider font-extrabold uppercase leading-snug">
                    Open your Mobile Banking App<br />to scan & settle instantly
                  </p>
                </div>

                {/* Settle confirmation button */}
                <button
                  onClick={handleSettlePayment}
                  disabled={isSettling}
                  className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-full py-3.5 md:py-4 text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-400/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {isSettling ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      Recording Settle...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> I've Completed Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Success / Receipt Screen - 2 Columns on Desktop */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
              {/* Left Column: Success card and Direct actions */}
              <div className="md:col-span-5 space-y-5">
                {/* Success Banner */}
                <div className="rounded-3xl bg-emerald-50 border border-emerald-250 p-6 relative overflow-hidden text-center shadow-sm">
                  <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl animate-pulse" />
                  <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-emerald-500/5 blur-2xl" />

                  <div className="relative mx-auto w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-3.5 shadow-sm">
                    <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                  </div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Payment Successful</p>
                  <p className="mt-1 text-2xl md:text-3xl font-black text-slate-900 font-mono">${payment.total.toFixed(2)}</p>
                  <p className="mt-2 text-[10px] text-emerald-700 font-bold tracking-wide bg-emerald-500/10 py-1 px-3.5 rounded-full inline-block border border-emerald-500/20">
                    Settle logged: {payment.paidDate || new Date().toISOString().split('T')[0]}
                  </p>
                </div>

                {/* Settle Action Button */}
                <div className="space-y-3">
                  <button
                    onClick={() => window.print()}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-full py-3.5 text-xs font-extrabold flex items-center justify-center gap-2 shadow transition-all cursor-pointer active:scale-98"
                  >
                    <Printer className="w-4 h-4 text-amber-400" /> Print Settle Receipt
                  </button>
                  
                  {/* Security disclaimer */}
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 flex items-start gap-3">
                    <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                      This is a secure automated receipt processed by RentFlow PMS. This transaction has been locked into the general ledger.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Receipt detailed ledger breakdown */}
              <div className="md:col-span-7">
                {/* Printable Invoice Receipt Card */}
                <div className="rounded-3xl bg-white border border-slate-200/80 p-6 space-y-4 printable-invoice shadow-sm">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Official Receipt</p>
                      <p className="text-sm font-mono font-bold mt-1 text-slate-900">#{payment.receiptNumber || `RCPT-${payment.id.substring(0,8).toUpperCase()}`}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-600 rounded-full px-3 py-1 border border-emerald-200 shadow-sm">
                      PAID
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Tenant Name</p>
                      <p className="font-bold mt-1 text-slate-900">{payment.tenantName}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Property Unit</p>
                      <p className="font-bold mt-1 text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" /> Room {payment.roomNumber}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs border-b border-slate-100 pb-3.5">
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Monthly Base Lease</span>
                      <span className="font-bold text-slate-900">${payment.amount.toFixed(2)}</span>
                    </div>
                    {utilityAmount > 0 && (
                      <div className="flex justify-between text-slate-500 font-medium">
                        <span>Utility surcharge (Water & Elec)</span>
                        <span className="font-bold text-slate-900">${utilityAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {payment.lateFee > 0 && (
                      <div className="flex justify-between text-slate-500 font-medium">
                        <span>Late Payment Penalty</span>
                        <span className="font-bold text-red-500">${payment.lateFee.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Total Paid</span>
                    <span className="text-xl font-bold font-mono text-slate-900">${payment.total.toFixed(2)}</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Transaction Reference</p>
                      <p className="text-xs font-mono font-bold mt-0.5 text-slate-900">{refCode}</p>
                    </div>
                    <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-200">
                      <Check className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QrSvg() {
  const cells = Array.from({ length: 21 * 21 }, (_, i) => {
    const x = i % 21;
    const y = Math.floor(i / 21);
    const corner = (cx: number, cy: number) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7;
    if (corner(0, 0) || corner(14, 0) || corner(0, 14)) {
      const local = corner(0, 0) ? [x, y] : corner(14, 0) ? [x - 14, y] : [x, y - 14];
      const [lx, ly] = local;
      const edge = lx === 0 || lx === 6 || ly === 0 || ly === 6;
      const inner = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
      return edge || inner;
    }
    return (x * 7 + y * 13 + ((x * y) % 5)) % 3 === 0;
  });
  return (
    <svg viewBox="0 0 21 21" className="w-full h-full">
      <rect width="21" height="21" fill="#fff" />
      {cells.map((on, i) =>
        on ? <rect key={i} x={i % 21} y={Math.floor(i / 21)} width="1" height="1" fill="#111" /> : null,
      )}
    </svg>
  );
}
