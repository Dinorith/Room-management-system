import { useState, useEffect } from "react";
import { 
  Send, Users, Megaphone, Clock, 
  Receipt, Sparkles
} from "lucide-react";
import { api } from "../lib/api";

interface Announcement {
  id: string;
  title: string;
  message: string;
  recipients: string;
  type?: string;
  createdAt: string;
}

export function Communications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipients, setRecipients] = useState("all");
  const [selectedRooms, setSelectedRooms] = useState("");
  const [sending, setSending] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [notifRes, tenantsRes] = await Promise.all([
        api.getNotifications({ limit: "100" }),
        api.getTenants({ limit: "100" }),
      ]);
      const mapped = (notifRes.data || []).map((n: any) => {
        return {
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type,
          recipients: n.type === "broadcast" ? "All Tenants" : n.type === "targeted" ? "Targeted Rooms" : n.type === "booking" ? "Booking Demo" : "System",
          createdAt: n.createdAt || n.created_at || "",
        };
      });
      setAnnouncements(mapped);
      setTenants(tenantsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) { setErrorMsg("Title and message are required"); return; }
    setSending(true); setErrorMsg(""); setSuccessMsg("");
    try {
      let targetTenants = tenants;
      if (recipients === "specific" && selectedRooms) {
        const rooms = selectedRooms.split(",").map((r) => r.trim());
        targetTenants = tenants.filter((t: any) => rooms.includes(String(t.room)));
      }
      await api.createAnnouncement({
        title,
        message,
        type: recipients === "all" ? "broadcast" : "targeted",
        recipients: recipients === "all" ? "All Tenants" : `Rooms: ${selectedRooms}`,
      });
      setSuccessMsg(`Announcement sent to ${recipients === "all" ? "all tenants" : `rooms ${selectedRooms}`} (${targetTenants.length} contacts)`);
      setTitle(""); setMessage(""); setSelectedRooms("");
      fetchData();
    } catch (err: any) { setErrorMsg(err.message || "Failed to send announcement"); }
    finally { setSending(false); }
  };

  const broadcastCount = announcements.filter(a => a.type === "broadcast").length;
  const targetedCount = announcements.filter(a => a.type === "targeted").length;
  const bookingCount = announcements.filter(a => a.type === "booking").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-10 w-10 rounded-xl bg-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Communications</h1>
        <p className="text-muted-foreground mt-1">Tenant dispatch announcements and public booking requests dashboard</p>
      </div>

      {/* Stats Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-3xl p-6 border border-foreground/10 shadow-brutal flex items-center justify-between">
          <div>
            <h3 className="text-sm text-muted-foreground font-semibold">Total Dispatched</h3>
            <div className="text-3xl font-black text-foreground mt-2">{broadcastCount + targetedCount}</div>
            <p className="text-xs text-muted-foreground mt-1.5">Broadcasted & targeted updates</p>
          </div>
          <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center"><Megaphone className="w-6 h-6" /></div>
        </div>
        
        <div className="bg-card rounded-3xl p-6 border border-foreground/10 shadow-brutal flex items-center justify-between">
          <div>
            <h3 className="text-sm text-muted-foreground font-semibold">Broadcast Alerts</h3>
            <div className="text-3xl font-black text-foreground mt-2">{broadcastCount}</div>
            <p className="text-xs text-muted-foreground mt-1.5">Dispatched to all active tenants</p>
          </div>
          <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center"><Users className="w-6 h-6" /></div>
        </div>

        <div className="bg-card rounded-3xl p-6 border border-foreground/10 shadow-brutal flex items-center justify-between">
          <div>
            <h3 className="text-sm text-muted-foreground font-semibold">Public Booking Demos</h3>
            <div className="text-3xl font-black text-foreground mt-2">{bookingCount}</div>
            <p className="text-xs text-muted-foreground mt-1.5">Incoming site contact forms</p>
          </div>
          <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center"><Sparkles className="w-6 h-6" /></div>
        </div>
      </div>

      {/* Form & List columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
        
        {/* New Announcement Form */}
        <div className="bg-card rounded-3xl border border-foreground/10 shadow-brutal">
          <div className="p-6 border-b border-foreground/10 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Create Dispatch</h2>
              <p className="text-xs text-muted-foreground">Broadcast updates or targeted warnings</p>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {successMsg && <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-xs font-semibold">✅ {successMsg}</div>}
            {errorMsg && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold">⚠️ {errorMsg}</div>}
            
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">Announcement Title</label>
              <input 
                type="text" 
                placeholder="e.g. Scheduled Water Supply Maintenance" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/30 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-medium text-foreground transition-all" 
              />
            </div>
            
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">Message Body</label>
              <textarea 
                rows={4} 
                placeholder="Provide details about the update..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/30 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-medium text-foreground transition-all" 
              />
            </div>
            
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">Recipient Scope</label>
              <select 
                value={recipients} 
                onChange={(e) => setRecipients(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-bold text-foreground transition-all"
              >
                <option value="all">Broadcast — All tenants</option>
                <option value="specific">Targeted — Specific Rooms</option>
              </select>
            </div>
            
            {recipients === "specific" && (
              <div className="space-y-2 animate-in slide-in-from-top-4 duration-150">
                <label className="block text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">Select Affected Rooms</label>
                <div className="max-h-40 overflow-y-auto border border-border rounded-xl p-2 space-y-1 bg-slate-50/30 shadow-inner">
                  {tenants.map((t: any) => (
                    <label key={t.id} className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors">
                      <input 
                        type="checkbox"
                        checked={selectedRooms.split(",").map(s => s.trim()).filter(Boolean).includes(String(t.room))}
                        onChange={(e) => {
                          const current = selectedRooms.split(",").map(s => s.trim()).filter(Boolean);
                          if (e.target.checked) setSelectedRooms([...current, String(t.room)].join(", "));
                          else setSelectedRooms(current.filter(r => r !== String(t.room)).join(", "));
                        }} 
                        className="rounded accent-primary w-4 h-4 cursor-pointer" 
                      />
                      <span className="text-sm font-bold text-foreground">Room {t.room}</span>
                      <span className="text-xs text-muted-foreground">— {t.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            <button 
              onClick={handleSend} 
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground rounded-full font-extrabold hover:bg-primary/95 transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer text-sm"
            >
              <Send className="w-4 h-4" />
              {sending ? "Broadcasting Alert..." : "Send Announcement"}
            </button>
          </div>
        </div>

        {/* Recent Stream */}
        <div className="bg-card rounded-3xl border border-foreground/10 shadow-brutal flex flex-col">
          <div className="p-6 border-b border-foreground/10 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Notifications & Activity</h2>
              <p className="text-xs text-muted-foreground">Chronological audit stream of announcements and updates</p>
            </div>
          </div>
          
          <div className="divide-y divide-foreground/5 overflow-y-auto max-h-[500px] flex-1">
            {announcements.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground italic font-semibold">No messages or alerts found</div>
            ) : (
              announcements.slice(0, 25).map((a) => (
                <div 
                  key={a.id} 
                  className={`p-5 hover:bg-muted/30 transition-colors flex items-start justify-between gap-4 border-l-4 ${
                    a.type === 'booking' 
                      ? 'border-l-purple-500 bg-purple-50/5'
                      : a.type === 'broadcast'
                        ? 'border-l-green-500'
                        : a.type === 'targeted'
                          ? 'border-l-blue-500'
                          : 'border-l-slate-300'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                      <h4 className="font-bold text-slate-800 text-sm truncate">{a.title}</h4>
                      {a.type === 'booking' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-[9px] font-extrabold tracking-wider uppercase shrink-0">
                          <Sparkles className="w-3.5 h-3.5" /> Booking Demo
                        </span>
                      )}
                      {a.type === 'broadcast' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-[9px] font-extrabold tracking-wider uppercase shrink-0">
                          <Users className="w-3 h-3" /> Broadcast
                        </span>
                      )}
                      {a.type === 'targeted' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[9px] font-extrabold tracking-wider uppercase shrink-0">
                          <Megaphone className="w-3 h-3" /> Targeted
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground leading-relaxed break-words">{a.message}</p>
                    
                    <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground font-semibold">
                      <Clock className="w-3 h-3" />
                      {a.createdAt ? new Date(a.createdAt).toLocaleString() : "Now"}
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-extrabold uppercase tracking-wide text-[9px]">{a.recipients}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
