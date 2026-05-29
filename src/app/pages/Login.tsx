import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === "super_admin") {
        navigate("/super-admin");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative">
      {/* Decorative shapes */}
      <div className="absolute top-16 left-16 hidden h-20 w-20 rotate-12 rounded-3xl bg-primary md:block" />
      <div className="absolute bottom-20 right-20 hidden h-14 w-14 rotate-45 bg-secondary md:block" />
      <div className="absolute top-1/3 right-1/4 hidden h-8 w-8 rounded-full bg-primary/30 md:block" />



      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl border border-foreground/10 bg-card p-8 shadow-brutal">
          {/* Logo / Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary mb-4">
              <span className="block h-6 w-6 rounded-md bg-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">RentFlow</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to manage your properties</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm text-center font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-foreground/15 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground transition-all"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-foreground/15 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground transition-all"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground py-4 text-base font-medium text-background transition-all hover:bg-foreground/90 shadow-brutal-sm hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-5 w-5 rounded-md bg-background/30 animate-pulse" />
                  Signing in...
                </span>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
}
