// Offline tests for scripts/fetch-calendar.ts. Run with npm run test:calendar.

import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { test } from "node:test"
import { fileURLToPath } from "node:url"
import { eventsFromIcs } from "./fetch-calendar.ts"

const ROOT = fileURLToPath(new URL("..", import.meta.url))

const CHICAGO = [
  "BEGIN:VTIMEZONE",
  "TZID:America/Chicago",
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:-0600",
  "TZOFFSETTO:-0500",
  "TZNAME:CDT",
  "DTSTART:19700308T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:-0500",
  "TZOFFSETTO:-0600",
  "TZNAME:CST",
  "DTSTART:19701101T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
]

function calendar(...events: string[][]): string {
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Test//Test//EN", ...CHICAGO, ...events.flat(), "END:VCALENDAR", ""].join("\r\n")
}

function vevent(...lines: string[]): string[] {
  return ["BEGIN:VEVENT", "DTSTAMP:20261101T000000Z", ...lines, "END:VEVENT"]
}

// Weekly Saturday meeting, 10:00-12:00 Austin time (16:00Z in CST):
// Nov 21, Nov 28, Dec 5, Dec 12. Nov 21 moved earlier to Nov 14, Nov 28
// moved later to Thursday Dec 10.
const movedFeed = calendar(
  vevent(
    "UID:meeting@test",
    "SUMMARY:Shop meeting",
    "DTSTART;TZID=America/Chicago:20261121T100000",
    "DTEND;TZID=America/Chicago:20261121T120000",
    "RRULE:FREQ=WEEKLY;COUNT=4",
  ),
  vevent(
    "UID:meeting@test",
    "SUMMARY:Shop meeting",
    "RECURRENCE-ID;TZID=America/Chicago:20261121T100000",
    "DTSTART;TZID=America/Chicago:20261114T100000",
    "DTEND;TZID=America/Chicago:20261114T120000",
  ),
  vevent(
    "UID:meeting@test",
    "SUMMARY:Shop meeting",
    "RECURRENCE-ID;TZID=America/Chicago:20261128T100000",
    "DTSTART;TZID=America/Chicago:20261210T100000",
    "DTEND;TZID=America/Chicago:20261210T120000",
  ),
)

const starts = (from: string, to: string) => eventsFromIcs(movedFeed, new Date(from), new Date(to)).map((event) => event.start)

test("includes an occurrence moved into the window from a date after it", () => {
  assert.deepEqual(starts("2026-11-13T00:00:00Z", "2026-11-17T00:00:00Z"), ["2026-11-14T16:00:00.000Z"])
})

test("excludes an occurrence moved out of the window", () => {
  assert.deepEqual(starts("2026-11-20T00:00:00Z", "2026-12-01T00:00:00Z"), [])
})

test("lists a moved occurrence once when its original date is before the window", () => {
  assert.deepEqual(starts("2026-12-09T00:00:00Z", "2026-12-11T00:00:00Z"), ["2026-12-10T16:00:00.000Z"])
})

test("lists each occurrence of the series once at its current date", () => {
  assert.deepEqual(starts("2026-11-01T00:00:00Z", "2027-01-01T00:00:00Z"), [
    "2026-11-14T16:00:00.000Z",
    "2026-12-05T16:00:00.000Z",
    "2026-12-10T16:00:00.000Z",
    "2026-12-12T16:00:00.000Z",
  ])
})

test("CLI writes the feed file when run from a path with a space", () => {
  const dir = mkdtempSync(join(tmpdir(), "fetch calendar "))
  try {
    mkdirSync(join(dir, "scripts"))
    mkdirSync(join(dir, "lib"))
    copyFileSync(join(ROOT, "scripts/fetch-calendar.ts"), join(dir, "scripts/fetch-calendar.ts"))
    copyFileSync(join(ROOT, "lib/calendar.ts"), join(dir, "lib/calendar.ts"))
    copyFileSync(join(ROOT, "package.json"), join(dir, "package.json"))
    symlinkSync(join(ROOT, "node_modules"), join(dir, "node_modules"), "junction")
    const feedFile = join(dir, "feed.ics")
    writeFileSync(feedFile, calendar(vevent(
      "UID:weekly@test",
      "SUMMARY:Weekly build night",
      "DTSTART;TZID=America/Chicago:20260105T180000",
      "DTEND;TZID=America/Chicago:20260105T200000",
      "RRULE:FREQ=WEEKLY",
    )))

    const run = spawnSync(process.execPath, ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", join(dir, "scripts/fetch-calendar.ts")], {
      cwd: dir,
      env: { ...process.env, CALENDAR_ICS_FILE: feedFile, CALENDAR_REQUIRED: "true" },
      encoding: "utf8",
    })
    assert.equal(run.status, 0, run.stderr)

    const out = join(dir, "public/data/calendar.json")
    assert.ok(existsSync(out), `${out} was not written`)
    const feed = JSON.parse(readFileSync(out, "utf8"))
    assert.equal(feed.status, "ok")
    assert.ok(feed.events.length > 0, "feed has events")
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
