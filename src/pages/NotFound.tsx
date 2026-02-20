import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Home, ShieldOff } from 'lucide-react';

const NotFound: React.FC = () => {
  const location = useLocation();
  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="text-8xl font-black text-primary/20 mb-4">404</div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/">
          <Button className="gradient-hero border-0 text-white gap-2">
            <Home className="w-4 h-4" />Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export const AccessDenied: React.FC = () => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <div className="text-center max-w-sm">
      <div className="w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
        <ShieldOff className="w-10 h-10 text-destructive" />
      </div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Access Denied</h1>
      <p className="text-muted-foreground mb-8">You don't have permission to view this page.</p>
      <Link to="/">
        <Button className="gradient-hero border-0 text-white gap-2">
          <Home className="w-4 h-4" />Go Home
        </Button>
      </Link>
    </div>
  </div>
);

export default NotFound;
