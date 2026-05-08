import { Bell, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-10">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Welcome back, {user?.name || "Owner"}
          </h2>
          <p className="text-sm text-muted-foreground">Manage your rental properties</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user?.name || "Admin"}</p>
              <p className="text-xs text-muted-foreground">Property Owner</p>
            </div>
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

