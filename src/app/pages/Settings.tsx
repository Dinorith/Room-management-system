import { Save, User, Zap, CreditCard, LogOut, AlertTriangle, MessageCircle, CheckCircle2, Send } from "lucide-react";
import { Button } from "../components/Button";
import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, ratesRes] = await Promise.all([
          api.getSettings(),
          api.getUtilityRates(),
        ]);
        if (settingsRes.data) {
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
        if (ratesRes.data) {
          setRates({
            electricityRate: String(ratesRes.data.electricityRate || 0.20),
            waterRate: String(ratesRes.data.waterRate || 0.50),
          });
        }
        if (user) {
          setProfile({ name: user.name || "", email: user.email || "" });
        }
      } catch (err) { console.error(err); }
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
                <select value={settings.currency || "USD"}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="USD">USD</option><option value="KHR">KHR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Timezone</label>
                <input type="text" value={settings.timezone || ""}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
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

      {/* Telegram Bot Integration */}
      <div className="bg-card rounded-3xl border border-foreground/10 shadow-brutal">
        <div className="p-6 border-b border-foreground/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-foreground">Telegram Bot Integration</h2>
              {telegramConfigured && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                  <CheckCircle2 className="w-3 h-3" />Connected
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Send announcements and receive messages via Telegram</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-3 bg-primary/10 border border-foreground/10 rounded-lg text-xs text-foreground space-y-1">
            <p><strong>How to set up:</strong></p>
            <p>1. Open Telegram → search <strong>@BotFather</strong> → send <code>/newbot</code> → copy the token</p>
            <p>2. Paste the token below and click <strong>Save Telegram Settings</strong></p>
            <p>3. Send any message to your bot — the Chat ID will be auto-saved</p>
            <p>4. Optionally, enter your public HTTPS URL and click <strong>Register Webhook</strong></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Bot Token</label>
              <input type="text" placeholder="123456789:ABC-DEF…"
                value={telegram.botToken}
                onChange={(e) => setTelegram({ ...telegram, botToken: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Chat ID <span className="text-xs">(auto-filled when bot receives a message)</span></label>
              <input type="text" placeholder="e.g. 123456789"
                value={telegram.chatId}
                onChange={(e) => setTelegram({ ...telegram, chatId: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={handleSaveTelegram} disabled={saving === "telegram"}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" />{saving === "telegram" ? "Saving…" : "Save Telegram Settings"}
            </button>
            {telegramConfigured && (
              <button onClick={handleTestTelegram} disabled={saving === "tgtest"}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50">
                <Send className="w-4 h-4" />{saving === "tgtest" ? "Sending…" : "Send Test Message"}
              </button>
            )}
          </div>

          <div className="border-t border-border pt-4">
            <label className="block text-sm text-muted-foreground mb-2">Webhook URL <span className="text-xs">(your public HTTPS server URL)</span></label>
            <div className="flex gap-2">
              <input type="url" placeholder="https://your-domain.com/api/telegram/webhook"
                value={telegram.webhookUrl}
                onChange={(e) => setTelegram({ ...telegram, webhookUrl: e.target.value })}
                className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
              <button onClick={handleRegisterWebhook} disabled={saving === "webhook"}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/90 font-medium transition-colors whitespace-nowrap disabled:opacity-50">
                {saving === "webhook" ? "Registering…" : "Register Webhook"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">For local testing, use <strong>ngrok</strong>: <code>ngrok http 8000</code></p>
          </div>
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
