import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X
} from "lucide-react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { api } from "../lib/api";

export function OwnerManagement() {
  const [owners, setOwners] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Modal forms
  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "" });
  const [editForm, setEditForm] = useState({ id: "", name: "", email: "", password: "" });
  const [selectedOwner, setSelectedOwner] = useState<any>(null);
  
  // Actions loading
  const [modalLoading, setModalLoading] = useState(false);

  const fetchOwners = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        search: search,
      };
      if (isActiveFilter !== "all") {
        params.is_active = isActiveFilter === "active" ? "1" : "0";
      }
      const response = await api.getOwners(params);
      setOwners(response.data.data || []);
      setMeta(response.data.meta);
    } catch (error) {
      console.error("Failed to fetch owners:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, [page, isActiveFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOwners();
  };

  const handleToggleStatus = async (owner: any) => {
    try {
      await api.toggleOwnerStatus(owner.id);
      fetchOwners();
    } catch (error: any) {
      alert(error.message || "Failed to toggle owner status");
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await api.createOwner(createForm);
      setShowCreateModal(false);
      setCreateForm({ name: "", email: "", password: "" });
      fetchOwners();
    } catch (error: any) {
      alert(error.message || "Failed to create owner account");
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditClick = (owner: any) => {
    setEditForm({
      id: owner.id,
      name: owner.name,
      email: owner.email,
      password: ""
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const data: any = {
        name: editForm.name,
        email: editForm.email
      };
      if (editForm.password.trim() !== "") {
        data.password = editForm.password;
      }
      await api.updateOwner(editForm.id, data);
      setShowEditModal(false);
      fetchOwners();
    } catch (error: any) {
      alert(error.message || "Failed to update owner account");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteClick = (owner: any) => {
    setSelectedOwner(owner);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedOwner) return;
    setModalLoading(true);
    try {
      await api.deleteOwner(selectedOwner.id);
      setShowDeleteModal(false);
      setSelectedOwner(null);
      fetchOwners();
    } catch (error: any) {
      alert(error.message || "Failed to delete owner");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Add Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Owner Management</h1>
          <p className="text-muted-foreground mt-1">Manage and audit landlord & property owner accounts on the platform</p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowCreateModal(true)}
        >
          Create Owner Account
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="rounded-3xl border border-foreground/10 bg-card p-6 shadow-brutal flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative flex items-center">
          <input
            type="text"
            placeholder="Search owners by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-foreground/15 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground transition-all"
          />
          <Search className="w-5 h-5 text-muted-foreground absolute left-4 pointer-events-none" />
          <button type="submit" className="hidden" />
        </form>

        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-foreground whitespace-nowrap">Status Filter:</label>
          <select
            value={isActiveFilter}
            onChange={(e) => {
              setIsActiveFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-3 rounded-2xl border border-foreground/15 bg-background text-foreground focus:outline-none focus:border-foreground transition-all font-medium"
          >
            <option value="all">All Accounts</option>
            <option value="active">Active Landlords</option>
            <option value="inactive">Inactive Landlords</option>
          </select>
          <Button variant="outline" icon={RefreshCw} onClick={fetchOwners} disabled={loading}>
            Reload
          </Button>
        </div>
      </div>

      {/* Table grid */}
      <div className="rounded-3xl border border-foreground/10 bg-card shadow-brutal overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-foreground/10">
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Owner Name</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Email Address</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Properties / Rooms</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Active Tenants</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Join Date</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Status</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3 justify-center">
                      <div className="h-8 w-8 rounded-lg bg-primary animate-pulse" />
                      <p className="text-sm text-muted-foreground font-medium">Loading landlord accounts...</p>
                    </div>
                  </td>
                </tr>
              ) : owners.length > 0 ? (
                owners.map((owner) => (
                  <tr key={owner.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 text-sm font-semibold text-foreground">{owner.name}</td>
                    <td className="p-4 text-sm text-muted-foreground">{owner.email}</td>
                    <td className="p-4 text-sm font-bold text-foreground">{owner.roomsCount}</td>
                    <td className="p-4 text-sm font-bold text-foreground">{owner.tenantsCount}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {owner.createdAt ? new Date(owner.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="p-4 text-sm">
                      <button
                        onClick={() => handleToggleStatus(owner)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition border border-solid ${
                          owner.isActive
                            ? "bg-green-100 hover:bg-green-200 text-green-800 border-green-300"
                            : "bg-red-100 hover:bg-red-200 text-red-800 border-red-300"
                        }`}
                        title="Click to toggle status"
                      >
                        {owner.isActive ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="p-4 text-sm text-right space-x-1">
                      <Button
                        variant="ghost"
                        className="p-2 min-w-0"
                        onClick={() => handleEditClick(owner)}
                      >
                        <Edit2 className="w-4 h-4 text-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="p-2 min-w-0"
                        onClick={() => handleDeleteClick(owner)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                    No landlord accounts registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.lastPage > 1 && (
          <div className="p-4 border-t border-foreground/10 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing page {meta.currentPage} of {meta.lastPage} ({meta.total} landlords)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="py-1 px-3"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </Button>
              <Button
                variant="outline"
                className="py-1 px-3"
                disabled={page >= meta.lastPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-foreground/30 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card border-2 border-foreground rounded-3xl p-6 w-full max-w-md shadow-brutal animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 border-b border-foreground/10 pb-2">
              <h2 className="text-xl font-bold text-foreground">Create Owner Account</h2>
              <button onClick={() => setShowCreateModal(false)} className="hover:bg-muted p-1.5 rounded-lg transition-colors">
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Landlord Name</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-foreground/15 bg-background text-foreground focus:outline-none focus:border-foreground"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-foreground/15 bg-background text-foreground focus:outline-none focus:border-foreground"
                  placeholder="e.g. john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Sign-in Password</label>
                <input
                  type="password"
                  required
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-foreground/15 bg-background text-foreground focus:outline-none focus:border-foreground"
                  placeholder="Minimum 8 characters"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-foreground/10">
                <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={modalLoading}>
                  {modalLoading ? "Creating..." : "Create Account"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-foreground/30 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card border-2 border-foreground rounded-3xl p-6 w-full max-w-md shadow-brutal animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 border-b border-foreground/10 pb-2">
              <h2 className="text-xl font-bold text-foreground">Edit Owner Account</h2>
              <button onClick={() => setShowEditModal(false)} className="hover:bg-muted p-1.5 rounded-lg transition-colors">
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Landlord Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-foreground/15 bg-background text-foreground focus:outline-none focus:border-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-foreground/15 bg-background text-foreground focus:outline-none focus:border-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">New Password (optional)</label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-foreground/15 bg-background text-foreground focus:outline-none focus:border-foreground"
                  placeholder="Leave blank to keep current"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-foreground/10">
                <Button variant="ghost" onClick={() => setShowEditModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={modalLoading}>
                  {modalLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && selectedOwner && (
        <div className="fixed inset-0 z-50 bg-foreground/30 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card border-2 border-destructive rounded-3xl p-6 w-full max-w-md shadow-brutal animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-destructive mb-3">
              <AlertTriangle className="w-8 h-8 flex-shrink-0" />
              <h2 className="text-xl font-bold">Critical Danger Action!</h2>
            </div>
            <p className="text-sm text-foreground mb-4">
              You are about to permanently delete the landlord account <strong>{selectedOwner.name}</strong> ({selectedOwner.email}).
            </p>
            <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-2xl text-xs space-y-1 mb-4">
              <p className="font-bold">⚠️ CRITICAL IMPLICATIONS:</p>
              <p>This action will perform a cascading purge of ALL database records associated with this owner, including:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>All properties & rental rooms ({selectedOwner.roomsCount})</li>
                <li>All tenants & leasing contracts</li>
                <li>All historical invoice invoices & payment schedules</li>
                <li>All utility records & maintenance logs</li>
              </ul>
              <p className="font-bold pt-1 text-destructive">This action CANNOT BE UNDONE.</p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button variant="primary" className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDeleteConfirm} disabled={modalLoading}>
                {modalLoading ? "Purging..." : "Confirm Cascading Purge"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
