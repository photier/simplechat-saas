import { toAbsoluteUrl } from '@/lib/helpers';
import { Link } from 'react-router-dom';

export function SidebarFooter() {
  return (
    <div className="flex flex-col gap-5 items-center shrink-0 pt-3 pb-8">
      <Link to="/profile" className="hover:opacity-80 transition-opacity">
        <img
          className="size-11 shrink-0 rounded-lg cursor-pointer"
          src={toAbsoluteUrl('/media/app/footer-logo.png')}
          alt="Simple Chat Bot"
        />
      </Link>
    </div>
  );
}
