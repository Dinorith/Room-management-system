import { Outlet, Navigate, Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  Building2,
  LogOut,
  Bell,
  User as UserIcon,
  ShieldAlert,
  FileText,
  CreditCard,
  TrendingUp,
  Activity,
  Settings
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function SuperAdminLayout() {
  const { isAuthenticated, isSuperAdmin, isLoading, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary animate-pulse" />
          <p className="text-sm text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/super-admin" },
    { icon: Users, label: "Owners", path: "/super-admin/owners" },
    { icon: Building2, label: "Properties", path: "/super-admin/properties" },
    { icon: FileText, label: "Invoices", path: "/super-admin/invoices" },
    { icon: CreditCard, label: "Payments", path: "/super-admin/payments" },
    { icon: TrendingUp, label: "Analytics", path: "/super-admin/analytics" },
    { icon: Activity, label: "Activity Logs", path: "/super-admin/activity-logs" },
    { icon: Settings, label: "Settings", path: "/super-admin/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Super Admin Sidebar */}
      <aside className="w-64 bg-sidebar h-screen sticky top-0 flex flex-col border-r border-solid border-sidebar-border">
        {/* Logo */}
        <div className="p-6 border-b border-solid border-sidebar-border">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-destructive text-destructive-foreground shadow-brutal-sm border border-solid border-foreground">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-sidebar-foreground">RentFlow</h1>
              <p className="text-xs text-destructive font-semibold uppercase tracking-wider">Super Admin</p>
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
                        ? "bg-foreground text-background shadow-brutal-sm border border-solid border-foreground"
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-foreground/10 sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground tracking-tight">
                Platform Console
              </h2>
              <p className="text-sm text-muted-foreground">Global oversight & administrative tools</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2.5 hover:bg-muted rounded-xl transition-colors border border-foreground/10">
                <Bell className="w-5 h-5 text-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
              </button>

              {/* Profile */}
              <div className="flex items-center gap-3 pl-4 border-l border-foreground/10">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{user?.name || "Super Admin"}</p>
                  <p className="text-xs text-destructive font-semibold">System Administrator</p>
                </div>
                <div className="w-10 h-10 bg-destructive text-destructive-foreground rounded-xl flex items-center justify-center border border-solid border-foreground">
                  <UserIcon className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
