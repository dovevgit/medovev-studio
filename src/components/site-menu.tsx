import { useEffect, useId, useRef, useState } from "react";

import {
  ELSEWHERE,
  PAGES,
  SERVICE_LINKS,
  WHATSAPP_URL,
  serviceIcon,
  type MenuLink,
} from "@/site-content";

/**
 * The site's menu: a button that is always reachable, and a panel over
 * everything else.
 *
 * The button has to sit on two very different backgrounds -- the film's
 * near-black at the top of the page and the light wood below it -- so rather
 * than swapping its colours on scroll it carries its own dark disc. One
 * appearance, legible on both, and nothing to keep in sync with the scroll
 * position.
 */
export function SiteMenu() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      // Keep Tab inside the panel while it is open: behind it the whole page
      // is still in the tab order, and tabbing into a film you cannot see is
      // how a keyboard user gets lost.
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
      );
      if (!focusable || focusable.length === 0) {
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    // The page behind must not scroll under the panel.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus into the panel so the first thing Tab reaches is a menu link.
    const firstLink = panelRef.current?.querySelector<HTMLElement>("a[href]");
    firstLink?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      {/* Both lockups ship, and the viewport picks one. A desktop corner has
          the height for the words under the monogram; a phone's does not --
          there they would come out a few pixels tall, so the phone gets the
          mark on its own. The link carries the name for a screen reader, so
          neither image needs alt text of its own. */}
      <a aria-label="לדף הבית" className="site-brand" href="/">
        <img alt="" className="site-brand__full" height={446} src="/assets/logo-full.webp" width={760} />
        <img alt="" className="site-brand__mark" height={287} src="/assets/logo-mark.webp" width={360} />
      </a>

      <button
        aria-controls={panelId}
        aria-expanded={open}
        aria-label={open ? "סגירת התפריט" : "פתיחת התפריט"}
        className="site-menu__button"
        onClick={() => setOpen((value) => !value)}
        ref={buttonRef}
        type="button"
      >
        <span className="site-menu__bars" data-open={open || undefined}>
          <span />
          <span />
          <span />
        </span>
      </button>

      <div
        aria-label="תפריט האתר"
        aria-modal={open || undefined}
        className="site-menu__panel"
        data-open={open || undefined}
        id={panelId}
        ref={panelRef}
        role="dialog"
      >
        <nav className="site-menu__inner">
          {/* The scroll stands at the head of the panel, whole and at its own
              proportions, and the parchment it is written on carries on down
              behind the links. Stretching the whole picture to whatever
              height the list happens to need would have pulled the two kings
              out of shape; letting the parchment alone carry the stretch
              costs nothing, because parchment is texture and texture does
              not have a shape to lose. */}
          <div className="site-menu__crown">
            <img
              alt="DG Workflow System Studio"
              className="site-menu__logo"
              height={446}
              src="/assets/logo-full.webp"
              width={760}
            />
          </div>

          <div className="site-menu__sheet">
            <ul className="site-menu__list">
              {PAGES.map((page) => (
                <MenuItem key={page.href} link={page} onNavigate={() => setOpen(false)} />
              ))}
            </ul>

            <p className="site-menu__heading">השירותים</p>
            <ul className="site-menu__list site-menu__list--services">
              {SERVICE_LINKS.map((service) => (
                <MenuItem
                  icon={serviceIcon(service.href.split("/").pop() ?? "")}
                  key={service.href}
                  link={service}
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </ul>

            <ul className="site-menu__list site-menu__list--quiet">
              {ELSEWHERE.map((place) => (
                <MenuItem key={place.href} link={place} onNavigate={() => setOpen(false)} />
              ))}
            </ul>

            <a className="site-menu__cta" href={WHATSAPP_URL} rel="noreferrer" target="_blank">
              שיחת ייעוץ
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}

function MenuItem({
  icon,
  link,
  onNavigate,
}: {
  icon?: string;
  link: MenuLink;
  onNavigate: () => void;
}) {
  // The emblem is decoration beside a link that already says what it is, so
  // it carries no alt text of its own and is not announced twice.
  const art = icon ? <img alt="" className="site-menu__icon" height={48} src={icon} width={48} /> : null;

  if (link.external) {
    return (
      <li>
        <a href={link.href} onClick={onNavigate} rel="noreferrer" target="_blank">
          {art}
          <span>{link.label}</span>
          <span className="site-menu__away"> (נפתח בלשונית חדשה)</span>
        </a>
      </li>
    );
  }

  // Plain anchors rather than the router's <Link>: these are content pages,
  // a full load costs nothing on them, and it keeps the menu free of the
  // typed-route coupling that would break the build every time a page is
  // added or renamed.
  return (
    <li>
      <a href={link.href} onClick={onNavigate}>
        {art}
        <span>{link.label}</span>
      </a>
    </li>
  );
}
