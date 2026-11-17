import { useCallback, useEffect, useRef, useState } from "react";

import { SERVICES, WHATSAPP_HELLO } from "@/site-content";

/**
 * The studio's memory game.
 *
 * Eighteen cards, nine services. The back is the studio's own card; the face
 * is the same cloth carrying the service's emblem, with its name beneath in
 * live text -- crisp at every size, readable to a screen reader, and
 * changeable without touching a picture.
 *
 * It is a service menu wearing a game: every pair found names a service and
 * offers its page.
 */

/**
 * The name each card wears.
 *
 * Short, because a card is a narrow thing, and the same words the banners
 * above the game use -- a visitor who has just scrolled past "נכסים
 * דיגיטליים" should meet that name here and not a longer formal one. The
 * line under each match comes from SERVICES, so the site keeps one copy of
 * it.
 */
const CARD_NAMES: Record<string, string> = {
  ai: "פתרונות AI מתקדמים",
  digital: "נוכחות דיגיטלית",
  implementer: "מיישם AI",
  photo: "צילום",
  podcast: "פודקאסטים",
  strategy: "אסטרטגיה עסקית",
  video: "הפקות וידאו",
  voice: "קריינות מקצועית",
  web: "נכסים דיגיטליים",
};

const CONFETTI_COLOURS = ["#c9a042", "#e8d49a", "#2f4b80", "#f1e8d6"];

type Card = { key: string; slug: string };

/**
 * The deck in its unshuffled order.
 *
 * The page is prerendered, so the first render has to be the same on the
 * build machine as in the browser -- a shuffle here would hand React a
 * different order than the HTML it is hydrating. The shuffle runs on mount
 * instead, and because all eighteen cards are face down and identical,
 * nobody can see it happen.
 */
function orderedDeck(): Card[] {
  return SERVICES.flatMap((service) => [
    { key: `${service.slug}-a`, slug: service.slug },
    { key: `${service.slug}-b`, slug: service.slug },
  ]);
}

function shuffled(deck: Card[]): Card[] {
  const next = deck.slice();
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function MemoryGame() {
  const [deck, setDeck] = useState<Card[]>(orderedDeck);
  const [faceUp, setFaceUp] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [first, setFirst] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [found, setFound] = useState<string | null>(null);
  const [won, setWon] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const pairs = matched.length / 2;

  const start = useCallback(() => {
    for (const timer of timersRef.current) {
      clearTimeout(timer);
    }
    timersRef.current = [];
    setDeck((current) => shuffled(current));
    setFaceUp([]);
    setMatched([]);
    setFirst(null);
    setLocked(false);
    setMoves(0);
    setFound(null);
    setWon(false);
  }, []);

  // Shuffle once the component is in the browser; see orderedDeck above.
  useEffect(() => {
    setDeck((current) => shuffled(current));
  }, []);

  useEffect(
    () => () => {
      for (const timer of timersRef.current) {
        clearTimeout(timer);
      }
      cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const confetti = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const bits = Array.from({ length: 140 }, () => ({
      angle: Math.random() * Math.PI,
      colour: CONFETTI_COLOURS[Math.floor(Math.random() * CONFETTI_COLOURS.length)],
      h: 8 + Math.random() * 8,
      spin: -0.1 + Math.random() * 0.2,
      vx: -0.9 + Math.random() * 1.8,
      vy: 1.8 + Math.random() * 2.6,
      w: 5 + Math.random() * 6,
      x: Math.random() * canvas.width,
      y: -Math.random() * canvas.height * 0.5,
    }));

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = 0;

      for (const bit of bits) {
        bit.x += bit.vx;
        bit.y += bit.vy;
        bit.angle += bit.spin;
        if (bit.y < canvas.height + 40) {
          alive += 1;
        }
        ctx.save();
        ctx.translate(bit.x, bit.y);
        ctx.rotate(bit.angle);
        ctx.fillStyle = bit.colour;
        ctx.fillRect(-bit.w / 2, -bit.h / 2, bit.w, bit.h);
        ctx.restore();
      }

      // It stops itself rather than looping for ever behind the dialog.
      if (alive) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(tick);
  }, []);

  const pick = (card: Card) => {
    if (locked || faceUp.includes(card.key) || matched.includes(card.key)) {
      return;
    }

    if (!first) {
      setFaceUp([card.key]);
      setFirst(card.key);
      return;
    }

    const partner = deck.find((entry) => entry.key === first);
    setFaceUp([first, card.key]);
    setFirst(null);
    setMoves((value) => value + 1);

    if (partner && partner.slug === card.slug) {
      const nextMatched = [...matched, first, card.key];
      setMatched(nextMatched);
      setFaceUp([]);
      setFound(card.slug);
      if (nextMatched.length === deck.length) {
        timersRef.current.push(
          setTimeout(() => {
            setWon(true);
            confetti();
          }, 850),
        );
      }
      return;
    }

    // Both stay up long enough to be read, and the board is locked meanwhile:
    // without the lock a fast tapper turns a third card and leaves two faces
    // up with nothing holding them.
    setLocked(true);
    timersRef.current.push(
      setTimeout(() => {
        setFaceUp([]);
        setLocked(false);
      }, 950),
    );
  };

  const service = found
    ? SERVICES.find((entry) => entry.slug === found)
    : undefined;

  return (
    <section className="memory" id="memory-game">
      <header className="memory__head">
        <p className="memory__eyebrow">משחק קצר</p>
        <h2 className="memory__title">משחק הזיכרון של הסטודיו</h2>
        <p className="memory__lede">
          הפכו קלפים, מצאו זוגות וגלו כל מה שהסטודיו יכול לעשות עבורכם
        </p>
      </header>

      <div className="memory__bar">
        <span>
          מהלכים: <b>{moves}</b>
        </span>
        <span>
          זוגות: <b>{pairs}</b>/{SERVICES.length}
        </span>
        <button className="memory__reset" onClick={start} type="button">
          משחק חדש
        </button>
      </div>

      <div className="memory__grid">
        {deck.map((card, index) => {
          const open = faceUp.includes(card.key) || matched.includes(card.key);
          const name = CARD_NAMES[card.slug];
          return (
            <button
              aria-label={open ? name : `קלף ${index + 1}, הפוך`}
              className="memory__card"
              data-done={matched.includes(card.key) || undefined}
              data-open={open || undefined}
              key={card.key}
              onClick={() => pick(card)}
              type="button"
            >
              <span className="memory__inner">
                <span className="memory__face memory__face--back" />
                <span className="memory__face memory__face--front">
                  <img
                    alt=""
                    height={440}
                    loading="lazy"
                    src={`/assets/memory/logo-${card.slug}.webp`}
                    width={440}
                  />
                  <span className="memory__name">{name}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="memory__toast">
        {service ? (
          <>
            <b>{CARD_NAMES[service.slug]}</b>
            {service.blurb}
            {" · "}
            <a href={`/services/${service.slug}`}>לעמוד השירות</a>
          </>
        ) : (
          "לחצו על קלף כדי להתחיל"
        )}
      </p>

      <div
        aria-label="סיום המשחק"
        aria-modal={won || undefined}
        className="memory__win"
        data-open={won || undefined}
        role="dialog"
      >
        <div className="memory__win-box">
          <h3>כל הכבוד</h3>
          <p>עכשיו אתם יודעים כל מה שאנחנו יכולים לעשות עבורכם</p>
          <div className="memory__win-row">
            <a
              className="scroll-card__cta"
              href={WHATSAPP_HELLO}
              rel="noreferrer"
              target="_blank"
            >
              דברו איתנו
            </a>
            <button
              className="scroll-card__cta scroll-card__cta--quiet"
              onClick={start}
              type="button"
            >
              משחק חדש
            </button>
          </div>
        </div>
      </div>

      <canvas aria-hidden="true" className="memory__confetti" ref={canvasRef} />
    </section>
  );
}
