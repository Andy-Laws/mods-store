# Setup checklist

Use this after copying `.env.example` to `.env` and filling in your values.

## 1. Environment (`.env`)

| Variable | Required | What to set |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | `mysql://USER:PASSWORD@HOST:3306/DATABASE` — your MySQL (or MariaDB) URL. Encode special chars in password (e.g. `@` → `%40`). |
| `AUTH_SECRET` | Yes | Run `openssl rand -base64 32` or use any long random string. |
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` for local dev; `https://yourdomain.com` in production. |
| `DISCORD_CLIENT_ID` | Yes | From [Discord Developer Portal](https://discord.com/developers/applications) → your app → OAuth2. |
| `DISCORD_CLIENT_SECRET` | Yes | Same place as Client ID. |
| `NEXT_PUBLIC_DISCORD_INVITE_URL` | Optional | Discord server invite for the purchase button (e.g. `https://discord.gg/xxxx`). |

**Uploads** are stored locally: images and site assets in `public/uploads/`, product download files in `storage/product-files/` (both are in `.gitignore`). Run **once per environment** so all uploads work (product images, product files, developer logos/banners, site logo/favicon/backgrounds):

```bash
npm run setup:uploads
```

This uses a Node.js script, so it works on **Windows** without Bash. If the app runs as a different user (e.g. `node`), on Unix run: `APP_USER=node npm run setup:uploads`. You do not need to run this again unless you redeploy and the dirs are recreated.

**Discord OAuth:** In your Discord application, OAuth2 → Redirects add:  
`http://localhost:3000/api/auth/callback/discord` (and your production URL when you deploy).

## 2. Database

1. Start MySQL (or ensure your hosted MySQL is reachable).
2. Create a database if needed, e.g. `CREATE DATABASE s10_subsqlwebsite;`
3. Apply migrations and seed:

   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```

If `migrate deploy` fails with “Can’t reach database server”, check that MySQL is running and that `DATABASE_URL` host/port/user/password are correct.

## 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with Discord; the **first user** to sign in becomes an **admin** and can open `/admin`. All uploads (product images, product files, developer logos/banners, site assets) are saved under `public/uploads/` and `storage/`. If an upload fails, the UI will show the error (e.g. run `npm run setup:uploads` if you see permission or missing-directory messages).
