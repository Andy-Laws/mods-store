/**
 * Re-sync the current user's Discord roles to User.accessRoleIds.
 * Used when the user loads the dashboard so new roles appear without re-login.
 */

import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db";

const DISCORD_API_BASE = "https://discord.com/api/v10";

export async function syncUserRolesFromDiscord(userId: string): Promise<void> {
  const guildId = process.env.DISCORD_GUILD_ID?.trim();
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!guildId || !botToken) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { discordId: true },
  });
  if (!user?.discordId) return;

  const res = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/members/${user.discordId}`, {
    headers: { Authorization: `Bot ${botToken}` },
    cache: "no-store",
  });
  if (!res.ok) return;

  const data = (await res.json()) as { roles?: string[] };
  const roleIds = Array.isArray(data?.roles) ? data.roles : [];

  await prisma.user.update({
    where: { id: userId },
    data: { accessRoleIds: roleIds.length > 0 ? roleIds : Prisma.JsonNull },
  });
}
