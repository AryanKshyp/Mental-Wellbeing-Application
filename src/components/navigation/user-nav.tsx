"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export function UserNav() {
  const { setTheme, theme } = useTheme();

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle Theme"
        onClick={toggleTheme}
      >
        {theme === "light" ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </Button>
      <Avatar>
        <AvatarFallback>CC</AvatarFallback>
      </Avatar>
    </div>
  );
}

