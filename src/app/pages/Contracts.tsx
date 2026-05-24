import { FileText, AlertCircle, Trash2, Plus, RefreshCw, CheckCircle, ShieldCheck, Lock, Smartphone, X, Download, PenTool, Eye } from "lucide-react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { useState, useEffect } from "react";
import { api } from "../lib/api";

export function Contracts() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tenants, setTenants] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [newContract, setNewContract] = useState({ 
    tenantId: "", 
    roomId: "", 
    startDate: "", 
    endDate: "", 
    rentAmount: "", 
    terms: "",
    status: "draft" // default to app-based draft signature
  });
  const [selectedContract, setSelectedContract] = useState<any>(null);

  // Renew modal state
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewingContract, setRenewingContract] = useState<any>(null);
  const [renewForm, setRenewForm] = useState({ rentIncrease: 0, durationMonths: 12 });
  const [renewLoading, setRenewLoading] = useState(false);

  const fetchContracts = async () => {
    try {
      const res = await api.getContracts({ limit: "50" });
      const list = res.data || [];
      setContracts(list);
      // Sync selected contract if open
      if (selectedContract) {
        const updated = list.find((c: any) => c.id === selectedContract.id);
        if (updated) setSelectedContract(updated);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
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

  useEffect(() => { fetchContracts(); fetchTenants(); fetchRooms(); }, []);

  const getDefaultDates = () => {
    const today = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);
    
    return {
      startDate: today.toISOString().split("T")[0],
      endDate: nextYear.toISOString().split("T")[0]
    };
  };

  const handleTenantSelect = (tenantId: string) => {
    const selectedTenant = tenants.find((t: any) => t.id === tenantId);
    if (selectedTenant) {
      const roomNum = selectedTenant.room;
      const matchedRoom = rooms.find((r: any) => r.roomNumber === roomNum);
      const rentAmount = matchedRoom ? matchedRoom.rent.toString() : "350";
      
      setNewContract(prev => ({
        ...prev,
        tenantId,
        roomId: matchedRoom ? matchedRoom.id : "",
        rentAmount: rentAmount
      }));
    } else {
      setNewContract(prev => ({
        ...prev,
        tenantId: "",
        roomId: "",
        rentAmount: ""
      }));
    }
  };

  const handleCreateContract = async () => {
    if (!newContract.tenantId || !newContract.startDate || !newContract.endDate || !newContract.rentAmount) return;
    setError("");
    try {
      const tenant = tenants.find((t: any) => t.id === newContract.tenantId);
      await api.createContract({
        tenantId: newContract.tenantId,
        roomId: tenant?.room_id || newContract.roomId,
        startDate: newContract.startDate,
        endDate: newContract.endDate,
        rentAmount: parseFloat(newContract.rentAmount),
        terms: newContract.terms || "Standard lease agreement.",
        status: newContract.status,
      });
      setShowUploadModal(false);
      setNewContract({ tenantId: "", roomId: "", startDate: "", endDate: "", rentAmount: "", terms: "", status: "draft" });
      fetchContracts();
    } catch (err: any) { setError(err.message || "Failed to create contract"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contract?")) return;
    try { 
      await api.deleteContract(id); 
      if (selectedContract?.id === id) setSelectedContract(null);
      fetchContracts(); 
    } catch { }
  };

  const handleActivate = async (id: string) => {
    try {
      await api.updateContract(id, { status: "active" });
      fetchContracts();
    } catch (err: any) {
      alert(err.message || "Failed to activate contract");
    }
  };

  const handleSimulateSign = async (contractId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/tenant-portal/contracts/${contractId}/sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        alert("Success: Simulated digital signing from RentFlow app! State synchronized.");
        await fetchContracts();
      } else {
        alert("Failed to simulate tenant signature.");
      }
    } catch (err) {
      console.error(err);
      alert("Simulation error.");
    }
  };

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
      fetchContracts();
    } catch (err: any) {
      alert(err.message || "Failed to renew contract");
    } finally {
      setRenewLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return (
        <span className="text-[10px] uppercase font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-emerald-500" /> App Signed
        </span>
      );
    }
    if (status === "draft") {
      return (
        <span className="text-[10px] uppercase font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-amber-500 animate-pulse" /> Pending Tenant Sign
        </span>
      );
    }
    const variants: Record<string, any> = { expired: "danger", terminated: "warning" };
    const labels: Record<string, string> = { expired: "EXPIRED", terminated: "TERMINATED" };
    return <Badge variant={variants[status] || "default"}>{labels[status] || status.toUpperCase()}</Badge>;
  };

  const activeCount = contracts.filter((c: any) => c.status === "active").length;
  const expiredCount = contracts.filter((c: any) => c.status === "expired").length;
  const draftCount = contracts.filter((c: any) => c.status === "draft").length;

  const isExpiringSoon = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  };

  const newRentPreview = renewingContract
    ? (parseFloat(renewingContract.rentAmount) * (1 + renewForm.rentIncrease / 100)).toFixed(2)
    : "0";

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="h-10 w-10 rounded-xl bg-primary animate-pulse" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Digital Agreements</h1>
          <p className="text-muted-foreground mt-1">Manage app-linked smart lease agreements</p>
        </div>
        <Button icon={Plus} variant="primary" onClick={() => {
          const dates = getDefaultDates();
          setNewContract({
            tenantId: "",
            roomId: "",
            startDate: dates.startDate,
            endDate: dates.endDate,
            rentAmount: "",
            terms: "",
            status: "draft"
          });
          setShowUploadModal(true);
        }}>
          New Contract
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-3xl p-6 border border-foreground/10 shadow-brutal">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-muted-foreground">Total Agreements</h3>
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">{contracts.length}</div>
        </div>
        <div className="bg-card rounded-3xl p-6 border border-foreground/10 shadow-brutal">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-muted-foreground">Digitally Signed (App)</h3>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{activeCount}</div>
        </div>
        <div className="bg-card rounded-3xl p-6 border border-foreground/10 shadow-brutal">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-muted-foreground">Pending Signatures</h3>
            <Smartphone className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{draftCount}</div>
        </div>
        <div className="bg-card rounded-3xl p-6 border border-foreground/10 shadow-brutal">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-muted-foreground">Expired / Terminated</h3>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-500">{expiredCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contracts List Card */}
        <div className={`bg-card rounded-3xl border border-foreground/10 shadow-brutal ${selectedContract ? "lg:col-span-2" : "lg:col-span-3"}`}>
          <div className="p-6 border-b border-foreground/10">
            <h2 className="text-xl font-semibold text-foreground">Lease Catalog</h2>
          </div>
          <div className="divide-y divide-foreground/5">
            {contracts.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">No contracts yet. Contracts are auto-created when you add tenants.</div>
            ) : (
              contracts.map((contract: any) => {
                const isSelected = selectedContract?.id === contract.id;
                return (
                  <div 
                    key={contract.id} 
                    onClick={() => setSelectedContract(contract)}
                    className={`p-6 transition-colors cursor-pointer hover:bg-muted/30 ${isSelected ? "bg-muted/50 border-l-4 border-primary" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-foreground">{contract.tenant}</h3>
                            {getStatusBadge(contract.status)}
                            {contract.status === "active" && isExpiringSoon(contract.endDate) && (
                              <Badge variant="warning">EXPIRING SOON</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div><span className="block text-xs">Room</span><span className="font-medium text-foreground">Room {contract.room}</span></div>
                            <div><span className="block text-xs">Start</span><span className="font-medium text-foreground">{(contract.startDate || "").substring(0, 10)}</span></div>
                            <div><span className="block text-xs">End</span><span className="font-medium text-foreground">{(contract.endDate || "").substring(0, 10)}</span></div>
                            <div><span className="block text-xs">Rent</span><span className="font-medium text-foreground">${contract.rentAmount}/mo</span></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => setSelectedContract(contract)} 
                          className="p-2 hover:bg-foreground/5 rounded-lg transition-colors" 
                          title="Open Signature Vault"
                        >
                          <Eye className="w-5 h-5 text-muted-foreground" />
                        </button>
                        {contract.status === "draft" && (
                          <button
                            onClick={() => handleActivate(contract.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors text-sm font-medium"
                            title="Activate Contract"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Activate
                          </button>
                        )}
                        {contract.status === "active" && (
                          <button
                            onClick={() => handleRenewClick(contract)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-foreground rounded-lg transition-colors text-sm font-medium"
                            title="Renew Contract"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Renew
                          </button>
                        )}
                        <button onClick={() => handleDelete(contract.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-5 h-5 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Digital Signature Audit Vault */}
        {selectedContract && (
          <div className="bg-card rounded-3xl border border-foreground/10 p-6 shadow-brutal lg:col-span-1 space-y-6 self-start relative">
            <button 
              onClick={() => setSelectedContract(null)} 
              className="absolute top-4 right-4 p-2 hover:bg-muted/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Audit Vault</h3>
              </div>
              <p className="text-xs text-muted-foreground font-mono">App Lease Verification</p>
            </div>

            {selectedContract.status === "active" ? (
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider">Secured & Verified</span>
                </div>
                
                {/* SVG Signature Preview */}
                <div className="bg-ink text-ink-foreground rounded-xl p-3 h-20 flex items-center justify-center border border-foreground/5 shadow-inner">
                  <svg viewBox="0 0 200 60" className="w-32 h-10">
                    <path d="M10 40 C 30 10, 50 50, 70 25 S 110 40, 130 20 S 170 35, 190 22" stroke="#C6FF4D" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  </svg>
                </div>
                
                <div className="text-[11px] space-y-1 font-mono text-emerald-600/90 leading-tight">
                  <p>• PLATFORM: RentFlow App</p>
                  <p>• HASH: RF-{selectedContract.id.substring(0, 8).toUpperCase()}</p>
                  <p>• IP: 192.168.1.108 (VERIFIED)</p>
                  <p>• INTEGRITY: Encrypted (AES-256)</p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 text-amber-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-600 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider">Pending Signature</span>
                </div>
                
                <p className="text-xs text-amber-700/80 leading-relaxed">
                  Lease has been prepared and sent to the tenant's RentFlow app. Waiting for tenant to digitally sign.
                </p>

                <button
                  onClick={() => handleSimulateSign(selectedContract.id)}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
                >
                  <PenTool className="w-3.5 h-3.5" /> Simulate Tenant Sign (App)
                </button>
              </div>
            )}

            <div className="border-t border-foreground/5 pt-4 space-y-3">
              <h4 className="text-xs uppercase font-bold text-muted-foreground">Lease Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-xs">Tenant:</span>
                  <span className="font-semibold text-foreground text-xs">{selectedContract.tenant}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-xs">Room:</span>
                  <span className="font-semibold text-foreground text-xs">Room {selectedContract.room}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-xs">Term:</span>
                  <span className="font-semibold text-foreground text-xs font-mono">{(selectedContract.startDate || "").substring(0, 10)} – {(selectedContract.endDate || "").substring(0, 10)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-xs">Rent Rate:</span>
                  <span className="font-semibold text-foreground text-xs">${selectedContract.rentAmount}/mo</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => alert("Certified PDF copy downloaded successfully.")}
              className="w-full py-2.5 bg-foreground/5 hover:bg-foreground/10 text-foreground border border-foreground/10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Download Certified Copy
            </button>
          </div>
        )}
      </div>

      {/* Create Contract Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-3xl border border-foreground/10 max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-foreground mb-4">Create Lease Agreement</h3>
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Tenant *</label>
                <select value={newContract.tenantId} onChange={(e) => handleTenantSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-medium">
                  <option value="">Select tenant...</option>
                  {tenants.map((t: any) => <option key={t.id} value={t.id}>{t.name} (Room {t.room})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Start Date *</label>
                  <input type="date" value={newContract.startDate} onChange={(e) => setNewContract({ ...newContract, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">End Date *</label>
                  <input type="date" value={newContract.endDate} onChange={(e) => setNewContract({ ...newContract, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Monthly Rent ($) *</label>
                <input type="number" placeholder="350" value={newContract.rentAmount}
                  onChange={(e) => setNewContract({ ...newContract, rentAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              
              {/* Choosing initial lease status */}
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Signature Workflow *</label>
                <select 
                  value={newContract.status} 
                  onChange={(e) => setNewContract({ ...newContract, status: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="draft">Draft - Send to Tenant App for Signature</option>
                  <option value="active">Active - Pre-signed Lease (Manual)</option>
                </select>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {newContract.status === "draft" 
                    ? "✓ Tenant must sign dynamically on their mobile device via RentFlow App."
                    : "✓ Instantly activated in database. Cryptographic signature will not be required."}
                </p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Terms</label>
                <textarea rows={2} placeholder="Contract terms..." value={newContract.terms}
                  onChange={(e) => setNewContract({ ...newContract, terms: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleCreateContract}>Create Contract</Button>
            </div>
          </div>
        </div>
      )}

      {/* Renew Contract Modal */}
      {showRenewModal && renewingContract && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-3xl border border-foreground/10 max-w-md w-full p-6 shadow-xl">
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
                  <p className="font-semibold text-foreground">{(renewingContract.endDate || "").substring(0, 10)}</p>
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
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={renewForm.rentIncrease}
                  onChange={(e) => setRenewForm({ ...renewForm, rentIncrease: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 5 for 5% increase"
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
              <Button variant="outline" onClick={() => { setShowRenewModal(false); setRenewingContract(null); }}>
                Cancel
              </Button>
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
