import Image from "next/image";
import Link from "next/link";
import { InterestList } from "@/components/account/InterestList";
import { getInterests } from "@/lib/account";
import { formatDate, statusLabel, statusLine } from "@/lib/format";
import { imageUrl } from "@/lib/images";

export default async function ListPage() {
  const rows = await getInterests();

  return (
    <InterestList
      items={rows.map(({ product, since }) => ({
        id: product.id,
        name: product.name,
        row: (
          <div className="grid grid-cols-[4.5rem_1fr] gap-4 py-5 pr-20 md:grid-cols-12 md:items-center md:gap-6">
            <Link href={`/pieces/${product.slug}`} className="relative aspect-[3/4] overflow-hidden bg-bone-2 md:col-span-1">
              {product.images[0] && <Image src={imageUrl(product.images[0].src)} alt="" fill sizes="80px" className="object-cover" />}
            </Link>
            <div className="md:col-span-4">
              <p className="t-meta text-stone">
                {product.code} · {product.category?.name}
              </p>
              <Link href={`/pieces/${product.slug}`} className="t-title link-line mt-1 inline-block">
                {product.name}
              </Link>
            </div>
            <div className="col-start-2 md:col-span-4 md:col-start-auto">
              <p className="t-meta flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-signal" aria-hidden />
                {statusLabel[product.status]}
              </p>
              <p className="mt-1 text-sm text-stone">{statusLine[product.status]}</p>
            </div>
            <p className="t-meta col-start-2 text-stone md:col-span-2 md:col-start-auto">Since {formatDate(since)}</p>
          </div>
        ),
      }))}
    />
  );
}
