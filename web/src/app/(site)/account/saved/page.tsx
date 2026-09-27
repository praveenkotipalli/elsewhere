import { SavedGrid } from "@/components/account/SavedGrid";
import { PieceCard } from "@/components/product/PieceCard";
import { getSavedProducts } from "@/lib/account";

export default async function SavedPage() {
  const rows = await getSavedProducts();
  return (
    <SavedGrid
      items={rows.map(({ product }) => ({
        id: product.id,
        card: <PieceCard product={product} sizes="(min-width: 768px) 25vw, 50vw" />,
      }))}
    />
  );
}
