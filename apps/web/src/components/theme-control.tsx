import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { uiCopy } from "@/copy";

const themes = [
  { value: "system", label: uiCopy.theme.system },
  { value: "light", label: uiCopy.theme.light },
  { value: "dark", label: uiCopy.theme.dark },
] as const;
type Theme = (typeof themes)[number]["value"];

export function ThemeControl() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = document.documentElement.dataset.theme;
    return saved === "light" || saved === "dark" ? saved : "system";
  });

  function applyTheme(value: Theme) {
    setTheme(value);
    if (value === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = value;

    try {
      localStorage.setItem("request-desk-theme", value);
    } catch {
      // The current page still uses the chosen theme when storage is unavailable.
    }
  }

  return (
    <div className="relative shrink-0">
      <select
        aria-label={uiCopy.theme.label}
        title={uiCopy.theme.label}
        value={theme}
        onChange={(event) => applyTheme(event.currentTarget.value as Theme)}
        className="h-8 cursor-pointer appearance-none rounded-md bg-transparent pr-7 pl-2 text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring [@media(pointer:coarse)]:h-11"
      >
        {themes.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-2 size-3 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}
