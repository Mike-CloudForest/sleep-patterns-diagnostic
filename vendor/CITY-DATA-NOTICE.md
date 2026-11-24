# Birthplace lookup data

The compact `assets/birth-cities.json` is derived from the `data/cityMap.json` file distributed in **city-timezones 1.3.4**, by Kevin Roberts and contributors.

Source repository: https://github.com/kevinroberts/city-timezones
NPM release: https://www.npmjs.com/package/city-timezones/v/1.3.4
Declared package license: MIT. The upstream release does not include a separate LICENSE file.

The app retains city, region, country code, city coordinates, IANA time zone, ASCII search name and population ordering. Entries without a usable country code or time zone are omitted. This is a city reference list, not an address database. The manual entry path covers unlisted birthplaces. Time-zone rules for the birth date come from the runtime's IANA/Intl implementation; the dataset does not supply a present-day UTC offset as a historical offset.

The downloaded release was checked against its NPM SHA-512 integrity:
`yLmtCxU4y5HLAw9XGIMcGEXO+R2KH1sb595wEQC/E9BxSDpazCD7v9ZQRySO7367IXWsWqt3z2xFVh3OkZdgEQ==`
