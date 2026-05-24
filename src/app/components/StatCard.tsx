import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: "blue" | "green" | "orange" | "red";
}

export function StatCard({ title, value, icon: Icon, trend, trendUp, color = "blue" }: StatCardProps) {
  const colorClasses: Record<string, { card: string; icon: string }> = {
    blue: { card: "bg-card", icon: "bg-primary text-primary-foreground" },
    green: { card: "bg-primary", icon: "bg-secondary text-secondary-foreground" },
    orange: { card: "bg-card", icon: "bg-secondary text-secondary-foreground" },
    red: { card: "bg-secondary text-secondary-foreground", icon: "bg-primary text-primary-foreground" },
  };

  const styles = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`rounded-3xl border border-foreground/10 p-6 shadow-brutal transition hover:-translate-y-0.5 ${styles.card}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-current/70 mb-1 font-medium">{title}</p>
          <h3 className="text-2xl font-semibold mb-2">{value}</h3>
          {trend && (
            <p className={`text-xs font-medium ${trendUp ? "text-primary" : "text-destructive"}`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border border-foreground/10 ${styles.icon}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
