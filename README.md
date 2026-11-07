# Wash

**Soft color fields. Huge time. One quiet caption.**

A gallery-style watchface for Pebble Time 2 (Emery) and Pebble Round 2 (Gabbro). Overlapping rounded color washes fill the display; the time stays large and calm. Deep Clay customization without dashboard clutter.

## Features

- Eight curated palettes + full custom colors
- Compositions: Cascade, Center bloom, Edge hug, Editorial, Auto
- 2–4 wash fields with soft halo or hard edges
- Optional hourly composition nudge
- Time styles and placements; caption for date / weekday / battery / steps
- Minute-tick only (negligible battery impact by design)
- Low-power mode at ≤15% (time + battery, no washes)

## CloudPebble

Import zip: upload [`dist/wash-cloudpebble.zip`](dist/wash-cloudpebble.zip) via **Import → Upload Zip** on [CloudPebble](https://cloudpebble.repebble.com/).

Or import from GitHub:
`https://cloudpebble.repebble.com/ide/import/github/TechJeeper/wash`

App Kind should be Watchface (JavaScript SDK / Alloy).

## Build

Requires the Pebble SDK with Alloy support.

```bash
npm install
pebble build
pebble install --emulator emery
pebble emu-app-config
```

Round 2:

```bash
pebble install --emulator gabbro
```

## Store assets

- Screenshots: [`screenshots/emery/`](screenshots/emery/) (200×228) and [`screenshots/gabbro/`](screenshots/gabbro/) (260×260)
- Listing copy: [`store/description.txt`](store/description.txt) · [`store/short-description.txt`](store/short-description.txt)
- Regenerate: `python scripts/generate_store_screenshots.py`

## License

MIT
