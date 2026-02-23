import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db";
import type { Role } from "@/app/generated/prisma/client";

const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID?.trim() || null;

/** Fetch the current user's roles in the Discord guild and sync to User.accessRoleIds. Requires DISCORD_GUILD_ID. */
async function syncDiscordRolesToUser(discordId: string, accessToken: string): Promise<void> {
  if (!DISCORD_GUILD_ID) return;
  const res = await fetch(
    `https://discord.com/api/v10/users/@me/guilds/${DISCORD_GUILD_ID}/member`,
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }
  );
  if (!res.ok) return;
  const data = (await res.json()) as { roles?: string[] };
  const roleIds = Array.isArray(data?.roles) ? data.roles : [];
  await prisma.user.update({
    where: { discordId },
    data: { accessRoleIds: roleIds.length > 0 ? roleIds : Prisma.JsonNull },
  });
}

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: "identify email guilds guilds.members.read",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account?.providerAccountId || !user.email) return true;
      const discordId = account.providerAccountId;
      const existing = await prisma.user.findUnique({ where: { discordId } });
      const isFirstUser = (await prisma.user.count()) === 0;
      if (existing) {
        await prisma.user.update({
          where: { discordId },
          data: {
            username: user.name ?? undefined,
            email: user.email ?? undefined,
            image: user.image ?? undefined,
          },
        });
      } else {
        await prisma.user.create({
          data: {
            discordId,
            username: user.name ?? undefined,
            email: user.email ?? undefined,
            image: user.image ?? undefined,
            role: isFirstUser ? "admin" : "user",
          },
        });
      }
      const token = (account as { access_token?: string }).access_token;
      if (token) {
        await syncDiscordRolesToUser(discordId, token).catch(() => {});
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { discordId: token.sub ?? "" },
        });
        (session.user as { id?: string; role?: Role }).id = dbUser?.id;
        (session.user as { id?: string; role?: Role }).role = ((token as { role?: Role }).role ?? "user") as Role;
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account?.providerAccountId) token.sub = account.providerAccountId;
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { discordId: token.sub },
        });
        (token as { role?: Role }).role = dbUser?.role ?? "user";
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.AUTH_SECRET,
};
