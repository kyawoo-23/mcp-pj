"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, BookOpen, Calendar, Menu } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <nav className='border-b sticky top-0 z-50 bg-background'>
      <div className='container mx-auto flex h-16 items-center justify-between px-4'>
        <Link href='/' className='flex items-center gap-2'>
          <BookOpen className='h-5 w-5 sm:h-6 sm:w-6' />
          <span className='text-lg sm:text-xl font-bold'>Uni Registration</span>
        </Link>

        {/* Desktop Navigation */}
        <div className='hidden md:flex items-center gap-4'>
          <Link href='/courses'>
            <Button variant='ghost' size='sm'>
              <BookOpen className='h-4 w-4 mr-2' />
              Courses
            </Button>
          </Link>

          {loading ? (
            <div className='h-8 w-8 animate-pulse rounded-full bg-muted' />
          ) : user ? (
            <>
              <Link href='/registrations'>
                <Button variant='ghost' size='sm'>
                  <Calendar className='h-4 w-4 mr-2' />
                  My Registrations
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    className='relative h-8 w-8 rounded-full'
                  >
                    <Avatar className='h-8 w-8'>
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <div className='flex flex-col space-y-1 p-2'>
                    <p className='text-sm font-medium leading-none'>
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className='mr-2 h-4 w-4' />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href='/auth/login'>
              <Button size='sm'>Sign In</Button>
            </Link>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className='flex md:hidden items-center gap-2'>
          {!loading && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='relative h-8 w-8 rounded-full'
                >
                  <Avatar className='h-8 w-8'>
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <div className='flex flex-col space-y-1 p-2'>
                  <p className='text-sm font-medium leading-none'>
                    {user.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className='mr-2 h-4 w-4' />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {!loading && !user && (
            <Link href='/auth/login'>
              <Button size='sm'>Sign In</Button>
            </Link>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant='ghost' size='sm' className='md:hidden'>
                <Menu className='h-5 w-5' />
                <span className='sr-only'>Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side='right'>
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className='flex flex-col gap-4 mt-6'>
                <Link href='/courses'>
                  <Button variant='ghost' className='w-full justify-start'>
                    <BookOpen className='h-4 w-4 mr-2' />
                    Courses
                  </Button>
                </Link>
                {user && (
                  <Link href='/registrations'>
                    <Button variant='ghost' className='w-full justify-start'>
                      <Calendar className='h-4 w-4 mr-2' />
                      My Registrations
                    </Button>
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

