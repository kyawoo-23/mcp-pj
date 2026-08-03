import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Link
        href='/'
        className='absolute left-4 top-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors'
      >
        <ArrowLeft className='h-4 w-4' />
        Back to Home
      </Link>
      {children}
    </div>
  );
}
