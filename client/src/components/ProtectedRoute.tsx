import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";


interface ProtectedRouteProps {
  component: React.ComponentType<any>;
}

export default function ProtectedRoute({ component: Component }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const loginUrl = getLoginUrl();
      window.location.href = loginUrl;
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <Component />;
}
