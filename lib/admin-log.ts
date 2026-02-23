import { prisma } from "@/lib/db";

type LogMeta = Record<string, unknown>;

async function writeLog(data: {
  type: "activity" | "system";
  action: string;
  message: string;
  meta?: LogMeta | null;
  userId?: string | null;
}) {
  try {
    const delegate = (prisma as { adminLog?: { create: (args: unknown) => Promise<unknown> } }).adminLog;
    if (!delegate?.create) {
      console.error("[admin-log] prisma.adminLog is not available. Run: npx prisma generate");
      return;
    }
    await delegate.create({
      data: {
        type: data.type,
        action: data.action,
        message: data.message,
        meta: data.meta ?? undefined,
        userId: data.userId ?? undefined,
      },
    });
  } catch (err) {
    console.error("[admin-log] Failed to write log:", err);
  }
}

export async function logActivity(params: {
  action: string;
  message: string;
  meta?: LogMeta | null;
  userId?: string | null;
}) {
  const { action, message, meta, userId } = params;
  await writeLog({ type: "activity", action, message, meta, userId });
}

export async function logSystem(params: {
  action: string;
  message: string;
  meta?: LogMeta | null;
}) {
  const { action, message, meta } = params;
  await writeLog({ type: "system", action, message, meta });
}
