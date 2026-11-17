#!/usr/bin/env python3
"""Nothing the site points at may be missing.

Asked of the build output rather than of the source, so the answers are about
what visitors are actually served:

1. Does every internal link land on a page that exists?
2. Does every image, stylesheet, script and media file referenced exist?
3. Does every picture say what it is, and every page carry its head tags?

Usage:  npm run build && python3 scripts/check_links.py
"""
import pathlib
import re
import sys
from urllib.parse import unquote

DIST = pathlib.Path("dist/client")

HREF = re.compile(r'(?:href|src)="([^"]+)"')
IMG = re.compile(r"<img\b[^>]*>", re.I)
ALT = re.compile(r'\balt="([^"]*)"', re.I)


def built_pages():
    """Every path this site serves a page at."""
    out = set()
    for p in DIST.rglob("index.html"):
        rel = p.parent.relative_to(DIST).as_posix()
        out.add("/" if rel == "." else f"/{rel}")
    return out


def served_files():
    return {"/" + p.relative_to(DIST).as_posix() for p in DIST.rglob("*") if p.is_file()}


def check_internal(pages, files):
    """Every internal link and asset reference resolves."""
    bad = []
    for page in sorted(DIST.rglob("*.html")):
        where = "/" + page.relative_to(DIST).as_posix()
        html = page.read_text("utf-8", errors="replace")
        for raw in HREF.findall(html):
            url = raw.split("#")[0].split("?")[0]
            if not url or url.startswith(("http://", "https://", "mailto:", "tel:", "data:", "//")):
                continue
            target = unquote(url)
            if target in files:
                continue
            if target.rstrip("/") in pages or (target.rstrip("/") or "/") in pages:
                continue
            bad.append((where, raw))
    return bad


def check_alt():
    """Every picture says what it is. A gallery of unlabelled buttons is not
    a gallery to someone using a screen reader -- and these pictures are the
    work being sold."""
    missing = []
    for page in sorted(DIST.rglob("*.html")):
        where = "/" + page.relative_to(DIST).as_posix()
        for tag in IMG.findall(page.read_text("utf-8", errors="replace")):
            if ALT.search(tag) is None:
                missing.append((where, tag[:80]))
    return missing


def check_head(pages):
    """Every page carries what a crawler and a shared link need."""
    want = {
        "title": re.compile(r"<title>(.+?)</title>", re.S),
        "description": re.compile(r'name="description"'),
        "canonical": re.compile(r'rel="canonical"'),
        "og:image": re.compile(r'property="og:image"'),
        "h1": re.compile(r"<h1\b"),
    }
    bad = []
    for page in sorted(DIST.rglob("index.html")):
        where = "/" + page.parent.relative_to(DIST).as_posix()
        where = "/" if where == "/." else where
        html = page.read_text("utf-8", errors="replace")
        for name, rx in want.items():
            if not rx.search(html):
                bad.append((where, name))
    return bad


def main():
    if not DIST.exists():
        print("FAIL  dist/client: not built. Run `npm run build` first.")
        sys.exit(1)

    pages, files = built_pages(), served_files()
    failed = False

    broken = check_internal(pages, files)
    if broken:
        failed = True
        print(f"FAIL  {len(broken)} link(s) or asset(s) point at something that is not there")
        for where, url in broken[:15]:
            print(f"   - {where}  ->  {url}")
    else:
        print(f"OK    every internal link and asset resolves ({len(pages)} pages, {len(files)} files)")

    missing = check_alt()
    if missing:
        failed = True
        print(f"FAIL  {len(missing)} image(s) with no alt attribute")
        for where, tag in missing[:10]:
            print(f"   - {where}  {tag}")
    else:
        print("OK    every image has an alt attribute")

    head = check_head(pages)
    if head:
        failed = True
        print(f"FAIL  {len(head)} page(s) missing something in the head")
        for where, what in head[:15]:
            print(f"   - {where}  has no {what}")
    else:
        print("OK    every page has a title, description, canonical, og:image and an h1")

    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
