import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { uiCopy } from "@/copy";

const themes = {
  system: { label: uiCopy.theme.system, Icon: Monitor },
  light: { label: uiCopy.theme.light, Icon: Sun },
  dark: { label: uiCopy.theme.dark, Icon: Moon },
} as const;
type Theme = keyof typeof themes;

export function ThemeControl() {
  const menu = useRef<HTMLDetailsElement>(null);
  const trigger = useRef<HTMLElement>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = document.documentElement.dataset.theme;
    return saved === "light" || saved === "dark" ? saved : "system";
  });

  useEffect(() => {
    function dismissOutside(event: PointerEvent) {
      const details = menu.current;
      if (details?.open && event.target instanceof Node && !details.contains(event.target)) {
        details.open = false;
      }
    }

    document.addEventListener("pointerdown", dismissOutside);
    return () => document.removeEventListener("pointerdown", dismissOutside);
  }, []);

  function closeMenu() {
    if (menu.current) menu.current.open = false;
    trigger.current?.focus();
  }

  function applyTheme(value: Theme) {
    setTheme(value);
    if (value === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = value;

    try {
      localStorage.setItem("request-desk-theme", value);
    } catch {
      // The current page still uses the chosen theme when storage is unavailable.
    }
    closeMenu();
  }

  const { Icon } = themes[theme];

  return (
    <details
      ref={menu}
      className="relative shrink-0"
      onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) {
          event.currentTarget.open = false;
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && event.currentTarget.open) {
          event.preventDefault();
          closeMenu();
        }
      }}
    >
      <summary
        ref={trigger}
        aria-label={uiCopy.theme.label}
        title={uiCopy.theme.label}
        className="grid size-8 cursor-pointer list-none place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring [@media(pointer:coarse)]:size-11 [&::-webkit-details-marker]:hidden"
      >
        <Icon aria-hidden="true" className="size-4" />
      </summary>
      <div
        role="group"
        aria-label={uiCopy.theme.label}
        className="absolute top-full right-0 z-20 mt-1.5 grid min-w-36 gap-px rounded-lg border border-border bg-card p-1 shadow-md"
      >
        {Object.entries(themes).map(([value, { label, Icon: OptionIcon }]) => (
          <button
            key={value}
            type="button"
            aria-pressed={theme === value}
            onClick={() => applyTheme(value as Theme)}
            className="flex min-h-8 items-center gap-2 rounded-md px-2 text-left text-[13px] whitespace-nowrap hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring [@media(pointer:coarse)]:min-h-11"
          >
            <OptionIcon aria-hidden="true" className="size-3.5 text-muted-foreground" />
            {label}
            {theme === value && <Check aria-hidden="true" className="ml-auto size-3.5 text-info" />}
          </button>
        ))}
      </div>
    </details>
  );
}
