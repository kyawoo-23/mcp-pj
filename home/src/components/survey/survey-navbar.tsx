"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOut, Settings, RefreshCw, Info } from "lucide-react";
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
  const [showInfoDialog, setShowInfoDialog] = useState(false);

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
              Website Design Study
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
          <Button
            variant='ghost'
            size='default'
            onClick={() => setShowInfoDialog(true)}
            className='text-muted-foreground hover:text-foreground'
            title='Instructions'
          >
            <Info className='h-4 w-4' />
            <span className='hidden sm:block ml-2'>Instructions</span>
          </Button>

          {onRefresh && (
            <Button
              variant='ghost'
              size='default'
              onClick={onRefresh}
              disabled={isRefreshing}
              className='text-muted-foreground hover:text-foreground'
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

              <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
                <DialogContent className='sm:max-w-[480px] md:max-w-2xl max-h-[90vh] flex flex-col p-0'>
                  <DialogHeader className='px-6 pt-6 pb-4 border-b shrink-0'>
                    <DialogTitle className='flex items-center gap-2'>
                      <Info className='h-5 w-5 text-primary' />
                      Research Task Instructions
                    </DialogTitle>
                    <DialogDescription className='text-left'>
                      Please read the following instructions to understand how
                      to complete the research study.
                    </DialogDescription>
                  </DialogHeader>
                  <div className='flex-1 overflow-y-auto px-6 py-4'>
                    <div className='grid gap-4'>
                      <section className='space-y-2'>
                        <h4 className='font-semibold text-sm'>
                          1. Study Overview
                        </h4>
                        <p className='text-sm text-muted-foreground'>
                          This study compares your experience using a
                          traditional university portal versus an AI-powered
                          chat agent. You will perform similar tasks in both
                          systems and share your feedback.
                        </p>
                      </section>

                      <section className='space-y-2'>
                        <h4 className='font-semibold text-sm'>
                          2. Completing Tasks
                        </h4>
                        <ul className='list-disc pl-4 text-sm text-muted-foreground space-y-1'>
                          <li>
                            <strong>Opening Tasks:</strong> It is important to
                            click &quot;Open Task&quot; to start recording the
                            task progress for each task. This will launch the
                            portal or chat agent in a new tab.
                          </li>
                          <li>
                            <strong>Resetting Tasks:</strong> Pressing
                            &quot;Reset Task&quot; will delete that task&apos;s
                            progress if you need to start over.
                          </li>
                          <li>
                            <strong>Performing Work:</strong> Follow the
                            specific instructions provided for each task within
                            the target system.
                          </li>
                          <li>
                            <strong>Marking Done:</strong> Once you finish a
                            task, it will automatically update to
                            &quot;Completed&quot; on this dashboard (you may
                            need to click &quot;Refresh Status&quot; if it
                            doesn&apos;t update immediately).
                          </li>
                        </ul>
                      </section>

                      <section className='space-y-2'>
                        <h4 className='font-semibold text-sm'>
                          3. Survey Sections
                        </h4>
                        <p className='text-sm text-muted-foreground'>
                          After completing all tasks in a section (Traditional
                          or Chat Agent), you will be asked to fill out a short
                          survey about that specific experience.
                        </p>
                      </section>

                      <section className='space-y-2'>
                        <h4 className='font-semibold text-sm'>4. Need Help?</h4>
                        <p className='text-sm text-muted-foreground'>
                          If you have any questions or encounter any issues,
                          please contact the researcher at:{" "}
                          <a
                            href='mailto:6878035423@student.chula.ac.th'
                            className='text-primary hover:underline font-medium'
                          >
                            6878035423@student.chula.ac.th
                          </a>
                        </p>
                      </section>

                      <section className='space-y-2 text-primary font-medium bg-primary/5 p-3 rounded-md'>
                        <p className='text-sm'>
                          Tip: You can always come back to this instruction
                          panel if you get stuck!
                        </p>
                      </section>
                    </div>
                  </div>
                  <DialogFooter className='px-6 py-4 border-t shrink-0'>
                    <Button onClick={() => setShowInfoDialog(false)}>
                      Got it!
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
