import { useState, useEffect } from "react";
import { Plus, Filter, ChevronDown, DollarSign, Link2 } from "lucide-react";
import { Badge } from "../components/Badge";
import { api } from "../lib/api";

interface MaintenanceRequest {
  id: string;
  room: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in-progress" | "completed";
  reportedBy: string;
  reportedDate: string;
  completedDate?: string;
  notes?: string;
  cost?: number;
  hasExpense?: boolean;
}

export function Maintenance() {
  const [filter, setFilter] = useState<"all" | "pending" | "in-progress" | "completed">("all");
  const [showNewModal, setShowNewModal] = useState(false);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newRequest, setNewRequest] = useState({ room: "", title: "", description: "", priority: "medium", reportedBy: "" });
  const [showCostModal, setShowCostModal] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [costInput, setCostInput] = useState("");

  const fetchRequests = async () => {
    try {
      const params: Record<string, string> = { limit: "50" };
      if (filter !== "all") params.status = filter;
      const res = await api.getMaintenance(params);
      setRequests(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, [filter]);

  const handleAddRequest = async () => {
    if (!newRequest.room || !newRequest.title || !newRequest.description || !newRequest.reportedBy) return;
    setError("");
    try {
      await api.createMaintenance(newRequest);
      setShowNewModal(false);
      setNewRequest({ room: "", title: "", description: "", priority: "medium", reportedBy: "" });
      fetchRequests();
    } catch (err: any) { setError(err.message || "Failed to create request"); }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    if (newStatus === 'completed') {
      setCompletingId(requestId);
      setCostInput("");
      setShowCostModal(true);
      setOpenDropdown(null);
      return;
    }
    try {
      await api.updateMaintenance(requestId, { status: newStatus });
      fetchRequests();
    } catch { }
    setOpenDropdown(null);
  };

  const handleCompleteWithCost = async () => {
    if (!completingId) return;
    try {
      await api.updateMaintenance(completingId, {
        status: 'completed',
        cost: costInput ? parseFloat(costInput) : 0,
      });
      setShowCostModal(false);
      setCompletingId(null);
      setCostInput("");
      fetchRequests();
    } catch (err: any) { alert(err.message || 'Failed to complete'); }
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, any> = { low: "default", medium: "warning", high: "warning", urgent: "destructive" };
    return <Badge variant={variants[priority] || "default"}>{priority.toUpperCase()}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = { pending: "warning", "in-progress": "default", completed: "success" };
    return <Badge variant={variants[status] || "default"}>{status.replace("-", " ").toUpperCase()}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="h-10 w-10 rounded-xl bg-primary animate-pulse" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Maintenance Requests</h1>
          <p className="text-muted-foreground mt-1">Track and manage repair requests</p>
        </div>
        <button onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors">
          <Plus className="w-5 h-5" /> New Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border shadow-sm p-6">
          <div className="text-sm text-muted-foreground mb-2">Total Requests</div>
          <div className="text-3xl font-bold text-foreground">{requests.length}</div>
        </div>
        <div className="bg-card rounded-lg border border-orange-200 shadow-sm p-6 bg-orange-50/50">
          <div className="text-sm text-muted-foreground mb-2">Pending</div>
          <div className="text-3xl font-bold text-orange-600">{requests.filter(r => r.status === "pending").length}</div>
        </div>
        <div className="bg-card rounded-3xl border border-foreground/10 shadow-brutal p-6 bg-primary/5">
          <div className="text-sm text-muted-foreground mb-2">In Progress</div>
          <div className="text-3xl font-bold text-primary-foreground">{requests.filter(r => r.status === "in-progress").length}</div>
        </div>
        <div className="bg-card rounded-lg border border-green-200 shadow-sm p-6 bg-green-50/50">
          <div className="text-sm text-muted-foreground mb-2">Completed</div>
          <div className="text-3xl font-bold text-primary-foreground">{requests.filter(r => r.status === "completed").length}</div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm">
        <div className="p-4 border-b border-foreground/10 bg-muted/30">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Filter by Status:</span>
            <div className="flex gap-2 flex-wrap">
              {(["all", "pending", "in-progress", "completed"] as const).map(status => (
                <button key={status} onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === status ? "bg-primary text-primary-foreground shadow-md" : "bg-background text-foreground border border-border hover:border-primary/50"}`}>
                  {status === "all" ? "All" : status.replace("-", " ").charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="divide-y divide-foreground/5">
          {requests.length === 0 ? (
            <div className="p-8 text-center"><p className="text-muted-foreground">No maintenance requests found</p></div>
          ) : (
            requests.map(request => (
              <div key={request.id} className="p-6 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-lg text-foreground">{request.title}</h3>
                      {getPriorityBadge(request.priority)}
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{request.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="font-medium">Room {request.room}</span>
                      <span>•</span>
                      <span>Reported by: <span className="font-medium">{request.reportedBy}</span></span>
                      <span>•</span>
                      <span>{(request.reportedDate || "").substring(0, 10)}</span>
                      {request.completedDate && (<><span>•</span><span className="text-green-600 font-medium">Completed: {(request.completedDate || "").substring(0, 10)}</span></>)}
                      {(request.cost ?? 0) > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <DollarSign className="w-3 h-3" />${request.cost}
                          </span>
                        </>
                      )}
                      {request.hasExpense && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-medium">
                          <Link2 className="w-3 h-3" />Expense Linked
                        </span>
                      )}
                    </div>
                  </div>
                  {request.status !== "completed" && (
                    <div className="relative">
                      <button onClick={() => setOpenDropdown(openDropdown === request.id ? null : request.id)}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium flex items-center gap-2">
                        Update <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === request.id ? "rotate-180" : ""}`} />
                      </button>
                      {openDropdown === request.id && (
                        <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-lg z-10 min-w-[140px]">
                          {[{ value: "pending", label: "Pending" }, { value: "in-progress", label: "In Progress" }, { value: "completed", label: "Completed" }].map((s, idx) => (
                            <button key={s.value} onClick={() => handleUpdateStatus(request.id, s.value)}
                              className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors ${request.status === s.value ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted/50"} ${idx < 2 ? "border-b border-foreground/10" : ""}`}>
                              {s.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showNewModal && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-3xl border border-foreground/10 max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-foreground mb-4">New Maintenance Request</h3>
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Room Number *</label>
                <input type="text" placeholder="e.g., 302" value={newRequest.room}
                  onChange={(e) => setNewRequest({ ...newRequest, room: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Title *</label>
                <input type="text" placeholder="Brief issue title" value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Description *</label>
                <textarea rows={3} placeholder="Describe the issue..." value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Priority</label>
                <select value={newRequest.priority} onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Reported By *</label>
                <input type="text" placeholder="Reporter name" value={newRequest.reportedBy}
                  onChange={(e) => setNewRequest({ ...newRequest, reportedBy: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowNewModal(false)} className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleAddRequest} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors">Submit</button>
            </div>
          </div>
        </div>
      )}
      {/* Complete with Cost Modal */}
      {showCostModal && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-3xl border border-foreground/10 max-w-sm w-full p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-foreground mb-2">Complete Maintenance</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Enter the repair cost. If greater than $0, an expense record will be automatically created.
            </p>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Repair Cost ($)</label>
              <input type="number" min="0" step="0.01" placeholder="0.00" value={costInput}
                onChange={(e) => setCostInput(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="mt-2 p-2 bg-primary/10 border border-foreground/10 rounded-lg text-xs text-foreground">
              <strong>💡 Auto-link:</strong> Entering a cost will auto-create a linked expense in the Expenses module.
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => { setShowCostModal(false); setCompletingId(null); }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleCompleteWithCost}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center gap-2">
                <DollarSign className="w-4 h-4" />Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
