# Mod Marketplace

A Next.js marketplace where developers have vendor pages and sell products. Users sign in with Discord; purchases are handled via Discord (join server to pay). Admins manage developers, products, and site settings.

## Stack

- **Next.js 16** (App Router), **Tailwind CSS 4**, **TypeScript**
- **Prisma 7** + **MySQL** (with `@prisma/adapter-mariadb`)
- **NextAuth** (Discord OAuth)
- **Local file storage** (product images, logos, banners in `public/uploads/`; downloadable files in `storage/`)
- **Radix UI** (dropdowns, dialogs, tabs)

## Setup

1. **Environment**

   Copy `.env.example` to `.env` and set:

   - `DATABASE_URL` – MySQL connection string, e.g. `mysql://USER:PASSWORD@HOST:3306/DATABASE`. Percent-encode special characters in the password.
   - `AUTH_SECRET` – e.g. `openssl rand -base64 32`
   - `NEXTAUTH_URL` – app URL (e.g. `http://localhost:3000` in dev, `https://yourdomain.com` in prod). Required for Discord OAuth callback.
   - `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` – from [Discord Developer Portal](https://discord.com/developers/applications). In the Discord app, set Redirect URI to `{NEXTAUTH_URL}/api/auth/callback/discord`.
   - `NEXT_PUBLIC_DISCORD_INVITE_URL` – (optional) invite link for the “Get this product” button.

   Uploads are stored locally (`public/uploads/` and `storage/`); no cloud storage is required.

2. **Database**

   ```bash
   npm run db:migrate   # or: npx prisma migrate deploy
   npm run db:seed      # default site settings
   ```

   For local migrations: `npx prisma migrate dev`.

3. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). The **first user to sign in with Discord** is given the **admin** role and can access `/admin`.

## Features

- **Public**: Homepage, developers list, developer profile (banner, logo, description, social links, products), product page (images, description, features, compatibility, changelog, purchase CTA).
- **Dashboard** (`/dashboard`): Profile (Discord avatar/username), “My purchases” with download links. Downloads are gated by the `Purchase` table (admin grants access after payment in Discord).
- **Admin** (`/admin`): Developers CRUD (name, slug, logo, banner, description, social links), Products CRUD (assign to developer, images, versions with changelog and file upload, pricing, published), “Grant access” on product edit (by user email), Settings (site logo, theme colors, homepage content, feature flags, Discord invite URL).

## Scripts

- `npm run dev` – development
- `npm run build` / `npm run start` – production
- `npm run db:generate` – regenerate Prisma client
- `npm run db:migrate` – apply migrations
- `npm run db:seed` – seed default site settings

## Granting access

After a user pays in Discord, an admin can grant access: go to **Admin → Products → Edit [product]** and use **Grant access** with the user’s Discord account email. The user will then see the product in Dashboard and can download the latest version file.
