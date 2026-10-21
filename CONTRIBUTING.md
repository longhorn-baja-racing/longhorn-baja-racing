# Website quality checks

Every pull request, main push, merge queue run, manual run, and weekly schedule runs:

- A clean locked dependency install, ESLint with zero warnings, and TypeScript.
- A high/critical production dependency audit and the production static build.
- Export checks for all eight pages, titles, canonical URLs, local assets/links, calendar settings, and image size budgets.
- Chromium, Firefox, WebKit, and phone browser tests: page rendering, image loading, mobile navigation, keyboard interactions, subteam cards, merch feedback, legacy links, calendar configuration, application links, and serious/critical accessibility violations.

Run locally with Node 22:

```sh
npm ci
npm run lint
npm run typecheck
npm audit --omit=dev --audit-level=high
npm run build
npm run test:export
npx playwright install chromium firefox webkit
npm test
```

Browser tests serve the actual production export, with no reused development server. Failures and flaky retries fail CI; focused tests are forbidden. Traces, screenshots and reports are retained for failures. The Google Calendar and external sponsor-image service are stubbed: their availability and account permissions require a live check.

The named `CI required` gate fails when any prerequisite fails, is cancelled, or is skipped. Main must be current before merging. Deployment is limited to main pushes/manual runs after this gate, using the exact tested artifact. PRs run without deployment permissions. Do not rename this gate without updating the GitHub branch rules.
