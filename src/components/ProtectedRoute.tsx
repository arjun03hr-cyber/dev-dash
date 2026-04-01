import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background grid-bg flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="h-10 w-10 border-2 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
