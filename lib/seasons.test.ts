// Run with: npm run test:hub
import { test } from "node:test"
import assert from "node:assert/strict"
import { MAX_SEASON_DAYS, activeSeason, seasons, windowDays } from "./seasons.ts"

test("every seasonal window lasts a month at most, in leap and common years", () => {
  for (const season of seasons) {
    for (const year of [2026, 2027, 2028]) {
      const days = windowDays(season, year)
      assert.ok(days >= 1 && days <= MAX_SEASON_DAYS, season.id + " runs " + days + " days")
      if (season.highlight) {
        assert.ok(windowDays(season.highlight, year) <= 8, season.id + " highlight is about a week")
        assert.ok(windowDays({ start: season.start, end: season.highlight.start }, year) >= 1, "highlight starts inside the season")
        assert.ok(windowDays({ start: season.highlight.end, end: season.end }, year) >= 1, "highlight ends inside the season")
      }
    }
  }
})

test("fall leaves in October, snow in December, Christmas the week before Christmas", () => {
  assert.equal(activeSeason(new Date(2026, 8, 30)), null)
  assert.equal(activeSeason(new Date(2026, 9, 1))?.season.id, "autumn")
  assert.equal(activeSeason(new Date(2026, 9, 31))?.season.id, "autumn")
  assert.equal(activeSeason(new Date(2026, 10, 1)), null)
  assert.equal(activeSeason(new Date(2026, 10, 30)), null)
  assert.equal(activeSeason(new Date(2026, 11, 1))?.season.id, "winter")
  assert.equal(activeSeason(new Date(2026, 11, 17))?.highlight, false)
  assert.equal(activeSeason(new Date(2026, 11, 18))?.highlight, true)
  assert.equal(activeSeason(new Date(2026, 11, 25))?.highlight, true)
  assert.equal(activeSeason(new Date(2026, 11, 26))?.highlight, false)
  assert.equal(activeSeason(new Date(2026, 11, 31))?.season.id, "winter")
  assert.equal(activeSeason(new Date(2027, 0, 1)), null)
  const winter = activeSeason(new Date(2026, 11, 20))!
  assert.equal(winter.ends?.getMonth(), 11)
  assert.equal(winter.ends?.getDate(), 31)
})

test("every other month is plain", () => {
  for (let month = 0; month < 12; month++) {
    const decorated = activeSeason(new Date(2027, month, 15)) !== null
    assert.equal(decorated, month === 9 || month === 11, "month " + (month + 1))
  }
})
