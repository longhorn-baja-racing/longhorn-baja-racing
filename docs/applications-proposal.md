# Proposal: website application workflow v1

**Status:** draft for officer review. It answers the decisions in #43 (fields,
statuses, permissions, deadlines, retention) and #44 (backend, hosting,
environments). Items marked **DECIDE** need an explicit yes/no or a value from
the officers. Everything else is a recommended default that can be changed in
review. Once agreed, this file becomes the spec for #45 to #52.

## Summary

- Keep the public site static on GitHub Pages. Add a managed backend
  (Supabase: Postgres, Auth, row-level security) for applications only.
- Applicants sign in with a one-time email code or link sent to their
  `@utexas.edu` address. There are no passwords to store, reset, or leak.
- One application per person per cycle. Applicants rank up to 3 subteams from
  the shared list in `lib/subteams.ts`.
- Subteam leads review applicants who chose their subteam. Officers make and
  release final decisions. Every status change is logged.
- Applicant data is deleted 12 months after a cycle closes, except a minimal
  roster record for accepted members.
- Smallest useful first release: #45, #46, #47, #48 (accounts, form, and
  submission). The Google Form stays as a fallback until then.

## Part 1: application requirements (#43)

### Fields

| Field | Required | Notes |
| --- | --- | --- |
| Full name | Yes | |
| Preferred name | No | Used in emails if set |
| UT email | Yes | The sign-in address; must end in `@utexas.edu`. **DECIDE:** allow non-UT addresses (for example incoming transfers)? |
| Phone | No | Only for interview scheduling. **DECIDE:** required or optional |
| Major | Yes | Free text |
| Classification | Yes | Freshman, Sophomore, Junior, Senior, Graduate |
| Expected graduation | Yes | Semester and year |
| Subteam choices | Yes | Rank 1 to 3 from the active subteams |
| Why this subteam | Yes, per choice | Up to 500 characters for each chosen subteam |
| Prior experience | Yes | Up to 1000 characters; "none yet" is a fine answer |
| Why Longhorn Baja | Yes | Up to 1000 characters |
| Weekly time commitment | Yes | Under 5, 5 to 10, 10 to 15, 15+ hours |
| Sunday workday availability | Yes | Usually, sometimes, rarely |
| Resume link | No | A link (Drive, Box, and so on), not an upload. See below |
| Portfolio, GitHub, or LinkedIn | No | Link |
| How did you hear about us | No | Fixed options plus "other" |
| Data-use acknowledgement | Yes | Checkbox linking to the retention policy below |

**Never collected:** UT EID, Social Security number, date of birth, home
address, GPA or transcripts, demographic data (race, ethnicity, gender,
disability), immigration or visa status, photos, or any password.

Resumes as links (not uploads) keep files out of our storage and leave access
in the applicant's control. **DECIDE:** if the team wants uploads, use a
private storage bucket and delete files on the same schedule as applications.

**Per-subteam questions:** v1 asks one "why this subteam" answer per choice.
Subteam-specific questions can be added later as versioned questions in
`application_answers` (#45), without a schema change. **DECIDE:** does any
subteam need its own question for the first cycle?

### Cycles and deadlines

- Applications run in cycles, for example `fall-2027` and `spring-2028`. Each
  cycle has an open time, a close time, and a decision-release time, all in
  America/Chicago.
- Officers can extend a deadline. Submissions after the close time are rejected
  by the database, not just hidden in the UI.
- Outside an open cycle, the public "Apply" entry shows when the next cycle
  opens (or "applications are closed") instead of a dead link (#47, #62).
- **DECIDE:** dates for the first cycle, and whether spring has a cycle.

### Statuses

| Status | Set by | Applicant sees |
| --- | --- | --- |
| `draft` | Applicant | Draft (not submitted) |
| `submitted` | Applicant | Submitted |
| `under_review` | Reviewer | Under review |
| `interview` | Reviewer | Interview: we will contact you |
| `accepted` | Officer | Accepted (after release) |
| `waitlisted` | Officer | Waitlisted (after release) |
| `rejected` | Officer | Not selected this cycle (after release) |
| `withdrawn` | Applicant | Withdrawn |

Allowed transitions:

```
draft        -> submitted                       applicant, only while the cycle is open
submitted    -> under_review                    reviewer
under_review -> interview                       reviewer
submitted | under_review | interview
             -> accepted | waitlisted | rejected  officer
waitlisted   -> accepted | rejected             officer
any non-final status -> withdrawn               applicant
```

- Submitted applications are read-only to the applicant. **DECIDE:** allow
  edits until the close time instead?
- Final decisions are not visible to the applicant until an officer releases
  decisions for the cycle. This avoids partial or accidental early reveals.
- Each change writes a history row: old status, new status, who, when, and an
  optional internal note.

### Who can see and do what

| Role | Who | Can |
| --- | --- | --- |
| Applicant | Anyone signed in with a UT email | Create, edit, and submit their own draft; see their own status; withdraw |
| Reviewer | Subteam leads, granted per subteam | Read applications that ranked their subteam; add internal notes; move to `under_review` or `interview` |
| Officer | Captains and officers | Everything a reviewer can do, for all subteams; final decisions; release decisions; manage cycles and reviewers |

- Reviewer notes are never shown to applicants.
- Access is granted per account and removed at the end of a lead's term.
- **DECIDE:** which positions are officers, and whether reviewers can see
  applicants who ranked their subteam second or third (recommended: yes).
- Export: off in v1. **DECIDE:** if needed, officers only, CSV, without notes.

### Notifications (#51)

- Applicant: confirmation after submission, a note when moved to `interview`,
  and the decision once released.
- Officers: optional daily digest of new submissions (counts, no answers).
- Emails never include application answers; they link back to the applicant
  dashboard.
- **DECIDE:** the team-approved wording for each decision email.

### Retention and access

- Rejected, waitlisted, and withdrawn applications (answers, notes, and
  history) are deleted 12 months after the cycle closes.
- Accepted applicants: answers are deleted on the same schedule, and only a
  roster record is kept (name, UT email, subteam, cycle).
- Drafts never submitted are deleted when the cycle closes.
- Applicants can ask for deletion at any time by emailing the team; an officer
  deletes the account and application.
- **DECIDE:** 12 months, or shorter.

## Part 2: backend and hosting (#44)

### Options considered

| | A. Keep Google Forms | B. Static site + Supabase (recommended) | C. Move to a server-rendered host |
| --- | --- | --- | --- |
| Applicant accounts and status page | No | Yes | Yes |
| Per-subteam reviewer permissions | Manual sheet sharing | Enforced in the database (row-level security) | In app code |
| Changes to current hosting | None | None: still GitHub Pages | New host, new deploy pipeline |
| Cost | Free | Free tier to start (see limits) | Free tier on most hosts, plus a database |
| Work | Low | Medium | Highest |

Option A cannot meet #46 to #50 (accounts, applicant status, scoped
reviewers, audit history). Option C adds a server we would have to run and
secure for one feature. Option B keeps the public site exactly as it is and
adds only the backend that applications need.

### Architecture (option B)

```
Browser (static pages on GitHub Pages)
  /apply/, /apply/status/, /review/   client-rendered, no applicant data in the build
        |
        |  HTTPS, user session from Supabase Auth
        v
Supabase project
  Auth        one-time email code or link, restricted to @utexas.edu
  Postgres    applications, choices, answers, reviewers, history
              row-level security on every table
  Functions   submit (deadline check, idempotent confirmation email)
              release decisions, scheduled retention cleanup
  Email       sent through a transactional email provider (custom SMTP)
```

- The site still builds with `output: "export"`. The new pages are static
  shells that load data in the browser after sign-in, so applicant data never
  appears in the build or the repository.
- The browser only ever has the **publishable** key (`sb_publishable_...`).
  It is not a secret; row-level security decides what each signed-in user can
  read or change. The **secret** key bypasses row-level security, so it lives
  only in Supabase function secrets, never in the site or in GitHub Pages.
- Subteams are seeded from `lib/subteams.ts`, so ids match the public site and
  the hub.

### Sign-in

- Email one-time code or magic link (Supabase Auth), allowed only for
  `@utexas.edu` addresses (enforced server-side by an auth hook, not only in
  the form).
- Why not passwords: no password storage, resets, or reuse risk, and the
  code proves the applicant controls their UT email. This replaces the
  password flows listed in #46.
- UT single sign-on (EID login) would be ideal, but needs approval from UT and
  a paid plan for SAML. Possible later; not needed for v1.
- Redirect URLs are allow-listed to `https://longhornbajaracing.com` plus
  local development.

### Environments

| Environment | Database | Site |
| --- | --- | --- |
| Local | `supabase start` (local Docker) with seed data | `npm run dev` |
| Staging | Separate Supabase project with test data only | Local build or a manually run preview |
| Production | Production Supabase project | GitHub Pages, deployed from `main` as today |

The free plan allows two active projects, which covers staging and production.

### Configuration

Public, safe to commit or set at build time:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Secret, stored only as Supabase function secrets or GitHub Actions secrets:

- Supabase secret key (functions only)
- Email provider API key or SMTP password (functions and Auth only)
- `SUPABASE_ACCESS_TOKEN` and the project ref (GitHub Actions, to apply
  migrations)

### Deployment

- Schema changes live in `supabase/migrations/` and are reviewed in PRs like
  any other code (#45).
- A GitHub Actions job applies migrations to production after merge to `main`,
  behind the existing `CI required` gate. Staging is updated manually before
  merging.
- Row-level security policies are tested in CI against a local database:
  applicant, reviewer, officer, and signed-out access (#50, #52).
- The static site deploy is unchanged.

### Limits and costs to plan for

- Free Supabase projects **pause after about a week of inactivity**, and a
  paused project must be restored by hand. Recruiting is seasonal, so either:
  restore the project before each cycle opens (launch checklist item), or move
  to the Pro plan (about 25 USD per month) during cycles. **DECIDE.**
- Supabase's built-in email sender is heavily rate-limited and meant for
  testing. Production needs a transactional email provider (custom SMTP) with
  a sending domain we control. **DECIDE:** provider, and whether to send from a
  `longhornbajaracing.com` address (needs DNS records).
- Free-plan storage (500 MB database) is far beyond what applications need.
- Check current limits on the official pricing page before launch; they change.

### Migration from the Google Form

- The current form (`siteConfig.applyUrl`) stays live until the new flow
  passes the #52 checklist on staging.
- The cycle in progress at launch finishes on whichever system it started on.
- After launch, the old link is removed from the site and the form is closed
  with a pointer to the new page.

## Mapping to issues

| Issue | Covered here | Next step after sign-off |
| --- | --- | --- |
| #43 | Part 1 | Close once DECIDE items are answered |
| #44 | Part 2 | Close once the option and the DECIDE items are agreed |
| #45 | Data model and retention | Write migrations and seed |
| #46 | Sign-in | Email code sign-in and protected pages |
| #47 | Shared subteam ids | Apply actions on subteam cards |
| #48 | Fields, validation, deadlines | Application form |
| #49 | Applicant-visible statuses | Applicant dashboard |
| #50 | Roles and transitions | Reviewer dashboard |
| #51 | Notifications | Email functions |
| #52 | Environments, secrets, migration | Launch checklist |

## Decisions needed (checklist)

- [ ] UT email required for everyone?
- [ ] Phone required or optional?
- [ ] Any subteam-specific questions for the first cycle?
- [ ] Resume as a link (recommended) or as an upload?
- [ ] Submitted applications editable until the deadline?
- [ ] First cycle dates; is there a spring cycle?
- [ ] Which positions are officers; can reviewers see 2nd and 3rd choices?
- [ ] Export needed in v1?
- [ ] Decision email wording.
- [ ] Retention period (12 months proposed).
- [ ] Backend option B approved?
- [ ] Free plan with manual restore, or Pro during cycles?
- [ ] Email provider and sending address.

## References

- Supabase API keys (publishable and secret): https://supabase.com/docs/guides/api/api-keys
- Supabase production checklist (custom SMTP, rate limits): https://supabase.com/docs/guides/deployment/going-into-prod
- Supabase pricing: https://supabase.com/pricing
