"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOut, Settings, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import Image from "next/image";

export interface SurveyNavbarProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function SurveyNavbar({ onRefresh, isRefreshing }: SurveyNavbarProps) {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    async function getUserAndProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (data?.full_name) {
          setFullName(data.full_name);
        }
      }
    }
    getUserAndProfile();
  }, [supabase]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    } finally {
      setShowLogoutDialog(false);
    }
  };

  return (
    <header className='sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60'>
      <div className='container mx-auto flex h-16 items-center justify-between px-6'>
        <div className='flex items-center gap-4 overflow-hidden'>
          <Link
            href='/'
            className='flex items-center gap-2.5 transition-opacity hover:opacity-80'
          >
            <Image
              src='/logo.svg'
              alt='Logo'
              width={40}
              height={40}
              className='h-10 w-10'
            />
            <span className='text-xl font-bold tracking-tighter'>
              Survey Research
            </span>
          </Link>

          <div className='h-8 w-px bg-border/60 hidden xs:block' />

          <div className='hidden flex-col leading-tight xs:flex'>
            <span className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80'>
              Research Study
            </span>
            <span className='text-sm font-semibold text-muted-foreground/90'>
              Session Survey
            </span>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {onRefresh && (
            <Button
              variant='ghost'
              size='default'
              onClick={onRefresh}
              disabled={isRefreshing}
              className='mr-1 text-muted-foreground hover:text-foreground'
              title='Refresh Status'
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span className='hidden sm:block'>Refresh Status</span>
            </Button>
          )}

          {user && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    className='relative h-9 w-9 rounded-full'
                  >
                    <Avatar className='h-9 w-9'>
                      <AvatarFallback className='bg-muted text-xs font-semibold'>
                        {fullName?.charAt(0).toUpperCase() ||
                          user.email?.charAt(0).toUpperCase() ||
                          "U"}
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

              <Dialog
                open={showLogoutDialog}
                onOpenChange={setShowLogoutDialog}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Logout</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to logout? You will need to sign in
                      again to access your account.
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
            </>
          )}
        </div>
      </div>
    </header>
  );
}
