import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface WithAuthOptions {
  allowedRoles?: string[];
  redirectTo?: string;
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const { allowedRoles = [], redirectTo = '/dashboard' } = options;

  return function WithAuthComponent(props: P) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const token = localStorage.getItem('token');
          
          if (!token) {
            router.push('/login');
            return;
          }

          const response = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) {
            localStorage.removeItem('token');
            router.push('/login');
            return;
          }

          const data = await response.json();
          
          if (!data.user) {
            router.push('/login');
            return;
          }

          // Check if user has required role
          if (allowedRoles.length > 0 && !allowedRoles.includes(data.user.role)) {
            router.push(redirectTo);
            return;
          }

          setIsAuthorized(true);
        } catch (error) {
          console.error('Auth check failed:', error);
          router.push('/login');
        } finally {
          setIsLoading(false);
        }
      };

      checkAuth();
    }, [router]);

    if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthorized) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
