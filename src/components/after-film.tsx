import { ContactBanner } from "@/components/contact-banner";
import { FlagCard } from "@/components/flag-card";
import { MemoryGame } from "@/components/memory-game";
import { ScrollCard } from "@/components/scroll-card";
import { WHATSAPP_CONSULT, WHATSAPP_HELLO } from "@/site-content";

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
 * Below that band the nine services each get a banner of their own: the
 * studio's line on the cloth, and a way into its page.
 */
export function AfterFilm() {
  return (
    <section className="after-film">
      <div aria-hidden="true" className="after-film__dawn" />

      <div className="after-film__body">
        <header className="services__head" id="services">
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

        <FlagCard
        art="/assets/flag-video.webp"
        artHeight={469}
        artWidth={1400}
        cta="הפקות וידאו"
        /* The bishop stands on the right from 85%, the pole closes the left
           at 7%, and the gold corners reach in at each end: 20%-72%. */
        field={{ bottom: 27, left: 20, right: 28, top: 16 }}
        href="/services/video"
        line="מהקונספט ועד תוצר וידאו מושלם"
        title="הפקות וידאו"
        />

        <FlagCard
        art="/assets/flag-photo.webp"
        artHeight={469}
        artWidth={1400}
        cta="צילום"
        /* The camera stands on the LEFT and is the widest piece yet, so the
           open field is the right of the cloth: 26%-90% across, 16%-73%
           down. */
        field={{ bottom: 27, left: 27, right: 10, top: 16 }}
        href="/services/photo"
        line="נכסים, מוצרים ותדמית"
        title="צילום"
        />

        <FlagCard
        art="/assets/flag-podcast.webp"
        artHeight={469}
        artWidth={1400}
        cta="פודקאסטים"
        /* A microphone at each end, so the field is the middle of the
           cloth: 25%-78% across, 16%-73% down. */
        field={{ bottom: 27, left: 25, right: 22, top: 16 }}
        href="/services/podcast"
        line="אפיון, הפקה וחיתוכים לסרטונים קצרים"
        title="פודקאסטים"
        />

        <FlagCard
        art="/assets/flag-voice.webp"
        artHeight={469}
        artWidth={1400}
        cta="קריינות מקצועית"
        /* The microphone stands on the right from 79%, and the gold
           corners reach in at each end: the field is 20%-68%. */
        field={{ bottom: 27, left: 20, right: 32, top: 16 }}
        href="/services/voice"
        line="הקריין המושמע ביותר בישראל"
        title="קריינות מקצועית"
        />

        {/* Why us, about, and the ask -- all three on parchment.
         *
         * The banners above are the catalogue; this is the argument, and it
         * wanted a different material to say so. Three small scrolls side by
         * side for the reasons, then two wide ones, which share the one piece
         * of art that has a gold rule around its field: the eye reads the
         * repeat as "these two belong together". Every word here is the old
         * site's, carried over unchanged. */}
        <section className="why">
        <header className="why__head">
          <p className="why__eyebrow">למה לבחור בנו</p>
          <h2 className="why__title">
            שילוב מנצח של אסטרטגיה, יצירתיות וטכנולוגיה
          </h2>
        </header>

        <div className="why__row">
          <ScrollCard
            art="/assets/scroll-torn-even.webp"
            artHeight={609}
            artWidth={1200}
            field={{ bottom: 29, left: 17, right: 17, top: 30 }}
            line="תכנון מדויק, חשיבה רחבה והפיכת פעולות שיווקיות לצמיחה אמיתית."
            title="אסטרטגיה עסקית"
          />
          <ScrollCard
            art="/assets/scroll-torn-wide.webp"
            artHeight={614}
            artWidth={1200}
            field={{ bottom: 27, left: 19, right: 20, top: 30 }}
            line="קריאייטיב ותוכן ברמה גבוהה שמחברים את המותג שלכם לקהל הנכון."
            title="יצירתיות והפקה"
          />
          <ScrollCard
            art="/assets/scroll-curled.webp"
            artHeight={616}
            artWidth={1200}
            field={{ bottom: 30, left: 22, right: 18, top: 31 }}
            line="שילוב של כלי AI, אוטומציה ומערכות חכמות שמייצרים תוצאות."
            title="טכנולוגיה מתקדמת"
          />
        </div>

        <ScrollCard
          actions={
            <a className="scroll-card__cta" href="/about">
              הכירו אותי
            </a>
          }
          art="/assets/scroll-framed.webp"
          artHeight={589}
          artWidth={1200}
          field={{ bottom: 28, left: 17, right: 17, top: 26 }}
          line="מעל 20 שנה בעולם הדיגיטל, המיתוג והשיווק, לצד ההפקה והצד הטכני. הכירו את דובב גרינברג."
          title="מי עומד מאחורי הסטודיו"
          wide
        />

        <ScrollCard
          actions={
            <>
              <a
                className="scroll-card__cta"
                href={WHATSAPP_HELLO}
                rel="noreferrer"
                target="_blank"
              >
                דברו איתנו
              </a>
              <a
                className="scroll-card__cta scroll-card__cta--quiet"
                href={WHATSAPP_CONSULT}
                rel="noreferrer"
                target="_blank"
              >
                קביעת שיחת ייעוץ
              </a>
            </>
          }
          art="/assets/scroll-framed.webp"
          artHeight={589}
          artWidth={1200}
          field={{ bottom: 28, left: 17, right: 17, top: 26 }}
          line="ייעוץ, תכנון ויצירה, פתרון מותאם אישית לעסק שלכם."
          title="בואו נבנה יחד את המהלך העסקי הבא שלכם"
          wide
        />
        </section>

        <MemoryGame />

        <ContactBanner />
      </div>
    </section>
  );
}
