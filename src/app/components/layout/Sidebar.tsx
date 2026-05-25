import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Building2,
  Users,
  DollarSign,
  Zap,
  Settings,
  Wrench,
  TrendingDown,
  FileCheck,
  BarChart3,
  CalendarDays,
  MessageSquare,
  LogOut
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Building2, label: "Rooms", path: "/rooms" },
  { icon: Users, label: "Tenants", path: "/tenants" },
  { icon: FileCheck, label: "Contracts", path: "/contracts" },
  { icon: DollarSign, label: "Payments", path: "/payments" },
  { icon: Wrench, label: "Maintenance", path: "/maintenance" },
  { icon: TrendingDown, label: "Expenses", path: "/expenses" },
  { icon: Zap, label: "Utilities", path: "/utilities" },
  { icon: BarChart3, label: "Reports", path: "/reports" },
  { icon: CalendarDays, label: "Calendar", path: "/calendar" },
  { icon: MessageSquare, label: "Communications", path: "/communications" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-sidebar h-screen sticky top-0 flex flex-col border-r border-solid border-sidebar-border" style={{ borderStyle: 'solid' }}>
      {/* Logo */}
      <div className="p-6 border-b border-solid border-sidebar-border">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary">
            <span className="block h-4 w-4 rounded-sm bg-sidebar-foreground" />
          </span>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-sidebar-foreground">RentFlow</h1>
            <p className="text-xs text-sidebar-foreground/50">Room Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-brutal-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-solid border-sidebar-border">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
