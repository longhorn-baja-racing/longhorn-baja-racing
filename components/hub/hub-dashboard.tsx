"use client"

import { useId, useState } from "react"
import Link from "next/link"
import { resourceCategories, sortResources, type HubPayload, type Resource } from "@/lib/hub/schema"
import { loadLeadsSubteam, saveLeadsSubteam } from "@/lib/hub/session"
import { getSubteam, isSubteamId, subteams, type SubteamId } from "@/lib/subteams"
import { siteConfig } from "@/lib/site"

interface HubDashboardProps {
  payload: HubPayload
  onLogOut: () => void
  onSwitchTeam: () => void
}

/** The public application form, always offered to leads alongside their recruiting links. */
const publicApplication: Resource = {
  id: "public-application",
  label: "Public application form",
  description: "The form prospective members use to apply. Share this link freely.",
  category: "Recruiting",
  url: siteConfig.applyUrl,
  order: -1,
}

export default function HubDashboard({ payload, onLogOut, onSwitchTeam }: HubDashboardProps) {
  const { role } = payload
  const heading =
    role.kind === "leads" ? "Leads dashboard" : role.kind === "subteam" ? `Welcome, ${getSubteam(role.subteam).title}` : "Team resources"
  const scope =
    role.kind === "leads" ? "Leads access" : role.kind === "subteam" ? `${getSubteam(role.subteam).title} access` : "General team access"

  const leads = payload.leads ?? []
  const recruiting = role.kind === "leads" ? [publicApplication, ...leads.filter((item) => item.category === "Recruiting")] : []
  const leadership = leads.filter((item) => item.category !== "Recruiting")

  return (
    <div>
      <div className="mb-10 flex flex-col justify-between gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end">
        <div>
          <p className="eyebrow mb-3">{scope}</p>
          <h2 className="text-5xl text-white md:text-6xl">{heading}</h2>
        </div>
        <nav aria-label="Hub actions" className="flex flex-wrap gap-3">
          <Link href="/calendar/" prefetch={false} className="hub-action">Calendar</Link>
          <button type="button" onClick={onSwitchTeam} className="hub-action">Switch team</button>
          <button type="button" onClick={onLogOut} className="hub-action">Log out</button>
        </nav>
      </div>

      {role.kind === "leads" && (
        <>
          <ResourceSection title="Leadership" resources={leadership} emptyText="No leadership resources have been added yet." />
          <ResourceSection title="Recruiting" resources={recruiting} groupByCategory={false} />
        </>
      )}

      <ResourceSection title="Team resources" resources={payload.general} emptyText="No team resources have been added yet." />

      {role.kind === "subteam" && (
        <ResourceSection
          title={`${getSubteam(role.subteam).title} resources`}
          resources={payload.subteams[role.subteam] ?? []}
          emptyText={`No ${getSubteam(role.subteam).title} resources have been added yet.`}
        />
      )}

      {role.kind === "leads" && <SubteamBrowser payload={payload} />}
    </div>
  )
}

function SubteamBrowser({ payload }: { payload: HubPayload }) {
  // The dashboard only renders on the client after unlocking, so storage is available here.
  const [selected, setSelected] = useState<SubteamId>(() => {
    const saved = loadLeadsSubteam()
    return isSubteamId(saved) ? saved : subteams[0].id
  })
  const selectId = useId()

  const subteam = getSubteam(selected)
  return (
    <section aria-labelledby={`${selectId}-heading`} className="mb-12">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h3 id={`${selectId}-heading`} className="text-3xl text-white">Subteams</h3>
        <div>
          <label htmlFor={selectId} className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-white/70">
            Subteam
          </label>
          <select
            id={selectId}
            value={selected}
            onChange={(event) => {
              if (!isSubteamId(event.target.value)) return
              setSelected(event.target.value)
              saveLeadsSubteam(event.target.value)
            }}
            className="hub-input w-full sm:w-64"
          >
            {subteams.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div aria-live="polite">
        <ResourceGroups resources={payload.subteams[selected] ?? []} emptyText={`No ${subteam.title} resources have been added yet.`} />
      </div>
    </section>
  )
}

function ResourceSection({
  title,
  resources,
  emptyText,
  groupByCategory = true,
}: {
  title: string
  resources: readonly Resource[]
  emptyText?: string
  groupByCategory?: boolean
}) {
  const headingId = useId()
  if (resources.length === 0 && !emptyText) return null
  return (
    <section aria-labelledby={headingId} className="mb-12">
      <h3 id={headingId} className="mb-5 text-3xl text-white">{title}</h3>
      {groupByCategory ? <ResourceGroups resources={resources} emptyText={emptyText} /> : <ResourceGrid resources={sortResources(resources)} />}
    </section>
  )
}

/** One grid per section, ordered by category, with the category shown on each card. */
function ResourceGroups({ resources, emptyText }: { resources: readonly Resource[]; emptyText?: string }) {
  if (resources.length === 0) return <p className="hub-panel p-5 text-sm text-white/60">{emptyText}</p>
  const ordered = resourceCategories.flatMap((category) => sortResources(resources.filter((item) => item.category === category)))
  return <ResourceGrid resources={ordered} showCategory />
}

function ResourceGrid({ resources, showCategory = false }: { resources: readonly Resource[]; showCategory?: boolean }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {resources.map((resource) => (
        <li key={resource.id}>
          <ResourceCard resource={resource} showCategory={showCategory} />
        </li>
      ))}
    </ul>
  )
}

function ResourceCard({ resource, showCategory }: { resource: Resource; showCategory: boolean }) {
  const newTab = resource.openInNewTab ?? true
  let host = ""
  try {
    const url = new URL(resource.url)
    host = url.protocol === "mailto:" ? "Email" : url.hostname.replace(/^www\./, "")
  } catch {
    // parseResource already rejected invalid URLs.
  }
  return (
    <a
      href={resource.url}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
      className="home-card group flex h-full flex-col"
    >
      <span className="flex items-start justify-between gap-3">
        <span className="text-xl leading-tight text-white">{resource.label}</span>
        <span aria-hidden="true" className="text-primary-text">&#8599;</span>
      </span>
      {resource.description && <span className="mt-2 text-sm leading-6 text-white/65">{resource.description}</span>}
      {/* Read after the label by screen readers, shown above it visually. */}
      {showCategory && (
        <span className="order-first mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-primary-text">
          <span className="sr-only">Category: </span>
          {resource.category}
        </span>
      )}
      <span className="mt-auto pt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-white/60">
        {host}
        {newTab && <span className="sr-only"> (opens in a new tab)</span>}
      </span>
    </a>
  )
}
