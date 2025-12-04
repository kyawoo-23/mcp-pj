import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className='flex items-center justify-center py-12'>
      <div className='flex flex-col items-center gap-4'>
        <Spinner size='lg' />
        <p className='text-sm text-muted-foreground'>Loading registrations...</p>
      </div>
    </div>
  );
}

