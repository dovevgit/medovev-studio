# Rules for this repository

A Hebrew, right-to-left site. **Most visitors are on phones.**

**This is a portfolio piece, not a site in use.** The studio's real site is
medovev.com and carries this same Hebrew copy, so:

- every page says `noindex` and `robots.txt` disallows everything — two sites
  competing over one set of words would cost the real one its position;
- `canonical` and `og:` point at this deployment's own address, never at
  medovev.com;
- the contact form stores nothing and says so. There is no `api/` directory
  and there must not be one: a live write path into the studio's database has
  no business on a demonstration site;
- **nothing on the site is metered by use.** No analytics, no functions, no
  database — the whole site is static files, so showing it to people cannot
  turn into a bill. Do not add anything billed per request or per event.

## Before every push

```
npm run check
```

It builds, then runs four guards. All must print `OK`. If any prints `FAIL`,
fix the page and do not push.

- **`scripts/check_mobile_width.py`** — opens every built page in a phone-sized
  browser at 360, 390 and 430px and fails if the page is wider than the screen.
  Horizontal overflow is invisible on a desktop: the page looks fine until
  someone opens it on a phone and finds they can drag the whole site sideways.
- **`scripts/check_links.py`** — fails if any internal link or asset points at
  something that is not there, if an image has no `alt`, or if a page is
  missing its title/description/canonical/og:image/h1.
- **`scripts/check_i18n.py`** — switches the page to English and to Russian and
  checks it again AFTER opening the menu and filtering the gallery. The
  translation is a pass over the rendered page, so the failure mode is a React
  re-render putting the Hebrew back; checking the page before any interaction
  would never catch it.
- **`scripts/check_works.py`** — opens the site and uses it: scrolls the film,
  opens the menu, plays the memory game to a win, filters the gallery, opens a
  picture, plays a voice sample, clicks a reel, submits the form and works the
  accessibility menu. The other three check that pages load and fit; none of
  them presses anything, and a portfolio piece is judged by someone clicking
  around it.

A GitHub Action runs all four after each push, as a safety net.

**When writing a check, make it able to fail.** Two assertions here once
passed because the win dialog is always in the markup and only `data-open`
shows it, so counting the element was true either way. Assert on the state,
not on the element's existence.

## Languages

`src/i18n/{en,ru}.json` are keyed by the **Hebrew string itself**, so a new
Hebrew string on a page simply has no translation and stays Hebrew. After
adding or changing Hebrew copy, run `npm run check`; if the share of untouched
Hebrew rises, add the new strings to both files.

## CSS pitfalls that already broke the phone layout once (Nov 2026)

- **Never hide an element by moving it off-screen** (`left:-9999px`,
  `right:-9999px`, `text-indent:-9999px` on a block). In an RTL page this
  stretches the document to ~10,000px on phones. Hide with
  `position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)`
  instead, or move it with a `transform`.
- **Long button or link labels must be able to wrap on phones** — no
  `white-space:nowrap` on long text.
- **`overflow-x: clip`, never `hidden`, as an overflow guard.** `hidden` makes
  the element a scroll container, and a scroll container is what
  `position: sticky` resolves against — so a `hidden` guard silently stops
  every sticky descendant from sticking to the window.
- **Never put a `filter` on `<body>` or on a wrapper around the page.** A
  filter makes its element the containing block for every `position: fixed`
  descendant, which detaches the menu, the logo and the accessibility button
  from the window and lets them scroll away. Filter a fixed overlay with
  `backdrop-filter` instead.
- **In RTL, a block with both a `width` and a `margin-left` is
  over-constrained** and the browser drops the `margin-left`, throwing the box
  to the right edge. Position it instead.

## Content

The inner pages' copy in `src/page-copy.ts` was lifted word for word from the
old site by a script. It is not written here and is not to be reworded here.
If a page needs new words, change them deliberately — never in passing.

## Secrets and data

- Never print environment variable values or API keys.
- Never delete the owner's data permanently.
