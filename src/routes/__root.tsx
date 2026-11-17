import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import { AccessibilityMenu } from "@/components/accessibility-menu";
import { LanguagePicker } from "@/components/language";
import { SiteFooter } from "@/components/site-footer";

import appCss from "../styles.css?url";

/** This site's own address.
 *
 * NOT medovev.com. This is a demonstration build, and the studio's real site
 * lives at that domain with this same Hebrew copy on it. Pointing a canonical
 * link there would tell a crawler that the real version of this page is
 * somewhere it is not, and pointing it here while letting the page be indexed
 * would set two sites competing over one set of words. So: the truthful
 * address, and noindex below. */
const SITE = "https://medovev-studio.vercel.app";

const TITLE = "סטודיו לאסטרטגיה עסקית | דובב גרינברג";
const DESCRIPTION =
  "אסטרטגיה עסקית, נוכחות דיגיטלית, אתרים ואפליקציות, פתרונות AI, הפקת וידאו, צילום, פודקאסטים וקריינות — פתרונות מקצה לקצה לצמיחה עסקית.";

export const Route = createRootRoute({
  head: (ctx) => {
    // Every page says which URL it is the canonical copy of, and names that
    // same URL to the social networks. Without it the site is reachable at
    // several addresses -- with and without a trailing slash, with a tracking
    // query on the end -- and a crawler has no way to know they are one page.
    // The LAST match, not this one: `head` runs on the root route, whose own
    // pathname is always "/", so asking it which page this is gives the same
    // answer everywhere.
    const leaf = ctx.matches.at(-1)?.pathname ?? "/";
    const path = leaf.replace(/\/+$/, "") || "/";
    const url = `${SITE}${path}`;
    return {
    links: [
      { href: appCss, rel: "stylesheet" },
      { href: url, rel: "canonical" },
      { href: "/assets/favicon.png", rel: "icon", type: "image/png" },
      { href: "/assets/apple-touch-icon.png", rel: "apple-touch-icon" },
      { href: "/assets/manifest.webmanifest", rel: "manifest" },
    ],
    meta: [
      { charSet: "utf-8" },
      { content: "width=device-width, initial-scale=1", name: "viewport" },
      { title: TITLE },
      { content: DESCRIPTION, name: "description" },
      { content: TITLE, property: "og:title" },
      { content: DESCRIPTION, property: "og:description" },
      { content: "website", property: "og:type" },
      { content: "he_IL", property: "og:locale" },
      { content: "DG Workflow System Studio", property: "og:site_name" },
      // Without an image, a link shared to WhatsApp or Facebook arrives as a
      // bare line of text. The file is 1200x630, the size both of them crop to.
      { content: `${SITE}/assets/og.jpg`, property: "og:image" },
      { content: "1200", property: "og:image:width" },
      { content: "630", property: "og:image:height" },
      { content: "summary_large_image", name: "twitter:card" },
      { content: "#0b0a09", name: "theme-color" },
      // A demonstration carrying a live site's copy must stay out of the
      // index, or it competes with that site over its own words.
      { content: "noindex, nofollow", name: "robots" },
      { content: url, property: "og:url" },
    ],
    };
  },
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
  // The document is Hebrew and reads right to left. Set here rather than in a
  // client effect, so the first paint is already correct and a crawler that
  // never runs the scripts still reads a Hebrew RTL page.
  return (
    <html dir="rtl" lang="he">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <Outlet />
      <SiteFooter />
      <AccessibilityMenu />
      <LanguagePicker />
      {/* No analytics, deliberately. This is a portfolio piece, and the one
          thing on it that was metered by use had no job here: nothing on the
          site now counts anything or calls anything. */}
    </>
  );
}

function NotFoundComponent() {
  return (
    <main className="stub">
      <div className="stub__inner">
        <p className="stub__eyebrow">404</p>
        <h1 className="stub__title">העמוד לא נמצא</h1>
        <p className="stub__blurb">ייתכן שהקישור ישן, או שהעמוד עוד לא נבנה.</p>
        <div className="stub__actions">
          <a className="stub__cta" href="/">
            חזרה לדף הבית
          </a>
        </div>
      </div>
    </main>
  );
}
