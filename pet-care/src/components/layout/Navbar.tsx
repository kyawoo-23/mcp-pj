"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PawPrint, Scissors, Menu, Calendar, LogOut, UserCircle } from "lucide-react";

const navItems = [
  { href: "/pets", label: "My Pets", icon: PawPrint },
  { href: "/grooming", label: "Grooming", icon: Scissors },
  { href: "/bookings", label: "My Bookings", icon: Calendar },
];

import { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface NavbarProps {
  user: SupabaseUser | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    setShowLogoutDialog(false);
  };

  const filteredNavItems = navItems.filter(item => {
    if (item.href === "/pets" || item.href === "/bookings") {
      return !!user;
    }
    return true;
  });

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <div className="flex flex-col gap-4 p-4">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary mb-4" onClick={() => setIsOpen(false)}>
                  <PawPrint className="h-6 w-6" />
                  <span>Pet Care</span>
                </Link>
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary py-2",
                        pathname === item.href ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <PawPrint className="h-6 w-6" />
            <span className="hidden sm:inline">Pet Care</span>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <UserCircle className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Account</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setShowLogoutDialog(true);
                    }}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/auth/login">
                    <UserCircle className="h-5 w-5" />
                    <span className="sr-only">Login</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to log in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  );
}
