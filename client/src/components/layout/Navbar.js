import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Menu, Package2 } from 'lucide-react';

function Navbar() {
  const { logout } = useAuth();
  const location = useLocation();
  const getLinkClasses = (path) => location.pathname === path ? 'text-foreground transition-colors hover:text-foreground' : 'text-muted-foreground transition-colors hover:text-foreground';

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link to="/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base"><Package2 className="h-6 w-6" /> <span className="sr-only">Family Budget</span></Link>
        <Link to="/dashboard" className={getLinkClasses('/dashboard')}>Dashboard</Link>
        <Link to="/transactions" className={getLinkClasses('/transactions')}>Transactions</Link>
        <Link to="/budgets" className={getLinkClasses('/budgets')}>Budgets</Link>
        {/* NEW: Added Savings Link */}
        <Link to="/savings" className={getLinkClasses('/savings')}>Savings</Link>
        <Link to="/settings" className={getLinkClasses('/settings')}>Settings</Link>
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden"><Menu className="h-5 w-5" /><span className="sr-only">Toggle navigation menu</span></Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link to="/dashboard" className="flex items-center gap-2 text-lg font-semibold"><Package2 className="h-6 w-6" /> <span className="sr-only">Family Budget</span></Link>
            <Link to="/dashboard" className={getLinkClasses('/dashboard')}>Dashboard</Link>
            <Link to="/transactions" className={getLinkClasses('/transactions')}>Transactions</Link>
            <Link to="/budgets" className={getLinkClasses('/budgets')}>Budgets</Link>
            {/* NEW: Added Savings Link */}
            <Link to="/savings" className={getLinkClasses('/savings')}>Savings</Link>
            <Link to="/settings" className={getLinkClasses('/settings')}>Settings</Link>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center justify-end gap-4">
        <Button onClick={logout} variant="outline" size="sm">Logout</Button>
      </div>
    </header>
  );
}
export default Navbar;