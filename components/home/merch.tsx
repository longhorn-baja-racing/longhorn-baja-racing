import Image from "next/image"
import Link from "next/link"
import SectionIntro from "@/components/site/section-intro"
import { products, storeUrl } from "@/lib/merch"
import { asset } from "@/lib/site"
import MerchRail from "./merch-rail"
import Arrow from "@/components/site/arrow"

export type Product = (typeof products)[number]

export function ProductCard({ product, as: Tag = "li" }: { product: Product; as?: "li" | "article" }) {
  return (
    <Tag className="product">
      <a className="product-link" href={`${storeUrl}product/${product.slug}`} target="_blank" rel="noopener noreferrer" aria-label={`Shop ${product.name} on Printful (opens in a new tab)`}>
        <span className="product-image">
          <Image src={asset(`/merch/${product.imageFile}`)} alt={product.id === 1212998 ? `${product.name}, printed back view` : product.name} fill sizes="(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 22vw" />
        </span>
        <span className="product-text">
          <span className="product-type">{product.type}</span>
          <span className="product-name">{product.name}</span>
          <span className="product-price">From ${product.startingPrice.toFixed(2)}</span>
        </span>
      </a>
    </Tag>
  )
}

export default function Merch() {
  return (
    <section id="merch" className="section section--merch" aria-labelledby="merch-title">
      <div className="shell">
        <SectionIntro
          index="05"
          label="Merch"
          id="merch-title"
          title={<>Rep the team.</>}
          lede="Rep Longhorn Baja on campus, in the shop, and at the track. Shop our collection on Printful for sizes, colors, and current pricing."
        >
          <div className="intro-actions">
            <Link className="button button--ghost" href="/merch/">See all {products.length} items</Link>
            <a className="button button--primary" href={storeUrl} target="_blank" rel="noopener noreferrer">Visit the store <Arrow /></a>
          </div>
        </SectionIntro>
      </div>
      <MerchRail>
        {products.slice(0, 10).map((p) => <ProductCard key={p.id} product={p} />)}
      </MerchRail>
    </section>
  )
}
