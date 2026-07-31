"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

// No mounted-state effect on purpose: both icons always render, and CSS `dark:`
// variants decide which is visible. That's resolved by the `.dark` class Next
// injects before hydration, so there's no server/client flash to guard against.
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Cambiar tema"
      className="h-9 w-9 hover:bg-accent text-muted-foreground hover:text-foreground relative overflow-hidden"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="w-4 h-4 hidden dark:block transition-transform duration-300" />
      <Moon className="w-4 h-4 dark:hidden transition-transform duration-300" />
    </Button>
  );
}
