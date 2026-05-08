import { useState, useEffect } from "react";
import { Send, MessageSquare, Users, Megaphone, Clock, Bot, Reply } from "lucide-react";
import { api } from "../lib/api";

interface Announcement {
  id: string;
  title: string;
  message: string;
  recipients: string;
  type?: string;
  telegramChatId?: string;
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

  // Telegram reply modal
  const [replyModal, setReplyModal] = useState<{ open: boolean; chatId: string; name: string }>({ open: false, chatId: "", name: "" });
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);

  // Telegram broadcast modal
  const [tgBroadcastModal, setTgBroadcastModal] = useState(false);
  const [tgBroadcastMsg, setTgBroadcastMsg] = useState("");
  const [tgBroadcastSending, setTgBroadcastSending] = useState(false);

  const fetchData = async () => {
    try {
      const [notifRes, tenantsRes] = await Promise.all([
        api.getNotifications({ limit: "30" }),
        api.getTenants({ limit: "50" }),
      ]);
      const mapped = (notifRes.data || []).map((n: any) => {
        let meta: any = {};
        try { meta = JSON.parse(n.metadata || "{}"); } catch { }
        return {
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type,
          recipients: n.type === "broadcast" ? "All Tenants" : n.type === "telegram" ? "Telegram" : "System",
          telegramChatId: n.telegram_chat_id || meta?.chat_id || "",
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
        title, message,
        type: recipients === "all" ? "broadcast" : "targeted",
        recipients: recipients === "all" ? "All Tenants" : `Rooms: ${selectedRooms}`,
      });
      setSuccessMsg(`Announcement sent to ${recipients === "all" ? "all tenants" : `rooms ${selectedRooms}`} (${targetTenants.length} contacts)`);
      setTitle(""); setMessage(""); setSelectedRooms("");
      fetchData();
    } catch (err: any) { setErrorMsg(err.message || "Failed to send announcement"); }
    finally { setSending(false); }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setReplySending(true);
    try {
      await api.telegramBroadcast(replyText, replyModal.chatId);
      setReplyText("");
      setReplyModal({ open: false, chatId: "", name: "" });
      setSuccessMsg("Reply sent via Telegram!");
      fetchData();
    } catch (err: any) { setErrorMsg(err.message || "Failed to send reply"); }
    finally { setReplySending(false); }
  };

  const handleTgBroadcast = async () => {
    if (!tgBroadcastMsg.trim()) return;
    setTgBroadcastSending(true);
    try {
      await api.telegramBroadcast(tgBroadcastMsg);
      setTgBroadcastMsg("");
      setTgBroadcastModal(false);
      setSuccessMsg("Broadcast sent via Telegram!");
      fetchData();
    } catch (err: any) { setErrorMsg(err.message || "Failed: " + err.message); }
    finally { setTgBroadcastSending(false); }
  };

  const telegramMsgs = announcements.filter(a => a.type === "telegram");
  const broadcastCount = announcements.filter(a => a.type === "broadcast").length;
  const targetedCount = announcements.filter(a => a.type === "targeted").length;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Tenant Communications</h1>
          <p className="text-muted-foreground mt-1">Send announcements and updates to tenants</p>
        </div>
        <button onClick={() => setTgBroadcastModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors">
          <Bot className="w-4 h-4" /> Telegram Broadcast
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-2"><h3 className="text-sm text-muted-foreground">Total</h3><Megaphone className="w-5 h-5 text-blue-500" /></div>
          <div className="text-3xl font-bold text-foreground">{announcements.length}</div>
          <p className="text-xs text-muted-foreground mt-1">All messages</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-2"><h3 className="text-sm text-muted-foreground">Broadcast</h3><Users className="w-5 h-5 text-green-500" /></div>
          <div className="text-3xl font-bold text-foreground">{broadcastCount}</div>
          <p className="text-xs text-muted-foreground mt-1">To all tenants</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-2"><h3 className="text-sm text-muted-foreground">Targeted</h3><Send className="w-5 h-5 text-purple-500" /></div>
          <div className="text-3xl font-bold text-foreground">{targetedCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Specific rooms</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-blue-200 bg-blue-50/50 shadow-sm">
          <div className="flex items-center justify-between mb-2"><h3 className="text-sm text-blue-700">Telegram</h3><Bot className="w-5 h-5 text-blue-500" /></div>
          <div className="text-3xl font-bold text-blue-700">{telegramMsgs.length}</div>
          <p className="text-xs text-blue-600 mt-1">Incoming messages</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Announcement Form */}
        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="p-6 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">New Announcement</h2>
          </div>
          <div className="p-6 space-y-4">
            {successMsg && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">✅ {successMsg}</div>}
            {errorMsg && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{errorMsg}</div>}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Title</label>
              <input type="text" placeholder="e.g., Water Supply Interruption" value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Message</label>
              <textarea rows={4} placeholder="Enter your announcement message here..." value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Recipients</label>
              <select value={recipients} onChange={(e) => setRecipients(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="all">All Tenants</option>
                <option value="specific">Specific Rooms</option>
              </select>
            </div>
            {recipients === "specific" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Select Rooms</label>
                <div className="max-h-40 overflow-y-auto border border-border rounded-lg p-2 space-y-1">
                  {tenants.map((t: any) => (
                    <label key={t.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted/50 rounded cursor-pointer">
                      <input type="checkbox"
                        checked={selectedRooms.split(",").map(s => s.trim()).filter(Boolean).includes(String(t.room))}
                        onChange={(e) => {
                          const current = selectedRooms.split(",").map(s => s.trim()).filter(Boolean);
                          if (e.target.checked) setSelectedRooms([...current, String(t.room)].join(", "));
                          else setSelectedRooms(current.filter(r => r !== String(t.room)).join(", "));
                        }} className="rounded border-border" />
                      <span className="text-sm text-foreground">Room {t.room}</span>
                      <span className="text-xs text-muted-foreground">— {t.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <button onClick={handleSend} disabled={sending}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
              <Send className="w-4 h-4" />{sending ? "Sending..." : "Send Announcement"}
            </button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <MessageSquare className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span><strong>Multi-Channel Delivery</strong> — Stored in notifications and optionally sent via Telegram bot.</span>
            </div>
          </div>
        </div>

        {/* All Messages with Telegram tag */}
        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Recent Messages</h2>
            <p className="text-sm text-muted-foreground mt-1">All communications including Telegram</p>
          </div>
          <div className="divide-y divide-border max-h-[520px] overflow-y-auto">
            {announcements.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No messages yet</div>
            ) : (
              announcements.slice(0, 15).map((a) => (
                <div key={a.id} className={`p-4 hover:bg-muted/30 transition-colors ${a.type === 'telegram' ? 'border-l-2 border-l-blue-400' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold text-foreground text-sm truncate">{a.title}</h4>
                        {a.type === 'telegram' && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium shrink-0">
                            <Bot className="w-3 h-3" />Telegram
                          </span>
                        )}
                        {a.type === 'telegram_sent' && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium shrink-0">
                            <Send className="w-3 h-3" />Sent
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{a.message}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {a.createdAt ? new Date(a.createdAt).toLocaleString() : "Now"}
                        <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs">{a.recipients}</span>
                      </div>
                    </div>
                    {a.type === 'telegram' && a.telegramChatId && (
                      <button onClick={() => { setReplyModal({ open: true, chatId: a.telegramChatId!, name: a.title }); setReplyText(""); }}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-xs font-medium shrink-0 transition-colors">
                        <Reply className="w-3 h-3" />Reply
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      {replyModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-blue-500" />
              <h3 className="text-xl font-semibold text-foreground">Reply via Telegram</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Replying to: <strong>{replyModal.name}</strong></p>
            {errorMsg && <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{errorMsg}</div>}
            <textarea rows={4} value={replyText} onChange={e => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setReplyModal({ open: false, chatId: "", name: "" }); setErrorMsg(""); }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleReply} disabled={replySending}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors disabled:opacity-50">
                <Send className="w-4 h-4" />{replySending ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Telegram Broadcast Modal */}
      {tgBroadcastModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-5 h-5 text-blue-500" />
              <h3 className="text-xl font-semibold text-foreground">Telegram Broadcast</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Send a message to the configured Telegram chat.</p>
            {errorMsg && <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{errorMsg}</div>}
            <textarea rows={4} value={tgBroadcastMsg} onChange={e => setTgBroadcastMsg(e.target.value)}
              placeholder="Type your broadcast message..."
              className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setTgBroadcastModal(false); setTgBroadcastMsg(""); setErrorMsg(""); }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleTgBroadcast} disabled={tgBroadcastSending}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors disabled:opacity-50">
                <Bot className="w-4 h-4" />{tgBroadcastSending ? "Sending..." : "Send via Telegram"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
