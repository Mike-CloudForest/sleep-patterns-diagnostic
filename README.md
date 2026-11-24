# Cloud Forest Sleep Patterns Field Guide

An adult educational assessment built from *Sleep Patterns — A Field Guide*. It describes reported sleep arrangements and provides guide-based explanations, a sleep diary, and PDF reports. It cannot provide a clinical diagnosis.

## Open the app

- [Public assessment](https://mike-cloudforest.github.io/sleep-patterns-diagnostic/)
- [Contact administration](https://mike-cloudforest.github.io/sleep-patterns-diagnostic/admin.html)
- [Privacy and report information](https://mike-cloudforest.github.io/sleep-patterns-diagnostic/privacy.html)
- [Source Field Guide PDF](assets/Sleep-Patterns-Guide.pdf)

## Using the assessment

Answer the core questions about your main sleep, naps, total sleep and afternoon alertness. The questions adapt to your answers. The result explains the closest matching arrangement, shows which answers produced it, and identifies answers that need clarification.

The quiz then presents a personal-profile step. A birth date can estimate the Western Sun sign and calculate the Chinese lunar-year animal, year element and yin/yang. Dates near a Western sign transition ask for confirmation; the app uses the Lunar New Year boundary for Chinese year labels. Known signs can also be selected manually. The full birth date stays in page memory and is omitted from session storage, PDFs, report requests and the external chart link.

Human Design uses a type from the visitor's existing chart. Visitors who do not know it can open Jovian Archive's official chart calculator, which asks for date, time and birthplace, then return and select the type. This app does not infer that type from personality or sleep answers, calculate a complete natal/Four Pillars chart, or calculate the separate DreamRave sleeping chart.

Preferred hours, the main obstacle to settling, and daily energy are available in that same step. The connected report compares each selected tradition with the actual reported sleep arrangement, explains similarities or differences, identifies shared traditional themes, and offers specific observations. The web result and PDF use the same synthesis. The traditional profiles never change the observed sleep classification or establish a biological sleep requirement.

The learning sections expand on sleep stages, sleep pressure, circadian timing, chronotype, schedule changes and the guide's examples. Optional observations add context. The optional Western zodiac, Chinese zodiac and Human Design sections present the guide's traditional reflections. A diary can include up to 14 distinct dates.

Download PDF saves a copy from the browser. Print report opens the generated PDF in a new tab, where the visitor can use the PDF viewer’s Print command. If the browser blocks the new tab, the report downloads with instructions. The email form sends the assessment to the report service, which creates the PDF attachment itself. Emailing a report requires agreement to the displayed report-processing consent.

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
| `birth-profile.js`, `profile-ui.js` | Local birth-date lookup and the quiz's personal-profile step |
| `report.js` | Shared deterministic PDF generator |
| `app.js`, `index.html`, `styles.css` | Public assessment and browser report controls |
| `admin.*`, `unsubscribe.*`, `privacy.html` | Administration, preference confirmation and privacy information |
| `backend/` | Edge Function source, isolated database schema and deployment notes |
| `config.js` | Public website and report-service URLs |

GitHub Actions publishes the `main` source through `gh-pages`. The report service has a separate Supabase deployment. Publish matching browser and backend copies of the shared modules whenever the assessment or report changes. Backend setup and retry behavior are documented in [backend/README.md](backend/README.md).

The assessment page uses versioned script URLs and an import map so returning browsers load the matching question, interpretation and PDF modules together. For a new release, update `REPORT_VERSION` and every `v=` release value in `index.html`, then deploy the shared backend modules. Changes to question meanings must also preserve or explicitly review older saved answers.

## Data handling

Completed assessment results, tradition selections and diary entries use the current tab's session storage for refresh recovery. Browser restoration can restore that session. Downloads and printed copies are controlled by the user's device.

The application database retains contact details, consent events, newsletter status, delivery records and a protected submission fingerprint. Assessment answers, diary contents and generated PDFs remain in processing memory during email generation. Resend receives the outgoing message and attachment, and provider and mailbox retention follow their respective policies.

Contact, consent and delivery records currently have no automatic deletion schedule. An unsubscribe updates the newsletter preference while retaining consent and report history. Contact `sifu@cloudforesttemple.com` for record questions, corrections or deletion requests. The public privacy page contains the fuller explanation.

## Verification recorded during implementation

Run `node --test tests/*.test.mjs` for the recorded regression suite. The November 24 profile release has 61 passing test groups covering 24 contrasting answer scenarios and all 14 sleep outcomes; all 720 Western × Chinese × Human Design combinations; selected-profile comparisons; Chinese New Year fixtures from Hong Kong Observatory; Western boundary dates; unsupported calendars; and validation that excludes raw birth details. Synthetic report checks also confirm that the same selected signs produce different comparison text when the sleep answers change, the PDF includes all three selected profiles, and repeated generation produces identical bytes.

Local checks covered validation, consent requirements, request replay, identical PDF/email bytes on retry, changed-payload rejection, signed unsubscribe verification, owner-only sign-in mail, one-use login tokens, session logout, CSV escaping and request-size/CORS limits. The backend checks used mocked database and email responses, with zero actual email sends.

The November 23, 2026 release also passed live database-permission checks, report submission and replay, changed-payload rejection, single-use administrator token redemption, CSV consent export, signed unsubscribe, subscription preservation during replay, and logout. Resend reported `delivered` for the synthetic report sent to its documented test address. Public browser checks confirmed the adaptive quiz, expanded observations, tradition selections, diary, PDF download and email form. The administrator list retains one clearly labeled synthetic test contact at the provider’s test address. It is unsubscribed and excluded from active-subscriber exports. A provider test-address delivery does not establish delivery to every real recipient inbox.
