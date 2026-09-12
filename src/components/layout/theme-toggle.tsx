"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Cambiar tema">
            {/* El icono se decide por CSS a partir de la clase .dark que pone
                next-themes, no por estado de React: así no hay mismatch de
                hidratación que resolver con un "montado", y el cambio de tema
                cruza los dos iconos en vez de reemplazarlos de golpe. */}
            <span className="relative flex size-4 items-center justify-center">
              <Sun className="absolute size-4 rotate-0 opacity-100 transition-[opacity,transform] duration-300 ease-out-fuerte dark:-rotate-90 dark:opacity-0" />
              <Moon className="absolute size-4 rotate-90 opacity-0 transition-[opacity,transform] duration-300 ease-out-fuerte dark:rotate-0 dark:opacity-100" />
            </span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">
            <Sun className="size-4" />
            Claro
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon className="size-4" />
            Oscuro
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor className="size-4" />
            Sistema
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
