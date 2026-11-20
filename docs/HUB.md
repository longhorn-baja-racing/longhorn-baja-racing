# Team hub: access codes, resources, and security limits

The hub (`/hub/`, linked as "Team hub" in the site footer) gives members one
place to reach team links: Drive and Box folders, notes, the BOM, and
lead-only recruiting tools. The site is a static export on GitHub Pages, so
there is no server. Instead, the links are encrypted into a public file,
`public/hub/bundle.json`, and an access code decrypts the part a member is
allowed to see.

This document is for whoever maintains the hub after the people who built it
have moved on. You do not need to read the code to follow it.

Contents: security model, roles, files, access codes, resource format, command
reference, runbooks (first-time setup, add a resource link, rotate a leaked
code, routine rotation), subteams, sessions, and the release checklist.

## Security model (read this first)

This is an encrypted-link system for a static site, **not** server-side
authentication and **not** per-person access control.

- **Shared codes, not accounts.** There are 12 codes: one general-team code,
  one per subteam, and one for leads. Everyone in a group types the same code.
  The site cannot tell members apart, cannot remove one person, and cannot
  see who unlocked what. Anyone who has a code can pass it on, and the hub
  cannot detect that.
- **The bundle is public.** `public/hub/bundle.json` is downloadable by anyone
  and is committed to a public GitHub repository. Anyone can copy it and try
  codes offline, as fast as their hardware allows. There is no rate limiting
  and no lockout, because there is no server to enforce one.
- **Encryption happens in the browser.** Each code is stretched with
  PBKDF2-SHA256 (600,000 iterations by default) into an AES-256-GCM key that
  decrypts one payload. A wrong code simply fails to decrypt; there is no
  password hash to compare against.
- **Code strength is the only protection for the links.** The tool generates
  codes of about 99 bits, which cannot realistically be guessed. Hand-picked
  codes such as `dynamics2026` or `baja-racing-2026` can be, so the tool
  refuses them unless you pass `--allow-custom-codes` (do not).
- **Payload sizes are hidden.** Every payload in a bundle is padded to the same
  size and their order is shuffled, so the file does not reveal which payload
  is the leads payload or how many links each role has.
- **A leaked code exposes every link in that role's scope** (see the table
  below), including the links in every older bundle in the git history, which
  stays public. Rotating the code protects future bundles only. Links someone
  already decrypted stay known to them.
- **Remembered devices stay unlocked.** A browser that unlocked the hub with
  "Remember this device" on reopens it without a code for 30 days from that
  unlock, or until someone selects Log out. On a shared or lab computer, the
  next person using the same browser profile gets the same access. Both limits
  are enforced only by that browser. Rotating the role's code is the only way
  to cut off a device or a person remotely.
- **Google Drive and Box sharing permissions remain the real security
  boundary.** Assume a hub link can reach anyone. Keep sensitive folders
  shared only with named team accounts, and never loosen folder permissions
  (for example to "anyone with the link") just so a hub link works.
- **Never put sensitive data in the hub.** No applicant PII, interview notes
  with personal data, grades, passwords, API keys, account credentials, or
  similar records, not in links, labels, or descriptions. A link to a folder
  whose own permissions protect such data is acceptable; the data itself is
  not. Truly private website features need the real backend and authentication
  tracked in #43 to #52.

What a leaked code exposes:

| Leaked code | The holder can read | The holder cannot read |
| --- | --- | --- |
| General | General links | Subteam and leads links, any code |
| One subteam | General links + that subteam's links | Other subteams, leads links, any code |
| Leads | Every link in the hub: general, leads/recruiting, all subteams | Any code |

No payload contains an access code, so one leaked code never reveals another.

## Roles and scopes

Members enter one code. The code alone determines the role; there is no
subteam picker on the code screen.

| Role | Sees |
| --- | --- |
| General team | Team resources (`general`) |
| Subteam (one code per subteam) | Team resources + that subteam's resources |
| Leads | Leadership + Recruiting + Team resources + a Subteams section with a selector |

Each role's payload holds only its own scope, so, for example, the Powertrain
payload simply does not contain Dynamics links. The UI never hides data with
CSS alone.

On the leads dashboard, entries in the `leads` list with category
`Recruiting` appear under **Recruiting** (after the public application form,
which the site always adds from `lib/site.ts`), and every other `leads` entry
appears under **Leadership**. The subteam selector lists the active subteams
from `lib/subteams.ts` (ten today) and remembers the last choice on remembered
devices.

## Files

| Path | Committed? | Contents |
| --- | --- | --- |
| `hub/resources.local.json` | **No** (ignored) | Plaintext links for every role |
| `hub/codes.local.json` | **No** (ignored) | The 12 access codes |
| `hub/resources.example.json` | Yes | Format example with placeholder links |
| `public/hub/bundle.json` | Yes | Encrypted output, safe to publish; served at `/hub/bundle.json` |
| `lib/subteams.ts` | Yes | Subteam ids and public metadata, shared with `/subteams/` |
| `lib/hub/schema.ts` | Yes | Resource format, scopes, code rules, validation |
| `lib/hub/crypto.ts` | Yes | Encryption, unlocking, bundle format |
| `lib/hub/session.ts` | Yes | Remembered-device storage |
| `scripts/hub-build.ts` | Yes | The `codes`, `check`, and `build` commands |
| `components/hub/` | Yes | The `/hub/` page and dashboards (no links live here) |

`.gitignore` ignores everything in `hub/` except the example, so any file you
put there (including scratch files) stays out of git. Changing links or codes
never requires editing the UI components.

### Where the local files live

> **Recommendation (officers to confirm):** keep the current copies of
> `hub/codes.local.json` and `hub/resources.local.json` in one leads-only
> place outside GitHub: a shared vault in a team password manager if the team
> has one, otherwise a Google Drive folder shared only with named officer
> accounts (never "anyone with the link"). Name one officer as the owner of
> that folder and hand it over at officer transitions.

Rules that apply wherever they live:

- Always download both files fresh before a change, and upload both back right
  after. Two people working from different copies will undo each other's
  rotations.
- Never paste codes or the files into GitHub issues, PRs, commits, the
  website, or chats that include non-members.
- If `hub/codes.local.json` is lost, generate a new set (`npm run hub --
  codes` with the file absent), rebuild, and send everyone their new code.
  Every member has to log in again.
- If `hub/resources.local.json` is lost, rebuild it by hand. The leads payload
  contains every link, so a lead can copy them from the leads dashboard. There
  is no export command.

## Access codes

- **Format:** generated codes are four groups of five characters, shaped like
  `xxxxx-xxxxx-xxxxx-xxxxx`. The alphabet leaves out look-alikes (`i`, `l`,
  `o`, `0`, `1`), and every code has at least one digit. That is about 99
  bits per code.
- **Minimum quality:** `check` and `build` accept only codes in the generated
  format and refuse duplicates. With `--allow-custom-codes` they still require
  at least 16 characters, not letters only, and no duplicates, but a
  hand-picked code is far easier to guess offline. Always use generated codes.
- **Typing:** codes are lowercase and case-sensitive, and the dashes are part
  of the code. Spaces before or after are ignored.
- **Reading a code:** the tool never prints codes. Open
  `hub/codes.local.json` in an editor; it has `general`, `leads`, and a
  `subteams` object keyed by subteam id.

### Sharing codes with members

> **Recommendation (officers to confirm the channel):** give the general code
> to members in person or in a members-only team channel, each subteam code
> through that subteam's lead, and the leads code only to officers and leads,
> in direct messages. Ask people not to forward codes, and to tell a lead if
> one is posted somewhere it should not be.

Never put a code in a GitHub issue, PR, commit, or comment (the repository is
public), on the website, in a calendar invite, on social media, or in an email
list or group chat that includes non-members or applicants.

## Resource format

`hub/resources.local.json` (start from `hub/resources.example.json`):

```json
{
  "general": [ { "id": "team-drive", "label": "Team shared drive", "category": "Drive", "url": "https://..." } ],
  "leads":   [ { "id": "applicant-responses", "label": "Applicant responses", "category": "Recruiting", "url": "https://..." } ],
  "subteams": { "powertrain": [ { "id": "powertrain-drive", "label": "Powertrain folder", "category": "Drive", "url": "https://..." } ] }
}
```

`general` is required. `leads` and `subteams` may be left out, and subteams
without links can be left out of `subteams`; their dashboards show an empty
state. Do not add placeholder links that look real. The keys of `subteams`
must be subteam ids from `lib/subteams.ts`.

Each resource:

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | Lowercase letters, digits, dashes. Unique within its list. |
| `label` | yes | Descriptive ("Chassis CAD folder", not "Folder"). |
| `category` | yes | `Drive`, `Box`, `Notes`, `BOM`, `Design`, `Calendar`, `Recruiting`, or `Other`. Cards are grouped in this order. |
| `url` | yes | Absolute `https:` or `mailto:` URL. `http:` and anything else is rejected. |
| `description` | no | One short sentence, shown on the card. |
| `icon` | no | Lowercase name with dashes. Validated and stored, but the dashboard does not display icons yet. |
| `order` | no | Number. Lower sorts first within a category; unordered items follow, by label. |
| `openInNewTab` | no | `true` or `false`. Defaults to `true`. |

Unknown fields are rejected, so a typo such as `"lable"` fails `check`
instead of being silently ignored.

## Command reference

Run everything from the repository root with Node 22 (22.18 or newer runs the
TypeScript tool directly; CI uses the latest Node 22).

| Command | What it does |
| --- | --- |
| `npm run hub -- codes` | Creates `hub/codes.local.json` (file mode 600) with 12 new codes. Refuses to overwrite an existing file. |
| `npm run hub -- codes --rotate <roles>` | Replaces only the listed codes. `<roles>` is a comma-separated list of `general`, `leads`, and subteam ids, or `all`. Also adds codes for subteam ids that are new in `lib/subteams.ts` and drops ids that were removed. |
| `npm run hub -- check` | Validates both local files and prints link counts per role. Writes nothing. |
| `npm run hub -- build` | Encrypts one payload per role, checks that every code opens exactly its own role, and writes `public/hub/bundle.json`. Prints which roles kept their sessions. |
| `npm run test:hub` | Unit tests for the format and crypto, plus a shape check of the committed bundle. |

Options:

| Option | Commands | Meaning |
| --- | --- | --- |
| `--fresh-salts` | `build` | Re-salt every role: every member must enter their code again. |
| `--iterations N` | `build` | PBKDF2 iterations (allowed 100000 to 10000000). Without it, `build` keeps the existing bundle's count, or uses 600000 when there is no bundle. See "Change the iteration count". |
| `--allow-custom-codes` | all | Accept hand-picked codes. Do not use for production. |
| `--source PATH` | `check`, `build` | Resource file (default `hub/resources.local.json`). |
| `--codes PATH` | all | Codes file (default `hub/codes.local.json`). |
| `--out PATH` | `build` | Bundle output (default `public/hub/bundle.json`). |

The tool never prints codes or URLs, so its output is safe to paste when
asking for help. Practice runs can use scratch paths inside `hub/`, which git
ignores, for example
`npm run hub -- codes --codes hub/practice-codes.local.json` followed by
`npm run hub -- build --codes hub/practice-codes.local.json --source hub/resources.example.json --out hub/practice-bundle.local.json`.

How sessions survive a rebuild: `build` reads the existing bundle at the
`--out` path and reuses a role's salt when that role's code still opens its
old payload with the same iteration count. Members of those roles stay logged
in. A role gets a new salt (its members must log in again) when its code
changed, when `--fresh-salts` is used, when the iteration count differs from
the existing bundle, or when there is no existing bundle.

## Runbooks

Before any runbook: pull the latest `main`, run `npm ci` if dependencies
changed, and download the current `hub/codes.local.json` and
`hub/resources.local.json` from the leads-only storage into `hub/`.

### First-time setup

```sh
npm run hub -- codes                                     # creates hub/codes.local.json
cp hub/resources.example.json hub/resources.local.json   # then replace every example link
npm run hub -- check
npm run hub -- build                                     # writes public/hub/bundle.json
npm run test:hub
```

Then follow the release checklist, commit only `public/hub/bundle.json`, upload
both local files to storage, and send out the codes.

### Add, change, or remove a resource link

1. Download the current local files into `hub/` (see above).
2. Edit `hub/resources.local.json`:
   - general-team link: an entry in `general`;
   - leads link: an entry in `leads` (category `Recruiting` shows under
     Recruiting, anything else under Leadership);
   - subteam link: an entry in `subteams.<subteam-id>` (add that key if the
     subteam has no links yet).

   To change a link, edit its fields; to remove one, delete its object. Keep
   each `id` stable when you only change the URL or label.
3. Open every new or changed URL twice: once signed in with an account that
   should have access (a regular member account for general and subteam
   links), and once in a private window, signed out, to confirm a restricted
   folder is **not** public. Fix the sharing in Drive or Box, not in the hub.
4. Validate and rebuild:
   ```sh
   npm run hub -- check
   npm run hub -- build
   ```
   `build` should print "Sessions kept for:" with every role. If it says all
   roles were re-salted, you are missing the current bundle or used a
   different `--iterations`; see "How sessions survive a rebuild".
5. Run the release checklist below (build, leak scan, local preview).
6. Commit only the bundle on a branch and open a PR:
   ```sh
   git switch -c hub-update-links
   git add public/hub/bundle.json
   git status            # must not list any hub/*.local.json file
   git commit -m "Update hub links"
   ```
   Keep commit and PR text neutral. Never name protected links in it.
7. After CI passes and the PR is merged, the main push deploys the site.
   Hard-refresh `/hub/` on the live site and check the changed links.
8. Upload the edited `hub/resources.local.json` back to storage.

Members stay logged in throughout, because no code changed.

### Rotate a leaked code

Use this when a code was posted publicly, sent to the wrong group, or is held
by someone who should no longer have access (for example a member who left
the team or a lead who stepped down).

1. **Work out the exposure.** Find which code leaked and use the table under
   "Security model" to list every link it opens. Assume all of them, in the
   current bundle and in every older bundle in git history, are now known to
   whoever has the code. A leaked leads code exposes every link in the hub.
2. **Fix the real boundary first.** For each exposed link that points to
   something sensitive, check its Drive or Box sharing. Restrict it to named
   team accounts, or create a new share link and turn the old one off. Remove
   anything from the folders that should not have been reachable. This is the
   only step that protects what was already exposed.
3. **Get the files.** Pull the latest `main` and download the current local
   files into `hub/`. Note the leaked code somewhere temporary so you can
   confirm in steps 7 and 9 that it stops working; delete the note afterwards.
4. **Rotate only the affected role.**
   ```sh
   npm run hub -- codes --rotate powertrain     # one subteam
   npm run hub -- codes --rotate general        # the general-team code
   npm run hub -- codes --rotate leads          # the leads code
   npm run hub -- codes --rotate leads,general  # several at once
   ```
   Role names are `general`, `leads`, or a subteam id from `lib/subteams.ts`.
   Use `--rotate all` only if you cannot tell which code leaked. Other codes
   are unaffected and do not need to change.
5. If step 2 replaced any share links, update those URLs in
   `hub/resources.local.json`.
6. **Rebuild:**
   ```sh
   npm run hub -- check
   npm run hub -- build
   ```
   Confirm that "Sessions kept for:" lists every role **except** the ones you
   rotated. Every saved session for a rotated role stops working; everyone
   else stays logged in.
7. **Verify locally** with the release checklist: build, leak scan, and a
   local preview where the new code opens the hub and the leaked code shows
   "That code did not work."
8. **Ship it** exactly as in steps 6 and 7 of "Add, change, or remove a
   resource link" (commit only `public/hub/bundle.json`, neutral commit
   message such as "Rebuild hub bundle", PR, merge, deploy). Until the deploy
   finishes, the leaked code still works on the live site, so do not wait.
9. **Check the live site:** hard-refresh `/hub/`, confirm the leaked code fails
   and the new code works.
10. **Distribute and store:** upload the updated `hub/codes.local.json` to
    storage, then send the new code to that group through the private channel
    (see "Sharing codes with members").

To log everyone out without changing any code (for example after a format
change), run `npm run hub -- build --fresh-salts` and ship the bundle.

### Routine rotation

> **Recommendation (officers to confirm):** rotate the leads code whenever
> officers or leads change, and rotate all codes at the start of each academic
> year so that former members lose access. Use the leaked-code runbook from
> step 3, skipping step 2 unless links also need to change.

### Change the iteration count

Higher iterations slow down offline guessing but also slow down unlocking on
phones (the browser tries the code against all 12 payloads in parallel; about
0.7 s on a fast desktop at 600,000). Changing the count re-salts every role,
so everyone has to log in again.

To change it, run `npm run hub -- build --iterations 800000` once and commit
the rebuilt bundle. Later plain `build` runs keep the count stored in the
existing bundle, so they do not log anyone out. `DEFAULT_ITERATIONS` in
`lib/hub/crypto.ts` is only used when there is no existing bundle.

## Subteams

`lib/subteams.ts` is the single list of subteams (issue #54). It is used by:

- the public `/subteams/` page (`components/subteams.tsx`), which shows active
  subteams with their title, description, image, and anchor `#<id>`;
- the hub roles (`lib/hub/schema.ts`): every id in `subteamIds`, active or not,
  gets its own code and payload, and resource files may only use these ids;
- the dashboards (`components/hub/hub-dashboard.tsx`), which take subteam
  titles from it at display time and build the leads selector from the active
  subteams;
- `scripts/hub-build.ts`, which creates and syncs codes per id.

Changing only a subteam's `title`, `description`, `details`, or image does not
need a hub rebuild. Changing the list of ids does.

The bundle can hold at most 32 payloads, which allows up to 30 subteams.

### Add a subteam

1. In `lib/subteams.ts`, add the id to `subteamIds` (its position is the
   display order) and add its entry to `subteamData` (`title`, `description`,
   `details`, `image`, `imageAlt`, `active: true`). Add the image under
   `public/subteams/`.
2. `npm run hub -- codes --rotate <new-id>` creates a code for the new subteam
   only.
3. Optionally add links under `subteams.<new-id>` in
   `hub/resources.local.json`.
4. `npm run hub -- check`, then `npm run hub -- build`.
5. Commit `lib/subteams.ts`, the image, and the rebuilt
   `public/hub/bundle.json` in the **same PR**. `npm run test:hub` fails in CI
   when the bundle's payload count does not match the subteam list, so this
   change needs someone who holds the codes.
6. Upload the codes file and send the new code to that subteam's lead.

### Deactivate a subteam

Set `active: false` in `lib/subteams.ts`. The subteam disappears from
`/subteams/` and from the leads selector, but it keeps its role: its code still
opens a dashboard with the general links and its own links. To also end its
hub access, remove its entry from `hub/resources.local.json`, rotate its code
(`codes --rotate <id>`) without sending the new code to anyone, and rebuild.
Keeping the id lets you reactivate it later.

### Remove a subteam permanently

1. Delete the id from `subteamIds` and its entry from `subteamData`, and fix
   anything TypeScript or the tests flag as still using it
   (`npm run typecheck`, `npm run test:hub`, `npm test`).
2. Delete its key from `subteams` in **both** `hub/codes.local.json` and
   `hub/resources.local.json` (`check` reports "unknown field" or "unknown
   subteam id" until you do). A `codes --rotate` run would also drop it from
   the codes file, but only alongside rotating some other role.
3. `npm run hub -- check`, `npm run hub -- build`, and commit the bundle in the
   same PR as `lib/subteams.ts`. Other roles keep their sessions.

### Rename a subteam id

Avoid this: it breaks old `/subteams/#<id>` links and logs that subteam out.
If it is needed, change the id in `subteamIds` and `subteamData`, move the
entry to the new key in both local files (the code can stay the same), run
`check` and `build`, and commit the bundle in the same PR. If the bundle is
not rebuilt, the leads payload still opens (the unknown subteam is skipped),
but the renamed subteam's code shows "Your code is correct, but the hub has
not been updated for a recent subteam change yet." CI does not catch a missed
rebuild after a rename, because the payload count is unchanged.

## Sessions

The `/hub/` page downloads `public/hub/bundle.json` and asks for one access
code. If no bundle is published, it says the hub is not set up yet.

- **Unlocking:** the browser tries the code against every payload. A wrong
  code shows one generic error. A correct code whose payload no longer
  validates (for example after a subteam rename without a rebuild) asks the
  member to have a lead rebuild the hub, and keeps any saved session so it
  works again after the rebuild.
- **Remember this device (on by default):** `lib/hub/session.ts` stores only
  the decryption key (as a non-extractable `CryptoKey`), its salt, and an
  expiry in IndexedDB (database `lbr-hub`). The code and the decrypted links
  are never stored, logged, or put in a URL. The key cannot be copied out of
  the browser, but anyone using that browser profile can use it. On later
  visits the page opens the freshly downloaded bundle with the saved key.
- **About 30 days:** the expiry is set once, 30 days after the unlock, and
  using the hub does not extend it. It is checked against the device clock.
  With the checkbox off, nothing is saved and a reload or a closed tab locks
  the hub again. Members should turn it off on shared or public computers.
- **Leads subteam choice:** saved in `localStorage`
  (`lbr-hub:v1:leads-subteam`) only when the device is remembered.
- **Log out** and **Switch team** both delete the saved key and the leads
  subteam choice, then show the code screen with a confirmation. If the
  browser cannot delete the key, the page says so and offers Try again or
  clearing the site's data. Neither button signs anyone out of Google or Box,
  closes tabs already opened from the hub, or clears browser history.
- **Expiry and rotation:** an expired session, or a session whose role was
  re-salted by a code rotation, `--fresh-salts`, or an iteration change, falls
  back to the code screen. Editing links without rotating keeps sessions
  working.

### Invalidating old sessions on purpose

| Situation | What to do |
| --- | --- |
| Log everyone out, codes unchanged | `npm run hub -- build --fresh-salts`, then ship the bundle. |
| Log out one role | Rotate that role's code. |
| The saved-session record format changes | Bump `SESSION_VERSION` in `lib/hub/session.ts`; every saved session is discarded on the next visit. |
| The payload or bundle format changes | Bump `PAYLOAD_VERSION` (`lib/hub/schema.ts`) or `BUNDLE_VERSION` (`lib/hub/crypto.ts`) and rebuild the bundle in the **same PR**. The next `build` re-salts every role automatically, because the old bundle no longer validates. Without the rebuild, the live hub shows the "rebuild" message or fails to load for everyone. |

## Release checklist

Run this before merging any PR that changes `public/hub/bundle.json`,
`lib/subteams.ts`, or `lib/hub/`.

**Build and automated checks**

- [ ] `npm run hub -- check` passes.
- [ ] `npm run hub -- build` succeeds. It decrypts the new bundle with all 12
      codes and fails if any code does not open exactly its own role, so this
      covers every role payload. "Sessions kept for:" matches what you
      intended.
- [ ] `npm run test:hub` passes.
- [ ] `npm run build` succeeds and `npm run test:export` passes.
- [ ] The leak scan below reports "Clean".
- [ ] `git status` shows no `hub/*.local.json` file and the staged change
      contains no codes or protected URLs. Commit and PR text name no
      protected links.

**Local preview** (`node scripts/serve-export.mjs` after `npm run build`, then
open http://localhost:4173/; stop it with Ctrl+C)

- [ ] Public pages still work: home, `/subteams/`, `/calendar/` (the calendar
      embed loads, or the "open it directly in Google Calendar" link is shown
      and works).
- [ ] `/hub/` loads after a hard refresh (Ctrl+Shift+R or Cmd+Shift+R).
- [ ] A wrong code shows "That code did not work." and no links.
- [ ] The general code shows only Team resources.
- [ ] At least one subteam code shows Team resources plus only that subteam's
      section; for a rotation, the rotated code too.
- [ ] The leads code shows Leadership, Recruiting, Team resources, and a
      selector listing every active subteam (ten today), each with only its
      intended links.
- [ ] Log out returns to the code screen and a reload stays locked.

**Links**

- [ ] Every new or changed production link opens from an account with the
      intended access and is not public when it should be restricted.
- [ ] No applicant data, personal data, credentials, or secrets in any link,
      label, or description.

**After the deploy**

- [ ] Hard-refresh https://longhornbajaracing.com/hub/ and unlock with the
      general, one subteam, and the leads code. GitHub Pages may serve the
      previous bundle for a few minutes.
- [ ] Rotated codes fail; new codes work.
- [ ] Updated local files uploaded to storage; new codes shared privately with
      the affected group only.

### Leak scan of the static output

After `npm run build`, this checks every file in `out/` for every access code
and every resource URL from your local files. It prints only resource ids and
role names, never the secrets themselves, and exits with an error if anything
is found.

```sh
node --input-type=module -e '
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
const source = JSON.parse(readFileSync("hub/resources.local.json", "utf8"))
const codes = JSON.parse(readFileSync("hub/codes.local.json", "utf8"))
const resources = [...source.general, ...(source.leads ?? []), ...Object.values(source.subteams ?? {}).flat()]
const secrets = [
  ...resources.map((r) => [`URL of resource "${r.id}"`, r.url]),
  ["general code", codes.general],
  ["leads code", codes.leads],
  ...Object.entries(codes.subteams).map(([id, code]) => [`${id} code`, code]),
]
let leaks = 0
for (const entry of readdirSync("out", { recursive: true, withFileTypes: true })) {
  if (!entry.isFile()) continue
  const file = join(entry.parentPath, entry.name)
  const text = readFileSync(file, "latin1")
  for (const [name, value] of secrets) {
    if (text.includes(value) || text.includes(value.replaceAll("&", "&amp;"))) {
      leaks++
      console.log(`FOUND ${name} in ${file}`)
    }
  }
}
console.log(leaks ? `${leaks} match(es): do not deploy` : `Clean: none of ${secrets.length} codes and URLs appear in out/`)
process.exitCode = leaks ? 1 : 0
'
```

It runs in bash or zsh (macOS, Linux, WSL, or Git Bash on Windows). Any match
means plaintext reached the public build: do not deploy, and find out how it
got there. The only expected exception is a link that is also public elsewhere
on the site (for example the public calendar), which then does not belong in
the hub as a protected link anyway.
