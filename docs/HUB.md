# Team hub: access codes, resources, and security limits

The hub (`/hub`) gives members one place to reach team links: Drive and Box
folders, notes, the BOM, and lead-only recruiting tools. The site is a static
export on GitHub Pages, so there is no server. Instead, the links are encrypted
into a public file, `public/hub/bundle.json`, and an access code decrypts the
part a member is allowed to see.

## Security model (read this first)

This is an encrypted-link system for a static site, **not** server-side
authentication.

- `public/hub/bundle.json` is publicly downloadable. Anyone can copy it and
  try codes offline, as fast as their hardware allows. There is no rate
  limiting and no lockout.
- Each code is stretched with PBKDF2-SHA256 (600,000 iterations by default)
  and decrypts its payload with AES-256-GCM. A wrong code fails the
  authentication check; there is no password hash to compare against.
- What protects the links is therefore the **strength of the codes**. Use the
  generated codes (about 99 bits). Never use guessable codes such as
  `dynamics2026`. The build refuses codes under 16 characters, letters-only
  codes, and duplicate codes.
- A device that unlocked the hub may keep access until the member logs out or
  the session expires (about 30 days), or until that role's code is rotated.
- **Google Drive and Box sharing permissions remain the real security
  boundary.** Never loosen folder permissions just so a hub link works.
- Never put applicant PII, interview notes with personal data, passwords,
  API keys, or other secrets into the hub. Truly private features need the
  real backend and authentication tracked in #43 to #52.

## Roles and scopes

Members enter one code. The code alone determines the role:

| Role | Sees |
| --- | --- |
| General team | General resources |
| Subteam (one code per subteam) | General resources + that subteam's resources |
| Leads | General resources + leads/recruiting resources + every subteam's resources |

Each role's payload holds only its own scope, so, for example, the Powertrain
payload simply does not contain Dynamics links. The UI never hides data with
CSS alone.

Subteam ids come from `lib/subteams.ts`, the single list shared by the public
site and the hub.

## Files

| Path | Committed? | Contents |
| --- | --- | --- |
| `hub/resources.local.json` | **No** (ignored) | Plaintext links for every role |
| `hub/codes.local.json` | **No** (ignored) | The 12 access codes |
| `hub/resources.example.json` | Yes | Format example |
| `public/hub/bundle.json` | Yes | Encrypted output, safe to publish |
| `lib/hub/schema.ts` | Yes | Resource format, scopes, validation |
| `lib/hub/crypto.ts` | Yes | Encryption, unlocking, bundle format |
| `scripts/hub-build.ts` | Yes | `codes`, `check`, and `build` commands |

Keep the two `.local.json` files in a leads-only location outside GitHub,
such as a restricted team Drive folder or a team password manager, so future
officers can take over. Never paste codes into GitHub issues, PRs, commits,
or group chats that include non-members.

## Resource format

`hub/resources.local.json` (see `hub/resources.example.json`):

```json
{
  "general": [ { "id": "team-drive", "label": "Team shared drive", "category": "Drive", "url": "https://..." } ],
  "leads":   [ { "id": "applicant-responses", "label": "Applicant responses", "category": "Recruiting", "url": "https://..." } ],
  "subteams": { "powertrain": [ { "id": "powertrain-drive", "label": "Powertrain folder", "category": "Drive", "url": "https://..." } ] }
}
```

Each resource:

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | Lowercase letters, digits, dashes. Unique within its list. |
| `label` | yes | Descriptive ("Chassis CAD folder", not "Folder"). |
| `category` | yes | `Drive`, `Box`, `Notes`, `BOM`, `Design`, `Calendar`, `Recruiting`, or `Other`. |
| `url` | yes | `https:` or `mailto:` only. |
| `description` | no | One short sentence. |
| `icon` | no | Icon name, lowercase with dashes. |
| `order` | no | Lower sorts first; unordered items follow, by label. |
| `openInNewTab` | no | `true` or `false`. |

Subteams without links can be left out; do not add placeholder links that look
real.

## Common tasks

Run all commands from the repository root with Node 22 or newer.

### First-time setup

```sh
npm run hub -- codes      # creates hub/codes.local.json (mode 600) with 12 new codes
cp hub/resources.example.json hub/resources.local.json   # then replace the example links
npm run hub -- check      # validates both files
npm run hub -- build      # writes public/hub/bundle.json
npm run test:hub
```

Commit only `public/hub/bundle.json`. The tool never prints codes or URLs.

### Add, change, or remove a resource

1. Edit `hub/resources.local.json` (general, `leads`, or a `subteams` entry).
2. Open each new or changed link from an account with the intended
   permissions (a regular member account for general and subteam links).
3. `npm run hub -- build`, then commit `public/hub/bundle.json`.

Members stay logged in: when a role's code is unchanged, `build` reuses that
role's salt, so saved sessions open the updated content.

### Rotate a code (for example after a leak)

```sh
npm run hub -- codes --rotate powertrain          # one role
npm run hub -- codes --rotate leads,general       # several roles
npm run hub -- codes --rotate all                 # every role
npm run hub -- build
```

Role names are `general`, `leads`, or a subteam id from `lib/subteams.ts`.
Only the rotated roles get new salts, so only those members must enter the
new code; every saved session for a rotated role stops working. Commit and
deploy the bundle, then share the new code privately with that group.

To force everyone to log in again without changing codes, run
`npm run hub -- build --fresh-salts`.

### Add, rename, or deactivate a subteam

1. Update `lib/subteams.ts`: add the id to `subteamIds` and its metadata, or
   set `active: false`. Keep existing ids stable; they are anchors on
   `/subteams/` and keys in the hub files.
2. For a new subteam, run `npm run hub -- codes --rotate <new-id>` to create
   its code. For a renamed id, move its entry in `hub/codes.local.json` and
   `hub/resources.local.json` to the new key.
3. `npm run hub -- check`, then `build`. TypeScript and the validator flag
   any place still using an unknown id.

### Change the iteration count

`npm run hub -- build --iterations 800000`. Higher means slower guessing but
a slower unlock on phones (the client tries all 12 payloads in parallel).
Changing it re-salts every role.

## Sessions

The `/hub` page (linked as "Team hub" in the site footer) downloads
`public/hub/bundle.json` and asks for one access code. If no bundle is
published yet, it says the hub is not set up.

- **Unlocking:** `unlockBundle()` in `lib/hub/crypto.ts` tries the code against
  every payload and returns the payload, a non-extractable `CryptoKey`, and the
  salt of the payload it opened. A wrong code shows one generic error.
- **Remember this device (on by default):** `lib/hub/session.ts` stores only the
  key, the salt, and an expiry 30 days out in IndexedDB (database `lbr-hub`).
  The code and the decrypted links are never stored. On the next visit the page
  reopens the freshly downloaded bundle with `reopenBundle()`. Members should
  turn this off on shared or public computers.
- **Log out** and **Switch team** delete the stored key and the leads subteam
  choice, then return to the code screen.
- **Expiry and rotation:** an expired session, or a session whose role was
  re-salted by a code rotation or `--fresh-salts`, falls back to the code
  screen. Editing links without rotating keeps sessions working.
- **Format changes:** bump `SESSION_VERSION` in `lib/hub/session.ts` to
  invalidate every saved session.
- Anyone using an unlocked browser profile can open the hub until logout or
  expiry. The key cannot be copied out of the browser, but it can be used there.

## Release checklist

- [ ] `npm run hub -- check` passes.
- [ ] Every new or changed link opened from an account with the intended access.
- [ ] No applicant data, personal data, or secrets in any resource.
- [ ] `npm run hub -- build` succeeded and only `public/hub/bundle.json` is staged
      (`git status` must not show any `.local.json` file).
- [ ] `npm run test:hub` passes.
- [ ] After deploy: unlock once with a general, a subteam, and the leads code.
- [ ] Rotated codes shared privately with the affected members only.
