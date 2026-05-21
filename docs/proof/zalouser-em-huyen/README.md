# Em Huyen on Zalo - real-client proof screenshots

Screenshots from a live deployment of the `@openclaw/zalouser` plugin
running the Em Huyen agent (Tingee customer-support bot, Vietnamese).
Used as visual proof attachments on upstream PRs.

## zalo-mobile.jpg

Zalo Android client. The Capypara.AI group room.

- **Inbound proof (PR #84924)**: user replied with a photo of a soundbox
  label. Em Huyen extracted the serial number directly from the image
  via the kernel vision pipeline: `SN: 3PRO175459 (Model: Tingee 3PRO)`.
  Confirms the inbound photo extraction + content-type override
  changes work end-to-end against a real Zalo CDN URL.

- **Outbound proof (PR #85039)**: Em Huyen's reply contains a markdown
  list with two bullets (Hotline / Zalo OA). They render as a tight
  group with no blank lines between them. Without the outbound
  normalizer, the same agent output would render with a visible blank
  line between each bullet, fragmenting the visual group.

## zalo-desktop.jpg

Same conversation viewed in Zalo Desktop (dark theme). Confirms the
outbound list-rendering fix shows up across both Zalo clients - mobile
and desktop. The "Original" tag visible on the photo confirms the
inbound media path was preserved verbatim by the new extractor before
reaching the vision pipeline.

## Why a separate branch

These images live on a separate `proof/zalouser-em-huyen-screenshots`
branch off `main`, NOT on the feature branch. The PRs reference them
via raw GitHub URLs so the upstream merge does not import the binaries
into the openclaw repo history.
