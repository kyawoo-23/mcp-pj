import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className='container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4'>
      <Card className='w-full max-w-md text-center'>
        <CardHeader>
          <div className='mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted'>
            <FileQuestion className='h-10 w-10 text-muted-foreground' />
          </div>
          <CardTitle className='text-4xl font-bold'>404</CardTitle>
          <CardDescription className='text-lg'>Page Not Found</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-muted-foreground'>
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
          <Link href='/'>
            <Button size='lg' className='w-full'>
              <Home className='mr-2 h-4 w-4' />
              Go Back Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

