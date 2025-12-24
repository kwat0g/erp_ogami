import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">
          {router.pathname === '/dashboard' && 'Dashboard'}
          {router.pathname.startsWith('/inventory') && 'Inventory Management'}
          {router.pathname.startsWith('/purchasing') && 'Purchasing'}
          {router.pathname.startsWith('/production') && 'Production'}
          {router.pathname.startsWith('/quality') && 'Quality Management'}
          {router.pathname.startsWith('/maintenance') && 'Maintenance'}
          {router.pathname.startsWith('/accounting') && 'Accounting'}
          {router.pathname.startsWith('/hr') && 'Human Resources'}
          {router.pathname.startsWith('/reports') && 'Reports'}
          {router.pathname.startsWith('/settings') && 'Settings'}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User className="h-4 w-4" />
          </div>
          <div className="text-sm">
            <div className="font-medium">
              {user ? `${user.firstName} ${user.lastName}` : 'User'}
            </div>
            <div className="text-xs text-muted-foreground">{user?.role || 'Role'}</div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
