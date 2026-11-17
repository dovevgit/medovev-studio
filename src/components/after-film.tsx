import { FlagCard } from "@/components/flag-card";
import { SERVICES, WHATSAPP_URL } from "@/site-content";

/**
 * Where the page comes up out of the film.
 *
 * The journey ends on the knight at dusk, and the page has to leave that
 * world without a seam. So the first thing after the film is not content at
 * all: it is a tall band whose background walks from the film's own
 * near-black, through the dark walnut the pieces are carved from, up to the
 * pale wood the rest of the site lives on. The visitor scrolls out of the
 * night rather than hitting a white page.
 *
 * Everything below that band sits on the pale wood: the nine services, each
 * with the studio's own line and a way into its page.
 */
export function AfterFilm() {
  return (
    <section className="after-film">
      <div aria-hidden="true" className="after-film__dawn" />

      <div className="after-film__body">
        <header className="services__head">
          <p className="services__eyebrow">השירותים שלנו</p>
          <h2 className="services__title">פתרונות מקצה לקצה לצמיחה עסקית</h2>
        </header>

        <FlagCard
          art="/assets/flag-strategy.webp"
          artHeight={469}
          artWidth={1400}
          cta="אסטרטגיה עסקית"
          /* Clear velvet: 33%-94% across, 12%-81% down. The king stands on
             the left, so the open field is the right of the cloth. */
          field={{ bottom: 19, left: 33, right: 6, top: 12 }}
          href="/services/strategy"
          line="תוכנית פעולה אמיתית"
          title="קודם כל אסטרטגיה"
        />

        <FlagCard
          art="/assets/flag-digital.webp"
          artHeight={469}
          artWidth={1400}
          cta="נוכחות דיגיטלית"
          /* The knight stands on the RIGHT here, and his mane reaches in from
             66%, so the open field is the left of the cloth: 17%-62% across,
             18%-75% down. */
          field={{ bottom: 25, left: 17, right: 38, top: 18 }}
          href="/services/digital"
          line="להיות בכל מקום ולדבר באותה שפה"
          title="נוכחות דיגיטלית"
        />

        <FlagCard
          art="/assets/flag-assets.webp"
          artHeight={469}
          artWidth={1400}
          cta="נכסים דיגיטליים"
          /* The queen stands on the right, reaching in from 67%: the field is
             13%-67% across, 12%-80% down. */
          field={{ bottom: 24, left: 15, right: 35, top: 16 }}
          href="/services/web"
          line="אתרים, אפליקציות ורשתות חברתיות"
          title="נכסים דיגיטליים"
        />

        <FlagCard
          art="/assets/flag-ai.webp"
          artHeight={469}
          artWidth={1400}
          cta="פתרונות AI"
          /* The pawn stands on the left and the gold corners close in on the
             right: the field is 22%-78% across, 12%-78% down. */
          field={{ bottom: 26, left: 24, right: 24, top: 16 }}
          href="/services/ai"
          line="צ'אטבוטים, סוכנים ואוטומציות"
          title="פתרונות AI מתקדמים"
        />

        <FlagCard
          art="/assets/flag-implementer.webp"
          artHeight={469}
          artWidth={1400}
          cta="מיישם AI"
          /* The rook stands on the left: the field is 22%-75% across. */
          field={{ bottom: 27, left: 24, right: 27, top: 16 }}
          href="/services/implementer"
          line="הדרכה והטמעת תהליכים בארגון"
          title="מיישם AI"
        />

        {/* The remaining four still wear the first, plain treatment. They
            stay on the page so the site is whole while each one is redesigned
            as its own banner, in turn. */}
        <ul className="services">
          {SERVICES.filter(
            (service) =>
              service.slug !== "strategy" &&
              service.slug !== "digital" &&
              service.slug !== "web" &&
              service.slug !== "ai" &&
              service.slug !== "implementer",
          ).map((service) => (
            <li className="service" key={service.slug}>
              <h3 className="service__title">{service.title}</h3>
              <p className="service__blurb">{service.blurb}</p>
              <a className="service__link" href={`/services/${service.slug}`}>
                לעמוד השירות
              </a>
            </li>
          ))}
        </ul>

        <section className="closing">
          <h2 className="closing__title">בואו נבנה יחד את המהלך העסקי הבא שלכם</h2>
          <a
            className="closing__cta"
            href={WHATSAPP_URL}
            rel="noreferrer"
            target="_blank"
          >
            שיחת ייעוץ
          </a>
        </section>
      </div>
    </section>
  );
}
