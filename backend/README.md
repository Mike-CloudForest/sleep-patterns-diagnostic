# Sleep report service

The Supabase Edge Function `sleep-reports` creates and emails PDF reports, records consent and newsletter preferences, and serves owner-only contact administration.

## Deployment

The target project is Cloud Forest Reach, `hvbdphmuvbqssvmvbral`. Its public endpoint is [sleep-reports](https://hvbdphmuvbqssvmvbral.supabase.co/functions/v1/sleep-reports).

1. Apply `schema.sql` to create the isolated `sleep_` tables, indexes and RPCs.
2. Configure Vault secrets named `sleep_resend_api_key` and `sleep_signing_secret`. Use a securely generated signing secret of at least 32 characters. Never commit either value.
3. Deploy `backend/index.ts` as the function entrypoint. Include the root-level `assessment.js`, `report.js`, `guide-model.js` and `traditions.js` with their relative paths intact.
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

| Action | Authentication and behavior |
| --- | --- |
| `report` | Public. Requires report consent, version fields and a UUID `requestId`. Newsletter opt-in also requires a typed signature. |
| `admin-login` | Public. Sends a one-use sign-in link only to the owner email. |
| `admin-redeem` | Exchanges a valid link token for a four-hour administrator session. |
| `admin-list` | Bearer session with `contacts:read`. Supports offset, limit and status filters. |
| `admin-export` | Bearer session with `contacts:export`. CSV defaults to active subscribers and uses a single database snapshot. |
| `admin-logout` | Revokes the current bearer session. |
| `unsubscribe` | Public confirmation POST with a valid signed link token. GET never changes newsletter preferences. |

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

## Retention and verification

The database stores contact details, consent-event history, delivery state and keyed request fingerprints. It stores neither raw assessment/diary payloads nor PDF attachments. Contact, consent and delivery records have no automatic deletion schedule. Expired rate buckets and admin tokens are removed during later limited requests once they have been expired for over one day. Resend and recipient mailboxes retain outgoing reports under their own policies.

Local mocked-handler checks passed for consent validation, request replay, byte-stable retry payloads, payload conflicts, HMAC tampering, unsubscribe preservation, owner-only login, one-use token redemption, scoped sessions, logout, CSV formula escaping, bounded bodies and CORS. No real email was sent by those checks. Deployment and end-to-end delivery require their own observed verification.
