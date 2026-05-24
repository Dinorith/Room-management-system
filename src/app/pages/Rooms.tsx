import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { useState, useEffect } from "react";
import { api } from "../lib/api";

export function Rooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newRoom, setNewRoom] = useState({ roomNumber: "", type: "standard", rent: "250", capacity: "1", amenities: "" });

  const fetchRooms = async () => {
    try {
      const res = await api.getRooms({ limit: "50" });
      setRooms(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleRoomTypeChange = (type: string) => {
    let rent = "250";
    let capacity = "1";
    if (type === "deluxe") {
      rent = "450";
      capacity = "2";
    } else if (type === "suite") {
      rent = "800";
      capacity = "4";
    }
    setNewRoom(prev => ({
      ...prev,
      type,
      rent,
      capacity
    }));
  };

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r: any) => r.status === "occupied").length;
  const availableRooms = rooms.filter((r: any) => r.status === "vacant").length;

  const handleAddRoom = async () => {
    if (!newRoom.roomNumber.trim() || !newRoom.rent.trim()) return;
    setError("");
    try {
      await api.createRoom({
        roomNumber: newRoom.roomNumber,
        type: newRoom.type,
        rent: parseFloat(newRoom.rent),
        capacity: parseInt(newRoom.capacity) || 1,
        amenities: newRoom.amenities ? newRoom.amenities.split(",").map((a: string) => a.trim()) : [],
      });
      setShowAddRoom(false);
      setNewRoom({ roomNumber: "", type: "standard", rent: "250", capacity: "1", amenities: "" });
      fetchRooms();
    } catch (err: any) {
      setError(err.message || "Failed to add room");
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    try {
      await api.deleteRoom(id);
      fetchRooms();
    } catch (err: any) {
      alert(err.message || "Failed to delete room");
    }
  };

  const handleViewRoom = async (id: string) => {
    try {
      const res = await api.getRoom(id);
      setSelectedRoom(res.data);
    } catch { }
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
          <h1 className="text-3xl font-semibold text-foreground">Rooms Management</h1>
          <p className="text-muted-foreground mt-1">Manage all your rental rooms</p>
        </div>
        <Button icon={Plus} variant="primary" onClick={() => setShowAddRoom(true)}>Add Room</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-3xl p-6 border border-foreground/10 shadow-brutal">
          <p className="text-sm text-muted-foreground mb-1">Total Rooms</p>
          <p className="text-2xl font-semibold text-foreground">{totalRooms}</p>
        </div>
        <div className="bg-card rounded-3xl p-6 border border-foreground/10 shadow-brutal">
          <p className="text-sm text-muted-foreground mb-1">Occupied</p>
          <p className="text-2xl font-semibold text-primary-foreground">{occupiedRooms}</p>
        </div>
        <div className="bg-primary rounded-3xl p-6 border border-foreground/10 shadow-brutal">
          <p className="text-sm text-primary-foreground/70 mb-1">Available</p>
          <p className="text-2xl font-semibold text-primary-foreground">{availableRooms}</p>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-foreground/10 shadow-brutal overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Room Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Rent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tenant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {rooms.map((room: any) => (
                <tr key={room.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-medium text-foreground">Room {room.roomNumber}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground capitalize">{room.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">${room.rent}/month</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{room.tenant || "—"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={room.status === "occupied" ? "success" : room.status === "maintenance" ? "warning" : "info"}>
                      {room.status === "occupied" ? "Occupied" : room.status === "maintenance" ? "Maintenance" : "Vacant"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleViewRoom(room.id)} className="p-2 hover:bg-muted rounded-lg transition-colors"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                      <button onClick={() => handleDeleteRoom(room.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Room Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-3xl border border-foreground/10 max-w-md w-full p-6 shadow-brutal">
            <h3 className="text-xl font-semibold text-foreground mb-4">Room Details</h3>
            <div className="space-y-3">
              <div><label className="text-sm text-muted-foreground">Room Number</label><p className="text-foreground font-medium">Room {selectedRoom.roomNumber}</p></div>
              <div><label className="text-sm text-muted-foreground">Type</label><p className="text-foreground font-medium capitalize">{selectedRoom.type}</p></div>
              <div><label className="text-sm text-muted-foreground">Monthly Rent</label><p className="text-foreground font-medium">${selectedRoom.rent}/month</p></div>
              <div><label className="text-sm text-muted-foreground">Capacity</label><p className="text-foreground font-medium">{selectedRoom.capacity} person(s)</p></div>
              <div><label className="text-sm text-muted-foreground">Tenant</label><p className="text-foreground font-medium">{selectedRoom.tenant?.name || "None"}</p></div>
              <div><label className="text-sm text-muted-foreground">Amenities</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(selectedRoom.amenities || []).map((a: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-primary/20 text-foreground text-xs rounded-lg font-medium">{a}</span>
                  ))}
                </div>
              </div>
              <div><label className="text-sm text-muted-foreground">Status</label>
                <div className="mt-1"><Badge variant={selectedRoom.status === "occupied" ? "success" : "info"}>{selectedRoom.status}</Badge></div>
              </div>
            </div>
            <div className="mt-6 flex justify-end"><Button variant="outline" onClick={() => setSelectedRoom(null)}>Close</Button></div>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {showAddRoom && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-3xl border border-foreground/10 max-w-md w-full p-6 shadow-brutal">
            <h3 className="text-xl font-semibold text-foreground mb-4">Add New Room</h3>
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Room Number *</label>
                <input type="text" placeholder="e.g., 501" value={newRoom.roomNumber}
                  onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Type</label>
                <select value={newRoom.type} onChange={(e) => handleRoomTypeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-medium">
                  <option value="standard">Standard</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="suite">Suite</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Monthly Rent ($) *</label>
                <input type="number" placeholder="e.g., 350" value={newRoom.rent}
                  onChange={(e) => setNewRoom({ ...newRoom, rent: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Capacity</label>
                <input type="number" min="1" value={newRoom.capacity}
                  onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Amenities (comma-separated)</label>
                <input type="text" placeholder="e.g., WiFi, AC, Hot Water" value={newRoom.amenities}
                  onChange={(e) => setNewRoom({ ...newRoom, amenities: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowAddRoom(false); setNewRoom({ roomNumber: "", type: "standard", rent: "250", capacity: "1", amenities: "" }); setError(""); }}>Cancel</Button>
              <Button variant="primary" onClick={handleAddRoom}>Add Room</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
