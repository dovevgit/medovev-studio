#!/usr/bin/env python3
"""Guard for the language switch.

Translating a React page after it has rendered has one real failure mode: the
next re-render puts the original back. Opening the menu, changing a gallery
chapter, opening a picture -- each replaces a subtree, and a translation that
only ran once is gone from it.

So this does not check that the dictionary loads. It checks the page after the
kind of interaction that re-renders it, which is the only way to catch that
failure.

Usage:  npm run build && python3 scripts/check_i18n.py
Needs:  pip install playwright  (plus a Chrome: CHROME_PATH, or
        playwright install chromium)
"""
import functools
import http.server
import os
import pathlib
import re
import socketserver
import sys
import threading

from playwright.sync_api import sync_playwright

DIST = pathlib.Path("dist/client")
HEBREW = re.compile(r"[֐-׿]")


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def serve(root: pathlib.Path):
    server = socketserver.ThreadingTCPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(root)))
    server.daemon_threads = True
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server, server.server_address[1]


def hebrew_share(page, selector="main"):
    """How much of the visible text in a region is still Hebrew."""
    return page.evaluate(
        """(sel) => {
            const el = document.querySelector(sel);
            if (!el) return null;
            const text = el.innerText || "";
            const he = (text.match(/[\\u0590-\\u05FF]/g) || []).length;
            const letters = (text.match(/[\\u0590-\\u05FFA-Za-z\\u0400-\\u04FF]/g) || []).length;
            return letters ? he / letters : 0;
        }""",
        selector,
    )


def main():
    if not DIST.exists():
        print("FAIL  dist/client: not built. Run `npm run build` first.")
        sys.exit(1)

    server, port = serve(DIST)
    base = f"http://127.0.0.1:{port}"
    problems = []

    launch = {"args": ["--no-sandbox"]}
    if os.environ.get("CHROME_PATH"):
        launch["executable_path"] = os.environ["CHROME_PATH"]

    with sync_playwright() as pw:
        browser = pw.chromium.launch(**launch)
        for lang, name in (("en", "English"), ("ru", "Русский")):
            ctx = browser.new_context(viewport={"width": 1280, "height": 900})
            page = ctx.new_page()

            # The choice is remembered, so it is set the way a visitor sets
            # it: by the query string, once.
            page.goto(f"{base}/services/photo/?lang={lang}", wait_until="load")
            page.wait_for_timeout(1800)

            direction = page.evaluate("document.documentElement.dir")
            tag = page.evaluate("document.documentElement.lang")
            if direction != "ltr" or tag != lang:
                problems.append(f"{lang}: page is dir={direction} lang={tag}, expected ltr/{lang}")

            share = hebrew_share(page)
            if share is None or share > 0.25:
                problems.append(f"{lang}: {share:.0%} of the page is still Hebrew after the switch")

            title = page.title()
            if HEBREW.search(title):
                problems.append(f"{lang}: the page title is still Hebrew ({title[:40]})")

            # The whole point: a subtree React re-renders must come back
            # translated. The menu is built on open, and the gallery chapters
            # are replaced when a chip is pressed.
            page.click(".site-menu__button")
            page.wait_for_timeout(700)
            menu = hebrew_share(page, ".site-menu__sheet")
            if menu is None or menu > 0.25:
                problems.append(f"{lang}: {menu:.0%} of the menu is Hebrew after it was opened")
            page.keyboard.press("Escape")
            page.wait_for_timeout(300)

            page.click(".g-nav .g-chip:nth-child(3)")
            page.wait_for_timeout(700)
            chapters = hebrew_share(page, ".page__gallery")
            if chapters is None or chapters > 0.25:
                problems.append(f"{lang}: {chapters:.0%} of the gallery is Hebrew after filtering")

            # The way back has to stay readable in its own language.
            back = page.get_attribute('.lang-pick__btn[lang="he"]', "aria-label")
            if back != "עברית":
                problems.append(f"{lang}: the Hebrew button says {back!r}, not 'עברית'")

            if not problems:
                print(f"OK    {name}: page, title, menu and gallery all translated; the way back is in Hebrew")
            ctx.close()

        # Hebrew must still be untouched.
        ctx = browser.new_context(viewport={"width": 1280, "height": 900})
        page = ctx.new_page()
        page.goto(f"{base}/services/photo/", wait_until="load")
        page.wait_for_timeout(800)
        if page.evaluate("document.documentElement.dir") != "rtl":
            problems.append("he: the Hebrew page is not rtl")
        if (hebrew_share(page) or 0) < 0.8:
            problems.append("he: the Hebrew page lost its Hebrew")
        ctx.close()
        browser.close()

    server.shutdown()

    if problems:
        print(f"FAIL  {len(problems)} problem(s) with the language switch")
        for p in problems:
            print(f"   - {p}")
        sys.exit(1)
    print("OK    Hebrew is untouched and stays rtl")


if __name__ == "__main__":
    main()
