#!/usr/bin/env python3
"""Mobile width guard.

Opens every built page in a phone-sized browser and fails (exit code 1) if any
page is wider than the screen. Horizontal overflow is the bug that broke the
old site's phone layout in November 2026, and it is invisible on a desktop:
the page simply looks fine until someone opens it on a phone and finds they
can drag the whole site sideways.

This is the same guard the old repository runs, pointed at this site's build
output rather than at hand-written HTML -- so it checks what visitors are
actually served, after the prerender.

Usage:   npm run build && python3 scripts/check_mobile_width.py dist/client
Needs:   pip install playwright  (plus a Chrome: CHROME_PATH, or
         playwright install chromium)
"""
import functools
import http.server
import os
import pathlib
import socketserver
import sys
import threading
from urllib.parse import quote

from playwright.sync_api import sync_playwright

WIDTHS = (360, 390, 430)
TOLERANCE = 2  # px

FIND_OFFENDERS = """(W) => {
  const out = [];
  for (const e of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(e);
    if (cs.position === 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = e.getBoundingClientRect();
    if (r.width === 0) continue;
    if (r.right > W + 2 || r.left < -2) {
      const cls = typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\\s+/).join('.') : '';
      const dev = Math.max(r.right - W, -r.left);
      out.push([dev, e.tagName.toLowerCase() + cls + ' (left ' + Math.round(r.left) + ', right ' + Math.round(r.right) + ')']);
    }
  }
  out.sort((a, b) => b[0] - a[0]);   // the element that sticks out the most is the real culprit
  return out.slice(0, 4).map(x => x[1]);
}"""


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def pages_in(root: pathlib.Path):
    for p in sorted(root.rglob("*.html")):
        if p.name.startswith("google") or p.name == "404.html" or "node_modules" in p.parts:
            continue
        rel = p.relative_to(root).as_posix()
        url = "/" + (quote(rel[: -len("index.html")]) if p.name == "index.html" else quote(rel))
        yield rel, url


def check_site(pw, root: pathlib.Path):
    server = socketserver.ThreadingTCPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(root)))
    server.daemon_threads = True
    threading.Thread(target=server.serve_forever, daemon=True).start()
    port = server.server_address[1]
    launch = {"args": ["--no-sandbox"]}
    if os.environ.get("CHROME_PATH"):
        launch["executable_path"] = os.environ["CHROME_PATH"]
    browser = pw.chromium.launch(**launch)
    problems, total = [], 0
    for width in WIDTHS:
        ctx = browser.new_context(viewport={"width": width, "height": 800}, is_mobile=True, has_touch=True)
        # only our own files: external requests (fonts, embeds) are skipped so results are fast and repeatable
        ctx.route("**/*", lambda route: route.continue_() if route.request.url.startswith(f"http://127.0.0.1:{port}") else route.abort())
        page = ctx.new_page()
        for rel, url in pages_in(root):
            total += 1
            try:
                page.goto(f"http://127.0.0.1:{port}{url}", wait_until="domcontentloaded", timeout=20000)
                page.wait_for_timeout(600)
                scroll_width = page.evaluate("document.documentElement.scrollWidth")
                if scroll_width > width + TOLERANCE:
                    culprits = page.evaluate(FIND_OFFENDERS, width)
                    problems.append((rel, width, scroll_width, culprits))
            except Exception as exc:  # a page that cannot even load is also a problem
                problems.append((rel, width, -1, [f"could not load: {str(exc)[:80]}"]))
        ctx.close()
    browser.close()
    server.shutdown()
    return total, problems


def main():
    roots = [pathlib.Path(a) for a in sys.argv[1:]] or [pathlib.Path("dist/client")]
    for root in roots:
        if not root.exists():
            print(f"FAIL  {root}: not built. Run `npm run build` first.")
            sys.exit(1)
    failed = False
    with sync_playwright() as pw:
        for root in roots:
            total, problems = check_site(pw, root)
            if problems:
                failed = True
                print(f"FAIL  {root}: {len({p[0] for p in problems})} page(s) wider than the phone screen")
                for rel, width, sw, culprits in problems[:15]:
                    print(f"   - {rel}  at {width}px: page is {sw}px wide; culprit: {culprits[0] if culprits else '?'}")
            else:
                print(f"OK    {root}: all pages fit phone screens ({total} checks at {', '.join(map(str, WIDTHS))}px)")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
