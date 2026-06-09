import { FlaskConical } from "lucide-react";

type PreviewEnvironmentBannerProps = {
  show: boolean;
};

export function PreviewEnvironmentBanner({
  show,
}: PreviewEnvironmentBannerProps) {
  if (!show) {
    return null;
  }

  return (
    <>
      <div
        role='status'
        aria-live='polite'
        className='fixed inset-x-0 top-0 z-[100] flex h-7 items-center justify-center gap-2 border-b border-amber-600/30 bg-amber-500 px-3 text-xs font-medium text-amber-950 shadow-sm'
      >
        <FlaskConical className='size-3 shrink-0' aria-hidden />
        <span>Preview environment</span>
      </div>
      <div aria-hidden className='h-8 shrink-0' />
    </>
  );
}
