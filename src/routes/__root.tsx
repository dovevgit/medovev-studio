import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Analytics } from "@vercel/analytics/react";

import { AccessibilityMenu } from "@/components/accessibility-menu";
import { LanguagePicker } from "@/components/language";
import { SiteFooter } from "@/components/site-footer";

import appCss from "../styles.css?url";

/** Where the site will live. Absolute URLs are required in og: tags and in
 *  a canonical link -- a relative one is ignored by most crawlers. */
const SITE = "https://medovev.com";

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
    scripts: [
      // The same tracker the other two sites use, carried over as it is. It
      // listens on the document for clicks and scroll depth, so it needs no
      // hook into the components and nothing to maintain alongside them.
      // It records what KIND of thing happened and on which page, never who.
      { defer: true, src: "/assets/track.js" },
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
      {/* Supplies window.va, which the tracker above reports through. */}
      <Analytics />
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
