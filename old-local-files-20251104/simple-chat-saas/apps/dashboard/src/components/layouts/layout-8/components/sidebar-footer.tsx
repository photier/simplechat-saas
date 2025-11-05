import { toAbsoluteUrl } from '@/lib/helpers';
import { UserDropdownMenu } from '../../layout-1/shared/topbar/user-dropdown-menu';

export function SidebarFooter() {
  return (
    <div className="flex flex-col gap-5 items-center shrink-0 pt-3 pb-8">
      <UserDropdownMenu
        trigger={
          <img
            className="size-12 rounded-lg border-2 border-mono/30 shrink-0 cursor-pointer hover:border-primary transition-colors"
            src={toAbsoluteUrl('/media/avatars/300-2.png')}
            alt="Admin User"
          />
        }
      />
    </div>
  );
}
