"use client";

export function PurchaseButton({
  discordInviteUrl,
  productName,
}: {
  discordInviteUrl: string;
  productName: string;
}) {
  const href = discordInviteUrl || "#";
  const isExternal = !!discordInviteUrl;

  return (
    <a
      href={href}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="block w-full rounded-xl bg-[var(--color-primary)] px-6 py-3 text-center font-medium text-white transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
    >
      {discordInviteUrl ? "Buy now" : "Join Discord to purchase"}
    </a>
  );
}
