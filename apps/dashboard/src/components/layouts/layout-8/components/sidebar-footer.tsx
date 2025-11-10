import { toAbsoluteUrl } from '@/lib/helpers';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function SidebarFooter() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="flex flex-col gap-3 items-center shrink-0 pt-3 pb-8">
      <button
        onClick={handleLogout}
        className="w-11 h-11 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors group"
        title="Logout"
      >
        <LogOut className="size-5 text-red-600 group-hover:text-red-700" />
      </button>
      <Link to="/profile" className="hover:opacity-80 transition-opacity" title="Profile">
        <img
          className="size-11 shrink-0 rounded-lg cursor-pointer"
          src={toAbsoluteUrl('/media/app/footer-logo.png')}
          alt="Simple Chat Bot"
        />
      </Link>
    </div>
  );
}
