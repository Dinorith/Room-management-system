import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router";
import { 
  FileText, Check, AlertTriangle, ShieldCheck, PenTool, 
  Download, Printer, Info, CheckCircle2, Lock, FileSignature, ChevronRight
} from "lucide-react";
import { api } from "../lib/api";

export function PublicContractSignPage() {
  const { contractId } = useParams();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signatureCompleted, setSignatureCompleted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signMethod, setSignMethod] = useState<"type" | "draw">("type");
  const [typedName, setTypedName] = useState("");
  const [copiedRef, setCopiedRef] = useState(false);
  
  // Simulated drawing canvas coordinates
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    let active = true;
    const fetchContract = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/tenant-portal/contracts/${contractId}`);
        if (active) {
          setContract(res.data);
          setTypedName(res.data.tenantName);
          if (res.data.status === "active") {
            setSignatureCompleted(true);
          }
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || "Unable to load lease agreement");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (contractId) {
      fetchContract();
    }
    return () => {
      active = false;
    };
  }, [contractId]);

  // Setup drawing canvas once mode changes to "draw"
  useEffect(() => {
    if (signMethod === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#0b2d49";
        ctx.lineWidth = 3.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        // Clear canvas
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [signMethod, loading]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    isDrawingRef.current = true;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (e.cancelable) {
      e.preventDefault();
    }
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ("touches" in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineTo(x, y);
    ctx.stroke();

    if (e.cancelable) {
      e.preventDefault();
    }
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleSignAgreement = async () => {
    if (!termsAccepted) {
      alert("Please accept the terms and conditions to proceed.");
      return;
    }
    if (signMethod === "type" && !typedName.trim()) {
      alert("Please type your name to sign the agreement.");
      return;
    }

    try {
      setIsSigning(true);
      
      let signatureValue = "";
      if (signMethod === "draw" && canvasRef.current) {
        signatureValue = canvasRef.current.toDataURL("image/png");
      } else {
        signatureValue = `typed:${typedName}`;
      }

      const res = await api.post(`/tenant-portal/contracts/${contractId}/sign`, {
        signedByName: typedName,
        signatureType: signMethod,
        signature: signatureValue,
      });
      
      setContract(res.data);
      setSignatureCompleted(true);
    } catch (err: any) {
      alert(err.message || "Failed to sign agreement");
    } finally {
      setIsSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50 text-slate-800">
        <div className="w-16 h-16 rounded-2xl bg-amber-500 animate-pulse flex items-center justify-center shadow-lg shadow-amber-500/20">
          <FileText className="w-8 h-8 text-white animate-bounce" />
        </div>
        <p className="mt-5 text-sm font-semibold text-slate-500 tracking-wider uppercase">Loading Secure Agreement...</p>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50 text-slate-800 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
          <AlertTriangle className="w-10 h-10 text-red-500 animate-bounce" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Lease Agreement Expired or Not Found</h2>
        <p className="mt-2.5 text-sm text-slate-500 max-w-sm">
          This lease agreement link is either invalid or expired. Please contact your property manager.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-full bg-slate-900 text-white hover:bg-slate-800 px-8 py-3.5 text-sm font-bold transition-all shadow-md"
        >
          Go Back
        </Link>
      </div>
    );
  }

  const auditHash = `RF-SIGN-${contract.id.substring(0, 8).toUpperCase()}`;
  const parts = contract && contract.terms ? contract.terms.split("\n\n[SIGNATURE]:") : [contract?.terms, null];
  const termsText = parts[0];
  const signatureData = parts[1];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
      {/* Dynamic background lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md md:max-w-4xl bg-white border border-slate-200/80 rounded-[2rem] md:rounded-[2.5rem] shadow-xl overflow-hidden z-10">
        
        {/* Header */}
        <header className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white text-slate-800 p-2.5 rounded-2xl border border-slate-200/80 shadow-sm">
              <FileSignature className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm md:text-base font-black leading-none tracking-tight text-slate-900">RentFlow Digital Signatures</p>
              <p className="text-[10px] md:text-xs text-slate-500 mt-1 font-semibold">Legally Binding Smart Contract review</p>
            </div>
          </div>
          <span className={`text-[10px] font-extrabold uppercase rounded-full px-3 py-1.5 tracking-wider border ${
            signatureCompleted 
              ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
              : "bg-amber-50 text-amber-600 border-amber-200 animate-pulse"
          }`}>
            {contract.status === "active" ? "ACTIVE & SIGNED" : "SIGNATURE REQUIRED"}
          </span>
        </header>

        {/* Main Content Area */}
        <div className="p-6 md:p-8">
          {!signatureCompleted ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
              
              {/* Left Column - Lease Summary Card & Info (5 Cols) */}
              <div className="md:col-span-5 space-y-5">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-500" /> Lease Overview
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Please verify these parameters are correct</p>
                </div>

                <div className="rounded-3xl bg-white border border-slate-200/80 p-5 space-y-4 shadow-sm">
                  <div className="space-y-3">
                    <div>
                      <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Tenant / Lessee</p>
                      <p className="text-base font-bold mt-0.5 text-slate-900">{contract.tenantName}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Leasehold Unit</p>
                      <p className="text-sm font-bold mt-0.5 text-slate-800">Room {contract.roomNumber} ({contract.roomType})</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div>
                        <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Lease Commencement</p>
                        <p className="text-xs font-bold mt-0.5 text-slate-800">{contract.startDate}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Lease Termination</p>
                        <p className="text-xs font-bold mt-0.5 text-slate-800">{contract.endDate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 my-2" />

                  <div className="flex items-center justify-between p-4 bg-amber-50/50 border border-amber-200/60 rounded-2xl">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Monthly Rent Amount</span>
                    <span className="text-2xl font-black tracking-tight text-amber-600 font-mono">${contract.rentAmount}/mo</span>
                  </div>
                </div>

                {/* Audit lock disclaimer */}
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 flex items-start gap-3">
                  <Lock className="w-4 h-4 text-slate-550 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">RentFlow Audit Lock</p>
                    <p className="text-[10px] text-slate-550 mt-0.5 leading-relaxed font-semibold">
                      This lease agreement will be cryptographically signed and stored securely. Both parties agree that digital signature constitutes mutual contract execution.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Lease Terms, Sign area (7 Cols) */}
              <div className="md:col-span-7 space-y-5">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-amber-550" /> Terms & Digital Signature
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Read terms thoroughly and apply signature below</p>
                </div>

                {/* Scrollable Contract Terms */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4 h-48 overflow-y-auto space-y-3 shadow-inner text-xs text-slate-650 leading-relaxed font-medium">
                  <h4 className="font-extrabold text-slate-800 uppercase tracking-wide text-[10px]">SECTION 1: OCCUPANCY & RENT</h4>
                  <p>
                    The Tenant (Lessee) agrees to lease Room {contract.roomNumber} from the Landlord (Lessor) at Sunrise Apartments. 
                    The monthly rent is strictly ${contract.rentAmount} USD, payable on or before the 1st day of each calendar month. 
                    Late payments are subject to a grace period and late fee penalty as designated by the management guidelines.
                  </p>
                  <h4 className="font-extrabold text-slate-800 uppercase tracking-wide text-[10px]">SECTION 2: DURATION & TERMINATION</h4>
                  <p>
                    This agreement starts on {contract.startDate} and expires automatically on {contract.endDate}. 
                    If either party wishes to renew, written notice must be submitted at least 30 days prior to the expiration date. 
                    Early termination of this contract may result in partial or full forfeiture of the security deposit.
                  </p>
                  <h4 className="font-extrabold text-slate-800 uppercase tracking-wide text-[10px]">SECTION 3: UTILITIES & CARE</h4>
                  <p>
                    The Tenant is solely responsible for electricity usage (billed at $0.20 per kWh) and water usage (billed at $0.50 per m³), 
                    which are metered monthly and added to the tenant's invoice. The tenant agrees to keep the premises in a clean and sanitary condition.
                  </p>
                  <h4 className="font-extrabold text-slate-800 uppercase tracking-wide text-[10px]">SECTION 4: DIGITAL COVENANT</h4>
                  <p>
                    {termsText || "Standard lease agreement."}
                  </p>
                </div>

                {/* Signature Inputs */}
                <div className="border border-slate-200/80 rounded-3xl p-5 bg-white space-y-4 shadow-sm">
                  {/* Select Signature Method */}
                  <div className="flex border border-slate-100 rounded-xl p-1 bg-slate-50/50">
                    <button
                      type="button"
                      onClick={() => setSignMethod("type")}
                      className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                        signMethod === "type" 
                          ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" 
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Type Signature
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignMethod("draw")}
                      className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                        signMethod === "draw" 
                          ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" 
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Draw Signature
                    </button>
                  </div>

                  {signMethod === "type" ? (
                    <div className="space-y-3 animate-in fade-in duration-150">
                      <div>
                        <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Type Your Full Name</label>
                        <input
                          type="text"
                          value={typedName}
                          onChange={(e) => setTypedName(e.target.value)}
                          className="w-full mt-1.5 px-4 py-3 border border-slate-200 focus:border-amber-400 focus:ring focus:ring-amber-200/20 rounded-xl bg-slate-50/20 focus:bg-white transition-all text-sm font-bold"
                          placeholder="e.g. John Doe"
                        />
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[90px]">
                        <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mb-1">Generated Signature Preview</p>
                        {typedName ? (
                          <span className="text-3xl text-blue-900 italic font-medium font-serif leading-relaxed tracking-wider tracking-tighter" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                            {typedName}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-350 italic font-semibold">Your dynamic signature will render here</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5 animate-in fade-in duration-150">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Draw Signature in Box Below</label>
                        <button
                          type="button"
                          onClick={clearCanvas}
                          className="text-[10px] font-bold text-amber-600 hover:text-amber-700 bg-amber-50/50 border border-amber-100 hover:bg-amber-100 rounded-md px-2.5 py-1 tracking-wide uppercase transition-colors"
                        >
                          Clear Box
                        </button>
                      </div>
                      <div className="border border-slate-200 bg-white rounded-2xl overflow-hidden cursor-crosshair shadow-inner relative flex justify-center items-center">
                        <canvas
                          ref={canvasRef}
                          width={400}
                          height={120}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                          className="w-full bg-white h-30 touch-none block"
                        />
                      </div>
                    </div>
                  )}

                  {/* Accept checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer group mt-4">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 w-4.5 h-4.5 accent-amber-400 border border-slate-300 rounded focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-500 font-semibold leading-snug select-none group-hover:text-slate-700 transition-colors">
                      I warrant that I have read the contract terms thoroughly. I consent to digitally sign this agreement, and understand that doing so locks the contract state and constitutes a legally binding obligation.
                    </span>
                  </label>
                </div>

                {/* Settle button */}
                <button
                  type="button"
                  onClick={handleSignAgreement}
                  disabled={isSigning || !termsAccepted || (signMethod === "type" && !typedName.trim())}
                  className="w-full bg-amber-400 hover:bg-amber-500 disabled:bg-slate-200 text-slate-950 disabled:text-slate-400 rounded-full py-4 text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-400/20 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
                >
                  {isSigning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      Securing Cryptographic Signatures...
                    </>
                  ) : (
                    <>
                      <PenTool className="w-4 h-4" /> Securely Apply Digital Signature
                    </>
                  )}
                </button>
              </div>

            </div>
          ) : (
            
            /* Signature Success View */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
              
              {/* Left Column Success Banner */}
              <div className="md:col-span-5 space-y-5">
                <div className="rounded-3xl bg-emerald-50 border border-emerald-250 p-6 relative overflow-hidden text-center shadow-sm">
                  <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl animate-pulse" />
                  <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-emerald-500/5 blur-2xl" />

                  <div className="relative mx-auto w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-3.5 shadow-sm">
                    <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                  </div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Agreement Active</p>
                  <p className="mt-1 text-2xl font-black text-slate-900 leading-tight">Contract Signed</p>
                  <p className="mt-2 text-[10px] text-emerald-700 font-bold tracking-wide bg-emerald-500/10 py-1.5 px-3.5 rounded-full inline-block border border-emerald-500/20 max-w-[250px] truncate">
                    HASH: {auditHash}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => window.print()}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-full py-3.5 text-xs font-extrabold flex items-center justify-center gap-2 shadow transition-all cursor-pointer active:scale-98"
                  >
                    <Printer className="w-4 h-4 text-amber-400" /> Print Certified Copy
                  </button>
                  
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                      This is a cryptographically locked agreement verified by RentFlow Auditing Services. The contract has been locked in the system with SHA-256 integrity and is legally binding.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column Detailed Contract Verification Card */}
              <div className="md:col-span-7">
                <div className="rounded-3xl bg-white border border-slate-200/80 p-6 space-y-4 printable-invoice shadow-sm">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Verification Certificate</p>
                      <p className="text-sm font-mono font-bold mt-1 text-slate-900">#LE-{contract.id.substring(0,8).toUpperCase()}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-600 rounded-full px-3 py-1 border border-emerald-200 shadow-sm flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-500" /> SECURED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Lessee (Tenant)</p>
                      <p className="font-bold mt-1 text-slate-900">{contract.tenantName}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Leased Unit</p>
                      <p className="font-bold mt-1 text-slate-900">
                        Room {contract.roomNumber} · {contract.roomType}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs border-b border-slate-100 pb-3.5">
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Agreement Start Date</span>
                      <span className="font-bold text-slate-900">{contract.startDate}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Agreement End Date</span>
                      <span className="font-bold text-slate-900">{contract.endDate}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Monthly Rental Rate</span>
                      <span className="font-bold text-slate-900">${contract.rentAmount}/mo</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Signature Verification Status</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 py-0.5 px-2 rounded-md">VERIFIED DIGITAL SIGNATURE</span>
                  </div>

                  {/* Certified Signature graphic */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Signature Authority Hash</p>
                      <p className="text-xs font-mono font-bold mt-0.5 text-slate-900">{auditHash}</p>
                    </div>
                    <div className="h-12 w-32 flex items-center justify-center bg-white border border-slate-100 rounded-lg shadow-sm overflow-hidden p-1">
                      {signatureData ? (
                        signatureData.startsWith("data:image/") ? (
                          <img src={signatureData} alt="Drawn Signature" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-xl text-emerald-600 font-serif italic tracking-wider">
                            {signatureData.startsWith("typed:") ? signatureData.substring(6) : signatureData}
                          </span>
                        )
                      ) : (
                        <span className="text-xs text-slate-400 italic">No digital signature found</span>
                      )}
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
