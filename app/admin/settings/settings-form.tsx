"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  updateThemeColors,
  updateHomepageContent,
  updateDevelopersPageHeroImage,
  updateFeatureFlags,
  updateSiteLogo,
  updateSiteName,
  updateFavicon,
  updateDiscordInviteUrl,
  updateDashboardSettings,
  resetSiteToDefault,
} from "@/app/actions/settings";
import { uploadSiteLogo, uploadFavicon, uploadHomepageBackground, uploadDevelopersPageBackground } from "@/app/actions/upload";
import type { SiteSettings } from "@/lib/settings";

type TabId = "general" | "theme" | "homepage" | "developers" | "features" | "danger";

const TABS: { id: TabId; label: string }[] = [
  { id: "general", label: "General" },
  { id: "theme", label: "Theme" },
  { id: "homepage", label: "Homepage" },
  { id: "developers", label: "Developers page" },
  { id: "features", label: "Features & Dashboard" },
  { id: "danger", label: "Danger zone" },
];

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [theme, setTheme] = useState(settings.themeColors);
  const [homepage, setHomepage] = useState(settings.homepageContent);
  const [flags, setFlags] = useState(settings.featureFlags);
  const [siteName, setSiteName] = useState(settings.siteName ?? "Mod Marketplace");
  const [siteLogo, setSiteLogo] = useState(settings.siteLogo ?? "");
  const [faviconUrl, setFaviconUrl] = useState(settings.faviconUrl ?? "");
  const [discordUrl, setDiscordUrl] = useState(settings.discordInviteUrl);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingHeroBg, setUploadingHeroBg] = useState(false);
  const [uploadingDevPageBg, setUploadingDevPageBg] = useState(false);
  const [developersPageHeroImage, setDevelopersPageHeroImage] = useState(settings.developersPageHeroImage ?? "");
  const [dashboardSettings, setDashboardSettings] = useState(settings.dashboardSettings ?? {});
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showNotification(type: "success" | "error", message: string) {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
      notificationTimeoutRef.current = null;
    }
    setNotification({ type, message });
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
      notificationTimeoutRef.current = null;
    }, 4000);
  }

  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    };
  }, []);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setNotification(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadSiteLogo(formData);
      if ("url" in result) {
        setSiteLogo(result.url);
        await updateSiteLogo(result.url);
        showNotification("success", "Changes Saved");
        router.refresh();
      } else {
        showNotification("error", "Upload failed: " + (result.error ?? "Unknown error"));
      }
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleHeroBackgroundUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHeroBg(true);
    setNotification(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadHomepageBackground(formData);
      if ("url" in result) {
        setHomepage((prev) => ({ ...prev, heroBackgroundImage: result.url }));
        await updateHomepageContent({ ...homepage, heroBackgroundImage: result.url });
        showNotification("success", "Changes Saved");
        router.refresh();
      } else {
        showNotification("error", "Upload failed: " + (result.error ?? "Unknown error"));
      }
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingHeroBg(false);
    }
  }

  async function handleDevelopersPageBackgroundUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDevPageBg(true);
    setNotification(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadDevelopersPageBackground(formData);
      if ("url" in result) {
        setDevelopersPageHeroImage(result.url);
        await updateDevelopersPageHeroImage(result.url);
        showNotification("success", "Changes Saved");
        router.refresh();
      } else {
        showNotification("error", "Upload failed: " + (result.error ?? "Unknown error"));
      }
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingDevPageBg(false);
    }
  }

  async function handleSaveDevelopersPageHero() {
    setSaving(true);
    setNotification(null);
    try {
      await updateDevelopersPageHeroImage(developersPageHeroImage || null);
      showNotification("success", "Changes Saved");
      router.refresh();
    } catch {
      showNotification("error", "Changes Failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveTheme() {
    setSaving(true);
    setNotification(null);
    try {
      await updateThemeColors(theme);
      showNotification("success", "Changes Saved");
      router.refresh();
    } catch {
      showNotification("error", "Changes Failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveHomepage() {
    setSaving(true);
    setNotification(null);
    try {
      await updateHomepageContent(homepage);
      showNotification("success", "Changes Saved");
      router.refresh();
    } catch {
      showNotification("error", "Changes Failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveFlags() {
    setSaving(true);
    setNotification(null);
    try {
      await updateFeatureFlags(flags);
      showNotification("success", "Changes Saved");
      router.refresh();
    } catch {
      showNotification("error", "Changes Failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveDashboard() {
    setSaving(true);
    setNotification(null);
    try {
      await updateDashboardSettings(dashboardSettings);
      showNotification("success", "Changes Saved");
      router.refresh();
    } catch {
      showNotification("error", "Changes Failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleResetSiteToDefault() {
    if (
      !confirm(
        "Reset all site settings (theme, logo, homepage, feature flags, etc.) to defaults? This cannot be undone."
      )
    )
      return;
    setResetting(true);
    setNotification(null);
    try {
      await resetSiteToDefault();
      showNotification("success", "Site reset to defaults");
      router.refresh();
    } catch {
      showNotification("error", "Reset failed");
    } finally {
      setResetting(false);
    }
  }

  async function handleSaveDiscord() {
    setSaving(true);
    setNotification(null);
    try {
      await updateDiscordInviteUrl(discordUrl);
      showNotification("success", "Changes Saved");
      router.refresh();
    } catch {
      showNotification("error", "Changes Failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveSiteName() {
    setSaving(true);
    setNotification(null);
    try {
      await updateSiteName(siteName);
      showNotification("success", "Changes Saved");
      router.refresh();
    } catch {
      showNotification("error", "Changes Failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleFaviconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFavicon(true);
    setNotification(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadFavicon(formData);
      if ("url" in result) {
        setFaviconUrl(result.url);
        await updateFavicon(result.url);
        showNotification("success", "Changes Saved");
        router.refresh();
      } else {
        showNotification("error", "Upload failed: " + (result.error ?? "Unknown error"));
      }
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingFavicon(false);
    }
  }

  async function handleRemoveFavicon() {
    setSaving(true);
    setNotification(null);
    try {
      setFaviconUrl("");
      await updateFavicon(null);
      showNotification("success", "Changes Saved");
      router.refresh();
    } catch {
      showNotification("error", "Changes Failed");
    } finally {
      setSaving(false);
    }
  }

  const tabPanelClass = "rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4";
  const labelClass = "block text-sm font-medium text-[var(--color-foreground)]";
  const hintClass = "mt-0.5 text-xs text-[var(--color-muted)]";
  const inputClass = "mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-[var(--background)] px-3 py-2 text-sm";
  const btnClass = "mt-3 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm text-white disabled:opacity-50";

  return (
    <div className="mt-4">
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className={
            "mb-3 flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm " +
            (notification.type === "success"
              ? "border-green-600/50 bg-green-950/40 text-green-200"
              : "border-red-600/50 bg-red-950/40 text-red-200")
          }
        >
          <span>{notification.message}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="shrink-0 rounded px-1.5 py-0.5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}
      <div className="flex flex-wrap gap-1 border-b border-[var(--color-border)]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              setNotification(null);
            }}
            className={
              "rounded-t px-3 py-2 text-sm font-medium transition " +
              (activeTab === tab.id
                ? "bg-[var(--color-surface)] text-[var(--color-foreground)] shadow-[0_-1px_0_0_var(--color-surface)]"
                : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]")
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <div className={tabPanelClass}>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Site title (Mod Marketplace)</label>
              <p className={hintClass}>Displayed as the main site title (e.g. Mod Marketplace). Shown in header, footer, home hero, and as the browser tab title.</p>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Mod Marketplace"
                className={inputClass}
              />
              <button type="button" onClick={handleSaveSiteName} disabled={saving} className={btnClass}>
                Save site name
              </button>
            </div>
            <div>
              <span className={labelClass}>Browser tab</span>
              <p className={hintClass}>Favicon shown in the browser tab next to the tab title (site title above).</p>
              <div className="mt-1.5 flex items-center gap-3">
                {faviconUrl && (
                  <img src={faviconUrl} alt="Favicon" className="h-8 w-8 rounded border object-contain" />
                )}
                <label className="cursor-pointer rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-border)]">
                  {uploadingFavicon ? "Uploading…" : "Upload"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFaviconUpload} disabled={uploadingFavicon} />
                </label>
                {faviconUrl && (
                  <button type="button" onClick={handleRemoveFavicon} disabled={saving} className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-border)]">
                    Remove favicon
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className={labelClass}>Site logo</label>
              <div className="mt-1.5 flex items-center gap-3">
                {siteLogo && (
                  <img src={siteLogo} alt="Site logo" className="h-12 w-12 rounded border object-contain" />
                )}
                <label className="cursor-pointer rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-border)]">
                  {uploadingLogo ? "Uploading…" : "Upload"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                </label>
              </div>
            </div>
            <div>
              <label className={labelClass}>Discord invite URL</label>
              <p className={hintClass}>Used for purchase / Get product button.</p>
              <input
                type="url"
                value={discordUrl}
                onChange={(e) => setDiscordUrl(e.target.value)}
                onBlur={handleSaveDiscord}
                placeholder="https://discord.gg/..."
                className={inputClass}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "theme" && (
        <div className={tabPanelClass}>
          <p className="text-sm text-[var(--color-muted)]">
            Set hex color values (e.g. #3b82f6). These control the look of the site across pages.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {(
              [
                {
                  key: "primary",
                  label: "Primary",
                  description: "Main brand color — buttons, links, and key actions.",
                },
                {
                  key: "secondary",
                  label: "Secondary",
                  description: "Secondary actions and accents.",
                },
                {
                  key: "background",
                  label: "Background",
                  description: "Page background color.",
                },
                {
                  key: "surface",
                  label: "Surface",
                  description: "Cards, panels, sidebar, and raised surfaces.",
                },
                {
                  key: "foreground",
                  label: "Foreground",
                  description: "Primary text color.",
                },
                {
                  key: "muted",
                  label: "Muted",
                  description: "Secondary text, captions, and hints.",
                },
                {
                  key: "border",
                  label: "Border",
                  description: "Borders and dividers.",
                },
              ] as const
            ).map(({ key, label, description }) => (
              <div key={key} className="space-y-1">
                <label className="block text-sm font-medium text-[var(--color-foreground)]">
                  {label}
                </label>
                <p className={hintClass}>{description}</p>
                <input
                  type="text"
                  value={theme[key] ?? ""}
                  onChange={(e) => setTheme((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--background)] px-2 py-1.5 font-mono text-sm"
                  placeholder="#hex"
                />
              </div>
            ))}
          </div>
          <button type="button" onClick={handleSaveTheme} disabled={saving} className={btnClass}>
            Save theme
          </button>
        </div>
      )}

      {activeTab === "homepage" && (
        <div className={tabPanelClass}>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Hero title</label>
              <input
                type="text"
                value={homepage.heroTitle ?? ""}
                onChange={(e) => setHomepage((prev) => ({ ...prev, heroTitle: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Hero subtitle</label>
              <input
                type="text"
                value={homepage.heroSubtitle ?? ""}
                onChange={(e) => setHomepage((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Hero background image</label>
              <p className={hintClass}>Behind the hero on the home page.</p>
              {homepage.heroBackgroundImage && (
                <img
                  src={homepage.heroBackgroundImage}
                  alt="Hero preview"
                  className="mt-1.5 h-20 w-full max-w-sm rounded border border-[var(--color-border)] object-cover"
                />
              )}
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <label className="cursor-pointer rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-border)]">
                  {uploadingHeroBg ? "Uploading…" : "Upload"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleHeroBackgroundUpload} disabled={uploadingHeroBg} />
                </label>
                <input
                  type="url"
                  value={homepage.heroBackgroundImage ?? ""}
                  onChange={(e) => setHomepage((prev) => ({ ...prev, heroBackgroundImage: e.target.value || null }))}
                  placeholder="Or paste URL"
                  className="min-w-[180px] flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--background)] px-3 py-1.5 text-sm"
                />
              </div>
            </div>
          </div>
          <button type="button" onClick={handleSaveHomepage} disabled={saving} className={btnClass}>
            Save homepage
          </button>
        </div>
      )}

      {activeTab === "developers" && (
        <div className={tabPanelClass}>
          <label className={labelClass}>Developers page hero image</label>
          <p className={hintClass}>Background for the Developers page hero.</p>
          {developersPageHeroImage && (
            <img
              src={developersPageHeroImage}
              alt="Developers hero preview"
              className="mt-1.5 h-20 w-full max-w-sm rounded border border-[var(--color-border)] object-cover"
            />
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <label className="cursor-pointer rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-border)]">
              {uploadingDevPageBg ? "Uploading…" : "Upload"}
              <input type="file" accept="image/*" className="hidden" onChange={handleDevelopersPageBackgroundUpload} disabled={uploadingDevPageBg} />
            </label>
            <input
              type="url"
              value={developersPageHeroImage}
              onChange={(e) => setDevelopersPageHeroImage(e.target.value)}
              placeholder="Or paste URL"
              className="min-w-[180px] flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--background)] px-3 py-1.5 text-sm"
            />
          </div>
          <button type="button" onClick={handleSaveDevelopersPageHero} disabled={saving} className={btnClass}>
            Save developers page image
          </button>
        </div>
      )}

      {activeTab === "features" && (
        <div className={tabPanelClass}>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Feature flags</h3>
              <div className="mt-2 flex flex-wrap gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={flags.storeEnabled ?? true}
                    onChange={(e) => setFlags((prev) => ({ ...prev, storeEnabled: e.target.checked }))}
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-sm">Store enabled</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={flags.registrationOpen ?? true}
                    onChange={(e) => setFlags((prev) => ({ ...prev, registrationOpen: e.target.checked }))}
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-sm">Registration open</span>
                </label>
              </div>
              <button type="button" onClick={handleSaveFlags} disabled={saving} className={btnClass}>
                Save flags
              </button>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Client dashboard</h3>
              <p className={hintClass}>Title, hero image, and stat cards.</p>
              <div className="mt-2 space-y-2">
                <div>
                  <span className="text-xs text-[var(--color-muted)]">Dashboard title</span>
                  <input
                    type="text"
                    value={dashboardSettings.dashboardTitle ?? ""}
                    onChange={(e) => setDashboardSettings((prev) => ({ ...prev, dashboardTitle: e.target.value || null }))}
                    placeholder="My Dashboard"
                    className="mt-0.5 w-full rounded-lg border border-[var(--color-border)] bg-[var(--background)] px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <span className="text-xs text-[var(--color-muted)]">Dashboard hero image URL</span>
                  <input
                    type="url"
                    value={dashboardSettings.dashboardHeroImageUrl ?? ""}
                    onChange={(e) =>
                      setDashboardSettings((prev) => ({ ...prev, dashboardHeroImageUrl: e.target.value || null }))
                    }
                    placeholder="https://..."
                    className="mt-0.5 w-full rounded-lg border border-[var(--color-border)] bg-[var(--background)] px-3 py-1.5 text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-3 pt-1">
                  {[
                    { key: "showStatAvailableDownloads", label: "Available Downloads" },
                    { key: "showStatTotalProducts", label: "Total Products" },
                    { key: "showStatMemberSince", label: "Member Since" },
                    { key: "showStatAssignedRoles", label: "Assigned Roles" },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={
                          (dashboardSettings as Record<string, boolean | undefined>)[key] ?? true
                        }
                        onChange={(e) =>
                          setDashboardSettings((prev) => ({ ...prev, [key]: e.target.checked }))
                        }
                        className="h-4 w-4 rounded"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button type="button" onClick={handleSaveDashboard} disabled={saving} className={btnClass}>
                Save dashboard settings
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "danger" && (
        <div className={tabPanelClass}>
          <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Reset site to default</h3>
          <p className={hintClass}>
            Reset all site settings (theme, logo, homepage, feature flags, Discord URL, dashboard settings) to their default values. This does not delete developers, users, or products.
          </p>
          <button
            type="button"
            onClick={handleResetSiteToDefault}
            disabled={resetting}
            className="mt-3 rounded-lg border border-red-500/50 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 disabled:opacity-50"
          >
            {resetting ? "Resetting…" : "Reset site to default"}
          </button>
        </div>
      )}
    </div>
  );
}
