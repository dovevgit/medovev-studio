import { useEffect, useRef, useState } from "react";

import { GALLERY } from "@/page-copy";

/**
 * The photographs, in five chapters, with a chip row to narrow to one.
 *
 * Two sizes of every picture: the grid shows the small one, and the full file
 * is fetched only when someone opens it. Thirty full-size photographs on load
 * would be the whole page's weight spent on pictures nobody has asked to look
 * at closely yet.
 *
 * Each picture carries the alt text the studio wrote for it. They are the
 * work being sold, so a visitor using a screen reader is told what is in them
 * rather than being handed thirty unlabelled buttons.
 */

export function PhotoGallery() {
  const [chip, setChip] = useState("all");
  const [open, setOpen] = useState<null | { alt: string; full: string }>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // The viewer behaves like a dialog: Escape closes it, and while it is up the
  // page behind does not scroll.
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(null);
      }
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const chapters = GALLERY.chapters.filter((c) => chip === "all" || c.cat === chip);

  return (
    <section className="page__gallery">
      <div className="g-nav" role="tablist">
        {GALLERY.chips.map((c) => (
          <button
            aria-selected={chip === c.id}
            className="g-chip"
            key={c.id}
            onClick={() => setChip(c.id)}
            role="tab"
            type="button"
          >
            {c.label}
          </button>
        ))}
      </div>

      {chapters.map((chapter) => (
        <section className="chap" key={chapter.cat}>
          <header className="chap__head">
            <span aria-hidden="true" className="chap__num">
              {chapter.num}
            </span>
            <h2 className="chap__title">{chapter.title}</h2>
            <span className="chap__count">{chapter.count}</span>
          </header>
          <div className="chap__grid">
            {chapter.items.map((item) => (
              <button
                aria-label={`הגדלת תמונה: ${item.alt}`}
                className="g-item"
                key={item.src}
                onClick={() => setOpen({ alt: item.alt, full: item.full })}
                type="button"
              >
                <img
                  alt={item.alt}
                  decoding="async"
                  height={item.h}
                  loading="lazy"
                  src={item.src}
                  width={item.w}
                />
              </button>
            ))}
          </div>
        </section>
      ))}

      {open ? (
        <div
          className="g-view"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(null);
            }
          }}
          role="dialog"
        >
          <button
            aria-label="סגירה"
            className="g-view__close"
            onClick={() => setOpen(null)}
            ref={closeRef}
            type="button"
          >
            ✕
          </button>
          <img alt={open.alt} className="g-view__img" src={open.full} />
          <p className="g-view__alt">{open.alt}</p>
        </div>
      ) : null}
    </section>
  );
}
