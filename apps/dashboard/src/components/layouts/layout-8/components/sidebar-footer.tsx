import { toAbsoluteUrl } from '@/lib/helpers';

export function SidebarFooter() {
  return (
    <div className="flex flex-col gap-5 items-center shrink-0 pt-3 pb-8">
      <img
        className="size-12 rounded-lg shrink-0"
        src={toAbsoluteUrl('/media/app/mini-logo-square-gray.svg')}
        alt="Simple Chat Bot"
      />
    </div>
  );
}
