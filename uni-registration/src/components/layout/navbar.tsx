"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, BookOpen, Calendar, Menu, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [fullName, setFullName] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    async function getProfile() {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (data?.full_name) {
        setFullName(data.full_name);
      }
    }
    getProfile();
  }, [user, supabase]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setShowLogoutDialog(false);
    }
  };

  return (
    <nav className='border-b sticky top-0 z-50 bg-background'>
      <div className='container mx-auto flex h-16 items-center justify-between px-4'>
        <Link href='/' className='flex items-center gap-2'>
          <Image
            src='/logo.svg'
            alt='Uni Registration'
            width={40}
            height={40}
            className='h-5 w-5 sm:h-6 sm:w-6 md:h-10 md:w-10'
          />
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
                        {fullName?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-56'>
                  <div className='flex flex-col space-y-1 p-2'>
                    <p className='text-sm font-medium leading-none'>
                      {fullName || user.email}
                    </p>
                    {fullName && (
                      <p className='text-xs text-muted-foreground truncate'>
                        {user.email}
                      </p>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <Link href='/settings'>
                    <DropdownMenuItem>
                      <Settings className='mr-2 h-4 w-4' />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowLogoutDialog(true)}
                    className='text-destructive focus:text-destructive'
                  >
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
              <DropdownMenuContent align='end' className='w-56'>
                <div className='flex flex-col space-y-1 p-2'>
                  <p className='text-sm font-medium leading-none'>
                    {fullName || user.email}
                  </p>
                  {fullName && (
                    <p className='text-xs text-muted-foreground truncate'>
                      {user.email}
                    </p>
                  )}
                </div>
                <DropdownMenuSeparator />
                <Link href='/settings'>
                  <DropdownMenuItem>
                    <Settings className='mr-2 h-4 w-4' />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowLogoutDialog(true)}
                  className='text-destructive focus:text-destructive'
                >
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

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? You will need to sign in again to
              access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowLogoutDialog(false)}
            >
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleLogout}>
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </nav>
  );
}
