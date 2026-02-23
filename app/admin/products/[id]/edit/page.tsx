import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductForm } from "../../product-form";
import { GrantAccess } from "../../grant-access";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, developers, purchases] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        versions: { orderBy: { releaseDate: "desc" }, include: { file: true } },
        files: { include: { versionRef: true } },
      },
    }),
    prisma.developer.findMany({ orderBy: { name: "asc" } }),
    prisma.purchase.findMany({
      where: { productId: id },
      include: { user: { select: { id: true, email: true, username: true } } },
      orderBy: { grantedAt: "desc" },
    }),
  ]);
  if (!product) notFound();
  const accessRoleIds = Array.isArray(product.accessRoleIds)
    ? (product.accessRoleIds as string[]).map((s) => String(s).trim()).filter(Boolean)
    : [];
  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Edit product</h1>
      <ProductForm product={product} developers={developers} />
      <GrantAccess productId={product.id} purchases={purchases} accessRoleIds={accessRoleIds} />
    </div>
  );
}
