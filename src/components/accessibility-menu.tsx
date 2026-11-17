import { useEffect, useRef, useState } from "react";

/**
 * The accessibility menu.
 *
 * A button in the corner of every page and a panel of settings behind it:
 * text size, four colour modes, and eight switches. Every setting is a class
 * on <html>, which is what makes the whole thing cheap -- the work is a
 * stylesheet the browser already knows how to apply, not JavaScript walking
 * the page.
 *
 * Text size is the clearest case. The old site wrote an inline font-size
 * onto every element on the page and kept the originals in attributes so it
 * could undo them. This site is built in `rem` throughout, so one number on
 * the root element moves all of it, and there is nothing to remember and
 * nothing to put back.
 *
 * Choices persist in localStorage: someone who needs high contrast needs it
 * on the next page too, and should not have to say so twice. Storage can be
 * blocked or full, so every read and write is guarded -- a browser that
 * refuses to remember still gets a working menu.
 */

const KEY = "dg-a11y-v1";
const STEPS = [1, 1.1, 1.2, 1.35, 1.5];

/** The four colour modes, which replace one another. */
const MODES = [
  { id: "high", label: "ניגודיות גבוהה" },
  { id: "light", label: "רקע בהיר" },
  { id: "invert", label: "ניגודיות הפוכה" },
  { id: "gray", label: "גווני אפור" },
] as const;

/** The eight switches, which stack. */
const TOGGLES = [
  { id: "underline", label: "הדגשת קישורים" },
  { id: "font", label: "גופן קריא" },
  { id: "spacing", label: "ריווח טקסט" },
  { id: "headings", label: "הדגשת כותרות" },
  { id: "focus", label: "הדגשת מיקוד" },
  { id: "anim", label: "עצירת אנימציות" },
  { id: "cursor", label: "סמן גדול" },
  { id: "guide", label: "סרגל קריאה" },
] as const;

type Mode = (typeof MODES)[number]["id"];
type Toggle = (typeof TOGGLES)[number]["id"];
type State = { font: number; mode: Mode | ""; toggles: Partial<Record<Toggle, boolean>> };

const EMPTY: State = { font: 0, mode: "", toggles: {} };

function read(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      return EMPTY;
    }
    const saved = JSON.parse(raw) as Partial<State>;
    return {
      font: Math.min(Math.max(Number(saved.font) || 0, 0), STEPS.length - 1),
      mode: MODES.some((m) => m.id === saved.mode) ? (saved.mode as Mode) : "",
      toggles: saved.toggles && typeof saved.toggles === "object" ? saved.toggles : {},
    };
  } catch {
    return EMPTY;
  }
}

export function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  // Starts empty on both the server and the first client render, so the
  // markup matches and hydration does not complain; the saved settings are
  // read in the effect below, one tick later.
  const [state, setState] = useState<State>(EMPTY);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setState(read()), []);

  // --- put the settings on <html> ---------------------------------------
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--a11y-scale", String(STEPS[state.font]));
    root.dataset.a11yFont = state.font > 0 ? "on" : "";
    for (const mode of MODES) {
      root.classList.toggle(`a11y-${mode.id}`, state.mode === mode.id);
    }
    for (const toggle of TOGGLES) {
      root.classList.toggle(`a11y-${toggle.id}`, Boolean(state.toggles[toggle.id]));
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // Storage can be blocked or full. The settings still apply to this
      // page; they just will not survive the next one.
    }
  }, [state]);

  // --- the reading guide -------------------------------------------------
  useEffect(() => {
    if (!state.toggles.guide) {
      return;
    }
    const bar = document.createElement("div");
    bar.className = "a11y-guide";
    bar.setAttribute("aria-hidden", "true");
    document.body.append(bar);
    const move = (event: MouseEvent | TouchEvent) => {
      const y = "touches" in event ? event.touches[0]?.clientY : event.clientY;
      if (y !== undefined) {
        bar.style.top = `${y - 23}px`;
      }
    };
    addEventListener("mousemove", move, { passive: true });
    addEventListener("touchmove", move, { passive: true });
    return () => {
      removeEventListener("mousemove", move);
      removeEventListener("touchmove", move);
      bar.remove();
    };
  }, [state.toggles.guide]);

  // --- the panel behaves like a dialog ------------------------------------
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    addEventListener("keydown", onKey);
    addEventListener("mousedown", onDown);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener("mousedown", onDown);
    };
  }, [open]);

  const step = (by: number) =>
    setState((s) => ({ ...s, font: Math.min(Math.max(s.font + by, 0), STEPS.length - 1) }));

  const reset = () => setState(EMPTY);

  return (
    <>
      {/* The first thing in the tab order on every page, and visible only
          once it is focused. */}
      <a className="a11y-ui a11y-skip" href="#main">
        דילוג לתוכן הראשי
      </a>

      <button
        aria-expanded={open}
        aria-label="פתיחת תפריט נגישות"
        className="a11y-ui a11y-btn"
        onClick={() => setOpen((v) => !v)}
        ref={buttonRef}
        type="button"
      >
        <svg aria-hidden="true" height="24" viewBox="0 0 24 24" width="24">
          <circle cx="12" cy="4" fill="currentColor" r="2" />
          <path
            d="M4.5 7.5c2.4.9 5 1.3 7.5 1.3s5.1-.4 7.5-1.3M12 8.8V14m0 0-2.5 7M12 14l2.5 7"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
      </button>

      {open ? (
        <div
          aria-label="תפריט נגישות"
          className="a11y-ui a11y-panel"
          ref={panelRef}
          role="dialog"
        >
          <div className="a11y-panel__head">
            <h2 className="a11y-panel__title">תפריט נגישות</h2>
            <button
              aria-label="סגירה"
              className="a11y-panel__close"
              onClick={() => {
                setOpen(false);
                buttonRef.current?.focus();
              }}
              type="button"
            >
              ✕
            </button>
          </div>

          <div className="a11y-size">
            <button
              aria-label="הקטנת טקסט"
              className="a11y-size__btn"
              disabled={state.font === 0}
              onClick={() => step(-1)}
              type="button"
            >
              א−
            </button>
            <span className="a11y-size__read">
              {Math.round(STEPS[state.font] * 100)}%
            </span>
            <button
              aria-label="הגדלת טקסט"
              className="a11y-size__btn"
              disabled={state.font === STEPS.length - 1}
              onClick={() => step(1)}
              type="button"
            >
              א+
            </button>
          </div>

          <div className="a11y-grid">
            {MODES.map((mode) => (
              <button
                aria-pressed={state.mode === mode.id}
                className="a11y-opt"
                key={mode.id}
                onClick={() =>
                  setState((s) => ({ ...s, mode: s.mode === mode.id ? "" : mode.id }))
                }
                type="button"
              >
                {mode.label}
              </button>
            ))}
          </div>

          <div className="a11y-grid">
            {TOGGLES.map((toggle) => (
              <button
                aria-pressed={Boolean(state.toggles[toggle.id])}
                className="a11y-opt"
                key={toggle.id}
                onClick={() =>
                  setState((s) => ({
                    ...s,
                    toggles: { ...s.toggles, [toggle.id]: !s.toggles[toggle.id] },
                  }))
                }
                type="button"
              >
                {toggle.label}
              </button>
            ))}
          </div>

          <div className="a11y-panel__foot">
            <button className="a11y-reset" onClick={reset} type="button">
              איפוס הגדרות
            </button>
            <a className="a11y-statement" href="/accessibility">
              הצהרת נגישות
            </a>
          </div>
        </div>
      ) : null}
    </>
  );
}
