import { Save, User, Zap, CreditCard, LogOut, AlertTriangle, MessageCircle, CheckCircle2, Send, Home, Plus, Edit2, Trash2, X, DollarSign, Clock } from "lucide-react";
import { Button } from "../components/Button";
import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import RoomTypeService from "../services/RoomTypeService";

export function Settings() {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState<any>(null);
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [rates, setRates] = useState({ electricityRate: "0.20", waterRate: "0.50" });
  const [lateFee, setLateFee] = useState({ amount: "0", type: "fixed", gracePeriodDays: "5", invoiceDueDay: "1" });
  const [telegram, setTelegram] = useState({ botToken: "", chatId: "", webhookUrl: "" });
  const [telegramConfigured, setTelegramConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [roomTypesLoading, setRoomTypesLoading] = useState(false);
  const [showRoomTypeForm, setShowRoomTypeForm] = useState(false);
  const [editingRoomTypeId, setEditingRoomTypeId] = useState<string | null>(null);
  const [roomTypeForm, setRoomTypeForm] = useState({
    name: "",
    basePrice: "",
    capacity: "",
    description: "",
    status: true,
  });
  const [roomTypeErrors, setRoomTypeErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, ratesRes, roomTypesRes] = await Promise.all([
          api.getSettings(),
          api.getUtilityRates(),
          RoomTypeService.getAll({ limit: 100 }),
        ]);
        if (settingsRes?.data) {
          setSettings(settingsRes.data);
          if (settingsRes.data.lateFee) {
            setLateFee({
              amount: String(settingsRes.data.lateFee.amount || 0),
              type: settingsRes.data.lateFee.type || 'fixed',
              gracePeriodDays: String(settingsRes.data.lateFee.gracePeriodDays || 5),
              invoiceDueDay: String(settingsRes.data.invoiceDueDay || 1),
            });
          }
          setTelegram({
            botToken: settingsRes.data.telegramBotToken || "",
            chatId: settingsRes.data.telegramChatId || "",
            webhookUrl: "",
          });
          setTelegramConfigured(!!settingsRes.data.telegramBotToken);
        }
        if (ratesRes?.data) {
          setRates({
            electricityRate: String(ratesRes.data.electricityRate || 0.20),
            waterRate: String(ratesRes.data.waterRate || 0.50),
          });
        }
        if (roomTypesRes?.data) {
          const roomTypesData = Array.isArray(roomTypesRes.data) ? roomTypesRes.data : roomTypesRes.data.data || [];
          setRoomTypes(roomTypesData);
        }
        if (user) {
          setProfile({ name: user.name || "", email: user.email || "" });
        }
      } catch (err) { console.error("Error fetching data:", err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving("profile");
    setMessage("");
    try {
      await api.updateProfile(profile);
      setMessage("Profile saved successfully!");
    } catch (err: any) { setMessage("Failed: " + (err.message || "Error")); }
    finally { setSaving(""); }
  };

  const handleSaveRates = async () => {
    setSaving("rates");
    setMessage("");
    try {
      await api.updateUtilityRates({
        electricityRate: parseFloat(rates.electricityRate),
        waterRate: parseFloat(rates.waterRate),
      });
      setMessage("Utility rates saved successfully!");
    } catch (err: any) { setMessage("Failed: " + (err.message || "Error")); }
    finally { setSaving(""); }
  };

  const handleSaveSettings = async () => {
    setSaving("settings");
    setMessage("");
    try {
      await api.updateSettings(settings);
      setMessage("Settings saved successfully!");
    } catch (err: any) { setMessage("Failed: " + (err.message || "Error")); }
    finally { setSaving(""); }
  };

  const handleSaveLateFee = async () => {
    setSaving("latefee");
    setMessage("");
    try {
      await api.updateSettings({
        lateFeeAmount: parseFloat(lateFee.amount),
        lateFeeType: lateFee.type,
        gracePeriodDays: parseInt(lateFee.gracePeriodDays),
        invoiceDueDay: parseInt(lateFee.invoiceDueDay),
      });
      setMessage("Late fee settings saved!");
    } catch (err: any) { setMessage("Failed: " + (err.message || "Error")); }
    finally { setSaving(""); }
  };

  const handleSaveTelegram = async () => {
    setSaving("telegram");
    setMessage("");
    try {
      await api.updateSettings({
        telegramBotToken: telegram.botToken,
        telegramChatId: telegram.chatId,
      });
      setTelegramConfigured(!!telegram.botToken);
      setMessage("Telegram settings saved!");
    } catch (err: any) { setMessage("Failed: " + (err.message || "Error")); }
    finally { setSaving(""); }
  };

  const handleRegisterWebhook = async () => {
    if (!telegram.webhookUrl) { setMessage("Please enter a webhook URL first."); return; }
    setSaving("webhook");
    setMessage("");
    try {
      const res = await api.telegramRegisterWebhook(telegram.webhookUrl);
      setMessage(res.message || "Webhook registered!");
    } catch (err: any) { setMessage("Failed: " + (err.message || "Error")); }
    finally { setSaving(""); }
  };

  const handleTestTelegram = async () => {
    setSaving("tgtest");
    setMessage("");
    try {
      const res = await api.telegramTest();
      setMessage(res.message || "Test message sent!");
    } catch (err: any) { setMessage("Failed: " + (err.message || "Error")); }
    finally { setSaving(""); }
  };

  const validateRoomTypeForm = () => {
    const errors: Record<string, string> = {};
    if (!roomTypeForm.name.trim()) errors.name = "Room type name is required";
    if (!roomTypeForm.basePrice || parseFloat(roomTypeForm.basePrice) < 0) errors.basePrice = "Valid price is required";
    if (!roomTypeForm.capacity || parseInt(roomTypeForm.capacity) < 1 || parseInt(roomTypeForm.capacity) > 20) errors.capacity = "Capacity must be 1-20";
    setRoomTypeErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddRoomType = () => {
    setEditingRoomTypeId(null);
    setRoomTypeForm({ name: "", basePrice: "", capacity: "", description: "", status: true });
    setRoomTypeErrors({});
    setShowRoomTypeForm(true);
  };

  const handleEditRoomType = (roomType: any) => {
    setEditingRoomTypeId(roomType.id);
    setRoomTypeForm({
      name: roomType.name,
      basePrice: String(roomType.base_price),
      capacity: String(roomType.capacity),
      description: roomType.description || "",
      status: roomType.status,
    });
    setRoomTypeErrors({});
    setShowRoomTypeForm(true);
  };

  const handleSaveRoomType = async () => {
    if (!validateRoomTypeForm()) return;
    setSaving("roomtype");
    setMessage("");
    try {
      const data = {
        name: roomTypeForm.name,
        base_price: parseFloat(roomTypeForm.basePrice),
        capacity: parseInt(roomTypeForm.capacity),
        description: roomTypeForm.description,
        status: roomTypeForm.status,
      };
      if (editingRoomTypeId) {
        await RoomTypeService.update(editingRoomTypeId, data);
        setMessage("Room type updated successfully!");
      } else {
        await RoomTypeService.create(data);
        setMessage("Room type created successfully!");
      }
      setShowRoomTypeForm(false);
      setRoomTypeForm({ name: "", basePrice: "", capacity: "", description: "", status: true });
      setEditingRoomTypeId(null);
      
      // Refresh room types list
      const res = await RoomTypeService.getAll({ limit: 100 });
      if (res?.data) {
        const roomTypesData = Array.isArray(res.data) ? res.data : res.data.data || [];
        setRoomTypes(roomTypesData);
      }
    } catch (err: any) {
      console.error("Error saving room type:", err);
      setMessage("Failed: " + (err.message || "Unknown error"));
    } finally {
      setSaving("");
    }
  };

  const handleDeleteRoomType = async (id: string) => {
    if (!confirm("Are you sure you want to delete this room type?")) return;
    setSaving(`delete-${id}`);
    setMessage("");
    try {
      await RoomTypeService.delete(id);
      setMessage("Room type deleted successfully!");
      setRoomTypes(roomTypes.filter(rt => rt.id !== id));
    } catch (err: any) {
      console.error("Error deleting room type:", err);
      setMessage("Failed: " + (err.message || "Error"));
    } finally {
      setSaving("");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="h-10 w-10 rounded-xl bg-primary animate-pulse" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.includes("Failed") ? "bg-red-50 border border-red-200 text-red-600" : "bg-green-50 border border-green-200 text-green-600"}`}>
          {message}
        </div>
      )}

      {/* Owner Profile */}
      <div className="bg-card rounded-3xl border border-foreground/10 shadow-brutal">
        <div className="p-6 border-b border-foreground/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Owner Profile</h2>
            <p className="text-sm text-muted-foreground">Your personal information</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Full Name</label>
              <input type="text" value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Email Address</label>
              <input type="email" value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button icon={Save} variant="primary" onClick={handleSaveProfile}>
              {saving === "profile" ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </div>
      </div>

      {/* Property Settings */}
      {settings && (
        <div className="bg-card rounded-3xl border border-foreground/10 shadow-brutal">
          <div className="p-6 border-b border-foreground/10 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Property Settings</h2>
              <p className="text-sm text-muted-foreground">Your property details</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Property Name</label>
                <input type="text" value={settings.propertyName || ""}
                  onChange={(e) => setSettings({ ...settings, propertyName: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Phone</label>
                <input type="tel" value={settings.phone || ""}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Address</label>
              <textarea rows={2} value={settings.address || ""}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Currency</label>
                <div className="w-full px-4 py-2 border border-border rounded-lg bg-muted/50 text-foreground text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary shrink-0" /> USD ($) — US Dollar
                  <span className="ml-auto text-[10px] text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Fixed</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Timezone</label>
                <div className="w-full px-4 py-2 border border-border rounded-lg bg-muted/50 text-foreground text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary shrink-0" /> Asia/Phnom_Penh (GMT+7)
                  <span className="ml-auto text-[10px] text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Fixed</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button icon={Save} variant="primary" onClick={handleSaveSettings}>
                {saving === "settings" ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Utility Rate Settings */}
      <div className="bg-card rounded-3xl border border-foreground/10 shadow-brutal">
        <div className="p-6 border-b border-foreground/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Utility Rate Settings</h2>
            <p className="text-sm text-muted-foreground">Price per unit for utilities</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Electricity ($ per kWh)</label>
              <input type="number" step="0.01" value={rates.electricityRate}
                onChange={(e) => setRates({ ...rates, electricityRate: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Water ($ per m³)</label>
              <input type="number" step="0.01" value={rates.waterRate}
                onChange={(e) => setRates({ ...rates, waterRate: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button icon={Save} variant="primary" onClick={handleSaveRates}>
              {saving === "rates" ? "Saving..." : "Save Utility Rates"}
            </Button>
          </div>
        </div>
      </div>

      {/* Late Fee & Invoice Settings */}
      <div className="bg-card rounded-3xl border border-foreground/10 shadow-brutal">
        <div className="p-6 border-b border-foreground/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Late Fee & Invoice Settings</h2>
            <p className="text-sm text-muted-foreground">Configure automatic late fees and invoice generation</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Late Fee Amount</label>
              <input type="number" step="0.01" min="0" value={lateFee.amount}
                onChange={(e) => setLateFee({ ...lateFee, amount: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Fee Type</label>
              <select value={lateFee.type}
                onChange={(e) => setLateFee({ ...lateFee, type: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="fixed">Fixed Amount ($)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Grace Period (days after due date)</label>
              <input type="number" min="0" max="30" value={lateFee.gracePeriodDays}
                onChange={(e) => setLateFee({ ...lateFee, gracePeriodDays: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Invoice Due Day (day of month)</label>
              <input type="number" min="1" max="28" value={lateFee.invoiceDueDay}
                onChange={(e) => setLateFee({ ...lateFee, invoiceDueDay: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
            <strong>How it works:</strong> Payments not made by the due date will be marked overdue. After the grace period, a late fee of{' '}
            {lateFee.type === 'fixed' ? `$${lateFee.amount}` : `${lateFee.amount}%`} will be automatically applied.
            Monthly invoices are generated on the 1st with rent due on day {lateFee.invoiceDueDay}.
          </div>
          <div className="flex justify-end">
            <Button icon={Save} variant="primary" onClick={handleSaveLateFee}>
              {saving === "latefee" ? "Saving..." : "Save Late Fee Settings"}
            </Button>
          </div>
        </div>
      </div>



      {/* Room Types Management */}
      <div className="bg-card rounded-3xl border border-foreground/10 shadow-brutal">
        <div className="p-6 border-b border-foreground/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Room Types</h2>
              <p className="text-sm text-muted-foreground">Manage room types and pricing</p>
            </div>
          </div>
          <button
            onClick={handleAddRoomType}
            disabled={saving.startsWith("roomtype") || saving.startsWith("delete")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50">
            <Plus className="w-4 h-4" /> Add Room Type
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Room Type Form */}
          {showRoomTypeForm && (
            <div className="p-4 bg-muted/50 rounded-lg border border-foreground/10 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-foreground">{editingRoomTypeId ? "Edit" : "Create"} Room Type</h3>
                <button
                  onClick={() => setShowRoomTypeForm(false)}
                  className="p-1 hover:bg-foreground/10 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Room Type Name</label>
                  <input
                    type="text"
                    value={roomTypeForm.name}
                    onChange={(e) => { setRoomTypeForm({ ...roomTypeForm, name: e.target.value }); if (roomTypeErrors.name) setRoomTypeErrors({ ...roomTypeErrors, name: "" }); }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${roomTypeErrors.name ? "border-red-500" : "border-border"}`}
                    placeholder="e.g., Studio, 1-Bedroom" />
                  {roomTypeErrors.name && <p className="text-xs text-red-600 mt-1">{roomTypeErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Base Monthly Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={roomTypeForm.basePrice}
                    onChange={(e) => { setRoomTypeForm({ ...roomTypeForm, basePrice: e.target.value }); if (roomTypeErrors.basePrice) setRoomTypeErrors({ ...roomTypeErrors, basePrice: "" }); }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${roomTypeErrors.basePrice ? "border-red-500" : "border-border"}`}
                    placeholder="e.g., 500.00" />
                  {roomTypeErrors.basePrice && <p className="text-xs text-red-600 mt-1">{roomTypeErrors.basePrice}</p>}
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Capacity (1-20)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={roomTypeForm.capacity}
                    onChange={(e) => { setRoomTypeForm({ ...roomTypeForm, capacity: e.target.value }); if (roomTypeErrors.capacity) setRoomTypeErrors({ ...roomTypeErrors, capacity: "" }); }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${roomTypeErrors.capacity ? "border-red-500" : "border-border"}`}
                    placeholder="e.g., 2" />
                  {roomTypeErrors.capacity && <p className="text-xs text-red-600 mt-1">{roomTypeErrors.capacity}</p>}
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Status</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roomTypeForm.status}
                      onChange={(e) => setRoomTypeForm({ ...roomTypeForm, status: e.target.checked })}
                      className="w-4 h-4 rounded border-border cursor-pointer" />
                    <span className="text-sm text-foreground">Active</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Description (Optional)</label>
                <textarea
                  value={roomTypeForm.description}
                  onChange={(e) => setRoomTypeForm({ ...roomTypeForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="e.g., Studio apartment with kitchenette" />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowRoomTypeForm(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted font-medium transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSaveRoomType}
                  disabled={saving === "roomtype"}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving === "roomtype" ? "Saving..." : "Save Room Type"}
                </button>
              </div>
            </div>
          )}

          {/* Room Types List */}
          {roomTypes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-foreground/10">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Base Price</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Capacity</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roomTypes.map((rt: any) => (
                    <tr key={rt.id} className="border-b border-foreground/5 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">{rt.name}</td>
                      <td className="py-3 px-4 text-foreground">${parseFloat(rt.base_price).toFixed(2)}</td>
                      <td className="py-3 px-4 text-foreground">{rt.capacity} person{rt.capacity > 1 ? "s" : ""}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${rt.status ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"}`}>
                          {rt.status ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        <button
                          onClick={() => handleEditRoomType(rt)}
                          disabled={saving.startsWith("delete") || saving === "roomtype"}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50" title="Edit">
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoomType(rt.id)}
                          disabled={saving.startsWith("delete") || saving === "roomtype"}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" title="Delete">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : !showRoomTypeForm ? (
            <div className="text-center py-8 text-muted-foreground">
              <Home className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>No room types yet. Click "Add Room Type" to create one.</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Logout */}
      <div className="bg-card rounded-xl border border-red-200 shadow-sm">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Sign Out</h2>
            <p className="text-sm text-muted-foreground">Log out of your account</p>
          </div>
          <button onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 font-medium transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
