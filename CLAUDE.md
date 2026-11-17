# Rules for this repository

medovev.com — a Hebrew, right-to-left site. **Most visitors are on phones.**

## Before every push

```
npm run check
```

It builds, then runs two guards. Both must print `OK`. If either prints `FAIL`,
fix the page and do not push.

- **`scripts/check_mobile_width.py`** — opens every built page in a phone-sized
  browser at 360, 390 and 430px and fails if the page is wider than the screen.
  Horizontal overflow is invisible on a desktop: the page looks fine until
  someone opens it on a phone and finds they can drag the whole site sideways.
- **`scripts/check_links.py`** — fails if any internal link or asset points at
  something that is not there, if an image has no `alt`, if a page is missing
  its title/description/canonical/og:image/h1, or if a URL the **old** site
  published would 404 here.

A GitHub Action runs the same two after each push, as a safety net.

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
