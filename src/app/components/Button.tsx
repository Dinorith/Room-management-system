import { LucideIcon } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  icon?: LucideIcon;
}

export function Button({ 
  children, 
  variant = "primary", 
  icon: Icon, 
  className = "",
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-brutal-sm hover:-translate-y-0.5",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-brutal-sm hover:-translate-y-0.5",
    outline: "border-2 border-foreground text-foreground hover:bg-foreground hover:text-background",
    ghost: "text-foreground hover:bg-muted",
  };

  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap gap-2 px-5 py-2.5 rounded-2xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}
