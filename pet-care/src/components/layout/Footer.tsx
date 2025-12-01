import Link from "next/link";
import { PawPrint } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-primary/10 bg-secondary/30 mt-auto">
      <div className="container mx-auto flex flex-col items-center justify-center gap-4 py-4 md:flex-row px-4">
        <div className="flex items-center gap-2 font-bold text-lg text-primary">
          <PawPrint className="h-5 w-5" />
          <span>Pet Care</span>
        </div>
        
        <p className="text-center text-sm text-muted-foreground">
          © 2025 Pet Care. 
        </p>
      </div>
    </footer>
  );
}
