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

        <ul className="services">
          {SERVICES.map((service) => (
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
