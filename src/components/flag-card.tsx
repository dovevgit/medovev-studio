/**
 * A service presented as one of the film's own banners.
 *
 * The artwork is a single cut-out: the hanging cloth, its gold frame and
 * fringe, and the fallen king lying across the lower edge — half on the
 * cloth, half off it. It carries no lettering of its own.
 *
 * The words are live HTML laid over the cloth, not drawn into the picture.
 * That is the lesson the film taught twice over: live text stays sharp at
 * every size, costs nothing to reword, and is there for a crawler to read.
 *
 * Where the text sits was measured, not eyeballed: the clear run of velvet —
 * the part no gold ornament and no king overlaps — starts 33% across the
 * image and ends at 94%, and runs from 12% down to 81%.
 *
 * That bottom figure was 73% at first, and wrong. It came from asking which
 * rows of the whole image are mostly blue, and the lower rows are not,
 * because the king and his red cloth cover the left of them. Reading a
 * single column through the clear right-hand side gives the true edge. Any
 * replacement artwork wants measuring the same way: down a column that
 * nothing overlaps, not across the picture.
 */
export function FlagCard({
  title,
  line,
  cta,
  href,
  art,
  artWidth,
  artHeight,
}: {
  title: string;
  line: string;
  cta: string;
  href: string;
  art: string;
  artWidth: number;
  artHeight: number;
}) {
  return (
    <article className="flag-card">
      <img
        alt=""
        className="flag-card__art"
        height={artHeight}
        src={art}
        width={artWidth}
      />
      <div className="flag-card__text">
        <h3 className="flag-card__title">{title}</h3>
        <p className="flag-card__line">{line}</p>
      </div>
      {/* Outside the text box on purpose: placed against the artwork itself,
          so its position is a share of the CARD and not of a box that is
          already inset inside it. */}
      <a className="flag-card__cta" href={href}>
        {cta}
      </a>
    </article>
  );
}
