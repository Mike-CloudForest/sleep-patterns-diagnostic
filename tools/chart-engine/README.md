# Birth chart dependency bundle

The public application imports `vendor/chart-engine.js`. It performs all
astronomical and time-zone calculations locally. No birth details or city
queries are sent to an astrology API.

## Rebuild

From this directory:

```sh
npm ci --ignore-scripts
npm run build
```

The lockfile pins the full dependency tree. The shipped bundle contains only
the MIT paths of `hd-chart-engine` 0.1.1, `astronomy-engine` 2.1.19, and `luxon`
3.7.2. `esbuild` 0.28.2 is a build tool. The optional GPL Moshier backend and
Swiss Ephemeris are excluded. The build writes the bundle and full MIT notices
to `vendor/chart-engine.LICENSE.txt`.

Astronomy Engine's npm package does not include its separate LICENSE file, so
the exact license from its v2.1.19 tag is preserved here:
<https://github.com/cosinekitty/astronomy/blob/v2.1.19/LICENSE>.

## Calculation contract

`birth-chart.js` exports synchronous `calculateBirthChart(details, {now})`,
strict `resolveBirthMoment(details, {now})`, `deriveHumanDesign(activations)`,
and `ChartInputError`.

The input is `{date,time,timeAccuracy,place,timeOccurrence?}`. `place` requires
`label` and an IANA `timeZone`; `countryCode`, `latitude`, and `longitude` are
optional. Coordinates are checked when supplied. Geocentric Sun, Moon and
Human Design calculations do not use geographic house or ascendant geometry,
so no missing coordinates are fabricated and no ascendant is claimed.

The full local date and time are resolved with historical zone rules. A
nonexistent local time is rejected. An overlap requires an explicit earlier
or later occurrence. The resolver uses Luxon's `getPossibleOffsets` and checks
every civil date/time component, including historical whole-day transitions.
It does not use the upstream calculator's silent time normalization.

The chart uses apparent tropical planetary positions and true lunar nodes.
The design moment is solved as an 88-degree solar arc; it is not a fixed
88-day subtraction. The gate wheel begins with gate 1 at 223.25 degrees. Both
ends of a channel must be activated to define its centers. Type, authority,
profile, and connected-component definition are derived from those activations.

The result has only `version`, `western`, `humanDesign`, `warnings`, and
`precision`. It excludes the date, time, location, UTC instant and coordinates.
Raw birth details are kept separately only if another application workflow
explicitly requests their storage. Unknown time does not generate a full chart.

## Accuracy and interpretation

The output includes Western Sun and Moon signs, Human Design gates and lines,
type, authority, profile, definition, channels and defined centers. It does
not expose color, tone, base, a full Western natal chart, or DreamRave.
`entered-time` describes the supplied time, not a guarantee of astronomical or
historical perfection. Approximate time and historical time-zone limitations
are retained as warnings. Positions within one arcminute of a sign/gate
boundary, or a Sun profile-line boundary, carry an additional caution.

The astronomical computation supplies labels within the traditional systems.
It does not establish scientific validity for personality or sleep predictions.
The app's observed sleep assessment must remain independent of these labels.

## Validation and sources

`tests/birth-chart.test.mjs` compares all 130 gate/line cells in five published
Swiss-Ephemeris reference charts, then checks DST gaps/folds, a half-hour fold,
a skipped civil date, the 88-degree solve, fixed BodyGraph relationships,
unknown/approximate times, invalid data and absence of birth data in output.
The reference vectors are published by the original repository author; the
third-party calculator screenshots themselves are not included in that repo.
This is a numerical cross-check, not clinical or psychological validation.

- HD engine and independent validation harness: <https://github.com/domalhambra/hd-chart-engine>
- Astronomy Engine: <https://github.com/cosinekitty/astronomy>
- Reference vectors: <https://github.com/adamblvck/free-human-design/blob/e150b720472db9222b59ca5dc1f34020be67218e/test/reference-charts.test.js>
- Fixed BodyGraph reference: <https://github.com/adamblvck/free-human-design/blob/e150b720472db9222b59ca5dc1f34020be67218e/src/hd/bodygraph.js>
- Original chart framework: <https://jovianarchive.com/pages/get-your-human-design-chart>
- Type and connection definitions: <https://jovianarchive.com/pages/human-design-dictionary>
- Profile calculation: <https://jovianarchive.com/blogs/chart-interpretations-components/understanding-your-human-design-profile>
- Historical time-zone limits: <https://data.iana.org/time-zones/theory.html#accuracy>
