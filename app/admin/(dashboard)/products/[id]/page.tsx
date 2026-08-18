import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import ProductForm from "@/components/admin/ProductForm";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();
  const product = await Product.findById(id).lean();
  if (!product) notFound();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-800">Edit Product</h1>
        <DeleteProductButton productId={String(product._id)} />
      </div>
      <div className="mt-6">
        <ProductForm
          productId={String(product._id)}
          initial={JSON.parse(JSON.stringify(product))}
        />
      </div>
    </div>
  );
}
