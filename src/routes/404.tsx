import { createFileRoute } from "@tanstack/react-router";

/**
 * A page that exists only so the build produces one.
 *
 * The site is prerendered to static files, so a URL that matches no route
 * never reaches the router -- the host answers before the application does.
 * Vercel serves /404.html for those, and a build step copies this page there,
 * which is how a visitor who mistypes a URL gets the site's own Hebrew page
 * and its menu instead of the host's English error.
 */
export const Route = createFileRoute("/404")({
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <main className="stub" id="main">
      <div className="stub__inner">
        <p className="stub__eyebrow">404</p>
        <h1 className="stub__title">העמוד לא נמצא</h1>
        <p className="stub__blurb">ייתכן שהקישור ישן, או שהכתובת נכתבה אחרת.</p>
        <div className="stub__actions">
          <a className="stub__cta" href="/">
            חזרה לדף הבית
          </a>
        </div>
      </div>
    </main>
  );
}
