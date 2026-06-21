"use client"

import { useState } from "react"
import Section from "@/components/section"

const products = [
  { name: "Evergreen Hoodie", type: "Hoodie", accent: "orange" },
  { name: "Yearly Hoodie", type: "Hoodie", accent: "gray" },
  { name: "Longhorn Baja Sticker", type: "Sticker", accent: "orange" },
  { name: "Longhorn Baja Hat", type: "Hat", accent: "gray" },
  { name: "Evergreen Shirt", type: "Shirt", accent: "orange" },
  { name: "Yearly Shirt", type: "Shirt", accent: "gray" },
] as const

export default function Merch() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)

  return (
    <Section label="GEAR UP" title="Merch" anchor="merch">
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <p className="max-w-2xl text-muted-foreground">
          Team gear is in the works. Preview the first collection now and check back when the Longhorn Baja store opens.
        </p>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Shopify store coming soon</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, index) => (
          <button
            key={product.name}
            type="button"
            onClick={() => setSelectedProduct(product.name)}
            className="group overflow-hidden rounded-xl border border-white/10 bg-card text-left transition duration-300 hover:-translate-y-1 hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            aria-label={`${product.name}, coming soon`}
          >
            <div className={`merch-distressed relative flex aspect-[4/3] items-center justify-center overflow-hidden ${product.accent === "orange" ? "merch-distressed-orange" : "merch-distressed-gray"}`}>
              <span className="select-none text-5xl font-black uppercase tracking-[-0.08em] text-white/10 sm:text-6xl">
                {product.type}
              </span>
              <div className="absolute -left-12 top-7 w-[calc(100%+6rem)] -rotate-6 border-y border-white/25 bg-primary py-3 text-center shadow-2xl">
                <span className="text-sm font-black uppercase tracking-[0.3em] text-white">Coming Soon</span>
              </div>
              <span className="absolute bottom-4 right-5 font-mono text-xs text-white/35">DROP {String(index + 1).padStart(2, "0")}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-white/10 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{product.type}</p>
                <h3 className="mt-1 text-lg font-bold text-foreground">{product.name}</h3>
              </div>
              <span className="text-2xl text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true">&#8594;</span>
            </div>
          </button>
        ))}
      </div>

      <p className="mt-6 min-h-6 text-sm text-muted-foreground" aria-live="polite">
        {selectedProduct ? `${selectedProduct} is coming soon. Shopify links will be added when the store opens.` : "Select an item for availability details."}
      </p>
    </Section>
  )
}
