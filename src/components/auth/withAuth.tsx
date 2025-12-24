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
          const user = localStorage.getItem('user');
          
          if (!token || !user) {
            router.push('/login');
            return;
          }

          const response = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) {
            // Session invalidated (possibly by another login)
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Show alert if session was invalidated
            if (response.status === 401) {
              alert('Your session has been terminated because you logged in from another location.');
            }
            
            router.push('/login');
            return;
          }

          const data = await response.json();
          
          if (!data.user) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
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
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
        } finally {
          setIsLoading(false);
        }
      };

      checkAuth();
      
      // Periodic session validation (every 30 seconds)
      const interval = setInterval(() => {
        const token = localStorage.getItem('token');
        if (token) {
          fetch('/api/auth/verify', {
            headers: { Authorization: `Bearer ${token}` },
          }).then(response => {
            if (!response.ok) {
              // Session invalidated
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              alert('Your session has been terminated because you logged in from another location.');
              router.push('/login');
            }
          }).catch(() => {
            // Network error, ignore
          });
        }
      }, 30000);

      return () => clearInterval(interval);
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
