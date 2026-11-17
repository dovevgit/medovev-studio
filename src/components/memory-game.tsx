import { useCallback, useEffect, useReducer, useRef } from "react";

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
 * line under each match comes from SERVICES, so the site keeps one copy.
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

/** How long a wrong pair stays up to be read, and the pause before the win. */
const HIDE_AFTER = 950;
const WIN_AFTER = 850;

type Card = { key: string; slug: string };

type State = {
  deck: Card[];
  /** The service named by the last pair found, for the line under the board. */
  found: string | null;
  /** True while a wrong pair is on show and the board ignores clicks. */
  locked: boolean;
  matched: string[];
  moves: number;
  /** Cards turned up that are not yet matched: none, one, or a wrong pair. */
  faceUp: string[];
  won: boolean;
};

type Action =
  | { key: string; type: "pick" }
  | { type: "hide" }
  | { type: "shuffle" }
  | { type: "start" }
  | { type: "win" };

/**
 * The deck in its unshuffled order.
 *
 * The page is prerendered, so the first render has to match between the
 * build machine and the browser -- a shuffle here would hand React a
 * different order than the HTML it is hydrating. The shuffle runs on mount
 * instead, and with all eighteen cards face down and identical, nobody can
 * see it happen.
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

const FRESH: State = {
  deck: orderedDeck(),
  faceUp: [],
  found: null,
  locked: false,
  matched: [],
  moves: 0,
  won: false,
};

/**
 * Every turn is decided here rather than in the click handler.
 *
 * A handler would have to read the previous card out of state it captured
 * when it rendered, and two clicks inside one task see the same stale value
 * -- the second card then reads as a first, and nothing ever pairs. A
 * reducer is always handed the newest state, however the clicks arrive.
 */
function reduce(state: State, action: Action): State {
  switch (action.type) {
    case "hide":
      return { ...state, faceUp: [], locked: false };

    case "pick": {
      if (
        state.locked ||
        state.faceUp.includes(action.key) ||
        state.matched.includes(action.key)
      ) {
        return state;
      }

      if (state.faceUp.length === 0) {
        return { ...state, faceUp: [action.key] };
      }

      const [firstKey] = state.faceUp;
      const first = state.deck.find((card) => card.key === firstKey);
      const second = state.deck.find((card) => card.key === action.key);

      if (first && second && first.slug === second.slug) {
        return {
          ...state,
          faceUp: [],
          found: second.slug,
          matched: [...state.matched, firstKey, action.key],
          moves: state.moves + 1,
        };
      }

      return {
        ...state,
        faceUp: [firstKey, action.key],
        locked: true,
        moves: state.moves + 1,
      };
    }

    case "shuffle":
      return { ...state, deck: shuffled(state.deck) };

    case "start":
      return { ...FRESH, deck: shuffled(state.deck) };

    case "win":
      return { ...state, won: true };

    default:
      return state;
  }
}

export function MemoryGame() {
  const [state, dispatch] = useReducer(reduce, FRESH);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  const pairs = state.matched.length / 2;
  const complete = state.matched.length === state.deck.length;

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
      colour:
        CONFETTI_COLOURS[Math.floor(Math.random() * CONFETTI_COLOURS.length)],
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

  // Shuffle once the component is in the browser; see orderedDeck above.
  useEffect(() => {
    dispatch({ type: "shuffle" });
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  useEffect(() => {
    if (!state.locked) {
      return;
    }
    const timer = setTimeout(() => dispatch({ type: "hide" }), HIDE_AFTER);
    return () => clearTimeout(timer);
  }, [state.locked]);

  useEffect(() => {
    if (!complete || state.won) {
      return;
    }
    const timer = setTimeout(() => {
      dispatch({ type: "win" });
      confetti();
    }, WIN_AFTER);
    return () => clearTimeout(timer);
  }, [complete, confetti, state.won]);

  const service = state.found
    ? SERVICES.find((entry) => entry.slug === state.found)
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
          מהלכים: <b>{state.moves}</b>
        </span>
        <span>
          זוגות: <b>{pairs}</b>/{SERVICES.length}
        </span>
        <button
          className="memory__reset"
          onClick={() => dispatch({ type: "start" })}
          type="button"
        >
          משחק חדש
        </button>
      </div>

      <div className="memory__grid">
        {state.deck.map((card, index) => {
          const done = state.matched.includes(card.key);
          const open = done || state.faceUp.includes(card.key);
          const name = CARD_NAMES[card.slug];
          return (
            <button
              aria-label={open ? name : `קלף ${index + 1}, הפוך`}
              className="memory__card"
              data-done={done || undefined}
              data-open={open || undefined}
              key={card.key}
              onClick={() => dispatch({ key: card.key, type: "pick" })}
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
        aria-modal={state.won || undefined}
        className="memory__win"
        data-open={state.won || undefined}
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
              onClick={() => dispatch({ type: "start" })}
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
