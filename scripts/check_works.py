#!/usr/bin/env python3
"""Does the site actually work?

The other guards check that pages load, fit a phone and point at things that
exist. None of them presses anything. This one does: it opens the site and
uses it the way a visitor would, because a portfolio piece is judged by
someone clicking around it, and a thing that renders but does not respond is
worse than a thing that is missing.

Every page, and then every moving part:

  the film        scrubs with the scroll, and the sentry walks the bar
  the menu        opens, lists every page, closes
  the memory game deals, flips, matches, and can be won and dismissed
  the gallery     filters by chapter, and a picture opens full size
  the samples     play, and only one at a time
  the reels       stay as stills until clicked, then become players
  the form        answers, and stores nothing
  accessibility   every switch reaches the page and reset clears them
  languages       Hebrew, English, Russian

Usage:  npm run build && python3 scripts/check_works.py
Needs:  pip install playwright  (plus a Chrome: CHROME_PATH, or
        playwright install chromium)
"""
import functools
import http.server
import os
import pathlib
import socketserver
import sys
import threading

from playwright.sync_api import sync_playwright

DIST = pathlib.Path("dist/client")


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


class Report:
    def __init__(self):
        self.bad: list[str] = []

    def ok(self, claim: str, truth: bool, detail: str = ""):
        if truth:
            print(f"  ok    {claim}")
        else:
            self.bad.append(f"{claim}{f' -- {detail}' if detail else ''}")
            print(f"  FAIL  {claim}{f' -- {detail}' if detail else ''}")


def main():
    if not DIST.exists():
        print("FAIL  dist/client: not built. Run `npm run build` first.")
        sys.exit(1)

    server = socketserver.ThreadingTCPServer(
        ("127.0.0.1", 0), functools.partial(Quiet, directory=str(DIST))
    )
    server.daemon_threads = True
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{server.server_address[1]}"

    launch = {"args": ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"]}
    if os.environ.get("CHROME_PATH"):
        launch["executable_path"] = os.environ["CHROME_PATH"]

    r = Report()
    with sync_playwright() as pw:
        browser = pw.chromium.launch(**launch)
        ctx = browser.new_context(viewport={"width": 1280, "height": 900})
        page = ctx.new_page()
        errors: list[str] = []
        page.on("pageerror", lambda e: errors.append(str(e)[:120]))

        # --- every page answers ------------------------------------------
        print("\npages")
        paths = sorted(
            "/" + str(p.parent.relative_to(DIST)).replace(".", "").strip("/")
            for p in DIST.rglob("index.html")
        )
        for path in paths:
            page.goto(f"{base}{path}/", wait_until="load")
            page.wait_for_timeout(350)
            has_h1 = page.locator("h1").count() > 0
            r.ok(f"{path or '/'} renders a heading", has_h1)

        # --- the film ------------------------------------------------------
        print("\nthe film on the home page")
        page.goto(f"{base}/", wait_until="load")
        page.wait_for_timeout(700)
        start = page.evaluate(
            "() => +getComputedStyle(document.querySelector('.scroll-scrub')).getPropertyValue('--copy-progress')"
        )
        page.evaluate("scrollTo(0, 2600)")
        page.wait_for_timeout(500)
        moved = page.evaluate(
            "() => +getComputedStyle(document.querySelector('.scroll-scrub')).getPropertyValue('--copy-progress')"
        )
        r.ok("the film scrubs with the scroll", moved > start + 0.1, f"{start:.2f} -> {moved:.2f}")

        walker = page.evaluate(
            """() => {
                const w = document.querySelector('.ss-walker');
                const rail = document.querySelector('.ss-rail');
                if (!w || !rail) return null;
                const b = w.getBoundingClientRect(), rb = rail.getBoundingClientRect();
                return { at: ((b.left + b.right) / 2 - rb.left) / rb.width,
                         feet: Math.round(b.bottom) === Math.round(rb.top),
                         facing: w.dataset.facing };
            }"""
        )
        r.ok("the sentry stands on the bar", bool(walker) and walker["feet"])
        r.ok("the sentry has walked along it", bool(walker) and walker["at"] < 0.95,
             f"at {walker['at']:.2f}" if walker else "no sentry")
        page.evaluate("scrollTo(0, 800)")
        page.wait_for_timeout(400)
        back = page.evaluate("() => document.querySelector('.ss-walker')?.dataset.facing")
        r.ok("the sentry turns round when you scroll back", back == "up", f"facing {back}")

        # --- the menu ------------------------------------------------------
        print("\nthe menu")
        page.evaluate("scrollTo(0, 0)")
        page.click(".site-menu__button")
        page.wait_for_timeout(500)
        links = page.eval_on_selector_all(
            ".site-menu__sheet a[href^='/']", "els => els.map(e => e.getAttribute('href'))"
        )
        r.ok("the menu opens", page.locator(".site-menu__sheet").is_visible())
        r.ok("it lists all 13 pages", len(links) >= 13, f"{len(links)} links")
        page.keyboard.press("Escape")
        page.wait_for_timeout(300)
        r.ok("Escape closes it", not page.locator(".site-menu__panel[data-open]").count())

        # --- the memory game ------------------------------------------------
        print("\nthe memory game")
        page.evaluate("document.getElementById('memory-game').scrollIntoView()")
        page.wait_for_timeout(500)
        cards = page.locator(".memory__card")
        r.ok("eighteen cards are dealt", cards.count() == 18, f"{cards.count()} cards")
        # Win it: pair every emblem by reading the deck off the DOM.
        # A card does not announce which emblem it carries -- that is the
        # point of the game -- so the deck is read off the picture each card
        # holds face down.
        order = page.eval_on_selector_all(
            ".memory__card",
            "els => els.map(e => (e.querySelector('img')?.getAttribute('src') || '')"
            ".split('/').pop().replace('logo-', '').replace('.webp', ''))",
        )
        pairs: dict[str, list[int]] = {}
        for i, key in enumerate(order):
            pairs.setdefault(key, []).append(i)
        playable = all(len(v) == 2 for v in pairs.values()) and len(pairs) == 9
        r.ok("the deck is nine pairs", playable, f"{len(pairs)} kinds")
        if playable:
            for key, (a, b) in pairs.items():
                cards.nth(a).click()
                page.wait_for_timeout(120)
                cards.nth(b).click()
                page.wait_for_timeout(260)
            page.wait_for_timeout(1400)
            # The dialog is always in the markup; `data-open` is what shows
            # it. Counting the element would pass whether it opened or not.
            won = page.locator(".memory__win[data-open]")
            r.ok("matching every pair wins it", won.count() == 1)
            page.locator(".memory__win").click(position={"x": 4, "y": 4})
            page.wait_for_timeout(500)
            r.ok("clicking outside dismisses it, leaving the board to look at",
                 page.locator(".memory__win[data-open]").count() == 0)
            r.ok("and the matched cards are still face up",
                 page.locator(".memory__slot[data-done]").count() == 18,
                 f"{page.locator('.memory__slot[data-done]').count()} face up")

        # --- the contact form -------------------------------------------------
        print("\nthe contact form")
        page.evaluate("document.getElementById('contact').scrollIntoView()")
        page.wait_for_timeout(300)
        page.fill(".contact__form input[name='name']", "בדיקה")
        page.fill(".contact__form input[name='phone']", "0541234567")
        requests: list[str] = []
        page.on("request", lambda rq: requests.append(rq.url) if "/api/" in rq.url else None)
        page.click(".contact__form button[type='submit']")
        page.wait_for_timeout(1100)
        said = page.locator(".contact__said, .contact__status, [class*='contact'][class*='said']")
        text = said.first.inner_text() if said.count() else ""
        r.ok("the form answers", bool(text), text[:50])
        r.ok("it says it stored nothing", "להצגה" in text, text[:60])
        r.ok("it calls no endpoint", not requests, str(requests[:2]))

        # --- the gallery ------------------------------------------------------
        print("\nthe gallery")
        page.goto(f"{base}/services/photo/", wait_until="load")
        page.wait_for_timeout(600)
        r.ok("thirty pictures", page.locator(".g-item").count() == 30,
             f"{page.locator('.g-item').count()}")
        page.click(".g-nav .g-chip:nth-child(3)")
        page.wait_for_timeout(400)
        r.ok("a chip filters to one chapter", page.locator(".chap").count() == 1)
        page.click(".g-nav .g-chip:nth-child(1)")
        page.wait_for_timeout(400)
        page.locator(".g-item").first.click()
        page.wait_for_timeout(700)
        full = page.get_attribute(".g-view__img", "src")
        r.ok("a picture opens full size", bool(full) and "-l." in full, str(full))
        page.click(".g-view__close")
        page.wait_for_timeout(300)
        r.ok("and closes", page.locator(".g-view").count() == 0)

        # --- the voice samples --------------------------------------------------
        print("\nthe voice page")
        page.goto(f"{base}/services/voice/", wait_until="load")
        page.wait_for_timeout(600)
        r.ok("seven samples", page.locator(".track").count() == 7)
        page.locator(".track").nth(1).click()
        page.wait_for_timeout(1200)
        state = page.evaluate(
            """() => { const a = document.querySelector('.page__phone audio');
                       return a ? { src: a.currentSrc.split('/').pop(), playing: !a.paused } : null; }"""
        )
        r.ok("a sample plays", bool(state) and state["playing"], str(state))
        page.locator(".track").nth(4).click()
        page.wait_for_timeout(900)
        after = page.evaluate(
            """() => { const a = document.querySelector('.page__phone audio');
                       return { src: a.currentSrc.split('/').pop(),
                                live: document.querySelectorAll('.track[data-live=\\"true\\"]').length }; }"""
        )
        r.ok("choosing another stops the first", after["live"] == 1 and after["src"] != state["src"],
             str(after))
        page.evaluate("document.querySelector('.page__phone audio').pause()")

        reels_before = page.locator(".reel--live").count()
        page.locator(".reel__btn").first.click()
        page.wait_for_timeout(600)
        r.ok("a reel is a still until clicked, then a player",
             reels_before == 0 and page.locator(".reel--live").count() == 1)

        # --- the accessibility menu ---------------------------------------------
        print("\nthe accessibility menu")
        page.goto(f"{base}/about/", wait_until="load")
        page.wait_for_timeout(500)
        page.click(".a11y-btn")
        page.wait_for_timeout(400)
        r.ok("it opens", page.locator(".a11y-panel").count() == 1)
        page.locator(".a11y-size__btn").nth(1).click()
        page.wait_for_timeout(300)
        bigger = page.evaluate("() => getComputedStyle(document.documentElement).fontSize")
        r.ok("text grows", bigger != "16px", bigger)
        page.get_by_role("button", name="ניגודיות הפוכה").click()
        page.wait_for_timeout(400)
        kept = page.evaluate(
            """() => { const b = document.querySelector('.a11y-btn').getBoundingClientRect();
                       return b.top > 0 && b.bottom < innerHeight; }"""
        )
        r.ok("inverted colours keeps its own switch on screen", kept)
        page.locator(".a11y-reset").click()
        page.wait_for_timeout(300)
        cleared = page.evaluate(
            "() => [...document.documentElement.classList].filter(c => c.startsWith('a11y')).length"
        )
        r.ok("reset clears everything", cleared == 0 and
             page.evaluate("() => getComputedStyle(document.documentElement).fontSize") == "16px")

        print("\njavascript errors")
        r.ok("no page threw", not errors, "; ".join(errors[:3]))

        ctx.close()
        browser.close()
    server.shutdown()

    print()
    if r.bad:
        print(f"FAIL  {len(r.bad)} thing(s) do not work")
        sys.exit(1)
    print("OK    everything on the site responds")


if __name__ == "__main__":
    main()
