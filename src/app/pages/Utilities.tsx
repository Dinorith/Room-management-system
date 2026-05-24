import { useState, useEffect } from "react";
import { Save, CheckCircle, XCircle } from "lucide-react";
import { api } from "../lib/api";

export function Utilities() {
  const [utilities, setUtilities] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [rates, setRates] = useState({ electricityRate: 0.20, waterRate: 0.50 });
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ room: "", electricity: "", water: "" });

  const fetchData = async () => {
    try {
      const [utilRes, ratesRes, roomsRes] = await Promise.all([
        api.getUtilities({ limit: "50" }),
        api.getUtilityRates(),
        api.getRooms({ limit: "100" }),
      ]);
      setUtilities(utilRes.data || []);
      if (ratesRes.data) setRates(ratesRes.data);
      setRooms(roomsRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveReading = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.room || !formData.electricity || !formData.water) { alert("Please fill in all fields"); return; }

    try {
      await api.createUtility({
        room: formData.room,
        electricity: parseFloat(formData.electricity),
        water: parseFloat(formData.water),
        month: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      });
      setFormData({ room: "", electricity: "", water: "" });
      fetchData();
    } catch (err: any) { alert(err.message || "Failed to save reading"); }
  };

  const totalElectricity = utilities.reduce((sum: number, u: any) => sum + parseFloat(u.electricity || 0), 0);
  const totalWater = utilities.reduce((sum: number, u: any) => sum + parseFloat(u.water || 0), 0);
  const totalCost = utilities.reduce((sum: number, u: any) => sum + parseFloat(u.electricityCost || 0) + parseFloat(u.waterCost || 0), 0);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="h-10 w-10 rounded-xl bg-primary animate-pulse" /></div>;
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-semibold text-foreground">Utilities Management</h1>
        <p className="text-muted-foreground mt-1">Track electricity and water usage</p></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <p className="text-sm text-muted-foreground mb-2">Total Electricity</p>
          <p className="text-3xl font-bold text-foreground">{Math.round(totalElectricity)}</p>
          <p className="text-xs text-muted-foreground mt-1">kWh</p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <p className="text-sm text-muted-foreground mb-2">Total Water</p>
          <p className="text-3xl font-bold text-foreground">{Math.round(totalWater)}</p>
          <p className="text-xs text-muted-foreground mt-1">m³</p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-green-200 shadow-sm bg-green-50/50">
          <p className="text-sm text-muted-foreground mb-2">Total Cost</p>
          <p className="text-3xl font-bold text-primary-foreground">${totalCost.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">All readings</p>
        </div>
      </div>

      <div className="bg-primary/10 border border-foreground/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Current Utility Rates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><p className="text-sm text-foreground">Electricity Rate</p><p className="text-xl font-semibold text-blue-900">${rates.electricityRate} per kWh</p></div>
          <div><p className="text-sm text-foreground">Water Rate</p><p className="text-xl font-semibold text-blue-900">${rates.waterRate} per m³</p></div>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-foreground/10 shadow-brutal p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Record Monthly Readings</h2>
        <form onSubmit={handleSaveReading} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Room</label>
            <select value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground">
              <option value="">Select a room</option>
              {rooms.map((r: any) => (
                <option key={r.id} value={r.roomNumber}>Room {r.roomNumber}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Electricity (kWh)</label>
            <input type="number" placeholder="0" value={formData.electricity}
              onChange={(e) => setFormData({ ...formData, electricity: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Water (m³)</label>
            <input type="number" placeholder="0" value={formData.water}
              onChange={(e) => setFormData({ ...formData, water: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium">
              <Save className="w-5 h-5" /> Save Reading
            </button>
          </div>
        </form>
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
          <strong>💡 Auto-link:</strong> When you save a utility reading, the cost is automatically added to the tenant's monthly invoice.
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-foreground/10 shadow-brutal">
        <div className="p-6 border-b border-foreground/10">
          <h2 className="text-xl font-semibold text-foreground">Monthly Utility Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Electricity (kWh)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Water (m³)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Elec. Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Water Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {utilities.map((u: any) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">Room {u.room}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{u.electricity} kWh</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{u.water} m³</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{u.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">${u.electricityCost}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">${u.waterCost}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">${(parseFloat(u.electricityCost || 0) + parseFloat(u.waterCost || 0)).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {u.addedToInvoice ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />Added
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                        <XCircle className="w-3.5 h-3.5" />Not linked
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
