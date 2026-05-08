import { FileText, AlertCircle, Trash2, Plus, RefreshCw, CheckCircle } from "lucide-react";
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
  const [newContract, setNewContract] = useState({ tenantId: "", roomId: "", startDate: "", endDate: "", rentAmount: "", terms: "" });

  // Renew modal state
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewingContract, setRenewingContract] = useState<any>(null);
  const [renewForm, setRenewForm] = useState({ rentIncrease: 0, durationMonths: 12 });
  const [renewLoading, setRenewLoading] = useState(false);

  const fetchContracts = async () => {
    try {
      const res = await api.getContracts({ limit: "50" });
      setContracts(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchTenants = async () => {
    try {
      const res = await api.getTenants({ limit: "50" });
      setTenants(res.data || []);
    } catch { }
  };

  useEffect(() => { fetchContracts(); fetchTenants(); }, []);

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
      });
      setShowUploadModal(false);
      setNewContract({ tenantId: "", roomId: "", startDate: "", endDate: "", rentAmount: "", terms: "" });
      fetchContracts();
    } catch (err: any) { setError(err.message || "Failed to create contract"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contract?")) return;
    try { await api.deleteContract(id); fetchContracts(); } catch { }
  };

  const handleActivate = async (id: string) => {
    try {
      await api.updateContract(id, { status: "active" });
      fetchContracts();
    } catch (err: any) {
      alert(err.message || "Failed to activate contract");
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
    const variants: Record<string, any> = { active: "success", expired: "danger", terminated: "warning", draft: "default" };
    const labels: Record<string, string> = { active: "ACTIVE", expired: "EXPIRED", terminated: "TERMINATED", draft: "DRAFT" };
    return <Badge variant={variants[status] || "default"}>{labels[status] || status.toUpperCase()}</Badge>;
  };

  const activeCount = contracts.filter((c: any) => c.status === "active").length;
  const expiredCount = contracts.filter((c: any) => c.status === "expired").length;
  const draftCount = contracts.filter((c: any) => c.status === "draft").length;

  // Check if a contract is expiring soon (within 30 days)
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
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Contract Management</h1>
          <p className="text-muted-foreground mt-1">Manage rental agreements</p>
        </div>
        <Button icon={Plus} variant="primary" onClick={() => setShowUploadModal(true)}>New Contract</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-muted-foreground">Total Contracts</h3>
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">{contracts.length}</div>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-muted-foreground">Active</h3>
            <FileText className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600">{activeCount}</div>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-muted-foreground">Draft</h3>
            <FileText className="w-5 h-5 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-gray-600">{draftCount}</div>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-muted-foreground">Expired</h3>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-500">{expiredCount}</div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="p-6 border-b border-border"><h2 className="text-xl font-semibold text-foreground">All Contracts</h2></div>
        <div className="divide-y divide-border">
          {contracts.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">No contracts yet. Contracts are auto-created when you add tenants.</div>
          ) : (
            contracts.map((contract: any) => (
              <div key={contract.id} className="p-6 hover:bg-muted/30 transition-colors">
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
                        <div><span className="block text-xs">Start</span><span className="font-medium text-foreground">{contract.startDate}</span></div>
                        <div><span className="block text-xs">End</span><span className="font-medium text-foreground">{contract.endDate}</span></div>
                        <div><span className="block text-xs">Rent</span><span className="font-medium text-foreground">${contract.rentAmount}/mo</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
                    {(contract.status === "active") && (
                      <button
                        onClick={() => handleRenewClick(contract)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-medium"
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
            ))
          )}
        </div>
      </div>

      {/* Create Contract Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-foreground mb-4">Create Contract</h3>
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Tenant *</label>
                <select value={newContract.tenantId} onChange={(e) => setNewContract({ ...newContract, tenantId: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
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
