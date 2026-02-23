import { prisma } from "@/lib/db";
import { ProductForm } from "../product-form";

export default async function NewProductPage() {
  const developers = await prisma.developer.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-foreground)]">New product</h1>
      <ProductForm developers={developers} />
    </div>
  );
}
