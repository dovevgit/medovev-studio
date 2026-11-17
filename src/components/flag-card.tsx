import type { CSSProperties } from "react";

/**
 * A service presented as one of the film's own banners.
 *
 * The artwork is a single cut-out: the hanging cloth, its gold frame and
 * fringe, and one of the carved pieces breaking across its edge. It carries
 * no lettering of its own.
 *
 * The words are live HTML laid over the cloth, not drawn into the picture.
 * That is the lesson the film taught twice over: live text stays sharp at
 * every size, costs nothing to reword, and is there for a crawler to read.
 */
export type ClearField = {
  /** From the image's LEFT edge to the field's left edge, in %. */
  left: number;
  /** From the image's RIGHT edge to the field's right edge, in %. */
  right: number;
  top: number;
  /** From the image's BOTTOM edge to the field's bottom edge, in %. */
  bottom: number;
};

/**
 * `field` is the run of clear velvet in ONE artwork -- the part no gold
 * ornament and no carved piece overlaps. It differs per card, because the
 * piece stands on a different side each time.
 *
 * Measure it, never judge it: read a single column down the clear side for
 * the top and bottom, and a profile across the cloth for the sides. Asking
 * which rows of the whole picture are mostly velvet reports the bottom edge
 * far too early, because the piece covers part of every row it stands in --
 * that mistake put the first card's bottom at 73% when it is really 81%.
 */
export function FlagCard({
  title,
  line,
  cta,
  href,
  art,
  artWidth,
  artHeight,
  field,
}: {
  title: string;
  line: string;
  cta: string;
  href: string;
  art: string;
  artWidth: number;
  artHeight: number;
  field: ClearField;
}) {
  // The cloths are not equally open: the king leaves 61% of the first card
  // clear, the knight only 45% of the second. Type sized against the CARD
  // therefore fits one and breaks out of the other. On a phone, where there
  // is no slack at all, it is sized against the FIELD instead -- this scale
  // is that field measured against the first card's, so the roomiest cloth
  // is the reference and the tighter ones step down in proportion.
  const scale = (100 - field.left - field.right) / 61;

  const placement = {
    "--field-bottom": `${field.bottom}%`,
    "--field-left": `${field.left}%`,
    "--field-right": `${field.right}%`,
    "--field-top": `${field.top}%`,
    "--type-scale": scale.toFixed(3),
  } as CSSProperties;

  return (
    <article className="flag-card">
      {/* The stage is exactly the picture's box. Everything placed as a
          percentage of the artwork is placed against THIS, not against the
          card -- on a phone the card is taller than the picture, because the
          button steps below it, and measuring against the card put the words
          a fifth of the way down past where they belong. */}
      <div className="flag-card__stage">
        <img
          alt=""
          className="flag-card__art"
          height={artHeight}
          src={art}
          width={artWidth}
        />
        <div className="flag-card__text" style={placement}>
          <h3 className="flag-card__title">{title}</h3>
          <p className="flag-card__line">{line}</p>
        </div>
        <a className="flag-card__cta" href={href} style={placement}>
          {cta}
        </a>
      </div>
    </article>
  );
}
