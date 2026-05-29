import { Save, User, Zap, CreditCard, LogOut, AlertTriangle, MessageCircle, CheckCircle2, Send, Home, Plus, Edit2, Trash2, X, DollarSign, Clock, Upload, Image, Wallet } from "lucide-react";
import { Button } from "../components/Button";
import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import RoomTypeService from "../services/RoomTypeService";

const formatQrCodeUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("/storage")) return url;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      return parsed.pathname;
    }
  } catch (e) {}
  return url;
};


export function Settings() {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState<any>(null);
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [rates, setRates] = useState({ electricityRate: "0.20", waterRate: "0.50" });
  const [lateFee, setLateFee] = useState({ amount: "0", type: "fixed", gracePeriodDays: "5", invoiceDueDay: "1" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [roomTypesLoading, setRoomTypesLoading] = useState(false);
  const [showRoomTypeForm, setShowRoomTypeForm] = useState(false);
  const [editingRoomTypeId, setEditingRoomTypeId] = useState<string | null>(null);
  const [roomTypeForm, setRoomTypeForm] = useState({
    name: "",
    billingCycle: "monthly" as "daily" | "monthly" | "both",
    basePrice: "",
    baseDailyPrice: "",
    capacity: "",
    description: "",
    status: true,
  });
  const [roomTypeErrors, setRoomTypeErrors] = useState<Record<string, string>>({});

  const [paymentOptions, setPaymentOptions] = useState<any[]>([]);
  const [showPaymentOptionForm, setShowPaymentOptionForm] = useState(false);
  const [editingPaymentOptionId, setEditingPaymentOptionId] = useState<string | null>(null);
  const [paymentOptionForm, setPaymentOptionForm] = useState({
    payment_type: "static_qr" as "static_qr" | "bank_transfer" | "cash",
    payment_method_name: "",
    bank_name: "",
    account_name: "",
    account_number: "",
    currency: "USD",
    qr_code: "",
    remark: "",
    is_active: true,
  });
  const [paymentOptionErrors, setPaymentOptionErrors] = useState<Record<string, string>>({});
  const [uploadingQr, setUploadingQr] = useState(false);

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
        try {
          const paymentOptionsRes = await api.getPaymentOptions();
          if (paymentOptionsRes?.data) {
            setPaymentOptions(paymentOptionsRes.data);
          }
        } catch (err) { console.error("Error fetching payment options:", err); }
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


  const validateRoomTypeForm = () => {
    const errors: Record<string, string> = {};
    if (!roomTypeForm.name.trim()) errors.name = "Room type name is required";
    
    if (roomTypeForm.billingCycle === "monthly") {
      if (!roomTypeForm.basePrice || parseFloat(roomTypeForm.basePrice) < 0) {
        errors.basePrice = "Valid monthly price is required";
      }
    }
    
    if (roomTypeForm.billingCycle === "daily") {
      if (!roomTypeForm.baseDailyPrice || parseFloat(roomTypeForm.baseDailyPrice) < 0) {
        errors.baseDailyPrice = "Valid daily price is required";
      }
    }

    if (!roomTypeForm.capacity || parseInt(roomTypeForm.capacity) < 1 || parseInt(roomTypeForm.capacity) > 20) {
      errors.capacity = "Capacity must be 1-20";
    }
    
    setRoomTypeErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddRoomType = () => {
    setEditingRoomTypeId(null);
    setRoomTypeForm({ name: "", billingCycle: "monthly", basePrice: "", baseDailyPrice: "", capacity: "", description: "", status: true });
    setRoomTypeErrors({});
    setShowRoomTypeForm(true);
  };

  const handleEditRoomType = (roomType: any) => {
    setEditingRoomTypeId(roomType.id);
    setRoomTypeForm({
      name: roomType.name,
      billingCycle: roomType.billing_cycle || "monthly",
      basePrice: String(roomType.base_price || ""),
      baseDailyPrice: String(roomType.base_daily_price || ""),
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
        billing_cycle: roomTypeForm.billingCycle,
        base_price: roomTypeForm.billingCycle === "monthly" 
          ? parseFloat(roomTypeForm.basePrice) 
          : 0,
        base_daily_price: roomTypeForm.billingCycle === "daily" 
          ? parseFloat(roomTypeForm.baseDailyPrice) 
          : 0,
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
      setRoomTypeForm({ name: "", billingCycle: "monthly", basePrice: "", baseDailyPrice: "", capacity: "", description: "", status: true });
      setEditingRoomTypeId(null);
      
      // Refresh room types list
      const res = await RoomTypeService.getAll({ limit: 100 });
      if (res?.data) {
        const roomTypesData = Array.isArray(res.data) ? res.data : res.data.data || [];
        setRoomTypes(roomTypesData);
      }
    } catch (err: any) {
      console.error("Error saving room type:", err);
      if (err.errors) {
        const errorMsgs = Object.values(err.errors).flat().join(", ");
        setMessage("Failed: " + (errorMsgs || err.message || "Unknown error"));
      } else {
        setMessage("Failed: " + (err.message || "Unknown error"));
      }
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

  const validatePaymentOptionForm = () => {
    const errors: Record<string, string> = {};
    if (!paymentOptionForm.payment_type) {
      errors.payment_type = "Payment type is required";
    }

    if (paymentOptionForm.payment_type === "static_qr") {
      if (!paymentOptionForm.bank_name?.trim()) errors.bank_name = "Bank name is required";
      if (!paymentOptionForm.account_name?.trim()) errors.account_name = "Account name is required";
      if (!paymentOptionForm.currency) errors.currency = "Currency is required";
      if (!paymentOptionForm.qr_code) errors.qr_code = "QR Code image is required";
    } else if (paymentOptionForm.payment_type === "bank_transfer") {
      if (!paymentOptionForm.bank_name?.trim()) errors.bank_name = "Bank name is required";
      if (!paymentOptionForm.account_name?.trim()) errors.account_name = "Account name is required";
      if (!paymentOptionForm.account_number?.trim()) errors.account_number = "Account number is required";
      if (!paymentOptionForm.currency) errors.currency = "Currency is required";
    } else if (paymentOptionForm.payment_type === "cash") {
      if (!paymentOptionForm.payment_method_name?.trim()) errors.payment_method_name = "Payment method name is required";
    }

    setPaymentOptionErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddPaymentOption = () => {
    setEditingPaymentOptionId(null);
    setPaymentOptionForm({
      payment_type: "static_qr",
      payment_method_name: "",
      bank_name: "",
      account_name: "",
      account_number: "",
      currency: "USD",
      qr_code: "",
      remark: "",
      is_active: true,
    });
    setPaymentOptionErrors({});
    setShowPaymentOptionForm(true);
  };

  const handleEditPaymentOption = (opt: any) => {
    setEditingPaymentOptionId(opt.id);
    setPaymentOptionForm({
      payment_type: opt.payment_type || "static_qr",
      payment_method_name: opt.payment_method_name || "",
      bank_name: opt.bank_name || "",
      account_name: opt.account_name || "",
      account_number: opt.account_number || "",
      currency: opt.currency || "USD",
      qr_code: opt.qr_code || "",
      remark: opt.remark || "",
      is_active: opt.is_active !== false,
    });
    setPaymentOptionErrors({});
    setShowPaymentOptionForm(true);
  };

  const handleSavePaymentOption = async () => {
    if (!validatePaymentOptionForm()) return;
    setSaving("paymentoption");
    setMessage("");
    try {
      const data = {
        payment_type: paymentOptionForm.payment_type,
        payment_method_name: paymentOptionForm.payment_type === "cash" ? paymentOptionForm.payment_method_name : null,
        bank_name: paymentOptionForm.payment_type !== "cash" ? paymentOptionForm.bank_name : null,
        account_name: paymentOptionForm.payment_type !== "cash" ? paymentOptionForm.account_name : null,
        account_number: paymentOptionForm.payment_type !== "cash" ? paymentOptionForm.account_number : null,
        currency: paymentOptionForm.payment_type !== "cash" ? paymentOptionForm.currency : "USD",
        qr_code: paymentOptionForm.payment_type === "static_qr" ? paymentOptionForm.qr_code : null,
        remark: paymentOptionForm.remark,
        is_active: paymentOptionForm.is_active,
      };

      if (editingPaymentOptionId) {
        await api.updatePaymentOption(editingPaymentOptionId, data);
        setMessage("Payment option updated successfully!");
      } else {
        await api.createPaymentOption(data);
        setMessage("Payment option created successfully!");
      }
      setShowPaymentOptionForm(false);
      
      // Refresh options
      const res = await api.getPaymentOptions();
      if (res?.data) {
        setPaymentOptions(res.data);
      }
    } catch (err: any) {
      console.error("Error saving payment option:", err);
      setMessage("Failed: " + (err.message || "Unknown error"));
    } finally {
      setSaving("");
    }
  };

  const handleDeletePaymentOption = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment option?")) return;
    setSaving(`delete-opt-${id}`);
    setMessage("");
    try {
      await api.deletePaymentOption(id);
      setMessage("Payment option deleted successfully!");
      setPaymentOptions(paymentOptions.filter(o => o.id !== id));
    } catch (err: any) {
      console.error("Error deleting payment option:", err);
      setMessage("Failed: " + (err.message || "Error"));
    } finally {
      setSaving("");
    }
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingQr(true);
    try {
      const res = await api.uploadFile(file);
      if (res?.data?.url) {
        setPaymentOptionForm(prev => ({ ...prev, qr_code: res.data.url }));
        if (paymentOptionErrors.qr_code) {
          setPaymentOptionErrors(prev => ({ ...prev, qr_code: "" }));
        }
      }
    } catch (err: any) {
      alert("Upload failed: " + (err.message || "Unknown error"));
    } finally {
      setUploadingQr(false);
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
            <strong>How it works:</strong> These automatic invoice generation and late fee rules apply exclusively to **monthly billing cycles (payment by month)**. Payments not made by the due date will be marked overdue. After the grace period, a late fee of{' '}
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
                  <label className="block text-sm text-muted-foreground mb-2">Billing Cycle</label>
                  <div className="flex border border-foreground/10 rounded-2xl p-1 bg-muted/20 gap-1 bg-background">
                    <button
                      type="button"
                      onClick={() => setRoomTypeForm({ ...roomTypeForm, billingCycle: "monthly" })}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                        roomTypeForm.billingCycle === "monthly"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      By Month
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoomTypeForm({ ...roomTypeForm, billingCycle: "daily" })}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                        roomTypeForm.billingCycle === "daily"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      By Day
                    </button>
                  </div>
                </div>
                {(roomTypeForm.billingCycle === "monthly" || roomTypeForm.billingCycle === "both") && (
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
                )}
                {(roomTypeForm.billingCycle === "daily" || roomTypeForm.billingCycle === "both") && (
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Base Daily Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={roomTypeForm.baseDailyPrice}
                      onChange={(e) => { setRoomTypeForm({ ...roomTypeForm, baseDailyPrice: e.target.value }); if (roomTypeErrors.baseDailyPrice) setRoomTypeErrors({ ...roomTypeErrors, baseDailyPrice: "" }); }}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${roomTypeErrors.baseDailyPrice ? "border-red-500" : "border-border"}`}
                      placeholder="e.g., 25.00" />
                    {roomTypeErrors.baseDailyPrice && <p className="text-xs text-red-600 mt-1">{roomTypeErrors.baseDailyPrice}</p>}
                  </div>
                )}
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
                  <label className="flex items-center gap-2 cursor-pointer mt-3">
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
                  <tr className="border-b border-foreground/10 text-xs">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Billing Cycles</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Monthly Rate</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Daily Rate</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Capacity</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roomTypes.map((rt: any) => (
                    <tr key={rt.id} className="border-b border-foreground/5 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-foreground">{rt.name}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md border font-black uppercase tracking-wider ${
                          rt.billing_cycle === 'both' 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : rt.billing_cycle === 'daily' 
                            ? 'bg-amber-50 text-amber-700 border-amber-200' 
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          {rt.billing_cycle === 'both' ? 'Daily & Monthly' : rt.billing_cycle === 'daily' ? 'Daily Only' : 'Monthly Only'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-foreground font-mono">
                        {(rt.billing_cycle === 'monthly' || rt.billing_cycle === 'both') 
                          ? `$${parseFloat(rt.base_price).toFixed(2)}` 
                          : '—'}
                      </td>
                      <td className="py-3 px-4 text-foreground font-mono">
                        {(rt.billing_cycle === 'daily' || rt.billing_cycle === 'both') 
                          ? `$${parseFloat(rt.base_daily_price).toFixed(2)}` 
                          : '—'}
                      </td>
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

      {/* Payment Options Management */}
      <div className="bg-card rounded-3xl border border-foreground/10 shadow-brutal">
        <div className="p-6 border-b border-foreground/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Payment Options</h2>
              <p className="text-sm text-muted-foreground">Configure payment methods for tenants during checkout</p>
            </div>
          </div>
          <button
            onClick={handleAddPaymentOption}
            disabled={saving.startsWith("paymentoption") || saving.startsWith("delete-opt")}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-all disabled:opacity-50 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Payment Option
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Payment Option Form */}
          {showPaymentOptionForm && (
            <div className="p-5 bg-muted/30 rounded-2xl border border-foreground/10 space-y-4 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-foreground">{editingPaymentOptionId ? "Edit" : "Create"} Payment Option</h3>
                <button
                  onClick={() => setShowPaymentOptionForm(false)}
                  className="p-1 hover:bg-foreground/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Payment Type *</label>
                  <select
                    value={paymentOptionForm.payment_type}
                    onChange={(e) => {
                      const type = e.target.value as any;
                      setPaymentOptionForm({
                        ...paymentOptionForm,
                        payment_type: type,
                        currency: "USD",
                        // Clear unrelated fields or pre-fill defaults
                        payment_method_name: type === "cash" ? "Cash" : "",
                        remark: type === "cash" ? "Please pay at the office reception." : "",
                      });
                      setPaymentOptionErrors({});
                    }}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="static_qr">Static QR Code</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>

                {/* Conditional Field: Payment Method Name (only for Cash) */}
                {paymentOptionForm.payment_type === "cash" && (
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Payment Method Name *</label>
                    <input
                      type="text"
                      value={paymentOptionForm.payment_method_name}
                      onChange={(e) => {
                        setPaymentOptionForm({ ...paymentOptionForm, payment_method_name: e.target.value });
                        if (paymentOptionErrors.payment_method_name) setPaymentOptionErrors({ ...paymentOptionErrors, payment_method_name: "" });
                      }}
                      placeholder="e.g., Cash at Reception"
                      className={`w-full px-4 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${paymentOptionErrors.payment_method_name ? "border-red-500" : "border-border"}`}
                    />
                    {paymentOptionErrors.payment_method_name && <p className="text-xs text-red-600 mt-1">{paymentOptionErrors.payment_method_name}</p>}
                  </div>
                )}

                {/* Conditional Field: Bank Name (only for Static QR / Bank Transfer) */}
                {paymentOptionForm.payment_type !== "cash" && (
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Bank Name *</label>
                    <input
                      type="text"
                      value={paymentOptionForm.bank_name}
                      onChange={(e) => {
                        setPaymentOptionForm({ ...paymentOptionForm, bank_name: e.target.value });
                        if (paymentOptionErrors.bank_name) setPaymentOptionErrors({ ...paymentOptionErrors, bank_name: "" });
                      }}
                      placeholder="e.g., ABA Bank, ACLEDA"
                      className={`w-full px-4 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${paymentOptionErrors.bank_name ? "border-red-500" : "border-border"}`}
                    />
                    {paymentOptionErrors.bank_name && <p className="text-xs text-red-600 mt-1">{paymentOptionErrors.bank_name}</p>}
                  </div>
                )}

                {/* Conditional Field: Account Name (only for Static QR / Bank Transfer) */}
                {paymentOptionForm.payment_type !== "cash" && (
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Account Name *</label>
                    <input
                      type="text"
                      value={paymentOptionForm.account_name}
                      onChange={(e) => {
                        setPaymentOptionForm({ ...paymentOptionForm, account_name: e.target.value });
                        if (paymentOptionErrors.account_name) setPaymentOptionErrors({ ...paymentOptionErrors, account_name: "" });
                      }}
                      placeholder="e.g., JOHN DOE"
                      className={`w-full px-4 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${paymentOptionErrors.account_name ? "border-red-500" : "border-border"}`}
                    />
                    {paymentOptionErrors.account_name && <p className="text-xs text-red-600 mt-1">{paymentOptionErrors.account_name}</p>}
                  </div>
                )}

                {/* Conditional Field: Account Number (Static QR is optional, Bank Transfer is required, Cash is hidden) */}
                {paymentOptionForm.payment_type !== "cash" && (
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Account Number {paymentOptionForm.payment_type === "static_qr" ? "(Optional)" : "*"}
                    </label>
                    <input
                      type="text"
                      value={paymentOptionForm.account_number}
                      onChange={(e) => {
                        setPaymentOptionForm({ ...paymentOptionForm, account_number: e.target.value });
                        if (paymentOptionErrors.account_number) setPaymentOptionErrors({ ...paymentOptionErrors, account_number: "" });
                      }}
                      placeholder="e.g., 000 123 456"
                      className={`w-full px-4 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${paymentOptionErrors.account_number ? "border-red-500" : "border-border"}`}
                    />
                    {paymentOptionErrors.account_number && <p className="text-xs text-red-600 mt-1">{paymentOptionErrors.account_number}</p>}
                  </div>
                )}

                {/* Conditional Field: Currency (only for Static QR / Bank Transfer) */}
                {paymentOptionForm.payment_type !== "cash" && (
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Currency *</label>
                    <div className="w-full px-4 py-2 border border-border rounded-lg bg-muted/50 text-foreground text-sm font-medium flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary shrink-0" /> USD ($) — US Dollar
                      <span className="ml-auto text-[10px] text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Fixed</span>
                    </div>
                  </div>
                )}

                {/* Status Switch */}
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Status</label>
                  <label className="flex items-center gap-2 cursor-pointer mt-3">
                    <input
                      type="checkbox"
                      checked={paymentOptionForm.is_active}
                      onChange={(e) => setPaymentOptionForm({ ...paymentOptionForm, is_active: e.target.checked })}
                      className="w-4 h-4 rounded border-border cursor-pointer bg-background"
                    />
                    <span className="text-sm text-foreground">Active (Visible to Tenants)</span>
                  </label>
                </div>
              </div>

              {/* Conditional Field: QR Code Image Upload (only for Static QR) */}
              {paymentOptionForm.payment_type === "static_qr" && (
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">QR Code Image *</label>
                  <div className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition-colors relative ${paymentOptionErrors.qr_code ? "border-red-500 bg-red-50/5" : "border-border bg-muted/10"}`}>
                    {paymentOptionForm.qr_code ? (
                      <div className="relative group w-32 h-32 flex items-center justify-center">
                        <img src={formatQrCodeUrl(paymentOptionForm.qr_code)} alt="QR Code Preview" className="max-h-full max-w-full object-contain rounded-lg shadow-md" />
                        <button
                          type="button"
                          onClick={() => setPaymentOptionForm(prev => ({ ...prev, qr_code: "" }))}
                          className="absolute -top-2 -right-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors shadow-sm"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center cursor-pointer space-y-2 w-full py-4">
                        {uploadingQr ? (
                          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        ) : (
                          <Upload className="w-8 h-8 text-muted-foreground" />
                        )}
                        <span className="text-sm font-semibold text-foreground">
                          {uploadingQr ? "Uploading..." : "Click to Upload QR Code Image"}
                        </span>
                        <span className="text-xs text-muted-foreground">PNG, JPG, JPEG up to 10MB</span>
                        <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                  {paymentOptionErrors.qr_code && <p className="text-xs text-red-600 mt-1">{paymentOptionErrors.qr_code}</p>}
                </div>
              )}

              {/* Instructions / Remark Textarea */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Remark / Instructions</label>
                <textarea
                  value={paymentOptionForm.remark}
                  onChange={(e) => setPaymentOptionForm({ ...paymentOptionForm, remark: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder={
                    paymentOptionForm.payment_type === "cash"
                      ? "e.g., Please pay at the office reception."
                      : "e.g., Please send a screenshot of the receipt via Telegram after transferring."
                  }
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-foreground/5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentOptionForm(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePaymentOption}
                  disabled={saving === "paymentoption" || uploadingQr}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/95 font-medium transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {saving === "paymentoption" ? "Saving..." : "Save Payment Option"}
                </button>
              </div>
            </div>
          )}

          {/* Payment Options Table/List */}
          {paymentOptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-foreground/10 text-xs">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Name/Details</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Bank/Account</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Currency</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentOptions.map((opt: any) => (
                    <tr key={opt.id} className="border-b border-foreground/5 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md border font-black uppercase tracking-wider ${
                          opt.payment_type === 'static_qr'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : opt.payment_type === 'bank_transfer'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {opt.payment_type === 'static_qr' ? 'Static QR' : opt.payment_type === 'bank_transfer' ? 'Bank Transfer' : 'Cash'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        {opt.payment_type === 'cash' ? opt.payment_method_name : opt.account_name}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {opt.payment_type !== 'cash' ? (
                          <div className="text-xs">
                            <span className="font-medium text-foreground">{opt.bank_name}</span>
                            {opt.account_number && <span className="block font-mono text-[10px]">{opt.account_number}</span>}
                          </div>
                        ) : '—'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-foreground">
                        {opt.payment_type !== 'cash' ? opt.currency : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${opt.is_active ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"}`}>
                          {opt.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        <button
                          onClick={() => handleEditPaymentOption(opt)}
                          disabled={saving.startsWith("delete") || saving === "paymentoption"}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDeletePaymentOption(opt.id)}
                          disabled={saving.startsWith("delete") || saving === "paymentoption"}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : !showPaymentOptionForm ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>No custom payment options configured yet. Click "Add Payment Option" to configure one.</p>
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
