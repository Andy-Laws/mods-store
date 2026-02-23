import { getSiteSettings } from "@/lib/settings";
import { SettingsForm } from "./settings-form";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  return (
    <div>
      <h1 className="text-xl font-bold text-[var(--color-foreground)]">Website settings</h1>
      <p className="mt-0.5 text-sm text-[var(--color-muted)]">Site logo, theme, homepage content, and feature flags.</p>
      <SettingsForm settings={settings} />
    </div>
  );
}
