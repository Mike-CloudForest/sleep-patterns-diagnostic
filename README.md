# Cloud Forest Sleep Patterns Field Guide

An adult educational assessment built from *Sleep Patterns — A Field Guide*. It identifies a reported sleep arrangement, explains which answers produced the result, and connects that result with self-described preferences and optional traditional birth profiles. Visitors can download or email a PDF and, with separate consent, save a private assessment history. It does not provide a clinical diagnosis or establish that a birth chart determines a person's sleep needs.

## Release status

**Source release: `2026-11-24-guide-5`.** The saved-profile database migration and matching `sleep-reports` Edge Function were deployed on November 24, 2026. Row-level security is enabled on the three profile tables. Access checks verified service-role permissions and direct public-access denial for those tables and the four new RPCs. Edge Function version 5 reports the matching guide-5 report version and preserves the existing custom session authentication.

The release passed 140 automated tests, 14 groups of rollback-only checks against the production database, and live HTTP checks for version, authentication and CORS behavior. The browser preview and generated PDF were also verified. Public-browser acceptance remains a separate deployment check after Pages publishes the matching browser files; the checks recorded here do not claim that step has completed.

- [Existing public assessment](https://mike-cloudforest.github.io/sleep-patterns-diagnostic/)
- [Existing contact administration](https://mike-cloudforest.github.io/sleep-patterns-diagnostic/admin.html)
- [Public privacy information](https://mike-cloudforest.github.io/sleep-patterns-diagnostic/privacy.html)
- [Source Field Guide PDF](assets/Sleep-Patterns-Guide.pdf)
- [New saved-profile page source](profile.html)

## Assessment sections

The core sleep questions adapt to the visitor's answers. The profile intake then presents five shorter steps with Back and Next controls. Unknown birth information can remain unknown, and the sleep result remains available without a chart.

| Section | Inputs and resulting information |
| --- | --- |
| Your sleep | Main sleep, additional sleep or naps, total sleep and afternoon alertness. The result explains the closest matching arrangement, supporting answers and any uncertainty. |
| Birth details | Full date, local clock time, confidence in that time and birthplace. The birthplace search runs locally against a bundled city list; an unlisted place can be entered with its known IANA time-zone name. |
| Chinese horoscope | Birth-year animal, year element and yin/yang under the Lunar New Year convention, with the guide's traditional temperament and rest themes. A known animal can also be selected manually. |
| Western horoscope | Calculated tropical Sun and Moon signs when sufficient birth details are available. A date-only entry provides a Sun-sign estimate, with confirmation needed near transitions; a known Sun sign can be selected manually. |
| Human Design | Calculated type, authority, profile, definition, defined centers, channels and Personality/Design gate-and-line activations. A known type may be supplied instead when the birth time or place is unknown. |
| Everyday rhythm | Preferred hours, settling difficulties, energy style, schedule fit, response to routine changes and social recovery preferences. These are observations about the visitor's own experience. |

Personality answers do not calculate a horoscope or Human Design type. The report compares the selected or calculated traditional themes with actual sleep answers and everyday preferences. It describes points of support, tension and uncertainty without a compatibility score or an invented personality diagnosis. Traditional labels never change the observed sleep classification or establish a biological sleep requirement.

The result also includes explanations of sleep stages, sleep pressure, circadian timing, chronotype, schedule changes and the guide's examples. An optional diary can include up to 14 distinct dates. The web report and PDF share the assessment, interpretation and chart-description modules.

## Chart calculation and limits

`birth-chart.js` resolves the entered local date and time using the birthplace's historical IANA time-zone rules, then calculates apparent tropical planetary positions and true lunar nodes. Human Design's Design moment is solved as an **88-degree solar arc**, rather than subtracting a fixed number of days. Type, authority, profile, centers, channels and definition are derived from the resulting gate activations.

A nonexistent local time is rejected. When a clock time occurred twice during an offset change, the visitor must choose the earlier or later occurrence. An unknown time is never replaced with noon or another assumed time. Approximate times, historical time-zone limits and positions close to relevant boundaries are retained as warnings. “Entered time” describes the supplied information, not a guarantee that the birth record or historical zone data is perfect.

These are geocentric calculations. Birthplace determines the time zone; the app does not claim an ascendant, houses, a complete Western natal chart, a full Chinese Four Pillars chart, Human Design color/tone/base, or the separate DreamRave sleeping chart. The calculated chart supports explanations within these traditional systems; computational agreement does not establish scientific validity for personality or sleep predictions.

The derived chart object contains only its version, Western signs, Human Design results, warnings and precision. It excludes the raw birth date, time, place, coordinates and UTC instant. [The chart-engine notes](tools/chart-engine/README.md) document the input contract, method, dependency build and reference fixtures.

## PDF reports and email

**Download PDF** saves a copy from the browser. **Print report** opens the generated PDF in a new tab for the PDF viewer's Print command; if that tab is blocked, the report downloads with instructions. The PDF includes the sleep result, supporting answers, rhythm comparisons, traditional profiles, calculated chart details when present, and diary entries. It does not include the raw birth details.

The email form sends the validated assessment to the report service, which creates the PDF attachment itself. Emailing a report requires agreement to the displayed report-processing consent. Report-only requests do not retain the answers or chart in the application database. The service never needs raw birth details for a report-only email.

Newsletter subscription starts unchecked and requires a typed full-name signature. Its exact consent text, version and server timestamp are recorded. The separate saved-profile option does not subscribe the visitor. Leaving newsletter signup unchecked on a later report preserves the existing newsletter preference. The preferences link in each report email opens an unsubscribe confirmation page.

The service reports acceptance after the email provider accepts the message and the delivery record is saved. This does not guarantee arrival in a particular inbox. If a request has an uncertain outcome, retry the same form with its existing request ID; an unchanged request can confirm or finish its original submission without sending a new logical report.

## Saved profiles and assessment history

Saving starts with an explicit, unchecked consent choice, separate from both report delivery and the newsletter. Its wording explains that Cloud Forest may retain the birth inputs, chart, sleep answers and diary, and that the authorized Cloud Forest administrator may review them.

An initial email report with save consent creates a pending snapshot. The visitor confirms it through a one-use link in the report email before it becomes available in their history. This prevents an anonymous submission from overwriting or exposing another person's confirmed profile. A report confirmation link expires after seven days. Unconfirmed snapshots expire after that window and are removed during later save activity; there is no scheduled background cleanup job.

Returning visitors use `profile.html` to request a one-use sign-in link. The response does not reveal whether an email address has saved records. Recovery links expire after 15 minutes; a successful redemption creates a contact-scoped, four-hour session. The session is stored in that browser tab, separate from administrator access. The link token is removed from the visible URL after redemption begins.

The saved-profile page lists confirmed assessments, opens their recorded answers and chart, generates a PDF, and offers an edit link back to the assessment in the same tab. Saving an update creates a new history entry instead of overwriting the earlier snapshot. Birth details are shown only in a separately opened details section and are excluded from PDFs. The backend recalculates a newly submitted chart from the birth inputs before retaining a snapshot; it does not trust a caller-supplied chart label.

A verified visitor may delete all saved assessments and birth details by entering `DELETE MY SAVED PROFILE`. This revokes their visitor sessions. Contact, consent, newsletter preference and report-delivery audit records remain, and deletion does not change newsletter membership. Previously emailed or downloaded files and service backups follow their own retention processes.

## Owner access and CSV files

Open the administration page and request a sign-in link for `sifu@cloudforesttemple.com`. Each link expires after 15 minutes and can be used once. Administrator sessions last four hours. Use Sign out when finished.

The dashboard shows contacts, newsletter preferences, signed consent details and accepted-report totals. The new release also shows a summary of a contact's latest confirmed saved assessment, with a protected detail view for the owner. Pending snapshots are excluded. Administrator and visitor tokens are not interchangeable, and the public database roles cannot read these records directly.

CSV export defaults to **Active subscribers**. Other filters include all contacts, unsubscribed and report-only contacts. CSV files contain contact and newsletter-consent/delivery details; they do not include raw birth details or saved assessment payloads. Exporting does not send a newsletter. Refresh the active-subscriber export before a mailing so recent unsubscribe choices are included.

## Data handling

Sleep answers, selected profiles, derived charts and diary entries use the current tab's session storage for refresh recovery. Browser restoration may restore that session. Raw birth inputs remain in page memory unless the visitor explicitly chooses to save them. City queries and chart calculations run locally; no birth information is automatically sent to an external astrology calculator.

The original database retains contact details, consent events, newsletter status, report-delivery records and protected submission fingerprints. With current saved-profile consent, it additionally retains the validated assessment snapshot, birth details, derived chart, report version and creation timestamp. Saved-profile consent events record the exact wording and server time. Generated PDFs are produced on demand and are not retained in the application database.

Resend receives outgoing email and its attachment. Provider and recipient-mailbox retention follow their respective policies. Contact and audit records have no automatic deletion schedule. Contact `sifu@cloudforesttemple.com` for record questions, corrections or deletion requests. [privacy.html](privacy.html) contains the visitor-facing explanation.

## Source layout

| File | Purpose |
| --- | --- |
| `assessment.js` | Question routing, validation, consent copy and report version |
| `guide-model.js` | Guide-based explanations, source references and diary guidance |
| `traditions.js`, `rhythm-insights.js` | Traditional comparisons and findings from reported everyday preferences |
| `birth-profile.js` | Chinese lunar-year lookup and date-only Western sign estimates |
| `birth-chart.js`, `vendor/chart-engine.js` | Local time resolution, astronomy and derived chart calculations |
| `places.js`, `assets/birth-cities.json` | Local birthplace search and IANA zone labels |
| `profile-ui.js`, `profile-wizard.css` | Five-step birth and everyday-rhythm intake |
| `profile-data.js` | Strict derived-chart and birth-input validation, saved-profile consent |
| `chart-view.js` | Shared chart descriptions and web BodyGraph rendering |
| `report.js` | Shared deterministic PDF generator |
| `app.js`, `index.html`, `styles.css` | Public assessment and browser report controls |
| `profile.*`, `profile-client.js`, `profile-account.css` | Visitor sign-in, saved history and profile-session client |
| `admin.*`, `unsubscribe.*`, `privacy.html` | Owner administration, preference confirmation and privacy information |
| `backend/` | Edge Function, isolated database schemas and deployment notes |
| `tools/chart-engine/` | Pinned dependency build and calculation/reference documentation |
| `config.js` | Public website and report-service URLs |

## Dependencies and local verification

The public application is static HTML, CSS and JavaScript; no application build step is required. Use an HTTP development server or the supported managed preview workflow so ES modules and the birthplace JSON load normally. Browser interaction checks must be separate from mocked service tests; a local preview does not establish production email or database behavior.

Run the regression suite from the repository root:

```sh
node --test tests/*.test.mjs
```

The tests cover contrasting sleep answers and all 14 result categories, traditional-profile combinations, Chinese New Year fixtures, Western boundary dates, chart calculations, rhythm comparisons and profile-service behavior. The chart fixtures compare all 130 published gate/line cells across five reference charts and exercise offset gaps/folds, an unusual half-hour fold, a skipped civil date, the 88-degree solve and invalid/unknown inputs. The reference repository supplies numerical vectors; it does not include the original third-party calculator screenshots. This is a numerical cross-check, not clinical or psychological validation.

`tests/profile-service.test.mjs` intercepts database and email calls. It checks ownership, visitor/administrator token separation, consent, one-use links, expiry, retries, scoped deletion/logout, report-only non-retention and server chart recalculation. These tests send no real email.

Verification recorded on November 24, 2026:

- **140 automated tests passed**, with no failures. JavaScript syntax, backend TypeScript transformation, local dependency paths and whitespace checks passed.
- **14 groups of rollback-only production database checks passed**, covering saved assessments, token redemption, retries, ownership, history, deletion and prevention of recreation through an old request. No test fixtures remained after rollback. Table/RPC grants and row-level security were checked separately.
- Live HTTP checks confirmed the guide-5 service version, `401` responses for private list/save operations without a session, an allowed-origin `204` preflight and a `403` response for a foreign origin.
- The browser preview produced Monophasic and Segmented sleep from contrasting answers, calculated the expected reference birth profile, preserved usable results with an unknown birth time, and generated a visually inspected 12-page PDF.

These checks do not establish actual email delivery or completion of the final public-browser flow. Verify those separately when performing the corresponding release acceptance steps.

The committed chart bundle is built from pinned MIT dependencies: `hd-chart-engine` 0.1.1, `astronomy-engine` 2.1.19 and `luxon` 3.7.2. `esbuild` 0.28.2 is a build dependency. To rebuild:

```sh
cd tools/chart-engine
npm ci --ignore-scripts
npm run build
```

The optional GPL Moshier backend and Swiss Ephemeris are not included in the shipped bundle. Preserve [vendor/chart-engine.LICENSE.txt](vendor/chart-engine.LICENSE.txt), the Astronomy Engine license and fixed BodyGraph reference license under `tools/chart-engine/`. The bundled city list is derived from `city-timezones` 1.3.4, whose package declares MIT but ships no separate license file; [vendor/CITY-DATA-NOTICE.md](vendor/CITY-DATA-NOTICE.md) records its provenance and integrity value faithfully. The browser's `pdf-lib` copy has its own [license notice](vendor/pdf-lib-LICENSE.md); the Edge Function imports `npm:pdf-lib@1.17.1`.

## Deployment order

GitHub Actions publishes a push to `main` through the `gh-pages` branch. The report service has a separate Supabase deployment. Keep the browser, report generator and service on matching versions.

1. Apply and verify required database migrations in the existing Cloud Forest Reach project before publishing dependent routes. Both the original `backend/schema.sql` and the guide-5 `backend/profile-schema.sql` are deployed. The profile migration adds saved assessments, profile consent events and visitor tokens, with RLS and service-only access. Do not replace existing contact data or reapply completed schemas as a substitute for a new migration.
2. Deploy `backend/index.ts` as `sleep-reports`, including **all** relative dependencies: `assessment.js`, `guide-model.js`, `traditions.js`, `report.js`, `rhythm-insights.js`, `chart-view.js`, `profile-data.js`, `birth-profile.js`, `birth-chart.js` and `vendor/chart-engine.js`. Preserve the existing custom authentication arrangement and `verify_jwt: false`. Keep server-only secrets in Vault.
3. Verify the service version, restricted table/RPC access and the intended profile operations. For this release, the database and Edge Function checks described above passed on November 24, 2026. Future releases must repeat the checks relevant to their changes.
4. Publish the matching browser source to `main` only after the service is ready. Check the Pages workflow, complete the public quiz and profile flows, inspect a generated PDF, and separately verify any authorized email delivery.

`REPORT_VERSION` is exported by `assessment.js`. Update it and the release query values/import maps in all affected HTML entrypoints together. Older clients receive an update-required response from the service, so deploy the matched versions in a coordinated release. Changes to question meanings must also preserve or explicitly review older saved answers. [backend/README.md](backend/README.md) documents the API, request limits, database schema, consent and idempotent retry behavior.
