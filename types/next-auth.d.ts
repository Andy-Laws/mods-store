import type { Role } from "@/app/generated/prisma/client";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: Role;
  }
  interface Session {
    user: User & { id?: string; role?: Role };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
  }
}
