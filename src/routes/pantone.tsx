import { createFileRoute } from "@tanstack/react-router";

import { PANTONE } from "@/page-copy";

/**
 * The phone-greeting offer: a landing page, not a page of the site.
 *
 * It keeps the old site's shape, including what it leaves out. There is no
 * site menu on it and no run of other services, because it has one job and
 * every other link on the screen is a way to not do that job. The only way
 * off the page, apart from the offer itself, is the line back to the studio.
 */
export const Route = createFileRoute("/pantone")({
  component: PantonePage,
  head: () => ({
    meta: [
      { title: "פתיח עסקי לטלפון (פאנטון) במבצע | דובב גרינברג" },
      {
        content:
          "פתיח עסקי מקצועי לטלפון: הקלטה באולפן, עריכת סאונד וייצוא לפורמטים המתאימים.",
        name: "description",
      },
    ],
  }),
});

function PantonePage() {
  return (
    <main className="pan" id="main">
      <header className="pan__top">
        <span className="pan__who">דובב גרינברג · קריינות מקצועית</span>
        <a className="pan__away" href="/">
          מעבר לאתר ←
        </a>
      </header>

      <figure className="pan__hero">
        <img
          alt={PANTONE.heroAlt}
          // Not lazy: it is the first thing on a landing page, and a
          // landing page that opens on a grey box has already lost.
          fetchPriority="high"
          height={1000}
          src="/assets/pantone/hero.webp"
          width={1000}
        />
      </figure>

      <h1 className="pan__title">{PANTONE.title}</h1>
      <p className="pan__lead">{PANTONE.lead}</p>

      {PANTONE.cards.map((card) => (
        <section className="pan__card" key={card.heading}>
          <h2 className="pan__h2">{card.heading}</h2>
          {card.text ? <p className="pan__text">{card.text}</p> : null}
          {card.items.length > 0 ? (
            <ul className="pan__list">
              {card.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}

      <section className="pan__offer">
        <span className="pan__tag">{PANTONE.offer.tag}</span>
        <strong className="pan__price">{PANTONE.offer.price}</strong>
        <span className="pan__small">{PANTONE.offer.small}</span>
      </section>

      <a className="pan__cta" href={PANTONE.cta.href} rel="noreferrer" target="_blank">
        {PANTONE.cta.label}
      </a>
      <p className="pan__note">{PANTONE.note}</p>

      <footer className="pan__foot">
        <a href="/">מעבר לאתר</a>
        <span>
          דובב גרינברג · קריינות, צילום והפקה{" "}
          <a href="https://medovev.co.il" rel="noreferrer" target="_blank">
            medovev.co.il
          </a>
        </span>
      </footer>
    </main>
  );
}
