import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "../styles.css?url";

const TITLE = "סטודיו לאסטרטגיה עסקית | דובב גרינברג";
const DESCRIPTION =
  "אסטרטגיה עסקית, נוכחות דיגיטלית, אתרים ואפליקציות, פתרונות AI, הפקת וידאו, צילום, פודקאסטים וקריינות — פתרונות מקצה לקצה לצמיחה עסקית.";

export const Route = createRootRoute({
  head: () => ({
    links: [
      { href: appCss, rel: "stylesheet" },
      { href: "/assets/favicon.png", rel: "icon", type: "image/png" },
      { href: "/assets/favicon.png", rel: "apple-touch-icon" },
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
      { content: "summary_large_image", name: "twitter:card" },
      { content: "#0b0a09", name: "theme-color" },
    ],
  }),
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
  return <Outlet />;
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
