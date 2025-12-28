"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  className?: string;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  isInSheet?: boolean;
  isNewChatDisabled?: boolean;
  defaultCollapsed?: boolean;
}

export function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  className,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  isInSheet = false,
  isNewChatDisabled,
  defaultCollapsed = false,
}: SidebarProps) {
  const router = useRouter();
  const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed);
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);

  // When in Sheet, always show expanded
  const collapsed = isInSheet
    ? false
    : controlledCollapsed ?? internalCollapsed;
  const setCollapsed = onCollapsedChange ?? setInternalCollapsed;

  // Persist state changes
  const handleCollapseChange = (newState: boolean) => {
    setCollapsed(newState);
    if (!isInSheet && !controlledCollapsed && !onCollapsedChange) {
      document.cookie = `sidebar:state=${newState}; path=/; max-age=${
        60 * 60 * 24 * 7
      }`; // 1 week
    }
  };

  const handleLogout = async () => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.auth.signOut();
      router.refresh();
      router.push("/auth/login");
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setShowLogoutDialog(false);
    }
  };

  const [profileName, setProfileName] = React.useState<string>("User");

  React.useEffect(() => {
    const fetchProfile = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();
        
      if (profile?.full_name) {
        setProfileName(profile.full_name);
      } else if (profile?.email) {
        setProfileName(profile.email);
      }
    };
    
    fetchProfile();
  }, []);

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-sidebar text-sidebar-foreground transition-all duration-200",
        isInSheet
          ? "w-full"
          : collapsed
          ? "w-[64px]"
          : "w-[260px] lg:w-[280px]",
        className
      )}
    >
      {/* Toggle Button - Only show on desktop when not in Sheet */}
      {!isInSheet && (
        <div className='flex items-center justify-end p-2'>
          <Button
            onClick={() => handleCollapseChange(!collapsed)}
            variant='ghost'
            size='icon'
            className={cn(
              "h-8 text-sidebar-foreground hover:bg-sidebar-accent",
              collapsed && !isInSheet ? "w-full" : "w-8"
            )}
          >
            {collapsed ? (
              <ChevronRight className='h-4 w-4' />
            ) : (
              <ChevronLeft className='h-4 w-4' />
            )}
            <span className='sr-only'>
              {collapsed ? "Expand sidebar" : "Collapse sidebar"}
            </span>
          </Button>
        </div>
      )}

      {/* New Chat Button */}
      <div
        className={cn(
          "p-3 sm:px-4 sm:py-2 mt-8 md:mt-0",
          collapsed && !isInSheet && "px-2"
        )}
      >
        <Button
          onClick={onNewChat}
          disabled={isNewChatDisabled}
          variant='outline'
          className={cn(
            "w-full border-sidebar-border bg-sidebar-accent/50 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm",
            collapsed && !isInSheet
              ? "justify-center px-0"
              : "justify-start gap-2"
          )}
          title={collapsed && !isInSheet ? "New Chat" : undefined}
        >
          <Plus className='h-4 w-4 shrink-0' />
          {(!collapsed || isInSheet) && (
            <span className='truncate'>New Chat</span>
          )}
        </Button>
      </div>

      {/* Conversation List */}
      <div className='flex-1 min-h-0 overflow-hidden'>
        <ScrollArea className='h-full px-2'>
          <div className='flex flex-col gap-1 py-2'>
            {(!collapsed || isInSheet) && (
              <div className='px-2 py-1 text-xs font-medium text-muted-foreground'>
                Recent
              </div>
            )}
            {conversations.map((conversation) => (
              <Button
                key={conversation.id}
                variant='ghost'
                onClick={() => onSelectConversation(conversation.id)}
                className={cn(
                  "h-9 w-full overflow-hidden text-ellipsis whitespace-nowrap px-2 text-sm font-normal",
                  collapsed && !isInSheet ? "justify-center" : "justify-start",
                  activeConversationId === conversation.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
                title={collapsed && !isInSheet ? conversation.title : undefined}
              >
                <MessageSquare
                  className={cn(
                    "h-4 w-4 shrink-0",
                    (!collapsed || isInSheet) && "mr-2"
                  )}
                />
                {(!collapsed || isInSheet) && (
                  <span className='truncate'>{conversation.title}</span>
                )}
              </Button>
            ))}

            {conversations.length === 0 && (!collapsed || isInSheet) && (
              <div className='px-4 py-8 text-center text-sm text-muted-foreground'>
                No conversations yet.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div
        className={cn(
          "mt-auto border-t border-sidebar-border",
          collapsed ? "p-2" : "p-3 sm:p-4"
        )}
      >
        <div className='flex flex-col gap-1'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                className={cn(
                  "flex items-center rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer",
                  collapsed && !isInSheet ? "justify-center" : "gap-2"
                )}
              >
                <div className='h-6 w-6 rounded-full bg-sidebar-primary/20 shrink-0' />
                {(!collapsed || isInSheet) && (
                  <div className='flex flex-col min-w-0'>
                    <span className='text-xs font-medium truncate'>{profileName}</span>
                  </div>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={collapsed && !isInSheet ? "center" : "start"}
              side={collapsed && !isInSheet ? "right" : "top"}
              className='w-48'
            >
              <DropdownMenuItem
                onClick={() => {
                  router.push("/settings");
                }}
              >
                <Settings className='h-4 w-4' />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setShowLogoutDialog(true);
                }}
                variant='destructive'
              >
                <LogOut className='h-4 w-4' />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
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
    </div>
  );
}
