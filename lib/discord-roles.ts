/**
 * Discord guild member role assignment via Bot token.
 * Used when granting/revoking product access so the user gets the product's
 * Discord role(s) in the server.
 */

const DISCORD_API_BASE = "https://discord.com/api/v10";

async function getGuildMember(guildId: string, userId: string, botToken: string): Promise<{ roles: string[] } | null> {
  const res = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/members/${userId}`, {
    headers: { Authorization: `Bot ${botToken}` },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { roles?: string[] };
  const roles = Array.isArray(data?.roles) ? data.roles : [];
  return { roles };
}

async function setGuildMemberRoles(
  guildId: string,
  userId: string,
  roleIds: string[],
  botToken: string
): Promise<boolean> {
  const res = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/members/${userId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ roles: roleIds }),
  });
  return res.ok;
}

/**
 * Add the given role IDs to the guild member. Merges with existing roles.
 * No-op if DISCORD_BOT_TOKEN or DISCORD_GUILD_ID is missing.
 */
export async function addRolesToGuildMember(
  guildId: string,
  discordUserId: string,
  roleIds: string[]
): Promise<void> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken || !guildId || roleIds.length === 0) return;

  const member = await getGuildMember(guildId, discordUserId, botToken);
  if (!member) {
    console.warn("[discord-roles] Could not fetch guild member", { guildId, discordUserId });
    return;
  }

  const existing = new Set(member.roles);
  roleIds.forEach((id) => existing.add(id));
  const newRoles = Array.from(existing);

  const ok = await setGuildMemberRoles(guildId, discordUserId, newRoles, botToken);
  if (!ok) {
    console.warn("[discord-roles] Failed to add roles to guild member", { guildId, discordUserId, roleIds });
  }
}

/**
 * Remove the given role IDs from the guild member.
 * No-op if DISCORD_BOT_TOKEN or DISCORD_GUILD_ID is missing.
 */
export async function removeRolesFromGuildMember(
  guildId: string,
  discordUserId: string,
  roleIds: string[]
): Promise<void> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken || !guildId || roleIds.length === 0) return;

  const member = await getGuildMember(guildId, discordUserId, botToken);
  if (!member) {
    console.warn("[discord-roles] Could not fetch guild member for removal", { guildId, discordUserId });
    return;
  }

  const toRemove = new Set(roleIds);
  const newRoles = member.roles.filter((id) => !toRemove.has(id));

  const ok = await setGuildMemberRoles(guildId, discordUserId, newRoles, botToken);
  if (!ok) {
    console.warn("[discord-roles] Failed to remove roles from guild member", { guildId, discordUserId, roleIds });
  }
}
