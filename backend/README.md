# Sleep report service

The Supabase Edge Function `sleep-reports` creates and emails PDF reports, records consent and newsletter preferences, serves owner-only contact administration, and protects optional saved assessments behind email verification.

## Deployment

The target project is Cloud Forest Reach, `hvbdphmuvbqssvmvbral`. Its public endpoint is [sleep-reports](https://hvbdphmuvbqssvmvbral.supabase.co/functions/v1/sleep-reports).

1. Apply `schema.sql` for the original isolated report/contact service, then `profile-schema.sql` for saved assessments, visitor sessions and separate retention-consent records. Existing deployments need only the new profile schema.
2. Configure Vault secrets named `sleep_resend_api_key` and `sleep_signing_secret`. Use a securely generated signing secret of at least 32 characters. Never commit either value.
3. Deploy `backend/index.ts` as the function entrypoint. Include all relative dependencies: root `assessment.js`, `report.js`, `guide-model.js`, `traditions.js`, `rhythm-insights.js`, `chart-view.js`, `profile-data.js`, `birth-profile.js`, `birth-chart.js`, and `vendor/chart-engine.js`. Keep browser and server report versions aligned.
4. Set `verify_jwt` to `false`. The public report operation permits anonymous requests. Administrator operations validate their own opaque bearer sessions.
5. Verify health, anonymous-data denial, consent handling, one report delivery and owner login against the deployed service.

The runtime uses Supabase's injected `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. `sleep_get_config()` reads the two named Vault entries. The schema grants this RPC and application-table access only to `service_role`, enables RLS, and revokes direct access from `PUBLIC`, `anon` and `authenticated`. Its security-invoker configuration reader requires service-role access to the Vault view.

The Edge Function imports `npm:pdf-lib@1.17.1` directly. No Deno import-map configuration is required. The browser uses its vendored copy. Keep the deployment entrypoint and shared-module paths together when packaging the function.

## Configuration and identity

| Setting | Value |
| --- | --- |
| Allowed browser origin | `https://mike-cloudforest.github.io` |
| Public site base | `https://mike-cloudforest.github.io/sleep-patterns-diagnostic/` |
| Administrator email | `sifu@cloudforesttemple.com` |
| Email sender | `Cloud Forest <support@traincloudforest.com>` |
| Reply address | `sifu@cloudforesttemple.com` |
| Report version | Exported `REPORT_VERSION` in `assessment.js` |
| Consent version and text | Exported constants in `assessment.js` |

Increment `REPORT_VERSION` whenever a change affects the generated report or email payload. Deploy matching shared-module versions together. Older clients receive an update-required response. Signing-secret rotation invalidates outstanding unsubscribe signatures and request fingerprints, so plan rotation around those existing records.

## Request behavior

Use JSON `POST` requests with an `action` field. The service limits each body to 50 KiB and rejects a populated `website` honeypot. It validates assessment fields and generates attachments on the server.

`validateAssessment` allowlists the sleep answers, tradition selections, diary and derived-only chart summary. A report-only request never accepts `birthDetails`. With `saveProfileConsent: true` and the current `profileConsentVersion`, `validateSavedProfile` validates the birth input, recalculates a submitted chart on the server and supplies canonical sign/type overrides. Only then is the resulting snapshot eligible for retention. Full birth details are stored solely in that optional snapshot and are not passed to PDF generation. The display name, email and newsletter consent remain governed by their existing separate fields.

Saved-profile consent is separate from report delivery and newsletter signup. Its exact text and version come from `profile-data.js`, and the database records them with a server timestamp. Missing, false or outdated save consent cannot retain birth details. Report-only email/PDF use continues to work without a saved profile.

| Action | Authentication and behavior |
| --- | --- |
| `report` | Public. Requires report consent, version fields and a UUID `requestId`. Newsletter opt-in also requires a typed signature. |
| `admin-login` | Public. Sends a one-use sign-in link only to the owner email. |
| `admin-redeem` | Exchanges a valid link token for a four-hour administrator session. |
| `admin-list` | Bearer session with `contacts:read`. Supports offset, limit and status filters. |
| `admin-export` | Bearer session with `contacts:export`. CSV defaults to active subscribers and uses a single database snapshot. |
| `admin-logout` | Revokes the current bearer session. |
| `admin-profile-get` | Owner bearer session with `contacts:read`. Reads a confirmed saved assessment by its ID. |
| `profile-login` | Public. Requests a one-use sign-in email and returns the same response whether an address has a profile or not. |
| `profile-redeem` | Exchanges a valid one-use visitor link for a four-hour contact-scoped session. A report link also confirms its pending snapshot. |
| `profile-list` | Visitor bearer session with `profile:read`. Lists only this contact's confirmed assessment summaries, with offset/limit pagination. |
| `profile-get` | Same visitor read scope. Returns this contact's selected confirmed snapshot, or latest if `id` is omitted. |
| `profile-save` | Visitor bearer session with `profile:write`. Explicit current save consent, validated assessment, birth details and UUID request ID create a new confirmed snapshot. |
| `profile-delete` | Visitor bearer session with `profile:delete`, UUID request ID and exact `DELETE MY SAVED PROFILE` confirmation. Deletes this contact's saved snapshots and visitor tokens. |
| `profile-logout` | Revokes only the presented visitor session. |
| `unsubscribe` | Public confirmation POST with a valid signed link token. GET never changes newsletter preferences. |

`admin-list` adds a `savedProfile` summary (or `null`) to each contact. Those summaries omit birth details and include only confirmed records. Administrator and visitor tokens are stored in different tables and are not interchangeable.

GET returns service/version information. The service reports `sent` after Resend accepts the email and the database records the provider ID. That status does not prove inbox delivery. Report generation or provider errors return an honest retryable error.

## Retries and limits

A request ID belongs to one canonical payload and report version. Changed content with the same ID receives 409. Atomic claims use a three-minute lease. A matching in-progress request returns 202 with a five-second retry hint. A completed replay returns its recorded result.

Failed or interrupted requests can reclaim a lease within 20 hours of creation and reuse the same provider idempotency key. Report PDFs, email content and unsubscribe links are deterministic for that request. An unfinished request expires after 20 hours and requires a new request ID. Completed requests retain their recorded replay result. Replaying an old request does not repeat newsletter consent or reverse an unsubscribe.

| Action | Per IP per hour | Per email per hour | Global per hour | Global per UTC day |
| --- | --- | --- | --- | --- |
| Report | 8 | 4 | 100 | 500 |
| Admin login | 20 | 3 | 100 | 500 |
| Admin redeem | 20 | — | 100 | 500 |
| Unsubscribe | 20 | — | 100 | 500 |

Limits use atomic fixed-window reservations and keyed hashes of IP/email values. Each action has its own buckets. Exact sent/in-progress replays detected by the fast path skip additional reservations. Rate-limit responses return 429 with a 3,600-second retry hint. Daily limits remain effective until the next UTC day.

## Saved-profile verification and retention

A report request with explicit save consent first creates a **pending**, immutable assessment snapshot, keyed by the report request UUID. The report email contains a one-use confirmation link. That link verifies inbox ownership before the snapshot is added to the visitor's confirmed history. Anonymous requests cannot overwrite a confirmed profile or read any existing saved record. Visitors with confirmed history can request a new 15-minute sign-in link; their normal sign-in does not silently confirm later pending submissions. If only a pending profile exists, a recovery link can confirm it while its seven-day pending window is still valid.

The report link and its seven-day expiry are deterministic for the original request. The derived age band uses the original request timestamp, including when a birthday occurs during a retry. Authenticated save retries likewise use the original snapshot timestamp. Retries retain identical email bytes and preserve token redemption state. A profile deleted after a failed/uncertain email is not recreated by retrying its original report UUID. A fresh authenticated save adds a new history entry instead of overwriting earlier ones. The SQL save operation rechecks the visitor session while holding the contact lock, so a concurrently revoked session cannot write after deletion.

Confirmed snapshots retain the validated answers, selected/derived profiles, derived chart, birth details supplied under consent, diary, report version and creation timestamp. PDFs are generated on demand and are not stored in the application database. Old snapshots are read as saved rather than recalculated, preserving the result shown at that time. Pending snapshots are inaccessible through visitor/admin detail routes until confirmed. Their links expire after seven days; expired pending rows and expired visitor tokens are removed during later new saves. There is no scheduled background retention job.

The verified visitor can delete all saved assessments and birth details and revoke all visitor sessions. Contact, save-consent, newsletter-consent and report-delivery audit records remain; deleting a profile does not subscribe or unsubscribe the contact. Contact and audit records have no automatic deletion schedule. Data copies in downloaded files and recipient/provider mailboxes follow those systems' retention. Expired original rate buckets and administrator tokens continue to be removed by the original rate-limit RPC.

## Verification

Local mocked-handler checks passed for consent validation, request replay, byte-stable retry payloads, payload conflicts, HMAC tampering, unsubscribe preservation, owner-only login, one-use token redemption, scoped sessions, logout, CSV formula escaping, bounded bodies and CORS. No real email was sent by those checks. Deployment and end-to-end delivery require their own observed verification.


Run `node --test tests/profile-service.test.mjs` for the saved-profile handler tests. All database and email calls in that suite are intercepted; no external requests or actual emails are sent. The 17-test suite checks visitor/admin token separation, contact-scoped history and reads, expired/read-only sessions, generic login responses, one-use redemption, explicit save consent, idempotent history saves, report-only non-retention, pending confirmation, deterministic saved-report retries, scoped deletion/logout, administrator profile access, server recalculation of submitted charts, birth-date reconciliation of age/signs, and birthday-safe report retries. Database grants, SQL concurrency and deployment still require separate live verification by the release owner.
