import { Plus, Eye, Trash2, Pencil } from "lucide-react";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { useState, useEffect } from "react";
import { api } from "../lib/api";

export function Tenants() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [showEditTenant, setShowEditTenant] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newTenant, setNewTenant] = useState({
    name: "", phone: "", room: "", moveInDate: "", email: ""
  });
  const [editTenant, setEditTenant] = useState<any>(null);
  const [vacantRooms, setVacantRooms] = useState<any[]>([]);
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const fetchTenants = async () => {
    try {
      const res = await api.getTenants({ limit: "50" });
      setTenants(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTenants(); }, []);

  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await api.getRooms({ limit: "100" });
      const rooms = res.data || [];
      setAllRooms(rooms);
      setVacantRooms(rooms.filter((r: any) => r.status === "vacant"));
    } catch (err) { console.error(err); }
    finally { setLoadingRooms(false); }
  };

  const handleAddTenant = async () => {
    if (!newTenant.name.trim() || !newTenant.room) return;
    setError("");
    try {
      await api.createTenant(newTenant);
      setShowAddTenant(false);
      setNewTenant({ name: "", phone: "", room: "", moveInDate: "", email: "" });
      fetchTenants();
    } catch (err: any) {
      setError(err.message || "Failed to add tenant");
    }
  };

  const handleEditOpen = async (tenant: any) => {
    setEditTenant({
      id: tenant.id,
      name: tenant.name || "",
      phone: tenant.phone || "",
      email: tenant.email || "",
      room: tenant.room || "",
      moveInDate: tenant.moveInDate || "",
      moveOutDate: tenant.moveOutDate || "",
      status: tenant.status || "active",
    });
    setError("");
    setShowEditTenant(true);
    fetchRooms();
  };

  const handleUpdateTenant = async () => {
    if (!editTenant) return;
    setError("");
    try {
      await api.updateTenant(editTenant.id, {
        name: editTenant.name,
        phone: editTenant.phone,
        email: editTenant.email,
        room: editTenant.room,
        moveInDate: editTenant.moveInDate,
        moveOutDate: editTenant.moveOutDate || null,
        status: editTenant.status,
      });
      setShowEditTenant(false);
      setEditTenant(null);
      setSelectedTenant(null);
      fetchTenants();
    } catch (err: any) {
      setError(err.message || "Failed to update tenant");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tenant?")) return;
    try {
      await api.deleteTenant(id);
      fetchTenants();
      setSelectedTenant(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete tenant");
    }
  };

  const handleViewTenant = async (id: string) => {
    try {
      const res = await api.getTenant(id);
      setSelectedTenant(res.data);
    } catch { }
  };

  // For edit modal: show vacant rooms + current tenant's room
  const getEditRoomOptions = () => {
    if (!editTenant) return [];
    const currentRoom = editTenant.room;
    const options = allRooms.filter(
      (r: any) => r.status === "vacant" || r.roomNumber === currentRoom
    );
    return options;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-10 w-10 rounded-xl bg-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Tenant Management</h1>
          <p className="text-muted-foreground mt-1">Manage all your tenants ({tenants.length} total)</p>
        </div>
        <Button icon={Plus} variant="primary" onClick={() => {
          setNewTenant({
            name: "",
            phone: "",
            room: "",
            moveInDate: new Date().toISOString().split("T")[0],
            email: ""
          });
          setShowAddTenant(true);
          fetchRooms();
        }}>
          Add Tenant
        </Button>
      </div>

      <div className="bg-card rounded-3xl border border-foreground/10 shadow-brutal">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Move-in Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {tenants.map((tenant: any) => (
                <tr key={tenant.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-foreground">{tenant.name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{tenant.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">Room {tenant.room || "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {tenant.moveInDate ? new Date(tenant.moveInDate).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={tenant.status === "active" ? "success" : "warning"}>
                      {tenant.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleViewTenant(tenant.id)} className="p-2 hover:bg-muted rounded-lg transition-colors" title="View">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => handleEditOpen(tenant)} className="p-2 hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                        <Pencil className="w-4 h-4 text-blue-500" />
                      </button>
                      <button onClick={() => handleDelete(tenant.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tenant Detail Modal */}
      {selectedTenant && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-3xl border border-foreground/10 max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-foreground mb-4">Tenant Details</h3>
            <div className="space-y-3">
              <div><label className="text-sm text-muted-foreground">Name</label><p className="text-foreground font-medium">{selectedTenant.name}</p></div>
              <div><label className="text-sm text-muted-foreground">Phone</label><p className="text-foreground font-medium">{selectedTenant.phone || "N/A"}</p></div>
              <div><label className="text-sm text-muted-foreground">Email</label><p className="text-foreground font-medium">{selectedTenant.email || "N/A"}</p></div>
              <div><label className="text-sm text-muted-foreground">Room</label><p className="text-foreground font-medium">Room {selectedTenant.room || "N/A"}</p></div>
              <div><label className="text-sm text-muted-foreground">Move-in Date</label><p className="text-foreground font-medium">{selectedTenant.moveInDate ? new Date(selectedTenant.moveInDate).toLocaleDateString() : "N/A"}</p></div>
              <div><label className="text-sm text-muted-foreground">Move-out Date</label><p className="text-foreground font-medium">{selectedTenant.moveOutDate ? new Date(selectedTenant.moveOutDate).toLocaleDateString() : "N/A"}</p></div>
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge variant={selectedTenant.status === "active" ? "success" : "warning"}>
                    {selectedTenant.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => { handleEditOpen(selectedTenant); setSelectedTenant(null); }}>Edit</Button>
              <Button variant="outline" onClick={() => setSelectedTenant(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Tenant Modal */}
      {showAddTenant && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-3xl border border-foreground/10 max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-foreground mb-4">Add New Tenant</h3>
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Name *</label>
                <input type="text" placeholder="e.g., John Doe" value={newTenant.name}
                  onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
               <div>
                <label className="text-sm text-muted-foreground mb-1 block">Phone</label>
                <input type="text" placeholder="e.g., +855 12 345 678" value={newTenant.phone}
                  onChange={(e) => setNewTenant({ ...newTenant, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Email</label>
                <input type="email" placeholder="e.g., john@email.com" value={newTenant.email}
                  onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Room Number *</label>
                {loadingRooms ? (
                  <div className="w-full px-3 py-2 border border-border rounded-lg bg-background text-muted-foreground text-sm">Loading rooms...</div>
                ) : vacantRooms.length === 0 ? (
                  <div className="w-full px-3 py-2 border border-orange-200 rounded-lg bg-orange-50 text-orange-700 text-sm">No vacant rooms available</div>
                ) : (
                  <select value={newTenant.room}
                    onChange={(e) => setNewTenant({ ...newTenant, room: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-medium">
                    <option value="">Select a vacant room...</option>
                    {vacantRooms.map((room: any) => (
                      <option key={room.id} value={room.roomNumber}>
                        Room {room.roomNumber} (${room.rent}/mo)
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Move-in Date</label>
                <input type="date" value={newTenant.moveInDate}
                  onChange={(e) => setNewTenant({ ...newTenant, moveInDate: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowAddTenant(false); setError(""); }}>Cancel</Button>
              <Button variant="primary" onClick={handleAddTenant}>Add Tenant</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tenant Modal */}
      {showEditTenant && editTenant && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-3xl border border-foreground/10 max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-foreground mb-4">Edit Tenant</h3>
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Name *</label>
                  <input type="text" value={editTenant.name}
                    onChange={(e) => setEditTenant({ ...editTenant, name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Phone</label>
                  <input type="text" value={editTenant.phone}
                    onChange={(e) => setEditTenant({ ...editTenant, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Email</label>
                <input type="email" value={editTenant.email}
                  onChange={(e) => setEditTenant({ ...editTenant, email: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Room</label>
                  {loadingRooms ? (
                    <div className="w-full px-3 py-2 border border-border rounded-lg text-muted-foreground text-sm">Loading...</div>
                  ) : (
                    <select value={editTenant.room}
                      onChange={(e) => setEditTenant({ ...editTenant, room: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">No room</option>
                      {getEditRoomOptions().map((room: any) => (
                        <option key={room.id} value={room.roomNumber}>
                          Room {room.roomNumber}
                          {room.roomNumber === editTenant.room ? " ← current" : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Status</label>
                  <select value={editTenant.status}
                    onChange={(e) => setEditTenant({ ...editTenant, status: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Move-in Date</label>
                  <input type="date" value={editTenant.moveInDate}
                    onChange={(e) => setEditTenant({ ...editTenant, moveInDate: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Move-out Date</label>
                  <input type="date" value={editTenant.moveOutDate}
                    onChange={(e) => setEditTenant({ ...editTenant, moveOutDate: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowEditTenant(false); setEditTenant(null); setError(""); }}>Cancel</Button>
              <Button variant="primary" onClick={handleUpdateTenant}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
