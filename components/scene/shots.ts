import type { GroupKey, V } from "./car"

/*
  Camera "shots" the scroll director blends between. Each DOM element with a
  data-shot attribute anchors one shot at its vertical center; the car moves to
  that shot as the element reaches the middle of the screen.
*/

export type Shot = {
  /** Camera position and look-at target. Blended in spherical coordinates around the target. */
  cam: V
  target: V
  /** 0 = assembled, 1 = fully exploded. */
  explode: number
  /** Groups to spotlight; null lights the whole car without outlines. */
  focus: readonly GroupKey[] | null
  /** Blend toward the hidden-line "digital twin" view. */
  xray: number
  /** Wheel spin and terrain flow speed. */
  drive: number
  /** Where the car sits on screen: "hero" layout or beside step copy. */
  layout: "hero" | "side"
  /** Callout label for the spotlighted part. */
  label?: string
}

const corners: GroupKey[] = ["fl", "fr", "rl", "rr"]
const all = null

export const shots: Record<string, Shot> = {
  hero: { cam: [2.72, 1.2, 2.95], target: [0.05, 0.6, 0], explode: 0, focus: all, xray: 0, drive: 0, layout: "hero" },
  overview: { cam: [3.7, 2.5, 3.9], target: [-0.05, 0.85, 0], explode: 1, focus: all, xray: 0, drive: 0, layout: "side" },
  powertrain: { cam: [-2.3, 1.45, -2.55], target: [-0.55, 0.62, 0], explode: 0.45, focus: ["powertrain"], xray: 0, drive: 0, layout: "side", label: "Engine / CVT / gearbox" },
  dynamics: { cam: [2.55, 0.75, 2.75], target: [0.35, 0.38, 0.1], explode: 0.45, focus: corners, xray: 0, drive: 0, layout: "side", label: "Suspension / steering / brakes" },
  chassis: { cam: [2.9, 2.75, -2.7], target: [0, 0.78, 0], explode: 0.3, focus: ["chassis", "skid"], xray: 0, drive: 0, layout: "side", label: "Frame" },
  ergonomics: { cam: [1.75, 2.5, 1.65], target: [0.1, 0.75, 0], explode: 0.45, focus: ["ergonomics"], xray: 0, drive: 0, layout: "side", label: "Seat / controls / firewall" },
  electronics: { cam: [1.7, 2.05, -1.95], target: [0.2, 1.05, -0.05], explode: 0.45, focus: ["electronics"], xray: 0, drive: 0, layout: "side", label: "Dash / data logger / harness" },
  software: { cam: [-3.0, 2.1, 3.05], target: [0, 0.7, 0], explode: 0.2, focus: all, xray: 1, drive: 0, layout: "side" },
  "public-relations": { cam: [3.3, 0.62, 2.15], target: [0.1, 0.55, 0], explode: 0, focus: ["bodyL", "bodyR"], xray: 0, drive: 0.55, layout: "side", label: "Team livery" },
  business: { cam: [0.6, 5.1, 0.9], target: [0, 0.4, 0], explode: 0.15, focus: all, xray: 0.55, drive: 0, layout: "side" },
  "corporate-relations": { cam: [0.4, 0.95, 3.7], target: [0, 0.6, 0], explode: 0.55, focus: ["bodyL", "bodyR"], xray: 0, drive: 0, layout: "side", label: "Body panels" },
  logistics: { cam: [-1.2, 1.05, 3.75], target: [0.2, 0.55, 0], explode: 0, focus: all, xray: 0, drive: 1, layout: "side" },
}
