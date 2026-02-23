import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { DeveloperForm } from "../../developer-form";

export default async function EditDeveloperPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const developer = await prisma.developer.findUnique({ where: { id } });
  if (!developer) notFound();
  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Edit developer</h1>
      <DeveloperForm developer={developer} />
    </div>
  );
}
