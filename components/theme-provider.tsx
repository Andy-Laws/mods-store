import type { ThemeColors } from "@/lib/settings";

export function ThemeProvider({
  themeColors,
  children,
}: {
  themeColors: ThemeColors;
  children: React.ReactNode;
}) {
  const vars: Record<string, string> = {};
  if (themeColors.primary) vars["--color-primary"] = themeColors.primary;
  if (themeColors.secondary) vars["--color-secondary"] = themeColors.secondary;
  if (themeColors.background) vars["--background"] = themeColors.background;
  if (themeColors.surface) vars["--color-surface"] = themeColors.surface;
  if (themeColors.foreground) vars["--foreground"] = themeColors.foreground;
  if (themeColors.muted) vars["--color-muted"] = themeColors.muted;
  if (themeColors.border) vars["--color-border"] = themeColors.border;

  return (
    <div className="min-h-screen" style={vars as React.CSSProperties}>
      {children}
    </div>
  );
}
