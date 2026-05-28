import { useState, useEffect } from "react";
import { 
  Settings, ShieldAlert, Save, RefreshCw, CheckCircle, DollarSign, Clock
} from "lucide-react";
import { Button } from "../components/Button";
import { api } from "../lib/api";

export function SuperAdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState({
    propertyName: "RentFlow Platform",
    address: "Suite 500, 100 Innovation Way, Tech District",
    phone: "+1 (555) 000-0000",
    email: "admin@rentflow-pms.com",
    currency: "USD",
    timezone: "UTC",
    theme: "dark",
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.getSuperAdminSettings();
      const s = res.data;
      setSettings({
        propertyName: s.property_name || "RentFlow Platform",
        address: s.address || "",
        phone: s.phone || "",
        email: s.email || "",
        currency: s.currency || "USD",
        timezone: s.timezone || "UTC",
        theme: s.theme || "dark",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await api.updateSuperAdminSettings(settings);
      setMessage("General platform settings saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-muted-foreground font-semibold">Loading platform settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
          System Settings
        </h1>
        <p className="text-muted-foreground mt-1">Configure RentFlow general platform defaults and configuration</p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl flex items-center gap-2 text-sm font-bold">
          <CheckCircle className="w-5 h-5" />
          <span>{message}</span>
        </div>
      )}

      <div className="bg-card rounded-3xl border border-foreground/10 p-6 shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 border-b border-foreground/5 pb-3">
            <ShieldAlert className="w-4 h-4 text-primary" /> Platform Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs text-muted-foreground uppercase font-black tracking-wider block mb-1">Platform Name</label>
              <input 
                type="text"
                value={settings.propertyName}
                onChange={(e) => setSettings({ ...settings, propertyName: e.target.value })}
                className="w-full px-3.5 py-2 border border-border rounded-xl bg-background text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase font-black tracking-wider block mb-1">System email</label>
              <input 
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3.5 py-2 border border-border rounded-xl bg-background text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase font-black tracking-wider block mb-1">System phone</label>
              <input 
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3.5 py-2 border border-border rounded-xl bg-background text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase font-black tracking-wider block mb-1">Platform HQ Address</label>
              <input 
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3.5 py-2 border border-border rounded-xl bg-background text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase font-black tracking-wider block mb-1">Default Currency</label>
              <div className="w-full px-3.5 py-2 border border-border rounded-xl bg-muted/50 text-foreground text-sm font-semibold flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary shrink-0" /> USD ($) — US Dollar
                <span className="ml-auto text-[10px] text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">System Default</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase font-black tracking-wider block mb-1">Default Timezone</label>
              <div className="w-full px-3.5 py-2 border border-border rounded-xl bg-muted/50 text-foreground text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary shrink-0" /> Asia/Phnom_Penh (GMT+7)
                <span className="ml-auto text-[10px] text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">System Default</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-foreground/5">
            <Button
              type="submit"
              variant="primary"
              icon={Save}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
