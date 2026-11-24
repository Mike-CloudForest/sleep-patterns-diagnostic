# Cloud Forest Sleep Patterns Field Guide

An adult educational assessment built from *Sleep Patterns — A Field Guide*. It describes reported sleep arrangements and provides guide-based explanations, a sleep diary, and PDF reports. It cannot provide a clinical diagnosis.

## Open the app

- [Public assessment](https://mike-cloudforest.github.io/sleep-patterns-diagnostic/)
- [Contact administration](https://mike-cloudforest.github.io/sleep-patterns-diagnostic/admin.html)
- [Privacy and report information](https://mike-cloudforest.github.io/sleep-patterns-diagnostic/privacy.html)
- [Source Field Guide PDF](assets/Sleep-Patterns-Guide.pdf)

## Using the assessment

Answer the core questions about your main sleep, naps, total sleep and afternoon alertness. The questions adapt to your answers. The result explains the closest matching arrangement and identifies answers that need clarification.

The learning sections expand on sleep stages, sleep pressure, circadian timing, chronotype, schedule changes and the guide's examples. Optional observations add context. The optional Western zodiac, Chinese zodiac and Human Design sections present the guide's traditional reflections. A diary can include up to 14 distinct dates.

Download PDF and Print report create a copy in the browser. The email form sends the assessment to the report service, which creates the PDF attachment itself. Emailing a report requires agreement to the displayed report-processing consent.

Newsletter subscription starts unchecked. Selecting it requires typing a full name to sign the displayed consent. The service records the signature, exact consent text, version and server timestamp. Leaving the choice unchecked on a later report request preserves the existing preference. The preferences link in each report email opens an unsubscribe confirmation page.

An email-service acceptance means the provider accepted the message for sending. Inbox delivery and spam placement depend on the receiving email service. If a request has an uncertain outcome, submit the same form again so the existing request ID can confirm or complete it safely.

## Owner access and CSV files

Open the administration page and request a sign-in link for `sifu@cloudforesttemple.com`. Each link expires after 15 minutes and can be used once. Administrator sessions last four hours. Use Sign out when finished.

The dashboard shows contacts, newsletter preferences, signed consent details and accepted-report totals. Its CSV export defaults to **Active subscribers**. Choose **All contacts** for the complete report-contact list. Other filters include unsubscribed and report-only contacts. Use the active-subscriber export for newsletter mailings and refresh it before sending so recent unsubscribe choices are included.

The app maintains a contact and consent list for this assessment. CSV files include contact details, newsletter status, signature, exact consent text, version, consent time and report-delivery records. Exporting a CSV does not send a newsletter.

## Source layout

| File | Purpose |
| --- | --- |
| `assessment.js` | Question routing, validation, consent copy and report version |
| `guide-model.js` | Guide-based explanations, source references and diary guidance |
| `traditions.js` | Optional tradition profiles and comparisons |
| `report.js` | Shared deterministic PDF generator |
| `app.js`, `index.html`, `styles.css` | Public assessment and browser report controls |
| `admin.*`, `unsubscribe.*`, `privacy.html` | Administration, preference confirmation and privacy information |
| `backend/` | Edge Function source, isolated database schema and deployment notes |
| `config.js` | Public website and report-service URLs |

GitHub Actions publishes the `main` source through `gh-pages`. The report service has a separate Supabase deployment. Publish matching browser and backend copies of the shared modules whenever the assessment or report changes. Backend setup and retry behavior are documented in [backend/README.md](backend/README.md).

## Data handling

Answers, tradition selections and diary entries use the current tab's session storage for refresh recovery. Browser restoration can restore that session. Downloads and printed copies are controlled by the user's device.

The application database retains contact details, consent events, newsletter status, delivery records and a protected submission fingerprint. Assessment answers, diary contents and generated PDFs remain in processing memory during email generation. Resend receives the outgoing message and attachment, and provider and mailbox retention follow their respective policies.

Contact, consent and delivery records currently have no automatic deletion schedule. An unsubscribe updates the newsletter preference while retaining consent and report history. Contact `sifu@cloudforesttemple.com` for record questions, corrections or deletion requests. The public privacy page contains the fuller explanation.

## Verification recorded during implementation

Local checks covered validation, consent requirements, request replay, identical PDF/email bytes on retry, changed-payload rejection, signed unsubscribe verification, owner-only sign-in mail, one-use login tokens, session logout, CSV escaping and request-size/CORS limits. The backend checks used mocked database and email responses, with zero actual email sends.

These local results are separate from live deployment, database-permission and recipient-delivery verification. Complete those checks for each deployed release and record their actual outcomes.
