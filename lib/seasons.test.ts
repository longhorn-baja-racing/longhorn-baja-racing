// Run with: npm run test:hub
import { test } from "node:test"
import assert from "node:assert/strict"
import { MAX_SEASON_DAYS, activeSeason, seasonDays, seasons } from "./seasons.ts"

test("every seasonal window lasts a month at most, in leap and common years", () => {
  for (const season of seasons) {
    for (const year of [2026, 2027, 2028, 2029]) {
      const days = seasonDays(season, year)
      assert.ok(days >= 1, season.id + " has a valid range")
      assert.ok(days <= MAX_SEASON_DAYS, season.id + " runs " + days + " days in " + year)
    }
  }
})

test("seasonal windows never overlap", () => {
  const owner = new Map<string, string>()
  for (let day = 0; day < 366 * 2; day++) {
    const date = new Date(2027, 0, 1 + day)
    const hits = seasons.filter((season) => activeSeason(date)?.season.id === season.id)
    assert.ok(hits.length <= 1)
    if (hits[0]) owner.set(date.toDateString(), hits[0].id)
  }
  assert.ok(owner.size > 0)
})

test("seasons switch on and off by themselves", () => {
  assert.equal(activeSeason(new Date(2026, 10, 1))?.season.id, "autumn")
  assert.equal(activeSeason(new Date(2026, 10, 30))?.season.id, "autumn")
  assert.equal(activeSeason(new Date(2026, 11, 1)), null)
  assert.equal(activeSeason(new Date(2026, 11, 25))?.season.id, "winter")
  assert.equal(activeSeason(new Date(2027, 0, 6))?.season.id, "winter")
  assert.equal(activeSeason(new Date(2027, 0, 7)), null)
  assert.equal(activeSeason(new Date(2027, 1, 14)), null)
  assert.equal(activeSeason(new Date(2027, 3, 1))?.season.id, "bluebonnets")
  assert.equal(activeSeason(new Date(2027, 5, 15))?.season.id, "fireflies")
  assert.equal(activeSeason(new Date(2027, 8, 15)), null)
  const winter = activeSeason(new Date(2026, 11, 20))!
  assert.equal(winter.ends.getFullYear(), 2027)
  assert.equal(winter.ends.getMonth(), 0)
  assert.equal(winter.ends.getDate(), 6)
})

test("most of the year has no decorations", () => {
  let decorated = 0
  for (let day = 0; day < 365; day++) if (activeSeason(new Date(2027, 0, 1 + day))) decorated++
  assert.ok(decorated < 365 / 3, decorated + " decorated days")
})
