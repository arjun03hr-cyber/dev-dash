import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Zap, LogIn, UserPlus, Eye, EyeOff, ArrowRight } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm, or sign in if email confirmation is disabled.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-neon-blue/[0.06] blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-neon-purple/[0.06] blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed top-[40%] left-[50%] w-[400px] h-[400px] bg-neon-cyan/[0.03] blur-[120px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md mx-4 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-neon flex items-center justify-center glow-blue mx-auto mb-4">
            <Zap className="h-7 w-7 text-foreground" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            <span className="text-gradient">DEV DASH 2K26</span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium tracking-wide">
            Evaluation Dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-strong rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/[0.03] to-neon-purple/[0.03]" />

          <div className="relative">
            <h2 className="text-lg font-semibold text-foreground mb-1">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-xs text-muted-foreground mb-6">
              {isSignUp
                ? "Sign up to view team evaluations"
                : "Sign in to continue to the dashboard"}
            </p>

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Email
                </label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-muted/50 border-border/50 focus:border-neon-blue/50 focus:ring-neon-blue/20 h-11"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-muted/50 border-border/50 focus:border-neon-blue/50 focus:ring-neon-blue/20 h-11 pr-10"
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-neon hover:opacity-90 transition-all glow-blue font-semibold h-11 text-sm"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    {isSignUp ? (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create Account
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </>
                    )}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {isSignUp ? (
                  <>Already have an account? <span className="text-neon-blue font-medium">Sign In</span></>
                ) : (
                  <>Don't have an account? <span className="text-neon-blue font-medium">Sign Up</span></>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Role hint */}
        <div className="mt-4 text-center">
          <p className="text-[10px] text-muted-foreground/50">
            Admins can score · Users can view
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
