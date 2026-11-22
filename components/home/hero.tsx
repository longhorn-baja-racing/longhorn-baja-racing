import { siteConfig } from "@/lib/site"
import ScrollCue from "./scroll-cue"
import Arrow from "@/components/site/arrow"

export default function Hero() {
  return (
    <section id="top" className="hero" data-scene-section data-shot="hero" aria-labelledby="hero-title">
      <div className="shell hero-inner">
        <p className="hero-kicker">
          <span className="live-dot" aria-hidden="true" />
          The University of Texas at Austin <span className="hero-kicker-sep" aria-hidden="true">/</span> Baja SAE
        </p>
        <h1 id="hero-title" className="hero-title">
          <span className="hero-word">Design.</span> <span className="hero-word">Build.</span> <span className="hero-word hero-word--accent">Race.</span>
        </h1>
        <p className="hero-lede">
          Hands-on engineering and off-road racing. Join a team building a single-seat vehicle to compete at Baja SAE.
        </p>
        <div className="hero-actions">
          <a className="button button--primary" href={siteConfig.applyUrl} target="_blank" rel="noopener noreferrer">
            Join the Team <Arrow />
          </a>
          <a className="button button--ghost" href={siteConfig.sponsorUrl} target="_blank" rel="noopener noreferrer">
            Become a Sponsor
          </a>
        </div>
      </div>
      <div className="shell hero-foot">
        <dl className="hero-meta">
          <div><dt>Base</dt><dd>Austin, Texas</dd></div>
          <div><dt>Coordinates</dt><dd>30.2849 N, 97.7341 W</dd></div>
          <div><dt>Series</dt><dd>Baja SAE</dd></div>
        </dl>
        <ScrollCue target="about" />
      </div>
    </section>
  )
}
