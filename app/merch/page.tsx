import type { Metadata } from "next"
import { ProductCard } from "@/components/home/merch"
import PageShell from "@/components/site/page-shell"
import { products, storeUrl } from "@/lib/merch"
import Arrow from "@/components/site/arrow"

export const metadata: Metadata = {
  title: "Merch",
  description: "Shop Longhorn Baja Racing team gear on Printful.",
  alternates: { canonical: "/merch/" },
  openGraph: { url: "/merch/" },
}

export default function Page() {
  return (
    <PageShell
      index="05"
      label="Merch"
      title="Merch"
      lede="Rep Longhorn Baja on campus, in the shop, and at the track. Shop our collection on Printful for sizes, colors, and current pricing."
      action={<a href={storeUrl} target="_blank" rel="noopener noreferrer" className="button button--primary">Visit the full store <Arrow /></a>}
    >
      <div className="product-grid">
        {products.map((product) => <ProductCard key={product.id} product={product} as="article" />)}
      </div>
    </PageShell>
  )
}
