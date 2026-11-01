import Image from "next/image"
import Section from "@/components/section"
import { products, storeUrl } from "@/lib/merch"

const base = process.env.NEXT_PUBLIC_BASE_PATH || ""

export default function Merch() {
  return (
    <Section label="GEAR UP" title="Merch" anchor="merch">
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <p className="max-w-2xl text-muted-foreground">
          Rep Longhorn Baja on campus, in the shop, and at the track. Shop our collection on Printful for sizes, colors, and current pricing.
        </p>
        <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="action-link shrink-0">
          Visit the full store ↗
        </a>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <article key={product.id} className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-card">
            <div className="relative aspect-[4/3] overflow-hidden bg-[#f4f4f4]">
              <Image src={`${base}/merch/${product.imageFile}`} alt={product.id === 1212998 ? `${product.name}, printed back view` : product.name} fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-contain p-4" />
            </div>
            <div className="flex flex-1 flex-col items-start border-t border-white/10 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-text">{product.type}</p>
              <h2 className="mt-2 text-2xl text-foreground">{product.name}</h2>
              <p className="mt-3 text-sm text-muted-foreground">From ${product.startingPrice.toFixed(2)}</p>
              <a href={`${storeUrl}product/${product.slug}`} target="_blank" rel="noopener noreferrer"
                aria-label={`Shop ${product.name} on Printful (opens in a new tab)`}
                className="mt-auto pt-5 text-sm font-bold text-primary-text underline underline-offset-4 transition hover:text-white">
                Shop this item ↗
              </a>
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}

