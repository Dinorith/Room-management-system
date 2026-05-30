import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { useState, useEffect } from "react";
import { api } from "../lib/api";
import RoomTypeService from "../services/RoomTypeService";

export function Rooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newRoom, setNewRoom] = useState({ roomNumber: "", roomTypeId: "", rent: "", capacity: "1", amenities: "" });
  const [roomTypeFilter, setRoomTypeFilter] = useState<"monthly" | "daily">("monthly");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRooms = async (forceRefresh: boolean = false) => {
    try {
      // Force clear cache if requested
      if (forceRefresh) {
        api.clearCache('room');
      }
      const res = await api.getRooms({ limit: "50" });
      setRooms(res.data || []);
    } catch (err) { 
      console.error("Error fetching rooms:", err);
    }
    finally { setLoading(false); }
  };

  const fetchRoomTypes = async () => {
    try {
      const res = await RoomTypeService.getActive();
      if (res?.data) {
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setRoomTypes(data);
      }
    } catch (err) { console.error("Error fetching room types:", err); }
  };

  useEffect(() => {
    fetchRooms();
    fetchRoomTypes();
  }, []);

  const handleRoomTypeChange = (roomTypeId: string) => {
    const selectedType = roomTypes.find((rt: any) => String(rt.id) === roomTypeId);
    if (selectedType) {
      const defaultPrice = selectedType.billing_cycle === 'daily'
        ? selectedType.base_daily_price
        : selectedType.base_price;
      setNewRoom(prev => ({
        ...prev,
        roomTypeId,
        rent: String(defaultPrice),
        capacity: String(selectedType.capacity),
      }));
    } else {
      setNewRoom(prev => ({
        ...prev,
        roomTypeId,
        rent: "",
        capacity: "1",
      }));
    }
  };

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r: any) => r.status === "occupied").length;
  const availableRooms = rooms.filter((r: any) => r.status === "vacant").length;

  const handleAddRoom = async () => {
    if (!newRoom.roomNumber.trim() || !newRoom.rent.trim()) {
      setError("Room Number and Rent are required");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const payload: any = {
        roomNumber: newRoom.roomNumber,
        rent: parseFloat(newRoom.rent),
        capacity: parseInt(newRoom.capacity) || 1,
        amenities: newRoom.amenities ? newRoom.amenities.split(",").map((a: string) => a.trim()) : [],
      };

      // If a room type is selected, send roomTypeId and set type from room type name
      if (newRoom.roomTypeId) {
        payload.roomTypeId = newRoom.roomTypeId;
        const selectedType = roomTypes.find((rt: any) => String(rt.id) === newRoom.roomTypeId);
        if (selectedType) {
          payload.type = selectedType.name.toLowerCase();
        }
      } else {
        payload.type = "standard";
      }

      await api.createRoom(payload);
      
      // Force clear cache and refresh with fresh data
      await fetchRooms(true);
      
      setShowAddRoom(false);
      setNewRoom({ roomNumber: "", roomTypeId: "", rent: "", capacity: "1", amenities: "" });
    } catch (err: any) {
      console.error("Room creation error:", err);
      
      // Show detailed error message
      let errorMessage = "Failed to add room";
      
      if (err.errors && typeof err.errors === 'object') {
        const errorMsgs = Object.values(err.errors).flat().join(", ");
        errorMessage = errorMsgs || err.message || errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground capitalize">{room.roomType?.name || room.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    ${room.rent}/{room.roomType?.billingCycle === 'daily' || room.billingCycle === 'daily' ? 'day' : 'month'}
                  </td>
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
              <div><label className="text-sm text-muted-foreground">Type</label><p className="text-foreground font-medium capitalize">{selectedRoom.roomType?.name || selectedRoom.type}</p></div>
              <div>
                <label className="text-sm text-muted-foreground">
                  {selectedRoom.roomType?.billingCycle === 'daily' || selectedRoom.billingCycle === 'daily' ? 'Daily Rent' : 'Monthly Rent'}
                </label>
                <p className="text-foreground font-medium">
                  ${selectedRoom.rent}/{selectedRoom.roomType?.billingCycle === 'daily' || selectedRoom.billingCycle === 'daily' ? 'day' : 'month'}
                </p>
              </div>
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
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm font-medium">
                <strong>Error:</strong> {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Room Number *</label>
                <input 
                  type="text" 
                  placeholder="e.g., 501" 
                  value={newRoom.roomNumber}
                  onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed" 
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Room Type billing</label>
                <div className="flex border border-foreground/10 rounded-2xl p-1 bg-muted/20 gap-1 mb-3 bg-background">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setRoomTypeFilter("monthly");
                      setNewRoom(prev => ({ ...prev, roomTypeId: "", rent: "" }));
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      roomTypeFilter === "monthly"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    By Month
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setRoomTypeFilter("daily");
                      setNewRoom(prev => ({ ...prev, roomTypeId: "", rent: "" }));
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      roomTypeFilter === "daily"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    By Day
                  </button>
                </div>

                <label className="text-sm text-muted-foreground mb-1 block">Select Room Type *</label>
                <select 
                  value={newRoom.roomTypeId} 
                  onChange={(e) => handleRoomTypeChange(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                  <option value="">— Select Room Type —</option>
                  {roomTypes.filter((rt: any) => rt.billing_cycle === roomTypeFilter).map((rt: any) => {
                    const priceText = rt.billing_cycle === 'daily'
                      ? `$${parseFloat(rt.base_daily_price).toFixed(2)}/day`
                      : `$${parseFloat(rt.base_price).toFixed(2)}/mo`;
                    return (
                      <option key={rt.id} value={rt.id}>
                        {rt.name} ({priceText})
                      </option>
                    );
                  })}
                </select>
                {roomTypes.filter((rt: any) => rt.billing_cycle === roomTypeFilter).length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No {roomTypeFilter} room types found.</p>
                )}
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  {roomTypeFilter === 'daily' ? "Daily Rent ($) *" : "Monthly Rent ($) *"}
                </label>
                <input 
                  type="number" 
                  placeholder="e.g., 350" 
                  value={newRoom.rent}
                  onChange={(e) => setNewRoom({ ...newRoom, rent: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed" 
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Capacity</label>
                <input 
                  type="number" 
                  min="1" 
                  value={newRoom.capacity}
                  onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed" 
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Amenities (comma-separated)</label>
                <input 
                  type="text" 
                  placeholder="e.g., WiFi, AC, Hot Water" 
                  value={newRoom.amenities}
                  onChange={(e) => setNewRoom({ ...newRoom, amenities: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed" 
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => { 
                  setShowAddRoom(false); 
                  setNewRoom({ roomNumber: "", roomTypeId: "", rent: "", capacity: "1", amenities: "" }); 
                  setError(""); 
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleAddRoom}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Room"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


