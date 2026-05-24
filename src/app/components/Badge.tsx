interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "default";
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  const variants = {
    success: "bg-primary/20 text-primary-foreground border-primary/30",
    warning: "bg-orange-100 text-orange-800 border-orange-300",
    danger: "bg-red-100 text-red-800 border-red-300",
    info: "bg-primary/20 text-primary-foreground border-primary/30",
    default: "bg-muted text-muted-foreground border-foreground/10",
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${variants[variant]}`}>
      {children}
    </span>
  );
}
