import { User, Bot, Info } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const UserAvatar = () => {
  return (
    <Avatar className="h-8 w-8">
      <AvatarImage src="" />
      <AvatarFallback className="bg-primary/10 text-primary">
        <User className="h-5 w-5" />
      </AvatarFallback>
    </Avatar>
  );
};

export const AssistantAvatar = () => {
  return (
    <Avatar className="h-8 w-8 border">
      <AvatarImage src="" />
      <AvatarFallback className="bg-secondary text-secondary-foreground">
        <Bot className="h-5 w-5" />
      </AvatarFallback>
    </Avatar>
  );
};

export const SystemIcon = () => {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
      <Info className="h-4 w-4 text-muted-foreground" />
    </div>
  );
};

