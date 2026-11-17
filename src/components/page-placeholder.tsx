import { SiteMenu } from "@/components/site-menu";
import { WHATSAPP_URL } from "@/site-content";

/**
 * A real page for a page that is not written yet.
 *
 * The menu and the service cards point at the whole site, but only the home
 * page exists so far. Pointing them at nothing would show the visitor a 404,
 * which reads as a broken site rather than an unfinished one. This stands in
 * instead: the page's own title, so the visitor knows they arrived where they
 * meant to, a way to make contact, and the menu to carry on with.
 *
 * It is meant to be replaced, one page at a time, by the real thing.
 */
export function PagePlaceholder({
  eyebrow,
  title,
  blurb,
}: {
  eyebrow?: string;
  title: string;
  blurb?: string;
}) {
  return (
    <>
      <SiteMenu />
      <main className="stub">
        <div className="stub__inner">
          {eyebrow ? <p className="stub__eyebrow">{eyebrow}</p> : null}
          <h1 className="stub__title">{title}</h1>
          {blurb ? <p className="stub__blurb">{blurb}</p> : null}
          <p className="stub__note">העמוד הזה בבנייה.</p>
          <div className="stub__actions">
            <a className="stub__cta" href={WHATSAPP_URL} rel="noreferrer" target="_blank">
              שיחת ייעוץ
            </a>
            <a className="stub__back" href="/">
              חזרה לדף הבית
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
