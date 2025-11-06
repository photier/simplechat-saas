import { Link } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';

export function SidebarHeader() {
  return (
    <div className="hidden lg:flex items-center justify-center shrink-0 pt-8 pb-3.5">
      <Link to="/">
        <img
          src={toAbsoluteUrl('/logo.png')}
          className="h-[60px]"
          alt="Simple Chat Logo"
        />
      </Link>
    </div>
  );
}
