import { toAbsoluteUrl } from '@/lib/helpers';

export function SidebarFooter() {
  return (
    <div className="flex flex-col gap-5 items-center shrink-0 pt-3 pb-8">
      <img
        className="size-10 shrink-0 rounded-lg"
        src={toAbsoluteUrl('/media/app/footer-logo.png')}
        alt="Simple Chat Bot"
      />
    </div>
  );
}
