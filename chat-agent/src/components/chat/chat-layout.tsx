import * as React from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface ChatLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode; // Main chat area
  sidebarOpen: boolean;
  onSidebarOpenChange: (open: boolean) => void;
}

export function ChatLayout({
  sidebar,
  children,
  sidebarOpen,
  onSidebarOpenChange,
}: ChatLayoutProps) {
  return (
    <div className='flex h-screen w-full overflow-hidden bg-background'>
      {/* Desktop Sidebar - visible on md and up */}
      <aside className='hidden md:flex flex-col border-r bg-sidebar shrink-0 overflow-hidden'>
        {sidebar}
      </aside>

      {/* Mobile Sidebar (Drawer) - visible on mobile and sm */}
      <Sheet open={sidebarOpen} onOpenChange={onSidebarOpenChange}>
        <SheetContent side='left' className='w-[280px] p-0 sm:w-[300px]'>
          {React.isValidElement(sidebar)
            ? React.cloneElement(
                sidebar as React.ReactElement<{ isInSheet?: boolean }>,
                {
                  isInSheet: true,
                }
              )
            : sidebar}
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <main className='flex flex-1 flex-col min-w-0 overflow-hidden relative'>
        {children}
      </main>
    </div>
  );
}
