#!/usr/bin/env python3
"""Migration guard: nothing the site points at may be missing.

Three questions, asked of the build output rather than of the source, so the
answers are about what visitors are actually served:

1. Does every internal link land on a page that exists?
2. Does every image, stylesheet, script and media file referenced exist?
3. Does every URL the OLD site published -- its sitemap and its redirects --
   still resolve here, by a page of the same path or by a redirect in
   vercel.json?

The third is the one that matters on the day the domain moves. An inbound
link or a search result pointing at an old URL that 404s is a visitor lost
and a position lost, and neither shows up in any test that only looks at the
new site's own pages.

Usage:  npm run build && python3 scripts/check_links.py
        python3 scripts/check_links.py --old ../path/to/old-site
"""
import argparse
import json
import pathlib
import re
import sys
from urllib.parse import unquote, urlparse

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


def old_urls(old_root: pathlib.Path):
    """What the old site published: its sitemap, plus the sources of its
    redirects, which are the URLs from the site before it."""
    urls = set()
    sm = old_root / "sitemap.xml"
    if sm.exists():
        for loc in re.findall(r"<loc>([^<]+)</loc>", sm.read_text("utf-8")):
            urls.add(urlparse(loc).path)
    vj = old_root / "vercel.json"
    if vj.exists():
        for r in json.loads(vj.read_text("utf-8")).get("redirects", []):
            src = r["source"]
            if "(" not in src:  # skip the catch-all host rules
                urls.add(unquote(src))
    return urls


def check_old(old_root: pathlib.Path, pages):
    """Every old URL still goes somewhere."""
    cfg = json.loads(pathlib.Path("vercel.json").read_text("utf-8"))
    sources = {unquote(r["source"]) for r in cfg.get("redirects", [])}
    lost = []
    for url in sorted(old_urls(old_root)):
        path = url.rstrip("/") or "/"
        if path in pages or url in sources or path in {unquote(s).rstrip("/") for s in sources}:
            continue
        lost.append(url)
    return lost


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--old", default="/home/claude/business-manager/offers")
    args = ap.parse_args()

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

    old_root = pathlib.Path(args.old)
    if old_root.exists():
        lost = check_old(old_root, pages)
        if lost:
            failed = True
            print(f"FAIL  {len(lost)} URL(s) the old site published would 404 here")
            for url in lost[:20]:
                print(f"   - {url}")
        else:
            print(f"OK    every URL the old site published still resolves ({len(old_urls(old_root))} checked)")
    else:
        print(f"SKIP  old site not found at {old_root}; migration coverage not checked")

    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
